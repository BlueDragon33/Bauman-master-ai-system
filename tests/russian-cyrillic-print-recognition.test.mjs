import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateData,validateRuntime} from '../scripts/validate-russian-cyrillic-print-recognition.mjs';
const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-print-recognition-contract.v1.json','utf8'));
const rows=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);assert.equal(validateData(rows),true);assert.equal(validateRuntime(js,index),true);
{const x=copy();x.alphabet.requiredLetterCount=32;assert.throws(()=>validateContract(x),/exact 33-letter/)}
{const x=copy();x.evidence.masteryMutation=true;assert.throws(()=>validateContract(x),/may not own mastery/)}
assert.throws(()=>validateData(rows.filter((_,i)=>i!==0)),/Expected 33 alphabet rows/);
assert.throws(()=>validateRuntime(js,index.replace('<script src="assets/cyrillic-literacy.js"></script>','')),/runtime not loaded/);
console.log('RUSSIAN_CYRILLIC_PRINT_NEGATIVE_TEST=PASS');console.log(JSON.stringify({negativeCases:4},null,2));
