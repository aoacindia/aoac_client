import { Metadata } from 'next';
import { RefundPolicyContent } from '@/components/policies/RefundPolicyContent';

export const metadata: Metadata = {
  title: 'Refund Policy - Allahabad Organic Agricultural Company Private Limited | AOAC',
  description: 'Read the Refund Policy for www.aoac.in. Learn about the terms and conditions for refunds on products purchased from Allahabad Organic Agricultural Company Private Limited.',
  keywords: ['refund policy', 'AOAC', 'Allahabad Organic', 'refunds', 'refund request', 'payment refund', 'money back'],
  openGraph: {
    title: 'Refund Policy - AOAC',
    description: 'Refund Policy for Allahabad Organic Agricultural Company Private Limited',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicyContent />;
}

