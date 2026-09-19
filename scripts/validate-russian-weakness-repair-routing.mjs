import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error('RUSSIAN_WEAKNESS_REPAIR_ROUTING_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const SOURCES=['exam_wrong','listening_detail','speaking_pronunciation','speaking_abandoned','deep_speaking','cyrillic_print','cyrillic_cursive','cyrillic_sound','dictation','multimodal_review','skill_gate'];
const LIFECYCLE=['detected','opened','attempted','repair_evidence_present','resolved'];

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_WEAKNESS_REPAIR_ROUTING_CONTRACT_V1','Unexpected weakness repair contract');
  assert(JSON.stringify(c.sources)===JSON.stringify(SOURCES),'Weakness source set drifted');
  assert(JSON.stringify(c.lifecycle)===JSON.stringify(LIFECYCLE),'Repair lifecycle drifted');
  assert(c.authority?.sourceEvidenceReadOnly===true&&c.authority?.repairStoreAdditiveOnly===true,'Repair layer must be additive/read-only');
  assert(c.authority?.repairStoreKey==='bauman_russian_weakness_repair_v1','Repair storage authority drifted');
  assert(c.authority?.schedulerOwner==='RUSSIAN_VOCAB_SRS_V1','SRS scheduling authority drifted');
  assert(c.authority?.canonicalReviewQueueOwner==='RUSSIAN_LEARNING_STATE_V1','Review Queue authority drifted');
  assert(c.resolution?.openDoesNotResolve===true&&c.resolution?.requiresEvidenceAfterOpen===true&&c.resolution?.requiresEvidenceAfterWeakness===true,'Evidence-gated resolution weakened');
  assert(c.resolution?.skillGateSignalsAdvisory===true&&c.resolution?.crossSignalInference===false,'Skill/cross-signal isolation weakened');
  assert(c.invariants?.noMasteryMutation===true&&c.invariants?.noCompletionMutation===true,'Mastery/completion mutation forbidden');
  assert(c.invariants?.noDueDateMutation===true&&c.invariants?.noCanonicalReviewQueueMutation===true,'Scheduler/Review Queue mutation forbidden');
  assert(c.invariants?.noOpenEqualsComplete===true,'Opening a repair item must never equal completion');
  return true;
}

export function validateRuntime(js){
  assert(js.includes("const SCHEMA='RUSSIAN_WEAKNESS_REPAIR_ROUTER_V1'"),'Repair router schema missing');
  assert(js.includes("const STORAGE_KEY='bauman_russian_weakness_repair_v1'"),'Dedicated repair store missing');
  assert(js.includes("status:'opened'"),'Opened lifecycle state missing');
  assert(js.includes("item.status='attempted'"),'Attempted lifecycle state missing');
  assert(js.includes("item.status='repair_evidence_present'"),'Repair-evidence lifecycle state missing');
  assert(js.includes("item.status='resolved'"),'Resolved lifecycle state missing');
  assert(js.includes("root.dispatchEvent?.(new CustomEvent('russian:repair-route'"),'Focused route event missing');
  assert(!js.includes('bauman_russian_learning_state_v1'),'Repair router must not access canonical Learning State storage directly');
  assert(!js.includes('bauman_russian_vocab_srs_v1'),'Repair router must not access SRS storage directly');
  assert(!js.includes('RussianLearningState?.addReview'),'Repair router must not enqueue canonical review');
  assert(!js.includes('RussianLearningState?.removeReview'),'Repair router must not remove canonical review');
  return true;
}

export function validateFocusedApis(cyr,reading,dictation,multimodal){
  assert(cyr.includes('function openRepair(section,letter)')&&cyr.includes('openRepair'),'Cyrillic focused repair API missing');
  assert(reading.includes('function openRepair(stage,id)')&&reading.includes('openRepair'),'Reading focused repair API missing');
  assert(dictation.includes('function openRepair(stage,key)')&&dictation.includes('openRepair'),'Dictation focused repair API missing');
  assert(multimodal.includes('function focusRepair(modality)')&&multimodal.includes('focusRepair'),'Multimodal focused repair API missing');
  return true;
}

export function validateCore(core){
  assert(core.includes("window.addEventListener('russian:repair-route',handleRepairRoute)"),'Core repair-route bridge missing');
  assert(core.includes("if(target.kind==='cyrillic')window.RussianCyrillicLiteracy?.openRepair"),'Core Cyrillic repair target missing');
  assert(core.includes("if(target.kind==='dictation')window.RussianDictation?.openRepair"),'Core dictation repair target missing');
  assert(core.includes("if(target.kind==='multimodal')window.RussianMultimodalReview?.focusRepair"),'Core multimodal repair target missing');
  assert(core.includes("if(target.kind==='speaking_repair')window.RussianSpeakingCoach?.startRepair"),'Core speaking repair target missing');
  assert(core.includes('if(doneAt>createdAt)plan.completed[card.id]=doneAt'),'Legacy remedial completion must depend on later correct review evidence');
  const clickStart=core.indexOf('if(b.dataset.remedialCard)');
  const clickEnd=core.indexOf('if(b.dataset.uiTheme)',clickStart);
  assert(clickStart>=0&&clickEnd>clickStart,'Legacy remedial click handler missing');
  const click=core.slice(clickStart,clickEnd);
  assert(!click.includes('remedialPlan.completed[id]=Date.now()'),'Legacy remedial click still marks completion immediately');
  assert(click.includes("chưa tính hoàn thành"),'Legacy remedial click must state evidence is still required');
  return true;
}

