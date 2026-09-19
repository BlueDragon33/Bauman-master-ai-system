import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentReadinessHarness} from './roadmap-v2-readiness-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error(`Missing current Admission file: ${label}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error(`Invalid current Admission JSON: ${label}`);}
}

export function loadCurrentAdmissionHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/admission/current-contract.json`,'Admission contract');
  const contractSchema=readJson(`${root}/roadmap_v2/admission/admission-contract.schema.json`,'Admission contract schema');
  const resultSchema=readJson(`${root}/roadmap_v2/admission/admission-result.schema.json`,'Admission result schema');
  const readiness=loadCurrentReadinessHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Admission contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.readinessContract,readiness.contract.schema,'Admission/Readiness contract mismatch');
  assert.equal(contract.upstreamSchemas.readinessRequest,readiness.requestSchema.$id,'Admission/Readiness request mismatch');
  assert.equal(contract.upstreamSchemas.readinessResult,readiness.resultSchema.$id,'Admission/Readiness result mismatch');
  assert.equal(contract.upstreamSchemas.admissionResult,resultSchema.$id,'Admission result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Admission production boundary widened');
  assert.equal(contract.mode.consumerAdapterEnabled,false,'Production Admission adapter enabled');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Admission persistence enabled');
  assert.equal(contract.mode.dashboardUiEnabled,false,'Admission dashboard enabled');
  assert.equal(contract.mode.scheduleWriteAllowed,false,'Admission schedule write enabled');
  assert.equal(contract.mode.calendarWriteAllowed,false,'Admission calendar write enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Admission runtime write enabled');
  assert.equal(contract.mode.notificationWriteAllowed,false,'Admission notification write enabled');
  assert.equal(contract.mode.automaticActionAllowed,false,'Admission automatic action enabled');

  const mapState=color=>{
    const state=contract.decisionPolicy[color];
    assert(['blocked','caution','ready_for_human_review'].includes(state),`Unsupported Admission readiness color: ${color}`);
    return state;
  };

  const projectAdvisory=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Admission input');
    const readinessResult=readiness.projectReadiness(input);
    assert.equal(readinessResult.persisted,false,'Persisted Readiness result reached Admission');
    assert.equal(readinessResult.dashboardUiRendered,false,'Readiness UI rendering reached Admission');
    assert.equal(readinessResult.runtimeWriteAllowed,false,'Readiness runtime write reached Admission');
    assert.equal(readinessResult.notificationWriteAllowed,false,'Readiness notification write reached Admission');

    const result={
      schema:resultSchema.$id,
      projectionId:`ADMISSION::${readinessResult.reportId}`,
      reportId:readinessResult.reportId,
      phaseId:readinessResult.phaseId,
      weekStart:readinessResult.weekStart,
      readinessColor:readinessResult.overallColor,
      advisoryState:mapState(readinessResult.overallColor),
      targetSummaries:readinessResult.targets.map(target=>({
        targetId:target.targetId,
        prerequisiteTargetId:target.prerequisiteTargetId,
        color:target.color,
        status:target.status,
        knowledgeState:target.knowledgeState,
        masterySnapshotPresent:target.masterySnapshotPresent,
        prerequisiteReady:target.prerequisiteReady,
        masterReady:target.masterReady,
        critical:target.critical,
        criticalScheduled:target.criticalScheduled,
        blockerCount:target.blockerCount,
        advisoryCount:target.advisoryCount,
        unresolvedExternalGateIds:clone(target.unresolvedExternalGateIds),
        reasonCodes:clone(target.reasonCodes)
      })),
      counts:clone(readinessResult.counts),
      scheduleReadiness:clone(readinessResult.scheduleReadiness),
      persisted:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };
    assert.equal(result.runtimeActionAuthorized,false);
    assert.equal(result.scheduleWriteAllowed,false);
    assert.equal(result.notificationWriteAllowed,false);
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    readiness,
    projectAdvisory
  });
}
