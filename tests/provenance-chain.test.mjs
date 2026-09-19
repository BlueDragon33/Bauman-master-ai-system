import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import provenance from '../foundation/content-registry/provenance-chain.js';

let registry=registryApi.emptyRegistry();
const append=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:source-001',canonicalEntityId:'bd:source:test:source-001',sourceType:'repository',title:'Source',locator:{kind:'repository_relative',value:'subjects/test/source.txt'},capturedAt:'2026-09-17T00:00:00Z',recordVersion:1};
const checksumA={registryId:'bdr:checksum:test:a-001',algorithm:'sha256',digest:'a'.repeat(64),byteLength:10,recordVersion:1};
const checksumB={registryId:'bdr:checksum:test:b-001',algorithm:'sha256',digest:'b'.repeat(64),byteLength:10,recordVersion:1};
const assetA={registryId:'bdr:asset:test:a-001',canonicalEntityId:'bd:artifact:test:a-001',assetType:'document',mediaType:'text/plain',checksumId:checksumA.registryId,locators:[{kind:'repository_relative',value:'subjects/test/a.txt'}],state:'verified',recordVersion:1};
const assetB={registryId:'bdr:asset:test:b-001',canonicalEntityId:'bd:artifact:test:b-001',assetType:'document',mediaType:'text/plain',checksumId:checksumB.registryId,locators:[{kind:'repository_relative',value:'subjects/test/b.txt'}],state:'verified',recordVersion:1};
[source,checksumA,checksumB,assetA,assetB].forEach(append);

const eventA={registryId:'bdr:provenance:test:a-transform-001',eventType:'transformed',subjectId:assetA.registryId,sourceIds:[source.registryId],inputIds:[assetB.registryId],at:'2026-09-17T02:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
registry=provenance.appendEvent(registry,eventA);

const beforeCycle=JSON.stringify(registry);
const eventB={registryId:'bdr:provenance:test:b-transform-001',eventType:'transformed',subjectId:assetB.registryId,sourceIds:[source.registryId],inputIds:[assetA.registryId],at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(registry,eventB),/LINEAGE_CYCLE/);
assert.equal(JSON.stringify(registry),beforeCycle,'failed append must not mutate original registry');

const noInputs={registryId:'bdr:provenance:test:no-inputs-001',eventType:'transformed',subjectId:assetB.registryId,sourceIds:[source.registryId],at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(registry,noInputs),/TRANSFORM_INPUT_REQUIRED/);

const generatedNoLineage={registryId:'bdr:provenance:test:no-lineage-001',eventType:'generated',subjectId:assetB.registryId,sourceIds:[],at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(registry,generatedNoLineage),/GENERATED_LINEAGE_REQUIRED/);

const verifiedNoChecksum={registryId:'bdr:provenance:test:no-checksum-001',eventType:'verified',subjectId:assetB.registryId,sourceIds:[source.registryId],at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(registry,verifiedNoChecksum),/INVALID_REGISTRY_ID|VERIFICATION_CHECKSUM/);

const importA={registryId:'bdr:provenance:test:a-import-001',eventType:'imported',subjectId:assetA.registryId,sourceIds:[source.registryId],at:'2026-09-17T01:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
let subjectRegistry=registryApi.emptyRegistry();
const put=record=>{subjectRegistry=registryApi.appendRecord(subjectRegistry,record);};
[source,checksumA,checksumB,assetA,assetB].forEach(put);
subjectRegistry=provenance.appendEvent(subjectRegistry,importA);
const wrongSubjectPrev={registryId:'bdr:provenance:test:b-import-001',eventType:'imported',subjectId:assetB.registryId,sourceIds:[source.registryId],previousEventId:importA.registryId,at:'2026-09-17T02:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(subjectRegistry,wrongSubjectPrev),/PREVIOUS_PROVENANCE_SUBJECT_MISMATCH/);

const late={registryId:'bdr:provenance:test:b-late-001',eventType:'imported',subjectId:assetB.registryId,sourceIds:[source.registryId],at:'2026-09-17T04:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
subjectRegistry=provenance.appendEvent(subjectRegistry,late);
const earlierAfterLate={registryId:'bdr:provenance:test:b-earlier-001',eventType:'linked',subjectId:assetB.registryId,sourceIds:[source.registryId],previousEventId:late.registryId,at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
assert.throws(()=>provenance.appendEvent(subjectRegistry,earlierAfterLate),/PREVIOUS_EVENT_TIME_ORDER/);

const tampered=registryApi.normalizeRegistry(subjectRegistry);
tampered.records.provenance[importA.registryId].previousEventId=importA.registryId;
assert.throws(()=>provenance.assertPreviousChains(tampered),/PREVIOUS_EVENT_CYCLE/);

const badTime=registryApi.normalizeRegistry(subjectRegistry);
badTime.records.provenance[importA.registryId].at='not-a-date';
assert.throws(()=>provenance.assertProvenanceIntegrity(badTime),/INVALID_TIMESTAMP/);

console.log('PROVENANCE_CHAIN_TEST=PASS');
console.log(JSON.stringify({negativeCases:8,immutability:true,cycleDetection:true,timeOrdering:true},null,2));
