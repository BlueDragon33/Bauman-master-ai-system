import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createBrowserEvidencePipeline,mapBrowserObservationToRu04} from '../integration/browser-evidence-pipeline.js';
import {deriveLearnerMetrics} from '../learner/learner-metrics.js';
import {openOrResumeBrowserSession} from '../integration/browser-session.js';
import {shouldEnableGroundedSlice} from '../integration/grounded-browser-model.js';

function memoryStorage(){
  const m=new Map();
  return {
    getItem:k=>m.has(k)?m.get(k):null,
    setItem:(k,v)=>m.set(k,String(v)),
    removeItem:k=>m.delete(k),
    keys:()=>[...m.keys()]
  };
}
function assessmentOwner(){
  const attempts=new Map(),evidence=new Map();
  return {
    state:{attempts,evidence},
    recordAssessmentAttempt(x){
      if(attempts.has(x.attemptId))return {created:false,attempt:attempts.get(x.attemptId)};
      attempts.set(x.attemptId,structuredClone(x));return {created:true,attempt:x};
    },
    recordEvidence(x){
      if(x.authoritative===true)throw new Error('authoritative forbidden');
      if(evidence.has(x.evidenceId))return {created:false,evidence:evidence.get(x.evidenceId)};
      evidence.set(x.evidenceId,structuredClone(x));return {created:true,evidence:x};
    }
  };
}

const observation={
 evidenceId:'E-BETA-1',attemptId:'ATT-BETA-1',experienceId:'EXP-BETA',
 competencyIds:['COMP-RU-LISTEN','COMP-RU-INTERACT'],
 observationType:'grounded-semantic-comprehension',
 result:{success:true,selectedObjectId:'ball'},
 supportLevel:0,authoritative:false
};
const mapped=mapBrowserObservationToRu04(observation,{contentRevision:'beta-v1'});
assert.equal(mapped.evidenceCandidates.length,2);
assert(mapped.evidenceCandidates.every(x=>x.authoritative===false));

const storage=memoryStorage();
const unavailable=createBrowserEvidencePipeline({windowLike:{},storage,profileId:'p1',contentRevision:'beta-v1'});
assert.equal(unavailable.submit(observation).created,true);
const failed=await unavailable.flush();
assert.equal(failed.length,1);
assert.equal(failed[0].infrastructureFailure,true);
assert.equal(unavailable.pending().length,1);

const owner=assessmentOwner();
const recovered=createBrowserEvidencePipeline({windowLike:{RussianAssessmentMastery:owner},storage,profileId:'p1',contentRevision:'beta-v1'});
assert.equal(recovered.pending().length,1);
const delivered=await recovered.flush();
assert.equal(delivered[0].delivered,true);
assert.equal(recovered.pending().length,0);
assert.equal(owner.state.attempts.size,1);
assert.equal(owner.state.evidence.size,2);

assert.equal(recovered.submit(observation).created,false);
await recovered.flush();
assert.equal(owner.state.attempts.size,1);
assert.equal(owner.state.evidence.size,2);

const rawVoice={...observation,evidenceId:'E-RAW',attemptId:'ATT-RAW',rawAudio:{bytes:[1,2,3]}};
assert.equal(recovered.submit(rawVoice).ok,false);

const metricRows=[
 {...observation,result:{success:true},supportLevel:0},
 {...observation,evidenceId:'E2',result:{success:true},supportLevel:10},
 {...observation,evidenceId:'E3',result:{success:false},supportLevel:0,provider:{infrastructureFailure:true}}
];
const metrics=deriveLearnerMetrics(metricRows);
assert.equal(metrics.independentSemanticComprehension,0.5);
assert.equal(metrics.translationDependence,0.5);
assert.equal(metrics.infrastructureFailureRate,0.333);
assert.equal(metrics.authoritative,false);

const sessionStorage=memoryStorage();
const sessionOwner=assessmentOwner();
let plannerRows=[];
const windowLike={
 RussianAssessmentMastery:sessionOwner,
 RussianEngineIntegration:{publishPlannerCandidates(rows){plannerRows=rows;return rows}}
};
const s1=openOrResumeBrowserSession({windowLike,storage:sessionStorage,profileId:'learner-a',experienceId:'EXP-SESSION',contentRevision:'beta-v1'});
await s1.recordObservation({...observation,evidenceId:'S-E1',attemptId:'S-A1',experienceId:'EXP-SESSION'});
const snap1=s1.snapshot();
const s2=openOrResumeBrowserSession({windowLike,storage:sessionStorage,profileId:'learner-a',experienceId:'EXP-SESSION',contentRevision:'beta-v1'});
assert.equal(s2.sessionId,s1.sessionId);
assert.equal(s2.snapshot().evidence.length,1);
await s2.recordObservation({...observation,evidenceId:'S-E1',attemptId:'S-A1',experienceId:'EXP-SESSION'});
assert.equal(s2.snapshot().evidence.length,1);
assert.equal(sessionOwner.state.attempts.size,1);
s2.complete();
assert.equal(s2.snapshot().status,'COMPLETED');
assert.equal(plannerRows.length,1);
assert.equal(plannerRows[0].source,undefined);
assert.equal(plannerRows[0].reason,'continue_path');

assert.equal(shouldEnableGroundedSlice('https://x.test/?ruEngine=grounded-v1'),true);
assert.equal(shouldEnableGroundedSlice('https://x.test/?ruEngine=beta-v1'),true);
assert.equal(shouldEnableGroundedSlice('https://x.test/'),false);

const sw=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
for(const asset of ['browser-durable-outbox.js','browser-evidence-pipeline.js','browser-session.js','learner-metrics.js'])assert(sw.includes(asset));
assert(sw.includes('russian-app-shell-v18-engine-beta-loop'));

console.log(JSON.stringify({
 ok:true,
 reloadRecovery:true,
 duplicateDeliveryBlocked:true,
 rawVoiceBlocked:true,
 metricsDeterministic:true,
 sessionResume:true,
 betaFlag:true,
 offlinePrecache:true
}));
