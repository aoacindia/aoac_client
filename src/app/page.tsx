import type { Metadata } from "next";
import { HeroSlides } from "@/components/HeroSlides";
import { CategoryProducts } from "@/components/CategoryProducts";
import { getPublicCatalog } from "@/lib/catalog";

const heroSlides = [
  {
    id: "2",
    image: "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg",
    title: "Organic* Products",
    subtitle: "Supporting rural communities through sustainable agriculture and quality organic* farming",
    badge: "Certified Organic*",
    backgroundColor: "rgba(46, 125, 50, 0.15)",
  },
];

type HomeProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function readCategory(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const categoryId = readCategory((await searchParams).category);
  const { selectedCategory } = await getPublicCatalog(categoryId);

  if (!selectedCategory) {
    return {
      alternates: { canonical: "/" },
    };
  }

  return {
    title: `${selectedCategory.name} | AOAC`,
    description: `Shop ${selectedCategory.name} from Allahabad Organic Agricultural Company Private Limited.`,
    alternates: { canonical: `/?category=${selectedCategory.id}` },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const categoryId = readCategory((await searchParams).category);
  const { categories, products, selectedCategory } = await getPublicCatalog(categoryId);

  return (
    <div className="min-h-screen">
      <HeroSlides slides={heroSlides} />
      <CategoryProducts
        categories={categories}
        products={products}
        selectedCategory={selectedCategory?.id}
      />
    </div>
  );
}
