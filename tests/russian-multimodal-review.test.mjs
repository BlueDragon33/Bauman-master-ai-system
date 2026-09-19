import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime,validateBehavior} from '../scripts/validate-russian-multimodal-review.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/multimodal-review-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/multimodal-review.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const srs=fs.readFileSync('subjects/russian/assets/vocab-srs.js','utf8');
const state=fs.readFileSync('subjects/russian/assets/learning-state.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,index,srs,state),true);
assert.equal(validateBehavior(js),true);

{const x=copy();x.evidence.crossModalityInference=true;assert.throws(()=>validateContract(x),/isolation missing/)}
{const x=copy();x.invariants.noDueDateMutation=false;assert.throws(()=>validateContract(x),/mutation forbidden/)}
assert.throws(()=>validateRuntime(js+'\nconst dueAt=1;',index,srs,state),/authority token: dueAt/);
assert.throws(()=>validateRuntime(js+'\nvoid card.dueAt;',index,srs,state),/authority token: dueAt/);
assert.throws(()=>validateRuntime(js+'\naddReview("vocab:7","repair");',index,srs,state),/authority token: addReview/);
assert.throws(()=>validateRuntime(js,index,srs,state.replace('function addReview(id,reason,route,label,dueAt)','function addReviewLegacy(id,reason,route,label,dueAt)')),/Canonical Review Queue missing/);
assert.throws(()=>validateBehavior(js.replace("modalities:{...(card.modalities||{}),[modality]:ev}","modalities:{...(card.modalities||{}),audio:ev,recognition:ev}")),/Audio evidence leaked into recognition|Unexpected cross-modality synthesis occurred/);
assert.throws(()=>validateBehavior(js.replace("save();\n    render();","localStorage.setItem('bauman_russian_vocab_srs_v1','tampered');\n    save();\n    render();")),/mutated SRS scheduler\/due-date authority/);

console.log('RUSSIAN_MULTIMODAL_REVIEW_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8},null,2));
