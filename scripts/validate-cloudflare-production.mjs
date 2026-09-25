import fs from 'node:fs';

const required = [
  '.github/workflows/deploy-bauman-preview.yml',
  '.github/workflows/deploy-bauman-production.yml',
  '.github/workflows/cloudflare-production-ci.yml',
  'control-service/wrangler.production.example.jsonc',
  'wrangler.runtime.production.example.jsonc',
  'scripts/prepare-cloudflare-production.mjs',
  'scripts/validate-cloudflare-production.mjs',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing Bauman production scaffold: ${file}`);
}

const workflow = fs.readFileSync('.github/workflows/deploy-bauman-production.yml', 'utf8');
const ci = fs.readFileSync('.github/workflows/cloudflare-production-ci.yml', 'utf8');
const control = fs.readFileSync('control-service/wrangler.production.example.jsonc', 'utf8');
const runtime = fs.readFileSync('wrangler.runtime.production.example.jsonc', 'utf8');
const prepare = fs.readFileSync('scripts/prepare-cloudflare-production.mjs', 'utf8');

if (!workflow.includes('workflow_dispatch')) throw new Error('Production deploy must remain manual-only.');

if (workflow.includes('BAUMAN_CONTROL_PRODUCTION_SERVICE_SECRET')) {
  throw new Error('Bauman production deploy must not bind a second production control secret; Application Management owns the live shared secret.');
}
if (workflow.includes('wrangler secret put BAUMAN_CONTROL_SERVICE_SECRET')) {
  throw new Error('Bauman production deploy must preserve the existing Manager-owned BAUMAN_CONTROL_SERVICE_SECRET binding.');
}
if (/\n\s*push\s*:/.test(workflow.split('jobs:')[0])) throw new Error('Production deploy must never run automatically on push.');
for (const token of [
  'DEPLOY_PRODUCTION',
  'environment: bauman-production',
  'BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID',
  'BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID',
  'BAUMAN_CONTROL_PREVIEW_ORIGIN',
  'BAUMAN_RUNTIME_PREVIEW_ORIGIN',
  'BAUMAN_CONTROL_PRODUCTION_ORIGIN',
  'BAUMAN_RUNTIME_PRODUCTION_ORIGIN',
  'APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN',
  'Verify exact preview revision before production',
  'cloudflare-preview',
  'cloudflare-production',
  'revision !== expected',
  'Manager-owned BAUMAN_CONTROL_SERVICE_SECRET preserved',
  'CONTROL_TICKET_FORBIDDEN',
  'bauman-control-db --remote',
  'wrangler.production.jsonc',
  'wrangler.runtime.production.jsonc',
]) {
  if (!workflow.includes(token)) throw new Error(`Production workflow missing guard: ${token}`);
}

for (const token of [
  '"name": "bauman-control"',
  '"main": "src/cloudflare-preview.ts"',
  '"database_name": "bauman-control-db"',
  '__BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID__',
  '__APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN__',
  '__BAUMAN_RUNTIME_PRODUCTION_ORIGIN__',
  '"BAUMAN_DEPLOYMENT_CHANNEL": "cloudflare-production"',
]) {
  if (!control.includes(token)) throw new Error(`Production control template missing: ${token}`);
}

for (const token of [
  '"name": "bauman-master-ai"',
  '"main": "cloudflare/runtime-worker.mjs"',
  '"directory": "./runtime-dist"',
  '__BAUMAN_CONTROL_PRODUCTION_ORIGIN__',
  '"BAUMAN_DEPLOYMENT_CHANNEL": "cloudflare-production"',
]) {
  if (!runtime.includes(token)) throw new Error(`Production runtime template missing: ${token}`);
}

for (const token of [
  "uuidValue('BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID')",
  "uuidValue('BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID')",
  'productionD1 === previewD1',
  'allowChatgptSite',
  "exactHttpsOrigin('APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN', { allowChatgptSite: true })",
  "url.hostname.endsWith('.chatgpt.site')",
  'origins.size !== 5',
  'runtime-dist',
  'chunkJsonArray',
  'MAX_RUNTIME_ASSET_BYTES',
  'subjects/russian/assets/russian-future-ui.css',
  'subjects/russian/assets/russian-future-ui.js',
]) {
  if (!prepare.includes(token)) throw new Error(`Production materializer missing guard/package marker: ${token}`);
}

if (!ci.includes('wrangler deploy --dry-run')) throw new Error('Production CI must dry-run both Workers.');
if (!ci.includes('APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN: https://control-plane.example.chatgpt.site')) {
  throw new Error('Production CI must prove that only the Application Management control-plane may retain a ChatGPT Sites origin.');
}
if (prepare.includes("exactHttpsOrigin('BAUMAN_CONTROL_PRODUCTION_ORIGIN', { allowChatgptSite: true })")
  || prepare.includes("exactHttpsOrigin('BAUMAN_RUNTIME_PRODUCTION_ORIGIN', { allowChatgptSite: true })")
  || prepare.includes("exactHttpsOrigin('BAUMAN_CONTROL_PREVIEW_ORIGIN', { allowChatgptSite: true })")
  || prepare.includes("exactHttpsOrigin('BAUMAN_RUNTIME_PREVIEW_ORIGIN', { allowChatgptSite: true })")) {
  throw new Error('Bauman preview/production origins must never opt into ChatGPT Sites.');
}
if (ci.includes('wrangler d1 migrations apply bauman-control-db --remote')) throw new Error('Production CI must never mutate remote production D1.');
if (ci.includes('DEPLOY_PRODUCTION')) throw new Error('Production CI must not contain the live deployment confirmation token.');

console.log('Bauman production publish gate PASS: manual-only, exact-preview-first, isolated D1, Manager-owned shared secret preserved, production artifacts dry-run capable, no automatic production deployment.');
