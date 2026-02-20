import { Metadata } from 'next';
import { ReturnPolicyContent } from '@/components/policies/ReturnPolicyContent';

export const metadata: Metadata = {
  title: 'Return Policy - Allahabad Organic Agricultural Company Private Limited | AOAC',
  description: 'Read the Return Policy for www.aoac.in. Learn about the terms and conditions for returning products purchased from Allahabad Organic Agricultural Company Private Limited.',
  keywords: ['return policy', 'AOAC', 'Allahabad Organic', 'product returns', 'return request', 'exchange policy'],
  openGraph: {
    title: 'Return Policy - AOAC',
    description: 'Return Policy for Allahabad Organic Agricultural Company Private Limited',
    type: 'website',
  },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyContent />;
}

