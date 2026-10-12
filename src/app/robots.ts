import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

const privatePaths = [
  '/api/',
  '/admin/',
  '/auth/',
  '/cart',
  '/checkout',
  '/profile',
  '/orders',
  '/address',
  '/order/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: privatePaths,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
