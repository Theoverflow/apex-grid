export default {
  brand: 'Apex Grid',
  locale: 'fr-FR',
  strategicTopics: [
    { id: 'apex-grid', phrase: 'Apex Grid', intent: 'marque', destination: '/' },
    { id: 'luxe-race', phrase: 'luxe race', intent: 'univers premium de la course automobile', destination: '/' },
    { id: 'racing-apex', phrase: 'racing apex', intent: 'analyse technique et trajectoires de course', destination: '/guides/racing-apex' }
  ],
  requiredRoutes: ['/', '/championships', '/robots.txt', '/sitemap.xml'],
  excludedPrefixes: ['/api/', '/search'],
  limits: {
    titleMin: 20,
    titleMax: 65,
    descriptionMin: 80,
    descriptionMax: 170,
    h1Max: 1,
    internalLinksMin: 3,
    responseMsMax: 2500
  }
};
