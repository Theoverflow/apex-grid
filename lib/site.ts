export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Apex Grid',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.example.com',
  description:
    'Apex Grid, plateforme racing premium : courses automobiles, ingénierie, calendriers, équipes et analyses vérifiées dans un univers luxe race.',
  alternativeNames: ['Racing Apex', 'Luxe Race'],
  editorialKeywords: ['courses automobiles', 'racing premium', 'ingénierie de course', 'luxe race'] as string[],
  locale: 'fr_FR',
  language: 'fr',
  email: 'editorial@example.com',
  social: {
    x: 'https://x.com/example',
    instagram: 'https://instagram.com/example',
    youtube: 'https://youtube.com/@example'
  }
} as const;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).toString();
