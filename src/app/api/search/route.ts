import { NextRequest, NextResponse } from 'next/server';
import { dbProduct, products } from '@/lib/db';
import { and, eq, ilike, or } from 'drizzle-orm';

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

    const searchTerms = query.trim().split(/\s+/).filter((term) => term.length > 0);
    const nameTerms = searchTerms.length > 0 ? searchTerms : [query.trim()];
    const qLower = query.trim();
    const qPattern = `%${qLower}%`;

    const searchOr = or(
      ...nameTerms.map((term) => ilike(products.name, `%${term}%`)),
      ilike(products.description, qPattern),
      ilike(products.code, qPattern)
    );

    const whereClause = and(
      eq(products.approved, true),
      eq(products.inStock, true),
      eq(products.webVisible, true),
      searchOr
    );

    const calculateRelevance = (
      productName: string,
      productCode: string,
      searchQuery: string
    ): number => {
      const nameLower = productName.toLowerCase();
      const codeLower = productCode.toLowerCase();
      const queryLower = searchQuery.toLowerCase().trim();

      let score = 0;

      if (nameLower.startsWith(queryLower)) {
        score += 1000;
      }

      if (codeLower.startsWith(queryLower)) {
        score += 800;
      }

      const words = nameLower.split(/\s+/);
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach((queryWord) => {
        words.forEach((word) => {
          if (word.startsWith(queryWord)) {
            score += 500;
          }
        });
      });

      let nameMatchCount = 0;
      let codeMatchCount = 0;

      for (let i = 0; i < queryLower.length; i++) {
        if (nameLower.includes(queryLower[i])) {
          nameMatchCount++;
        }
        if (codeLower.includes(queryLower[i])) {
          codeMatchCount++;
        }
      }

      const nameMatchRatio = nameMatchCount / queryLower.length;
      const codeMatchRatio = codeMatchCount / queryLower.length;
      score += nameMatchRatio * 200;
      score += codeMatchRatio * 100;

      if (nameLower.includes(queryLower)) {
        score += 300;
      }

      if (codeLower.includes(queryLower)) {
        score += 200;
      }

      return score;
    };

    if (autocomplete) {
      const allSuggestions = await dbProduct
        .select({
          id: products.id,
          name: products.name,
          code: products.code,
          price: products.price,
          mainImage: products.mainImage,
        })
        .from(products)
        .where(whereClause)
        .limit(limit * 3);

      const sortedSuggestions = allSuggestions.sort((a, b) => {
        const scoreA = calculateRelevance(a.name, a.code, query);
        const scoreB = calculateRelevance(b.name, b.code, query);

        if (scoreB === scoreA) {
          return a.name.localeCompare(b.name);
        }

        return scoreB - scoreA;
      });

      const suggestions = sortedSuggestions.slice(0, limit);

      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    }

    const allProducts = await dbProduct.query.products.findMany({
      where: whereClause,
      with: {
        category: {
          columns: {
            id: true,
            name: true,
          },
        },
        weightDiscounts: {
          columns: {
            id: true,
            minWeight: true,
            price: true,
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
      },
      limit: limit * 3,
    });

    const sortedProducts = allProducts.sort((a, b) => {
      const scoreA = calculateRelevance(a.name, a.code, query);
      const scoreB = calculateRelevance(b.name, b.code, query);

      if (scoreB === scoreA) {
        return a.name.localeCompare(b.name);
      }

      return scoreB - scoreA;
    });

    const topProducts = sortedProducts.slice(0, limit);

    const transformedProducts = topProducts.map((product) => ({
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
          minWeight: dp.discount.minWeight,
        },
      })),
      weightDiscounts: product.weightDiscounts
        .slice()
        .sort((a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0)),
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
