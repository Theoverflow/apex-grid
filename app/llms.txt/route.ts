import { articles, events, teams } from '@/lib/data';
import { absoluteUrl, siteConfig } from '@/lib/site';
export const revalidate = 86400;
export function GET() {
  const body = [`# ${siteConfig.name}`, '', `> ${siteConfig.description}`, '', '## Canonical sections', `- [Championnats](${absoluteUrl('/championships')})`, ...events.map((x) => `- [${x.name}](${absoluteUrl(`/events/${x.slug}`)})`), ...teams.map((x) => `- [${x.name}](${absoluteUrl(`/teams/${x.slug}`)})`), ...articles.map((x) => `- [${x.title}](${absoluteUrl(`/news/${x.slug}`)})`), '', 'This file is an optional discovery aid. Canonical HTML, robots directives and sitemaps remain authoritative.'].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, s-maxage=86400' } });
}
