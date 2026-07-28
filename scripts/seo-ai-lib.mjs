/**
 * Deterministic SEO draft helpers + optional LLM enrichment.
 * Drafts never publish. Editorial validation remains mandatory (AGENTS.md).
 */

const STOPWORDS = new Set(
  'le la les un une des de du et ou à a au aux en pour par sur avec sans dans que qui dont est sont ce cette ces ne pas plus moins très tout tous toutes mon ma mes son sa ses nos vos leur leurs d une'.split(
    ' '
  )
);

export function tokenize(text = '') {
  return normalizeFr(text)
    .toLowerCase()
    .split(/[^a-z0-9àâäéèêëïîôùûüç-]+/i)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function normalizeFr(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function clip(text, max) {
  const value = normalizeFr(text);
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

export function keywordDensity(text, phrase) {
  const hay = normalizeFr(text).toLowerCase();
  const needle = normalizeFr(phrase).toLowerCase();
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = hay.indexOf(needle, idx)) !== -1) {
    count += 1;
    idx += needle.length;
  }
  const words = Math.max(tokenize(text).length, 1);
  return Number(((count * needle.split(/\s+/).length) / words).toFixed(4));
}

export function draftTitle({ h1, title, topic, brand = 'Apex Grid', max = 60 }) {
  const base = normalizeFr(h1 || title || topic || 'Analyse course');
  if (base.toLowerCase().includes(brand.toLowerCase())) return clip(base, max);
  return clip(`${base} | ${brand}`, max);
}

export function draftDescription({ description, excerpt, h1, topic, min = 110, max = 155 }) {
  const seed = normalizeFr(description || excerpt || `${h1 || topic}. Analyse technique et éditoriale vérifiée.`);
  let value = seed;
  if (value.length < min) {
    value = `${value} Contexte, données vérifiables et lecture terrain pour une audience motorsport premium.`;
  }
  return clip(value, max);
}

export function suggestInternalLinks(page, corpus, { max = 5 } = {}) {
  const tokens = new Set(tokenize(`${page.title || ''} ${page.h1 || ''} ${page.description || ''}`));
  return corpus
    .filter((candidate) => candidate.url !== page.url)
    .map((candidate) => {
      const candidateTokens = tokenize(`${candidate.title || ''} ${candidate.h1 || ''} ${candidate.description || ''}`);
      const overlap = candidateTokens.filter((token) => tokens.has(token)).length;
      return {
        from: page.url,
        to: candidate.url,
        score: overlap,
        anchorHint: candidate.h1 || candidate.title || candidate.url,
        rationale: overlap ? `${overlap} token(s) sémantiques partagés` : 'maillage structurel de secours'
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

export function buildOutline(topic) {
  return {
    id: topic.id,
    phrase: topic.phrase,
    intent: topic.intent,
    targetRoute: topic.destination,
    h1: topic.phrase.charAt(0).toUpperCase() + topic.phrase.slice(1),
    sections: [
      { heading: 'Définition et enjeu', purpose: 'Clarifier le concept pour un lecteur expert et curieux.' },
      { heading: 'Variables techniques', purpose: 'Lister les facteurs mesurables sans inventer de données.' },
      { heading: 'Lecture de cas', purpose: 'Illustrer avec un exemple vérifié ou explicitement hypothétique.' },
      { heading: 'Erreurs fréquentes', purpose: 'Corriger les idées reçues sans sensationalisme.' },
      { heading: 'À retenir', purpose: 'Synthèse actionnable et liens internes utiles.' }
    ],
    faqDrafts: [
      {
        question: `Qu’est-ce que ${topic.phrase} ?`,
        answerGuidance: 'Réponse factuelle courte, puis nuance technique.'
      },
      {
        question: `Comment analyser ${topic.phrase} sans biaiser les données ?`,
        answerGuidance: 'Méthode, sources, limites de l’interprétation.'
      }
    ],
    validationGate: [
      'Aucune donnée de course inventée',
      'Sources primaires citées',
      'Relecture humaine avant publication',
      'JSON-LD aligné sur le contenu visible'
    ]
  };
}

export function scorePage(page, limits) {
  let score = 100;
  score -= (page.issues?.length || 0) * 12;
  score -= (page.warnings?.length || 0) * 3;
  if ((page.wordCount || 0) < (limits.thinContentWords || 120)) score -= 8;
  if (!page.ogImage) score -= 4;
  if ((page.missingAlt || 0) > 0) score -= 4;
  return Math.max(0, Math.min(100, score));
}

export async function maybeEnrichWithLlm(payload, { system, user }) {
  const provider = (process.env.SEO_AI_PROVIDER || '').toLowerCase();
  const apiKey = process.env.SEO_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!provider || !apiKey) {
    return { provider: 'heuristic', enriched: false, payload };
  }

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.SEO_AI_MODEL || 'gpt-4.1-mini',
          temperature: 0.2,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ]
        })
      });
      if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { provider, enriched: true, text, payload };
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.SEO_AI_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system,
          messages: [{ role: 'user', content: user }]
        })
      });
      if (!response.ok) throw new Error(`Anthropic HTTP ${response.status}`);
      const data = await response.json();
      const text = data.content?.map((part) => part.text || '').join('\n') || '';
      return { provider, enriched: true, text, payload };
    }
  } catch (error) {
    return { provider, enriched: false, error: String(error?.message || error), payload };
  }

  return { provider, enriched: false, error: `Unsupported SEO_AI_PROVIDER=${provider}`, payload };
}

export const AI_POLICY = {
  mode: 'draft-only',
  allowed: [
    'technical audits',
    'content briefs',
    'meta drafts',
    'internal link suggestions',
    'outlines and FAQ drafts',
    'regression diffs',
    'IndexNow for real URL changes'
  ],
  forbidden: [
    'auto-publish',
    'doorway pages',
    'spun city pages',
    'hidden text',
    'keyword stuffing',
    'fake reviews',
    'fabricated race data',
    'link schemes'
  ]
};
