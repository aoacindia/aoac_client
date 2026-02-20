import { NextRequest, NextResponse } from 'next/server';
import { userPrisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, otp } = await req.json();

    if (!token || !otp) {
      return NextResponse.json(
        { success: false, message: 'Token and OTP are required' },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await userPrisma.otpVerification.findUnique({
      where: {
        token,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
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
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - return success with email
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email: otpRecord.email || null,
      token, // Return token for next steps
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

