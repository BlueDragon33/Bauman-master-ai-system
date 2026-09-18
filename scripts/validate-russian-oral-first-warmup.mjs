import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=message=>{throw new Error(`RUSSIAN_ORAL_FIRST_WARMUP_GATE=FAIL\n${message}`)};
const assert=(value,message)=>{if(!value)fail(message)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_ORAL_FIRST_WARMUP_CONTRACT_V1','Unexpected warmup contract schema');
  const p=c.policy||{};
  for(const key of ['russianTextHiddenBeforeFirstNormalListen','tokenHintsHiddenBeforeFirstNormalListen','translationGlossHiddenBeforeFirstNormalListen','dialogueMapTextHiddenPerUnheardLine','normalListenUnlocksText','slowListenDoesNotUnlockText','slowListenDisabledBeforeNormalListen','speakingAttemptAllowedAfterNormalListen'])assert(p[key]===true,`Oral-first policy disabled: ${key}`);
  for(const [key,value] of Object.entries(c.persistence||{}))assert(value===true,`Persistence invariant changed: ${key}`);
  return true;
}

export function validateRuntime(core){
  assert(core.includes("practiceHeard:{}"),'Practice heard evidence missing from default state');
  assert(core.includes("function practiceHeardKey("),'Practice heard key helper missing');
  assert(core.includes("function practiceLineHeard("),'Practice heard lookup missing');
  assert(core.includes("function markPracticeLineHeard("),'Normal-listen evidence writer missing');
  assert(core.includes("const heard=practiceLineHeard(active,idx);"),'Practice render does not derive heard state');
  assert(core.includes("const currentRu=heard?esc(targetText"),'Russian text is not gated by heard state');
  assert(core.includes("const currentVi=heard&&!hideVi?dialogueVi(line):'';"),'Vietnamese gloss is not hidden before listen');
  assert(core.includes("const hints=heard?lineTokenHints(targetText):[];"),'Token hints are not hidden before listen');
  assert(/lineHeard\s*=\s*practiceLineHeard\(active,i\)/.test(core),'Dialogue map does not gate each line');
  assert(core.includes("data-act=\"speak-line-slow\" ${heard?'':'disabled'}"),'Slow-listen button is not disabled before normal listen');
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
  console.log(JSON.stringify({hearBeforeSee:true,normalListenUnlocks:true,slowListenUnlocks:false,masteryMutation:false},null,2));
}
