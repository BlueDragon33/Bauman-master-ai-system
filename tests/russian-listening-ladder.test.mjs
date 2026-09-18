import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-listening-ladder.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/listening-ladder-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/listening-ladder.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,core,index),true);

{const x=copy();x.policy.minimumNormalPlaysBeforeSlow=1;assert.throws(()=>validateContract(x),/must require two/)}
{const x=copy();x.runtime.createSecondAudioPlayer=true;assert.throws(()=>validateContract(x),/must reuse core audio controls/)}
assert.throws(()=>validateRuntime(js.replace("ctx.heardCount>=2","ctx.heardCount>=1"),core,index),/not gated by two normal plays/);
assert.throws(()=>validateRuntime(js,core.replace("const slowReady=heardCount>=2;","const slowReady=heard;"),index),/readiness is not two-listen gated/);

console.log('RUSSIAN_LISTENING_LADDER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
