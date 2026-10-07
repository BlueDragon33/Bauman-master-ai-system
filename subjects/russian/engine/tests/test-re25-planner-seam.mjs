import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createBrowserPlannerSource} from '../integration/browser-planner-source.js';

const plannerSource=fs.readFileSync(new URL('../../assets/adaptive-planner.js',import.meta.url),'utf8');
const store=new Map();
const localStorage={
  getItem:key=>store.has(key)?store.get(key):null,
  setItem:(key,value)=>{store.set(key,String(value));},
  removeItem:key=>store.delete(key)
};
const windowLike={
  SUBJECT_ADAPTER:{storageKey:'test-core'},
  RussianAssessmentMastery:{schema:'RUSSIAN_ASSESSMENT_MASTERY_V1',exportState:()=>({weaknesses:{}})},
  RussianLearningState:{schema:'RUSSIAN_LEARNING_STATE_V1',get:()=>({}),dueReviews:()=>[]},
  RussianVocabSrs:{schema:'RUSSIAN_VOCAB_SRS_V1',get:()=>({}),dueCards:()=>[]}
};
const context={window:windowLike,localStorage,console,Date,JSON,Math,Set,Map,String,Number,Array,Object};
vm.createContext(context);
vm.runInContext(plannerSource,context,{filename:'adaptive-planner.js'});

const planner=windowLike.RussianAdaptivePlanner;
assert.equal(planner.schema,'RUSSIAN_ADAPTIVE_PLANNER_V1');
assert.equal(typeof planner.registerCandidateSource,'function');
assert.equal(typeof planner.unregisterCandidateSource,'function');
assert.deepEqual(Array.from(planner.listCandidateSources()),[]);

const source=createBrowserPlannerSource();
assert.equal(source.attach(planner).attached,true);
assert.deepEqual(Array.from(planner.listCandidateSources()),['russian-engine']);

const published=source.publish([
  {id:'eng:1',label:'Engine follow-up',skill:'listening',reason:'continue_path',route:{view:'media'},priority:9999},
  {id:'eng:bad',label:'Forbidden override',reason:'manual_override',route:{view:'overview'},priority:9999},
  {id:'eng:1',label:'Duplicate',reason:'continue_path',route:{view:'media'},priority:1}
]);
assert.equal(published.length,1);
assert.equal(published[0].id,'eng:1');
assert.equal(published[0].priority,899);
assert.equal(published[0].source,'russian-engine');

const plan=planner.buildPlan({maxItems:8});
const engineTask=plan.tasks.find(x=>x.id==='eng:1');
assert(engineTask);
assert.equal(engineTask.reason,'continue_path');
assert.equal(engineTask.priority,899);
assert.equal(engineTask.source,'russian-engine');
assert.equal(plan.generatedFrom.candidateSources.includes('russian-engine'),true);
assert.equal(plan.tasks.some(x=>x.reason==='manual_override'),false);

planner.registerCandidateSource('broken',()=>{throw new Error('source failed')});
assert.doesNotThrow(()=>planner.buildPlan({maxItems:8}));
assert.equal(planner.listCandidateSources().includes('broken'),true);

assert.equal(source.detach(planner),true);
assert.equal(planner.listCandidateSources().includes('russian-engine'),false);

const sw=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
assert(sw.includes("russian-app-shell-v18-engine-evidence-runtime"));
assert(sw.includes("./engine/integration/browser-planner-source.js"));
assert(sw.includes("./engine/integration/browser-evidence-runtime.js"));

console.log(JSON.stringify({
  ok:true,
  registeredCandidateSource:true,
  manualOverrideImpersonationBlocked:true,
  priorityOwnerBounded:true,
  sourceFailureFailsClosed:true,
  offlinePrecache:true
}));
