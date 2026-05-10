import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbProduct, products } from '@/lib/db';
import { and, eq, inArray } from 'drizzle-orm';

type WeightItemInput = {
  productId: string;
  quantity: number;
};

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
    const { items }: { items: WeightItemInput[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Items are required' },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => item.productId);
    const rows = await dbProduct
      .select({
        id: products.id,
        packingWeight: products.packingWeight,
      })
      .from(products)
      .where(
        and(inArray(products.id, productIds), eq(products.webVisible, true))
      );

    const productWeightMap = new Map<string, number>(
      rows.map((product) => [
        product.id,
        product.packingWeight ?? 0,
      ])
    );

    let eligibleWeight = 0;
    let totalWeight = 0;

    for (const item of items) {
      const productId = item.productId;
      const quantity = item.quantity || 0;
      const singleUnitWeight = productWeightMap.get(productId) ?? 0;
      console.log("[WEIGHT] product weight:", { productId, singleUnitWeight });
      console.log("[WEIGHT] eligible:", singleUnitWeight < 10000);

      totalWeight += singleUnitWeight * quantity;

      if (singleUnitWeight < 10000) {
        eligibleWeight += singleUnitWeight * quantity;
      }
    }

    console.log("[WEIGHT] eligibleWeight:", eligibleWeight);

    let extraPackagingWeight = 0;
    if (eligibleWeight > 10000) {
      extraPackagingWeight = Math.floor(eligibleWeight / 10000) * 1000;
    }

    console.log("[WEIGHT] extraPackagingWeight:", extraPackagingWeight);

    const totalWeightWithPackaging = totalWeight + extraPackagingWeight;
    console.log("[WEIGHT] totalWeightWithPackaging:", totalWeightWithPackaging);

    return NextResponse.json({
      totalWeightWithPackaging,
    });
  } catch (error) {
    console.error('Error calculating weight:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Failed to calculate weight',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
