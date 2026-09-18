import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_SPEAKING_LADDER_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_SPEAKING_SHADOWING_LADDER_CONTRACT_V1','Unexpected speaking ladder schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['imitation','shadowing','memory','roleplay','repair']),'Speaking ladder order drifted');
  assert(c.prerequisites?.normalListenBeforeImitation===1,'Imitation must require prior normal listening');
  assert(c.prerequisites?.normalListensBeforeShadowing===2,'Shadowing must require two normal listens');
  assert(c.prerequisites?.imitationBeforeShadowing===true&&c.prerequisites?.shadowingBeforeMemory===true&&c.prerequisites?.memoryBeforeRoleplay===true,'Speaking stage prerequisites weakened');
  assert(c.prerequisites?.pronunciationFlagBeforeRepair===true,'Repair must require explicit pronunciation flag');
  assert(c.runtime?.reuseCoreRecorder===true&&c.runtime?.roleplayEvidenceRequiresRecording===true,'Speaking evidence must come from real recorder use');
  assert(c.runtime?.listeningLadderOwnedByTurn8===true&&c.runtime?.slowListenOwnedByRepairOnly===true,'Listening/speaking ownership drifted');
  assert(c.feedback?.translationAnswerForbidden===true&&c.feedback?.autoMasteryFromSimilarityScore===false,'Speaking feedback policy weakened');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Speaking ladder may not own mastery');
  return true;
}

export function validateRuntime(js,css,core){
  assert(js.includes("const STAGES=['imitation','shadowing','memory','roleplay','repair']"),'Runtime speaking stage sequence missing');
  assert(js.includes("function startImitation()"),'Imitation stage missing');
  assert(js.includes("function startShadow()"),'Shadowing stage missing');
  assert(js.includes("function startMemory()"),'Memory speaking stage missing');
  assert(js.includes("function startRoleplay(role)"),'Role-play stage missing');
  assert(js.includes("function startRepair()"),'Repair stage missing');
  assert(js.includes("heardCount(c)>=1"),'Imitation is not listening-gated');
  assert(js.includes("heardCount(c)>=2"),'Shadowing is not two-listen gated');
  assert(js.includes("clickCore('record-line')"),'Speaking ladder does not reuse core recorder');
  assert(js.includes("clickCore(role==='B'?'role-b':'role-a')"),'Role-play does not reuse core role controls');
  assert(js.includes("clickCore('speak-line-slow')"),'Repair does not reuse slow-listen repair control');
  assert(!js.includes('Listening ladder'),'Speaking coach still duplicates Turn 8 ownership');
  assert(!js.includes("startListening("),'Speaking coach still owns a separate listening flow');
  assert(js.includes("if(mode==='roleplay')bump('roleplayAttempts'"),'Role-play evidence is not recorder-backed');
  assert(!/speak-dialogue[^\n]*roleplay/i.test(js),'Role-play evidence must not come from listening to full dialogue');
  assert(js.includes("'pronunciation_error'"),'Pronunciation repair Review Queue bridge missing');
  assert(!js.includes('mastered:true')&&!js.includes("status:'mastered'"),'Speaking ladder writes mastery');
  assert(!/score\s*[><]=?/.test(js),'Speaking ladder must not auto-classify by score threshold');
  assert(css.includes('.ru-speaking-memory-mode')&&css.includes('.russian-line'),'Memory mode must hide the actual Russian line');
  assert(core.includes("if(act==='record-line')startLineRecording();"),'Core recorder action missing');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/speaking-shadowing-ladder-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/speaking-coach.js','utf8'),
    fs.readFileSync('subjects/russian/assets/speaking-coach.css','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8')
  );
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_SPEAKING_LADDER_GATE=PASS');
  console.log(JSON.stringify({stages:5,roleplayRecorderBacked:true,repairExplicit:true,listeningOwner:'Turn8'},null,2));
}
