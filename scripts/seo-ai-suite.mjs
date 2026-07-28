import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { AI_POLICY } from './seo-ai-lib.mjs';

function run(script, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      stdio: 'inherit',
      env: { ...process.env, ...env }
    });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
const steps = [];
let exitCode = 0;

await mkdir('reports', { recursive: true });

steps.push({ name: 'seo:briefs', code: await run('scripts/content-brief-agent.mjs') });
steps.push({ name: 'seo:outlines', code: await run('scripts/seo-outline-agent.mjs') });

if (baseUrl) {
  const agentCode = await run('scripts/seo-agent.mjs', {
    BASE_URL: baseUrl,
    DEEP_SEO: process.env.DEEP_SEO || '1'
  });
  steps.push({ name: 'seo:agent', code: agentCode });
  if (agentCode !== 0) exitCode = agentCode;

  steps.push({ name: 'seo:meta-drafts', code: await run('scripts/seo-meta-draft-agent.mjs') });
  steps.push({ name: 'seo:links', code: await run('scripts/seo-link-agent.mjs') });
  steps.push({ name: 'seo:schema', code: await run('scripts/seo-schema-agent.mjs') });
  const regressionCode = await run('scripts/seo-regression-agent.mjs');
  steps.push({ name: 'seo:regression', code: regressionCode });
  if (regressionCode !== 0) exitCode = regressionCode;
} else {
  steps.push({ name: 'skipped-live-agents', code: 0, note: 'set BASE_URL for crawl + meta/link/schema/regression' });
}

const summary = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  baseUrl: baseUrl || null,
  steps,
  outputs: [
    'reports/content-briefs.json',
    'reports/content-briefs.md',
    'reports/seo-outlines.json',
    'reports/seo-outlines.md',
    ...(baseUrl
      ? [
          'reports/seo-report.json',
          'reports/seo-report.md',
          'reports/seo-meta-drafts.json',
          'reports/seo-meta-drafts.md',
          'reports/seo-internal-links.json',
          'reports/seo-internal-links.md',
          'reports/seo-schema-hints.json',
          'reports/seo-schema-hints.md',
          'reports/seo-regression.json',
          'reports/seo-regression.md'
        ]
      : [])
  ]
};

await writeFile('reports/seo-ai-suite.json', JSON.stringify(summary, null, 2));
await writeFile(
  'reports/seo-ai-suite.md',
  `# Apex Grid SEO AI suite

Generated: ${summary.generatedAt}

Mode: **draft / audit only** — aucune publication automatique.

## Steps
${steps.map((step) => `- ${step.name}: exit ${step.code}${step.note ? ` (${step.note})` : ''}`).join('\n')}

## Policy
Allowed: ${AI_POLICY.allowed.join(', ')}

Forbidden: ${AI_POLICY.forbidden.join(', ')}

## Optional LLM
Set \`SEO_AI_PROVIDER=openai|anthropic\` and \`SEO_AI_API_KEY\` to enrich meta/outlines. Heuristics remain the default free path.
`
);

console.log(JSON.stringify({ ok: exitCode === 0, steps: steps.length, baseUrl: Boolean(baseUrl), exitCode }));
process.exit(exitCode);
