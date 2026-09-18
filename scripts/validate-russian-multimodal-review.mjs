import fs from 'node:fs';
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

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/multimodal-review-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/multimodal-review.js','utf8'),
    fs.readFileSync('subjects/russian/index.html','utf8'),
    fs.readFileSync('subjects/russian/assets/vocab-srs.js','utf8'),
    fs.readFileSync('subjects/russian/assets/learning-state.js','utf8')
  );
  return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_MULTIMODAL_REVIEW_GATE=PASS');
  console.log(JSON.stringify({modalities:5,schedulerAuthority:'RUSSIAN_VOCAB_SRS_V1',crossModalityInference:false},null,2));
}
