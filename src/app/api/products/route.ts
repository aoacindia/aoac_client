import { NextRequest, NextResponse } from "next/server"
import { dbProduct, products } from "@/lib/db"
import { and, count, desc, eq, ilike, or } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const offsetParam = searchParams.get('offset')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    const skip = offsetParam ? parseInt(offsetParam) : (page - 1) * limit

    const conditions = [
      eq(products.approved, true),
      eq(products.webVisible, true),
    ]
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId))
    }
    if (search) {
      const q = `%${search}%`
      const searchOr = or(
        ilike(products.name, q),
        ilike(products.description, q),
        ilike(products.code, q)
      )
      if (searchOr) conditions.push(searchOr)
    }
    const whereClause = and(...conditions)

    const productList = await dbProduct.query.products.findMany({
      where: whereClause,
      with: {
        category: {
          columns: {
            id: true,
            name: true,
          },
        },
        discountPrices: {
          with: {
            discount: {
              columns: {
                id: true,
                minWeight: true,
              },
            },
          },
        },
        weightDiscounts: {
          columns: {
            id: true,
            minWeight: true,
            price: true,
          },
        },
      },
      orderBy: [desc(products.createdAt)],
      limit,
      offset: skip,
    })

    const [countRow] = await dbProduct
      .select({ total: count() })
      .from(products)
      .where(whereClause)

    const totalCount = Number(countRow?.total ?? 0)

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
        .slice()
        .sort((a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0))
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
