import { NextRequest, NextResponse } from "next/server";
import { productPrisma } from "@/lib/db";

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

    const discounts = await productPrisma.categoryWeightDiscount.findMany({
      where: {
        categoryId,
      },
      include: {
        productDiscounts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        minWeight: "asc",
      },
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

