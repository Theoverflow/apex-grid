import { articles } from '@/lib/data';
import { absoluteUrl, siteConfig } from '@/lib/site';
export const revalidate = 3600;
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!);
export function GET() {
  const items = articles.map((article) => `<item><title>${escapeXml(article.title)}</title><link>${absoluteUrl(`/news/${article.slug}`)}</link><guid isPermaLink="true">${absoluteUrl(`/news/${article.slug}`)}</guid><description>${escapeXml(article.excerpt)}</description><pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><description>${escapeXml(siteConfig.description)}</description><language>fr-FR</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
