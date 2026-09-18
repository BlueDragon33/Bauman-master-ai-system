import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error('RUSSIAN_SKILL_GATED_ASSESSMENT_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const REQUIRED=['listening','speaking','print_recognition','cursive_recognition','reading','writing'];

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_SKILL_GATED_ASSESSMENT_CONTRACT_V1','Unexpected skill-gated assessment contract');
  assert(JSON.stringify(c.requiredSkills)===JSON.stringify(REQUIRED),'Required skill set/order drifted');
  assert(c.authority?.evidenceSourcesOnly===true&&c.authority?.runtimeReadOnly===true,'Assessment runtime must remain read-only evidence projection');
  assert(c.authority?.aggregateReadinessAdvisoryOnly===true,'Aggregate readiness must remain advisory');
  assert(c.authority?.masteryOwner==='existing_learning_state','Mastery authority drifted');
  assert(c.authority?.schedulerOwner==='RUSSIAN_VOCAB_SRS_V1','SRS scheduler authority drifted');
  assert(c.authority?.canonicalReviewQueueOwner==='RUSSIAN_LEARNING_STATE_V1','Canonical Review Queue authority drifted');
  assert(c.aggregate?.requiresEverySkillGate===true&&c.aggregate?.crossSkillInference===false,'Aggregate gate isolation weakened');
  assert(c.aggregate?.exposeBlockingSkills===true,'Blocking skills must remain visible');
  assert(Number(c.thresholds?.listening?.minQualifiedItems)>=5&&Number(c.thresholds?.listening?.minDetailAccuracy)>=0.8,'Listening threshold weakened');
  assert(Number(c.thresholds?.speaking?.minQualifiedItems)>=5&&c.thresholds?.speaking?.requiresRecorderBackedMemoryOrRoleplay===true&&c.thresholds?.speaking?.requiresSelfOk===true,'Speaking threshold weakened');
  assert(Number(c.thresholds?.print_recognition?.minSeenLetters)===33&&Number(c.thresholds?.print_recognition?.minAccuracy)>=0.8,'Print recognition threshold weakened');
  assert(Number(c.thresholds?.cursive_recognition?.minSeenLetters)===33&&Number(c.thresholds?.cursive_recognition?.minAccuracy)>=0.8,'Cursive recognition threshold weakened');
  assert(Number(c.thresholds?.reading?.minQualifiedItems)>=8&&c.thresholds?.reading?.requiresSelfReadAttempt===true&&c.thresholds?.reading?.requiresAudioCheck===true,'Reading threshold weakened');
  assert(Number(c.thresholds?.writing?.minQualifiedItems)>=8&&Number(c.thresholds?.writing?.minShortDictationItems)>=2&&Number(c.thresholds?.writing?.minAccuracy)>=0.8,'Writing threshold weakened');
  assert(c.invariants?.noMasteryMutation===true&&c.invariants?.noCompletionMutation===true,'Mastery/completion mutation forbidden');
  assert(c.invariants?.noDueDateMutation===true&&c.invariants?.noReviewQueueMutation===true,'Scheduler/Review Queue mutation forbidden');
  return true;
}

export function validateRuntime(js,index){
  for(const token of ['localStorage.setItem','localStorage.removeItem','RussianLearningState?.addReview','RussianLearningState.addReview','dueAt=','mastered=','completed=']){
    assert(!js.includes(token),'Read-only assessment runtime contains forbidden mutation token: '+token);
  }
  assert(js.includes("const SCHEMA='RUSSIAN_SKILL_GATED_ASSESSMENT_V1'"),'Skill-gated runtime schema missing');
  assert(js.includes("const REQUIRED=['listening','speaking','print_recognition','cursive_recognition','reading','writing']"),'Runtime required skill set missing');
  assert(js.includes('crossSkillInference:false'),'Runtime cross-skill inference invariant missing');
  assert(js.includes('aggregateReady=REQUIRED.every'),'Aggregate readiness must require every skill gate');
  assert(index.includes('<script src="assets/skill-gated-assessment.js"></script>'),'Skill-gated assessment runtime not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/skill-gated-assessment.css">'),'Skill-gated assessment CSS not loaded');
  return true;
}

