import { NextResponse } from "next/server";
import { categories, dbProduct } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await dbProduct
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .orderBy(asc(categories.name));

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
