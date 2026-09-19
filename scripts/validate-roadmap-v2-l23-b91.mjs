import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadCurrentDiagnosticHarness} from './roadmap-v2-diagnostic-harness.mjs';

const harness=loadCurrentDiagnosticHarness();
const plan=harness.catalog.plans.find(p=>p.deliveryMode==='static' && p.prerequisiteRefs.length>0) || harness.catalog.plans[0];
assert(plan,'No static diagnostic plan available for B91 harness test');

const difficulties=[
  ...Array(8).fill('easy'),
  ...Array(6).fill('medium'),
  ...Array(4).fill('hard'),
  ...Array(2).fill('expert')
];

function bank(overrides={}){
  const items=difficulties.map((difficulty,i)=>({
    id:`B91-I${String(i+1).padStart(2,'0')}`,
    targetId:plan.targetId,
    difficulty,
    critical:i<4,
    prompt:`B91 validation item ${i+1}`,
    options:[
      {id:'A',text:'A'},
      {id:'B',text:'B'}
    ],
    correctOptionId:'A',
    rationale:`Validated rationale ${i+1}`,
    prerequisiteRefs:[...(plan.prerequisiteRefs||[])],
    evidenceTags:['b91-validation'],
    reviewStatus:'verified'
  }));
  return {
    schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_ITEM_BANK_V1',
    version:1,
    bankId:'B91-VALIDATED-BANK',
    targetId:plan.targetId,
    policyId:'DIAG-20-V1',
    reviewStatus:'verified',
    reviewedBy:'L23-B91-harness-validator',
    sourceProvenance:['synthetic-validation-fixture-only'],
    items,
    ...overrides
  };
}

function attemptFor(b, wrongIds=new Set(), overrides={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_ATTEMPT_V1',
    attemptId:'B91-ATTEMPT',
    planId:plan.id,
    bankId:b.bankId,
    responses:b.items.map(item=>({
      itemId:item.id,
      selectedOptionId:wrongIds.has(item.id)?'B':'A'
    })),
    ...overrides
  };
}

const validBank=bank();
const validation=harness.validateProposedItemBank(plan.id,validBank);
assert.equal(validation.valid,true);
assert.equal(validation.itemCount,20);
assert.deepEqual(validation.difficultyDistribution,{easy:8,medium:6,hard:4,expert:2});
assert.equal(validation.criticalItems,4);
assert.equal(validation.proposedBankHarnessOnly,true);
assert.equal(validation.catalogExecutionReady,false);
assert.equal(validation.productionExecutable,false);
assert.equal(validation.persistenceAllowed,false);
assert(Object.isFrozen(validation));

const session=harness.projectProposedSession(plan.id,validBank);
assert.equal(session.items.length,20);
assert.equal(session.exposesAnswerKey,false);
assert.equal(session.proposedBankHarnessOnly,true);
assert.equal(session.productionExecutable,false);
assert.equal(session.persistenceAllowed,false);
assert(Object.isFrozen(session));
assert(Object.isFrozen(session.items));
for(const item of session.items){
  assert.equal('correctOptionId' in item,false,'answer key leaked into active session');
  assert.equal('rationale' in item,false,'rationale leaked into active session');
  assert.equal('reviewedBy' in item,false,'review metadata leaked into active session');
}

const allCorrect=harness.evaluateProposedAttempt(plan.id,validBank,attemptFor(validBank));
assert.equal(allCorrect.status,'existing_competency_verified');
assert.equal(allCorrect.score.percent,100);
assert.equal(allCorrect.score.criticalPercent,100);
assert.equal(allCorrect.masterReady,false);
assert.equal(allCorrect.persistable,false);
assert.equal(allCorrect.proposedBankHarnessOnly,true);
assert(Object.isFrozen(allCorrect));

const generalWrong=new Set(validBank.items.slice(4,9).map(x=>x.id));
const generalGap=harness.evaluateProposedAttempt(plan.id,validBank,attemptFor(validBank,generalWrong,{attemptId:'B91-GAP'}));
assert.equal(generalGap.score.percent,75);
assert.equal(generalGap.score.criticalPercent,100);
assert.equal(generalGap.status,'gap');
assert.equal(generalGap.masterReady,false);
assert.equal(generalGap.persistable,false);

const criticalWrong=new Set(validBank.items.slice(0,2).map(x=>x.id));
const criticalGap=harness.evaluateProposedAttempt(plan.id,validBank,attemptFor(validBank,criticalWrong,{attemptId:'B91-CRITICAL'}));
assert.equal(criticalGap.score.percent,90);
assert.equal(criticalGap.score.criticalPercent,50);
assert.equal(criticalGap.status,'critical_gap');
assert(criticalGap.reasonCodes.includes('CRITICAL_ITEM_FLOOR_NOT_MET'));
assert.equal(criticalGap.masterReady,false);
assert.equal(criticalGap.persistable,false);

