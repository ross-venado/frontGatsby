import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mercadito Chimalteco',
    short_name: 'Mercadito',
    description: 'Locales digitales para negocios de Chimaltenango.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f3eb',
    theme_color: '#0f8b6f',
    categories: ['business', 'shopping', 'food'],
    icons: [
      {
        src: '/icons/mercadito-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/mercadito-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
