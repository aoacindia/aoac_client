import { NextRequest, NextResponse } from 'next/server';
import { dbUser, otpVerifications, users } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { and, eq, lt, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, emailOrPhone, purpose } = await req.json();
    const identifier = (emailOrPhone ?? email ?? '').trim();

    if (!purpose) {
      return NextResponse.json(
        { success: false, message: 'Purpose is required' },
        { status: 400 }
      );
    }

    if (purpose === 'login') {
      if (!identifier) {
        return NextResponse.json(
          { success: false, message: 'Email or phone number is required' },
          { status: 400 }
        );
      }

      const normalized = identifier.toLowerCase();
      const [user] = await dbUser
        .select()
        .from(users)
        .where(
          or(eq(users.email, normalized), eq(users.phone, identifier))
        )
        .limit(1);

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found. Please register first.' },
          { status: 404 }
        );
      }

      const userEmail = user.email;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await dbUser
        .delete(otpVerifications)
        .where(
          and(
            eq(otpVerifications.email, userEmail),
            lt(otpVerifications.expiresAt, new Date())
          )
        );

      await dbUser.insert(otpVerifications).values({
        email: userEmail,
        token,
        otp,
        expiresAt,
      });

      const emailSent = await sendOTPEmail({
        email: userEmail,
        otp,
        purpose: 'login',
      });

      if (!emailSent) {
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email',
        token,
      });
    }

    if (purpose === 'registration') {
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      const [existingUser] = await dbUser
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User already exists with this email' },
          { status: 409 }
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await dbUser
        .delete(otpVerifications)
        .where(eq(otpVerifications.email, email.toLowerCase()));

      await dbUser.insert(otpVerifications).values({
        email: email.toLowerCase(),
        token,
        otp,
        expiresAt,
      });

      const emailSent = await sendOTPEmail({
        email: email.toLowerCase(),
        otp,
        purpose: 'registration',
      });

      if (!emailSent) {
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email',
        token,
      });
    }

    if (purpose === 'password-reset') {
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      const [user] = await dbUser
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, an OTP has been sent.',
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await dbUser
        .delete(otpVerifications)
        .where(eq(otpVerifications.email, email.toLowerCase()));

      await dbUser.insert(otpVerifications).values({
        email: email.toLowerCase(),
        token,
        otp,
        expiresAt,
      });

      await sendOTPEmail({
        email: email.toLowerCase(),
        otp,
        purpose: 'password-reset',
      });

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.',
        token,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid purpose' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
