import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma } from '@/lib/db';
import { sendOTPEmail, sendProfileChangeAlert } from '@/lib/email';
import { randomBytes } from 'crypto';
import { Prisma } from '../../../../../prisma/generated/user';

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

    // Step 1: Request OTP for email change
    if (!token && newEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Get current user
      const currentUser = await userPrisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      if (!currentUser) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Check if new email is different
      if (newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: 'New email is the same as current email' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await userPrisma.user.findUnique({
        where: {
          email: newEmail.toLowerCase(),
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email
      await userPrisma.otpVerification.deleteMany({
        where: {
          email: newEmail.toLowerCase(),
        },
      });

      // Create new OTP record
      await userPrisma.otpVerification.create({
        data: {
          email: newEmail.toLowerCase(),
          token: otpToken,
          otp: otpCode,
          expiresAt,
        },
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail({
        email: newEmail.toLowerCase(),
        otp: otpCode,
        purpose: 'password-reset', // Reuse password-reset template for email change
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

    // Step 2: Verify OTP and update email
    if (token && otp && newEmail) {
      // Verify OTP token
      const otpRecord = await userPrisma.otpVerification.findUnique({
        where: {
          token,
        },
      });

      if (!otpRecord || otpRecord.email !== newEmail.toLowerCase()) {
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

      // Verify OTP code
      if (otpRecord.otp !== otp) {
        return NextResponse.json(
          { success: false, message: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Get current user
      const currentUser = await userPrisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      if (!currentUser) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Update email
      const updatedUser = await userPrisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          email: newEmail.toLowerCase().trim(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isBusinessAccount: true,
          businessName: true,
          gstNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Delete OTP record
      await userPrisma.otpVerification.delete({
        where: {
          token,
        },
      });

      // Send alert email to old email
      await sendProfileChangeAlert({
        email: currentUser.email,
        userName: updatedUser.name,
        changes: [`Email: ${currentUser.email} → ${newEmail.toLowerCase()}`],
      });

      // Send confirmation email to new email
      await sendProfileChangeAlert({
        email: newEmail.toLowerCase(),
        userName: updatedUser.name,
        changes: [`Email: Successfully changed to ${newEmail.toLowerCase()}`],
      });

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

    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
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

