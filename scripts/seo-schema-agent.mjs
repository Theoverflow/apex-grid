import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { AI_POLICY } from './seo-ai-lib.mjs';

const reportPath = process.env.SEO_REPORT_PATH || 'reports/seo-report.json';
let pages = [];
try {
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  pages = report.pages || report.results || [];
} catch {
  pages = [];
}

function recommendedTypes(url, existing = []) {
  const path = new URL(url).pathname;
  const recommended = new Set(['BreadcrumbList']);
  if (path === '/') recommended.add('WebSite').add('Organization');
  if (path.startsWith('/news/') || path.startsWith('/guides/')) recommended.add('Article');
  if (path.startsWith('/events/')) recommended.add('SportsEvent');
  if (path === '/search') recommended.clear();
  const missing = [...recommended].filter((type) => !existing.includes(type));
  return { recommended: [...recommended], missing, existing };
}

const recommendations = pages.map((page) => {
  const schema = recommendedTypes(page.url, page.jsonLdTypes || []);
  return {
    url: page.url,
    ...schema,
    action: schema.missing.length
      ? 'Ajouter les types manquants uniquement s’ils correspondent au contenu visible'
      : 'Schema OK pour les heuristiques actuelles',
    status: 'suggestion-only'
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  sourceReport: reportPath,
  recommendations
};

await mkdir('reports', { recursive: true });
await writeFile('reports/seo-schema-hints.json', JSON.stringify(output, null, 2));
await writeFile(
  'reports/seo-schema-hints.md',
  `# Schema / JSON-LD hints

Generated: ${output.generatedAt}

${recommendations
  .map((item) => `- ${item.url}: missing [${item.missing.join(', ') || 'none'}]`)
  .join('\n') || '- Run seo:agent first'}
`
);

console.log(JSON.stringify({ schemaHints: recommendations.length }));
