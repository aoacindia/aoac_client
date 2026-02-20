import { Metadata } from 'next';
import { ShippingPolicyContent } from '@/components/policies/ShippingPolicyContent';

export const metadata: Metadata = {
  title: 'Shipping Policy - Allahabad Organic Agricultural Company Private Limited | AOAC',
  description: 'Read the Shipping Policy for www.aoac.in. Learn about shipping, delivery timelines, and terms for products purchased from Allahabad Organic Agricultural Company Private Limited.',
  keywords: ['shipping policy', 'AOAC', 'Allahabad Organic', 'delivery', 'shipping', 'delivery timeline', 'shipping charges', 'order delivery'],
  openGraph: {
    title: 'Shipping Policy - AOAC',
    description: 'Shipping Policy for Allahabad Organic Agricultural Company Private Limited',
    type: 'website',
  },
};

export default function ShippingPolicyPage() {
  return <ShippingPolicyContent />;
}

