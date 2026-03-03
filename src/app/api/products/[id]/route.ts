import { NextRequest, NextResponse } from 'next/server';
import { productPrisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productPrisma.product.findFirst({
      where: { 
        id,
        webVisible: true
      },
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
        nutrition: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const relatedProducts = await productPrisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        approved: true,
        inStock: true,
        webVisible: true,
      },
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
        nutrition: {
          orderBy: { name: 'asc' },
        },
      },
      take: 8,
    });

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
