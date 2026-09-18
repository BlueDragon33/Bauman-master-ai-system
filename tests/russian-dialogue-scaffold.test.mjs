import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateHelper,loadHelper} from '../scripts/validate-russian-dialogue-scaffold.mjs';
const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/dialogue-scaffold-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/dialogue-scaffold.js','utf8');
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);
assert.equal(validateHelper(js),true);
const api=loadHelper(js);
const x=api.describe({context_title_vi:'Trong lớp',communicative_functions_vi:['hỏi bài']},{ru:'Повторите, пожалуйста.',meaning_vi:'Xin hãy nhắc lại.'},0,'all');
assert.equal(x.status,'missing_dialogue_context');
assert.equal(x.line_ru,'Повторите, пожалуйста.');
assert(!JSON.stringify(x).includes('Trong lớp'));
{const y=copy();y.missingContext.translationFallback=true;assert.throws(()=>validateContract(y),/must fail closed/)}
{const y=copy();y.practice.russianContextHiddenBeforeFirstListen=false;assert.throws(()=>validateContract(y),/Hear-before-see invariant weakened/)}
console.log('RUSSIAN_DIALOGUE_SCAFFOLD_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
