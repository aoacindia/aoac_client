import { Metadata } from 'next';
import { TermsAndConditionsContent } from '@/components/policies/TermsAndConditionsContent';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Allahabad Organic Agricultural Company Private Limited | AOAC',
  description: 'Read the Terms and Conditions for www.aoac.in. Understand the legal terms governing your use of the website and purchase of products from Allahabad Organic Agricultural Company Private Limited.',
  keywords: ['terms and conditions', 'AOAC', 'Allahabad Organic', 'legal terms', 'website terms', 'user agreement', 'terms of service'],
  openGraph: {
    title: 'Terms and Conditions - AOAC',
    description: 'Terms and Conditions for Allahabad Organic Agricultural Company Private Limited',
    type: 'website',
  },
};

export default function TermsAndConditionsPage() {
  return <TermsAndConditionsContent />;
}

