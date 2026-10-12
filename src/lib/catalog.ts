import { cache } from "react";
import { and, asc, desc, eq } from "drizzle-orm";
import { categories, dbProduct, products } from "@/lib/db";

export type PublicCategory = {
  id: string;
  name: string;
};

export type PublicProduct = {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  regularPrice?: number;
  weight?: number;
  mainImage?: string;
  images: string[];
  inStock: boolean;
  category: PublicCategory;
  weightDiscounts: Array<{
    id: string;
    minWeight: number;
    price: number;
  }>;
  discountPrices: Array<{
    id: string;
    discountPrice: number;
    discount: {
      id: string;
      minWeight: number;
    };
  }>;
};

function asImageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export const getPublicCatalog = cache(async (categoryId?: string) => {
  const categoryRows = await dbProduct
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  const selectedCategory = categoryId
    ? categoryRows.find((category) => category.id === categoryId) ?? null
    : null;

  const conditions = [eq(products.approved, true), eq(products.webVisible, true)];
  if (selectedCategory) {
    conditions.push(eq(products.categoryId, selectedCategory.id));
  }

  const productList = await dbProduct.query.products.findMany({
    where: and(...conditions),
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
  });

  const publicProducts: PublicProduct[] = productList.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    regularPrice: product.regularPrice ?? undefined,
    weight: product.weight ?? undefined,
    mainImage: product.mainImage ?? undefined,
    images: asImageList(product.images),
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
      .sort((a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0))
      .map((discount) => ({
        id: discount.id,
        minWeight: discount.minWeight ?? 0,
        price: discount.price,
      })),
  }));

  return {
    categories: categoryRows,
    products: publicProducts,
    selectedCategory,
  };
});
