import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const LOCAL_D1_ID = '00000000-0000-0000-0000-000000000002';
const CHUNK_TARGET_BYTES = 8 * 1024 * 1024;
const MAX_RUNTIME_ASSET_BYTES = 24 * 1024 * 1024;

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function exactHttpsOrigin(name, { allowChatgptSite = false } = {}) {
  const raw = required(name).replace(/\/$/, '');
  let url;
  try { url = new URL(raw); } catch { throw new Error(`${name} must be a valid URL.`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an exact HTTPS origin without path, query, credentials or fragment.`);
  }
  if (!allowChatgptSite && url.hostname.endsWith('.chatgpt.site')) {
    throw new Error(`${name} must not point to ChatGPT Sites.`);
  }
  return url.origin;
}

function uuidValue(name) {
  const value = required(name).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)) {
    throw new Error(`${name} must be a real D1 UUID.`);
  }
  return value;
}

function revision() {
  const value = String(process.env.GITHUB_SHA || process.env.BAUMAN_BUILD_REVISION || '').trim();
  if (!/^[0-9a-f]{40}$/i.test(value)) throw new Error('A full 40-character Git revision is required for production deployment.');
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

function chunkJsonArray(runtimeDist, relativePath) {
  const sourcePath = path.join(runtimeDist, relativePath);
  const dataset = path.basename(relativePath, '.json');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const data = JSON.parse(source);
  if (!Array.isArray(data)) throw new Error(`${relativePath} must be a JSON array before chunking.`);

  const chunkDir = path.join(path.dirname(sourcePath), 'chunks', dataset);
  fs.rmSync(chunkDir, { recursive: true, force: true });
  fs.mkdirSync(chunkDir, { recursive: true });

  const chunks = [];
  let current = [];
  let currentBytes = 2;

  function flush() {
    if (!current.length) return;
    const file = `part-${String(chunks.length + 1).padStart(3, '0')}.json`;
    const text = `[${current.join(',')}]`;
    const bytes = Buffer.byteLength(text);
    if (bytes > MAX_RUNTIME_ASSET_BYTES) throw new Error(`${relativePath} generated an oversized chunk: ${file} (${bytes} bytes).`);
    fs.writeFileSync(path.join(chunkDir, file), text);
    chunks.push({ file, count: current.length, bytes });
    current = [];
    currentBytes = 2;
  }

  for (const item of data) {
    const encoded = JSON.stringify(item);
    const itemBytes = Buffer.byteLength(encoded);
    if (itemBytes + 2 > MAX_RUNTIME_ASSET_BYTES) throw new Error(`${relativePath} contains one item too large for a Worker asset.`);
    const addedBytes = itemBytes + (current.length ? 1 : 0);
    if (current.length && currentBytes + addedBytes > CHUNK_TARGET_BYTES) flush();
    current.push(encoded);
    currentBytes += itemBytes + (current.length > 1 ? 1 : 0);
  }
  flush();

  fs.writeFileSync(path.join(chunkDir, 'manifest.json'), JSON.stringify({
    format: 'json-array-chunks-v1',
    dataset,
    source: relativePath.replaceAll('\\', '/'),
    count: data.length,
    targetBytes: CHUNK_TARGET_BYTES,
    chunks,
  }));
  fs.rmSync(sourcePath);
}

function assertRuntimeAssetSizes(dir) {
  const oversized = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const size = fs.statSync(full).size;
        if (size > MAX_RUNTIME_ASSET_BYTES) oversized.push(`${path.relative(dir, full)} (${size} bytes)`);
      }
    }
  };
  walk(dir);
  if (oversized.length) throw new Error(`Runtime assets exceed the 24 MiB safety limit:\n${oversized.join('\n')}`);
}

const productionD1 = uuidValue('BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID');
const previewD1 = uuidValue('BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID');
if (productionD1 === LOCAL_D1_ID) throw new Error('Production must never use the local D1 placeholder.');
if (productionD1 === previewD1) throw new Error('Production must never reuse the Bauman preview D1 database.');

// Application Management production currently keeps ChatGPT Sites authentication,
 // while Bauman Control/Runtime themselves must remain on isolated Cloudflare origins.
const applicationManagementOrigin = exactHttpsOrigin('APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN', { allowChatgptSite: true });
const controlOrigin = exactHttpsOrigin('BAUMAN_CONTROL_PRODUCTION_ORIGIN');
const runtimeOrigin = exactHttpsOrigin('BAUMAN_RUNTIME_PRODUCTION_ORIGIN');
const previewControlOrigin = exactHttpsOrigin('BAUMAN_CONTROL_PREVIEW_ORIGIN');
const previewRuntimeOrigin = exactHttpsOrigin('BAUMAN_RUNTIME_PREVIEW_ORIGIN');
const buildRevision = revision();

const origins = new Set([
  applicationManagementOrigin,
  controlOrigin,
  runtimeOrigin,
  previewControlOrigin,
  previewRuntimeOrigin,
]);
if (origins.size !== 5) throw new Error('Application Management, production Control/Runtime and preview Control/Runtime origins must all be distinct.');

const runtimeDist = path.join(root, 'runtime-dist');
fs.rmSync(runtimeDist, { recursive: true, force: true });
fs.mkdirSync(runtimeDist, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(runtimeDist, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(runtimeDist, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'subjects'), path.join(runtimeDist, 'subjects'), { recursive: true });
fs.cpSync(path.join(root, 'foundation'), path.join(runtimeDist, 'foundation'), { recursive: true });

for (const relativePath of [
  'subjects/russian/data/dialogue-bauman-az.json',
  'subjects/russian/data/deep-speaking-bauman.json',
]) chunkJsonArray(runtimeDist, relativePath);

assertRuntimeAssetSizes(runtimeDist);

materialize('control-service/wrangler.production.example.jsonc', 'control-service/wrangler.production.jsonc', {
  '__APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN__': applicationManagementOrigin,
  '__BAUMAN_RUNTIME_PRODUCTION_ORIGIN__': runtimeOrigin,
  '__BAUMAN_BUILD_REVISION__': buildRevision,
  '__BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID__': productionD1,
});
materialize('wrangler.runtime.production.example.jsonc', 'wrangler.runtime.production.jsonc', {
  '__BAUMAN_CONTROL_PRODUCTION_ORIGIN__': controlOrigin,
  '__BAUMAN_BUILD_REVISION__': buildRevision,
});

const requiredRuntimeAssets = [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'assets/css/deep-study-journal-v1.css',
  'assets/js/deep-study-journal-v1.js',
  'subjects/russian/index.html',
  'subjects/russian/assets/handwriting-glyph-authority.js',
  'subjects/russian/assets/handwriting-recognition.js',
  'subjects/russian/assets/russian-future-ui.js',
  'subjects/russian/assets/russian-future-ui.css',
  'subjects/russian/assets/russian-optional-data-loader.js',
  'subjects/shared/foundation-identity-bootstrap.js',
  'subjects/shared/foundation-identity-persistence.js',
  'subjects/shared/foundation-identity-projection.js',
  'subjects/shared/foundation-canonical-context.js',
  'foundation/domain-model/canonical-identity-runtime.js',
  'foundation/domain-model/identity-overlay-store.js',
  'foundation/domain-model/legacy-snapshot-extractor.js',
  'foundation/domain-model/canonical-read-projection.js',
  'foundation/domain-model/legacy-mapping-registry.v1.json',
  'subjects/russian/data/chunks/dialogue-bauman-az/manifest.json',
  'subjects/russian/data/chunks/deep-speaking-bauman/manifest.json',
];
for (const relative of requiredRuntimeAssets) {
  if (!fs.statSync(path.join(runtimeDist, relative), { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`Production runtime asset missing: ${relative}`);
  }
}

const russianHtml = fs.readFileSync(path.join(runtimeDist, 'subjects/russian/index.html'), 'utf8');
for (const resource of [
  'assets/russian-future-ui.js',
  'assets/russian-future-ui.css',
  'assets/russian-optional-data-loader.js',
]) {
  if (!russianHtml.includes(resource)) throw new Error(`Production Russian HTML reference missing: ${resource}`);
}

console.log('Bauman Cloudflare production package materialized safely.');
console.log(`Control Worker: bauman-control -> ${controlOrigin}`);
console.log(`Learning Worker: bauman-master-ai -> ${runtimeOrigin}`);
console.log('Production D1 is distinct from preview/local and runtime package preserves promoted Russian/Foundation assets.');
