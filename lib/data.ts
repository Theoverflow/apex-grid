export type Championship = {
  slug: string;
  name: string;
  category: string;
  description: string;
  accent: string;
};

export type RaceEvent = {
  slug: string;
  name: string;
  championship: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  circuit: string;
  distanceKm: number;
  laps: number;
  summary: string;
};

export type Team = {
  slug: string;
  name: string;
  country: string;
  car: string;
  powertrain: string;
  summary: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  topic: string;
};

export const championships: Championship[] = [
  {
    slug: 'hypercar-world-series',
    name: 'Hypercar World Series',
    category: 'Endurance',
    description: 'Prototypes hybrides, stratégie énergétique et courses longues sur les circuits les plus exigeants.',
    accent: '01'
  },
  {
    slug: 'electric-velocity-cup',
    name: 'Electric Velocity Cup',
    category: 'Monoplaces électriques',
    description: 'Courses urbaines rapides, récupération d’énergie et ingénierie logicielle de pointe.',
    accent: '02'
  },
  {
    slug: 'grand-touring-masters',
    name: 'Grand Touring Masters',
    category: 'GT',
    description: 'Machines dérivées de la série, sprints nocturnes et batailles de constructeurs.',
    accent: '03'
  }
];

export const events: RaceEvent[] = [
  {
    slug: '24-heures-de-valdor',
    name: '24 Heures de Valdor',
    championship: 'Hypercar World Series',
    country: 'France',
    city: 'Valdor',
    startDate: '2026-09-12T14:00:00+02:00',
    endDate: '2026-09-13T14:00:00+02:00',
    circuit: 'Circuit de Valdor',
    distanceKm: 13.6,
    laps: 386,
    summary: 'Le rendez-vous d’endurance phare, disputé entre longues lignes droites et enchaînements à haute vitesse.'
  },
  {
    slug: 'e-prix-de-lumina',
    name: 'E-Prix de Lumina',
    championship: 'Electric Velocity Cup',
    country: 'Italie',
    city: 'Lumina',
    startDate: '2026-10-03T16:00:00+02:00',
    endDate: '2026-10-03T18:00:00+02:00',
    circuit: 'Circuito Cittadino Lumina',
    distanceKm: 2.9,
    laps: 42,
    summary: 'Un tracé urbain étroit où l’efficacité énergétique décide autant du résultat que la vitesse pure.'
  },
  {
    slug: 'night-gt-monaco',
    name: 'Monaco GT Night',
    championship: 'Grand Touring Masters',
    country: 'Monaco',
    city: 'Monte-Carlo',
    startDate: '2026-11-07T20:30:00+01:00',
    endDate: '2026-11-07T22:30:00+01:00',
    circuit: 'Circuit urbain de Monaco',
    distanceKm: 3.3,
    laps: 58,
    summary: 'Une course nocturne spectaculaire où précision, freinage et traction sont déterminants.'
  }
];

export const teams: Team[] = [
  {
    slug: 'veloce-rosso',
    name: 'Veloce Rosso',
    country: 'Italie',
    car: 'VR-X26',
    powertrain: 'V6 hybride biturbo',
    summary: 'Une équipe historique reconnue pour son efficacité aérodynamique et ses arrêts ultra-rapides.'
  },
  {
    slug: 'nordlicht-racing',
    name: 'Nordlicht Racing',
    country: 'Allemagne',
    car: 'NR9 ePerformance',
    powertrain: 'Transmission électrique intégrale',
    summary: 'Une structure d’ingénierie data-first qui optimise chaque relais à partir de télémétrie temps réel.'
  },
  {
    slug: 'atelier-onyx',
    name: 'Atelier Onyx',
    country: 'France',
    car: 'AO-7 LMH',
    powertrain: 'V8 hybride',
    summary: 'Un constructeur indépendant alliant fabrication artisanale, simulation avancée et vitesse de pointe.'
  }
];

export const articles: Article[] = [
  {
    slug: 'aero-active-hypercars-2026',
    title: 'Aérodynamique active : ce qui change réellement les hypercars en 2026',
    excerpt: 'Analyse des compromis entre appui, traînée, refroidissement et consommation sur un relais complet.',
    body: [
      'L’aérodynamique active permet d’adapter la voiture aux phases de freinage, de virage et de ligne droite. Son avantage ne se résume donc pas à une vitesse maximale supérieure.',
      'La performance dépend de la cohérence entre cartographie moteur, température des pneus, hauteur de caisse et fenêtres d’activation. Une solution agressive peut dégrader la stabilité si elle est mal intégrée.',
      'Pour les équipes, le gain principal vient souvent de la capacité à conserver une plateforme aérodynamique prévisible pendant toute la durée du relais.'
    ],
    publishedAt: '2026-07-18T08:00:00+02:00',
    updatedAt: '2026-07-22T14:30:00+02:00',
    author: 'Élise Martin',
    topic: 'Ingénierie'
  },
  {
    slug: 'strategie-double-stint-pneus',
    title: 'Pourquoi le double relais pneumatique redevient décisif',
    excerpt: 'Température, trafic et neutralisations : les paramètres qui font basculer une stratégie d’endurance.',
    body: [
      'Conserver un train de pneus réduit le temps passé dans les stands, mais augmente l’exposition à la dégradation thermique et mécanique.',
      'Le choix devient particulièrement rentable lorsque la piste se gomme, que les températures baissent et que le pilote peut gérer le trafic sans sursolliciter l’essieu avant.',
      'Les simulations modernes intègrent désormais la probabilité de neutralisation et la perte de performance liée à chaque dépassement.'
    ],
    publishedAt: '2026-07-09T09:30:00+02:00',
    updatedAt: '2026-07-09T09:30:00+02:00',
    author: 'Nicolas Rey',
    topic: 'Stratégie'
  }
];

export function findBySlug<T extends { slug: string }>(items: readonly T[], slug: string): T | undefined {
  return items.find((item) => item.slug === slug);
}
