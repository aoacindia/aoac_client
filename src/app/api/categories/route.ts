import { NextResponse } from "next/server"
import { productPrisma } from "@/lib/db"

export async function GET() {
  try {
    const categories = await productPrisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories"
      },
      { status: 500 }
    )
  }
}
