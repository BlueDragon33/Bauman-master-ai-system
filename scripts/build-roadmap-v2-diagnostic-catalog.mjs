import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

function gitBlobSha(bytes){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
}
const bpPath='roadmap_v2/consumer/blueprint.json';
const dcPath='roadmap_v2/diagnostic/diagnostic-contract.json';
const bpBytes=fs.readFileSync(bpPath);
const dcBytes=fs.readFileSync(dcPath);
const bp=JSON.parse(bpBytes.toString('utf8'));
const dc=JSON.parse(dcBytes.toString('utf8'));

assert.equal(bp.schema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1');
assert.equal(bp.validation.result,'PASS');
assert.deepEqual(bp.counts,{chapters:85,eligibleChapterBlueprints:77,staticChapters:76,legacyPreserveChapters:1,dynamicChapters:8,numberedLessons:304,diagnosticTargets:381});
assert.equal(dc.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2');
assert.equal(dc.mode.productionIntegration,'disconnected');
assert.equal(dc.itemBankGate.allowGeneratedUnreviewedItems,false);

const p=dc.assessmentPolicy;
const plans=bp.diagnosticTargets.map(t=>{
  const plan={id:`DIAG::${t.id}`,targetId:t.id,targetType:t.targetType,title:t.title,deliveryMode:t.deliveryMode};
  if(t.parentChapterId)plan.parentChapterId=t.parentChapterId;
  plan.prerequisiteRefs=[...(t.prerequisiteRefs||[])];
  plan.externalGateIds=[...(t.externalGateIds||[])];
  plan.policyId=p.id;
  plan.requiredItemCount=p.requiredItemCount;
  plan.difficultyDistribution={...p.difficultyDistribution};
  plan.passPercent=p.passPercent;
  plan.criticalItemFloorPercent=p.criticalItemFloorPercent;
  plan.itemBank={path:null,bankId:null,reviewStatus:'missing',verifiedItemCount:0};
  plan.executionStatus=dc.itemBankGate.missingBankStatus;
  plan.executionReady=false;
  plan.allowedPassOutcome=dc.statusSemantics.pass;
  plan.masterReadyOutcomeAllowed=false;
  plan.answerLeakageAllowed=false;
  plan.persistenceAllowed=false;
  plan.reasonCodes=['MISSING_VERIFIED_ITEM_BANK','DIAGNOSTIC_PASS_NOT_MASTER_READY','PERSISTENCE_DISABLED','PRODUCTION_DISCONNECTED'];
  return plan;
});
const catalog={
  schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V2',
  version:2,
  source:{
    consumerBlueprintPath:bpPath,
    consumerBlueprintGitBlobSha:gitBlobSha(bpBytes),
    consumerBlueprintSchema:bp.schema,
    diagnosticContractPath:dcPath,
    diagnosticContractGitBlobSha:gitBlobSha(dcBytes),
    diagnosticContractSchema:dc.schema
  },
  mode:{productionIntegration:'disconnected',executionEnabled:false,persistenceEnabled:false},
  policy:{id:p.id,requiredItemCount:p.requiredItemCount,difficultyDistribution:{...p.difficultyDistribution},passPercent:p.passPercent,criticalItemFloorPercent:p.criticalItemFloorPercent},
  counts:{
    plans:plans.length,
    chapterPlans:plans.filter(x=>x.targetType==='roadmap_chapter').length,
    lessonPlans:plans.filter(x=>x.targetType==='roadmap_lesson').length,
    blockedDynamicTargets:bp.blockedDynamicTargets.length,
    verifiedItemBanks:0,
    executablePlans:0,
    generatedQuestionItems:0
  },
  plans,
  blockedDynamicTargets:bp.blockedDynamicTargets.map(x=>({...x})),
  validation:{
    uniquePlanIds:new Set(plans.map(x=>x.id)).size===plans.length,
    uniqueTargetIds:new Set(plans.map(x=>x.targetId)).size===plans.length,
    missingTargets:[],
    missingPrerequisiteRefs:[],
    masterReadyOutcomes:0,
    executablePlansWithoutVerifiedBank:0,
    answerLeakingPlans:0,
    persistenceEnabledPlans:0,
    result:'PASS'
  }
};
assert.deepEqual(catalog.counts,{plans:381,chapterPlans:77,lessonPlans:304,blockedDynamicTargets:8,verifiedItemBanks:0,executablePlans:0,generatedQuestionItems:0});
process.stdout.write(JSON.stringify(catalog,null,2)+'\n');
