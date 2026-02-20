import { NextRequest, NextResponse } from 'next/server';
import { productPrisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productPrisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        weightDiscounts: {
          orderBy: { minWeight: 'asc' },
        },
        discountPrices: {
          include: {
            discount: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

