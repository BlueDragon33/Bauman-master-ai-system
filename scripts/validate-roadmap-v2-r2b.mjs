import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/r2b-static-admission.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_R2B_STATIC_ADMISSION_V1');
assert.equal(manifest.policy.productionIntegration,'disconnected');
assert.equal(manifest.policy.runtimeUiChangesAllowed,false);
assert.equal(manifest.policy.executableEnginesAllowed,false);
assert.equal(manifest.policy.generatedDataAllowed,false);
assert.equal(manifest.policy.historicalMigrationContractAdmitted,false);

function gitBlobSha(buffer){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}

const currentTrackOwned=new Set([
  'roadmap_v2/diagnostic/diagnostic-contract.json',
  'roadmap_v2/diagnostic/diagnostic-contract.schema.json',
  'roadmap_v2/diagnostic/catalog.schema.json',
  'roadmap_v2/mastery/mastery-contract.json',
  'roadmap_v2/mastery/mastery-contract.schema.json',
  'roadmap_v2/priority/priority-contract.json',
  'roadmap_v2/priority/priority-contract.schema.json'
]);

const baseline=new Set();
for(const item of manifest.files){
  assert.equal(fs.existsSync(item.path),true,`missing static baseline file: ${item.path}`);
  const bytes=fs.readFileSync(item.path);
  JSON.parse(bytes.toString('utf8'));
  if(!currentTrackOwned.has(item.path)){
    assert.equal(gitBlobSha(bytes),item.blobSha,`historical static baseline drift: ${item.path}`);
  }
  baseline.add(item.path);
}
assert.equal(baseline.size,23,'unexpected historical static-baseline file count');

const diagnostic=JSON.parse(fs.readFileSync('roadmap_v2/diagnostic/diagnostic-contract.json','utf8'));
const diagnosticSchema=JSON.parse(fs.readFileSync('roadmap_v2/diagnostic/diagnostic-contract.schema.json','utf8'));
assert.equal(diagnostic.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2','current-track Diagnostic contract must be V2');
assert.equal(diagnosticSchema.$id,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2','current-track Diagnostic schema must be V2');
assert.equal(diagnostic.mode.productionIntegration,'disconnected');
assert.equal(diagnostic.capabilities.runtimeActivation,false);

const mastery=JSON.parse(fs.readFileSync('roadmap_v2/mastery/mastery-contract.json','utf8'));
const masterySchema=JSON.parse(fs.readFileSync('roadmap_v2/mastery/mastery-contract.schema.json','utf8'));
assert.equal(mastery.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2','current-track Mastery contract must be V2');
assert.equal(masterySchema.$id,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2','current-track Mastery schema must be V2');
assert.equal(mastery.mode.productionIntegration,'disconnected');
assert.equal(mastery.capabilities.runtimeActivation,false);
assert.equal(mastery.capabilities.persistentStoreWrite,false);

const priority=JSON.parse(fs.readFileSync('roadmap_v2/priority/priority-contract.json','utf8'));
const prioritySchema=JSON.parse(fs.readFileSync('roadmap_v2/priority/priority-contract.schema.json','utf8'));
assert.equal(priority.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2','current-track Priority contract must be V2');
assert.equal(prioritySchema.$id,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2','current-track Priority schema must be V2');
assert.equal(priority.mode.productionIntegration,'disconnected');
assert.equal(priority.capabilities.persistentStoreWrite,false);
assert.equal(priority.capabilities.schedulerWrite,false);
assert.equal(priority.capabilities.runtimeActivation,false);

function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const canonical=walk('roadmap_v2').sort();
for(const p of baseline)assert.equal(canonical.includes(p),true,`historical static baseline missing from current tree: ${p}`);

const contracts=[
 'roadmap_v2/consumer/consumer-contract.json',
 'roadmap_v2/diagnostic/diagnostic-contract.json',
 'roadmap_v2/mastery/mastery-contract.json',
 'roadmap_v2/priority/priority-contract.json',
 'roadmap_v2/scheduler/scheduler-contract.json',
 'roadmap_v2/readiness/readiness-contract.json'
].map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
for(const c of contracts){
  assert.equal(c.mode?.productionIntegration,'disconnected',`production boundary widened: ${c.schema}`);
}
assert.equal(contracts[0].mode.runtimeWriteAllowed,false);
for(const c of contracts)assert.equal(c.capabilities.runtimeActivation,false,`runtime activation widened: ${c.schema}`);

const consumer=contracts[0];
assert.equal(consumer.provenance.precedence.includes('subjects/math/theory-framework.json'),false);
assert.equal(consumer.provenance.precedence.includes('subjects/math/data/theory-framework.json'),true);
assert.equal(fs.existsSync('roadmap_v2/migration/migration-contract.json'),false,'historical migration contract must remain quarantined');

for(const p of canonical){
  assert.equal(/\.(js|mjs|cjs|html|css)$/.test(p),false,`executable/UI file admitted in canonical Roadmap tree: ${p}`);
}

console.log('ROADMAP_V2_STATIC_BASELINE_INVARIANTS=PASS');
console.log(JSON.stringify({
  historicalBaselineFiles:baseline.size,
  currentCanonicalFiles:canonical.length,
  currentTrackOwned:[...currentTrackOwned],
  migrationQuarantined:true,
  productionDisconnected:true
},null,2));
