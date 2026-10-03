import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const outputs=[
 'MATH_ACCEPTANCE_TRACEABILITY_MATRIX.md','MATH_GOLDEN_REGRESSION_FIXTURES.json',
 'MATH_BROWSER_DEVICE_ACCESSIBILITY_MATRIX.md','MATH_OFFLINE_MIGRATION_ACCEPTANCE.md',
 'MATH_PERFORMANCE_SECURITY_ACCEPTANCE.md','MATH_AI_ACCEPTANCE.md',
 'MATH_AUTHORING_ACCEPTANCE.md','MATH_LEGACY_DEBT_REGISTER.md','MATH_RC_MANIFEST.json',
 'MATH_PRODUCTION_SMOKE_PROFILE.md','MATH_ACCEPTANCE_EVIDENCE_INDEX.md'
];
for(const f of outputs)assert.ok(fs.existsSync('prompts/subjects/math/evidence/'+f),'Missing MATH06 output '+f);

const evaluator=require('../subjects/math/assets/math-reasoning-evaluator.js');
const capability=require('../subjects/math/assets/math-capability-runtime.js');
const product=require('../subjects/math/assets/math-product-integration.js');
assert.equal(evaluator.selfCheck().masteryAuthority,false);
assert.equal(capability.selfCheck().masteryWrites,false);
assert.equal(capability.selfCheck().academicWrites,false);
assert.equal(product.selfCheck().platformFork,false);
assert.equal(product.selfCheck().masteryAuthority,false);
assert.equal(product.selfCheck().assessmentAuthority,false);

const capSrc=fs.readFileSync('subjects/math/assets/math-capability-runtime.js','utf8');
assert.ok(!/\beval\s*\(/.test(capSrc),'eval forbidden in RC');
assert.ok(!/new Function\s*\(/.test(capSrc),'new Function forbidden in RC');

const fixtures=read('prompts/subjects/math/evidence/MATH_GOLDEN_REGRESSION_FIXTURES.json');
const eq=evaluator._test.algebraicallyEqual(fixtures.cases[0].a,fixtures.cases[0].b);
assert.equal(eq.supported,true);assert.equal(eq.equal,true);
for(const tc of fixtures.cases.filter(x=>x.capability)){
 const out=await capability.invoke(tc.capability,tc.input||{},tc.context||{});
 assert.equal(out.status,tc.expect.status,tc.id+' status');
 if('value' in tc.expect)assert.deepEqual(out.data?.value,tc.expect.value,tc.id+' value');
 if(tc.expect.hasGap)assert.ok((out.data?.gaps||[]).length>0,tc.id+' gap');
 assert.equal(out.masteryWrite,false);assert.equal(out.academicWrite,false);
}

const rc=read('prompts/subjects/math/evidence/MATH_RC_MANIFEST.json');
assert.ok(['VALIDATING','PASS_RC_READY'].includes(rc.status),'Unexpected RC lifecycle status');
assert.equal(rc.productionDeployed,false);
assert.equal(rc.baseMainSha,'42c61ea58070530cad309a1054eee9dfc3abcd55');
assert.ok(rc.rollbackTarget);
if(rc.status==='PASS_RC_READY'){
 assert.match(rc.exactRcSha||'',/^[0-9a-f]{40}$/,'PASS_RC_READY requires exactRcSha');
 assert.equal(rc.runtimeTestedHead,rc.exactRcSha,'RC identity must match runtime-tested head');
}
for(const owner of ['mathematicalTruth','assessmentVerdict','toolExecution','productIntegration','mastery'])assert.ok(rc.featureAuthority[owner]);

const editor=fs.readFileSync('subjects/math/editor.html','utf8');
assert.ok(editor.includes('index.html'),'Math editor entry must route to governed subject data surface');
const importer=fs.readFileSync('subjects/math/assets/datavault_importer/datavault-importer-E127.js','utf8');
assert.ok(/valid/i.test(importer),'DataVault importer must expose validation behavior');
assert.ok(!/production.*deploy|deploy.*production/i.test(importer),'Math importer must not contain a production deploy path');

for(const prior of [
 'tests/math-p2-canonical-contract.mjs','tests/math-p3-reasoning-contract.mjs',
 'tests/math-p4-capability-contract.mjs','tests/math-p5-product-contract.mjs'
])assert.ok(fs.existsSync(prior),'Missing prior-module gate '+prior);

console.log(JSON.stringify({status:'PASS',check:'MATH06 RC contract',outputs:outputs.length,goldenCases:fixtures.cases.length,productionDeployed:false}));
