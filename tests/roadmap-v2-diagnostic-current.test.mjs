import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {loadCurrentDiagnosticHarness} from '../scripts/roadmap-v2-diagnostic-harness.mjs';

function buildBank(targetId='MATH-L2-C07'){
  const difficulties=[
    ...Array(8).fill('easy'),
    ...Array(6).fill('medium'),
    ...Array(4).fill('hard'),
    ...Array(2).fill('expert')
  ];
  return {
    schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_ITEM_BANK_V1',
    version:1,
    bankId:`BANK::${targetId}::B91-FIXTURE`,
    targetId,
    policyId:'DIAG-20-V1',
    reviewStatus:'verified',
    reviewedBy:'L23 B91 deterministic test fixture',
    sourceProvenance:['synthetic validation-only fixture; never attached to current catalog'],
    items:difficulties.map((difficulty,index)=>({
      id:`ITEM-${String(index+1).padStart(2,'0')}`,
      targetId,
      difficulty,
      critical:index<10,
      prompt:`Deterministic diagnostic fixture ${index+1}`,
      options:[
        {id:'A',text:'Correct fixture option'},
        {id:'B',text:'Incorrect fixture option'}
      ],
      correctOptionId:'A',
      rationale:'Deterministic fixture rationale.',
      prerequisiteRefs:['MATH-L2-C05'],
      evidenceTags:['b91_test_fixture'],
      reviewStatus:'verified'
    }))
  };
}
function buildAttempt(planId,bank,wrong=[]){
  const bad=new Set(wrong);
  return {
    schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_ATTEMPT_V1',
    attemptId:'ATTEMPT::B91::TEST',
    planId,
    bankId:bank.bankId,
    responses:bank.items.map(item=>({
      itemId:item.id,
      selectedOptionId:bad.has(item.id)?'B':'A'
    }))
  };
}
function tempRoot(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'bauman-b91-'));
  fs.cpSync(path.resolve('roadmap_v2'),path.join(root,'roadmap_v2'),{recursive:true});
  return root;
}

test('loads current B91 harness with 381 fail-closed catalog plans',()=>{
  const h=loadCurrentDiagnosticHarness();
  assert.equal(h.catalog.counts.plans,381);
  assert.equal(h.catalog.counts.chapterPlans,77);
  assert.equal(h.catalog.counts.lessonPlans,304);
  assert.equal(h.catalog.counts.blockedDynamicTargets,8);
  assert.equal(h.catalog.counts.verifiedItemBanks,0);
  assert.equal(h.catalog.counts.executablePlans,0);
  assert.equal(h.catalog.plans.every(p=>p.executionReady===false),true);
});

test('explains missing-bank readiness without fabricating content',()=>{
  const h=loadCurrentDiagnosticHarness();
  const r=h.getReadiness('MATH-L2-C07');
  assert.equal(r.executionReady,false);
  assert.equal(r.executionStatus,'blocked_missing_verified_item_bank');
  assert.deepEqual(r.itemBank,{path:null,bankId:null,reviewStatus:'missing',verifiedItemCount:0});
  assert.equal(r.reasonCodes.includes('MISSING_VERIFIED_ITEM_BANK'),true);
  assert.equal(h.getReadiness('DOES-NOT-EXIST'),null);
});

test('validates reviewed 20-item proposed bank without changing catalog readiness',()=>{
  const h=loadCurrentDiagnosticHarness();
  const bank=buildBank();
  const v=h.validateProposedItemBank('MATH-L2-C07',bank);
  assert.equal(v.valid,true);
  assert.equal(v.itemCount,20);
  assert.deepEqual(v.difficultyDistribution,{easy:8,medium:6,hard:4,expert:2});
  assert.equal(v.criticalItems,10);
  assert.equal(v.proposedBankHarnessOnly,true);
  assert.equal(v.catalogExecutionReady,false);
  assert.equal(v.productionExecutable,false);
  assert.equal(v.persistenceAllowed,false);
  assert.equal(h.getReadiness('MATH-L2-C07').executionReady,false);
});

test('projects active session without answer key, rationale or review metadata',()=>{
  const h=loadCurrentDiagnosticHarness();
  const session=h.projectProposedSession('MATH-L2-C07',buildBank());
  assert.equal(session.items.length,20);
  assert.equal(session.exposesAnswerKey,false);
  assert.equal(session.productionExecutable,false);
  assert.equal(session.persistenceAllowed,false);
  for(const item of session.items){
    assert.equal(item.correctOptionId,undefined);
    assert.equal(item.rationale,undefined);
    assert.equal(item.reviewedBy,undefined);
    assert.equal(item.reviewStatus,undefined);
  }
});

test('classifies full pass as existing competency, never Master-ready',()=>{
  const h=loadCurrentDiagnosticHarness();
  const plan=h.getPlan('MATH-L2-C07');
  const bank=buildBank();
  const result=h.evaluateProposedAttempt(plan.id,bank,buildAttempt(plan.id,bank));
  assert.equal(result.status,'existing_competency_verified');
  assert.equal(result.score.percent,100);
  assert.equal(result.score.criticalPercent,100);
  assert.equal(result.masterReady,false);
  assert.equal(result.persistable,false);
  assert.equal(result.reasonCodes.includes('DIAGNOSTIC_PASS_NOT_MASTER_READY'),true);
});

