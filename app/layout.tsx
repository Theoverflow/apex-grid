import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/jsonld';
import { absoluteUrl, siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — Courses automobiles`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.editorialKeywords],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION ?? '' }
  },
  alternates: { canonical: '/', types: { 'application/rss+xml': absoluteUrl('/feed.xml') } },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Courses automobiles`,
    description: siteConfig.description,
    images: [{ url: absoluteUrl('/og-default.svg'), width: 1200, height: 630, alt: 'Apex Grid' }]
  },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description, images: ['/og-default.svg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  category: 'sports',
  referrer: 'strict-origin-when-cross-origin'
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#08090b', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main">Aller au contenu</a>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
