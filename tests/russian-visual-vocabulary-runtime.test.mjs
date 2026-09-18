import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateHelper,loadRuntimeHelper} from '../scripts/validate-russian-visual-vocabulary-runtime.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-runtime-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/visual-vocabulary-runtime.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateHelper(js),true);

const api=loadRuntimeHelper(js);
const missing=api.describe({ru:'абстракция',meaning_vi:'trừu tượng',en:'abstraction'});
assert.equal(missing.semantic_status,'missing_visual_semantics');
assert.equal(missing.definition_ru,'');
assert.equal(missing.context_ru,'');

const direct=api.describe({ru:'яблоко',image_emoji:'🍎',meaning_ru:'фрукт',example_ru:'Я ем яблоко.',meaning_vi:'táo'});
assert.equal(direct.semantic_status,'ready');
assert.equal(direct.definition_ru,'фрукт');
assert(!JSON.stringify(direct).includes('táo'));

{const x=copy();x.authority.authoritySwitch=false;assert.throws(()=>validateContract(x),/must explicitly switch/)}
{const x=copy();x.authority.masteryAuthorityUnchanged=false;assert.throws(()=>validateContract(x),/must not take SRS\/mastery/)}

console.log('RUSSIAN_VISUAL_VOCAB_RUNTIME_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
