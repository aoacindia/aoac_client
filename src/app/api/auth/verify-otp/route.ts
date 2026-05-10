import { NextRequest, NextResponse } from 'next/server';
import { dbUser, otpVerifications } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { token, otp } = await req.json();

    if (!token || !otp) {
      return NextResponse.json(
        { success: false, message: 'Token and OTP are required' },
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
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email: otpRecord.email || null,
      token,
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
