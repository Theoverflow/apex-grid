#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lambdaDir = join(root, 'infra/seo-monitor/lambda');
const staging = join(root, 'infra/seo-monitor/.lambda-build');

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

cpSync(join(lambdaDir, 'index.mjs'), join(staging, 'index.mjs'));
cpSync(join(root, 'scripts/seo-core.mjs'), join(staging, 'seo-core.mjs'));
cpSync(join(root, 'seo.limits.json'), join(staging, 'seo.limits.json'));
cpSync(join(root, 'seo.routes.json'), join(staging, 'seo.routes.json'));
cpSync(join(lambdaDir, 'package.json'), join(staging, 'package.json'));

const lockfile = join(lambdaDir, 'package-lock.json');
if (existsSync(lockfile)) {
  cpSync(lockfile, join(staging, 'package-lock.json'));
  execSync('npm ci --omit=dev --no-audit --no-fund', { cwd: staging, stdio: 'inherit' });
  cpSync(join(staging, 'package-lock.json'), lockfile);
} else {
  execSync('npm install --omit=dev --no-audit --no-fund', { cwd: staging, stdio: 'inherit' });
  cpSync(join(staging, 'package-lock.json'), lockfile);
}

const zipPath = join(root, 'infra/seo-monitor/seo-monitor.zip');
rmSync(zipPath, { force: true });
execSync(`cd "${staging}" && zip -qr "${zipPath}" . -x "*.DS_Store"`, { stdio: 'inherit' });

writeFileSync(join(root, 'infra/seo-monitor/.lambda-build-stamp'), new Date().toISOString());
console.log(`Packaged Lambda artifact: ${zipPath}`);
