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
      webVisible: true,
      OR: searchConditions,
    };

    // Helper function to calculate relevance score
    const calculateRelevance = (productName: string, productCode: string, searchQuery: string): number => {
      const nameLower = productName.toLowerCase();
      const codeLower = productCode.toLowerCase();
      const queryLower = searchQuery.toLowerCase().trim();
      
      let score = 0;
      
      // Highest priority: name starts with query
      if (nameLower.startsWith(queryLower)) {
        score += 1000;
      }
      
      // High priority: code starts with query
      if (codeLower.startsWith(queryLower)) {
        score += 800;
      }
      
      // Medium priority: name contains query at the start of a word
      const words = nameLower.split(/\s+/);
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(queryWord => {
        words.forEach(word => {
          if (word.startsWith(queryWord)) {
            score += 500;
          }
        });
      });
      
      // Calculate character match percentage
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
      
      // Add score based on character match percentage
      const nameMatchRatio = nameMatchCount / queryLower.length;
      const codeMatchRatio = codeMatchCount / queryLower.length;
      score += nameMatchRatio * 200;
      score += codeMatchRatio * 100;
      
      // Bonus for exact substring match in name
      if (nameLower.includes(queryLower)) {
        score += 300;
      }
      
      // Bonus for exact substring match in code
      if (codeLower.includes(queryLower)) {
        score += 200;
      }
      
      return score;
    };

    if (autocomplete) {
      // Fetch more results to sort by relevance
      const allSuggestions = await productPrisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          price: true,
          mainImage: true,
        },
        take: limit * 3, // Fetch 3x to have enough for relevance sorting
      });

      // Sort by relevance score (highest first)
      const sortedSuggestions = allSuggestions.sort((a, b) => {
        const scoreA = calculateRelevance(a.name, a.code, query);
        const scoreB = calculateRelevance(b.name, b.code, query);
        
        // If scores are equal, sort alphabetically
        if (scoreB === scoreA) {
          return a.name.localeCompare(b.name);
        }
        
        return scoreB - scoreA;
      });

      // Take only the top N results
      const suggestions = sortedSuggestions.slice(0, limit);

      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    }

    // Fetch more results to sort by relevance
    const allProducts = await productPrisma.product.findMany({
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
      take: limit * 3, // Fetch 3x to have enough for relevance sorting
    });

    // Sort by relevance score (highest first)
    const sortedProducts = allProducts.sort((a, b) => {
      const scoreA = calculateRelevance(a.name, a.code, query);
      const scoreB = calculateRelevance(b.name, b.code, query);
      
      // If scores are equal, sort alphabetically
      if (scoreB === scoreA) {
        return a.name.localeCompare(b.name);
      }
      
      return scoreB - scoreA;
    });

    // Take only the top N results
    const products = sortedProducts.slice(0, limit);

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
