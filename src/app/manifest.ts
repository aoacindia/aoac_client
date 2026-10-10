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
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    categories: ['shopping', 'food', 'organic', 'agriculture'],
  };
}