const unreviewed=bank({reviewStatus:'draft'});
assert.equal(harness.validateProposedItemBank(plan.id,unreviewed).valid,false);
assert(harness.validateProposedItemBank(plan.id,unreviewed).errors.includes('BANK_NOT_VERIFIED'));

const wrongTarget=bank({targetId:'UNKNOWN-TARGET'});
assert.equal(harness.validateProposedItemBank(plan.id,wrongTarget).valid,false);
assert(harness.validateProposedItemBank(plan.id,wrongTarget).errors.includes('TARGET_MISMATCH'));

const countMismatch=bank();
countMismatch.items=countMismatch.items.slice(0,19);
assert.equal(harness.validateProposedItemBank(plan.id,countMismatch).valid,false);
assert(harness.validateProposedItemBank(plan.id,countMismatch).errors.includes('ITEM_COUNT_MISMATCH'));

const noCritical=bank();
noCritical.items=noCritical.items.map(x=>({...x,critical:false}));
assert.equal(harness.validateProposedItemBank(plan.id,noCritical).valid,false);
assert(harness.validateProposedItemBank(plan.id,noCritical).errors.includes('NO_CRITICAL_ITEMS'));

const badDistribution=bank();
badDistribution.items[19]={...badDistribution.items[19],difficulty:'easy'};
assert.equal(harness.validateProposedItemBank(plan.id,badDistribution).valid,false);
assert(harness.validateProposedItemBank(plan.id,badDistribution).errors.includes('DIFFICULTY_DISTRIBUTION_MISMATCH'));

const incomplete=attemptFor(validBank);
incomplete.responses=incomplete.responses.slice(0,19);
assert.throws(()=>harness.evaluateProposedAttempt(plan.id,validBank,incomplete),/Every verified diagnostic item must have exactly one valid response/);

const duplicate=attemptFor(validBank);
duplicate.responses[19]={...duplicate.responses[0]};
assert.throws(()=>harness.evaluateProposedAttempt(plan.id,validBank,duplicate),/Duplicate diagnostic response/);

const unknownOption=attemptFor(validBank);
unknownOption.responses[0]={...unknownOption.responses[0],selectedOptionId:'Z'};
assert.throws(()=>harness.evaluateProposedAttempt(plan.id,validBank,unknownOption),/Unknown diagnostic option/);

assert.equal(harness.getPlan('DOES-NOT-EXIST'),null);
assert.equal(harness.getReadiness('DOES-NOT-EXIST'),null);

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bauman-b91-'));
try{
  fs.mkdirSync(path.join(temp,'roadmap_v2'),{recursive:true});
  fs.cpSync('roadmap_v2/consumer',path.join(temp,'roadmap_v2/consumer'),{recursive:true});
  fs.cpSync('roadmap_v2/diagnostic',path.join(temp,'roadmap_v2/diagnostic'),{recursive:true});
  const catalogPath=path.join(temp,'roadmap_v2/diagnostic/catalog.json');
  const tampered=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
  tampered.source.consumerBlueprintGitBlobSha='0000000000000000000000000000000000000000';
  fs.writeFileSync(catalogPath,JSON.stringify(tampered,null,2)+'\n');
  assert.throws(()=>loadCurrentDiagnosticHarness({rootDir:temp}),/Catalog\/Consumer Blueprint fingerprint mismatch/);

  fs.rmSync(path.join(temp,'roadmap_v2/diagnostic/attempt.schema.json'));
  assert.throws(()=>loadCurrentDiagnosticHarness({rootDir:temp}),/Missing current diagnostic file: attempt schema/);
} finally {
  fs.rmSync(temp,{recursive:true,force:true});
}

for(const planRow of harness.catalog.plans){
  assert.equal(planRow.executionReady,false);
  assert.equal(planRow.masterReadyOutcomeAllowed,false);
  assert.equal(planRow.answerLeakageAllowed,false);
  assert.equal(planRow.persistenceAllowed,false);
}
assert.equal(harness.catalog.counts.verifiedItemBanks,0);
assert.equal(harness.catalog.counts.executablePlans,0);
assert.equal(harness.catalog.counts.generatedQuestionItems,0);

console.log('ROADMAP_V2_L23_B91_DIAGNOSTIC_HARNESS=PASS');
console.log(JSON.stringify({
  planId:plan.id,
  targetId:plan.targetId,
  sessionItems:session.items.length,
  outcomes:{
    pass:allCorrect.status,
    gap:generalGap.status,
    criticalGap:criticalGap.status
  },
  answerLeakage:false,
  persistence:false,
  masterReady:false,
  productionExecutable:false,
  negativeCases:10
},null,2));
