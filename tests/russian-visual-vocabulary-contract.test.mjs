import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,auditVocabulary} from '../scripts/validate-russian-visual-vocabulary-contract.mjs';

const original=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-contract.v1.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const vocab=JSON.parse(fs.readFileSync('subjects/russian/data/vocab.json','utf8'));
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);
const audit=auditVocabulary(vocab,core);
assert.equal(audit.total,8000);

{const x=copy();x.authority.authoritySwitch=true;assert.throws(()=>validateContract(x),/must not silently switch/)}
{const x=copy();x.missingSemanticEvidence.fallbackToVietnamese=true;assert.throws(()=>validateContract(x),/must fail closed/)}
{const x=copy();x.learnerFacingProhibitedAnswerFields=x.learnerFacingProhibitedAnswerFields.filter(v=>v!=='meaning_vi');assert.throws(()=>validateContract(x),/Prohibited translation field missing/)}
{const x=copy();x.semanticChannels.allowed=x.semanticChannels.allowed.filter(v=>v!=='scene');assert.throws(()=>validateContract(x),/Missing allowed direct semantic channel/)}

console.log('RUSSIAN_VISUAL_VOCAB_CONTRACT_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