test('enforces critical floor at an 80 percent overall score',()=>{
  const h=loadCurrentDiagnosticHarness();
  const plan=h.getPlan('MATH-L2-C07');
  const bank=buildBank();
  const result=h.evaluateProposedAttempt(plan.id,bank,buildAttempt(plan.id,bank,['ITEM-01','ITEM-02','ITEM-03','ITEM-04']));
  assert.equal(result.score.percent,80);
  assert.equal(result.score.criticalPercent,60);
  assert.equal(result.status,'critical_gap');
  assert.equal(result.masterReady,false);
  assert.equal(result.reasonCodes.includes('CRITICAL_ITEM_FLOOR_NOT_MET'),true);
});

test('classifies score below threshold as gap with prerequisite evidence',()=>{
  const h=loadCurrentDiagnosticHarness();
  const plan=h.getPlan('MATH-L2-C07');
  const bank=buildBank();
  const result=h.evaluateProposedAttempt(plan.id,bank,buildAttempt(plan.id,bank,['ITEM-01','ITEM-02','ITEM-03','ITEM-04','ITEM-11']));
  assert.equal(result.score.percent,75);
  assert.equal(result.status,'gap');
  assert.deepEqual(result.gapPrerequisiteRefs,['MATH-L2-C05']);
  assert.equal(result.masterReady,false);
  assert.equal(result.persistable,false);
});

test('rejects unreviewed, wrong-distribution and non-critical banks',()=>{
  const h=loadCurrentDiagnosticHarness();

  const unreviewed=buildBank();
  unreviewed.reviewStatus='draft';
  assert.equal(h.validateProposedItemBank('MATH-L2-C07',unreviewed).errors.includes('BANK_NOT_VERIFIED'),true);

  const wrongDistribution=buildBank();
  wrongDistribution.items[0].difficulty='expert';
  assert.equal(h.validateProposedItemBank('MATH-L2-C07',wrongDistribution).errors.includes('DIFFICULTY_DISTRIBUTION_MISMATCH'),true);

  const noCritical=buildBank();
  for(const item of noCritical.items)item.critical=false;
  assert.equal(h.validateProposedItemBank('MATH-L2-C07',noCritical).errors.includes('NO_CRITICAL_ITEMS'),true);
});

test('rejects target drift and unknown prerequisite references',()=>{
  const h=loadCurrentDiagnosticHarness();

  const targetDrift=buildBank('MATH-L2-C06');
  assert.equal(h.validateProposedItemBank('MATH-L2-C07',targetDrift).errors.includes('TARGET_MISMATCH'),true);

  const badPrerequisite=buildBank();
  badPrerequisite.items[0].prerequisiteRefs=['DOES-NOT-EXIST'];
  assert.equal(h.validateProposedItemBank('MATH-L2-C07',badPrerequisite).errors.includes('UNKNOWN_PREREQUISITE_REF:DOES-NOT-EXIST'),true);
});

test('rejects incomplete, duplicate and unknown-option attempts',()=>{
  const h=loadCurrentDiagnosticHarness();
  const plan=h.getPlan('MATH-L2-C07');
  const bank=buildBank();

  const incomplete=buildAttempt(plan.id,bank);
  incomplete.responses.pop();
  assert.throws(()=>h.evaluateProposedAttempt(plan.id,bank,incomplete),/Every verified diagnostic item/);

  const duplicate=buildAttempt(plan.id,bank);
  duplicate.responses[19]={...duplicate.responses[0]};
  assert.throws(()=>h.evaluateProposedAttempt(plan.id,bank,duplicate),/Duplicate diagnostic response/);

  const unknown=buildAttempt(plan.id,bank);
  unknown.responses[0].selectedOptionId='UNKNOWN';
  assert.throws(()=>h.evaluateProposedAttempt(plan.id,bank,unknown),/Unknown diagnostic option/);
});

test('returns deep-frozen plans, sessions and results',()=>{
  const h=loadCurrentDiagnosticHarness();
  const plan=h.getPlan('MATH-L2-C07');
  const bank=buildBank();
  const session=h.projectProposedSession(plan.id,bank);
  const result=h.evaluateProposedAttempt(plan.id,bank,buildAttempt(plan.id,bank));
  assert.equal(Object.isFrozen(h),true);
  assert.equal(Object.isFrozen(plan),true);
  assert.equal(Object.isFrozen(session),true);
  assert.equal(Object.isFrozen(session.items),true);
  assert.equal(Object.isFrozen(result),true);
  assert.throws(()=>session.items.push({}),TypeError);
  assert.throws(()=>{result.status='master_ready';},TypeError);
});

test('fails closed when current Consumer Blueprint fingerprint is tampered',()=>{
  const root=tempRoot();
  try{
    fs.appendFileSync(path.join(root,'roadmap_v2','consumer','blueprint.json'),'\n');
    assert.throws(()=>loadCurrentDiagnosticHarness({rootDir:root}),/Catalog\/Consumer Blueprint fingerprint mismatch/);
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});

test('fails closed when catalog attempts to enable execution',()=>{
  const root=tempRoot();
  try{
    const file=path.join(root,'roadmap_v2','diagnostic','catalog.json');
    const cat=JSON.parse(fs.readFileSync(file,'utf8'));
    cat.plans[0].executionReady=true;
    fs.writeFileSync(file,JSON.stringify(cat,null,2)+'\n');
    assert.throws(()=>loadCurrentDiagnosticHarness({rootDir:root}),/Executable plan leaked/);
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});

test('fails closed when a required diagnostic schema is missing',()=>{
  const root=tempRoot();
  try{
    fs.rmSync(path.join(root,'roadmap_v2','diagnostic','attempt.schema.json'));
    assert.throws(()=>loadCurrentDiagnosticHarness({rootDir:root}),/Missing current diagnostic file: attempt schema/);
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});
