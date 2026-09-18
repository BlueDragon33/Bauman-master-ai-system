import assert from 'node:assert/strict';
import fs from 'node:fs';
import {classifyVisualVocabulary,summarizeVisualCoverage} from '../subjects/russian/lib/visual-vocabulary-coverage.mjs';
import {validateContract,validateClassifier} from '../scripts/validate-russian-visual-vocabulary-coverage.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-coverage-contract.v1.json','utf8'));
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);
assert.equal(validateClassifier(c),true);

const translationOnly=classifyVisualVocabulary({ru:'дом',meaning_vi:'nhà',en:'house'},c);
assert.equal(translationOnly.semantic_status,'missing_visual_semantics');

const summary=summarizeVisualCoverage([
  {ru:'книга',emoji:'📘'},
  {ru:'учиться',context_ru:'Я учусь в университете.'},
  {ru:'абстракция',meaning_vi:'trừu tượng'}
],c);
assert.deepEqual({ready:summary.ready,partial:summary.partial,missing:summary.missing},{ready:1,partial:1,missing:1});

{const x=copy();x.rules.syntheticEmojiFallbackIsNotSourceCoverage=false;assert.throws(()=>validateContract(x),/must not count/)}
{const x=copy();x.rules.runtimeAuthoritySwitch=true;assert.throws(()=>validateContract(x),/must not switch/)}

console.log('RUSSIAN_VISUAL_COVERAGE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
