import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'app/robots.ts',
  'app/sitemap.ts',
  'app/layout.tsx',
  'app/not-found.tsx',
  'public/og-default.svg',
  'components.json',
  'AGENTS.md',
  'seo.config.mjs',
  'seo.limits.json',
  'seo.routes.json',
  'scripts/seo-agent.mjs',
  'scripts/seo-core.mjs',
  'scripts/seo-ai-lib.mjs',
  'scripts/seo-ai-suite.mjs',
  'scripts/seo-meta-draft-agent.mjs',
  'scripts/seo-link-agent.mjs',
  'scripts/seo-outline-agent.mjs',
  'scripts/seo-schema-agent.mjs',
  'scripts/seo-regression-agent.mjs',
  'infra/seo-monitor/main.tf',
  'infra/seo-monitor/lambda/index.mjs'
];
const failures = [];
for (const file of required) {
  try {
    await readFile(path.join(root, file), 'utf8');
  } catch {
    failures.push(`Missing required SEO file: ${file}`);
  }
}
const layout = await readFile(path.join(root, 'app/layout.tsx'), 'utf8');
for (const token of ['metadataBase', 'alternates', 'openGraph', 'robots']) {
  if (!layout.includes(token)) failures.push(`Root metadata is missing: ${token}`);
}
const entries = await readdir(path.join(root, 'app'));
if (!entries.includes('search')) failures.push('Search route missing');
if (!entries.includes('api')) failures.push('API health route tree missing');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('SEO static audit passed.');
