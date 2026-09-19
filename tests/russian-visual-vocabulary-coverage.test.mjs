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
assert.deepEqual(
  {ready:summary.ready,partial:summary.partial,missing:summary.missing,concreteVisual:summary.concreteVisual,symbolicVisual:summary.symbolicVisual},
  {ready:1,partial:1,missing:1,concreteVisual:0,symbolicVisual:1}
);
const mixed=summarizeVisualCoverage([
  {ru:'книга',image_url:'assets/vocab/book.webp'},
  {ru:'дом',emoji:'🏠'},
  {ru:'идти',gesture:'жест движения'}
],c);
assert.deepEqual(
  {concreteVisual:mixed.concreteVisual,symbolicVisual:mixed.symbolicVisual,bySourceField:mixed.bySourceField},
  {concreteVisual:1,symbolicVisual:2,bySourceField:{image_url:1,emoji:1,gesture:1}}
);

{const x=copy();x.rules.syntheticEmojiFallbackIsNotSourceCoverage=false;assert.throws(()=>validateContract(x),/must not count/)}
{const x=copy();x.rules.runtimeAuthoritySwitch=true;assert.throws(()=>validateContract(x),/must not switch/)}

console.log('RUSSIAN_VISUAL_COVERAGE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4,diagnosticCases:2},null,2));
