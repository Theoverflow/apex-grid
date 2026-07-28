import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AI_POLICY } from './seo-ai-lib.mjs';

const reportsDir = 'reports';
const currentPath = process.env.SEO_REPORT_PATH || join(reportsDir, 'seo-report.json');
const historyDir = join(reportsDir, 'history');

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

const current = await loadJson(currentPath);
if (!current) {
  console.error('No current SEO report found. Run npm run seo:agent first.');
  process.exit(2);
}

await mkdir(historyDir, { recursive: true });
const stamp = (current.generatedAt || current.startedAt || new Date().toISOString()).replace(/[:.]/g, '-');
const archivedPath = join(historyDir, `seo-report-${stamp}.json`);
await writeFile(archivedPath, JSON.stringify(current, null, 2));

const historyFiles = (await readdir(historyDir))
  .filter((name) => name.startsWith('seo-report-') && name.endsWith('.json'))
  .sort();
const previousPath = historyFiles.length > 1 ? join(historyDir, historyFiles[historyFiles.length - 2]) : null;
const previous = previousPath ? await loadJson(previousPath) : null;

function indexPages(report) {
  const pages = report.pages || report.results || [];
  return new Map(pages.map((page) => [page.url, page]));
}

const regressions = [];
const improvements = [];

if (previous) {
  const prevPages = indexPages(previous);
  const currPages = indexPages(current);
  for (const [url, page] of currPages) {
    const before = prevPages.get(url);
    if (!before) {
      regressions.push({ url, change: 'new-url-in-audit' });
      continue;
    }
    const beforeFail = (before.issues || []).length;
    const afterFail = (page.issues || []).length;
    if (afterFail > beforeFail) {
      regressions.push({
        url,
        change: 'more-issues',
        before: before.issues,
        after: page.issues
      });
    } else if (afterFail < beforeFail) {
      improvements.push({
        url,
        change: 'fewer-issues',
        before: before.issues,
        after: page.issues
      });
    }
  }

  const prevFailures = previous.summary?.failures ?? previous.globalIssues?.length ?? 0;
  const currFailures =
    current.summary?.failures ??
    (current.failures?.length || current.globalIssues?.length || 0);
  if (currFailures > prevFailures) {
    regressions.push({
      url: current.baseUrl,
      change: 'global-failure-count-up',
      before: prevFailures,
      after: currFailures
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  policy: AI_POLICY,
  currentPath,
  previousPath,
  archivedPath,
  regressions,
  improvements,
  summary: {
    regressions: regressions.length,
    improvements: improvements.length,
    compared: Boolean(previous)
  }
};

await mkdir(reportsDir, { recursive: true });
await writeFile(join(reportsDir, 'seo-regression.json'), JSON.stringify(output, null, 2));
await writeFile(
  join(reportsDir, 'seo-regression.md'),
  `# SEO regression report

Generated: ${output.generatedAt}
Compared: ${previous ? 'yes' : 'no (baseline archived)'}

## Regressions
${regressions.length ? regressions.map((item) => `- ${item.url}: ${item.change}`).join('\n') : '- None'}

## Improvements
${improvements.length ? improvements.map((item) => `- ${item.url}: ${item.change}`).join('\n') : '- None'}
`
);

console.log(JSON.stringify(output.summary));
if (regressions.some((item) => item.change === 'more-issues' || item.change === 'global-failure-count-up')) {
  process.exitCode = 1;
}
