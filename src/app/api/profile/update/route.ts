import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma } from '@/lib/db';
import { Prisma } from '../../../../../prisma/generated/user';
import { sendProfileChangeAlert } from '@/lib/email';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, isBusinessAccount, businessName, gstNumber } = body;

    // Get current user data
    const currentUser = await userPrisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Track changes for alert email
    const changes: string[] = [];
    const updateData: Prisma.UserUpdateInput = {};

    // Update name
    if (name !== undefined && name.trim() !== currentUser.name) {
      updateData.name = name.trim();
      changes.push(`Name: ${currentUser.name} → ${name.trim()}`);
    }

    // Update phone
    if (phone !== undefined && phone !== currentUser.phone) {
      // Validate phone format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format. Please enter 10 digits.' },
          { status: 400 }
        );
      }

      // Check if phone already exists
      const existingPhone = await userPrisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone && existingPhone.id !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'Phone number already exists' },
          { status: 409 }
        );
      }

      updateData.phone = phone;
      changes.push(`Phone: ${currentUser.phone} → ${phone}`);
    }

    // Update business account fields
    if (isBusinessAccount !== undefined) {
      updateData.isBusinessAccount = isBusinessAccount;

      if (isBusinessAccount) {
        // If enabling business account, validate business fields
        if (businessName !== undefined && businessName.trim()) {
          updateData.businessName = businessName.trim();
          if (currentUser.businessName !== businessName.trim()) {
            changes.push(
              currentUser.businessName
                ? `Business Name: ${currentUser.businessName} → ${businessName.trim()}`
                : `Business Name: Added "${businessName.trim()}"`
            );
          }
        }

        if (gstNumber !== undefined && gstNumber.trim()) {
          // Validate GST number format
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(gstNumber.toUpperCase())) {
            return NextResponse.json(
              { success: false, message: 'Invalid GST number format. Please enter a valid 15-character GST number.' },
              { status: 400 }
            );
          }

          updateData.gstNumber = gstNumber.toUpperCase().trim();
          if (currentUser.gstNumber !== gstNumber.toUpperCase().trim()) {
            changes.push(
              currentUser.gstNumber
                ? `GST Number: ${currentUser.gstNumber} → ${gstNumber.toUpperCase().trim()}`
                : `GST Number: Added "${gstNumber.toUpperCase().trim()}"`
            );
          }
        }
      } else {
        // If disabling business account, clear business fields
        if (currentUser.businessName || currentUser.gstNumber) {
          updateData.businessName = null;
          updateData.gstNumber = null;
          changes.push('Business Account: Disabled (Business Name and GST Number removed)');
        }
      }
    } else {
      // If not changing business account status, but updating business fields
      if (currentUser.isBusinessAccount) {
        if (businessName !== undefined && businessName.trim() !== currentUser.businessName) {
          updateData.businessName = businessName.trim();
          changes.push(`Business Name: ${currentUser.businessName || 'N/A'} → ${businessName.trim()}`);
        }

        if (gstNumber !== undefined && gstNumber.trim() !== currentUser.gstNumber) {
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(gstNumber.toUpperCase())) {
            return NextResponse.json(
              { success: false, message: 'Invalid GST number format. Please enter a valid 15-character GST number.' },
              { status: 400 }
            );
          }
          updateData.gstNumber = gstNumber.toUpperCase().trim();
          changes.push(`GST Number: ${currentUser.gstNumber || 'N/A'} → ${gstNumber.toUpperCase().trim()}`);
        }
      }
    }

    // If no changes, return early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        user: currentUser,
      });
    }

    // Update user
    const updatedUser = await userPrisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBusinessAccount: true,
        businessName: true,
        gstNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send alert email if there are changes
    if (changes.length > 0) {
      await sendProfileChangeAlert({
        email: currentUser.email,
        userName: updatedUser.name,
        changes,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field =
        Array.isArray(error.meta?.target) && error.meta?.target.length > 0
          ? error.meta?.target[0]
          : 'field';
      return NextResponse.json(
        { success: false, message: `This ${field} is already in use` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

