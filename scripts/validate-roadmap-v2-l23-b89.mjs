import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const consumer=read('roadmap_v2/consumer/consumer-contract.json');
const contract=read('roadmap_v2/diagnostic/diagnostic-contract.json');
const schema=read('roadmap_v2/diagnostic/diagnostic-contract.schema.json');
const bankSchema=read('roadmap_v2/diagnostic/item-bank.schema.json');
const attemptSchema=read('roadmap_v2/diagnostic/attempt.schema.json');

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2');
assert.equal(contract.version,2);
assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2');
assert.equal(schema.properties.schema.const,contract.schema);
assert.equal(schema.properties.version.const,contract.version);

assert.equal(contract.upstream.consumerContractPath,'roadmap_v2/consumer/consumer-contract.json');
assert.equal(contract.upstream.consumerContractSchema,consumer.schema);
assert.equal(contract.upstream.manifestDependencyRequired,false);
assert.equal(contract.upstream.staleHistoricalManifestAccepted,false);
assert.equal(JSON.stringify(contract).includes('consumerManifestSchema'),false,'stale consumer manifest coupling remains');
assert.equal(JSON.stringify(contract).includes('consumerManifestSha256'),false,'stale consumer manifest hash coupling remains');

for(const cap of contract.upstream.requiredConsumerCapabilities){
  assert.equal(consumer.capabilities[cap],true,`required consumer capability unavailable: ${cap}`);
}
for(const cap of contract.upstream.forbiddenConsumerCapabilities){
  assert.equal(consumer.capabilities[cap],false,`forbidden consumer capability unexpectedly enabled: ${cap}`);
}

const p=contract.assessmentPolicy;
assert.equal(p.id,'DIAG-20-V1');
assert.equal(p.requiredItemCount,20);
assert.deepEqual(p.difficultyDistribution,{easy:8,medium:6,hard:4,expert:2});
assert.equal(Object.values(p.difficultyDistribution).reduce((a,b)=>a+b,0),20);
assert.equal(p.passPercent,80);
assert.equal(p.criticalItemFloorPercent,70);
for(const key of ['requiresUniqueItemIds','requiresReviewedItems','requiresCriticalItems','requiresExactTargetMatch','requiresPrerequisiteRefsToExist']){
  assert.equal(p[key],true,`assessment invariant disabled: ${key}`);
}

assert.equal(bankSchema.properties.policyId.const,p.id,'item-bank policy ID drift');
assert.equal(bankSchema.properties.items.minItems,20);
assert.equal(bankSchema.properties.items.maxItems,20);
assert.equal(attemptSchema.properties.responses.minItems,20);
assert.equal(attemptSchema.properties.responses.maxItems,20);

assert.equal(contract.statusSemantics.pass,'existing_competency_verified');
assert.equal(contract.statusSemantics.fail,'gap');
assert.equal(contract.statusSemantics.criticalFloorFail,'critical_gap');
assert.equal(contract.statusSemantics.blocked,'diagnostic_blocked');
assert.equal(contract.statusSemantics.forbiddenOutcome,'master_ready');

assert.deepEqual(contract.sessionProjection.answerKeyFieldsExcluded,['correctOptionId','rationale']);
assert.equal(contract.sessionProjection.answerKeyFieldsExcluded.includes('correctOptionId'),true);
assert.equal(contract.sessionProjection.answerKeyFieldsExcluded.includes('rationale'),true);
assert.equal(contract.sessionProjection.reviewMetadataExcluded.includes('reviewedBy'),true);
assert.equal(contract.sessionProjection.requiresStableItemOrder,true);
assert.equal(contract.sessionProjection.allowsAnswerRevealDuringActiveSession,false);

assert.equal(contract.mode.access,'read_only');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.failClosed,true);
assert.equal(contract.mode.writesMasteryEvidence,false);
assert.equal(contract.mode.writesLearnerState,false);
assert.equal(contract.mode.writesLegacyRuntime,false);

for(const cap of ['masteryEvidenceWrite','learnerStateWrite','priorityEngineWrite','schedulerWrite','runtimeActivation']){
  assert.equal(contract.capabilities[cap],false,`write/activation capability enabled: ${cap}`);
}
assert.equal(contract.capabilities.proposedBankHarnessOnly,true);
assert.equal(contract.itemBankGate.allowGeneratedUnreviewedItems,false);

assert.equal(contract.acceptance.step,89);
assert.equal(contract.acceptance.currentTrack,'L23');
assert.equal(contract.acceptance.consumerBoundaryRevalidated,true);
assert.equal(contract.acceptance.staleManifestDependencyRemoved,true);
assert.equal(contract.acceptance.existingCompetencyDistinctFromMasterReady,true);
assert.equal(contract.acceptance.activeSessionAnswerLeakageForbidden,true);
assert.equal(contract.acceptance.unreviewedGenerationForbidden,true);
assert.equal(contract.acceptance.masteryPersistenceEnabled,false);
assert.equal(contract.acceptance.learnerStatePersistenceEnabled,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);

console.log('ROADMAP_V2_L23_B89_DIAGNOSTIC_CONTRACT=PASS');
console.log(JSON.stringify({
  contract:contract.schema,
  policy:p.id,
  itemCount:p.requiredItemCount,
  distribution:p.difficultyDistribution,
  passPercent:p.passPercent,
  criticalFloorPercent:p.criticalItemFloorPercent,
  manifestDependency:false,
  productionIntegration:contract.mode.productionIntegration,
  persistence:false,
  answerLeakage:false
},null,2));
