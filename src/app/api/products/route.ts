import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "../../../../prisma/generated/product"
import { productPrisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const offsetParam = searchParams.get('offset')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    
    // Support both offset and page parameters
    const skip = offsetParam ? parseInt(offsetParam) : (page - 1) * limit

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      approved: true,
      inStock: true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { code: { contains: search } }
      ]
    }

    // Fetch products with all related data
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
      skip: skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await productPrisma.product.count({ where })

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
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products"
      },
      { status: 500 }
    )
  }
}
