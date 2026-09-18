import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateSources,validateRuntime} from '../scripts/validate-russian-dictation-listen-write.mjs';
const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/dictation-listen-write-contract.v1.json','utf8'));
const sound=JSON.parse(fs.readFileSync('subjects/russian/data/cyrillic-sound-map.json','utf8'));
const reading=JSON.parse(fs.readFileSync('subjects/russian/data/reading-bridge.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/dictation-listen-write.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateSources(sound,reading),true);
assert.equal(validateRuntime(js,index),true);
{const x=copy();x.practice.revealAfterAttempts=1;assert.throws(()=>validateContract(x),/reveal policy weakened/)}
{const x=copy();x.sources.syntheticPromptData=true;assert.throws(()=>validateContract(x),/must be source-backed/)}
assert.throws(()=>validateSources({...sound,entries:sound.entries.slice(0,32)},reading),/Expected 33 letters/);
assert.throws(()=>validateRuntime(js.replace("if(ev.attempts<2)return;",""),index),/not gated by two attempts/);

console.log('RUSSIAN_DICTATION_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
