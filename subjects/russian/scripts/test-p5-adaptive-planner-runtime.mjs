import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const writes=[];
const store=new Map([['bauman_russian_survival_master_v11_clean_skeleton',JSON.stringify({stage:'prep'})]]);
const localStorage={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>{writes.push(k);store.set(k,String(v));},
  removeItem:k=>store.delete(k)
};
const assessment={
  schema:'RUSSIAN_ASSESSMENT_MASTERY_STATE_V1',
  exportState:()=>({weaknesses:{
    'grammar-case':{skill:'grammar',label:'Sửa cách 2',route:{view:'grammar'}},
    'speaking-repair':{skill:'speaking',label:'Sửa phản xạ nói',route:{view:'dialogue'}}
  }})
};
const learning={
  schema:'RUSSIAN_LEARNING_STATE_V2',
  get:()=>({resume:{lessonId:'R08',activity:'Bài R08',route:{view:'learning',learnTab:'theory',lessonId:'R08'}}}),
  dueReviews:()=>Array.from({length:10000},(_,i)=>({id:'rev-'+i,label:'Review '+i,skill:i%2?'reading':'grammar',route:{view:'learning',learnTab:'review',reviewIndex:i}}))
};
const vocab={
  schema:'RUSSIAN_VOCAB_SRS_V1',
  dueCards:()=>Array.from({length:10000},(_,i)=>({key:'v-'+i,term:'слово'+i,stage:'prep',stageIndex:i}))
};
const window={SUBJECT_ADAPTER:{storageKey:'bauman_russian_survival_master_v11_clean_skeleton'},RussianAssessmentMastery:assessment,RussianLearningState:learning,RussianVocabSrs:vocab};
const context={window,localStorage,console,JSON,Date,Math,Set,Object,Array,Number,String};
vm.createContext(context);
vm.runInContext(fs.readFileSync('subjects/russian/assets/adaptive-planner.js','utf8'),context,{filename:'adaptive-planner.js'});
const planner=window.RussianAdaptivePlanner;
assert.ok(planner,'planner exported');
const beforeWrites=writes.length;
const a=planner.buildPlan({maxItems:8});
const b=planner.buildPlan({maxItems:8});
assert.deepEqual(a,b,'same canonical state must produce same plan');
assert.equal(writes.length,beforeWrites,'buildPlan must be read-only');
assert.equal(a.tasks.length,8,'normal plan is bounded');
assert.equal(new Set(a.tasks.map(x=>x.id)).size,a.tasks.length,'tasks must deduplicate');
assert.ok(a.tasks.some(x=>x.reason==='weakness_repair'),'weakness evidence must surface');
assert.ok(a.tasks.some(x=>x.skill==='speaking'),'speaking must not be starved');

assessment.exportState=()=>({weaknesses:{}});
learning.dueReviews=()=>[];
vocab.dueCards=()=>[];
learning.get=()=>({resume:null});
const balanced=planner.buildPlan({maxItems:8});
for(const skill of ['listening','speaking','writing','technical'])assert.ok(balanced.tasks.some(x=>x.skill===skill),'missing balance skill '+skill);

planner.setMode('intensive');
assert.ok(writes.includes('bauman_russian_personalization_v1'),'personalization writes must stay in their own state key');
assert.ok(!writes.includes('bauman_russian_assessment_mastery_v1'),'planner must never write P4 mastery key');
const intensive=planner.buildPlan();
assert.ok(intensive.maxItems>=12,'intensive mode may increase capacity');
console.log('Russian P5 adaptive planner runtime: PASS');