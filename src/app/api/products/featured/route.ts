import { NextRequest, NextResponse } from "next/server"
import { productPrisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 12
    const offset = Number(searchParams.get("offset")) || 0

    const where = {
      approved: true,
      inStock: true
    }

    // Fetch featured products (you can modify the criteria as needed)
    const products = await productPrisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        discountPrices: {
          include: {
            discount: {
              select: {
                id: true,
                minWeight: true
              }
            }
          }
        },
        weightDiscounts: {
          select: {
            id: true,
            minWeight: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    const total = await productPrisma.product.count({ where })

    // Transform the data to match the frontend interface
    const transformedProducts = products.map(product => ({
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
      discountPrices: product.discountPrices.map(dp => ({
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
