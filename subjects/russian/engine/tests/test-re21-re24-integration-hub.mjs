import assert from 'node:assert/strict';
import {createIntegrationTransactionHub} from '../integration/integration-transaction-hub.mjs';
import {createMemoryOutbox} from '../integration/durable-outbox.mjs';
import {createPackRegistry} from '../authoring/pack-compiler.mjs';
import {resolvePackItem} from '../authoring/pack-resolver.mjs';
import {inspectAppCompatibility,requiredCrossBoundaryWrites} from '../integration/compatibility-dry-run.mjs';

const attempts=new Map(),evidence=new Map();
const owner={
 recordAssessmentAttempt(x){if(attempts.has(x.attemptId))return{created:false,attempt:attempts.get(x.attemptId)};attempts.set(x.attemptId,x);return{created:true,attempt:x}},
 recordEvidence(x){if(evidence.has(x.evidenceId))return{created:false,evidence:evidence.get(x.evidenceId)};evidence.set(x.evidenceId,x);return{created:true,evidence:x}}
};
const observation={evidenceId:'E-1',attemptId:'A-1',experienceId:'EXP-1',competencyIds:['COMP-RU-LISTEN'],observationType:'grounded-semantic-comprehension',result:{success:true},authoritative:false};
const hub=createIntegrationTransactionHub({assessmentOwner:owner});
const preview=hub.dryRun({observation,contentRevision:'r1'});
assert.equal(preview.applied,false);
const first=hub.apply({observation,contentRevision:'r1'});
const second=hub.apply({observation,contentRevision:'r1'});
assert.equal(first.applied,true);
assert.deepEqual(second,first);
assert.equal(attempts.size,1);
assert.equal(evidence.size,1);

const outbox=createMemoryOutbox();
assert.equal(outbox.enqueue({messageId:'M1',value:1}).created,true);
assert.equal(outbox.enqueue({messageId:'M1',value:1}).created,false);
let fails=0;
outbox.deliver('M1',()=>{fails++;throw new Error('offline')});
assert.equal(outbox.get('M1').state,'FAILED_RETRYABLE');
outbox.deliver('M1',()=>({ok:true}));
assert.equal(outbox.get('M1').state,'DELIVERED');
assert.equal(fails,1);

const registry=createPackRegistry();
const manifest={schemaVersion:'RUSSIAN_ENGINE_COMPILED_PACK_V1',packId:'p',revision:'r1',contentHash:'h1',minimumEngineApi:'1.0.0',itemIndex:[{id:'i1'}],capabilities:['audio'],offlinePreloadRefs:['a1']};
registry.install(manifest);registry.activate('p','r1');
const resolved=resolvePackItem({registry,packId:'p',itemId:'i1',engineApiVersion:'1.0.0'});
assert.equal(resolved.revision,'r1');
assert.throws(()=>resolvePackItem({registry,packId:'p',itemId:'i1',engineApiVersion:'0.9.0'}),/incompatible/);

const fakeWindow={
 RussianAssessmentMastery:{recordAssessmentAttempt(){},recordEvidence(){}},
 RussianAdaptivePlanner:{schema:'RUSSIAN_ADAPTIVE_PLANNER_V1',buildPlan(){},explain(){}},
 RussianAudioEngine:{},RussianSpeechRecognitionAdapter:{},RussianRecordingEngine:{},
 RussianEngineIntegration:{},navigator:{serviceWorker:{}}
};
const report=inspectAppCompatibility(fakeWindow);
assert.equal(report.state,'PARTIAL');
assert.equal(report.checks.plannerCandidateSeam,false);
const writes=requiredCrossBoundaryWrites(report);
assert(writes.some(x=>x.path==='subjects/russian/assets/adaptive-planner.js'));
assert(writes.some(x=>x.path==='subjects/russian/sw.js'));

console.log(JSON.stringify({ok:true,transactionIdempotent:true,outboxRetry:true,packResolution:true,compatibilityDryRun:true,crossBoundaryWrites:writes.map(x=>x.path)}));
