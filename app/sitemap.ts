import type { MetadataRoute } from 'next';
import { articles, events, teams } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ['', '/championships', '/guides/racing-apex', '/legal/privacy'].map((path) => ({ url: absoluteUrl(path || '/'), lastModified: new Date('2026-07-27'), changeFrequency: 'weekly' as const, priority: path === '' ? 1 : .7 }));
  const eventUrls = events.map(x => ({ url: absoluteUrl(`/events/${x.slug}`), lastModified: new Date('2026-07-27'), changeFrequency: 'weekly' as const, priority: .8 }));
  const teamUrls = teams.map(x => ({ url: absoluteUrl(`/teams/${x.slug}`), lastModified: new Date('2026-07-27'), changeFrequency: 'monthly' as const, priority: .7 }));
  const articleUrls = articles.map(x => ({ url: absoluteUrl(`/news/${x.slug}`), lastModified: new Date(x.updatedAt), changeFrequency: 'monthly' as const, priority: .75 }));
  return [...fixed, ...eventUrls, ...teamUrls, ...articleUrls];
}
