import { NextRequest, NextResponse } from 'next/server';
import { dbUser, otpVerifications, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, otp, newPassword } = await req.json();

    if (!token || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const [otpRecord] = await dbUser
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.token, token))
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
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

    if (!otpRecord.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP record' },
        { status: 400 }
      );
    }

    const [user] = await dbUser
      .select()
      .from(users)
      .where(eq(users.email, otpRecord.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    await dbUser
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await dbUser
      .delete(otpVerifications)
      .where(eq(otpVerifications.token, token));

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
