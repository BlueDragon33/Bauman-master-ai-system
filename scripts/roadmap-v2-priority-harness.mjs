import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCurrentPrerequisitePolicy} from './roadmap-v2-prerequisite-policy.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function cloneFrozen(value){
  if(value===null||value===undefined)return value;
  return deepFreeze(structuredClone(value));
}
function readJson(path,label){
  if(!fs.existsSync(path))throw new Error(`Missing current Priority file: ${label}`);
  try{return JSON.parse(fs.readFileSync(path,'utf8'));}catch{throw new Error(`Invalid current Priority JSON: ${label}`);}
}
function round(value,decimals=6){
  const factor=10**decimals;
  return Math.round((value+Number.EPSILON)*factor)/factor;
}
function range01(value,label){
  assert(Number.isFinite(value)&&value>=0&&value<=1,`${label} outside [0,1]`);
  return value;
}

export function loadCurrentPriorityHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/priority/priority-contract.json`,'Priority contract');
  const contractSchema=readJson(`${root}/roadmap_v2/priority/priority-contract.schema.json`,'Priority contract schema');
  const candidateSchema=readJson(`${root}/roadmap_v2/priority/priority-candidate.schema.json`,'Priority candidate schema');
  const resultSchema=readJson(`${root}/roadmap_v2/priority/priority-result.schema.json`,'Priority result schema');
  const blueprint=readJson(`${root}/roadmap_v2/consumer/blueprint.json`,'Consumer Blueprint');
  const mastery=readJson(`${root}/roadmap_v2/mastery/mastery-contract.json`,'Mastery contract');
  const snapshotSchema=readJson(`${root}/roadmap_v2/mastery/mastery-snapshot.schema.json`,'Mastery snapshot schema');
  const prerequisitePolicy=buildCurrentPrerequisitePolicy({rootDir:root});

  assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2','Unsupported current Priority contract');
  assert.equal(contractSchema.$id,contract.schema,'Priority contract/schema identity mismatch');
  assert.equal(candidateSchema.$id,contract.upstream.priorityCandidateSchema,'Priority candidate schema identity mismatch');
  assert.equal(resultSchema.$id,contract.upstream.priorityResultSchema,'Priority result schema identity mismatch');
  assert.equal(blueprint.schema,contract.upstream.consumerBlueprintSchema,'Priority/Consumer Blueprint schema mismatch');
  assert.equal(blueprint.validation.result,contract.upstream.consumerBlueprintValidationRequired,'Consumer Blueprint validation not accepted');
  assert.equal(mastery.schema,contract.upstream.masteryContractSchema,'Priority/Mastery contract schema mismatch');
  assert.equal(snapshotSchema.$id,contract.upstream.masterySnapshotSchema,'Priority/Mastery snapshot schema mismatch');
  assert.equal(prerequisitePolicy.schema,contract.upstream.prerequisitePolicySchema,'Priority/prerequisite policy schema mismatch');
  assert.equal(prerequisitePolicy.validation.result,'PASS','Current prerequisite policy is not PASS');

  assert.equal(contract.mode.productionIntegration,'disconnected','Priority production boundary widened');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Priority persistence unexpectly enabled');
  assert.equal(contract.mode.schedulerWriteAllowed,false,'Priority scheduler write unexpectly enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Priority runtime write unexpectedly enabled');
  assert.equal(contract.capabilities.persistentStoreWrite,false,'Priority persistence capability enabled');
  assert.equal(contract.capabilities.schedulerWrite,false,'Priority scheduler capability enabled');
  assert.equal(contract.capabilities.runtimeActivation,false,'Priority runtime activation enabled');

  const knownTargets=new Set();
  for(const chapter of blueprint.chapters){
    knownTargets.add(chapter.id);
    for(const lesson of chapter.lessons)knownTargets.add(lesson.id);
  }
  const phases=new Set(snapshotSchema.properties.phaseId.enum);
  const knowledgeStates=new Set(mastery.knowledgeStates);
  const satisfyingStates=new Set(mastery.prerequisiteGate.satisfyingStates);
  const forbiddenDerivedFields=new Set(['knowledgeGap','prerequisiteUrgency','forgettingRisk','weightedScore','disposition','criticalOverride','reviewOnDemand','rank']);

  const validateSnapshot=(snapshot,candidate)=>{
    assert(snapshot&&typeof snapshot==='object'&&!Array.isArray(snapshot),`Missing mastery snapshot: ${candidate.candidateId}`);
    assert.equal(snapshot.schema,snapshotSchema.$id,`Mastery snapshot schema mismatch: ${candidate.candidateId}`);
    assert.equal(snapshot.targetId,candidate.targetId,`Priority candidate/snapshot target mismatch: ${candidate.candidateId}`);
    assert.equal(snapshot.phaseId,candidate.phaseId,`Priority candidate/snapshot phase mismatch: ${candidate.candidateId}`);
    assert(knowledgeStates.has(snapshot.knowledgeState),`Unknown snapshot knowledge state: ${snapshot.knowledgeState}`);
    assert.equal(snapshot.persisted,false,`Persisted mastery snapshot admitted: ${candidate.candidateId}`);
    assert(typeof snapshot.streamId==='string'&&snapshot.streamId, `Missing mastery stream ID: ${candidate.candidateId}`);
    assert(Number.isInteger(snapshot.eventCount)&&snapshot.eventCount>=0,`Invalid mastery event count: ${candidate.candidateId}`);
    assert(Number.isInteger(snapshot.lastSequence)&&snapshot.lastSequence>=0,`Invalid mastery last sequence: ${candidate.candidateId}`);
    assert(typeof snapshot.existingCompetencyVerified==='boolean',`Invalid Existing Competency flag: ${candidate.candidateId}`);
    assert(snapshot.dimensions&&typeof snapshot.dimensions==='object'&&!Array.isArray(snapshot.dimensions),`Invalid mastery dimensions: ${candidate.candidateId}`);
    assert(snapshot.masterReadyGate&&typeof snapshot.masterReadyGate==='object'&&!Array.isArray(snapshot.masterReadyGate),`Invalid Master-ready gate: ${candidate.candidateId}`);
    assert(typeof snapshot.masterReadyGate.passed==='boolean',`Missing Master-ready gate result: ${candidate.candidateId}`);
    assert.equal(snapshot.masterReadyGate.passed,snapshot.knowledgeState==='master_ready',`Master-ready state/gate mismatch: ${candidate.candidateId}`);
    assert.equal(snapshot.prerequisiteEligible,satisfyingStates.has(snapshot.knowledgeState),`Prerequisite eligibility/state mismatch: ${candidate.candidateId}`);
    assert(Array.isArray(snapshot.transitions),`Invalid mastery transitions: ${candidate.candidateId}`);

    const retention=snapshot.dimensions.retention;
    if(retention){
      assert(Number.isFinite(retention.percent)&&retention.percent>=0&&retention.percent<=100,`Invalid retention percent: ${candidate.candidateId}`);
      assert(Number.isInteger(retention.daysAfterLearning)&&retention.daysAfterLearning>=0,`Invalid retention window: ${candidate.candidateId}`);
    }
    const diagnostic=snapshot.dimensions.diagnostic;
    if(diagnostic){
      assert(Number.isFinite(diagnostic.scorePercent)&&diagnostic.scorePercent>=0&&diagnostic.scorePercent<=100,`Invalid diagnostic score: ${candidate.candidateId}`);
      assert(Number.isFinite(diagnostic.criticalPercent)&&diagnostic.criticalPercent>=0&&diagnostic.criticalPercent<=100,`Invalid diagnostic critical score: ${candidate.candidateId}`);
    }
    return cloneFrozen(snapshot);
  };

  const validateCandidate=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Priority candidate');
    assert.equal(input.schema,candidateSchema.$id,`Priority candidate schema mismatch: ${input.candidateId||'unknown'}`);
    assert(typeof input.candidateId==='string'&&input.candidateId.trim(),'Missing Priority candidate ID');
    assert(knownTargets.has(input.targetId),`Unknown Priority target: ${input.targetId}`);
    assert(phases.has(input.phaseId),`Unknown Priority phase: ${input.phaseId}`);
    range01(input.masterRelevance,`Master relevance ${input.candidateId}`);
    assert(typeof input.masterRelevanceSource==='string'&&input.masterRelevanceSource.trim(),`Missing master relevance source: ${input.candidateId}`);
    assert(input.weeksUntilNeeded===null||(Number.isFinite(input.weeksUntilNeeded)&&input.weeksUntilNeeded>=0),`Invalid weeks until needed: ${input.candidateId}`);
    const allowed=new Set(candidateSchema.required);
    for(const key of Object.keys(input)){
      assert(allowed.has(key),forbiddenDerivedFields.has(key)
        ?`Derived Priority field override is forbidden: ${key}`
        :`Unknown Priority candidate field: ${key}`);
    }
    validateSnapshot(input.snapshot,input);
    return cloneFrozen(input);
  };

  const urgencyFromWeeks=weeks=>{
    if(weeks===null)return contract.normalization.missingNeededDateUrgency;
    for(const band of contract.normalization.prerequisiteUrgencyByWeeks){
      if(band.maximumWeeks===null||weeks<=band.maximumWeeks)return band.value;
    }
    throw new Error('Priority urgency normalization has no terminal band');
  };

  const forgettingRisk=snapshot=>{
    const rules=contract.normalization.forgettingRiskRules;
    if(snapshot.knowledgeState==='can_on')return rules.can_on;
    const retention=snapshot.dimensions.retention;
    if(retention){
      if(retention.percent<mastery.thresholds.retentionPercent)return rules.retentionBelowThreshold;
      if(retention.daysAfterLearning<mastery.thresholds.retentionWindowDays.minimum
        ||retention.daysAfterLearning>mastery.thresholds.retentionWindowDays.maximum)return rules.retentionOutsideWindow;
      return rules.retentionPassed;
    }
    switch(snapshot.knowledgeState){
      case 'dat_prerequisite': return rules.datPrerequisiteWithoutRetention;
      case 'dang_hoc': return rules.dangHocWithoutRetention;
      case 'gap': return rules.gapWithoutRetention;
      case 'chua_hoc': return rules.chuaHocWithoutRetention;
      case 'master_ready': return rules.retentionPassed;
      default: throw new Error(`No forgetting-risk rule for state: ${snapshot.knowledgeState}`);
    }
  };

  const reviewOnDemand=snapshot=>{
    const rule=contract.existingCompetencyRule;
    const diagnostic=snapshot.dimensions.diagnostic;
    const retention=snapshot.dimensions.retention;
    return Boolean(
      snapshot.existingCompetencyVerified===true
      && snapshot.knowledgeState!=='master_ready'
      && diagnostic
      && diagnostic.scorePercent>=rule.diagnosticPercentMinimum
      && diagnostic.criticalPercent>=rule.diagnosticCriticalPercentMinimum
      && retention
      && retention.percent>=rule.retentionPercentMinimum
      && retention.daysAfterLearning>=rule.retentionWindowDays.minimum
      && retention.daysAfterLearning<=rule.retentionWindowDays.maximum
    );
  };

  const scoreCandidate=input=>{
    const candidate=validateCandidate(input);
    const features={
      masterRelevance:candidate.masterRelevance,
      knowledgeGap:contract.normalization.knowledgeGapByState[candidate.snapshot.knowledgeState],
      prerequisiteUrgency:urgencyFromWeeks(candidate.weeksUntilNeeded),
      forgettingRisk:forgettingRisk(candidate.snapshot)
    };
    for(const [id,value] of Object.entries(features))range01(value,`Derived Priority feature ${id}`);

    const weights=contract.formula.weights;
    const weightPercent=Object.fromEntries(Object.entries(weights).map(([id,value])=>[id,Math.round(value*100)]));
    assert.equal(Object.values(weightPercent).reduce((a,b)=>a+b,0),100,'Priority weight percent total drift');
    const contributions=Object.fromEntries(Object.keys(weights).map(id=>[id,round(features[id]*weightPercent[id])]));
    const weightedScore=round(Object.values(contributions).reduce((sum,value)=>sum+value,0));
    assert(weightedScore>=0&&weightedScore<=100,'Priority score outside [0,100]');

    const critical=candidate.snapshot.knowledgeState===contract.criticalOverride.requiredKnowledgeState
      &&candidate.weeksUntilNeeded!==null
      &&candidate.weeksUntilNeeded<=contract.criticalOverride.maximumWeeksUntilNeeded;
    const review=!critical&&reviewOnDemand(candidate.snapshot);
    const weightedDisposition=contract.weightedBands.find(band=>weightedScore>=band.minimumScore)?.disposition;
    assert(weightedDisposition,'Priority score does not match a weighted band');
    const disposition=critical
      ?contract.criticalOverride.disposition
      :review
        ?contract.existingCompetencyRule.disposition
        :weightedDisposition;

    const reasonCodes=[
      ...(critical?['CRITICAL_GAP_NEEDED_WITHIN_4_WEEKS']:[]),
      ...(review?['EXISTING_COMPETENCY_RETENTION_CONFIRMED']:[]),
      `KNOWLEDGE_STATE_${candidate.snapshot.knowledgeState.toUpperCase()}`,
      candidate.weeksUntilNeeded===null?'NEEDED_DATE_MISSING':'NEEDED_DATE_SUPPLIED',
      'SCHEDULER_WRITE_DISABLED',
      'PRODUCTION_DISCONNECTED'
    ];

    const result={
      schema:resultSchema.$id,
      candidateId:candidate.candidateId,
      targetId:candidate.targetId,
      phaseId:candidate.phaseId,
      knowledgeState:candidate.snapshot.knowledgeState,
      weeksUntilNeeded:candidate.weeksUntilNeeded,
      features,
      weights:cloneFrozen(weights),
      contributions,
      weightedScore,
      criticalOverride:critical,
      reviewOnDemand:review,
      disposition,
      masterReady:candidate.snapshot.knowledgeState==='master_ready',
      schedulerWriteAllowed:false,
      persisted:false,
      reasonCodes:[...new Set(reasonCodes)]
    };
    assert(!(result.reviewOnDemand&&result.masterReady),'review_on_demand cannot grant Master-ready');
    assert(!result.criticalOverride||result.disposition==='critical','Critical override disposition mismatch');
    return deepFreeze(result);
  };

  const rankCandidates=inputs=>{
    assert(Array.isArray(inputs),'Priority candidates must be an array');
    const candidateIds=new Set();
    const targetIds=new Set();
    const results=inputs.map(input=>{
      assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Priority candidate');
      assert(typeof input.candidateId==='string'&&input.candidateId.trim(),'Missing Priority candidate ID');
      assert(typeof input.targetId==='string'&&input.targetId.trim(),'Missing Priority target ID');
      assert(!candidateIds.has(input.candidateId),`Duplicate Priority candidate ID: ${input.candidateId}`);
      assert(!targetIds.has(input.targetId),`Duplicate Priority target ID: ${input.targetId}`);
      candidateIds.add(input.candidateId);
      targetIds.add(input.targetId);
      return scoreCandidate(input);
    });
    results.sort((a,b)=>{
      if(a.criticalOverride!==b.criticalOverride)return a.criticalOverride?-1:1;
      if(a.weightedScore!==b.weightedScore)return b.weightedScore-a.weightedScore;
      const aWeeks=a.weeksUntilNeeded??Number.POSITIVE_INFINITY;
      const bWeeks=b.weeksUntilNeeded??Number.POSITIVE_INFINITY;
      if(aWeeks!==bWeeks)return aWeeks-bWeeks;
      return a.targetId.localeCompare(b.targetId);
    });
    return deepFreeze(results.map((result,index)=>({rank:index+1,...result})));
  };

  return Object.freeze({
    contract:cloneFrozen(contract),
    candidateSchema:cloneFrozen(candidateSchema),
    resultSchema:cloneFrozen(resultSchema),
    blueprint:cloneFrozen(blueprint),
    mastery:cloneFrozen(mastery),
    prerequisitePolicy:cloneFrozen(prerequisitePolicy),
    validateCandidate,
    scoreCandidate,
    rankCandidates
  });
}
