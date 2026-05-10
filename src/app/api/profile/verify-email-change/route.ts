import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbUser, otpVerifications, users } from '@/lib/db';
import { isUniqueConstraintViolation } from '@/lib/db/unique-violation';
import { sendOTPEmail, sendProfileChangeAlert } from '@/lib/email';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { newEmail, token, otp } = await req.json();

    if (!token && newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

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

      if (newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: 'New email is the same as current email' },
          { status: 400 }
        );
      }

      const [existingUser] = await dbUser
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, newEmail.toLowerCase()))
        .limit(1);

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await dbUser
        .delete(otpVerifications)
        .where(eq(otpVerifications.email, newEmail.toLowerCase()));

      await dbUser.insert(otpVerifications).values({
        email: newEmail.toLowerCase(),
        token: otpToken,
        otp: otpCode,
        expiresAt,
      });

      const emailSent = await sendOTPEmail({
        email: newEmail.toLowerCase(),
        otp: otpCode,
        purpose: 'password-reset',
      });

      if (!emailSent) {
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent to new email address',
        token: otpToken,
      });
    }

    if (token && otp && newEmail) {
      const [otpRecord] = await dbUser
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.token, token))
        .limit(1);

      if (!otpRecord || otpRecord.email !== newEmail.toLowerCase()) {
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

      if (otpRecord.otp !== otp) {
        return NextResponse.json(
          { success: false, message: 'Invalid OTP' },
          { status: 400 }
        );
      }

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

      const [updatedUser] = await dbUser
        .update(users)
        .set({
          email: newEmail.toLowerCase().trim(),
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

      await dbUser
        .delete(otpVerifications)
        .where(eq(otpVerifications.token, token));

      if (updatedUser) {
        await sendProfileChangeAlert({
          email: currentUser.email,
          userName: updatedUser.name,
          changes: [`Email: ${currentUser.email} → ${newEmail.toLowerCase()}`],
        });

        await sendProfileChangeAlert({
          email: newEmail.toLowerCase(),
          userName: updatedUser.name,
          changes: [`Email: Successfully changed to ${newEmail.toLowerCase()}`],
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Email updated successfully',
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request. Provide newEmail for OTP request, or token, otp, and newEmail for verification.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error verifying email change:', error);

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
