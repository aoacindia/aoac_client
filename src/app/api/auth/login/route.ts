import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { userPrisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { emailOrPhone, token } = await req.json();

    if (!emailOrPhone || !token) {
      return NextResponse.json(
        { success: false, message: 'Email/Phone and token are required' },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await userPrisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone.toLowerCase() },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify OTP token is valid for user's email
    const otpRecord = await userPrisma.otpVerification.findUnique({
      where: {
        token,
      },
    });

    if (!otpRecord || !otpRecord.email || otpRecord.email !== user.email) {
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

    // Check if user is suspended or terminated
    if (user.suspended || user.terminated) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended or terminated. Please contact support.' },
        { status: 403 }
      );
    }

    // Create session using NextAuth with OTP token
    try {
      await signIn('credentials', {
        emailOrPhone: user.email, // Use email for consistency
        otpToken: token, // Pass OTP token for verification
        redirect: false,
      });

      // Delete OTP record after successful session creation (will be handled in auth.ts, but delete here too for safety)
      try {
        await userPrisma.otpVerification.delete({
          where: {
            token,
          },
        });
      } catch (deleteError) {
        console.warn('Failed to delete OTP after login:', deleteError);
      }

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (signInError) {
      // If signIn fails, still delete the OTP token for security
      try {
        await userPrisma.otpVerification.delete({
          where: {
            token,
          },
        });
      } catch (deleteError) {
        console.warn('Failed to delete OTP after failed login:', deleteError);
      }

      const errorMessage =
        signInError instanceof Error
          ? signInError.message
          : 'Failed to create session. Please try again.';
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

