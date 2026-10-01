import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const prov=j('subjects/russian/data/provenance.json');
const tech=j('subjects/russian/data/technical-concepts.json');
const queue=j('subjects/russian/docs/ru03/RUSSIAN_RU03_CONTENT_ISSUE_QUEUE.json');
const fixtures=j('subjects/russian/docs/ru03/RUSSIAN_RU03_GOLDEN_LINGUISTIC_FIXTURES.json');
const truth=j('subjects/russian/docs/ru03/RU05_RU06_RU07_TRUTH_CONTRACT.json');
for(const s of ['VERIFIED','VERIFIED_WITH_VARIANTS','CONTEXT_DEPENDENT','DISPUTED','UNVERIFIED','INCORRECT']) assert(prov.ru03.validationResults.includes(s));
for(const id of ['technical-concepts','academic-functions','reading','performance-tasks','assessment-bank']) assert(prov.datasets.some(x=>x.id===id),'missing provenance dataset '+id);
const concepts=tech.concepts||[];
assert(concepts.length>0);
for(const c of concepts){
  assert(c.id&&c.ru&&c.authorityStatus,'technical concept missing authority metadata');
  if(c.authorityStatus==='VERIFIED'){
    assert(Array.isArray(c.sourceRefs)&&c.sourceRefs.length,'VERIFIED term missing sourceRefs: '+c.id);
    assert(c.sourceRefs.some(x=>!String(x).startsWith('repo:')),'VERIFIED term needs non-repo authority: '+c.id);
  }
}
assert.equal(queue.blockers.length,0,'RU03 blocker remains');
assert(fixtures.fixtures.some(x=>x.id==='accepted-variants'));
assert(fixtures.fixtures.some(x=>x.id==='sense-dependent'));
assert.equal(truth.state,'PASS');
console.log(JSON.stringify({ok:true,technicalConcepts:concepts.length,issues:queue.issues.length,blockers:queue.blockers.length}));
