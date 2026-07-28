import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = ['app/robots.ts', 'app/sitemap.ts', 'app/layout.tsx', 'app/not-found.tsx', 'public/og-default.svg', 'components.json', 'AGENTS.md', 'seo.config.mjs', 'scripts/seo-agent.mjs'];
const failures = [];
for (const file of required) {
  try { await readFile(path.join(root, file), 'utf8'); } catch { failures.push(`Missing required SEO file: ${file}`); }
}
const layout = await readFile(path.join(root, 'app/layout.tsx'), 'utf8');
for (const token of ['metadataBase', 'alternates', 'openGraph', 'robots']) {
  if (!layout.includes(token)) failures.push(`Root metadata is missing: ${token}`);
}
const entries = await readdir(path.join(root, 'app'));
if (!entries.includes('search')) failures.push('Search route missing');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('SEO static audit passed.');
