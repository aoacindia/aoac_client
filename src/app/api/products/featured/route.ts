import { NextRequest, NextResponse } from "next/server"
import { dbProduct, products } from "@/lib/db"
import { and, count, desc, eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 12
    const offset = Number(searchParams.get("offset")) || 0

    const whereClause = and(
      eq(products.approved, true),
      eq(products.webVisible, true)
    )

    const productList = await dbProduct.query.products.findMany({
      where: whereClause,
      with: {
        category: {
          columns: {
            id: true,
            name: true
          }
        },
        discountPrices: {
          with: {
            discount: {
              columns: {
                id: true,
                minWeight: true
              }
            }
          }
        },
        weightDiscounts: {
          columns: {
            id: true,
            minWeight: true,
            price: true
          }
        }
      },
      orderBy: [desc(products.createdAt)],
      limit,
      offset,
    })

    const [countRow] = await dbProduct
      .select({ total: count() })
      .from(products)
      .where(whereClause)

    const total = Number(countRow?.total ?? 0)

    const transformedProducts = productList.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      regularPrice: product.regularPrice,
      weight: product.weight,
      mainImage: product.mainImage,
      images: product.images,
      inStock: product.inStock,
      category: product.category,
      discountPrices: product.discountPrices.map((dp) => ({
        id: dp.id,
        discountPrice: dp.discountPrice,
        discount: {
          id: dp.discount.id,
          minWeight: dp.discount.minWeight
        }
      })),
      weightDiscounts: product.weightDiscounts
    }))

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured products"
      },
      { status: 500 }
    )
  }
}
