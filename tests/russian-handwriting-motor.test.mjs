import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-handwriting-motor.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/handwriting-motor-practice-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/handwriting-motor-coach.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,core,index),true);

{const x=copy();x.existingRuntime.createSecondCanvas=true;assert.throws(()=>validateContract(x),/must reuse the core canvas/)}
{const x=copy();x.evidence.masteryMutation=true;assert.throws(()=>validateContract(x),/may not own mastery/)}
assert.throws(()=>validateRuntime(js,core.replace('id="writingCanvas"','id="otherCanvas"'),index),/Existing writing canvas missing/);
assert.throws(()=>validateRuntime(js+'\n<canvas></canvas>',core,index),/must not create a second canvas/);

console.log('RUSSIAN_HANDWRITING_MOTOR_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
