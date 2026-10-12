import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { absoluteUrl } from '@/lib/site-url';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function productImageUrls(product: {
  mainImage?: string | null;
  images?: unknown;
}): string[] {
  const extras = Array.isArray(product.images) ? product.images : [];
  const urls = [product.mainImage, ...extras].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
  return [...new Set(urls)];
}

async function getProduct(id: string) {
  try {
    const res = await fetch(absoluteUrl(`/api/products/${id}`), {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);

  if (!data) {
    return {
      title: 'Product Not Found | AOAC',
    };
  }

  const { product } = data;
  const images = productImageUrls(product);
  const canonical = `/product/${id}`;

  return {
    title: `${product.name} - ${product.category.name} | AOAC`,
    description: product.description || `Buy ${product.name} from Allahabad Organic Agricultural Company Private Limited. High-quality organic* products at ₹${product.price}`,
    keywords: [product.name, product.category.name, 'organic', 'AOAC', 'Allahabad', 'Patna', 'sustainable farming'],
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} from AOAC`,
      url: canonical,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} from AOAC`,
      images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const data = await getProduct(id);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;
  const images = productImageUrls(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(images.length > 0 ? { image: images } : {}),
    description: product.description,
    sku: product.code,
    brand: {
      '@type': 'Organization',
      name: 'Allahabad Organic Agricultural Company Private Limited',
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
      <RelatedProducts products={relatedProducts} categoryName={product.category.name} />
    </>
  );
}
