import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AOAC - Allahabad Organic Agricultural Company Private Limited | Premium Organic* Products',
  description: 'Shop premium organic* products from Allahabad Organic Agricultural Company Private Limited. Sushi rice, miso, soy sauce, moringa powder & more. Sustainable farming, authentic quality.',
  keywords: ['organic products', 'AOAC', 'Allahabad', 'Patna', 'organic farming', 'sushi rice', 'miso', 'moringa powder', 'sustainable agriculture', 'organic food India'],
  authors: [{ name: 'AOAC' }],
  openGraph: {
    title: 'AOAC - Premium Organic* Products from Sustainable Farms',
    description: 'Discover authentic organic* products from Allahabad Organic Agricultural Company Private Limited. Supporting rural communities through sustainable farming.',
    url: 'https://aoac.in',
    siteName: 'AOAC',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AOAC - Premium Organic* Products',
    description: 'Shop organic* sushi rice, miso, moringa & more from sustainable farms',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="max-w-[1920px] mx-auto">
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
