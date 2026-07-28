import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const limits = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'seo.limits.json'), 'utf8')
);
const requiredRoutes = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'seo.routes.json'), 'utf8')
);

export default {
  brand: 'Apex Grid',
  locale: 'fr-FR',
  strategicTopics: [
    { id: 'apex-grid', phrase: 'Apex Grid', intent: 'marque', destination: '/' },
    { id: 'luxe-race', phrase: 'luxe race', intent: 'univers premium de la course automobile', destination: '/' },
    {
      id: 'racing-apex',
      phrase: 'racing apex',
      intent: 'analyse technique et trajectoires de course',
      destination: '/guides/racing-apex'
    }
  ],
  requiredRoutes,
  excludedPrefixes: ['/api/', '/search'],
  limits
};
