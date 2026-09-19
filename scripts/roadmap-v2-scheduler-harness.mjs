import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentPriorityHarness} from './roadmap-v2-priority-harness.mjs';

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
  if(!fs.existsSync(file))throw new Error(`Missing current Scheduler file: ${label}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error(`Invalid current Scheduler JSON: ${label}`);}
}
function validDate(value){
  if(typeof value!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))return false;
  const d=new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;
}
function assertKeys(value,allowed,label){
  const unexpected=Object.keys(value).filter(key=>!allowed.has(key));
  assert.equal(unexpected.length,0,`${label} contains unsupported fields: ${unexpected.join(', ')}`);
}

export function loadCurrentSchedulerHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/scheduler/current-contract.json`,'current Scheduler contract');
  const requestSchema=readJson(`${root}/roadmap_v2/scheduler/scheduler-request.schema.json`,'Scheduler request schema');
  const resultSchema=readJson(`${root}/roadmap_v2/scheduler/scheduler-result.schema.json`,'Scheduler result schema');
  const priority=loadCurrentPriorityHarness({rootDir:root});

  assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_SCHEDULER_CONTRACT_V1','Unsupported current Scheduler contract');
  assert.equal(contract.version,'2.6.1-l26-b101-current','Unsupported current Scheduler version');
  assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1','Scheduler request schema mismatch');
  assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_SCHEDULER_RESULT_V1','Scheduler result schema mismatch');
  assert.equal(priority.blueprint.schema,contract.upstreamSchemas.consumerBlueprint,'Scheduler/Consumer Blueprint mismatch');
  assert.equal(priority.contract.schema,contract.upstreamSchemas.priorityContract,'Scheduler/Priority contract mismatch');
  assert.equal(priority.candidateSchema.$id,contract.upstreamSchemas.priorityCandidate,'Scheduler/Priority candidate mismatch');
  assert.equal(priority.resultSchema.$id,contract.upstreamSchemas.priorityResult,'Scheduler/Priority result mismatch');

  assert.equal(contract.mode.productionIntegration,'disconnected','Scheduler production boundary widened');
  assert.equal(contract.mode.calendarReadEnabled,false,'Scheduler calendar read enabled');
  assert.equal(contract.mode.calendarWriteEnabled,false,'Scheduler calendar write enabled');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Scheduler persistence enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Scheduler runtime write enabled');
  assert.equal(contract.mode.dynamicContentGenerationAllowed,false,'Scheduler dynamic content generation enabled');

  const requestKeys=new Set(['schema','requestId','phaseId','weekStart','weeklyCapacityMinutes','items']);
  const itemKeys=new Set(['scheduleItemId','priorityCandidate','activityKind','estimatedMinutes','technicalTrack','russianTwinMinutes','dueDate','reviewRequested','source']);
  const sourceKeys=new Set(['kind','ref','verified','masterModeRelation']);
  const activityKinds=new Set(requestSchema.properties.items.items.properties.activityKind.enum);
  const technicalTracks=new Set(requestSchema.properties.items.items.properties.technicalTrack.enum);
  const sourceKinds=new Set(requestSchema.properties.items.items.properties.source.properties.kind.enum);
  const masterModeRelations=new Set(requestSchema.properties.items.items.properties.source.properties.masterModeRelation.enum);
  const blockedDynamicTargets=new Set(priority.blueprint.blockedDynamicTargets.map(x=>x.id));

  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Scheduler request');
    assertKeys(input,requestKeys,'Scheduler request');
    assert.equal(input.schema,requestSchema.$id,'Scheduler request schema mismatch');
    assert(typeof input.requestId==='string'&&input.requestId.trim(),'Missing Scheduler request ID');
    assert(Object.hasOwn(contract.phasePolicies,input.phaseId),`Unknown Scheduler phase: ${input.phaseId}`);
    assert(validDate(input.weekStart),`Invalid Scheduler week start: ${input.weekStart}`);
    assert(Number.isInteger(input.weeklyCapacityMinutes)&&input.weeklyCapacityMinutes>=1&&input.weeklyCapacityMinutes<=10080,'Invalid Scheduler weekly capacity');
    assert(Array.isArray(input.items),'Scheduler items must be an array');

    const itemIds=new Set();
    const candidateIds=new Set();
    const targetIds=new Set();
    for(const item of input.items){
      assert(item&&typeof item==='object'&&!Array.isArray(item),'Invalid Scheduler item');
      assertKeys(item,itemKeys,`Scheduler item ${item.scheduleItemId||'unknown'}`);
      assert(typeof item.scheduleItemId==='string'&&item.scheduleItemId.trim(),'Missing Scheduler item ID');
      assert(!itemIds.has(item.scheduleItemId),`Duplicate Scheduler item ID: ${item.scheduleItemId}`);
      itemIds.add(item.scheduleItemId);

      assert(item.priorityCandidate&&typeof item.priorityCandidate==='object'&&!Array.isArray(item.priorityCandidate),`Missing Scheduler Priority candidate: ${item.scheduleItemId}`);
      if(blockedDynamicTargets.has(item.priorityCandidate.targetId)){
        throw new Error(`Dynamic Scheduler target requires real syllabus instance: ${item.priorityCandidate.targetId}`);
      }
      const candidate=priority.validateCandidate(item.priorityCandidate);
      assert.equal(candidate.phaseId,input.phaseId,`Scheduler item/Priority phase mismatch: ${item.scheduleItemId}`);
      assert(!candidateIds.has(candidate.candidateId),`Duplicate Scheduler Priority candidate ID: ${candidate.candidateId}`);
      assert(!targetIds.has(candidate.targetId),`Duplicate Scheduler target ID: ${candidate.targetId}`);
      candidateIds.add(candidate.candidateId);
      targetIds.add(candidate.targetId);

      assert(activityKinds.has(item.activityKind),`Unknown Scheduler activity kind: ${item.activityKind}`);
      assert(Number.isInteger(item.estimatedMinutes)&&item.estimatedMinutes>=1&&item.estimatedMinutes<=1440,`Invalid estimated minutes: ${item.scheduleItemId}`);
      assert(technicalTracks.has(item.technicalTrack),`Unknown technical track: ${item.technicalTrack}`);
      assert(item.russianTwinMinutes===null||(Number.isInteger(item.russianTwinMinutes)&&item.russianTwinMinutes>=1&&item.russianTwinMinutes<=1440),`Invalid Russian twin minutes: ${item.scheduleItemId}`);
      assert(item.dueDate===null||validDate(item.dueDate),`Invalid due date: ${item.scheduleItemId}`);
      assert(typeof item.reviewRequested==='boolean',`Invalid review request flag: ${item.scheduleItemId}`);

      assert(item.source&&typeof item.source==='object'&&!Array.isArray(item.source),`Missing source provenance: ${item.scheduleItemId}`);
      assertKeys(item.source,sourceKeys,`Scheduler source ${item.scheduleItemId}`);
      assert(sourceKinds.has(item.source.kind),`Unknown Scheduler source kind: ${item.source.kind}`);
      assert(typeof item.source.ref==='string'&&item.source.ref.trim(),`Missing source reference: ${item.scheduleItemId}`);
      assert.equal(item.source.verified,true,`Unverified Scheduler source: ${item.scheduleItemId}`);
      assert(masterModeRelations.has(item.source.masterModeRelation),`Unknown Master Mode relation: ${item.scheduleItemId}`);

      const currentActivity=['current_subject_preview','current_subject_weekly','assessment_readiness'].includes(item.activityKind);
      if(currentActivity){
        assert.equal(item.source.kind,contract.sourcePolicy.currentBaumanSourceKind,`Current-subject activity lacks official source: ${item.scheduleItemId}`);
        assert.equal(item.source.masterModeRelation,'current_subject_prerequisite',`Current-subject activity lacks verified Master Mode relation: ${item.scheduleItemId}`);
      }
      if(item.activityKind==='nir_thesis'){
        assert.equal(item.source.kind,contract.sourcePolicy.nirSourceKind,`NIR activity lacks verified plan: ${item.scheduleItemId}`);
        assert.equal(item.source.masterModeRelation,'nir_thesis_prerequisite',`NIR activity lacks verified Master Mode relation: ${item.scheduleItemId}`);
      }
      if([contract.sourcePolicy.currentBaumanSourceKind,contract.sourcePolicy.nirSourceKind].includes(item.source.kind)){
        assert.equal(input.phaseId,'GD3',`Dynamic Master Mode source outside GD3: ${item.scheduleItemId}`);
      }
      if(item.activityKind==='current_subject_preview'){
        const window=contract.phasePolicies.GD3.previewWindowWeeks;
        assert(candidate.weeksUntilNeeded!==null&&candidate.weeksUntilNeeded>=window.minimum&&candidate.weeksUntilNeeded<=window.maximum,`Current-subject preview outside 2-4 week window: ${item.scheduleItemId}`);
      }

      const technical=item.technicalTrack!==null;
      const requiresTwin=technical&&contract.phasePolicies[input.phaseId].russianTwinRequiredForTechnical;
      if(requiresTwin)assert(item.russianTwinMinutes!==null,`Required Russian twin budget missing: ${item.scheduleItemId}`);
      if(!technical)assert.equal(item.russianTwinMinutes,null,`Non-technical item has Russian twin budget: ${item.scheduleItemId}`);
    }
    return cloneFrozen(input);
  };

  const projectWeek=input=>{
    const request=validateRequest(input);
    const ranked=priority.rankCandidates(request.items.map(item=>item.priorityCandidate));
    const rankByCandidate=new Map(ranked.map(result=>[result.candidateId,result]));
    const deferred=[];
    const eligible=[];

    for(const item of request.items){
      const priorityResult=rankByCandidate.get(item.priorityCandidate.candidateId);
      let reason=null;
      if(priorityResult.reviewOnDemand&&!item.reviewRequested)reason='REVIEW_ON_DEMAND_NOT_REQUESTED';
      if(request.phaseId==='GD3'&&item.source.kind==='registry_static'&&item.source.masterModeRelation==='unrelated_static')reason='GD3_UNRELATED_STATIC_DEFERRED';
      if(request.phaseId==='GD1'&&item.technicalTrack!==null&&!contract.phasePolicies.GD1.technicalRotationTracks.includes(item.technicalTrack))reason='GD1_NON_ROTATION_TRACK_DEFERRED';
      if(reason)deferred.push({scheduleItemId:item.scheduleItemId,targetId:priorityResult.targetId,reason,priorityRank:priorityResult.rank});
      else eligible.push({item,priorityResult});
    }

    eligible.sort((a,b)=>{
      if(a.priorityResult.criticalOverride!==b.priorityResult.criticalOverride)return a.priorityResult.criticalOverride?-1:1;
      const aOverride=request.phaseId==='GD3'&&a.item.source.kind===contract.sourcePolicy.currentBaumanSourceKind;
      const bOverride=request.phaseId==='GD3'&&b.item.source.kind===contract.sourcePolicy.currentBaumanSourceKind;
      if(aOverride!==bOverride)return aOverride?-1:1;
      if(a.priorityResult.rank!==b.priorityResult.rank)return a.priorityResult.rank-b.priorityResult.rank;
      const aDue=a.item.dueDate||'9999-12-31';
      const bDue=b.item.dueDate||'9999-12-31';
      if(aDue!==bDue)return aDue.localeCompare(bDue);
      if(a.priorityResult.targetId!==b.priorityResult.targetId)return a.priorityResult.targetId.localeCompare(b.priorityResult.targetId);
      return a.item.scheduleItemId.localeCompare(b.item.scheduleItemId);
    });

    const sessions=[];
    const gd1Tracks=new Set();
    let usedMinutes=0;
    for(const {item,priorityResult} of eligible){
      if(request.phaseId==='GD1'&&item.technicalTrack!==null){
        if(gd1Tracks.has(item.technicalTrack)){
          deferred.push({scheduleItemId:item.scheduleItemId,targetId:priorityResult.targetId,reason:'GD1_TRACK_ALREADY_SELECTED',priorityRank:priorityResult.rank});
          continue;
        }
        if(gd1Tracks.size>=contract.phasePolicies.GD1.technicalSessionMaximum){
          deferred.push({scheduleItemId:item.scheduleItemId,targetId:priorityResult.targetId,reason:'GD1_TECHNICAL_SESSION_MAXIMUM',priorityRank:priorityResult.rank});
          continue;
        }
      }

      const twinMinutes=item.russianTwinMinutes||0;
      const bundleMinutes=item.estimatedMinutes+twinMinutes;
      if(usedMinutes+bundleMinutes>request.weeklyCapacityMinutes){
        deferred.push({scheduleItemId:item.scheduleItemId,targetId:priorityResult.targetId,reason:'WEEKLY_CAPACITY_ATOMIC_BUNDLE',priorityRank:priorityResult.rank});
        continue;
      }

      const masterModeOverride=request.phaseId==='GD3'&&item.source.kind===contract.sourcePolicy.currentBaumanSourceKind;
      sessions.push({
        sequence:sessions.length+1,
        scheduleItemId:item.scheduleItemId,
        targetId:priorityResult.targetId,
        activityKind:item.activityKind,
        minutes:item.estimatedMinutes,
        companionOf:null,
        priorityRank:priorityResult.rank,
        disposition:priorityResult.disposition,
        reasonCodes:[
          ...(priorityResult.criticalOverride?['CRITICAL_GAP_FIRST']:[]),
          ...(masterModeOverride?['VERIFIED_CURRENT_BAUMAN_OVERRIDE']:[]),
          `PRIORITY_RANK_${priorityResult.rank}`,
          'IN_MEMORY_PROJECTION_ONLY'
        ]
      });
      usedMinutes+=item.estimatedMinutes;
      if(item.technicalTrack!==null&&request.phaseId==='GD1')gd1Tracks.add(item.technicalTrack);

      if(twinMinutes>0){
        sessions.push({
          sequence:sessions.length+1,
          scheduleItemId:`${item.scheduleItemId}::RUSSIAN_TWIN`,
          targetId:priorityResult.targetId,
          activityKind:'russian_twin_placeholder',
          minutes:twinMinutes,
          companionOf:item.scheduleItemId,
          priorityRank:priorityResult.rank,
          disposition:priorityResult.disposition,
          reasonCodes:['REQUIRED_RUSSIAN_TWIN','CONTENT_GENERATION_DISABLED','IN_MEMORY_PROJECTION_ONLY']
        });
        usedMinutes+=twinMinutes;
      }
    }

    deferred.sort((a,b)=>a.priorityRank-b.priorityRank||a.targetId.localeCompare(b.targetId)||a.scheduleItemId.localeCompare(b.scheduleItemId));
    const itemById=new Map(request.items.map(item=>[item.scheduleItemId,item]));
    const unscheduledCriticalTargets=deferred
      .filter(entry=>{
        const sourceItem=itemById.get(entry.scheduleItemId);
        return sourceItem?rankByCandidate.get(sourceItem.priorityCandidate.candidateId)?.criticalOverride:false;
      })
      .map(entry=>entry.targetId);
    const gd1TechnicalSessionCount=request.phaseId==='GD1'?gd1Tracks.size:null;
    const gd1MinimumAdvisoryMet=request.phaseId==='GD1'
      ?gd1TechnicalSessionCount>=contract.phasePolicies.GD1.technicalSessionMinimumAdvisory
      :null;
    const readiness={
      allCriticalScheduled:unscheduledCriticalTargets.length===0,
      unscheduledCriticalTargets,
      gd1TechnicalSessionCount,
      gd1MinimumAdvisoryMet,
      ready:unscheduledCriticalTargets.length===0&&(gd1MinimumAdvisoryMet!==false)
    };

    return deepFreeze({
      schema:resultSchema.$id,
      requestId:request.requestId,
      phaseId:request.phaseId,
      weekStart:request.weekStart,
      capacityMinutes:request.weeklyCapacityMinutes,
      usedMinutes,
      remainingMinutes:request.weeklyCapacityMinutes-usedMinutes,
      sessions,
      deferred,
      readiness,
      calendarWriteAllowed:false,
      persisted:false,
      runtimeWriteAllowed:false
    });
  };

  return Object.freeze({
    contract:cloneFrozen(contract),
    requestSchema:cloneFrozen(requestSchema),
    resultSchema:cloneFrozen(resultSchema),
    priority,
    blockedDynamicTargetIds:cloneFrozen([...blockedDynamicTargets].sort()),
    validateRequest,
    projectWeek
  });
}
