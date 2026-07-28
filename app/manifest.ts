import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Racing premium`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#08090b',
    theme_color: '#08090b',
    lang: 'fr-FR',
    icons: [{ src: '/brand-mark.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}
