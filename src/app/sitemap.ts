import { MetadataRoute } from "next"
import { dbProduct, products } from "@/lib/db"
import { and, desc, eq } from "drizzle-orm"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/policies/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies/return-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]

  try {
    const productRows = await dbProduct
      .select({
        id: products.id,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(
        and(
          eq(products.approved, true),
          eq(products.inStock, true),
          eq(products.webVisible, true)
        )
      )
      .orderBy(desc(products.updatedAt))
      .limit(1000)

    const productPages = productRows.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))

    return [...staticPages, ...productPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticPages
  }
}
