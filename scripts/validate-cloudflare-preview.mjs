import fs from 'node:fs';

const required = [
  '.github/workflows/deploy-bauman-preview.yml',
  'wrangler.runtime.preview.example.jsonc',
  'cloudflare/runtime-worker.mjs',
  'scripts/prepare-cloudflare-preview.mjs',
  'control-service/wrangler.preview.example.jsonc',
  'control-service/src/cloudflare-preview.ts',
  'control-service/wrangler.local.jsonc',
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Thiếu Bauman Cloudflare preview scaffold: ${file}`);
}

const workflow = fs.readFileSync('.github/workflows/deploy-bauman-preview.yml', 'utf8');
const runtimeTemplate = fs.readFileSync('wrangler.runtime.preview.example.jsonc', 'utf8');
const controlTemplate = fs.readFileSync('control-service/wrangler.preview.example.jsonc', 'utf8');
const prepare = fs.readFileSync('scripts/prepare-cloudflare-preview.mjs', 'utf8');
const runtimeWorker = fs.readFileSync('cloudflare/runtime-worker.mjs', 'utf8');
const runtimeConfig = fs.readFileSync('assets/js/platform/runtime-config.js', 'utf8');
const deviceGate = fs.readFileSync('assets/js/platform/device-access-gate.js', 'utf8');
const localConfig = fs.readFileSync('control-service/wrangler.local.jsonc', 'utf8');

if (!workflow.includes('workflow_dispatch')) throw new Error('Bauman preview deploy phải manual-only.');
if (/\n\s*push\s*:/.test(workflow)) throw new Error('Bauman preview không được auto-deploy theo push.');
for (const token of [
  'DEPLOY_PREVIEW',
  'BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID',
  'BAUMAN_CONTROL_SERVICE_SECRET',
  'bauman-control-preview-db --remote',
  'wrangler.runtime.preview.jsonc',
  'bauman-control-preview',
  'bauman-master-ai-preview',
]) {
  if (!workflow.includes(token)) throw new Error(`Bauman preview workflow thiếu: ${token}`);
}
if (workflow.includes('bauman-control-local --remote')) throw new Error('Bauman preview tuyệt đối không migrate local D1 qua remote.');

for (const token of [
  '"name": "bauman-control-preview"',
  '"main": "src/cloudflare-preview.ts"',
  '"database_name": "bauman-control-preview-db"',
  '"binding": "DB"',
  '__BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID__',
  '__APPLICATION_MANAGEMENT_PREVIEW_ORIGIN__',
  '__BAUMAN_RUNTIME_PREVIEW_ORIGIN__',
  '__BAUMAN_BUILD_REVISION__',
]) {
  if (!controlTemplate.includes(token)) throw new Error(`Bauman Control preview template thiếu: ${token}`);
}
if (controlTemplate.includes('00000000-0000-0000-0000-000000000002')) throw new Error('Control preview template chứa local D1 placeholder.');

for (const token of [
  '"name": "bauman-master-ai-preview"',
  '"main": "cloudflare/runtime-worker.mjs"',
  '"binding": "ASSETS"',
  '"directory": "./runtime-dist"',
  '__BAUMAN_CONTROL_PREVIEW_ORIGIN__',
  '__BAUMAN_BUILD_REVISION__',
]) {
  if (!runtimeTemplate.includes(token)) throw new Error(`Bauman runtime preview template thiếu: ${token}`);
}

for (const marker of [
  'BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID',
  '00000000-0000-0000-0000-000000000002',
  '.chatgpt.site',
  'runtime-dist',
  'fs.cpSync',
]) {
  if (!prepare.includes(marker)) throw new Error(`Bauman preview materializer thiếu guard: ${marker}`);
}

for (const marker of ['HTMLRewriter', 'bauman-control-origin', '/__deployment', 'BAUMAN_CONTROL_ORIGIN']) {
  if (!runtimeWorker.includes(marker)) throw new Error(`Bauman runtime Worker thiếu: ${marker}`);
}
if (!runtimeConfig.includes("local ? 'http://127.0.0.1:3003' : (injected || declared)")) {
  throw new Error('Bauman runtime phải giữ local control endpoint và production/preview origin được inject.');
}
if (/\.chatgpt\.site|learning-management\.boiech-ai\.workers\.dev/.test(runtimeConfig)) {
  throw new Error('Bauman runtime config không được hard-code ChatGPT Sites hoặc control-plane cũ.');
}
for (const marker of ['P-256', 'offlineGraceMs', '/api/device/register', '/api/device/challenge', '/api/device/verify', '/api/device/heartbeat']) {
  if (!deviceGate.includes(marker)) throw new Error(`Learning access gate thiếu device-control v4 marker: ${marker}`);
}

if (!localConfig.includes('"name": "bauman-control-local"') || !localConfig.includes('00000000-0000-0000-0000-000000000002')) {
  throw new Error('Bauman local runtime phải tiếp tục dùng D1 local riêng.');
}

console.log('Bauman Cloudflare migration gate PASS: Control + Learning Runtime separated, preview manual-only, isolated D1, device gate preserved, no ChatGPT Sites fallback.');
