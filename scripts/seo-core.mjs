import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function loadLimits(explicitPath) {
  const candidates = [
    explicitPath,
    join(here, '../seo.limits.json'),
    join(here, 'seo.limits.json'),
    join(process.cwd(), 'seo.limits.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    } catch {
      /* try next */
    }
  }

  return {
    titleMin: 20,
    titleMax: 65,
    descriptionMin: 80,
    descriptionMax: 170,
    h1Exact: 1,
    internalLinksMin: 3,
    jsonLdMin: 1,
    responseMsMax: 2500,
    maxUrls: 100,
    requestTimeoutMs: 10000,
    thinContentWords: 120,
    maxMissingAlt: 0,
    maxHeadingSkips: 0,
    deepLinkSample: 40
  };
}

export function normalize(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function matches(html, re) {
  return [...html.matchAll(re)].map((m) => normalize(m[1] ?? ''));
}

export function absolute(base, value) {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

export function extractSitemapUrls(xml) {
  return matches(xml, /<loc>(.*?)<\/loc>/g);
}

export function stripTags(html = '') {
  return normalize(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
}

export function countWords(text = '') {
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractHeadings(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1].slice(1)),
    text: stripTags(m[2])
  }));
}

export function headingSkipCount(headings) {
  let skips = 0;
  let prev = 0;
  for (const heading of headings) {
    if (prev && heading.level > prev + 1) skips += 1;
    prev = heading.level;
  }
  return skips;
}

export function extractImages(html) {
  return [...html.matchAll(/<img\b([^>]*)>/gi)].map((m) => {
    const attrs = m[1];
    const src = attrs.match(/\bsrc=["']([^"']*)/i)?.[1] ?? '';
    const altMatch = attrs.match(/\balt=["']([^"']*)/i);
    return { src, alt: altMatch ? altMatch[1] : null, missingAlt: !altMatch };
  });
}

export function extractJsonLd(html) {
  const blocks = matches(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const parsed = [];
  const types = [];
  for (const block of blocks) {
    try {
      const data = JSON.parse(block.replaceAll('&quot;', '"'));
      parsed.push(data);
      const collect = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(collect);
          return;
        }
        if (node['@type']) {
          const value = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
          types.push(...value);
        }
        Object.values(node).forEach(collect);
      };
      collect(data);
    } catch {
      parsed.push({ invalid: true, raw: block.slice(0, 120) });
    }
  }
  return { blocks, parsed, types: [...new Set(types)] };
}

export async function fetchText(url, { timeoutMs = 10000, userAgent = 'ApexGridSEOHealthBot/1.0', redirect = 'follow' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: { 'user-agent': userAgent }
    });
    const text = await response.text();
    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers),
      text,
      finalUrl: response.url,
      elapsedMs: Math.round(performance.now() - started)
    };
  } finally {
    clearTimeout(timer);
  }
}

