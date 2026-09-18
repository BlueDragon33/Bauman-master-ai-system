import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_CYRILLIC_CURSIVE_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};
export function validateContract(c){
  assert(c?.schema==='RUSSIAN_CYRILLIC_CURSIVE_RECOGNITION_CONTRACT_V1','Unexpected cursive contract schema');
  assert(c.alphabet?.requiredLetterCount===33,'Cursive recognition requires 33 letters');
  assert(JSON.stringify(c.directions)===JSON.stringify(['print_to_cursive','cursive_to_print']),'Cursive recognition directions drifted');
  assert(c.representation?.renderBased===true&&c.representation?.unicodeMayMatchPrint===true,'Render-based cursive reality must be explicit');
  assert(c.representation?.browserVisualDifferenceGateRequired===true,'Browser visual difference gate must remain required');
  assert(Array.isArray(c.representation?.fontStack)&&c.representation.fontStack[0]==='Segoe Script','Primary handwriting font stack drifted');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Cursive drill may not own mastery');
  assert(c.semantics?.translationRequired===false,'Cursive recognition must not require translation');
  return true;
}
export function validateData(rows){
  const alphabet=(Array.isArray(rows)?rows:[]).filter(x=>(x?.mode||'')==='alphabet');
  assert(alphabet.length===33,`Expected 33 alphabet rows, found ${alphabet.length}`);
  const withCursive=alphabet.filter(x=>String(x?.cursive||x?.handwriting||x?.write||'').trim()).length;
  assert(withCursive===33,`Cursive field coverage ${withCursive}/33`);
  return true;
}
export function validateRuntime(js,css){
  assert(js.includes("section:'print'"),'Literacy section state missing');
  assert(js.includes("cursiveDirection:'print_to_cursive'"),'Default cursive direction missing');
  assert(js.includes("'cursive_to_print'"),'Cursive-to-print direction missing');
  assert(js.includes("data-cyr-section=\"cursive\""),'Cursive section control missing');
  assert(js.includes("ru-cyr-cursive"),'Cursive rendering class missing from runtime');
  assert(/font-family:'Segoe Script','Comic Sans MS',cursive/.test(css),'Cursive font stack missing from CSS');
  assert(js.includes('cursiveAttempts')&&js.includes('cursiveCorrect')&&js.includes('cursiveSeen'),'Separate cursive evidence missing');
  return true;
}
export function loadAndValidate(){
 const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-cursive-recognition-contract.v1.json','utf8'));
 validateContract(c);validateData(JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8')));
 validateRuntime(fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8'),fs.readFileSync('subjects/russian/assets/cyrillic-literacy.css','utf8'));
 return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){loadAndValidate();console.log('RUSSIAN_CYRILLIC_CURSIVE_GATE=PASS');console.log(JSON.stringify({letters:33,directions:2,renderBased:true,browserVisualGateStillRequired:true},null,2))}
