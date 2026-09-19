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

assert.equal(api.buildImageQuery({ru:'книга',meaning_ru:'печатное издание',meaning_vi:'sách'}),'книга');
const ranked=api.rankCommonsPages([
  {title:'File:Книга в библиотеке.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/book.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Book.jpg',extmetadata:{ImageDescription:{value:'Книга в библиотеке'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]},
  {title:'File:Автомобиль.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/car.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Car.jpg',extmetadata:{ImageDescription:{value:'Автомобиль на дороге'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]}
],{ru:'книга',meaning_ru:'печатное издание',tags:['библиотека']});
assert.equal(ranked.length,1);
assert.match(ranked[0].title,/Книга/);

{const x=copy();x.authority.authoritySwitch=false;assert.throws(()=>validateContract(x),/must explicitly switch/)}
{const x=copy();x.authority.masteryAuthorityUnchanged=false;assert.throws(()=>validateContract(x),/must not take SRS\/mastery/)}
{const x=copy();x.imageEnrichment.translationQueryForbidden=false;assert.throws(()=>validateContract(x),/Russian-semantic only/)}
{const x=copy();x.imageEnrichment.offlineLookup=true;assert.throws(()=>validateContract(x),/must not run offline/)}
{const x=copy();x.imageEnrichment.attributionRequired=false;assert.throws(()=>validateContract(x),/relevance\/attribution safeguards/)}

console.log('RUSSIAN_VISUAL_VOCAB_RUNTIME_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,rankingCases:2},null,2));
