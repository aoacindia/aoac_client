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
    const { name, phone } = body;

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
