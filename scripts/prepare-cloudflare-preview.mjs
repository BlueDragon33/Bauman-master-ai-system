import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const LOCAL_D1_ID = '00000000-0000-0000-0000-000000000002';

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function exactHttpsOrigin(name) {
  const raw = required(name).replace(/\/$/, '');
  let url;
  try { url = new URL(raw); } catch { throw new Error(`${name} must be a valid URL.`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an exact HTTPS origin without path, query, credentials or fragment.`);
  }
  if (url.hostname.endsWith('.chatgpt.site')) throw new Error(`${name} must not point to ChatGPT Sites.`);
  return url.origin;
}

function uuidValue(name) {
  const value = required(name).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)) {
    throw new Error(`${name} must be a real D1 UUID.`);
  }
  return value;
}

function previewD1Id() {
  const value = uuidValue('BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID');
  if (value === LOCAL_D1_ID) throw new Error('Preview must never use the Bauman local D1 placeholder.');
  const production = uuidValue('BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID');
  if (value === production) throw new Error('Preview must never reuse the Bauman production D1 database.');
  return value;
}

function revision() {
  const value = String(process.env.GITHUB_SHA || process.env.BAUMAN_BUILD_REVISION || '').trim();
  if (!/^[0-9a-f]{7,64}$/i.test(value)) throw new Error('A Git revision is required for the preview deployment.');
  return value;
}

function materialize(templatePath, outputPath, replacements) {
  let source = fs.readFileSync(path.join(root, templatePath), 'utf8');
  for (const [token, value] of Object.entries(replacements)) {
    if (!source.includes(token)) throw new Error(`${templatePath} is missing placeholder ${token}.`);
    source = source.replaceAll(token, value);
  }
  if (/__[A-Z0-9_]+__/.test(source)) throw new Error(`${templatePath} still contains unresolved placeholders.`);
  fs.writeFileSync(path.join(root, outputPath), source);
}

const d1 = previewD1Id();
const applicationManagementOrigin = exactHttpsOrigin('APPLICATION_MANAGEMENT_PREVIEW_ORIGIN');
const controlOrigin = exactHttpsOrigin('BAUMAN_CONTROL_PREVIEW_ORIGIN');
const runtimeOrigin = exactHttpsOrigin('BAUMAN_RUNTIME_PREVIEW_ORIGIN');
const buildRevision = revision();

if (controlOrigin === runtimeOrigin) throw new Error('Bauman control and learning runtime preview origins must be separate Workers.');
if (applicationManagementOrigin === controlOrigin || applicationManagementOrigin === runtimeOrigin) {
  throw new Error('Application Management, Bauman Control, and Bauman learning runtime must remain separate origins.');
}

const runtimeDist = path.join(root, 'runtime-dist');
fs.rmSync(runtimeDist, { recursive: true, force: true });
fs.mkdirSync(runtimeDist, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(runtimeDist, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(runtimeDist, 'assets'), { recursive: true });

materialize('control-service/wrangler.preview.example.jsonc', 'control-service/wrangler.preview.jsonc', {
  '__APPLICATION_MANAGEMENT_PREVIEW_ORIGIN__': applicationManagementOrigin,
  '__BAUMAN_RUNTIME_PREVIEW_ORIGIN__': runtimeOrigin,
  '__BAUMAN_BUILD_REVISION__': buildRevision,
  '__BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID__': d1,
});
materialize('wrangler.runtime.preview.example.jsonc', 'wrangler.runtime.preview.jsonc', {
  '__BAUMAN_CONTROL_PREVIEW_ORIGIN__': controlOrigin,
  '__BAUMAN_BUILD_REVISION__': buildRevision,
});

const html = fs.readFileSync(path.join(runtimeDist, 'index.html'), 'utf8');
for (const resource of [
  'assets/css/main.css',
  'assets/css/device-access-gate.css',
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'assets/js/data.js',
  'assets/js/main.js',
  'assets/js/planning-main.js',
]) {
  if (!fs.existsSync(path.join(runtimeDist, resource))) throw new Error(`Runtime asset missing: ${resource}`);
}
if (!html.includes('assets/js/platform/runtime-config.js') || !html.includes('assets/js/platform/device-access-gate.js')) {
  throw new Error('Bauman runtime is missing the device-access bootstrap scripts.');
}

console.log('Bauman Cloudflare preview materialized safely.');
console.log(`Control Worker: bauman-control-preview -> ${controlOrigin}`);
console.log(`Learning Worker: bauman-master-ai-preview -> ${runtimeOrigin}`);
console.log('D1: bauman-control-preview-db (isolated preview database).');
