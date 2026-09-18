import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDirectSemanticDescriptor} from '../subjects/russian/lib/direct-semantic-strategies.mjs';
import {validateContract,validateStrategyBehavior} from '../scripts/validate-russian-direct-semantic-strategies.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/direct-semantic-strategy-contract.v1.json','utf8'));
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);
assert.equal(validateStrategyBehavior(c),true);

const translationOnly=buildDirectSemanticDescriptor({ru:'дом',meaning_vi:'nhà',en:'house'},c);
assert.equal(translationOnly.status,'missing_direct_semantics');
assert.equal(translationOnly.source_fields.length,0);

const category=buildDirectSemanticDescriptor({ru:'яблоко',tags:['еда','фрукт'],emoji:'🍎'},c);
assert.equal(category.status,'ready');
assert(category.strategies.includes('category_examples'));
assert(category.strategies.includes('visual_scene'));

{const x=copy();x.authority.runtimeAuthoritySwitch=true;assert.throws(()=>validateContract(x),/must remain non-authoritative/)}
{const x=copy();x.invariants.noSyntheticMeaning=false;assert.throws(()=>validateContract(x),/fallback invariant missing/)}

console.log('RUSSIAN_DIRECT_SEMANTIC_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
