import assert from 'node:assert/strict';
import {
  createBrowserEvidenceRuntime,
  plannerCandidatesFromObservation,
  RUSSIAN_ENGINE_OUTBOX_KEY
} from '../integration/browser-evidence-runtime.js';

function storage(){
  const m=new Map();
  return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>m};
}
const localStorage=storage();
const attempts=new Map(),evidence=new Map();
const owner={
 recordAssessmentAttempt(x){if(attempts.has(x.attemptId))return{created:false,attempt:attempts.get(x.attemptId)};attempts.set(x.attemptId,x);return{created:true,attempt:x}},
 recordEvidence(x){if(evidence.has(x.evidenceId))return{created:false,evidence:evidence.get(x.evidenceId)};evidence.set(x.evidenceId,x);return{created:true,evidence:x}}
};
const plannerRows=[];
const plannerSource={publish(rows){plannerRows.splice(0,plannerRows.length,...rows);return rows}};
const windowLike={localStorage,RussianAssessmentMastery:owner};

const base={
 evidenceId:'E1',attemptId:'A1',experienceId:'EXP1',
 competencyIds:['COMP-RU-LISTEN','COMP-RU-INTERACT'],
 observationType:'grounded-semantic-comprehension',
 result:{success:true,selectedObjectId:'ball'},
 supportLevel:0,authoritative:false
};

const runtime=createBrowserEvidenceRuntime({windowLike,plannerSource});
const first=runtime.submit(base,{contentRevision:'r1',mode:'practice'});
assert.equal(first.delivered,true);
assert.equal(attempts.size,1);
assert.equal(evidence.size,2);
assert.equal(plannerRows[0].reason,'continue_path');

const duplicate=runtime.submit(base,{contentRevision:'r1',mode:'practice'});
assert.equal(duplicate.delivered,false);
assert.equal(attempts.size,1);
assert.equal(evidence.size,2);

const highSupport={...base,evidenceId:'E2',attemptId:'A2',supportLevel:5};
runtime.submit(highSupport);
assert.equal(plannerRows[0].reason,'weakness_repair');
assert.match(plannerRows[0].id,/reinforce/);

const failed={...base,evidenceId:'E3',attemptId:'A3',result:{success:false}};
runtime.submit(failed);
assert.equal(plannerRows[0].reason,'weakness_repair');
assert.match(plannerRows[0].id,/remediate/);

const infra={...base,evidenceId:'E4',attemptId:'A4',result:{success:false},provider:{infrastructureFailure:true}};
runtime.submit(infra);
assert.equal(plannerRows.length,0);

const missingOwnerWindow={localStorage:storage()};
const pendingRuntime=createBrowserEvidenceRuntime({windowLike:missingOwnerWindow,plannerSource});
const pending=pendingRuntime.submit({...base,evidenceId:'E5',attemptId:'A5'});
assert.equal(pending.delivered,false);
assert.equal(pending.row.state,'FAILED_RETRYABLE');
missingOwnerWindow.RussianAssessmentMastery=owner;
const afterReload=createBrowserEvidenceRuntime({windowLike:missingOwnerWindow,plannerSource});
const retried=afterReload.retryPending();
assert.equal(retried[0].delivered,true);

assert.throws(()=>runtime.enqueue({...base,evidenceId:'BAD',attemptId:'BAD',rawAudio:'blob'}),/forbidden persisted fields/);
assert.equal(runtime.audit().forbiddenPersistedFields.length,0);
assert.equal(runtime.audit().rawAudioPersisted,false);
assert(localStorage.getItem(RUSSIAN_ENGINE_OUTBOX_KEY));

console.log(JSON.stringify({
 ok:true,
 ownerDeliveryIdempotent:true,
 reloadRetry:true,
 evidenceDrivenPlanner:true,
 infrastructureFailureNoRemediation:true,
 rawAudioPersistenceBlocked:true
}));