function sampleSources(){
  const seen={};for(const ch of 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ')seen[ch]={attempts:1,correct:1};
  const listening={lines:{}};
  const speaking={lines:{}};
  const reading={items:{}};
  const writing={items:{}};
  for(let i=0;i<5;i++){
    listening.lines['l'+i]={gistChecks:1,detailAttempts:2,detailCorrect:2};
    speaking.lines['s'+i]={memoryAttempts:1,roleplayAttempts:i%2,selfOk:1};
  }
  for(let i=0;i<8;i++){
    reading.items['r'+i]={attempts:1,audioChecks:1};
    writing.items[(i<2?'short_dictation:':'sound_to_word:')+'w'+i]={attempts:1,correct:1};
  }
  return {
    listening,
    speaking,
    cyrillic:{attempts:40,correct:34,seen,cursiveAttempts:40,cursiveCorrect:34,cursiveSeen:seen},
    reading,
    writing
  };
}

export function loadRuntime(js,initialStore={}){
  const store=new Map(Object.entries(initialStore).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)]));
  const writes=[];
  const document={
    querySelector:()=>null,
    getElementById:()=>null,
    addEventListener:()=>{}
  };
  const sandbox={
    console,
    Date,
    JSON,
    Object,
    Math,
    document,
    localStorage:{
      getItem:key=>store.has(key)?store.get(key):null,
      setItem:(key,value)=>{writes.push(String(key));store.set(String(key),String(value));},
      removeItem:key=>{writes.push(String(key));store.delete(String(key));}
    },
    addEventListener:()=>{},
    dispatchEvent:()=>{}
  };
  sandbox.window=sandbox;
  sandbox.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail;}};
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'skill-gated-assessment.js'});
  return {api:sandbox.RussianSkillGatedAssessment,store,writes};
}

export function validateBehavior(js){
  const {api,writes}=loadRuntime(js);
  assert(api?.schema==='RUSSIAN_SKILL_GATED_ASSESSMENT_V1','Skill-gated runtime API missing');
  const source=sampleSources();
  const ready=api.evaluate(source);
  assert(ready.aggregate?.ready===true,'All six qualified skills should produce aggregate readiness');
  assert(Array.isArray(ready.aggregate?.blockers)&&ready.aggregate.blockers.length===0,'Ready aggregate must have no blockers');
  assert(REQUIRED.every(skill=>ready.skills?.[skill]?.meetsGate===true),'Qualified skill unexpectedly failed gate');

  const noSpeak=structuredClone(source);noSpeak.speaking={lines:{}};
  const blocked=api.evaluate(noSpeak);
  assert(blocked.skills?.listening?.meetsGate===true,'Strong listening evidence was lost');
  assert(blocked.skills?.speaking?.meetsGate===false,'Missing speaking evidence was inferred from another skill');
  assert(blocked.aggregate?.ready===false&&blocked.aggregate?.blockers?.includes('speaking'),'Aggregate readiness did not expose speaking blocker');

  const weakPrint=structuredClone(source);weakPrint.cyrillic.correct=20;
  const printBlocked=api.evaluate(weakPrint);
  assert(printBlocked.skills?.print_recognition?.meetsGate===false,'Weak print accuracy incorrectly passed');
  assert(printBlocked.skills?.cursive_recognition?.meetsGate===true,'Print failure leaked into cursive recognition');

  assert(writes.length===0,'Read-only skill assessment wrote to localStorage during evaluation');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/skill-gated-assessment-contract.v1.json','utf8'));
  const js=fs.readFileSync('subjects/russian/assets/skill-gated-assessment.js','utf8');
  const index=fs.readFileSync('subjects/russian/index.html','utf8');
  validateContract(c);
  validateRuntime(js,index);
  validateBehavior(js);
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_SKILL_GATED_ASSESSMENT_GATE=PASS');
  console.log(JSON.stringify({skills:REQUIRED,aggregateRequiresEverySkill:true,readOnly:true,crossSkillInference:false},null,2));
}
