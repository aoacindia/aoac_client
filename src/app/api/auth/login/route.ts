import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { dbUser, otpVerifications, users } from '@/lib/db';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { emailOrPhone, token } = await req.json();

    if (!emailOrPhone || !token) {
      return NextResponse.json(
        { success: false, message: 'Email/Phone and token are required' },
        { status: 400 }
      );
    }

    const normalized = emailOrPhone.toLowerCase();
    const [user] = await dbUser
      .select()
      .from(users)
      .where(
        or(eq(users.email, normalized), eq(users.phone, emailOrPhone))
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const [otpRecord] = await dbUser
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.token, token))
      .limit(1);

    if (!otpRecord || !otpRecord.email || otpRecord.email !== user.email) {
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

    if (user.suspended || user.terminated) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended or terminated. Please contact support.' },
        { status: 403 }
      );
    }

    try {
      await signIn('credentials', {
        emailOrPhone: user.email,
        otpToken: token,
        redirect: false,
      });

      try {
        await dbUser
          .delete(otpVerifications)
          .where(eq(otpVerifications.token, token));
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
      try {
        await dbUser
          .delete(otpVerifications)
          .where(eq(otpVerifications.token, token));
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
