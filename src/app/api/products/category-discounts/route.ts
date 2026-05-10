import { NextRequest, NextResponse } from "next/server";
import { categoryWeightDiscounts, dbProduct } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const discounts = await dbProduct.query.categoryWeightDiscounts.findMany({
      where: eq(categoryWeightDiscounts.categoryId, categoryId),
      with: {
        productDiscounts: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [asc(categoryWeightDiscounts.minWeight)],
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching category discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch category discounts" },
      { status: 500 }
    );
  }
}
