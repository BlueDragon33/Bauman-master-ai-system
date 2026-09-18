import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-speaking-shadowing-ladder.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/speaking-shadowing-ladder-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/speaking-coach.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/speaking-coach.css','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,css,core),true);

{const x=copy();x.prerequisites.normalListensBeforeShadowing=1;assert.throws(()=>validateContract(x),/two normal listens/)}
{const x=copy();x.runtime.roleplayEvidenceRequiresRecording=false;assert.throws(()=>validateContract(x),/real recorder use/)}
assert.throws(()=>validateRuntime(js.replace("heardCount(c)>=2","heardCount(c)>=1"),css,core),/not two-listen gated/);
assert.throws(()=>validateRuntime(js.replace("if(mode==='roleplay')bump('roleplayAttempts'","if(mode==='roleplay')bump('freeAttempts'"),css,core),/not recorder-backed/);

console.log('RUSSIAN_SPEAKING_LADDER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
