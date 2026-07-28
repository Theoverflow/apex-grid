const host = process.env.INDEXNOW_HOST;
const key = process.env.INDEXNOW_KEY;
const sitemapUrl = process.env.SITEMAP_URL || (host ? `https://${host}/sitemap.xml` : undefined);
if (!host || !key || !sitemapUrl) {
  console.error('INDEXNOW_HOST, INDEXNOW_KEY and optionally SITEMAP_URL are required.');
  process.exit(2);
}
const sitemap = await fetch(sitemapUrl);
if (!sitemap.ok) throw new Error(`Cannot read sitemap: HTTP ${sitemap.status}`);
const xml = await sitemap.text();
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).slice(0, 10000);
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/indexnow-key.txt`, urlList })
});
if (!response.ok) throw new Error(`IndexNow rejected request: HTTP ${response.status} ${await response.text()}`);
console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
