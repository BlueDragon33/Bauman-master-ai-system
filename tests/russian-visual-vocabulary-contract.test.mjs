import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,auditVocabulary} from '../scripts/validate-russian-visual-vocabulary-contract.mjs';

const original=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-contract.v1.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const vocab=JSON.parse(fs.readFileSync('subjects/russian/data/vocab.json','utf8'));
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);
const audit=auditVocabulary(vocab,core,adapter);
assert.equal(audit.total,8000);

{const x=copy();x.authority.authoritySwitch=true;assert.throws(()=>validateContract(x),/must not silently switch/)}
{const x=copy();x.missingSemanticEvidence.fallbackToVietnamese=true;assert.throws(()=>validateContract(x),/must fail closed/)}
{const x=copy();x.learnerFacingProhibitedAnswerFields=x.learnerFacingProhibitedAnswerFields.filter(v=>v!=='meaning_vi');assert.throws(()=>validateContract(x),/Prohibited translation field missing/)}
{const x=copy();x.semanticChannels.allowed=x.semanticChannels.allowed.filter(v=>v!=='scene');assert.throws(()=>validateContract(x),/Missing allowed direct semantic channel/)}
assert.throws(()=>auditVocabulary(vocab,core,adapter.replace("vocabMeaning(item){ return item?.meaning_ru","vocabMeaning(item){ return item?.vi || item?.meaning_ru")),/Adapter vocabulary meaning helper regained/);
assert.throws(()=>auditVocabulary(vocab,core.replace("pronunciation:'',image_emoji","pronunciation:'',clue_en:'English clue',image_emoji"),adapter),/New vocabulary skeleton must remain direct-semantic/);

console.log('RUSSIAN_VISUAL_VOCAB_CONTRACT_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:6},null,2));
