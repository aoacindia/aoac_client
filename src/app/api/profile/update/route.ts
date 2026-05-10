import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbUser, users } from '@/lib/db';
import { isUniqueConstraintViolation } from '@/lib/db/unique-violation';
import { sendProfileChangeAlert } from '@/lib/email';
import { eq } from 'drizzle-orm';

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

    const [currentUser] = await dbUser
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const changes: string[] = [];
    const updateData: Partial<{
      name: string;
      phone: string;
      isBusinessAccount: boolean;
      businessName: string | null;
      gstNumber: string | null;
    }> = {};

    if (name !== undefined && name.trim() !== currentUser.name) {
      updateData.name = name.trim();
      changes.push(`Name: ${currentUser.name} → ${name.trim()}`);
    }

    if (phone !== undefined && phone !== currentUser.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format. Please enter 10 digits.' },
          { status: 400 }
        );
      }

      const [existingPhone] = await dbUser
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existingPhone && existingPhone.id !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'Phone number already exists' },
          { status: 409 }
        );
      }

      updateData.phone = phone;
      changes.push(`Phone: ${currentUser.phone} → ${phone}`);
    }

    if (isBusinessAccount !== undefined) {
      updateData.isBusinessAccount = isBusinessAccount;

      if (isBusinessAccount) {
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
        if (currentUser.businessName || currentUser.gstNumber) {
          updateData.businessName = null;
          updateData.gstNumber = null;
          changes.push('Business Account: Disabled (Business Name and GST Number removed)');
        }
      }
    } else {
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

    if (Object.keys(updateData).length === 0) {
      const { password: _p, ...user } = currentUser;
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        user,
      });
    }

    const [updatedUser] = await dbUser
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isBusinessAccount: users.isBusinessAccount,
        businessName: users.businessName,
        gstNumber: users.gstNumber,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (changes.length > 0 && updatedUser) {
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

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json(
        { success: false, message: 'This field is already in use' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
