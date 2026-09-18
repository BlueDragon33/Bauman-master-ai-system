import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateData,validateRuntime} from '../scripts/validate-russian-reading-bridge.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/reading-bridge-contract.v1.json','utf8'));
const data=JSON.parse(fs.readFileSync('subjects/russian/data/reading-bridge.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/reading-bridge.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateData(data,c),true);
assert.equal(validateRuntime(js,index),true);

{const x=copy();x.practice.selfReadAttemptBeforeAudioCheck=false;assert.throws(()=>validateContract(x),/must follow self-reading attempt/)}
{const x=structuredClone(data);x.words[0].meaning_vi='mẹ';assert.throws(()=>validateData(x,c),/Translation field leaked/)}
{const x=structuredClone(data);x.short_texts.pop();assert.throws(()=>validateData(x,c),/Short text count drifted/)}
assert.throws(()=>validateRuntime(js.replace("if(ev.attempts<1)return;",""),index),/not gated by self-reading attempt/);

console.log('RUSSIAN_READING_BRIDGE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
