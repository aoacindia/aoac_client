import { NextRequest, NextResponse } from "next/server";
import { dbProduct, productWeightDiscounts } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const weightDiscounts = await dbProduct.query.productWeightDiscounts.findMany({
      where: eq(productWeightDiscounts.productId, productId),
    });

    return NextResponse.json(weightDiscounts);
  } catch (error) {
    console.error("Error fetching weight discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight discounts" },
      { status: 500 }
    );
  }
}
