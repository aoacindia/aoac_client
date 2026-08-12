import { NextRequest, NextResponse } from 'next/server';
import { dbUser, otpVerifications, users } from '@/lib/db';
import { isUniqueConstraintViolation } from '@/lib/db/unique-violation';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { generateNextUserId } from '@/lib/user-id';
import {
  createBusinessForUser,
  validateBusinessPayload,
  type CreateBusinessInput,
} from '@/lib/business';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      token,
      isBusinessAccount,
      businessName,
      gstNumber,
      hasAdditionalTradeName,
      additionalTradeName,
      billingAddress
    } = await req.json();

    if (!name || !email || !phone || !token) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (isBusinessAccount) {
      const businessValidationError = validateBusinessPayload(
        {
          businessName,
          gstNumber,
          hasAdditionalTradeName,
          additionalTradeName,
          billingAddress,
        } as CreateBusinessInput,
        { requireGst: true }
      );
      if (businessValidationError) {
        return NextResponse.json(
          { success: false, message: businessValidationError },
          { status: 400 }
        );
      }
    }

    const [otpRecord] = await dbUser
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.token, token))
      .limit(1);

    if (!otpRecord || otpRecord.email !== email.toLowerCase()) {
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

    const [existingUser] = await dbUser
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, email.toLowerCase()),
          eq(users.phone, phone)
        )
      )
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email or phone' },
        { status: 409 }
      );
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format. Please enter 10 digits.' },
        { status: 400 }
      );
    }

    const tempPassword = randomBytes(16).toString('hex');
    const hashedPassword = await hash(tempPassword, 12);

    const userId = await generateNextUserId();

    const user = await dbUser.transaction(async (tx) => {
      const [u] = await tx
        .insert(users)
        .values({
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
        })
        .returning();

      if (!u) {
        throw new Error('Failed to create user');
      }

      if (isBusinessAccount && billingAddress) {
        await createBusinessForUser(
          u.id,
          {
            businessName,
            gstNumber,
            hasAdditionalTradeName,
            additionalTradeName,
            billingAddress,
          },
          tx
        );
      }

      await tx
        .delete(otpVerifications)
        .where(eq(otpVerifications.token, token));

      return u;
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email or phone' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
