import { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'About AOAC - Allahabad Organic Agricultural Company Private Limited | Sustainable Farming',
  description: 'Learn about Allahabad Organic Agricultural Company Private Limited (AOAC), promoting sustainable rural development in Patna through organic* farming and creating employment opportunities.',
  keywords: ['AOAC', 'organic farming', 'Allahabad', 'Patna', 'sustainable agriculture', 'rural development', 'integrated farming', 'organic products'],
  openGraph: {
    title: 'About AOAC - Sustainable Organic* Farming in Patna',
    description: 'Discover how AOAC promotes sustainable rural development through organic* farming and creates opportunities for rural communities.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
