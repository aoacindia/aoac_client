import { NextRequest, NextResponse } from 'next/server';
import { dbProduct, products } from '@/lib/db';
import { and, eq, ne } from 'drizzle-orm';

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
        nutrition: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const weightSorted = {
      ...product,
      weightDiscounts: [...product.weightDiscounts].sort(
        (a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0)
      ),
      nutrition: [...product.nutrition].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    };

    const relatedProductsRaw = await dbProduct.query.products.findMany({
      where: and(
        eq(products.categoryId, product.categoryId),
        ne(products.id, product.id),
        eq(products.approved, true),
        eq(products.inStock, true),
        eq(products.webVisible, true)
      ),
      with: {
        category: true,
        weightDiscounts: true,
        discountPrices: {
          with: {
            discount: true,
          },
        },
        nutrition: true,
      },
      limit: 8,
    });

    const relatedProducts = relatedProductsRaw.map((p) => ({
      ...p,
      weightDiscounts: [...p.weightDiscounts].sort(
        (a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0)
      ),
      nutrition: [...p.nutrition].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));

    return NextResponse.json({
      success: true,
      data: {
        product: weightSorted,
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
