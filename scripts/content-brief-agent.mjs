import { mkdir, writeFile } from 'node:fs/promises';
import config from '../seo.config.mjs';

const briefs = config.strategicTopics.map((topic) => ({
  id: topic.id,
  primaryPhrase: topic.phrase,
  searchIntent: topic.intent,
  targetRoute: topic.destination,
  editorialRequirements: [
    'Répondre à une intention réelle et identifiable.',
    'Inclure des données ou observations originales vérifiables.',
    'Citer les sources primaires et dater les informations.',
    'Séparer clairement faits, hypothèses et opinion éditoriale.',
    'Ajouter des liens internes utiles, sans ancre forcée.',
    'Faire relire les données sportives avant publication.'
  ],
  prohibited: ['page satellite', 'texte caché', 'bourrage de mots-clés', 'faux avis', 'données inventées', 'publication automatique sans validation'],
  suggestedAngles: topic.id === 'racing-apex'
    ? ['Analyse du point de corde par type de virage', 'Compromis vitesse minimale et sortie de courbe', 'Comparaison télémétrique documentée']
    : topic.id === 'luxe-race'
      ? ['Design et matériaux du sport automobile premium', 'Hospitalité et expérience circuit', 'Patrimoine des constructeurs']
      : ['Présentation de la mission éditoriale', 'Méthodologie de vérification', 'Couverture des championnats']
}));
await mkdir('reports', { recursive: true });
await writeFile('reports/content-briefs.json', JSON.stringify({ generatedAt: new Date().toISOString(), briefs }, null, 2));
console.log(`Generated ${briefs.length} reviewed-content briefs.`);
