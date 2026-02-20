import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

/**
 * Create Razorpay Order
 * POST /api/payment/order
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

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, currency = 'INR', orderId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrderData = {
      amount: Math.round(amount), // Amount in paise
      currency: currency,
      receipt: orderId || `receipt_${Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: session.user.id,
      },
    };

    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(razorpayOrderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Razorpay order creation failed:', errorData);
      return NextResponse.json(
        { success: false, message: 'Failed to create Razorpay order', error: errorData },
        { status: response.status }
      );
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

