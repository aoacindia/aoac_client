import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma } from '@/lib/db';
import { calculateDelhiveryShipping } from '@/lib/delhivery-shipping';

// POST calculate shipping cost
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { addressId, totalWeightWithPackaging } = body;

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    if (!totalWeightWithPackaging || totalWeightWithPackaging <= 0) {
      return NextResponse.json(
        { success: false, message: 'Total weight with packaging is required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await userPrisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Address not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Calculate shipping using Delhivery
    const shippingResult = await calculateDelhiveryShipping({
      delivery_postcode: address.pincode,
      totalWeight: totalWeightWithPackaging,
    });

    if (shippingResult.status === 'success' && shippingResult.delivery_charges.isServiceable) {
      return NextResponse.json({
        success: true,
        status: 'success',
        provider: shippingResult.provider,
        delivery_charges: shippingResult.delivery_charges,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 'error',
        provider: shippingResult.provider,
        delivery_charges: shippingResult.delivery_charges,
        message: shippingResult.delivery_charges.message || 'Failed to calculate shipping cost',
      });
    }
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'error',
        message: 'Failed to calculate shipping cost',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

