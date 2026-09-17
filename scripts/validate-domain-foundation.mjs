import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const domainPath=path.join(ROOT,'subjects/shared/domain/domain-model.js');
const migrationsPath=path.join(ROOT,'subjects/shared/domain/migrations.js');
const contractPath=path.join(ROOT,'subjects/shared/domain/domain-contract-v1.json');
const read=file=>fs.readFileSync(file,'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=JSON.parse(read(contractPath));
assert(contract.schema==='BAUMAN_DOMAIN_CONTRACT_V1','Unexpected domain contract schema');
assert(contract.schemaVersion===1,'Unexpected domain contract version');
for(const type of ['source','knowledge','competency','task','evidence','artifact','research'])assert(contract.entityTypes[type],`Missing entity type contract: ${type}`);
for(const key of ['canonicalId','entityEnvelope','provenanceContract','evidenceContract','artifactContract','extensionsContract','migrationContract','aiContract','interoperability'])assert(contract[key],`Missing load-bearing contract: ${key}`);
assert(contract.evidenceContract.masterySeparated===true,'Evidence/mastery separation must be explicit');
assert(contract.migrationContract.mode==='additive-pure','Migration contract must be additive-pure');
assert(contract.interoperability.strategy==='adapter-first','Interoperability must be adapter-first');

const sourceCode=read(domainPath);
const migrationCode=read(migrationsPath);
for(const forbidden of ['Math.random','crypto.randomUUID','Date.now()'])assert(!sourceCode.includes(forbidden),`Canonical identity runtime must not use ${forbidden}`);
assert(!sourceCode.includes('.toLowerCase()'),'Canonical IDs must not silently normalize user-provided components');
assert(!migrationCode.includes('Math.random'),'Migrations must be deterministic');
assert(!migrationCode.includes('Date.now()'),'Migrations must not synthesize identity/time from runtime clock');

const context={console};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(sourceCode,context,{filename:'domain-model.js'});
vm.runInContext(migrationCode,context,{filename:'migrations.js'});
const D=context.BaumanDomainModel;
const M=context.BaumanDomainMigrations;
assert(D&&M,'Domain runtimes did not export globals');
assert(D.schema==='BAUMAN_DOMAIN_ENTITY_V1','Unexpected entity schema');
assert(D.schemaVersion===1,'Unexpected entity schema version');
assert(M.mode==='additive-pure','Unexpected migration mode');

const ids={
  source:D.makeId('source','russian','lesson-001-ppt'),
  knowledge:D.makeId('knowledge','russian','noun-gender'),
  competency:D.makeId('competency','russian','classify-noun-gender'),
  task:D.makeId('task','russian','noun-gender-sort-001'),
  evidence:D.makeId('evidence','russian','noun-gender-sort-attempt-001'),
  artifact:D.makeId('artifact','research','note-001'),
  research:D.makeId('research','research','hypothesis-001')
};
for(const [type,id] of Object.entries(ids))assert(D.parseId(id)?.entityType===type,`Canonical ID parse failed for ${type}`);
assert(D.parseId('bauman:knowledge:Russian:Noun Gender')===null,'Uppercase/display labels must not be accepted as canonical identity');
assert(D.parseId('R01')===null,'Legacy local ID must not masquerade as canonical identity');

const source=D.createEntity({id:ids.source,entityType:'source',namespace:'russian',title:'Lesson 1 PPT',source:{kind:'pptx',locator:'drive:lesson-001'}});
const knowledge=D.createEntity({id:ids.knowledge,entityType:'knowledge',namespace:'russian',title:'Russian noun gender',knowledge:{kind:'grammar_concept'},provenance:[D.provenance(ids.source,'derived_from','slide:120')]});
const competency=D.createEntity({id:ids.competency,entityType:'competency',namespace:'russian',title:'Classify Russian noun gender',competency:{statement:'Classify a familiar Russian noun as masculine, feminine or neuter.'},refs:[D.ref(ids.knowledge,'requires')]});
const task=D.createEntity({id:ids.task,entityType:'task',namespace:'russian',title:'Noun gender sort',task:{kind:'classification',evidencePolicy:{records:['first_attempt','correction']}},refs:[D.ref(ids.competency,'targets')]});
const evidence=D.createEntity({id:ids.evidence,entityType:'evidence',namespace:'russian',title:'Noun gender attempt',evidence:{kind:'classification_attempt',taskRef:ids.task,observation:{correct:27,total:30}},refs:[D.ref(ids.competency,'evidences')]});
const artifact=D.createEntity({id:ids.artifact,entityType:'artifact',namespace:'research',title:'Research note',artifact:{kind:'note',lineage:[ids.source]}});
const research=D.createEntity({id:ids.research,entityType:'research',namespace:'research',title:'Hypothesis 001',research:{kind:'hypothesis'},refs:[D.ref(ids.artifact,'derived_from')]});
for(const entity of [source,knowledge,competency,task,evidence,artifact,research])assert(D.validateEntity(entity).ok,`Valid ${entity.entityType} entity rejected`);

const badTask=JSON.parse(JSON.stringify(task));badTask.task.mastery=1;
assert(!D.validateEntity(badTask).ok,'Task must not be allowed to write mastery');
const badEvidence=JSON.parse(JSON.stringify(evidence));badEvidence.evidence.mastered=true;
assert(!D.validateEntity(badEvidence).ok,'Evidence must not be allowed to set mastered');
const badProvenance=JSON.parse(JSON.stringify(knowledge));badProvenance.provenance=[{sourceId:ids.knowledge,relation:'derived_from'}];
assert(!D.validateEntity(badProvenance).ok,'Provenance must point to source entities');
const badResearch=JSON.parse(JSON.stringify(research));badResearch.research.kind='future_unknown_kind';
assert(!D.validateEntity(badResearch).ok,'Unknown research kind must be rejected in V1');

const revised=JSON.parse(JSON.stringify(knowledge));revised.revision=2;revised.title='Russian noun gender — revised title';
assert(D.assertImmutableIdentity(knowledge,revised)===true,'Stable identity check failed');
const moved=JSON.parse(JSON.stringify(revised));moved.id=D.makeId('knowledge','foundation','noun-gender');moved.namespace='foundation';
let immutableRejected=false;try{D.assertImmutableIdentity(knowledge,moved)}catch{immutableRejected=true}assert(immutableRejected,'Identity mutation must be rejected');

const legacy=D.legacyMapping({entityType:'knowledge',namespace:'russian',legacyId:'R01',canonicalLocalId:'lesson-r01',sourceSchema:'russian-lessons-v1'});
assert(legacy.legacyId==='R01'&&legacy.canonicalId==='bauman:knowledge:russian:lesson-r01','Legacy mapping must be explicit and deterministic');
const preserved=M.preserveLegacy(knowledge,{legacyId:'R01',sourceSchema:'russian-lessons-v1',payload:{id:'R01'}});
assert(preserved!==knowledge,'Legacy preservation must return a new object');
assert(!knowledge.extensions.legacy,'Legacy preservation mutated input');
assert(preserved.extensions.legacy.legacyId==='R01','Legacy payload was not preserved');
const migrated=M.migrateEntity(knowledge,1);
assert(migrated!==knowledge,'No-op migration must still clone input');
assert(JSON.stringify(migrated)===JSON.stringify(knowledge),'No-op migration changed V1 entity');

console.log('BAUMAN_DOMAIN_FOUNDATION_RUNTIME_GATE=PASS');
console.log('Checks: explicit stable canonical IDs, seven domain entity types, provenance, immutable identity, task/evidence/mastery separation, artifact lineage, research future-compatibility, additive pure migration and explicit legacy mapping.');
