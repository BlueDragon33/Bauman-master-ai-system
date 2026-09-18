import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/r2b-static-admission.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_R2B_STATIC_ADMISSION_V1');
assert.equal(manifest.phase,'L27R2B_STATIC_CONTRACT_SCHEMA_TRANSPLANT');
assert.equal(manifest.policy.productionIntegration,'disconnected');
assert.equal(manifest.policy.runtimeUiChangesAllowed,false);
assert.equal(manifest.policy.executableEnginesAllowed,false);
assert.equal(manifest.policy.generatedDataAllowed,false);
assert.equal(manifest.policy.historicalMigrationContractAdmitted,false);

function gitBlobSha(buffer){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}
const admitted=new Set();
for(const item of manifest.files){
  assert.equal(fs.existsSync(item.path),true,`missing admitted file: ${item.path}`);
  const bytes=fs.readFileSync(item.path);
  assert.equal(gitBlobSha(bytes),item.blobSha,`blob drift: ${item.path}`);
  JSON.parse(bytes.toString('utf8'));
  admitted.add(item.path);
}
assert.equal(admitted.size,23,'unexpected R2B admitted-file count');

function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const canonical=walk('roadmap_v2').sort();
assert.deepEqual(canonical,[...admitted].sort(),'R2B canonical tree contains unapproved files');

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
assert.equal(contracts[0].capabilities.runtimeActivation,false);
assert.equal(contracts[1].capabilities.runtimeActivation,false);
assert.equal(contracts[2].capabilities.runtimeActivation,false);
assert.equal(contracts[3].capabilities.runtimeActivation,false);
assert.equal(contracts[4].capabilities.runtimeActivation,false);
assert.equal(contracts[5].capabilities.runtimeActivation,false);

const consumer=contracts[0];
assert.equal(consumer.provenance.precedence.includes('subjects/math/theory-framework.json'),false);
assert.equal(consumer.provenance.precedence.includes('subjects/math/data/theory-framework.json'),true);
assert.equal(fs.existsSync('roadmap_v2/migration/migration-contract.json'),false,'historical migration contract must remain quarantined');

for(const p of canonical){
  assert.equal(/\.(js|mjs|cjs|html|css)$/.test(p),false,`executable/UI file admitted in R2B: ${p}`);
}
console.log('ROADMAP_V2_L27R2B_STATIC_ADMISSION=PASS');
console.log(JSON.stringify({files:canonical.length,contracts:6,migrationQuarantined:true,productionDisconnected:true},null,2));
