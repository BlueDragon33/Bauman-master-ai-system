import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const vocab=json('subjects/russian/data/vocab.json');
const provenance=json('subjects/russian/data/provenance.json');
const owners=json('subjects/russian/docs/p3/RUSSIAN_CONTENT_OWNER_REGISTRY.json');
const topology=json('subjects/russian/docs/p3/RUSSIAN_CANONICAL_OWNER_TOPOLOGY.json');
const contentContract=read('subjects/russian/assets/content-contract.js');
const foundation=read('subjects/russian/docs/RUSSIAN_FOUNDATION_LOCK_RECORD.md');

assert(Array.isArray(vocab),'vocab.json must remain the canonical lexical array');
assert(vocab.length>=8000,'P7 must preserve the 8,000-item lexical bank');
assert.equal(provenance.schema,'RUSSIAN_PROVENANCE_REGISTRY_V1');
assert.equal(provenance.policy,'FAIL_CLOSED');
assert(provenance.authorityLevels.includes('VERIFIED'));
assert(provenance.authorityLevels.includes('UNVERIFIED'));
assert.match(provenance.promotionRule,/Only VERIFIED/i);
assert.match(foundation,/FOUNDATION_LOCKED/);

const vocabOwner=owners.owners.find(x=>x.responsibility==='vocab');
assert.equal(vocabOwner?.canonicalOwner,'subjects/russian/data/vocab.json','P7 must not replace P3 vocab owner');
const provenanceOwner=topology.targetOwners.find(x=>x.entityType==='ProvenanceRecord');
assert.equal(provenanceOwner?.targetOwner,'subjects/russian/data/provenance.json','P7 must materialize the P3 planned provenance owner');
assert.match(contentContract,/Only explicit source marks are canonical; never infer stress from Latin transliteration/);
assert.match(contentContract,/stressSource:hasMarkedStress\?'source_mark':hasYo\?'orthographic_yo':'missing'/);

const acute=/\u0301/g;
const cyr=/[А-Яа-яЁё]/;
const termKeys=['ru','phrase_ru','front','word','term'];
const stressedKeys=['stressed_ru','stressed','accented_ru','accented'];
const first=(o,keys)=>{for(const k of keys){if(o?.[k]!==undefined&&o?.[k]!==null&&String(o[k]).trim())return String(o[k]).trim()}return ''};
const stripStress=s=>String(s||'').normalize('NFD').replace(acute,'').normalize('NFC');
let explicitStress=0, markedStress=0, yoCue=0, posCount=0, formsCount=0, malformedStress=0, falseVerified=0;
for(const row of vocab){
  const term=first(row,termKeys);
  assert(term && cyr.test(term),'Every vocab row must retain Russian orthography');
  const stressed=first(row,stressedKeys);
  if(stressed){
    explicitStress++;
    if(/\u0301/.test(stressed.normalize('NFD')))markedStress++;
    if(stripStress(stressed).toLowerCase()!==stripStress(term).toLowerCase())malformedStress++;
  } else if(/[Ёё]/.test(term)) yoCue++;
  if(String(row.part_of_speech||row.partOfSpeech||row.pos||row.word_type||'').trim())posCount++;
  if(row.forms||row.inflections||row.declension||row.conjugation)formsCount++;
  const status=String(row.linguisticStatus||row.verificationStatus||row.authorityStatus||'').toUpperCase();
  if(status==='VERIFIED'){
    const refs=Array.isArray(row.sourceRefs)?row.sourceRefs:[];
    if(!refs.length||!String(row.reviewer||'').trim()||!String(row.reviewedAt||'').trim())falseVerified++;
  }
}
assert.equal(malformedStress,0,'Explicit stressed form must preserve the canonical orthographic term');
assert.equal(falseVerified,0,'VERIFIED linguistic claims require sourceRefs + reviewer + reviewedAt');

const generated=provenance.datasets.find(x=>x.id==='generated-content');
assert.equal(generated?.status,'UNVERIFIED','Generated content must fail closed');
assert.match(generated?.rule||'',/never become canonical/i);

for(const d of provenance.datasets){
  assert(['VERIFIED','SOURCE_ASSERTED','PARTIAL','UNVERIFIED','REJECTED'].includes(d.status),'Unknown P7 confidence state: '+d.id);
}
for(const locked of ['mastery','srs','adaptive-planner','audio-runtime','recording','speech-recognition']){
  assert(provenance.immutableFoundationBoundaries.includes(locked),'Missing foundation boundary: '+locked);
}

console.log('RUSSIAN_P7_LINGUISTIC_AUTHORITY_GATE=PASS');
console.log(JSON.stringify({
  vocab:vocab.length,
  explicitStress,
  markedStress,
  yoCue,
  posCount,
  formsCount,
  falseVerified,
  rule:'No source -> no VERIFIED claim'
},null,2));
