import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

function runScript(file){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error(`B92 dependency gate failed: ${file}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
function read(path){return JSON.parse(fs.readFileSync(path,'utf8'));}

const b89=runScript('scripts/validate-roadmap-v2-l23-b89.mjs');
const h1=runScript('scripts/validate-roadmap-v2-l23-h1-consumer-blueprint.mjs');
const b90=runScript('scripts/validate-roadmap-v2-l23-b90.mjs');
const b91=runScript('scripts/validate-roadmap-v2-l23-b91.mjs');

assert.match(b89,/ROADMAP_V2_L23_B89_DIAGNOSTIC_CONTRACT=PASS/);
assert.match(h1,/ROADMAP_V2_L23_H1_CONSUMER_BLUEPRINT=PASS/);
assert.match(b90,/ROADMAP_V2_L23_B90_DIAGNOSTIC_CATALOG=PASS/);
assert.match(b91,/ROADMAP_V2_L23_B91_DIAGNOSTIC_HARNESS=PASS/);

const blueprintCommitted=fs.readFileSync('roadmap_v2/consumer/blueprint.json','utf8');
const catalogCommitted=fs.readFileSync('roadmap_v2/diagnostic/catalog.json','utf8');

function runBuilder(file){
  const a=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(a.status!==0)throw new Error(`B92 builder failed: ${file}\n${a.stdout}\n${a.stderr}`);
  const b=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(b.status!==0)throw new Error(`B92 second builder run failed: ${file}\n${b.stdout}\n${b.stderr}`);
  assert.equal(a.stdout,b.stdout,`non-deterministic builder output: ${file}`);
  return a.stdout;
}
assert.equal(runBuilder('scripts/build-roadmap-v2-consumer-blueprint.mjs'),blueprintCommitted,'consumer blueprint drift at B92');
assert.equal(runBuilder('scripts/build-roadmap-v2-diagnostic-catalog.mjs'),catalogCommitted,'diagnostic catalog drift at B92');

const consumer=read('roadmap_v2/consumer/consumer-contract.json');
const blueprint=read('roadmap_v2/consumer/blueprint.json');
const diagnostic=read('roadmap_v2/diagnostic/diagnostic-contract.json');
const catalog=read('roadmap_v2/diagnostic/catalog.json');

assert.equal(consumer.mode.productionIntegration,'disconnected');
assert.equal(consumer.mode.runtimeWriteAllowed,false);
assert.equal(consumer.capabilities.diagnosticExecution,false);
assert.equal(consumer.capabilities.runtimeActivation,false);

assert.equal(blueprint.mode.productionIntegration,'disconnected');
assert.equal(blueprint.mode.diagnosticExecution,false);
assert.equal(blueprint.mode.runtimeActivation,false);
assert.deepEqual(blueprint.counts,{
  chapters:85,
  eligibleChapterBlueprints:77,
  staticChapters:76,
  legacyPreserveChapters:1,
  dynamicChapters:8,
  numberedLessons:304,
  diagnosticTargets:381
});
assert.equal(blueprint.blockedDynamicTargets.length,8);
assert.equal(blueprint.validation.generatedQuestionItems,0);
assert.equal(blueprint.validation.executableDiagnosticPlans,0);
assert.equal(blueprint.validation.result,'PASS');

assert.equal(diagnostic.mode.productionIntegration,'disconnected');
assert.equal(diagnostic.mode.writesMasteryEvidence,false);
assert.equal(diagnostic.mode.writesLearnerState,false);
assert.equal(diagnostic.mode.writesLegacyRuntime,false);
for(const cap of ['masteryEvidenceWrite','learnerStateWrite','priorityEngineWrite','schedulerWrite','runtimeActivation']){
  assert.equal(diagnostic.capabilities[cap],false,`B92 forbidden Diagnostic capability enabled: ${cap}`);
}
assert.equal(diagnostic.statusSemantics.pass,'existing_competency_verified');
assert.equal(diagnostic.statusSemantics.forbiddenOutcome,'master_ready');
assert.equal(diagnostic.itemBankGate.allowGeneratedUnreviewedItems,false);

assert.equal(catalog.mode.productionIntegration,'disconnected');
assert.equal(catalog.mode.executionEnabled,false);
assert.equal(catalog.mode.persistenceEnabled,false);
assert.deepEqual(catalog.counts,{
  plans:381,
  chapterPlans:77,
  lessonPlans:304,
  blockedDynamicTargets:8,
  verifiedItemBanks:0,
  executablePlans:0,
  generatedQuestionItems:0
});
assert.equal(catalog.validation.masterReadyOutcomes,0);
assert.equal(catalog.validation.executablePlansWithoutVerifiedBank,0);
assert.equal(catalog.validation.answerLeakingPlans,0);
assert.equal(catalog.validation.persistenceEnabledPlans,0);
assert.equal(catalog.validation.result,'PASS');

for(const plan of catalog.plans){
  assert.equal(plan.executionReady,false);
  assert.equal(plan.masterReadyOutcomeAllowed,false);
  assert.equal(plan.answerLeakageAllowed,false);
  assert.equal(plan.persistenceAllowed,false);
  assert.equal(plan.itemBank.reviewStatus,'missing');
  assert.equal(plan.itemBank.verifiedItemCount,0);
}

const forbiddenCanonical=[
  'roadmap_v2/diagnostic/manifest.json',
  'roadmap_v2/consumer/manifest.json',
  'roadmap_v2/migration/migration-contract.json',
  'roadmap_v2/registry/roadmap-v2.registry.json',
  'roadmap_v2/graph/prerequisite-graph.json'
];
for(const p of forbiddenCanonical)assert.equal(fs.existsSync(p),false,`quarantined historical artifact leaked into canonical path: ${p}`);

const serialized=[consumer,blueprint,diagnostic,catalog].map(JSON.stringify).join('\n');
for(const forbidden of [
  'e383912354673bdce7a0059d6b9a23799d74e689',
  'consumerManifestSha256',
  '"generatedAt"'
]) assert.equal(serialized.includes(forbidden),false,`stale/non-deterministic dependency leaked at B92: ${forbidden}`);

console.log('ROADMAP_V2_L23_B92_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B89:'PASS',H1:'PASS',B90:'PASS',B91:'PASS'},
  deterministic:{consumerBlueprint:true,diagnosticCatalog:true},
  diagnosticTargets:381,
  blockedDynamicTargets:8,
  verifiedItemBanks:0,
  executablePlans:0,
  generatedQuestionItems:0,
  productionIntegration:'disconnected',
  persistence:false,
  runtimeActivation:false,
  next:'L24 only after complete six-gate CI passes on this closeout head'
},null,2));
