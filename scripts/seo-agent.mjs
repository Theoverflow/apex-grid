import { mkdir, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';
import { auditSite } from './seo-core.mjs';
import { scorePage } from './seo-ai-lib.mjs';

const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
if (!baseUrl) {
  console.error('BASE_URL is required, for example BASE_URL=https://www.apex-grid.fr npm run seo:agent');
  process.exit(2);
}

const report = await auditSite(baseUrl, {
  limits: config.limits,
  requiredRoutes: config.requiredRoutes,
  userAgent: 'ApexGridSEOAgent/1.0 (+site quality audit)',
  redirect: 'follow',
  deep: process.env.DEEP_SEO !== '0',
  maxUrls: Number(process.env.MAX_URLS || config.limits.maxUrls)
});

const failures = [
  ...report.globalIssues,
  ...report.results.filter((page) => page.issues?.length).map((page) => `${page.url}: ${page.issues.join(', ')}`)
];
const warnings = [...report.warnings];

for (const topic of config.strategicTopics) {
  const destination = report.results.find((page) => {
    try {
      const pathname = new URL(page.url).pathname;
      return pathname === topic.destination || (topic.destination === '/news' && pathname.startsWith('/news/'));
    } catch {
      return false;
    }
  });
  if (!destination) warnings.push(`No crawlable destination found for strategic topic: ${topic.phrase}`);
}

const pages = report.results.map((page) => ({
  ...page,
  score: scorePage(page, config.limits)
}));

const agentReport = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  config,
  deep: report.deep,
  summary: {
    pages: pages.length,
    failures: failures.length,
    warnings: warnings.length,
    avgScore: pages.length
      ? Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length)
      : 0,
    orphans: report.orphans?.length || 0,
    brokenLinks: report.brokenLinks?.length || 0,
    duplicateTitles: report.duplicateTitles?.length || 0
  },
  failures,
  warnings,
  orphans: report.orphans,
  brokenLinks: report.brokenLinks,
  duplicateTitles: report.duplicateTitles,
  duplicateDescriptions: report.duplicateDescriptions,
  pages
};

await mkdir('reports', { recursive: true });
await writeFile('reports/seo-report.json', JSON.stringify(agentReport, null, 2));
await writeFile(
  'reports/seo-report.md',
  `# Apex Grid SEO agent report

Generated: ${agentReport.generatedAt}

- Pages: ${agentReport.summary.pages}
- Failures: ${agentReport.summary.failures}
- Warnings: ${agentReport.summary.warnings}
- Avg score: ${agentReport.summary.avgScore}
- Orphans: ${agentReport.summary.orphans}
- Broken links (deep): ${agentReport.summary.brokenLinks}
- Duplicate titles: ${agentReport.summary.duplicateTitles}
- Deep mode: ${agentReport.deep ? 'on' : 'off'}

## Failures
${failures.length ? failures.map((x) => `- ${x}`).join('\n') : '- None'}

## Warnings
${warnings.length ? warnings.map((x) => `- ${x}`).join('\n') : '- None'}
`
);

console.log(JSON.stringify(agentReport.summary));
if (failures.length) process.exit(1);