export function validateIndex(index){
  assert(index.includes('<script src="assets/weakness-repair-router.js"></script>'),'Repair router script not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/weakness-repair-router.css">'),'Repair router CSS not loaded');
  assert(!index.includes('\\n'),'Literal newline escape remains in Russian index wiring');
  return true;
}

function makeDocument(){
  return {
    addEventListener:()=>{},
    getElementById:()=>null,
    querySelector:()=>null
  };
}

export function loadRuntime(js,{stores={},skillReport=null}={}){
  const data=new Map(Object.entries(stores).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)]));
  const writes=[];
  const events=[];
  let currentSkill=skillReport;
  const localStorage={
    getItem:key=>data.has(key)?data.get(key):null,
    setItem:(key,value)=>{writes.push(String(key));data.set(String(key),String(value));},
    removeItem:key=>{writes.push(String(key));data.delete(String(key));}
  };
  const root={
    SUBJECT_ADAPTER:{storageKey:'bauman_russian_survival_master_v11_clean_skeleton'},
    RussianSkillGatedAssessment:{snapshot:()=>currentSkill},
    addEventListener:()=>{},
    dispatchEvent:event=>events.push(event)
  };
  root.window=root;
  const sandbox={
    window:root,
    console,
    JSON,
    Object,
    String,
    Number,
    Date,
    Math,
    Map,
    Set,
    localStorage,
    document:makeDocument(),
    CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}},
    requestAnimationFrame:undefined,
    setTimeout:()=>0,
    MutationObserver:class{observe(){}}
  };
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'weakness-repair-router.js'});
  return {
    api:root.RussianWeaknessRepairRouter,
    data,
    writes,
    events,
    setSkillReport:v=>{currentSkill=v;}
  };
}

