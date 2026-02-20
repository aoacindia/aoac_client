import { NextRequest, NextResponse } from 'next/server';
import { userPrisma } from '@/lib/db';
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

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Verify OTP token
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
        { success: false, message: 'OTP has expired. Please request a new one.' },
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

    // Find user by email
    if (!otpRecord.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP record' },
        { status: 400 }
      );
    }

    const user = await userPrisma.user.findUnique({
      where: {
        email: otpRecord.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password
    await userPrisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete OTP record
    await userPrisma.otpVerification.delete({
      where: {
        token,
      },
    });

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

