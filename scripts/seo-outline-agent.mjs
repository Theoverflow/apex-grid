import { mkdir, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';
import { AI_POLICY, buildOutline, maybeEnrichWithLlm } from './seo-ai-lib.mjs';

const outlines = config.strategicTopics.map((topic) => buildOutline(topic));

const llm = await maybeEnrichWithLlm(
  { outlines },
  {
    system:
      'Tu es un chef d’édition motorsport. Enrichis les outlines en français. Interdiction d’inventer des résultats, classements ou citations. Garde un ton premium factuel.',
    user: `Enrichis ces outlines SEO/éditoriaux:\n${JSON.stringify(outlines, null, 2)}`
  }
);

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  outlines,
  llm,
  schemaHints: outlines.map((outline) => ({
    route: outline.targetRoute,
    recommendedTypes: ['Article', 'BreadcrumbList', 'FAQPage'],
    note: 'FAQPage uniquement si les Q/R sont visibles dans le HTML publié.'
  }))
};

await mkdir('reports', { recursive: true });
await writeFile('reports/seo-outlines.json', JSON.stringify(output, null, 2));
await writeFile(
  'reports/seo-outlines.md',
  `# Outlines éditoriaux IA

Generated: ${output.generatedAt}

${outlines
  .map(
    (outline) => `## ${outline.phrase}
Route: ${outline.targetRoute}
H1: ${outline.h1}

${outline.sections.map((section) => `- **${section.heading}**: ${section.purpose}`).join('\n')}

FAQ drafts:
${outline.faqDrafts.map((faq) => `- ${faq.question}`).join('\n')}
`
  )
  .join('\n')}
`
);

console.log(JSON.stringify({ outlines: outlines.length, llm: llm.enriched }));
