import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const historical=read('roadmap_v2/readiness/readiness-contract.json');
const current=read('roadmap_v2/readiness/current-contract.json');
const blueprint=read('roadmap_v2/consumer/blueprint.json');
const mastery=read('roadmap_v2/mastery/mastery-contract.json');
const masterySnapshot=read('roadmap_v2/mastery/mastery-snapshot.schema.json');
const scheduler=read('roadmap_v2/scheduler/current-contract.json');
const schedulerRequest=read('roadmap_v2/scheduler/scheduler-request.schema.json');
const schedulerResult=read('roadmap_v2/scheduler/scheduler-result.schema.json');

assert.equal(historical.schema,'BAUMAN_ROADMAP_V2_READINESS_CONTRACT_V1');
assert.equal(historical.version,'2.7.0-l27-b105');
assert.equal(historical.upstreamSchemas.consumerManifest,'BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1');
assert.equal(historical.upstreamSchemas.masteryManifest,'BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1');
assert.equal(historical.upstreamSchemas.schedulerManifest,'BAUMAN_ROADMAP_V2_SCHEDULER_MANIFEST_V1');

assert.equal(current.schema,'BAUMAN_ROADMAP_V2_READINESS_CONTRACT_V1');
assert.equal(current.version,'2.7.2-l27-b105-h2-current');
assert.equal(current.upstreamSchemas.consumerBlueprint,blueprint.schema);
assert.equal(current.upstreamSchemas.masteryContract,mastery.schema);
assert.equal(current.upstreamSchemas.masterySnapshot,masterySnapshot.$id);
assert.equal(current.upstreamSchemas.schedulerContract,scheduler.schema);
assert.equal(current.upstreamSchemas.schedulerRequest,schedulerRequest.$id);
assert.equal(current.upstreamSchemas.schedulerResult,schedulerResult.$id);
assert.equal(JSON.stringify(current.upstreamSchemas).includes('MANIFEST'),false);
assert.equal(current.acceptance.currentTrack,'L27');
assert.equal(current.acceptance.staleManifestDependencyRemoved,true);
assert.equal(current.acceptance.lessonPrerequisiteInheritancePinned,true);
assert.equal(current.targetPolicy.prerequisiteResolution,'chapter_policy_inherited_by_lessons');

for(const key of ['readinessDimensions','targetPolicy','statusPolicy','overallPolicy','externalGatePolicy','outputPolicy','capabilities']){
  assert.deepEqual(current[key],historical[key],`Readiness policy drift: ${key}`);
}

assert.equal(current.mode.productionIntegration,'disconnected');
assert.equal(current.mode.persistentStoreEnabled,false);
assert.equal(current.mode.dashboardUiEnabled,false);
assert.equal(current.mode.runtimeWriteAllowed,false);
assert.equal(current.mode.notificationWriteAllowed,false);
assert.equal(current.targetPolicy.missingSnapshotPolicy,'red_unknown');
assert.equal(current.targetPolicy.unverifiedMasterReadyClaimPolicy,'red_unknown');
assert.equal(current.overallPolicy.manualOverrideAllowed,false);
assert.equal(current.externalGatePolicy.verifiedSourceRequired,true);
assert.equal(current.externalGatePolicy.missingGateDefaultsToSatisfied,false);
assert.equal(current.externalGatePolicy.callerBooleanMapAccepted,false);
assert.equal(current.outputPolicy.deepFrozen,true);
assert.equal(current.outputPolicy.persistentSnapshot,false);
assert.equal(current.capabilities.dashboardUiRender,false);
assert.equal(current.capabilities.runtimeActivation,false);
assert.equal(current.capabilities.notificationWrite,false);

assert(current.statusPolicy.red.whenAny.includes('master_ready claim lacks a passed Master-ready evidence gate'));
assert(current.statusPolicy.green.whenAll.includes('Master-ready evidence gate is present and passed'));
assert(current.abortConditions.includes('dependency on quarantined historical Consumer/Mastery/Scheduler manifest or baseline hash'));

const source=fs.readFileSync('roadmap_v2/readiness/current-contract.json','utf8');
for(const forbidden of ['BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1','BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1','BAUMAN_ROADMAP_V2_SCHEDULER_MANIFEST_V1']){
  assert.equal(source.includes(forbidden),false,`Current readiness overlay retained stale identity: ${forbidden}`);
}

console.log('ROADMAP_V2_L27_B105_READINESS_CONTRACT=PASS');
console.log(JSON.stringify({
  readiness:current.schema,
  consumer:blueprint.schema,
  mastery:mastery.schema,
  scheduler:scheduler.version,
  staleManifestDependency:false,
  missingEvidenceFailsClosed:true,
  masterReadyGateRequiredForGreen:true,
  productionIntegration:'disconnected',
  persistence:false,
  dashboardUi:false,
  runtimeWrite:false,
  notificationWrite:false
},null,2));
