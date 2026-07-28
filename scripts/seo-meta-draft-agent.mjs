import { mkdir, readFile, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';
import { AI_POLICY, draftDescription, draftTitle, maybeEnrichWithLlm, scorePage } from './seo-ai-lib.mjs';

const reportPath = process.env.SEO_REPORT_PATH || 'reports/seo-report.json';
let pages = [];
try {
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  pages = report.pages || report.results || [];
} catch {
  pages = [];
}

const drafts = pages.map((page) => {
  const titleDraft = draftTitle({
    h1: page.h1,
    title: page.title,
    brand: config.brand,
    max: config.limits.titleMax
  });
  const descriptionDraft = draftDescription({
    description: page.description,
    h1: page.h1,
    min: config.limits.descriptionMin,
    max: config.limits.descriptionMax - 5
  });
  return {
    url: page.url,
    current: {
      title: page.title,
      description: page.description,
      score: scorePage(page, config.limits)
    },
    suggested: {
      title: titleDraft,
      description: descriptionDraft,
      titleLength: titleDraft.length,
      descriptionLength: descriptionDraft.length
    },
    status: 'draft-needs-human-review'
  };
});

const llm = await maybeEnrichWithLlm(
  { drafts: drafts.slice(0, 8) },
  {
    system:
      'Tu es un éditeur SEO motorsport premium. Propose uniquement des titres/descriptions en français, factuels, sans bourrage de mots-clés, sans inventer de résultats de course. Réponds en JSON.',
    user: `Améliore ces drafts meta sans dépasser les longueurs ${config.limits.titleMax}/${config.limits.descriptionMax}:\n${JSON.stringify(drafts.slice(0, 8), null, 2)}`
  }
);

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  sourceReport: reportPath,
  count: drafts.length,
  drafts,
  llm
};

await mkdir('reports', { recursive: true });
await writeFile('reports/seo-meta-drafts.json', JSON.stringify(output, null, 2));
await writeFile(
  'reports/seo-meta-drafts.md',
  `# Meta drafts (IA, relecture obligatoire)

Generated: ${output.generatedAt}

${drafts
  .slice(0, 20)
  .map(
    (item) => `## ${item.url}
- Score actuel: ${item.current.score}
- Titre proposé: ${item.suggested.title}
- Description proposée: ${item.suggested.description}`
  )
  .join('\n\n') || '- Aucune page: lancez d’abord `npm run seo:agent`'}
`
);

console.log(JSON.stringify({ metaDrafts: drafts.length, llm: llm.enriched }));
