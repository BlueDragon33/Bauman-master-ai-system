import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const ORDER='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const fail=m=>{throw new Error(`RUSSIAN_CYRILLIC_SOUND_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_CYRILLIC_SOUND_LETTER_CONTRACT_V1','Unexpected sound-letter contract schema');
  assert(c.requiredLetterCount===33,'Sound-letter contract must require 33 letters');
  assert(JSON.stringify(c.modes)===JSON.stringify(['sound_to_letter','letter_to_sound']),'Sound-letter mode order drifted');
  assert(c.audio?.language==='ru-RU','Russian speech language must be ru-RU');
  assert(c.audio?.letterNameSpeech===true&&c.audio?.anchorWordSpeech===true,'Letter-name and anchor audio are required');
  assert(c.audio?.answerRequiresListenInSoundToLetter===true,'Sound-to-letter answers must require a listening event');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Sound-letter drill may not own mastery');
  return true;
}

export function validateData(data,contract){
  assert(data?.schema==='RUSSIAN_CYRILLIC_SOUND_MAP_V1','Unexpected sound-map schema');
  assert(data.language==='ru-RU','Sound-map language must be ru-RU');
  const rows=Array.isArray(data.entries)?data.entries:[];
  assert(rows.length===33,`Expected 33 sound rows, found ${rows.length}`);
  assert(rows.map(x=>x.letter).join('')===ORDER,'Sound-map alphabet order/content drifted');
  const prohibited=new Set(contract.data?.prohibitedSemanticFields||[]);
  rows.forEach((row,i)=>{
    for(const field of contract.data?.requiredFields||[])assert(row[field]!==undefined&&row[field]!==null,`Row ${i+1} missing ${field}`);
    for(const field of prohibited)assert(!(field in row),`Row ${i+1} contains prohibited semantic field ${field}`);
    assert(String(row.name_ru||'').trim(),'Russian letter name missing');
    assert(String(row.primary_ipa||'').trim(),'Primary IPA missing');
    assert(Array.isArray(row.variants)&&row.variants.length>0,'Phonology variants missing');
    assert(String(row.anchor?.display||'').trim()&&String(row.anchor?.speech||'').trim(),'Russian anchor missing');
  });
  const signs=rows.filter(x=>x.category==='sign');
  assert(signs.length===2&&signs.every(x=>x.primary_ipa==='∅'),'Ъ/Ь sign rows must use null-sound symbol');
  return true;
}

export function validateRuntime(js,index){
  assert(js.includes("section:'print'"),'Existing literacy section state missing');
  assert(js.includes("soundMode:'sound_to_letter'"),'Default sound-to-letter mode missing');
  assert(js.includes("soundHeard:{}"),'Sound heard evidence missing');
  assert(js.includes("soundAttempts:0")&&js.includes("soundCorrect:0"),'Sound attempt evidence missing');
  assert(js.includes("data-cyr-section=\"sound\""),'Sound section control missing');
  assert(js.includes("data-cyr-sound-action=\"letter-name\""),'Letter-name audio control missing');
  assert(js.includes("data-cyr-sound-action=\"anchor\""),'Anchor-word audio control missing');
  assert(js.includes("if(state.soundMode==='sound_to_letter'&&!soundWasHeard(row))return;"),'Sound-to-letter answer is not listen-gated');
  assert(js.includes("u.lang='ru-RU'"),'Speech synthesis language is not pinned to ru-RU');
  assert(index.includes('assets/cyrillic-literacy.js'),'Literacy runtime must remain loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-sound-letter-contract.v1.json','utf8'));
  const data=JSON.parse(fs.readFileSync('subjects/russian/data/cyrillic-sound-map.json','utf8'));
  validateContract(c);validateData(data,c);
  validateRuntime(fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8'),fs.readFileSync('subjects/russian/index.html','utf8'));
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_CYRILLIC_SOUND_GATE=PASS');
  console.log(JSON.stringify({letters:33,modes:2,translationSemanticFields:false,language:'ru-RU'},null,2));
}
