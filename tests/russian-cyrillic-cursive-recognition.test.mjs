import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateData,validateRuntime} from '../scripts/validate-russian-cyrillic-cursive-recognition.mjs';
const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-cursive-recognition-contract.v1.json','utf8'));
const rows=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.css','utf8');
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);assert.equal(validateData(rows),true);assert.equal(validateRuntime(js,css),true);
{const x=copy();x.representation.browserVisualDifferenceGateRequired=false;assert.throws(()=>validateContract(x),/must remain required/)}
{const x=copy();x.evidence.masteryMutation=true;assert.throws(()=>validateContract(x),/may not own mastery/)}
assert.throws(()=>validateData(rows.filter((_,i)=>i!==5)),/Expected 33 alphabet rows/);
assert.throws(()=>validateRuntime(js,css.replace("font-family:'Segoe Script','Comic Sans MS',cursive","font-family:serif")),/font stack missing/);
console.log('RUSSIAN_CYRILLIC_CURSIVE_NEGATIVE_TEST=PASS');console.log(JSON.stringify({negativeCases:4},null,2));
