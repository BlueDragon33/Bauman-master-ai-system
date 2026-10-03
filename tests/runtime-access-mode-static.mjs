import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync('cloudflare/runtime-worker.mjs','utf8');
const productionTemplate=fs.readFileSync('wrangler.runtime.production.example.jsonc','utf8');
const previewTemplate=fs.readFileSync('wrangler.runtime.preview.example.jsonc','utf8');
const productionPrepare=fs.readFileSync('scripts/prepare-cloudflare-production.mjs','utf8');
const previewPrepare=fs.readFileSync('scripts/prepare-cloudflare-preview.mjs','utf8');

assert.match(worker,/function runtimeAccessMode\(env\)/);
assert.match(worker,/BAUMAN_ACCESS_MODE \|\| 'standalone'/);
assert.match(worker,/serverSideLearningGate:\s*accessMode === 'managed'/);
assert.match(worker,/accessMode === 'managed' && protectedLearningAsset\(url\.pathname\)/);
assert.doesNotMatch(worker,/if \(protectedLearningAsset\(url\.pathname\)\) \{/);
assert.match(worker,/meta name="bauman-access-mode"/);

for (const [name,template] of [['production',productionTemplate],['preview',previewTemplate]]) {
  assert.ok(template.includes('"BAUMAN_ACCESS_MODE": "__BAUMAN_ACCESS_MODE__"'), name+' runtime template must carry access mode');
}
assert.match(productionPrepare,/'__BAUMAN_ACCESS_MODE__': accessMode\(\)/);
assert.match(previewPrepare,/'__BAUMAN_ACCESS_MODE__': accessMode\(\)/);

console.log('RUNTIME_ACCESS_MODE_STATIC=PASS');
