import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/transplant-r2a.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_R2A_TRANSPLANT_V1');
assert.equal(manifest.phase,'L27R2A_HISTORICAL_EVIDENCE_ARCHIVE');
assert.equal(manifest.status,'archive_only');
assert.equal(manifest.source.head,'0438b6f4256003e6f20c266c97d944ade7c52f83');
assert.equal(manifest.fileCount,16);
assert.equal(manifest.policy.byteExact,true);
assert.equal(manifest.policy.canonicalRoadmapPathsActivated,false);
assert.equal(fs.existsSync('roadmap_v2'),false,'R2A must not activate canonical Roadmap paths');

function gitBlobSha(buffer){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}
for(const file of manifest.files){
  assert.ok(file.archivePath.startsWith('recovery/roadmap-v2/historical-l27/'));
  assert.equal(fs.existsSync(file.archivePath),true,`missing archive: ${file.archivePath}`);
  assert.equal(gitBlobSha(fs.readFileSync(file.archivePath)),file.blobSha,`historical blob drift: ${file.sourcePath}`);
}

const state=fs.readFileSync('recovery/roadmap-v2/historical-l27/docs/roadmap_v2/EXECUTION_STATE.md','utf8');
assert.match(state,/Lượt 27 \/ Bước 108/);
assert.match(state,/Lượt 28 \/ Bước 109/);
const l22=fs.readFileSync('recovery/roadmap-v2/historical-l27/docs/roadmap_v2/L22_ACCEPTANCE.md','utf8');
const l27=fs.readFileSync('recovery/roadmap-v2/historical-l27/docs/roadmap_v2/L27_ACCEPTANCE.md','utf8');
assert.match(l22,/Status: `PASS_/);
assert.match(l27,/Status: `PASS_/);

const modern='146d8f672975f46b36164cbd795e837801e50c97';
const changed=execFileSync('git',['diff','--name-only',modern,'HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=changed.every(path=>
  path.startsWith('recovery/roadmap-v2/') ||
  path==='scripts/validate-roadmap-v2-reconciliation.mjs' ||
  path==='scripts/validate-roadmap-v2-r2a.mjs' ||
  path==='.github/workflows/roadmap-v2-reconciliation.yml'
);
assert.equal(allowed,true,`R2A touched forbidden paths: ${changed.filter(path=>!(
  path.startsWith('recovery/roadmap-v2/') ||
  path==='scripts/validate-roadmap-v2-reconciliation.mjs' ||
  path==='scripts/validate-roadmap-v2-r2a.mjs' ||
  path==='.github/workflows/roadmap-v2-reconciliation.yml'
)).join(', ')}`);

console.log('ROADMAP_V2_L27R2A_ARCHIVE=PASS');
console.log(JSON.stringify({files:manifest.fileCount,byteExact:true,runtimeTouched:false,canonicalActivated:false},null,2));
