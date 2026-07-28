import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const s3 = new S3Client({});
const sns = new SNSClient({});
const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 10000);

function absolute(base, value) {
  try { return new URL(value, base).toString(); } catch { return null; }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'ApexGridSEOHealthBot/1.0 (+https://apex-grid.fr/bot)' }
    });
    return { status: response.status, headers: Object.fromEntries(response.headers), text: await response.text(), finalUrl: response.url };
  } finally { clearTimeout(timer); }
}

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

function inspectHtml(url, page) {
  const title = page.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = page.text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1]?.trim() || '';
  const canonicalRaw = page.text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i)?.[1] || '';
  const canonical = absolute(url, canonicalRaw);
  const h1Count = (page.text.match(/<h1\b/gi) || []).length;
  const jsonLdCount = (page.text.match(/type=["']application\/ld\+json["']/gi) || []).length;
  const robots = page.text.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i)?.[1] || '';
  const issues = [];
  if (page.status !== 200) issues.push(`HTTP ${page.status}`);
  if (title.length < 15 || title.length > 65) issues.push(`title length ${title.length}`);
  if (description.length < 70 || description.length > 170) issues.push(`description length ${description.length}`);
  if (!canonical) issues.push('missing canonical');
  if (h1Count !== 1) issues.push(`H1 count ${h1Count}`);
  if (jsonLdCount < 1) issues.push('missing JSON-LD');
  if (/noindex/i.test(robots)) issues.push('unexpected noindex');
  if (!/lang=["']fr/i.test(page.text)) issues.push('missing French lang');
  return { url, finalUrl: page.finalUrl, status: page.status, title, description, canonical, h1Count, jsonLdCount, issues };
}

export const handler = async () => {
  const baseUrl = process.env.BASE_URL.replace(/\/$/, '');
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const startedAt = new Date().toISOString();
  const globalIssues = [];

  const [robots, sitemap] = await Promise.all([
    fetchText(`${baseUrl}/robots.txt`),
    fetchText(sitemapUrl)
  ]);
  if (robots.status !== 200) globalIssues.push(`robots.txt HTTP ${robots.status}`);
  if (/Disallow:\s*\//i.test(robots.text)) globalIssues.push('robots.txt blocks the entire site');
  if (!robots.text.includes(sitemapUrl)) globalIssues.push('robots.txt does not reference sitemap');
  if (sitemap.status !== 200) globalIssues.push(`sitemap.xml HTTP ${sitemap.status}`);

  const urls = extractUrls(sitemap.text).slice(0, Number(process.env.MAX_URLS || 100));
  const results = [];
  for (const url of urls) {
    try { results.push(inspectHtml(url, await fetchText(url))); }
    catch (error) { results.push({ url, issues: [String(error)] }); }
  }

  const failed = globalIssues.length > 0 || results.some((r) => r.issues?.length);
  const report = { startedAt, finishedAt: new Date().toISOString(), baseUrl, urlsChecked: results.length, failed, globalIssues, results };
  const key = `seo-reports/${startedAt.slice(0, 10)}/${Date.now()}.json`;
  await s3.send(new PutObjectCommand({ Bucket: process.env.REPORT_BUCKET, Key: key, Body: JSON.stringify(report, null, 2), ContentType: 'application/json' }));

  if (failed && process.env.ALERT_TOPIC_ARN) {
    await sns.send(new PublishCommand({ TopicArn: process.env.ALERT_TOPIC_ARN, Subject: 'Apex Grid SEO audit failed', Message: JSON.stringify({ key, globalIssues, failedPages: results.filter((r) => r.issues?.length).slice(0, 20) }, null, 2) }));
  }
  if (failed) throw new Error(`SEO audit failed; report s3://${process.env.REPORT_BUCKET}/${key}`);
  return report;
};
