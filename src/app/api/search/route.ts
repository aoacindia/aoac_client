import { NextRequest, NextResponse } from 'next/server';
import { productPrisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const autocomplete = searchParams.get('autocomplete') === 'true';

    if (query.length < 3) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Query must be at least 3 characters',
      });
    }

    // Split query into individual words and trim whitespace
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
    
    // Build OR conditions for each word in the product name
    // This ensures we match products where ANY word appears anywhere in the name
    // MySQL handles case-insensitive searches through column collation
    const nameConditions = searchTerms.length > 0 
      ? searchTerms.map(term => ({
          name: { 
            contains: term
          }
        }))
      : [{ name: { contains: query } }];

    // Build search conditions - prioritize name matching, but also check description and code
    const searchConditions = [
      // Match if ANY word appears in the name (most important)
      ...nameConditions,
      // Also check description and code for the full query
      { description: { contains: query } },
      { code: { contains: query } },
    ];

    const where = {
      approved: true,
      inStock: true,
      OR: searchConditions,
    };

    if (autocomplete) {
      const suggestions = await productPrisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          price: true,
          mainImage: true,
        },
        take: limit,
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    }

    const products = await productPrisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        weightDiscounts: {
          orderBy: { minWeight: 'asc' },
          select: {
            id: true,
            minWeight: true,
            price: true
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
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

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
    }));

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      query,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
