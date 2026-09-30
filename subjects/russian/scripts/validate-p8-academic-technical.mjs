import fs from 'node:fs';
import assert from 'node:assert/strict';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const read=p=>fs.readFileSync(p,'utf8');

const technical=json('subjects/russian/data/technical-concepts.json');
const academic=json('subjects/russian/data/academic-functions.json');
const topology=json('subjects/russian/docs/p3/RUSSIAN_CANONICAL_OWNER_TOPOLOGY.json');
const provenance=json('subjects/russian/data/provenance.json');
const foundation=read('subjects/russian/docs/RUSSIAN_FOUNDATION_LOCK_RECORD.md');
const p7=read('subjects/russian/docs/p7/RUSSIAN_P7_PHASE_RECORD.md');

assert.equal(technical.schema,'RUSSIAN_TECHNICAL_CONCEPTS_V1');
assert.equal(academic.schema,'RUSSIAN_ACADEMIC_FUNCTIONS_V1');
assert.match(foundation,/FOUNDATION_LOCKED/);
assert.match(p7,/P7 STATE: PASS/);
assert.equal(provenance.policy,'FAIL_CLOSED');

const tcOwner=topology.targetOwners.find(x=>x.entityType==='TechnicalConcept');
const afOwner=topology.targetOwners.find(x=>x.entityType==='AcademicFunction');
assert.equal(tcOwner?.targetOwner,'subjects/russian/data/technical-concepts.json');
assert.equal(afOwner?.targetOwner,'subjects/russian/data/academic-functions.json');

const requiredDomains=['mathematics','cs','ai_ml','database','networks_os','control_automation','statistics','experiment_report'];
const byDomain=Object.groupBy(technical.concepts,x=>x.domain);
for(const domain of requiredDomains) assert((byDomain[domain]||[]).length>=3,'P8 domain under-covered: '+domain);

const ids=new Set(),targets=new Set();
for(const row of technical.concepts){
  assert(row.id&&!ids.has(row.id),'Duplicate technical concept id: '+row.id);ids.add(row.id);
  assert(/[А-Яа-яЁё]/.test(row.ru),'Technical concept must contain Russian orthography: '+row.id);
  assert(['VERIFIED','SOURCE_ASSERTED'].includes(row.authorityStatus),'Active P8 concept must be sourced: '+row.id);
  assert(Array.isArray(row.sourceRefs)&&row.sourceRefs.length,'Missing sourceRefs: '+row.id);
  if(row.authorityStatus==='VERIFIED') assert(row.sourceRefs.some(x=>/^GOST|^ГОСТ/i.test(x)),'VERIFIED requires normative source: '+row.id);
  assert(Array.isArray(row.targets)&&row.targets.length,'Missing R11-R21 target: '+row.id);
  row.targets.forEach(t=>{assert(/^R(1[1-9]|20|21)$/.test(t),'P8 target outside R11-R21: '+t);targets.add(t)});
}
for(const row of academic.functions){
  assert(row.id&&Array.isArray(row.patterns)&&row.patterns.length,'Malformed academic function');
  assert(/[А-Яа-яЁё]/.test(row.ruLabel),'Academic function needs Russian label: '+row.id);
  assert(Array.isArray(row.targets)&&row.targets.length,'Academic function missing lesson target: '+row.id);
  row.targets.forEach(t=>assert(/^R(1[1-9]|20|21)$/.test(t),'Academic function target outside R11-R21: '+t));
}
assert(academic.functions.length>=12,'Academic function coverage too shallow');
for(const t of ['R12','R14','R15','R16','R17','R18','R19','R20','R21']) assert(targets.has(t)||academic.functions.some(x=>x.targets.includes(t)),'Missing P8 academic/technical target '+t);

console.log('RUSSIAN_P8_ACADEMIC_TECHNICAL_GATE=PASS');
console.log(JSON.stringify({technicalConcepts:technical.concepts.length,academicFunctions:academic.functions.length,domains:Object.fromEntries(requiredDomains.map(d=>[d,(byDomain[d]||[]).length])),lessonTargets:[...targets].sort()},null,2));
