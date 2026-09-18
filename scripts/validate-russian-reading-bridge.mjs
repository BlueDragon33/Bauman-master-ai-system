import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error(`RUSSIAN_READING_BRIDGE_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};
const CYR=/[А-Яа-яЁё]/;

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_READING_BRIDGE_CONTRACT_V1','Unexpected reading bridge schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['letter_to_chunk','chunk_to_word','word_to_short_text']),'Reading bridge stage order drifted');
  assert(c.prerequisites?.cyrillicPrintRecognition===true&&c.prerequisites?.soundLetterMapping===true&&c.prerequisites?.visualVocabularyAuthority===true,'Reading prerequisites incomplete');
  assert(c.material?.translationFieldsForbidden===true,'Translation fields must be forbidden');
  assert(c.practice?.selfReadAttemptBeforeAudioCheck===true,'Audio check must follow self-reading attempt');
  assert(c.practice?.audioLanguage==='ru-RU','Reading audio must use ru-RU');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Reading bridge may not own mastery');
  return true;
}

export function validateData(data,c){
  assert(data?.schema==='RUSSIAN_READING_BRIDGE_DATA_V1','Unexpected reading data schema');
  const expected=c.material?.counts||{};
  assert(data.chunks?.length===expected.chunks,`Chunk count drifted: ${data.chunks?.length}`);
  assert(data.words?.length===expected.words,`Word count drifted: ${data.words?.length}`);
  assert(data.short_texts?.length===expected.short_texts,`Short text count drifted: ${data.short_texts?.length}`);
  const rows=[...(data.chunks||[]),...(data.words||[]),...(data.short_texts||[])];
  for(const row of rows){
    assert(row.id&&row.text&&CYR.test(row.text),`Invalid Russian reading row: ${row?.id||'unknown'}`);
    assert(Array.isArray(row.segments)&&row.segments.length>0,`Missing segmentation: ${row.id}`);
    for(const f of ['meaning_vi','vi','translation_vi','clue_en','en'])assert(!(f in row),`Translation field leaked into reading data: ${row.id}.${f}`);
  }
  return true;
}

export function validateRuntime(js,index){
  assert(js.includes("const STAGES=['letter_to_chunk','chunk_to_word','word_to_short_text']"),'Runtime reading stages missing');
  assert(js.includes("if(ev.attempts<1)return;"),'Audio check is not gated by self-reading attempt');
  assert(js.includes("u.lang='ru-RU'"),'Reading audio language is not ru-RU');
  assert(js.includes("data-reading-action=\"segments\""),'Segmentation reveal missing');
  assert(!js.includes('meaning_vi')&&!js.includes('clue_en'),'Translation field referenced in reading runtime');
  assert(!js.includes('mastered'),'Reading bridge must not synthesize mastery');
  assert(index.includes('<script src="assets/reading-bridge.js"></script>'),'Reading bridge JS not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/reading-bridge.css">'),'Reading bridge CSS not loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/reading-bridge-contract.v1.json','utf8'));
  const data=JSON.parse(fs.readFileSync('subjects/russian/data/reading-bridge.json','utf8'));
  validateContract(c);validateData(data,c);
  validateRuntime(fs.readFileSync('subjects/russian/assets/reading-bridge.js','utf8'),fs.readFileSync('subjects/russian/index.html','utf8'));
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_READING_BRIDGE_GATE=PASS');
  console.log(JSON.stringify({chunks:20,words:16,shortTexts:8,audioAfterAttempt:true,translationAnswers:false},null,2));
}
