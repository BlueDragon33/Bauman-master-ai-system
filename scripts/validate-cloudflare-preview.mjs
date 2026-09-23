import fs from 'node:fs';

const required = [
  '.github/workflows/deploy-bauman-preview.yml',
  '.github/workflows/cloudflare-preview-ci.yml',
  'wrangler.runtime.preview.example.jsonc',
  'cloudflare/runtime-worker.mjs',
  'scripts/prepare-cloudflare-preview.mjs',
  'control-service/wrangler.preview.example.jsonc',
  'control-service/src/cloudflare-preview.ts',
  'control-service/wrangler.local.jsonc',
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'subjects/russian/index.html',
  'subjects/russian/assets/russian-future-ui.js',
  'subjects/russian/assets/russian-future-ui.css',
  'subjects/russian/assets/russian-optional-data-loader.js',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Thiếu Bauman Cloudflare preview scaffold: ${file}`);
}

const workflow = fs.readFileSync('.github/workflows/deploy-bauman-preview.yml', 'utf8');
const ciWorkflow = fs.readFileSync('.github/workflows/cloudflare-preview-ci.yml', 'utf8');
const runtimeTemplate = fs.readFileSync('wrangler.runtime.preview.example.jsonc', 'utf8');
const controlTemplate = fs.readFileSync('control-service/wrangler.preview.example.jsonc', 'utf8');
const prepare = fs.readFileSync('scripts/prepare-cloudflare-preview.mjs', 'utf8');
const runtimeWorker = fs.readFileSync('cloudflare/runtime-worker.mjs', 'utf8');
const runtimeConfig = fs.readFileSync('assets/js/platform/runtime-config.js', 'utf8');
const deviceGate = fs.readFileSync('assets/js/platform/device-access-gate.js', 'utf8');
const localConfig = fs.readFileSync('control-service/wrangler.local.jsonc', 'utf8');
const russianIndex = fs.readFileSync('subjects/russian/index.html', 'utf8');
const optionalLoader = fs.readFileSync('subjects/russian/assets/russian-optional-data-loader.js', 'utf8');

if (!workflow.includes('workflow_dispatch')) throw new Error('Bauman preview deploy phải manual-only.');
if (/\n\s*push\s*:/.test(workflow)) throw new Error('Bauman preview không được auto-deploy theo push.');
for (const token of [
  'DEPLOY_PREVIEW',
  'BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID',
  'BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID',
  'BAUMAN_CONTROL_SERVICE_SECRET',
  'bauman-control-preview-db --remote',
  'wrangler.runtime.preview.jsonc',
  'bauman-control-preview',
  'bauman-master-ai-preview',
  '/subjects/russian/',
  'russian-future-ui.css',
  'russian-optional-data-loader.js',
  'for dataset in dialogue-bauman-az deep-speaking-bauman',
  'data/chunks/$dataset/manifest.json',
]) {
  if (!workflow.includes(token)) throw new Error(`Bauman preview workflow thiếu: ${token}`);
}
if (workflow.includes('bauman-control-local --remote')) throw new Error('Bauman preview tuyệt đối không migrate local D1 qua remote.');

if (!ciWorkflow.includes('"subjects/**"')) throw new Error('Cloudflare preview CI phải chạy khi Subject Web Apps thay đổi.');
for (const token of [
  'runtime-dist/subjects/russian/index.html',
  'runtime-dist/subjects/russian/assets/russian-future-ui.js',
  'runtime-dist/subjects/russian/assets/russian-future-ui.css',
  'runtime-dist/subjects/russian/assets/russian-optional-data-loader.js',
  'runtime-dist/subjects/russian/data/chunks/dialogue-bauman-az/manifest.json',
  'runtime-dist/subjects/russian/data/chunks/deep-speaking-bauman/manifest.json',
]) {
  if (!ciWorkflow.includes(token)) throw new Error(`Cloudflare preview CI chưa kiểm tra subject package: ${token}`);
}

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
  "uuidValue('BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID')",
  '00000000-0000-0000-0000-000000000002',
  '.chatgpt.site',
  'runtime-dist',
  "fs.cpSync(path.join(root, 'assets')",
  "fs.cpSync(path.join(root, 'subjects')",
  'chunkJsonArray',
  'CHUNK_TARGET_BYTES',
  'MAX_RUNTIME_ASSET_BYTES',
  'json-array-chunks-v1',
  'assertRuntimeAssetSizes',
  'subjects/russian/assets/russian-optional-data-loader.js',
  'subjects/russian/data/chunks/dialogue-bauman-az/manifest.json',
  'subjects/russian/data/chunks/deep-speaking-bauman/manifest.json',
]) {
  if (!prepare.includes(marker)) throw new Error(`Bauman preview materializer thiếu guard/package marker: ${marker}`);
}

if (!russianIndex.includes('assets/russian-optional-data-loader.js') || russianIndex.indexOf('assets/russian-optional-data-loader.js') > russianIndex.indexOf('assets/core.js')) {
  throw new Error('Russian optional data loader phải được nạp trước core.js.');
}
for (const marker of ['dialogue-bauman-az.json','deep-speaking-bauman.json','json-array-chunks-v1','RUSSIAN_OPTIONAL_CHUNKS_V1']) {
  if (!optionalLoader.includes(marker)) throw new Error(`Russian optional data loader thiếu marker: ${marker}`);
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

console.log('Bauman Cloudflare migration gate PASS: Control + Learning Runtime separated, preview manual-only, isolated D1, Subject Web Apps packaged under /subjects/*, oversized Russian optional data chunked safely, device gate preserved, no ChatGPT Sites fallback.');
