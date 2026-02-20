import { Metadata } from 'next';
import { PrivacyPolicyContent } from '@/components/policies/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - Allahabad Organic Agricultural Company Private Limited | AOAC',
  description: 'Read the Privacy Policy for www.aoac.in. Learn how Allahabad Organic Agricultural Company Private Limited collects, uses, and protects your personal information in compliance with Indian data protection laws.',
  keywords: ['privacy policy', 'AOAC', 'Allahabad Organic', 'data protection', 'personal information', 'privacy', 'DPDPA', 'IT Act'],
  openGraph: {
    title: 'Privacy Policy - AOAC',
    description: 'Privacy Policy for Allahabad Organic Agricultural Company Private Limited',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}

