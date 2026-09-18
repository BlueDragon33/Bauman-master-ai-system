import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=message=>{throw new Error(`RUSSIAN_CYRILLIC_PRINT_GATE=FAIL\n${message}`)};
const assert=(v,m)=>{if(!v)fail(m)};
const ORDER='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_CYRILLIC_PRINT_RECOGNITION_CONTRACT_V1','Unexpected print recognition schema');
  assert(c.alphabet?.requiredLetterCount===33&&c.alphabet?.order===ORDER,'Cyrillic alphabet contract must contain exact 33-letter order');
  assert(Array.isArray(c.modes)&&c.modes.length===3,'Print recognition must expose three modes');
  assert(c.evidence?.masteryMutation===false&&c.evidence?.learnerStateAuthority===false,'Print drill may not own mastery');
  assert(c.semantics?.translationRequired===false,'Letter recognition must not require translation');
  return true;
}
export function validateData(rows){
  const alphabet=(Array.isArray(rows)?rows:[]).filter(x=>(x?.mode||'')==='alphabet');
  assert(alphabet.length===33,`Expected 33 alphabet rows, found ${alphabet.length}`);
  const letters=alphabet.map(x=>(String(x.print||x.text||x.letter||'').match(/[А-ЯЁ]/)||[])[0]).join('');
  assert(letters===ORDER,`Alphabet order/content drifted: ${letters}`);
  return true;
}
export function validateRuntime(js,index){
  assert(js.includes("const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'"),'Runtime exact alphabet constant missing');
  assert(js.includes("mode:'uppercase_to_lowercase'"),'Fresh print-recognition mode missing');
  assert(js.includes("'lowercase_to_uppercase'"),'Lowercase-to-uppercase mode missing');
  assert(js.includes("'confusable_discrimination'"),'Confusable discrimination mode missing');
  assert(js.includes("mastered")===false,'Runtime must not contain mastery promotion');
  assert(index.includes('<script src="assets/cyrillic-literacy.js"></script>'),'Cyrillic literacy runtime not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/cyrillic-literacy.css">'),'Cyrillic literacy CSS not loaded');
  return true;
}
export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-print-recognition-contract.v1.json','utf8'));
  validateContract(c);
  validateData(JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8')));
  validateRuntime(fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8'),fs.readFileSync('subjects/russian/index.html','utf8'));
  return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();console.log('RUSSIAN_CYRILLIC_PRINT_GATE=PASS');console.log(JSON.stringify({letters:33,modes:3,masteryAuthority:false},null,2));
}
