import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { RelatedProducts } from '@/components/product/RelatedProducts';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${id}`, {
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

  return {
    title: `${product.name} - ${product.category.name} | AOAC`,
    description: product.description || `Buy ${product.name} from Allahabad Organic Agricultural Company Private Limited. High-quality organic* products at ₹${product.price}`,
    keywords: [product.name, product.category.name, 'organic', 'AOAC', 'Allahabad', 'Patna', 'sustainable farming'],
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} from AOAC`,
      images: product.mainImage ? [product.mainImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} from AOAC`,
      images: product.mainImage ? [product.mainImage] : [],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.code,
    brand: {
      '@type': 'Organization',
      name: 'Allahabad Organic Agricultural Company Private Limited',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
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
