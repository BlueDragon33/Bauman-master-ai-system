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

  const manifest = {
    format: 'json-array-chunks-v1',
    dataset,
    source: relativePath.replaceAll('\\', '/'),
    count: data.length,
    targetBytes: CHUNK_TARGET_BYTES,
    chunks
  };
  fs.writeFileSync(path.join(chunkDir, 'manifest.json'), JSON.stringify(manifest));
  fs.rmSync(sourcePath);
  console.log(`Chunked ${relativePath}: ${data.length} items -> ${chunks.length} assets.`);
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
fs.cpSync(path.join(root, 'subjects'), path.join(runtimeDist, 'subjects'), { recursive: true });
// Foundation is runtime infrastructure, not build-only source. Subject pages may reference it
// directly, so every accepted runtime/package must carry the same versioned Foundation tree.
fs.cpSync(path.join(root, 'foundation'), path.join(runtimeDist, 'foundation'), { recursive: true });

for (const relativePath of [
  'subjects/russian/data/dialogue-bauman-az.json',
  'subjects/russian/data/deep-speaking-bauman.json',
]) chunkJsonArray(runtimeDist, relativePath);

assertRuntimeAssetSizes(runtimeDist);

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
  'subjects/russian/index.html',
  'subjects/russian/assets/core.js',
  'subjects/russian/assets/handwriting-glyph-authority.js',
  'subjects/russian/assets/handwriting-recognition.js',
  'subjects/russian/assets/russian-reference-ui.js',
  'subjects/russian/assets/russian-reference-ui-polish.css',
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
]) {
  if (!fs.existsSync(path.join(runtimeDist, resource))) throw new Error(`Runtime asset missing: ${resource}`);
}
for (const oversizedOriginal of [
  'subjects/russian/data/dialogue-bauman-az.json',
  'subjects/russian/data/deep-speaking-bauman.json',
]) {
  if (fs.existsSync(path.join(runtimeDist, oversizedOriginal))) throw new Error(`Oversized runtime original must be removed after chunking: ${oversizedOriginal}`);
}
if (!html.includes('assets/js/platform/runtime-config.js') || !html.includes('assets/js/platform/device-access-gate.js')) {
  throw new Error('Bauman runtime is missing the device-access bootstrap scripts.');
}
const russianHtml = fs.readFileSync(path.join(runtimeDist, 'subjects/russian/index.html'), 'utf8');
if (!russianHtml.includes('assets/handwriting-glyph-authority.js')) throw new Error('Russian runtime is missing handwriting glyph authority script reference.');
if (!russianHtml.includes('assets/handwriting-recognition.js')) throw new Error('Russian runtime is missing handwriting recognition script reference.');
if (russianHtml.indexOf('assets/handwriting-glyph-authority.js') > russianHtml.indexOf('assets/handwriting-recognition.js')) throw new Error('Russian glyph authority must load before handwriting recognition.');
for (const resource of [
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js',
  '../shared/foundation-identity-persistence.js',
  '../shared/foundation-identity-projection.js',
  '../shared/foundation-canonical-context.js',
]) {
  if (!russianHtml.includes(resource)) throw new Error(`Russian runtime is missing Foundation script reference: ${resource}`);
}

console.log('Bauman Cloudflare preview materialized safely.');
console.log(`Control Worker: bauman-control-preview -> ${controlOrigin}`);
console.log(`Learning Worker: bauman-master-ai-preview -> ${runtimeOrigin}`);
console.log('Subject Web Apps and versioned Foundation runtime are packaged together inside the Learning Runtime.');
console.log('Canonical identity persistence, projection, and consumer context dependencies are packaged with Russian runtime.');
console.log('Russian optional datasets: oversized lazy JSON converted to chunk manifests below Worker asset limits.');
console.log('D1: bauman-control-preview-db (isolated preview database).');
