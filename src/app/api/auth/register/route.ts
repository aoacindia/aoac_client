import { NextRequest, NextResponse } from 'next/server';
import { userPrisma } from '@/lib/db';
import { Prisma } from '../../../../../prisma/generated/user';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { generateNextUserId } from '@/lib/user-id';

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      phone, 
      token, 
      isBusinessAccount, 
      businessName, 
      gstNumber,
      hasAdditionalTradeName,
      additionalTradeName,
      billingAddress
    } = await req.json();

    if (!name || !email || !phone || !token) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate business fields if business account is selected
    if (isBusinessAccount) {
      if (!businessName || !businessName.trim()) {
        return NextResponse.json(
          { success: false, message: 'Business name is required for business accounts' },
          { status: 400 }
        );
      }
      if (!gstNumber || !gstNumber.trim()) {
        return NextResponse.json(
          { success: false, message: 'GST number is required for business accounts' },
          { status: 400 }
        );
      }
      // Validate GST number format (15 characters)
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        return NextResponse.json(
          { success: false, message: 'Invalid GST number format. Please enter a valid 15-character GST number.' },
          { status: 400 }
        );
      }
      // Validate additional trade name if checked
      if (hasAdditionalTradeName && (!additionalTradeName || !additionalTradeName.trim())) {
        return NextResponse.json(
          { success: false, message: 'Additional trade name is required when selected' },
          { status: 400 }
        );
      }
      // Validate billing address
      if (!billingAddress) {
        return NextResponse.json(
          { success: false, message: 'Billing address is required for business accounts' },
          { status: 400 }
        );
      }
      if (!billingAddress.houseNo || !billingAddress.houseNo.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing address house number is required' },
          { status: 400 }
        );
      }
      if (!billingAddress.line1 || !billingAddress.line1.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing address line 1 is required' },
          { status: 400 }
        );
      }
      if (!billingAddress.city || !billingAddress.city.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing city is required' },
          { status: 400 }
        );
      }
      if (!billingAddress.district || !billingAddress.district.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing district is required' },
          { status: 400 }
        );
      }
      if (!billingAddress.state || !billingAddress.state.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing state is required' },
          { status: 400 }
        );
      }
      if (!billingAddress.pincode || !billingAddress.pincode.trim()) {
        return NextResponse.json(
          { success: false, message: 'Billing pincode is required' },
          { status: 400 }
        );
      }
      const pincodeRegex = /^[0-9]{6}$/;
      if (!pincodeRegex.test(billingAddress.pincode)) {
        return NextResponse.json(
          { success: false, message: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
          { status: 400 }
        );
      }
    }

    // Verify OTP token is valid
    const otpRecord = await userPrisma.otpVerification.findUnique({
      where: {
        token,
      },
    });

    if (!otpRecord || otpRecord.email !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await userPrisma.otpVerification.delete({
        where: {
          token,
        },
      });
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userPrisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email or phone' },
        { status: 409 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format. Please enter 10 digits.' },
        { status: 400 }
      );
    }

    // Generate a temporary password (user will set it later or use OTP for login)
    const tempPassword = randomBytes(16).toString('hex');
    const hashedPassword = await hash(tempPassword, 12);

    // Generate unique user ID based on account type and year
    const isBusiness = isBusinessAccount || false;
    const userId = await generateNextUserId(userPrisma, isBusiness);

    // Create user with billing address if business account
    const user = await userPrisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        isBusinessAccount: isBusinessAccount || false,
        businessName: isBusinessAccount && businessName ? businessName.trim() : null,
        gstNumber: isBusinessAccount && gstNumber ? gstNumber.toUpperCase().trim() : null,
        hasAdditionalTradeName: isBusinessAccount ? (hasAdditionalTradeName || false) : null,
        additionalTradeName: isBusinessAccount && hasAdditionalTradeName && additionalTradeName 
          ? additionalTradeName.trim() 
          : null,
        // Create billing address if business account
        billingAddress: isBusinessAccount && billingAddress ? {
          create: {
            houseNo: billingAddress.houseNo.trim(),
            line1: billingAddress.line1.trim(),
            line2: billingAddress.line2 ? billingAddress.line2.trim() : null,
            city: billingAddress.city.trim(),
            district: billingAddress.district.trim(),
            state: billingAddress.state.trim(),
            stateCode: billingAddress.stateCode || null,
            pincode: billingAddress.pincode.trim(),
            country: 'India',
          },
        } : undefined,
      },
    });

    // Delete OTP record after successful registration
    await userPrisma.otpVerification.delete({
      where: {
        token,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);

    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field =
        Array.isArray(error.meta?.target) && error.meta?.target.length > 0
          ? error.meta?.target[0]
          : 'field';
      return NextResponse.json(
        { success: false, message: `User already exists with this ${field}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

