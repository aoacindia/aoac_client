import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

/**
 * Verify Razorpay Payment
 * POST /api/payment/verify
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { success: false, message: 'Payment verification failed: Invalid signature' },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay API
    const authString = Buffer.from(`${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const paymentResponse = await fetch(`${RAZORPAY_API_URL}/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json().catch(() => ({}));
      console.error('Razorpay payment verification failed:', errorData);
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: paymentResponse.status }
      );
    }

    const paymentData = await paymentResponse.json();

    // Check if payment is successful
    if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
      return NextResponse.json(
        { success: false, message: `Payment status: ${paymentData.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: paymentData.status,
      method: paymentData.method,
      paymentData,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

