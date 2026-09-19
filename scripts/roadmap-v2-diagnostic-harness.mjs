import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function deepFreeze(value){
  if(!value || typeof value!=='object' || Object.isFrozen(value)) return value;
  for(const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
function clone(value){ return JSON.parse(JSON.stringify(value)); }
function cloneFrozen(value){ return deepFreeze(clone(value)); }
function gitBlobSha(bytes){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
}
function readJson(file,label){
  if(!fs.existsSync(file)) throw new Error(`Missing current diagnostic file: ${label}`);
  const bytes=fs.readFileSync(file);
  let value;
  try{ value=JSON.parse(bytes.toString('utf8')); }
  catch{ throw new Error(`Invalid current diagnostic JSON: ${label}`); }
  return {bytes,value};
}
function counts(values){
  const out={easy:0,medium:0,hard:0,expert:0};
  for(const value of values) if(Object.hasOwn(out,value)) out[value]+=1;
  return out;
}
function sameCounts(a,b){ return Object.keys(b).every(k=>a[k]===b[k]); }

export function loadCurrentDiagnosticHarness(options={}){
  const root=path.resolve(options.rootDir||process.cwd());
  const roadmap=path.join(root,'roadmap_v2');
  const consumerContract=readJson(path.join(roadmap,'consumer','consumer-contract.json'),'consumer contract');
  const blueprintLoaded=readJson(path.join(roadmap,'consumer','blueprint.json'),'consumer blueprint');
  const contractLoaded=readJson(path.join(roadmap,'diagnostic','diagnostic-contract.json'),'diagnostic contract');
  const contractSchema=readJson(path.join(roadmap,'diagnostic','diagnostic-contract.schema.json'),'diagnostic contract schema').value;
  const catalogLoaded=readJson(path.join(roadmap,'diagnostic','catalog.json'),'diagnostic catalog');
  const catalogSchema=readJson(path.join(roadmap,'diagnostic','catalog.schema.json'),'diagnostic catalog schema').value;
  const itemBankSchema=readJson(path.join(roadmap,'diagnostic','item-bank.schema.json'),'item bank schema').value;
  const attemptSchema=readJson(path.join(roadmap,'diagnostic','attempt.schema.json'),'attempt schema').value;

  const consumer=consumerContract.value;
  const blueprint=blueprintLoaded.value;
  const contract=contractLoaded.value;
  const catalog=catalogLoaded.value;

  assert.equal(consumer.schema,'BAUMAN_ROADMAP_V2_CONSUMER_CONTRACT_V1','Unsupported current Consumer contract');
  assert.equal(consumer.mode.productionIntegration,'disconnected','Consumer production boundary widened');
  assert.equal(consumer.capabilities.diagnosticBlueprintRead,true,'Consumer diagnostic blueprint unavailable');
  assert.equal(consumer.capabilities.diagnosticExecution,false,'Consumer diagnostic execution unexpectedly enabled');

  assert.equal(blueprint.schema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1','Unsupported current Consumer blueprint');
  assert.equal(blueprint.validation.result,'PASS','Consumer blueprint validation is not PASS');
  assert.equal(blueprint.mode.productionIntegration,'disconnected','Consumer blueprint production boundary widened');
  assert.equal(blueprint.mode.diagnosticExecution,false,'Consumer blueprint execution unexpectedly enabled');

  assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V2','Unsupported current Diagnostic contract');
  assert.equal(contractSchema.$id,contract.schema,'Diagnostic contract/schema identity mismatch');
  assert.equal(contract.mode.access,'read_only','Diagnostic contract is not read-only');
  assert.equal(contract.mode.failClosed,true,'Diagnostic contract is not fail-closed');
  assert.equal(contract.mode.productionIntegration,'disconnected','Diagnostic production boundary widened');
  assert.equal(contract.mode.writesMasteryEvidence,false,'Diagnostic mastery write enabled');
  assert.equal(contract.mode.writesLearnerState,false,'Diagnostic learner-state write enabled');
  assert.equal(contract.mode.writesLegacyRuntime,false,'Diagnostic legacy runtime write enabled');
  assert.equal(contract.capabilities.masteryEvidenceWrite,false,'Mastery evidence write capability enabled');
  assert.equal(contract.capabilities.learnerStateWrite,false,'Learner-state write capability enabled');
  assert.equal(contract.capabilities.priorityEngineWrite,false,'Priority write capability enabled');
  assert.equal(contract.capabilities.schedulerWrite,false,'Scheduler write capability enabled');
  assert.equal(contract.capabilities.runtimeActivation,false,'Runtime activation enabled');

  assert.equal(catalog.schema,'BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V2','Unsupported current Diagnostic catalog');
  assert.equal(catalogSchema.$id,catalog.schema,'Diagnostic catalog/schema identity mismatch');
  assert.equal(catalog.mode.productionIntegration,'disconnected','Catalog production boundary widened');
  assert.equal(catalog.mode.executionEnabled,false,'Catalog execution unexpectedly enabled');
  assert.equal(catalog.mode.persistenceEnabled,false,'Catalog persistence unexpectedly enabled');
  assert.equal(catalog.source.consumerBlueprintGitBlobSha,gitBlobSha(blueprintLoaded.bytes),'Catalog/Consumer Blueprint fingerprint mismatch');
  assert.equal(catalog.source.diagnosticContractGitBlobSha,gitBlobSha(contractLoaded.bytes),'Catalog/Diagnostic Contract fingerprint mismatch');
  assert.equal(itemBankSchema.$id,contract.itemBankGate.schema,'Item bank schema identity mismatch');
  assert.equal(attemptSchema.$id,contract.attemptGate.schema,'Attempt schema identity mismatch');
  assert.equal(catalog.counts.plans,381,'Diagnostic plan count drift');
  assert.equal(catalog.counts.verifiedItemBanks,0,'Verified item bank unexpectedly attached');
  assert.equal(catalog.counts.executablePlans,0,'Diagnostic catalog prematurely executable');
  assert.equal(catalog.counts.generatedQuestionItems,0,'Generated question content admitted');

  const knownIds=new Set(blueprint.chapters.flatMap(ch=>[ch.id,...ch.lessons.map(l=>l.id)]));
  const planById=new Map();
  const planByTargetId=new Map();
  for(const plan of catalog.plans){
    assert(!planById.has(plan.id),`Duplicate diagnostic plan: ${plan.id}`);
    assert(!planByTargetId.has(plan.targetId),`Duplicate diagnostic target: ${plan.targetId}`);
    assert(knownIds.has(plan.targetId),`Unknown diagnostic target: ${plan.targetId}`);
    assert.equal(plan.executionReady,false,`Executable plan leaked: ${plan.id}`);
    assert.equal(plan.masterReadyOutcomeAllowed,false,`Master-ready plan leaked: ${plan.id}`);
    assert.equal(plan.answerLeakageAllowed,false,`Answer-leaking plan leaked: ${plan.id}`);
    assert.equal(plan.persistenceAllowed,false,`Persistent plan leaked: ${plan.id}`);
    for(const ref of plan.prerequisiteRefs) assert(knownIds.has(ref),`Unknown plan prerequisite: ${plan.id}/${ref}`);
    planById.set(plan.id,plan);
    planByTargetId.set(plan.targetId,plan);
  }

  const resolvePlan=(ref)=>{
    const plan=planById.get(ref)||planByTargetId.get(ref)||null;
    return plan;
  };

  const validateProposedItemBank=(planRef,bank)=>{
    const plan=resolvePlan(planRef);
    const errors=[];
    if(!plan) errors.push('UNKNOWN_PLAN');
    if(!bank||typeof bank!=='object') errors.push('INVALID_BANK');
    if(errors.length) return cloneFrozen({valid:false,errors,itemCount:0,difficultyDistribution:{easy:0,medium:0,hard:0,expert:0},criticalItems:0,proposedBankHarnessOnly:true,catalogExecutionReady:false});

    if(bank.schema!==contract.itemBankGate.schema) errors.push('SCHEMA_MISMATCH');
    if(bank.targetId!==plan.targetId) errors.push('TARGET_MISMATCH');
    if(bank.policyId!==contract.assessmentPolicy.id) errors.push('POLICY_MISMATCH');
    if(bank.reviewStatus!==contract.itemBankGate.reviewStatusRequired) errors.push('BANK_NOT_VERIFIED');
    if(typeof bank.reviewedBy!=='string'||!bank.reviewedBy.trim()) errors.push('MISSING_REVIEWER');
    if(!Array.isArray(bank.sourceProvenance)||!bank.sourceProvenance.length) errors.push('MISSING_SOURCE_PROVENANCE');
    if(!Array.isArray(bank.items)||bank.items.length!==contract.assessmentPolicy.requiredItemCount) errors.push('ITEM_COUNT_MISMATCH');

    const items=Array.isArray(bank.items)?bank.items:[];
    const ids=new Set();
    let criticalItems=0;
    const difficulties=[];
    for(const item of items){
      if(!item||typeof item!=='object'){ errors.push('INVALID_ITEM'); continue; }
      if(typeof item.id!=='string'||!item.id) errors.push('MISSING_ITEM_ID');
      else if(ids.has(item.id)) errors.push(`DUPLICATE_ITEM_ID:${item.id}`);
      else ids.add(item.id);
      if(item.targetId!==plan.targetId) errors.push(`ITEM_TARGET_MISMATCH:${item.id||'unknown'}`);
      if(!Object.hasOwn(contract.assessmentPolicy.difficultyDistribution,item.difficulty)) errors.push(`UNKNOWN_DIFFICULTY:${item.id||'unknown'}`);
      else difficulties.push(item.difficulty);
      if(item.critical===true) criticalItems+=1;
      if(typeof item.prompt!=='string'||!item.prompt.trim()) errors.push(`MISSING_PROMPT:${item.id||'unknown'}`);
      if(!Array.isArray(item.options)||item.options.length<2) errors.push(`INVALID_OPTIONS:${item.id||'unknown'}`);
      else{
        const optionIds=item.options.map(o=>o?.id);
        if(new Set(optionIds).size!==optionIds.length) errors.push(`DUPLICATE_OPTION_ID:${item.id||'unknown'}`);
        if(!optionIds.includes(item.correctOptionId)) errors.push(`UNKNOWN_CORRECT_OPTION:${item.id||'unknown'}`);
      }
      if(typeof item.rationale!=='string'||!item.rationale.trim()) errors.push(`MISSING_RATIONALE:${item.id||'unknown'}`);
      if(item.reviewStatus!==contract.itemBankGate.reviewStatusRequired) errors.push(`ITEM_NOT_VERIFIED:${item.id||'unknown'}`);
      if(!Array.isArray(item.evidenceTags)||!item.evidenceTags.length) errors.push(`MISSING_EVIDENCE_TAGS:${item.id||'unknown'}`);
      if(!Array.isArray(item.prerequisiteRefs)) errors.push(`INVALID_PREREQUISITE_REFS:${item.id||'unknown'}`);
      else for(const ref of item.prerequisiteRefs) if(!knownIds.has(ref)) errors.push(`UNKNOWN_PREREQUISITE_REF:${ref}`);
    }
    const distribution=counts(difficulties);
    if(!sameCounts(distribution,contract.assessmentPolicy.difficultyDistribution)) errors.push('DIFFICULTY_DISTRIBUTION_MISMATCH');
    if(contract.assessmentPolicy.requiresCriticalItems&&criticalItems===0) errors.push('NO_CRITICAL_ITEMS');

    return cloneFrozen({
      valid:errors.length===0,
      errors:[...new Set(errors)],
      itemCount:items.length,
      difficultyDistribution:distribution,
      criticalItems,
      proposedBankHarnessOnly:true,
      catalogExecutionReady:false,
      productionExecutable:false,
      persistenceAllowed:false
    });
  };

  const projectProposedSession=(planRef,bank)=>{
    const validation=validateProposedItemBank(planRef,bank);
    assert(validation.valid,`Diagnostic item bank rejected: ${validation.errors.join(', ')}`);
    const plan=resolvePlan(planRef);
    return deepFreeze({
      schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_SESSION_V2',
      planId:plan.id,
      targetId:plan.targetId,
      bankId:bank.bankId,
      policyId:plan.policyId,
      items:bank.items.map(item=>({
        id:item.id,
        targetId:item.targetId,
        difficulty:item.difficulty,
        critical:item.critical,
        prompt:item.prompt,
        options:item.options.map(option=>({id:option.id,text:option.text})),
        prerequisiteRefs:[...item.prerequisiteRefs],
        evidenceTags:[...item.evidenceTags]
      })),
      exposesAnswerKey:false,
      proposedBankHarnessOnly:true,
      productionExecutable:false,
      persistenceAllowed:false
    });
  };

  const evaluateProposedAttempt=(planRef,bank,attempt)=>{
    const validation=validateProposedItemBank(planRef,bank);
    assert(validation.valid,`Diagnostic item bank rejected: ${validation.errors.join(', ')}`);
    const plan=resolvePlan(planRef);
    assert(attempt&&typeof attempt==='object','Invalid diagnostic attempt');
    assert.equal(attempt.schema,contract.attemptGate.schema,'Diagnostic attempt schema mismatch');
    assert(typeof attempt.attemptId==='string'&&attempt.attemptId,'Missing diagnostic attempt ID');
    assert.equal(attempt.planId,plan.id,'Diagnostic attempt plan mismatch');
    assert.equal(attempt.bankId,bank.bankId,'Diagnostic attempt bank mismatch');
    assert(Array.isArray(attempt.responses),'Diagnostic responses must be an array');
    assert.equal(attempt.responses.length,bank.items.length,contract.reasonCodes.INCOMPLETE_ATTEMPT);

    const itemById=new Map(bank.items.map(item=>[item.id,item]));
    const responseById=new Map();
    for(const response of attempt.responses){
      assert(response&&typeof response==='object','Invalid diagnostic response');
      assert(!responseById.has(response.itemId),`Duplicate diagnostic response: ${response.itemId}`);
      const item=itemById.get(response.itemId);
      assert(item,`Unknown diagnostic response item: ${response.itemId}`);
      assert(item.options.some(option=>option.id===response.selectedOptionId),`Unknown diagnostic option: ${response.itemId}/${response.selectedOptionId}`);
      responseById.set(response.itemId,response);
    }
    assert.equal(responseById.size,itemById.size,contract.reasonCodes.INCOMPLETE_ATTEMPT);

    let correct=0,criticalCorrect=0,criticalTotal=0;
    const incorrectItemIds=[];
    const gapPrerequisiteRefs=new Set();
    for(const item of bank.items){
      const ok=responseById.get(item.id).selectedOptionId===item.correctOptionId;
      if(ok) correct+=1;
      else{
        incorrectItemIds.push(item.id);
        for(const ref of item.prerequisiteRefs) gapPrerequisiteRefs.add(ref);
      }
      if(item.critical){
        criticalTotal+=1;
        if(ok) criticalCorrect+=1;
      }
    }
    const percent=(correct/bank.items.length)*100;
    const criticalPercent=criticalTotal?(criticalCorrect/criticalTotal)*100:0;
    const overallPass=percent>=contract.assessmentPolicy.passPercent;
    const criticalPass=criticalPercent>=contract.assessmentPolicy.criticalItemFloorPercent;
    const status=overallPass&&criticalPass
      ? contract.statusSemantics.pass
      : overallPass&&!criticalPass
        ? contract.statusSemantics.criticalFloorFail
        : contract.statusSemantics.fail;
    assert.notEqual(status,contract.statusSemantics.forbiddenOutcome,'Diagnostic emitted forbidden Master-ready outcome');

    return deepFreeze({
      schema:'BAUMAN_ROADMAP_V2_DIAGNOSTIC_RESULT_V2',
      attemptId:attempt.attemptId,
      planId:plan.id,
      targetId:plan.targetId,
      bankId:bank.bankId,
      status,
      score:{correct,total:bank.items.length,percent,criticalCorrect,criticalTotal,criticalPercent},
      incorrectItemIds,
      gapPrerequisiteRefs:[...gapPrerequisiteRefs].sort(),
      masterReady:false,
      persistable:false,
      proposedBankHarnessOnly:true,
      reasonCodes:[
        ...(overallPass&&!criticalPass?['CRITICAL_ITEM_FLOOR_NOT_MET']:[]),
        'DIAGNOSTIC_PASS_NOT_MASTER_READY',
        'PERSISTENCE_DISABLED',
        'PRODUCTION_DISCONNECTED'
      ]
    });
  };

  const api={
    contract:cloneFrozen(contract),
    blueprint:cloneFrozen(blueprint),
    catalog:cloneFrozen(catalog),
    getPlan:ref=>cloneFrozen(resolvePlan(ref)),
    getReadiness:ref=>{
      const plan=resolvePlan(ref);
      if(!plan)return null;
      return deepFreeze({
        planId:plan.id,
        targetId:plan.targetId,
        executionReady:plan.executionReady,
        executionStatus:plan.executionStatus,
        itemBank:cloneFrozen(plan.itemBank),
        reasonCodes:cloneFrozen(plan.reasonCodes)
      });
    },
    validateProposedItemBank,
    projectProposedSession,
    evaluateProposedAttempt
  };
  return Object.freeze(api);
}
