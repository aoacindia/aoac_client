import { NextRequest, NextResponse } from 'next/server';
import { billingAddresses, dbUser, otpVerifications, users } from '@/lib/db';
import { isUniqueConstraintViolation } from '@/lib/db/unique-violation';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { generateNextUserId } from '@/lib/user-id';
import { eq, or } from 'drizzle-orm';

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
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        return NextResponse.json(
          { success: false, message: 'Invalid GST number format. Please enter a valid 15-character GST number.' },
          { status: 400 }
        );
      }
      if (hasAdditionalTradeName && (!additionalTradeName || !additionalTradeName.trim())) {
        return NextResponse.json(
          { success: false, message: 'Additional trade name is required when selected' },
          { status: 400 }
        );
      }
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

    const [otpRecord] = await dbUser
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.token, token))
      .limit(1);

    if (!otpRecord || otpRecord.email !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await dbUser
        .delete(otpVerifications)
        .where(eq(otpVerifications.token, token));
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const [existingUser] = await dbUser
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, email.toLowerCase()),
          eq(users.phone, phone)
        )
      )
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email or phone' },
        { status: 409 }
      );
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format. Please enter 10 digits.' },
        { status: 400 }
      );
    }

    const tempPassword = randomBytes(16).toString('hex');
    const hashedPassword = await hash(tempPassword, 12);

    const isBusiness = isBusinessAccount || false;
    const userId = await generateNextUserId(isBusiness);

    const user = await dbUser.transaction(async (tx) => {
      const [u] = await tx
        .insert(users)
        .values({
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
          isBusinessAccount: isBusinessAccount || false,
          businessName: isBusinessAccount && businessName ? businessName.trim() : null,
          gstNumber: isBusinessAccount && gstNumber ? gstNumber.toUpperCase().trim() : null,
          hasAdditionalTradeName: isBusinessAccount ? (hasAdditionalTradeName || false) : null,
          additionalTradeName:
            isBusinessAccount && hasAdditionalTradeName && additionalTradeName
              ? additionalTradeName.trim()
              : null,
        })
        .returning();

      if (!u) {
        throw new Error('Failed to create user');
      }

      if (isBusinessAccount && billingAddress) {
        await tx.insert(billingAddresses).values({
          userId: u.id,
          houseNo: billingAddress.houseNo.trim(),
          line1: billingAddress.line1.trim(),
          line2: billingAddress.line2 ? billingAddress.line2.trim() : null,
          city: billingAddress.city.trim(),
          district: billingAddress.district.trim(),
          state: billingAddress.state.trim(),
          stateCode: billingAddress.stateCode ?? null,
          pincode: billingAddress.pincode.trim(),
          country: 'India',
        });
      }

      await tx
        .delete(otpVerifications)
        .where(eq(otpVerifications.token, token));

      return u;
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

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email or phone' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
