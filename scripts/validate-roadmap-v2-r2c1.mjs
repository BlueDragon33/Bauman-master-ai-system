import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const m=JSON.parse(fs.readFileSync('recovery/roadmap-v2/r2c1-toolchain-compatibility.v1.json','utf8'));
assert.equal(m.schema,'BAUMAN_ROADMAP_V2_R2C1_TOOLCHAIN_COMPATIBILITY_V1');
assert.equal(m.phase,'L27R2C1_TOOLCHAIN_COMPATIBILITY_REVIEW');
assert.equal(m.policy.asIsCanonicalAdmission,0);
assert.equal(m.policy.productionIntegration,'disconnected');
assert.equal(m.policy.generatedDataAdmissionAllowed,false);
assert.equal(m.policy.staleManifestAdmissionAllowed,false);
assert.equal(m.policy.runtimeActivationAllowed,false);

assert.equal(m.tools.length,8);
assert.equal(m.tools.filter(x=>['refactor_required','replace_for_modern_baseline'].includes(x.disposition)).length,7);
assert.equal(m.tools.filter(x=>x.disposition==='portable_after_modern_data_exists').length,1);
assert.equal(m.externalValidation.length,1);
assert.equal(m.externalValidation[0].disposition,'quarantine_obsolete_duplicate');
assert.equal(m.engines.count,7);
assert.equal(m.tests.count,7);
assert.equal(m.conclusions.safeAsIsCanonicalTools,0);
assert.equal(m.conclusions.toolsRequiringRefactorOrReplacement,7);
assert.equal(m.conclusions.portableValidatorsBlockedOnModernData,1);
assert.equal(m.nextSubrounds[0].status,'blocked_on_L27R2C1');

assert.equal(m.historicalBaseline,'e383912354673bdce7a0059d6b9a23799d74e689','historical baseline evidence drift');
const findings=JSON.stringify(m.tools);
assert.equal(findings.includes('math-main-e383912-inventory.json'),true,'audit lost historical filename coupling evidence');

function walk(dir){
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const p=path.posix.join(dir,entry.name);
  return entry.isDirectory()?walk(p):[p];
 });
}
const canonical=walk('roadmap_v2').sort();
const r2b=JSON.parse(fs.readFileSync('recovery/roadmap-v2/r2b-static-admission.v1.json','utf8')).files.map(x=>x.path).sort();
assert.deepEqual(canonical,r2b,'R2C1 review must not add executable/data files to canonical Roadmap tree');

console.log('ROADMAP_V2_L27R2C1_TOOLCHAIN_COMPATIBILITY=PASS');
console.log(JSON.stringify({historicalTools:8,safeAsIs:0,refactorOrReplace:7,portableBlockedOnData:1,enginesStagedLater:7,testsStagedLater:7},null,2));