export function validateBehavior(js){
  const CORE='bauman_russian_survival_master_v11_clean_skeleton';
  const REPAIR='bauman_russian_weakness_repair_v1';
  const SRS='bauman_russian_vocab_srs_v1';
  const LEARNING='bauman_russian_learning_state_v1';
  const now=Date.now();
  const stores={
    [CORE]:{
      view:'overview',
      reviewProgress:{wrong:{q1:{at:now-1000,lessonId:'R01',skill:'phonetics'}},done:{}},
      deepSpeakingProgress:{weak:{deep1:now-800},done:{}}
    },
    bauman_russian_listening_ladder_v1:{lines:{'dlg__2':{detailAttempts:1,detailCorrect:0,lastDetail:{ok:false,at:now-900}}}},
    bauman_russian_speaking_coach_v1:{lines:{'R01:dlg:2':{lessonId:'R01',dialogueId:'dlg',lineIndex:2,pronunciationFlags:1,lastFlagAt:new Date(now-700).toISOString(),repairAttempts:0,selfOk:0,lastAt:null}}},
    bauman_russian_cyrillic_literacy_v1:{lastResult:{letter:'Ж',ok:false,section:'cursive',at:now-600},cursiveSeen:{'Ж':{attempts:1,correct:0,lastAt:now-600}}},
    bauman_russian_dictation_v1:{stage:'sound_to_word',feedback:{ok:false,at:now-500},items:{'sound_to_word:w1':{attempts:1,correct:0,lastAt:new Date(now-500).toISOString()}}},
    bauman_russian_multimodal_review_v1:{cards:{'vocab:4':{key:'vocab:4',index:4,modalities:{audio:{attempts:1,ratings:{forgot:1,unsure:0,recalled:0},lastRating:'forgot',lastAt:new Date(now-400).toISOString()}}}}},
    [SRS]:{schema:'RUSSIAN_VOCAB_SRS_V1',sentinel:'scheduler'},
    [LEARNING]:{schema:'RUSSIAN_LEARNING_STATE_V1',reviewQueue:{sentinel:{id:'sentinel'}},sentinel:'canonical'}
  };
  const skillReport={skills:{listening:{meetsGate:false},speaking:{meetsGate:true},print_recognition:{meetsGate:true},cursive_recognition:{meetsGate:true},reading:{meetsGate:true},writing:{meetsGate:true}}};
  const rt=loadRuntime(js,{stores,skillReport});
  const beforeAuthority={core:rt.data.get(CORE),srs:rt.data.get(SRS),learning:rt.data.get(LEARNING)};
  const first=rt.api.refresh(true);
  const sources=new Set(first.active.map(x=>x.source));
  for(const required of ['exam_wrong','listening_detail','speaking_pronunciation','deep_speaking','cyrillic_cursive','dictation','multimodal_review','skill_gate']){
    assert(sources.has(required),'Behavioral scan missing signal source: '+required);
  }
  assert(rt.writes.every(key=>key===REPAIR),'Repair runtime wrote outside dedicated repair storage');
  assert(rt.data.get(CORE)===beforeAuthority.core&&rt.data.get(SRS)===beforeAuthority.srs&&rt.data.get(LEARNING)===beforeAuthority.learning,'Repair scan mutated protected authority');

  assert(rt.api.open('pron:R01:dlg:2')===true,'Pronunciation repair item did not open');
  let state=rt.api.get();
  assert(state.items['pron:R01:dlg:2'].status==='opened','Opening repair item incorrectly advanced lifecycle');
  assert(!state.items['pron:R01:dlg:2'].resolvedAt,'Opening repair item incorrectly resolved it');

  const speak=JSON.parse(rt.data.get('bauman_russian_speaking_coach_v1'));
  speak.lines['R01:dlg:2'].repairAttempts=1;
  speak.lines['R01:dlg:2'].lastAt=new Date(Date.now()+1000).toISOString();
  rt.data.set('bauman_russian_speaking_coach_v1',JSON.stringify(speak));
  rt.api.refresh(true);
  state=rt.api.get();
  assert(state.items['pron:R01:dlg:2'].status==='attempted','Repair attempt was not recorded');
  assert(!state.items['pron:R01:dlg:2'].resolvedAt,'Repair attempt without self-confirmed evidence resolved too early');

  const speak2=JSON.parse(rt.data.get('bauman_russian_speaking_coach_v1'));
  speak2.lines['R01:dlg:2'].selfOk=1;
  speak2.lines['R01:dlg:2'].lastSelfOkAt=new Date(Date.now()+2000).toISOString();
  rt.data.set('bauman_russian_speaking_coach_v1',JSON.stringify(speak2));
  rt.api.refresh(true);
  state=rt.api.get();
  assert(state.items['pron:R01:dlg:2'].status==='resolved'&&state.items['pron:R01:dlg:2'].repairEvidenceAt,'Pronunciation repair did not resolve after new repair evidence');

  assert(rt.api.open('exam:q1')===true,'Exam repair item did not open');
  const core=JSON.parse(rt.data.get(CORE));
  core.reviewProgress.done.q1={at:Date.now()+3000,ok:true};
  rt.data.set(CORE,JSON.stringify(core));
  rt.api.refresh(true);
  state=rt.api.get();
  assert(state.items['exam:q1'].status==='resolved','Exam weakness did not resolve from later correct review evidence');

  assert(rt.api.open('skill:listening')===true,'Skill blocker did not open');
  state=rt.api.get();
  assert(!state.items['skill:listening'].resolvedAt,'Opening advisory skill blocker must not resolve it');
  rt.setSkillReport({skills:{listening:{meetsGate:true},speaking:{meetsGate:true},print_recognition:{meetsGate:true},cursive_recognition:{meetsGate:true},reading:{meetsGate:true},writing:{meetsGate:true}}});
  rt.api.refresh(true);
  state=rt.api.get();
  assert(state.items['skill:listening'].status==='resolved','Skill blocker did not resolve when its own gate became green');

  assert(rt.data.get(SRS)===beforeAuthority.srs&&rt.data.get(LEARNING)===beforeAuthority.learning,'Repair lifecycle mutated SRS or canonical Review Queue state');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/weakness-repair-routing-contract.v1.json','utf8'));
  const js=fs.readFileSync('subjects/russian/assets/weakness-repair-router.js','utf8');
  const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
  const cyr=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8');
  const reading=fs.readFileSync('subjects/russian/assets/reading-bridge.js','utf8');
  const dictation=fs.readFileSync('subjects/russian/assets/dictation-listen-write.js','utf8');
  const multimodal=fs.readFileSync('subjects/russian/assets/multimodal-review.js','utf8');
  const index=fs.readFileSync('subjects/russian/index.html','utf8');
  validateContract(c);
  validateRuntime(js);
  validateFocusedApis(cyr,reading,dictation,multimodal);
  validateCore(core);
  validateIndex(index);
  validateBehavior(js);
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_WEAKNESS_REPAIR_ROUTING_GATE=PASS');
  console.log(JSON.stringify({sources:SOURCES,lifecycle:LIFECYCLE,repairStoreOnly:true,evidenceGatedResolution:true},null,2));
}
