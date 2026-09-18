import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract} from '../scripts/validate-russian-learning-sequence-contract.mjs';

const original=JSON.parse(fs.readFileSync('subjects/russian/contracts/listen-speak-literacy-visual-contract.v1.json','utf8'));
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);

{
  const x=copy();x.vocabulary.learnerFacingVietnameseTranslation=true;
  assert.throws(()=>validateContract(x),/Vietnamese vocabulary meaning/);
}
{
  const x=copy();x.vocabulary.translationFallbackForMissingVisual=true;
  assert.throws(()=>validateContract(x),/must not fall back/);
}
{
  const x=copy();x.alphabet.requiredLetterCount=32;
  assert.throws(()=>validateContract(x),/must be 33/);
}
{
  const x=copy();x.priorities.grammar=0.05;x.priorities.listening-=0.03;
  assert.throws(()=>validateContract(x),/grammar weight exceeds cap/);
}
{
  const x=copy();x.sequencing.speakingBeforeGrammarExplanation=false;
  assert.throws(()=>validateContract(x),/Speaking-before-grammar/);
}
{
  const x=copy();x.priorities.listening=0.05;x.priorities.visualVocabulary=0.31;
  assert.throws(()=>validateContract(x),/Listening must outrank vocabulary/);
}

console.log('RUSSIAN_LEARNING_CONTRACT_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:6},null,2));
