import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateHelper,validateCore,validateGuard,validateIndex} from '../scripts/validate-russian-ai-direct-explanation.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/ai-direct-explanation-contract.v1.json','utf8'));
const helper=fs.readFileSync('subjects/russian/assets/ai-direct-explanation.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const guard=fs.readFileSync('subjects/russian/assets/ai-mentor-guard.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateHelper(helper),true);
assert.equal(validateCore(core),true);
assert.equal(validateGuard(guard),true);
assert.equal(validateIndex(index),true);

{const x=copy();x.semanticAuthority.translationSemanticAuthority=true;assert.throws(()=>validateContract(x),/Translation bridge regained/)}
{const x=copy();x.explanationOrder=['russian_definition','visual_or_scene','russian_context','contrast_or_analogy','optional_meta_help'];assert.throws(()=>validateContract(x),/order drifted/)}
{const x=copy();x.authority.aiMayModifyReviewQueue=true;assert.throws(()=>validateContract(x),/mutation authority forbidden/)}
assert.throws(()=>validateHelper(helper+"\nconst meaningVi='x';"),/prohibited translation field/);
assert.throws(()=>validateCore(core.replace('RussianAIDirectExplanation','LegacyTranslator')),/does not delegate/);
assert.throws(()=>validateGuard(guard.replace('translationSemanticAuthority:false','translationSemanticAuthority:true')),/still permits translation semantic authority/);
assert.throws(()=>validateGuard(guard.replace('RussianVocabSrs?.get','RussianVocabSRS?.context')),/real read-only vocab SRS API|Legacy\/nonexistent/);
assert.throws(()=>validateIndex(index.replace('<script src="assets/ai-direct-explanation.js"></script>','').replace('<script src="assets/core.js"></script>','<script src="assets/core.js"></script>\n<script src="assets/ai-direct-explanation.js"></script>')),/must load before core/);

console.log('RUSSIAN_AI_DIRECT_EXPLANATION_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8},null,2));
