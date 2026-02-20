import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AOAC - Allahabad Organic Agricultural Company Private Limited',
    short_name: 'AOAC',
    description: 'Premium organic* products from sustainable farms. Sushi rice, miso, moringa powder & more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#168e2d',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['shopping', 'food', 'organic', 'agriculture'],
  };
}
