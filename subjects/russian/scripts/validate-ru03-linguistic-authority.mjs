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
const authorityRuntime=fs.readFileSync('subjects/russian/assets/assessment-authority.js','utf8');
const learnerCore=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const learnerIndex=fs.readFileSync('subjects/russian/index.html','utf8');
for(const token of ['RUSSIAN_ASSESSMENT_AUTHORITY_V1','missing-verified-answer-key-authority','provenance-unavailable']) assert(authorityRuntime.includes(token),'RU03 assessment fail-closed runtime missing '+token);
assert(learnerCore.includes("mode:'practice-unscored-unverified'"),'RU03/RU04 exam must fail closed when answer-key authority is not verified');
assert(learnerCore.includes('UNVERIFIED_ANSWER_KEY_NOT_EVALUATED'),'RU03 must not derive correct/incorrect from unverified keys');
assert(learnerCore.includes('KHÔNG CHẤM ĐIỂM'),'learner UI must not present unverified answer keys as scores');
assert(learnerCore.includes('authoritativeGateRecords'),'legacy unverified gate passes must not count as official evidence');
assert(learnerCore.includes('state.reviewProgress.diagnostic'),'unverified answer keys must remain diagnostic in review');
assert(learnerIndex.includes('assets/assessment-authority.js'),'assessment authority runtime must load before learner judgment');
assert(fs.existsSync('tests/russian-ru03-assessment-authority-browser.mjs'),'RU03 authority browser regression missing');
console.log(JSON.stringify({ok:true,technicalConcepts:concepts.length,issues:queue.issues.length,blockers:queue.blockers.length}));