export function inspectHtml(url, page, limits, { requireIndexable = true, baseUrl } = {}) {
  const title = matches(page.text, /<title[^>]*>([\s\S]*?)<\/title>/gi)[0] ?? '';
  const description =
    matches(page.text, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/gi)[0] ||
    matches(page.text, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/gi)[0] ||
    '';
  const canonicals = matches(page.text, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/gi);
  const canonical = canonicals[0] ? absolute(url, canonicals[0]) : null;
  const h1s = matches(page.text, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((x) => stripTags(x));
  const headings = extractHeadings(page.text);
  const headingSkips = headingSkipCount(headings);
  const images = extractImages(page.text);
  const missingAlt = images.filter((img) => img.missingAlt).length;
  const jsonLd = extractJsonLd(page.text);
  const robots = matches(page.text, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/gi)[0] || '';
  const ogTitle = matches(page.text, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/gi)[0] || '';
  const ogDescription =
    matches(page.text, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/gi)[0] || '';
  const ogImage = matches(page.text, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/gi)[0] || '';
  const twitterCard = matches(page.text, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/gi)[0] || '';
  const hrefs = matches(page.text, /<a[^>]+href=["']([^"']*)/gi);
  const internalLinkHrefs = [
    ...new Set(
      hrefs
        .map((href) => absolute(url, href))
        .filter((href) => href && baseUrl && href.startsWith(baseUrl) && !href.includes('#'))
    )
  ];
  const bodyText = stripTags(page.text);
  const wordCount = countWords(bodyText);
  const soft404 =
    page.status === 200 &&
    (/page introuvable|not found|404/i.test(title) || /page introuvable|contenu introuvable/i.test(bodyText.slice(0, 400)));

  const issues = [];
  const warnings = [];

  if (page.status !== 200) issues.push(`HTTP ${page.status}`);
  if (title.length < limits.titleMin || title.length > limits.titleMax) {
    issues.push(`title length ${title.length}`);
  }
  if (description.length < limits.descriptionMin || description.length > limits.descriptionMax) {
    issues.push(`description length ${description.length}`);
  }
  if (canonicals.length !== 1 || !canonical) issues.push(`${canonicals.length || 0} canonical(s)`);
  if (h1s.length !== limits.h1Exact) issues.push(`H1 count ${h1s.length}`);
  if (jsonLd.blocks.length < limits.jsonLdMin) issues.push('missing JSON-LD');
  if (internalLinkHrefs.length < limits.internalLinksMin) {
    issues.push(`${internalLinkHrefs.length} internal links`);
  }
  if (requireIndexable && /noindex/i.test(robots)) issues.push('unexpected noindex');
  if (!/lang=["']fr/i.test(page.text)) issues.push('missing French lang');
  if (jsonLd.parsed.some((block) => block?.invalid)) issues.push('invalid JSON-LD JSON');
  if (soft404) issues.push('soft 404 heuristic');

  if (!ogTitle) warnings.push('missing og:title');
  if (!ogDescription) warnings.push('missing og:description');
  if (!ogImage) warnings.push('missing og:image');
  if (!twitterCard) warnings.push('missing twitter:card');
  if (wordCount < (limits.thinContentWords ?? 120)) warnings.push(`thin content (${wordCount} words)`);
  if (missingAlt > (limits.maxMissingAlt ?? 0)) warnings.push(`${missingAlt} images missing alt`);
  if (headingSkips > (limits.maxHeadingSkips ?? 0)) warnings.push(`${headingSkips} heading level skip(s)`);
  if (canonical && page.finalUrl && absolute(url, page.finalUrl) !== canonical) {
    warnings.push('canonical differs from final URL');
  }

  return {
    url,
    finalUrl: page.finalUrl,
    status: page.status,
    elapsedMs: page.elapsedMs,
    title,
    description,
    descriptionLength: description.length,
    canonical,
    h1: h1s[0] ?? null,
    h1Count: h1s.length,
    headings,
    headingSkips,
    images: images.length,
    missingAlt,
    jsonLdCount: jsonLd.blocks.length,
    jsonLdTypes: jsonLd.types,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    robots,
    wordCount,
    soft404,
    internalLinks: internalLinkHrefs.length,
    internalLinkHrefs,
    issues,
    warnings
  };
}

function findDuplicates(pages, key) {
  const map = new Map();
  for (const page of pages) {
    const value = normalize(page[key] || '');
    if (!value) continue;
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(page.url);
  }
  return [...map.entries()]
    .filter(([, urls]) => urls.length > 1)
    .map(([value, urls]) => ({ value, urls }));
}

export async function checkBrokenInternalLinks(pages, { timeoutMs, userAgent, sampleSize = 40 } = {}) {
  const hrefs = [...new Set(pages.flatMap((page) => page.internalLinkHrefs || []))].slice(0, sampleSize);
  const broken = [];
  for (const href of hrefs) {
    try {
      const page = await fetchText(href, { timeoutMs, userAgent, redirect: 'follow' });
      if (page.status >= 400) broken.push({ url: href, status: page.status });
    } catch (error) {
      broken.push({ url: href, status: 0, error: String(error?.message || error) });
    }
  }
  return broken;
}

export async function auditSite(baseUrl, options = {}) {
  const limits = options.limits ?? loadLimits(options.limitsPath);
  const maxUrls = Number(options.maxUrls ?? limits.maxUrls ?? 100);
  const timeoutMs = Number(options.timeoutMs ?? limits.requestTimeoutMs ?? 10000);
  const userAgent = options.userAgent ?? 'ApexGridSEOHealthBot/1.0 (+https://apex-grid.fr/bot)';
  const deep = options.deep ?? process.env.DEEP_SEO === '1';
  const startedAt = new Date().toISOString();
  const root = baseUrl.replace(/\/$/, '');
  const globalIssues = [];
  const warnings = [];

  const [robots, sitemap, health, llms] = await Promise.all([
    fetchText(`${root}/robots.txt`, { timeoutMs, userAgent }),
    fetchText(`${root}/sitemap.xml`, { timeoutMs, userAgent }),
    fetchText(`${root}/api/health`, { timeoutMs, userAgent }),
    fetchText(`${root}/llms.txt`, { timeoutMs, userAgent })
  ]);

  if (robots.status !== 200) globalIssues.push(`robots.txt HTTP ${robots.status}`);
  if (/Disallow:\s*\/\s*$/im.test(robots.text) || /disallow:\s*\/\n/i.test(robots.text)) {
    globalIssues.push('robots.txt blocks the entire site');
  }
  if (!/Sitemap:\s*\S+/i.test(robots.text)) globalIssues.push('robots.txt does not advertise sitemap');
  if (!robots.text.includes(`${root}/sitemap.xml`) && !/Sitemap:\s*https?:\/\//i.test(robots.text)) {
    globalIssues.push('robots.txt sitemap reference missing or incomplete');
  }
  if (sitemap.status !== 200) globalIssues.push(`sitemap.xml HTTP ${sitemap.status}`);
  if (health.status !== 200) globalIssues.push(`api/health HTTP ${health.status}`);
  if (llms.status !== 200) warnings.push(`llms.txt HTTP ${llms.status}`);

  const requiredRoutes = options.requiredRoutes ?? [];
  for (const route of requiredRoutes) {
    const requiredUrl = route.startsWith('http') ? route : `${root}${route.startsWith('/') ? route : `/${route}`}`;
    const probe =
      route === '/robots.txt' ? robots : route === '/sitemap.xml' ? sitemap : route === '/api/health' ? health : null;
    if (probe) {
      if (probe.status !== 200) globalIssues.push(`required route ${route} HTTP ${probe.status}`);
      continue;
    }
    try {
      const page = await fetchText(requiredUrl, { timeoutMs, userAgent, redirect: options.redirect ?? 'follow' });
      if (page.status !== 200) globalIssues.push(`required route ${route} HTTP ${page.status}`);
    } catch (error) {
      globalIssues.push(`required route ${route}: ${String(error?.message || error)}`);
    }
  }

  const sitemapUrls = extractSitemapUrls(sitemap.text);
  const requiredHtmlUrls = requiredRoutes
    .filter((route) => !['/robots.txt', '/sitemap.xml', '/api/health'].includes(route))
    .map((route) => `${root}${route === '/' ? '/' : route}`);
  const candidateUrls = [...new Set([`${root}/`, ...requiredHtmlUrls, ...sitemapUrls])].slice(0, maxUrls);
  const results = [];

  for (const url of candidateUrls) {
    try {
      const page = await fetchText(url, { timeoutMs, userAgent, redirect: options.redirect ?? 'follow' });
      const pathname = new URL(url).pathname;
      const requireIndexable = !pathname.startsWith('/api/') && pathname !== '/search';
      const inspected = inspectHtml(url, page, limits, { baseUrl: root, requireIndexable });
      if ((page.elapsedMs ?? 0) > limits.responseMsMax) {
        warnings.push(`${url}: response ${page.elapsedMs} ms`);
      }
      warnings.push(...(inspected.warnings || []).map((item) => `${url}: ${item}`));
      results.push(inspected);
    } catch (error) {
      results.push({ url, issues: [String(error?.message || error)], warnings: [], internalLinkHrefs: [] });
    }
  }

  const duplicateTitles = findDuplicates(results, 'title');
  const duplicateDescriptions = findDuplicates(results, 'description');
  if (duplicateTitles.length) {
    globalIssues.push(`duplicate titles: ${duplicateTitles.length} group(s)`);
  }
  if (duplicateDescriptions.length) {
    warnings.push(`duplicate descriptions: ${duplicateDescriptions.length} group(s)`);
  }

  const inbound = new Map(results.map((page) => [page.url.replace(/\/$/, '') || page.url, 0]));
  for (const page of results) {
    for (const href of page.internalLinkHrefs || []) {
      const key = href.replace(/\/$/, '') || href;
      if (inbound.has(key)) inbound.set(key, (inbound.get(key) || 0) + 1);
    }
  }
  const orphans = results
    .filter((page) => {
      const key = page.url.replace(/\/$/, '') || page.url;
      const path = new URL(page.url).pathname;
      return path !== '/' && (inbound.get(key) || 0) === 0;
    })
    .map((page) => page.url);
  if (orphans.length) warnings.push(`orphan pages (no inbound internal links): ${orphans.length}`);

  let brokenLinks = [];
  if (deep) {
    brokenLinks = await checkBrokenInternalLinks(results, {
      timeoutMs,
      userAgent,
      sampleSize: Number(limits.deepLinkSample || 40)
    });
    if (brokenLinks.length) globalIssues.push(`broken internal links sampled: ${brokenLinks.length}`);
  }

  const failedPages = results.filter((r) => r.issues?.length);
  const failed = globalIssues.length > 0 || failedPages.length > 0;

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    baseUrl: root,
    urlsChecked: results.length,
    failed,
    deep,
    globalIssues,
    warnings,
    failedPages,
    results,
    limits,
    requiredRoutes,
    duplicateTitles,
    duplicateDescriptions,
    orphans,
    brokenLinks
  };
}
