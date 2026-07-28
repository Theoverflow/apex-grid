import { mkdir, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';
import { AI_POLICY, keywordDensity } from './seo-ai-lib.mjs';

const briefs = config.strategicTopics.map((topic) => {
  const sample = `${topic.phrase}. ${topic.intent}. Analyse éditoriale Apex Grid.`;
  return {
    id: topic.id,
    primaryPhrase: topic.phrase,
    searchIntent: topic.intent,
    targetRoute: topic.destination,
    entityHints: [config.brand, 'course automobile', 'ingénierie', topic.phrase],
    densityGuardrail: {
      sampleDensity: keywordDensity(sample, topic.phrase),
      rule: 'Ne pas forcer la densité: une occurrence naturelle du thème de marque suffit.'
    },
    editorialRequirements: [
      'Répondre à une intention réelle et identifiable.',
      'Inclure des données ou observations originales vérifiables.',
      'Citer les sources primaires et dater les informations.',
      'Séparer clairement faits, hypothèses et opinion éditoriale.',
      'Ajouter des liens internes utiles, sans ancre forcée.',
      'Faire relire les données sportives avant publication.',
      'Aligner title, H1, description et JSON-LD sur le contenu visible.'
    ],
    structuredDataChecklist: ['Article ou WebPage', 'BreadcrumbList', 'FAQPage seulement si FAQ visible'],
    onPageChecklist: [
      '1 H1 descriptif',
      'canonical auto-référent',
      'OG/Twitter complets',
      'images avec alt factuel',
      'maillage vers championnats/événements/équipes'
    ],
    prohibited: [
      'page satellite',
      'texte caché',
      'bourrage de mots-clés',
      'faux avis',
      'données inventées',
      'publication automatique sans validation'
    ],
    suggestedAngles:
      topic.id === 'racing-apex'
        ? [
            'Analyse du point de corde par type de virage',
            'Compromis vitesse minimale et sortie de courbe',
            'Comparaison télémétrique documentée'
          ]
        : topic.id === 'luxe-race'
          ? [
              'Design et matériaux du sport automobile premium',
              'Hospitalité et expérience circuit',
              'Patrimoine des constructeurs'
            ]
          : ['Présentation de la mission éditoriale', 'Méthodologie de vérification', 'Couverture des championnats'],
    status: 'draft-brief-needs-human-validation'
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  briefs
};

await mkdir('reports', { recursive: true });
await writeFile('reports/content-briefs.json', JSON.stringify(output, null, 2));
await writeFile(
  'reports/content-briefs.md',
  `# Content briefs IA

Generated: ${output.generatedAt}

${briefs
  .map(
    (brief) => `## ${brief.primaryPhrase}
- Intent: ${brief.searchIntent}
- Route: ${brief.targetRoute}
- Angles: ${brief.suggestedAngles.join('; ')}
- Status: ${brief.status}`
  )
  .join('\n\n')}
`
);

console.log(`Generated ${briefs.length} reviewed-content briefs.`);
