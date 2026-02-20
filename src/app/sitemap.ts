import { MetadataRoute } from "next"
import { productPrisma } from "@/lib/db"

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
  ]

  try {
    // Query database directly instead of making HTTP requests
    const products = await productPrisma.product.findMany({
      where: {
        approved: true,
        inStock: true,
        webVisible: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limit to 1000 products for sitemap
      orderBy: {
        updatedAt: "desc",
      },
    })

    const productPages = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))

    return [...staticPages, ...productPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return static pages even if product fetch fails
    return staticPages
  }
}
