import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const builder='scripts/build-roadmap-v2-diagnostic-catalog.mjs';
const catalogPath='roadmap_v2/diagnostic/catalog.json';
const schemaPath='roadmap_v2/diagnostic/catalog.schema.json';
const blueprint=JSON.parse(fs.readFileSync('roadmap_v2/consumer/blueprint.json','utf8'));
const contract=JSON.parse(fs.readFileSync('roadmap_v2/diagnostic/diagnostic-contract.json','utf8'));

const run=spawnSync(process.execPath,[builder],{encoding:'utf8'});
if(run.status!==0)throw new Error(`B90 catalog rebuild failed\n${run.stdout}\n${run.stderr}`);
const committed=fs.readFileSync(catalogPath,'utf8');
assert.equal(run.stdout,committed,'B90 catalog is not byte-deterministic');

const cat=JSON.parse(committed);
const schema=JSON.parse(fs.readFileSync(schemaPath,'utf8'));
assert.equal(cat.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V2');
assert.equal(schema.$id,cat.schema);
assert.equal(cat.version,2);
assert.equal(cat.source.consumerBlueprintSchema,blueprint.schema);
assert.equal(cat.source.diagnosticContractSchema,contract.schema);
assert.equal(cat.mode.productionIntegration,'disconnected');
assert.equal(cat.mode.executionEnabled,false);
assert.equal(cat.mode.persistenceEnabled,false);
assert.deepEqual(cat.policy,{
  id:'DIAG-20-V1',
  requiredItemCount:20,
  difficultyDistribution:{easy:8,medium:6,hard:4,expert:2},
  passPercent:80,
  criticalItemFloorPercent:70
});
assert.deepEqual(cat.counts,{
  plans:381,
  chapterPlans:77,
  lessonPlans:304,
  blockedDynamicTargets:8,
  verifiedItemBanks:0,
  executablePlans:0,
  generatedQuestionItems:0
});

const ids=cat.plans.map(x=>x.id);
const targets=cat.plans.map(x=>x.targetId);
assert.equal(new Set(ids).size,381,'duplicate diagnostic plan ID');
assert.equal(new Set(targets).size,381,'duplicate diagnostic target ID');
assert.deepEqual(targets,blueprint.diagnosticTargets.map(x=>x.id),'catalog target order/source drift');

const known=new Set(blueprint.chapters.flatMap(ch=>[ch.id,...ch.lessons.map(l=>l.id)]));
for(const plan of cat.plans){
  assert.equal(plan.id,`DIAG::${plan.targetId}`);
  assert.equal(plan.policyId,'DIAG-20-V1');
  assert.equal(plan.requiredItemCount,20);
  assert.deepEqual(plan.difficultyDistribution,{easy:8,medium:6,hard:4,expert:2});
  assert.equal(plan.passPercent,80);
  assert.equal(plan.criticalItemFloorPercent,70);
  assert.deepEqual(plan.itemBank,{path:null,bankId:null,reviewStatus:'missing',verifiedItemCount:0});
  assert.equal(plan.executionStatus,'blocked_missing_verified_item_bank');
  assert.equal(plan.executionReady,false);
  assert.equal(plan.allowedPassOutcome,'existing_competency_verified');
  assert.equal(plan.masterReadyOutcomeAllowed,false);
  assert.equal(plan.answerLeakageAllowed,false);
  assert.equal(plan.persistenceAllowed,false);
  for(const ref of plan.prerequisiteRefs)assert.equal(known.has(ref),true,`unknown catalog prerequisite: ${plan.targetId} -> ${ref}`);
  assert.equal(plan.reasonCodes.includes('MISSING_VERIFIED_ITEM_BANK'),true);
  assert.equal(plan.reasonCodes.includes('DIAGNOSTIC_PASS_NOT_MASTER_READY'),true);
  assert.equal(plan.reasonCodes.includes('PERSISTENCE_DISABLED'),true);
  assert.equal(plan.reasonCodes.includes('PRODUCTION_DISCONNECTED'),true);
}

const expectedDynamic=['RU-R4-C09','RU-R4-C10','CUR-L4-C01','CUR-L4-C02','CUR-L4-C03','CUR-L4-C04','CUR-L4-C05','CUR-L4-C06'].sort();
assert.deepEqual(cat.blockedDynamicTargets.map(x=>x.id).sort(),expectedDynamic);
assert.equal(cat.blockedDynamicTargets.every(x=>x.reasonCode==='DYNAMIC_INSTANCE_REQUIRED'),true);

assert.equal(cat.validation.uniquePlanIds,true);
assert.equal(cat.validation.uniqueTargetIds,true);
assert.deepEqual(cat.validation.missingTargets,[]);
assert.deepEqual(cat.validation.missingPrerequisiteRefs,[]);
assert.equal(cat.validation.masterReadyOutcomes,0);
assert.equal(cat.validation.executablePlansWithoutVerifiedBank,0);
assert.equal(cat.validation.answerLeakingPlans,0);
assert.equal(cat.validation.persistenceEnabledPlans,0);
assert.equal(cat.validation.result,'PASS');

const serialized=JSON.stringify(cat);
for(const forbidden of ['consumerManifest','consumerManifestSha256','e383912354673bdce7a0059d6b9a23799d74e689','generatedAt']){
  assert.equal(serialized.includes(forbidden),false,`stale/non-deterministic catalog field leaked: ${forbidden}`);
}

console.log('ROADMAP_V2_L23_B90_DIAGNOSTIC_CATALOG=PASS');
console.log(JSON.stringify({plans:381,chapterPlans:77,lessonPlans:304,dynamicBlocked:8,verifiedItemBanks:0,executablePlans:0,generatedQuestionItems:0,deterministic:true},null,2));
