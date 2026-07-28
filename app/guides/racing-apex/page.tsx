import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { absoluteUrl, siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Racing apex : maîtriser le point de corde',
  description: 'Guide Apex Grid du racing apex : définition du point de corde, apex précoce ou tardif, compromis de trajectoire et lecture des données de course.',
  alternates: { canonical: '/guides/racing-apex' },
  openGraph: {
    type: 'article',
    url: absoluteUrl('/guides/racing-apex'),
    title: 'Racing apex : maîtriser le point de corde',
    description: 'Comprendre le point de corde et ses compromis techniques en course automobile.',
    images: ['/og-default.svg']
  }
};

const jsonLd = {
  '@type': 'Article',
  '@id': `${absoluteUrl('/guides/racing-apex')}#article`,
  headline: 'Racing apex : maîtriser le point de corde',
  description: 'Guide technique sur le choix du point de corde en course automobile.',
  datePublished: '2026-07-27',
  dateModified: '2026-07-27',
  inLanguage: 'fr-FR',
  mainEntityOfPage: absoluteUrl('/guides/racing-apex'),
  author: { '@id': `${siteConfig.url}/#organization` },
  publisher: { '@id': `${siteConfig.url}/#organization` },
  image: absoluteUrl('/og-default.svg')
};

export default function RacingApexGuidePage() {
  return (
    <article className="section shell prose-page">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ name: 'Accueil', path: '/' }, { name: 'Guides', path: '/guides/racing-apex' }, { name: 'Racing apex', path: '/guides/racing-apex' }]} />
      <div className="eyebrow">Guide technique Apex Grid</div>
      <h1>Racing apex : maîtriser le point de corde</h1>
      <p className="lead">Le racing apex, ou point de corde, est la zone où la trajectoire s’approche le plus de l’intérieur d’un virage. Son choix dépend moins d’une règle universelle que du virage suivant, de l’adhérence, de la puissance disponible et de l’objectif de la séquence.</p>

      <h2>Apex géométrique et apex de course</h2>
      <p>L’apex géométrique se situe au milieu théorique de l’arc. En compétition, le pilote décale souvent ce point. Un apex tardif privilégie la remise des gaz et la vitesse de sortie ; un apex précoce peut aider à défendre une position, mais augmente le risque d’élargir en sortie.</p>

      <h2>Les variables qui changent la trajectoire</h2>
      <ul>
        <li><strong>Enchaînement :</strong> la sortie du premier virage prépare l’entrée du suivant.</li>
        <li><strong>Adhérence :</strong> gomme, température, pluie et dépôts modifient la ligne utile.</li>
        <li><strong>Architecture :</strong> motricité, empattement, aérodynamique et différentiel influencent la rotation.</li>
        <li><strong>Contexte :</strong> tour lancé, gestion des pneus, dépassement ou défense n’imposent pas la même trajectoire.</li>
      </ul>

      <h2>Comment l’analyser avec la télémétrie</h2>
      <p>La position du volant seule ne suffit pas. Il faut rapprocher vitesse minimale, pression de frein, relâchement progressif, accélérateur, angle de lacet et vitesse de sortie. Une trajectoire plus longue peut être plus rapide si elle autorise une accélération plus précoce et stable.</p>

      <h2>Erreur fréquente</h2>
      <p>Viser systématiquement le vibreur intérieur confond repère visuel et objectif dynamique. Le meilleur apex est celui qui maximise la performance de la séquence complète sans dépasser les limites d’adhérence ni compromettre la sortie.</p>

      <p><Link className="text-link" href="/championships">Explorer les championnats suivis</Link></p>
    </article>
  );
}
