import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { AI_POLICY, suggestInternalLinks } from './seo-ai-lib.mjs';

const reportPath = process.env.SEO_REPORT_PATH || 'reports/seo-report.json';
let pages = [];
try {
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  pages = report.pages || report.results || [];
} catch {
  pages = [];
}

const suggestions = pages.flatMap((page) =>
  suggestInternalLinks(page, pages, { max: 4 }).map((item) => ({
    ...item,
    status: 'suggestion-only'
  }))
);

const weakPages = pages
  .filter((page) => (page.internalLinks || 0) < 3)
  .map((page) => ({
    url: page.url,
    internalLinks: page.internalLinks || 0,
    recommended: suggestInternalLinks(page, pages, { max: 5 })
  }));

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  sourceReport: reportPath,
  suggestionCount: suggestions.length,
  weakPages,
  suggestions: suggestions.slice(0, 100)
};

await mkdir('reports', { recursive: true });
await writeFile('reports/seo-internal-links.json', JSON.stringify(output, null, 2));
await writeFile(
  'reports/seo-internal-links.md',
  `# Suggestions de maillage interne

Generated: ${output.generatedAt}

## Pages sous-maillées
${weakPages.length ? weakPages.map((page) => `- ${page.url} (${page.internalLinks} liens)`).join('\n') : '- Aucune'}

## Top suggestions
${output.suggestions
  .slice(0, 30)
  .map((item) => `- ${item.from} → ${item.to} (${item.score}) — ancre: ${item.anchorHint}`)
  .join('\n') || '- Lancez `npm run seo:agent` avant ce rapport'}
`
);

console.log(JSON.stringify({ suggestions: suggestions.length, weakPages: weakPages.length }));
