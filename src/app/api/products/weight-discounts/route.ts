import { NextRequest, NextResponse } from "next/server";
import { productPrisma } from "@/lib/db";

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

    const weightDiscounts = await productPrisma.productWeightDiscount.findMany({
      where: {
        productId,
      },
      orderBy: {
        minWeight: "asc",
      },
      select: {
        minWeight: true,
        price: true,
      },
    });

    return NextResponse.json({
      weightDiscounts,
    });
  } catch (error) {
    console.error("Error fetching weight discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight discounts" },
      { status: 500 }
    );
  }
}

