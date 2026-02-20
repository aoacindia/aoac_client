import { NextRequest, NextResponse } from 'next/server';
import { userPrisma } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

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

    // For login, check if user exists
    if (purpose === 'login') {
      if (!identifier) {
        return NextResponse.json(
          { success: false, message: 'Email or phone number is required' },
          { status: 400 }
        );
      }

      const user = await userPrisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { phone: identifier } // In case user enters phone instead
          ]
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found. Please register first.' },
          { status: 404 }
        );
      }

      // Use user's email for sending OTP (never use phone)
      const userEmail = user.email;

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email
      await userPrisma.otpVerification.deleteMany({
        where: {
          email: userEmail,
          expiresAt: {
            lt: new Date() // Delete expired ones
          }
        }
      });

      // Create new OTP record
      await userPrisma.otpVerification.create({
        data: {
          email: userEmail,
          token,
          otp,
          expiresAt,
        },
      });

      // Send OTP via email
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
        token, // Return token for verification
      });
    }

    // For registration, check if user already exists
    if (purpose === 'registration') {
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      const existingUser = await userPrisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User already exists with this email' },
          { status: 409 }
        );
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email
      await userPrisma.otpVerification.deleteMany({
        where: {
          email: email.toLowerCase(),
        }
      });

      // Create new OTP record
      await userPrisma.otpVerification.create({
        data: {
          email: email.toLowerCase(),
          token,
          otp,
          expiresAt,
        },
      });

      // Send OTP via email
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
        token, // Return token for verification
      });
    }

    // For password reset
    if (purpose === 'password-reset') {
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      const user = await userPrisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (!user) {
        // Don't reveal if user exists for security
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, an OTP has been sent.',
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email
      await userPrisma.otpVerification.deleteMany({
        where: {
          email: email.toLowerCase(),
        }
      });

      // Create new OTP record
      await userPrisma.otpVerification.create({
        data: {
          email: email.toLowerCase(),
          token,
          otp,
          expiresAt,
        },
      });

      // Send OTP via email
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

