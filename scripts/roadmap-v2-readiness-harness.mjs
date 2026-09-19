import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentMasteryHarness} from './roadmap-v2-mastery-harness.mjs';
import {loadCurrentSchedulerHarness} from './roadmap-v2-scheduler-harness.mjs';

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
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error(`Missing current Readiness file: ${label}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error(`Invalid current Readiness JSON: ${label}`);}
}
function assertKeys(value,allowed,label){
  const unexpected=Object.keys(value).filter(key=>!allowed.has(key));
  assert.equal(unexpected.length,0,`${label} contains unsupported fields: ${unexpected.join(', ')}`);
}

export function loadCurrentReadinessHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/readiness/current-contract.json`,'current Readiness contract');
  const contractSchema=readJson(`${root}/roadmap_v2/readiness/readiness-contract.schema.json`,'Readiness contract schema');
  const requestSchema=readJson(`${root}/roadmap_v2/readiness/readiness-request.schema.json`,'Readiness request schema');
  const resultSchema=readJson(`${root}/roadmap_v2/readiness/readiness-result.schema.json`,'Readiness result schema');
  const mastery=loadCurrentMasteryHarness({rootDir:root});
  const scheduler=loadCurrentSchedulerHarness({rootDir:root});

  assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_READINESS_CONTRACT_V1','Unsupported current Readiness contract');
  assert.equal(contractSchema.$id,contract.schema,'Readiness contract/schema identity mismatch');
  assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1','Readiness request schema identity mismatch');
  assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_READINESS_RESULT_V1','Readiness result schema identity mismatch');
  assert.equal(contract.upstreamSchemas.consumerBlueprint,mastery.blueprint.schema,'Readiness/Consumer Blueprint mismatch');
  assert.equal(contract.upstreamSchemas.masteryContract,mastery.contract.schema,'Readiness/Mastery mismatch');
  assert.equal(contract.upstreamSchemas.schedulerContract,scheduler.contract.schema,'Readiness/Scheduler mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Readiness production boundary widened');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Readiness persistence enabled');
  assert.equal(contract.mode.dashboardUiEnabled,false,'Readiness dashboard UI enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Readiness runtime write enabled');
  assert.equal(contract.mode.notificationWriteAllowed,false,'Readiness notification write enabled');

  const knownTargets=new Set();
  const parentChapterByLesson=new Map();
  const chapterIds=new Set();
  for(const chapter of mastery.blueprint.chapters){
    knownTargets.add(chapter.id);chapterIds.add(chapter.id);
    for(const lesson of chapter.lessons){
      knownTargets.add(lesson.id);
      assert(!parentChapterByLesson.has(lesson.id),`Ambiguous lesson parent: ${lesson.id}`);
      parentChapterByLesson.set(lesson.id,chapter.id);
    }
  }
  const policyTargets=new Set(mastery.prerequisitePolicy.resolutions.map(x=>x.targetId));
  const externalGateIds=new Set(mastery.prerequisitePolicy.edges.filter(x=>x.external===true).map(x=>x.from));
  const requestKeys=new Set(['schema','reportId','phaseId','focusTargetIds','scheduleRequest','externalGates']);
  const gateKeys=new Set(['gateId','satisfied','sourceRef','verified']);

  const prerequisiteTargetFor=targetId=>{
    if(policyTargets.has(targetId))return targetId;
    const parent=parentChapterByLesson.get(targetId);
    assert(parent&&policyTargets.has(parent),`Readiness focus target has no current prerequisite policy: ${targetId}`);
    return parent;
  };

  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Readiness request');
    assertKeys(input,requestKeys,'Readiness request');
    assert.equal(input.schema,requestSchema.$id,'Readiness request schema mismatch');
    assert(typeof input.reportId==='string'&&input.reportId.trim(),'Missing Readiness report ID');
    assert(Object.hasOwn(scheduler.contract.phasePolicies,input.phaseId),`Unknown Readiness phase: ${input.phaseId}`);
    assert(Array.isArray(input.focusTargetIds)&&input.focusTargetIds.length>0,'Readiness focus targets must be non-empty');

    const focusIds=new Set();
    for(const targetId of input.focusTargetIds){
      assert(typeof targetId==='string'&&targetId,'Invalid Readiness focus target');
      assert(knownTargets.has(targetId),`Unknown Readiness focus target: ${targetId}`);
      assert(!focusIds.has(targetId),`Duplicate Readiness focus target: ${targetId}`);
      focusIds.add(targetId);
      prerequisiteTargetFor(targetId);
    }

    const scheduleRequest=scheduler.validateRequest(input.scheduleRequest);
    assert.equal(scheduleRequest.phaseId,input.phaseId,'Readiness/Scheduler phase mismatch');
    for(const item of scheduleRequest.items){
      assert.equal(item.priorityCandidate.snapshot.persisted,false,`Persisted mastery snapshot admitted: ${item.priorityCandidate.targetId}`);
    }

    assert(Array.isArray(input.externalGates),'Readiness external gates must be an array');
    const gateIds=new Set();
    for(const gate of input.externalGates){
      assert(gate&&typeof gate==='object'&&!Array.isArray(gate),'Invalid Readiness external gate');
      assertKeys(gate,gateKeys,`Readiness external gate ${gate.gateId||'unknown'}`);
      assert(typeof gate.gateId==='string'&&gate.gateId,'Missing Readiness external gate ID');
      assert(externalGateIds.has(gate.gateId),`Unknown Readiness external gate: ${gate.gateId}`);
      assert(!gateIds.has(gate.gateId),`Duplicate Readiness external gate: ${gate.gateId}`);
      gateIds.add(gate.gateId);
      assert(typeof gate.satisfied==='boolean',`Invalid external gate state: ${gate.gateId}`);
      assert(typeof gate.sourceRef==='string'&&gate.sourceRef.trim(),`Missing external gate source: ${gate.gateId}`);
      assert.equal(gate.verified,true,`Unverified Readiness external gate: ${gate.gateId}`);
    }
    return cloneFrozen(input);
  };

  const projectReadiness=input=>{
    const request=validateRequest(input);
    const scheduleResult=scheduler.projectWeek(request.scheduleRequest);
    const snapshots=request.scheduleRequest.items.map(item=>item.priorityCandidate.snapshot);
    const snapshotByTargetId=new Map(snapshots.map(snapshot=>[snapshot.targetId,snapshot]));
    const itemByTargetId=new Map(request.scheduleRequest.items.map(item=>[item.priorityCandidate.targetId,item]));
    const externalGateStates=Object.fromEntries(request.externalGates.map(gate=>[gate.gateId,gate.satisfied]));
    const scheduledPrimaryTargets=new Set(
      scheduleResult.sessions.filter(session=>session.companionOf===null).map(session=>session.targetId)
    );

    const targets=request.focusTargetIds.map(targetId=>{
      const snapshot=snapshotByTargetId.get(targetId)||null;
      const prerequisiteTargetId=prerequisiteTargetFor(targetId);
      const gate=mastery.evaluatePrerequisiteGate(prerequisiteTargetId,snapshots,externalGateStates);
      const scheduleItem=itemByTargetId.get(targetId)||null;
      const priorityResult=scheduleItem?scheduler.priority.scoreCandidate(scheduleItem.priorityCandidate):null;
      const critical=priorityResult?.criticalOverride===true;
      const criticalScheduled=!critical||scheduledPrimaryTargets.has(targetId);
      const reasons=[];

      if(!snapshot)reasons.push('FOCUS_MASTERY_EVIDENCE_MISSING');
      if(!gate.ready)reasons.push('BLOCKING_PREREQUISITE_UNSATISFIED');
      if(gate.unresolvedExternalGateIds.length>0)reasons.push('EXTERNAL_GATE_UNRESOLVED');
      if(!criticalScheduled)reasons.push('CRITICAL_TARGET_NOT_SCHEDULED');
      if(gate.advisory.length>0)reasons.push('ADVISORY_PREREQUISITES_PRESENT');

      const claimedMasterReady=snapshot?.knowledgeState==='master_ready';
      const requiredMasterReadyChecks=mastery.contract.masterReadyGate.requiredDimensions;
      const verifiedMasterReady=claimedMasterReady
        && snapshot?.masterReadyGate?.passed===true
        && requiredMasterReadyChecks.every(dimension=>snapshot.masterReadyGate.checks?.[dimension]===true)
        && (snapshot.masterReadyGate.russianTermsRequired!==true||snapshot.masterReadyGate.checks?.russianTechnicalTerms===true);

      if(claimedMasterReady&&!verifiedMasterReady)reasons.push('MASTER_READY_GATE_UNVERIFIED');
      const red=!snapshot||!gate.ready||!criticalScheduled||(claimedMasterReady&&!verifiedMasterReady);
      const masterReady=verifiedMasterReady;
      const color=red?'red':masterReady?'green':'yellow';
      const status=color==='red'
        ?contract.statusPolicy.red.code
        :color==='green'
          ?contract.statusPolicy.green.code
          :contract.statusPolicy.yellow.code;
      if(!red)reasons.push(masterReady?'MASTER_READY_WITH_PREREQUISITES':'PREREQUISITE_READY_NOT_MASTER_READY');

      return {
        targetId,
        prerequisiteTargetId,
        color,status,
        knowledgeState:snapshot?.knowledgeState||null,
        masterySnapshotPresent:Boolean(snapshot),
        prerequisiteReady:gate.ready,
        masterReady,
        critical,
        criticalScheduled,
        scheduledSessionCount:scheduleResult.sessions.filter(session=>session.targetId===targetId).length,
        blockerCount:gate.blockers.length,
        advisoryCount:gate.advisory.length,
        unresolvedExternalGateIds:gate.unresolvedExternalGateIds,
        blockers:gate.blockers,
        reasonCodes:reasons,
        persisted:false
      };
    });

    const counts={
      targets:targets.length,
      red:targets.filter(target=>target.color==='red').length,
      yellow:targets.filter(target=>target.color==='yellow').length,
      green:targets.filter(target=>target.color==='green').length,
      unresolvedExternalGates:new Set(targets.flatMap(target=>target.unresolvedExternalGateIds)).size,
      unscheduledCriticalTargets:targets.filter(target=>target.critical&&!target.criticalScheduled).length
    };
    const overallColor=counts.red>0?'red':counts.yellow>0?'yellow':'green';

    return deepFreeze({
      schema:resultSchema.$id,
      reportId:request.reportId,
      phaseId:request.phaseId,
      weekStart:scheduleResult.weekStart,
      overallColor,
      targets,
      counts,
      scheduleReadiness:{
        allCriticalScheduled:scheduleResult.readiness.allCriticalScheduled,
        gd1MinimumAdvisoryMet:scheduleResult.readiness.gd1MinimumAdvisoryMet,
        usedMinutes:scheduleResult.usedMinutes,
        remainingMinutes:scheduleResult.remainingMinutes,
        persisted:false
      },
      persisted:false,
      dashboardUiRendered:false,
      runtimeWriteAllowed:false,
      notificationWriteAllowed:false
    });
  };

  return Object.freeze({
    contract:cloneFrozen(contract),
    requestSchema:cloneFrozen(requestSchema),
    resultSchema:cloneFrozen(resultSchema),
    mastery,
    scheduler,
    prerequisiteTargetFor,
    validateRequest,
    projectReadiness
  });
}
