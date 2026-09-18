import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCurrentPrerequisitePolicy} from './roadmap-v2-prerequisite-policy.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const priority=read('roadmap_v2/priority/priority-contract.json');
const schema=read('roadmap_v2/priority/priority-contract.schema.json');
const blueprint=read('roadmap_v2/consumer/blueprint.json');
const mastery=read('roadmap_v2/mastery/mastery-contract.json');
const diagnostic=read('roadmap_v2/diagnostic/diagnostic-contract.json');
const snapshotSchema=read('roadmap_v2/mastery/mastery-snapshot.schema.json');
const prerequisitePolicy=buildCurrentPrerequisitePolicy();

assert.equal(priority.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(priority.version,2);
assert.equal(schema.$id,priority.schema);
assert.equal(priority.acceptance.currentTrack,'L25');
assert.equal(priority.acceptance.step,97);

assert.deepEqual(priority.mode,{
  access:'read_only_harness',
  productionIntegration:'disconnected',
  failClosed:true,
  persistentStoreEnabled:false,
  schedulerWriteAllowed:false,
  runtimeWriteAllowed:false
});

assert.equal(priority.upstream.consumerBlueprintPath,'roadmap_v2/consumer/blueprint.json');
assert.equal(priority.upstream.consumerBlueprintSchema,blueprint.schema);
assert.equal(priority.upstream.consumerBlueprintValidationRequired,blueprint.validation.result);
assert.equal(blueprint.validation.result,'PASS');

assert.equal(priority.upstream.masteryContractPath,'roadmap_v2/mastery/mastery-contract.json');
assert.equal(priority.upstream.masteryContractSchema,mastery.schema);
assert.equal(mastery.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2');
assert.equal(priority.upstream.masterySnapshotSchema,snapshotSchema.$id);
assert.equal(priority.upstream.prerequisitePolicySchema,prerequisitePolicy.schema);
assert.equal(prerequisitePolicy.validation.result,'PASS');
assert.equal(priority.upstream.manifestDependencyRequired,false);
assert.equal(priority.upstream.staleHistoricalManifestAccepted,false);

assert.equal(priority.formula.expression,'0.35*masterRelevance + 0.30*knowledgeGap + 0.20*prerequisiteUrgency + 0.15*forgettingRisk');
assert.deepEqual(priority.formula.weights,{
  masterRelevance:0.35,
  knowledgeGap:0.3,
  prerequisiteUrgency:0.2,
  forgettingRisk:0.15
});
assert.equal(Object.values(priority.formula.weights).reduce((a,b)=>a+b,0),1);
assert.deepEqual(priority.formula.inputRange,{minimum:0,maximum:1});
assert.deepEqual(priority.formula.outputRange,{minimum:0,maximum:100});

assert.deepEqual(priority.normalization.knowledgeGapByState,{
  gap:1,chua_hoc:0.85,dang_hoc:0.6,can_on:0.45,dat_prerequisite:0.2,master_ready:0
});
assert.deepEqual(new Set(Object.keys(priority.normalization.knowledgeGapByState)),new Set(mastery.knowledgeStates));
assert.deepEqual(priority.normalization.prerequisiteUrgencyByWeeks,[
  {maximumWeeks:4,value:1},
  {maximumWeeks:8,value:0.75},
  {maximumWeeks:12,value:0.5},
  {maximumWeeks:24,value:0.25},
  {maximumWeeks:null,value:0.1}
]);
assert.equal(priority.normalization.missingNeededDateUrgency,0);

assert.deepEqual(priority.criticalOverride,{
  requiredKnowledgeState:'gap',
  maximumWeeksUntilNeeded:4,
  disposition:'critical',
  bypassesWeightedBand:true
});
assert.equal(priority.criticalOverride.requiredKnowledgeState,'gap');
assert(mastery.knowledgeStates.includes(priority.criticalOverride.requiredKnowledgeState));

assert.equal(priority.existingCompetencyRule.requiresExistingCompetencyVerified,true);
assert.equal(priority.existingCompetencyRule.diagnosticPercentMinimum,diagnostic.assessmentPolicy.passPercent);
assert.equal(priority.existingCompetencyRule.diagnosticCriticalPercentMinimum,diagnostic.assessmentPolicy.criticalItemFloorPercent);
assert.equal(priority.existingCompetencyRule.retentionPercentMinimum,mastery.thresholds.retentionPercent);
assert.deepEqual(priority.existingCompetencyRule.retentionWindowDays,mastery.thresholds.retentionWindowDays);
assert.equal(priority.existingCompetencyRule.disposition,'review_on_demand');
assert.equal(priority.existingCompetencyRule.grantsMasterReady,false);

assert.deepEqual(priority.weightedBands,[
  {minimumScore:70,disposition:'high'},
  {minimumScore:40,disposition:'medium'},
  {minimumScore:0,disposition:'low'}
]);
assert.deepEqual(priority.ranking.order,[
  'critical first',
  'weighted score descending',
  'weeks until needed ascending with null last',
  'target ID ascending'
]);
assert.equal(priority.ranking.stable,true);
assert.equal(priority.ranking.duplicateTargetPolicy,'reject');

for(const cap of ['candidateValidate','featureExtract','score','explain','rank','inMemoryHarnessOnly']){
  assert.equal(priority.capabilities[cap],true,`required Priority capability unavailable: ${cap}`);
}
for(const cap of ['persistentStoreWrite','schedulerWrite','runtimeActivation']){
  assert.equal(priority.capabilities[cap],false,`forbidden Priority capability enabled: ${cap}`);
}

const serialized=JSON.stringify(priority);
for(const forbidden of [
  'consumerManifest',
  'masteryManifest',
  'BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1',
  'e383912354673bdce7a0059d6b9a23799d74e689',
  'roadmap_v2/priority/manifest.json'
]) assert.equal(serialized.includes(forbidden),false,`stale Priority dependency found: ${forbidden}`);

assert.equal(priority.acceptance.consumerBlueprintBoundaryRevalidated,true);
assert.equal(priority.acceptance.masteryV2BoundaryRevalidated,true);
assert.equal(priority.acceptance.staleManifestDependencyRemoved,true);
assert.equal(priority.acceptance.registryFormulaExact,true);
assert.equal(priority.acceptance.criticalOverrideExact,true);
assert.equal(priority.acceptance.existingCompetencyReviewOnDemand,true);
assert.equal(priority.acceptance.existingCompetencyGrantsMasterReady,false);
assert.equal(priority.acceptance.schedulerEnabled,false);
assert.equal(priority.acceptance.persistenceEnabled,false);
assert.equal(priority.acceptance.runtimeActivationAllowed,false);

console.log('ROADMAP_V2_L25_B97_PRIORITY_CONTRACT=PASS');
console.log(JSON.stringify({
  contract:priority.schema,
  weights:priority.formula.weights,
  criticalWithinWeeks:priority.criticalOverride.maximumWeeksUntilNeeded,
  existingCompetencyDisposition:priority.existingCompetencyRule.disposition,
  existingCompetencyGrantsMasterReady:false,
  persistence:false,
  scheduler:false,
  runtimeActivation:false,
  productionIntegration:priority.mode.productionIntegration
},null,2));
