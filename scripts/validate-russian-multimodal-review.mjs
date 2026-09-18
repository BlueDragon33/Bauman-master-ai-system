import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error('RUSSIAN_MULTIMODAL_REVIEW_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_MULTIMODAL_REVIEW_CONTRACT_V1','Unexpected multimodal review contract');
  assert(JSON.stringify(c.modalities)===JSON.stringify(['audio','visual','recognition','speaking','writing']),'Modality set/order drifted');
  assert(c.authority?.schedulerOwner==='RUSSIAN_VOCAB_SRS_V1','Existing SRS scheduler authority must be preserved');
  assert(c.authority?.canonicalReviewQueueOwner==='RUSSIAN_LEARNING_STATE_V1','Canonical Review Queue authority must be preserved');
  assert(c.authority?.multimodalEvidenceOnly===true,'Multimodal layer must remain evidence-only');
  assert(c.evidence?.perModality===true&&c.evidence?.crossModalityInference===false,'Modality evidence isolation missing');
  assert(c.invariants?.noDueDateMutation===true&&c.invariants?.noReviewQueueMutation===true,'Scheduling/Review Queue mutation forbidden');
  assert(c.invariants?.noMasteryMutation===true&&c.invariants?.noCompletionMutation===true,'Mastery/completion mutation forbidden');
  return true;
}

export function validateRuntime(js,index,srs,state){
  assert(js.includes("const MODALITIES=['audio','visual','recognition','speaking','writing']"),'Runtime modality set missing');
  assert(js.includes("modalities:{...(card.modalities||{}),[modality]:ev}"),'Per-modality evidence map missing');
  assert(js.includes("ev.ratings[rating]++"),'Modality rating evidence missing');
  for(const token of ['dueAt','addReview','removeReview','mastered','completed'])assert(!js.includes(token),`Evidence runtime must not reference authority token: ${token}`);
  assert(index.includes('<script src="assets/multimodal-review.js"></script>'),'Multimodal review runtime not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/multimodal-review.css">'),'Multimodal review CSS not loaded');
  assert(srs.includes("const SCHEMA='RUSSIAN_VOCAB_SRS_V1'"),'Existing SRS scheduler missing');
  assert(srs.includes('dueAt'),'Existing SRS due-date scheduling missing');
  assert(state.includes("function addReview(id,reason,route,label,dueAt)"),'Canonical Review Queue missing');
  return true;
}

export function validateBehavior(js){
  const CORE_KEY='bauman_russian_survival_master_v11_clean_skeleton';
  const SRS_KEY='bauman_russian_vocab_srs_v1';
  const LEARNING_KEY='bauman_russian_learning_state_v1';
  const MM_KEY='bauman_russian_multimodal_review_v1';
  const initial={
    [CORE_KEY]:JSON.stringify({vocabIndex:7,mastery:{vocab:0.42},completion:{russian:false},sentinel:'core-authority'}),
    [SRS_KEY]:JSON.stringify({schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:7':{dueAt:'2030-01-02T03:04:05.000Z',reviewCount:4}},sentinel:'scheduler-authority'}),
    [LEARNING_KEY]:JSON.stringify({schema:'RUSSIAN_LEARNING_STATE_V1',reviewQueue:{'vocab:7':{dueAt:'2030-01-02T03:04:05.000Z'}},items:{'vocab:7':{status:'review_due'}},sentinel:'review-authority'})
  };
  const store=new Map(Object.entries(initial));
  const writes=[];
  const events=[];
  const localStorage={
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,value)=>{writes.push(String(key));store.set(String(key),String(value));},
    removeItem:key=>{writes.push(String(key));store.delete(String(key));}
  };
  const document={
    querySelector:()=>null,
    getElementById:()=>null,
    addEventListener:()=>{}
  };
  class CustomEvent{
    constructor(type,init={}){this.type=type;this.detail=init.detail;}
  }
  const sandbox={
    console,
    Date,
    JSON,
    localStorage,
    document,
    CustomEvent,
    SUBECT_ADAPTER:undefined,
    dispatchEvent:event=>{events.push(event);}
  };
  sandbox.window=sandbox;
  sandbox.SUBJECT_ADAPTER={storageKey:CORE_KEY};
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'multimodal-review.js'});
  const api=sandbox.RussianMultimodalReview;
  assert(api?.schema==='RUSSIAN_MULTIMODAL_REVIEW_V1','Behavior runtime API missing');

  const beforeAuthority={
    core:store.get(CORE_KEY),
    srs:store.get(SRS_KEY),
    learning:store.get(LEARNING_KEY)
  };

  assert(api.record('audio','recalled',7)===true,'Audio evidence record failed');
  let state=api.get();
  assert(state.cards?.['vocab:7']?.modalities?.audio?.attempts===1,'Audio attempt was not stored');
  assert(state.cards?.['vocab:7']?.modalities?.audio?.ratings?.recalled===1,'Audio rating count was not stored');
  assert(state.cards?.['vocab:7']?.modalities?.recognition===undefined,'Audio evidence leaked into recognition');

  assert(api.record('recognition','forgot',7)===true,'Recognition evidence record failed');
  state=api.get();
  assert(state.cards?.['vocab:7']?.modalities?.audio?.ratings?.recalled===1,'Recognition write mutated audio evidence');
  assert(state.cards?.['vocab:7']?.modalities?.recognition?.ratings?.forgot===1,'Recognition rating count was not isolated');
  assert(state.cards?.['vocab:7']?.modalities?.speaking===undefined,'Recognition evidence leaked into speaking');

  assert(api.record('writing','unsure',7)===true,'Writing evidence record failed');
  state=api.get();
  assert(Object.keys(state.cards?.['vocab:7']?.modalities||{}).sort().join(',')==='audio,recognition,writing','Unexpected cross-modality synthesis occurred');
  assert(api.record('audio','mastered',7)===false,'Invalid authority-like rating must be rejected');

  assert(store.get(CORE_KEY)===beforeAuthority.core,'Multimodal evidence mutated core/mastery/completion authority');
  assert(store.get(SRS_KEY)===beforeAuthority.srs,'Multimodal evidence mutated SRS scheduler/due-date authority');
  assert(store.get(LEARNING_KEY)===beforeAuthority.learning,'Multimodal evidence mutated canonical Review Queue authority');
  assert(writes.length===3&&writes.every(key=>key===MM_KEY),'Evidence runtime wrote outside its dedicated storage key');
  assert(events.length===3&&events.every(e=>e?.type==='russian:multimodal-review'),'Evidence event contract drifted');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/multimodal-review-contract.v1.json','utf8'));
  validateContract(c);
  const js=fs.readFileSync('subjects/russian/assets/multimodal-review.js','utf8');
  validateRuntime(
    js,
    fs.readFileSync('subjects/russian/index.html','utf8'),
    fs.readFileSync('subjects/russian/assets/vocab-srs.js','utf8'),
    fs.readFileSync('subjects/russian/assets/learning-state.js','utf8')
  );
  validateBehavior(js);
  return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_MULTIMODAL_REVIEW_GATE=PASS');
  console.log(JSON.stringify({modalities:5,schedulerAuthority:'RUSSIAN_VOCAB_SRS_V1',crossModalityInference:false},null,2));
}
