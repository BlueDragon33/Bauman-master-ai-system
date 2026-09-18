import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=message=>{throw new Error(`RUSSIAN_ORAL_FIRST_WARMUP_GATE=FAIL\n${message}`)};
const assert=(value,message)=>{if(!value)fail(message)};

function functionSlice(src,name,nextName){
  const start=src.indexOf('function '+name+'(');
  assert(start>=0,`Missing function ${name}`);
  const end=src.indexOf('function '+nextName+'(',start+1);
  assert(end>start,`Missing end anchor for ${name}`);
  return src.slice(start,end);
}

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_ORAL_FIRST_WARMUP_CONTRACT_V1','Unexpected warmup contract schema');
  const p=c.policy||{};
  for(const key of ['russianTextHiddenBeforeFirstNormalListen','tokenHintsHiddenBeforeFirstNormalListen','translationGlossHiddenBeforeFirstNormalListen','dialogueMapTextHiddenPerUnheardLine','normalListenUnlocksText','slowListenDoesNotUnlockText','slowListenDisabledBeforeNormalListen','speakingAttemptAllowedAfterNormalListen'])assert(p[key]===true,`Oral-first policy disabled: ${key}`);
  for(const [key,value] of Object.entries(c.persistence||{}))assert(value===true,`Persistence invariant changed: ${key}`);
  return true;
}

export function validateRuntime(core){
  const practice=functionSlice(core,'renderPractice','speechMapLineButton');
  assert(core.includes("practiceHeard:{}"),'Practice heard evidence missing from default state');
  assert(core.includes("function practiceHeardKey("),'Practice heard key helper missing');
  assert(core.includes("function practiceLineHeardCount("),'Practice heard-count lookup missing');
  assert(core.includes("function practiceLineHeard("),'Practice heard lookup missing');
  assert(core.includes("function markPracticeLineHeard("),'Normal-listen evidence writer missing');
  assert(practice.includes("const heardCount=practiceLineHeardCount(active,idx);"),'Practice render does not derive heard count');
  assert(practice.includes("const heard=heardCount>0;"),'Practice render does not derive heard state');
  assert(practice.includes("const currentRu=heard?esc(targetText"),'Russian text is not gated by heard state');

  // Turn 16 strengthened the old Turn 3 invariant: translation gloss is absent,
  // while Russian scaffold/context remains hidden until the first normal listen.
  for(const token of ['dialogueVi(','currentVi','toggle-vi'])assert(!practice.includes(token),`Translation gloss returned to practice surface: ${token}`);
  assert(practice.includes("const scaffoldUi=heard?dialogueScaffoldHtml(scaffold):'';"),'Russian dialogue scaffold is not hidden before listen');
  assert(practice.includes("const hints=heard?(arr(scaffold.vocabulary_seed_ru).length?arr(scaffold.vocabulary_seed_ru).slice(0,5):lineTokenHints(targetText)):[];"),'Russian token hints are not hidden before listen');

  assert(/lineHeard\s*=\s*practiceLineHeard\(active,i\)/.test(practice),'Dialogue map does not gate each line');
  assert(practice.includes("const slowReady=heardCount>=2;"),'Slow-listen readiness must be stricter than first-listen unlock');
  assert(practice.includes('data-act="speak-line-slow"')&&practice.includes("(slowReady?'':'disabled')"),'Slow-listen button is not disabled until repair readiness');
  assert(core.includes("if(inPracticeMode()){markPracticeLineHeard(d,activeLineIndex());render()}"),'Normal listen does not unlock text');
  const slow=core.match(/if\(act==='speak-line-slow'\)\{([^}]*)\}/);
  assert(slow&&!slow[1].includes('markPracticeLineHeard'),'Slow listen must not unlock text');
  assert(!/markPracticeLineHeard\([^)]*\)[^\n]*master/i.test(core),'Listening evidence must not mutate mastery');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/oral-first-warmup-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(fs.readFileSync('subjects/russian/assets/core.js','utf8'));
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_ORAL_FIRST_WARMUP_GATE=PASS');
  console.log(JSON.stringify({hearBeforeSee:true,normalListenUnlocks:true,slowListenUnlocks:false,translationGlossAbsent:true,masteryMutation:false},null,2));
}
