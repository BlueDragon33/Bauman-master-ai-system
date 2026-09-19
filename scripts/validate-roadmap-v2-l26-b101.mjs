import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const scheduler=read('roadmap_v2/scheduler/scheduler-contract.json');
const schedulerSchema=read('roadmap_v2/scheduler/scheduler-contract.schema.json');
const requestSchema=read('roadmap_v2/scheduler/scheduler-request.schema.json');
const resultSchema=read('roadmap_v2/scheduler/scheduler-result.schema.json');
const blueprint=read('roadmap_v2/consumer/blueprint.json');
const priority=read('roadmap_v2/priority/priority-contract.json');
const priorityCandidate=read('roadmap_v2/priority/priority-candidate.schema.json');
const priorityResult=read('roadmap_v2/priority/priority-result.schema.json');

assert.equal(scheduler.schema,'BAUMAN_ROADMAP_V2_SCHEDULER_CONTRACT_V1');
assert.equal(schedulerSchema.$id,scheduler.schema);
assert.equal(scheduler.version,'2.6.1-l26-b101-current');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_SCHEDULER_RESULT_V1');

assert.deepEqual(scheduler.mode,{
  access:'in_memory_projection_harness',
  productionIntegration:'disconnected',
  failClosed:true,
  calendarReadEnabled:false,
  calendarWriteEnabled:false,
  persistentStoreEnabled:false,
  runtimeWriteAllowed:false,
  dynamicContentGenerationAllowed:false
});

assert.equal(blueprint.schema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1');
assert.equal(blueprint.validation.result,'PASS');
assert.equal(priority.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(priority.mode.productionIntegration,'disconnected');
assert.equal(priority.mode.persistentStoreEnabled,false);
assert.equal(priority.mode.schedulerWriteAllowed,false);
assert.equal(priority.mode.runtimeWriteAllowed,false);
assert.equal(priorityCandidate.$id,'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1');
assert.equal(priorityResult.$id,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');

assert.deepEqual(scheduler.upstreamSchemas,{
  consumerBlueprint:blueprint.schema,
  priorityContract:priority.schema,
  priorityCandidate:priorityCandidate.$id,
  priorityResult:priorityResult.$id
});
const serialized=JSON.stringify(scheduler);
for(const stale of [
  'BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1',
  'BAUMAN_ROADMAP_V2_PRIORITY_MANIFEST_V1',
  'roadmap_v2/consumer/manifest.json',
  'roadmap_v2/priority/manifest.json'
]) assert.equal(serialized.includes(stale),false,`stale scheduler dependency found: ${stale}`);

assert.deepEqual(Object.keys(scheduler.phasePolicies),['GD0','GD1','GD2','GD3']);
assert.equal(scheduler.phasePolicies.GD1.technicalSessionMinimumAdvisory,2);
assert.equal(scheduler.phasePolicies.GD1.technicalSessionMaximum,3);
assert.deepEqual(scheduler.phasePolicies.GD1.technicalRotationTracks,['python','database','math']);
assert.equal(scheduler.phasePolicies.GD3.masterMode,true);
assert.equal(scheduler.phasePolicies.GD3.currentBaumanOverride,true);
assert.deepEqual(scheduler.phasePolicies.GD3.previewWindowWeeks,{minimum:2,maximum:4});

assert.equal(scheduler.priorityAdmission.recomputeFromPriorityCandidate,true);
assert.equal(scheduler.priorityAdmission.acceptCallerSuppliedPriorityResult,false);
assert.equal(scheduler.priorityAdmission.criticalFirst,true);
assert.equal(scheduler.priorityAdmission.reviewOnDemandGrantsMasterReady,false);
assert.equal(scheduler.bundlePolicy.technicalAndRussianTwinAtomic,true);
assert.equal(scheduler.bundlePolicy.partialBundleAllowed,false);
assert.equal(scheduler.bundlePolicy.capacityOverrunAllowed,false);

for(const cap of ['requestValidate','priorityRecompute','weeklyProject','masterModeOverrideProject','russianTwinPlaceholderProject']){
  assert.equal(scheduler.capabilities[cap],true,`required scheduler capability unavailable: ${cap}`);
}
for(const cap of ['calendarRead','calendarWrite','persistentStoreWrite','runtimeActivation','dynamicContentGenerate']){
  assert.equal(scheduler.capabilities[cap],false,`forbidden scheduler capability enabled: ${cap}`);
}
assert.equal(scheduler.outputPolicy.weeklyProjectionOnly,true);
assert.equal(scheduler.outputPolicy.actualCalendarEvents,false);
assert.equal(scheduler.outputPolicy.persistentSchedule,false);
assert.equal(scheduler.outputPolicy.deepFrozen,true);

assert.equal(scheduler.acceptance.currentTrack,'L26');
assert.equal(scheduler.acceptance.step,101);
assert.equal(scheduler.acceptance.consumerBlueprintBoundaryRevalidated,true);
assert.equal(scheduler.acceptance.priorityV2BoundaryRevalidated,true);
assert.equal(scheduler.acceptance.staleManifestDependencyRemoved,true);
assert.equal(scheduler.acceptance.productionCalendarConnected,false);
assert.equal(scheduler.acceptance.runtimeActivationAllowed,false);

console.log('ROADMAP_V2_L26_B101_SCHEDULER_CONTRACT=PASS');
console.log(JSON.stringify({
  scheduler:scheduler.schema,
  consumerBlueprint:blueprint.schema,
  priority:priority.schema,
  phases:Object.keys(scheduler.phasePolicies),
  productionIntegration:scheduler.mode.productionIntegration,
  calendarRead:false,
  calendarWrite:false,
  persistence:false,
  runtimeActivation:false
},null,2));
