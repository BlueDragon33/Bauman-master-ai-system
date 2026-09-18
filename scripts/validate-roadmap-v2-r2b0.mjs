import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const audit=JSON.parse(fs.readFileSync('recovery/roadmap-v2/contract-hygiene-r2b0.v1.json','utf8'));
assert.equal(audit.schema,'BAUMAN_ROADMAP_V2_R2B0_CONTRACT_HYGIENE_V1');
assert.equal(audit.phase,'L27R2B0_CONTRACT_HYGIENE');
assert.equal(audit.findings.invalidHistoricalPath.historical,'subjects/math/theory-framework.json');
assert.equal(audit.findings.invalidHistoricalPath.corrected,'subjects/math/data/theory-framework.json');
assert.equal(audit.findings.invalidHistoricalPath.historicalPathExists,false);
assert.equal(audit.findings.invalidHistoricalPath.currentPathExists,true);
assert.equal(audit.findings.migrationBaseline.action,'quarantine_until_L27R3_rebaseline');

function gitBlobSha(buffer){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}
for(const item of audit.contracts){
  const archive=`recovery/roadmap-v2/historical-l27/${item.path}`;
  assert.equal(fs.existsSync(archive),true,`missing historical contract archive: ${item.path}`);
  assert.equal(gitBlobSha(fs.readFileSync(archive)),item.sha,`historical contract drift: ${item.path}`);
}

const candidatePath='recovery/roadmap-v2/candidates/r2b/roadmap_v2/consumer/consumer-contract.json';
const candidate=JSON.parse(fs.readFileSync(candidatePath,'utf8'));
assert.equal(candidate.provenance.precedence.includes('subjects/math/theory-framework.json'),false);
assert.equal(candidate.provenance.precedence.includes('subjects/math/data/theory-framework.json'),true);
assert.equal(candidate.mode.productionIntegration,'disconnected');
assert.equal(candidate.mode.runtimeWriteAllowed,false);
assert.equal(candidate.capabilities.runtimeActivation,false);

const historical=JSON.parse(fs.readFileSync('recovery/roadmap-v2/historical-l27/roadmap_v2/consumer/consumer-contract.json','utf8'));
const h=structuredClone(historical);
const c=structuredClone(candidate);
h.provenance.precedence=h.provenance.precedence.map(x=>x==='subjects/math/theory-framework.json'?'subjects/math/data/theory-framework.json':x);
assert.deepEqual(c,h,'consumer repair changed more than the approved provenance path');

const migration=JSON.parse(fs.readFileSync('recovery/roadmap-v2/historical-l27/roadmap_v2/migration/migration-contract.json','utf8'));
assert.equal(migration.immutableBaseline.commit,'e383912354673bdce7a0059d6b9a23799d74e689');
assert.equal(fs.existsSync('roadmap_v2/migration/migration-contract.json'),false,'old migration contract must remain quarantined');

const modern='146d8f672975f46b36164cbd795e837801e50c97';
const changed=execFileSync('git',['diff','--name-only',modern,'HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=changed.every(path=>
 path.startsWith('recovery/roadmap-v2/') ||
 path==='scripts/validate-roadmap-v2-reconciliation.mjs' ||
 path==='scripts/validate-roadmap-v2-r2a.mjs' ||
 path==='scripts/validate-roadmap-v2-r2b0.mjs' ||
 path==='.github/workflows/roadmap-v2-reconciliation.yml'
);
assert.equal(allowed,true,'R2B0 touched a runtime/canonical path');
console.log('ROADMAP_V2_L27R2B0_CONTRACT_HYGIENE=PASS');
console.log(JSON.stringify({consumerPathFixed:true,migrationContractQuarantined:true,runtimeTouched:false},null,2));
