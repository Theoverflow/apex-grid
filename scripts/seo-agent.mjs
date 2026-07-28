import { mkdir, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';

const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
if (!baseUrl) {
  console.error('BASE_URL is required, for example BASE_URL=https://www.apex-grid.fr npm run seo:agent');
  process.exit(2);
}

const failures = [];
const warnings = [];
const pages = [];
const normalize = (value = '') => value.replace(/\s+/g, ' ').trim();
const matches = (html, re) => [...html.matchAll(re)].map((m) => normalize(m[1] ?? ''));
const urlFor = (path) => new URL(path, `${baseUrl}/`).toString();

async function fetchText(url) {
  const started = performance.now();
  const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'ApexGridSEOAgent/1.0 (+site quality audit)' } });
  const elapsedMs = Math.round(performance.now() - started);
  return { response, text: await response.text(), elapsedMs };
}

const sitemapResult = await fetchText(urlFor('/sitemap.xml'));
if (!sitemapResult.response.ok) failures.push(`Sitemap unavailable: ${sitemapResult.response.status}`);
const sitemapUrls = matches(sitemapResult.text, /<loc>(.*?)<\/loc>/g);
const candidateUrls = [...new Set([baseUrl + '/', ...sitemapUrls])];

for (const url of candidateUrls) {
  const { response, text: html, elapsedMs } = await fetchText(url);
  const title = matches(html, /<title[^>]*>(.*?)<\/title>/gis)[0] ?? '';
  const description = matches(html, /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["'][^>]*>/gis)[0]
    || matches(html, /<meta[^>]+content=["'](.*?)["'][^>]+name=["']description["'][^>]*>/gis)[0] || '';
  const canonicals = matches(html, /<link[^>]+rel=["']canonical["'][^>]+href=["'](.*?)["'][^>]*>/gis);
  const h1s = matches(html, /<h1[^>]*>(.*?)<\/h1>/gis).map((x) => x.replace(/<[^>]+>/g, ''));
  const internalLinks = matches(html, /<a[^>]+href=["'](.*?)["'][^>]*>/gis).filter((href) => href.startsWith('/') || href.startsWith(baseUrl));
  const jsonLd = matches(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
  const issues = [];
  if (response.status !== 200) issues.push(`HTTP ${response.status}`);
  if (title.length < config.limits.titleMin || title.length > config.limits.titleMax) issues.push(`title length ${title.length}`);
  if (description.length < config.limits.descriptionMin || description.length > config.limits.descriptionMax) issues.push(`description length ${description.length}`);
  if (canonicals.length !== 1) issues.push(`${canonicals.length} canonical(s)`);
  if (h1s.length !== 1) issues.push(`${h1s.length} H1`);
  if (internalLinks.length < config.limits.internalLinksMin) issues.push(`${internalLinks.length} internal links`);
  if (!jsonLd.length) issues.push('missing JSON-LD');
  if (elapsedMs > config.limits.responseMsMax) warnings.push(`${url}: response ${elapsedMs} ms`);
  for (const block of jsonLd) {
    try { JSON.parse(block.replaceAll('&quot;', '"')); } catch { issues.push('invalid JSON-LD JSON'); }
  }
  if (issues.length) failures.push(`${url}: ${issues.join(', ')}`);
  pages.push({ url, status: response.status, elapsedMs, title, descriptionLength: description.length, canonical: canonicals[0] ?? null, h1: h1s[0] ?? null, internalLinks: internalLinks.length, jsonLdBlocks: jsonLd.length, issues });
}

const robots = await fetchText(urlFor('/robots.txt'));
if (!robots.response.ok || !robots.text.includes('Sitemap:')) failures.push('robots.txt missing or does not advertise sitemap');
if (robots.text.toLowerCase().includes('disallow: /\n')) failures.push('robots.txt blocks the entire site');

for (const topic of config.strategicTopics) {
  const destination = pages.find((page) => new URL(page.url).pathname === topic.destination || (topic.destination === '/news' && new URL(page.url).pathname.startsWith('/news/')));
  if (!destination) warnings.push(`No crawlable destination found for strategic topic: ${topic.phrase}`);
}

const report = { generatedAt: new Date().toISOString(), baseUrl, config, summary: { pages: pages.length, failures: failures.length, warnings: warnings.length }, failures, warnings, pages };
await mkdir('reports', { recursive: true });
await writeFile('reports/seo-report.json', JSON.stringify(report, null, 2));
await writeFile('reports/seo-report.md', `# Apex Grid SEO agent report\n\nGenerated: ${report.generatedAt}\n\n- Pages: ${pages.length}\n- Failures: ${failures.length}\n- Warnings: ${warnings.length}\n\n## Failures\n${failures.length ? failures.map((x) => `- ${x}`).join('\n') : '- None'}\n\n## Warnings\n${warnings.length ? warnings.map((x) => `- ${x}`).join('\n') : '- None'}\n`);
console.log(JSON.stringify(report.summary));
if (failures.length) process.exit(1);
