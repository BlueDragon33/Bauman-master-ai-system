import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_DICTATION_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_DICTATION_LISTEN_WRITE_CONTRACT_V1','Unexpected dictation schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['sound_to_letter','sound_to_word','short_dictation']),'Dictation stage order drifted');
  assert(c.sources?.syntheticPromptData===false,'Dictation prompts must be source-backed');
  assert(c.practice?.answerHiddenBeforeAttempt===true&&c.practice?.revealAfterAttempts===2,'Dictation answer reveal policy weakened');
  assert(c.practice?.audioLanguage==='ru-RU','Dictation audio language must be ru-RU');
  assert(c.practice?.preserveYoDistinct===true,'Ё/Е distinction must be preserved');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Dictation may not own mastery');
  return true;
}

export function validateSources(sound,reading){
  assert(sound?.schema==='RUSSIAN_CYRILLIC_SOUND_MAP_V1','Unexpected sound source');
  assert(sound.entries?.length===33,`Expected 33 letters, found ${sound.entries?.length}`);
  assert(reading?.schema==='RUSSIAN_READING_BRIDGE_DATA_V1','Unexpected reading source');
  assert(reading.words?.length===16&&reading.short_texts?.length===8,'Reading source counts drifted');
  return true;
}

export function validateRuntime(js,index){
  assert(js.includes("const STAGES=['sound_to_letter','sound_to_word','short_dictation']"),'Runtime dictation stages missing');
  assert(js.includes("u.lang='ru-RU'"),'Runtime dictation audio is not ru-RU');
  assert(js.includes("if(ev.attempts<2)return;"),'Answer reveal is not gated by two attempts');
  assert(js.includes("if(state.stage==='sound_to_letter')return String(item.lower||item.letter||'').trim();"),'Letter dictation answer mapping missing');
  assert(js.includes("fetch('data/cyrillic-sound-map.json'")&&js.includes("fetch('data/reading-bridge.json'"),'Dictation does not reuse source data');
  assert(!js.includes('meaning_vi')&&!js.includes('clue_en'),'Translation field referenced in dictation runtime');
  assert(!js.includes('mastered'),'Dictation runtime must not synthesize mastery');
  assert(index.includes('<script src="assets/dictation-listen-write.js"></script>'),'Dictation JS not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/dictation-listen-write.css">'),'Dictation CSS not loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/dictation-listen-write-contract.v1.json','utf8'));
  const sound=JSON.parse(fs.readFileSync('subjects/russian/data/cyrillic-sound-map.json','utf8'));
  const reading=JSON.parse(fs.readFileSync('subjects/russian/data/reading-bridge.json','utf8'));
  validateContract(c);validateSources(sound,reading);
  validateRuntime(fs.readFileSync('subjects/russian/assets/dictation-listen-write.js','utf8'),fs.readFileSync('subjects/russian/index.html','utf8'));
  return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_DICTATION_GATE=PASS');
  console.log(JSON.stringify({letters:33,words:16,shortTexts:8,revealAfterAttempts:2,translationAnswers:false},null,2));
}
