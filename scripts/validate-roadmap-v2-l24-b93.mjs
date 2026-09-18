import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const mastery=read('roadmap_v2/mastery/mastery-contract.json');
const schema=read('roadmap_v2/mastery/mastery-contract.schema.json');
const eventSchema=read('roadmap_v2/mastery/evidence-event.schema.json');
const snapshotSchema=read('roadmap_v2/mastery/mastery-snapshot.schema.json');
const blueprint=read('roadmap_v2/consumer/blueprint.json');
const diagnostic=read('roadmap_v2/diagnostic/diagnostic-contract.json');
const catalog=read('roadmap_v2/diagnostic/catalog.json');

assert.equal(mastery.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2');
assert.equal(mastery.version,2);
assert.equal(schema.$id,mastery.schema);
assert.equal(mastery.acceptance.currentTrack,'L24');
assert.equal(mastery.acceptance.step,93);

assert.deepEqual(mastery.mode,{
  access:'read_only_harness',
  productionIntegration:'disconnected',
  failClosed:true,
  appendOnlyEvents:true,
  persistentStoreEnabled:false,
  legacyMutationAllowed:false
});

assert.equal(mastery.upstream.consumerBlueprintPath,'roadmap_v2/consumer/blueprint.json');
assert.equal(mastery.upstream.consumerBlueprintSchema,blueprint.schema);
assert.equal(mastery.upstream.consumerBlueprintValidationRequired,blueprint.validation.result);
assert.equal(blueprint.validation.result,'PASS');

assert.equal(mastery.upstream.diagnosticContractPath,'roadmap_v2/diagnostic/diagnostic-contract.json');
assert.equal(mastery.upstream.diagnosticContractSchema,diagnostic.schema);
assert.equal(diagnostic.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2');
assert.equal(mastery.upstream.diagnosticCatalogPath,'roadmap_v2/diagnostic/catalog.json');
assert.equal(mastery.upstream.diagnosticCatalogSchema,catalog.schema);
assert.equal(catalog.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V2');
assert.equal(mastery.upstream.diagnosticResultSchema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_RESULT_V2');
assert.equal(mastery.upstream.evidenceEventSchema,eventSchema.$id);
assert.equal(mastery.upstream.masterySnapshotSchema,snapshotSchema.$id);
assert.equal(mastery.upstream.manifestDependencyRequired,false);
assert.equal(mastery.upstream.staleHistoricalManifestAccepted,false);

assert.deepEqual(mastery.knowledgeStates,[
  'chua_hoc','dang_hoc','dat_prerequisite','master_ready','can_on','gap'
]);
assert.equal(new Set(mastery.knowledgeStates).size,6);
assert.deepEqual(mastery.evidenceTypes,[
  'diagnostic_result','chapter_assessment','exercise_set','lab_or_simulation',
  'project_rubric','retention_check','russian_technical_terms','gap_override'
]);
assert.equal(new Set(mastery.evidenceTypes).size,8);

assert.deepEqual(mastery.thresholds,{
  chapterAssessmentPercent:80,
  criticalPrerequisiteFloorPercent:70,
  exercisePercent:80,
  labExplanationRequired:true,
  projectRubricMinimumPerDimension:3,
  projectRubricDimensions:['correctness','clarity','verification','reproducibility'],
  retentionWindowDays:{minimum:14,maximum:21},
  retentionPercent:75,
  russianTechnicalTermsInGD2GD3:{minimum:5,maximum:10,appliesToNonRussianTargets:true}
});

assert.equal(diagnostic.statusSemantics.pass,'existing_competency_verified');
assert.equal(diagnostic.statusSemantics.forbiddenOutcome,'master_ready');
assert.equal(mastery.diagnosticBoundary.passingStatus,diagnostic.statusSemantics.pass);
assert.deepEqual(mastery.diagnosticBoundary.gapStatuses,['gap','critical_gap']);
assert.equal(mastery.diagnosticBoundary.passingKnowledgeState,'dat_prerequisite');
assert.equal(mastery.diagnosticBoundary.passingDiagnosticSatisfiesChapterAssessment,false);
assert.equal(mastery.diagnosticBoundary.passingDiagnosticGrantsMasterReady,false);
assert.equal(mastery.diagnosticBoundary.diagnosticMasterReadyFieldRequiredFalse,true);
assert.equal(mastery.diagnosticBoundary.diagnosticPersistableFieldRequiredFalse,true);
assert.notEqual(mastery.diagnosticBoundary.passingKnowledgeState,'master_ready');

assert.deepEqual(mastery.masterReadyGate.requiredDimensions,[
  'chapterAssessment','exercise','labOrSimulation','projectRubric','retention'
]);
assert.equal(mastery.masterReadyGate.russianTermsConditionalInGD2GD3,true);
assert.equal(mastery.masterReadyGate.gapOverrideBlocks,true);
assert.equal(mastery.masterReadyGate.allRequiredDimensionsMustPass,true);

assert.deepEqual(mastery.prerequisiteGate.satisfyingStates,['dat_prerequisite','master_ready']);
assert.deepEqual(mastery.prerequisiteGate.blockingStates,['chua_hoc','dang_hoc','can_on','gap']);
assert.equal(mastery.prerequisiteGate.recommendedEdgesDoNotBlock,true);
assert.equal(mastery.prerequisiteGate.externalGatesRemainExplicit,true);

assert.deepEqual(mastery.edgeTypePolicy,{
  blocking:'all_of_satisfied_state',
  just_in_time:'all_of_satisfied_state',
  alternative:'any_of_group',
  concurrent:'source_at_least_in_progress',
  recommended:'advisory_non_blocking',
  contextual:'advisory_explicit_non_blocking'
});
assert.deepEqual(mastery.transitionPriority,[
  'gap_override','master_ready','retention_due','dat_prerequisite','dang_hoc','chua_hoc'
]);

for(const cap of ['eventValidate','streamReduce','snapshotRead','masterReadyEvaluate','prerequisiteGateEvaluate','inMemoryHarnessOnly']){
  assert.equal(mastery.capabilities[cap],true,`required in-memory mastery capability unavailable: ${cap}`);
}
for(const cap of ['persistentStoreWrite','priorityEngineWrite','schedulerWrite','runtimeActivation']){
  assert.equal(mastery.capabilities[cap],false,`forbidden mastery write/runtime capability enabled: ${cap}`);
}

assert.equal(catalog.mode.productionIntegration,'disconnected');
assert.equal(catalog.mode.persistenceEnabled,false);
assert.equal(catalog.counts.verifiedItemBanks,0);
assert.equal(catalog.counts.executablePlans,0);
assert.equal(catalog.counts.generatedQuestionItems,0);

const serialized=JSON.stringify(mastery);
for(const forbidden of [
  'consumerManifest',
  'diagnosticManifest',
  'BAUMAN_ROADMAP_V2_DIAGNOSTIC_RESULT_V1',
  'e383912354673bdce7a0059d6b9a23799d74e689',
  'roadmap_v2/mastery/manifest.json'
]) assert.equal(serialized.includes(forbidden),false,`stale mastery dependency found: ${forbidden}`);

assert.equal(mastery.acceptance.consumerBlueprintBoundaryRevalidated,true);
assert.equal(mastery.acceptance.diagnosticV2BoundaryRevalidated,true);
assert.equal(mastery.acceptance.staleManifestDependencyRemoved,true);
assert.equal(mastery.acceptance.existingCompetencyDistinctFromMasterReady,true);
assert.equal(mastery.acceptance.eventsAppendOnly,true);
assert.equal(mastery.acceptance.persistentStoreEnabled,false);
assert.equal(mastery.acceptance.priorityEngineEnabled,false);
assert.equal(mastery.acceptance.schedulerEnabled,false);
assert.equal(mastery.acceptance.runtimeActivationAllowed,false);
assert.equal(mastery.acceptance.result,'PASS_CONTRACT_ONLY_PENDING_B93_GATE');

console.log('ROADMAP_V2_L24_B93_MASTERY_CONTRACT=PASS');
console.log(JSON.stringify({
  contract:mastery.schema,
  knowledgeStates:mastery.knowledgeStates.length,
  evidenceTypes:mastery.evidenceTypes.length,
  diagnosticPassMapsTo:mastery.diagnosticBoundary.passingKnowledgeState,
  diagnosticGrantsMasterReady:false,
  persistence:false,
  priorityEngine:false,
  scheduler:false,
  runtimeActivation:false,
  productionIntegration:mastery.mode.productionIntegration
},null,2));
