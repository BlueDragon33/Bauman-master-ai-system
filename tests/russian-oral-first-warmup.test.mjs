import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-oral-first-warmup.mjs';

const original=JSON.parse(fs.readFileSync('subjects/russian/contracts/oral-first-warmup-contract.v1.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(core),true);

{
 const x=copy();x.policy.russianTextHiddenBeforeFirstNormalListen=false;
 assert.throws(()=>validateContract(x),/policy disabled/);
}
{
 const x=copy();x.policy.slowListenDoesNotUnlockText=false;
 assert.throws(()=>validateContract(x),/policy disabled/);
}
{
 const x=copy();x.policy.normalListenEvidenceRequiresPlaybackCompletion=false;
 assert.throws(()=>validateContract(x),/policy disabled/);
}
{
 const x=copy();x.policy.failedPlaybackKeepsTextHidden=false;
 assert.throws(()=>validateContract(x),/policy disabled/);
}
assert.throws(
 ()=>validateRuntime(core.replace("const currentRu=heard?esc(targetText","const currentRu=esc(targetText")),
 /not gated by heard state/
);
assert.throws(
 ()=>validateRuntime(core.replace("const scaffoldUi=heard?dialogueScaffoldHtml(scaffold):'';","const scaffoldUi=dialogueScaffoldHtml(scaffold);")),
 /scaffold is not hidden/
);
assert.throws(
 ()=>validateRuntime(core.replace("onEnd:meta=>{if(inPracticeMode()){markPracticeLineHeard(d,idx);render()}","onStart:meta=>{if(inPracticeMode()){render()}")),
 /does not unlock text after playback completion/
);

console.log('RUSSIAN_ORAL_FIRST_WARMUP_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7},null,2));
