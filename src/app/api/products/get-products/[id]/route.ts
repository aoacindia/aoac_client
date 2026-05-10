import { NextRequest, NextResponse } from 'next/server';
import { dbProduct, products } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await dbProduct.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.webVisible, true)),
      with: {
        category: true,
        weightDiscounts: true,
        discountPrices: {
          with: {
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
