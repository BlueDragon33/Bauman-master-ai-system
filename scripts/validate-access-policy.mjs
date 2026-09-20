import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import access from '../foundation/content-registry/access-policy.js';

let registry=registryApi.emptyRegistry();
const append=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:access-source-001',canonicalEntityId:'bd:source:test:access-source-001',sourceType:'repository',title:'Access source',locator:{kind:'repository_relative',value:'subjects/test/access.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1};
append(source);
append({registryId:'bdr:access:test:public-001',scope:source.registryId,visibility:'public',recordVersion:1});
assert.equal(access.schema,'BAUMAN_ACCESS_POLICY_V1');
assert.equal(access.evaluateReadAccess(registry,source.registryId,{}).allowed,true);

let restricted=registryApi.appendRecord(registry,{registryId:'bdr:access:test:course-001',scope:source.registryId,visibility:'course',recordVersion:1});
assert.equal(access.effectiveVisibility(restricted,source.registryId).visibility,'course');
assert.equal(access.evaluateReadAccess(restricted,source.registryId,{}).allowed,false);
assert.equal(access.evaluateReadAccess(restricted,source.registryId,{course:true}).allowed,true);

const orphan={registryId:'bdr:source:test:orphan-001',canonicalEntityId:'bd:source:test:orphan-001',sourceType:'repository',title:'Orphan',locator:{kind:'repository_relative',value:'subjects/test/orphan.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1};
restricted=registryApi.appendRecord(restricted,orphan);
const fallback=access.effectiveVisibility(restricted,orphan.registryId);
assert.equal(fallback.visibility,'private');
assert.equal(fallback.defaulted,true);
assert.equal(access.evaluateReadAccess(restricted,orphan.registryId,{}).allowed,false);
assert.equal(access.evaluateReadAccess(restricted,orphan.registryId,{private:true}).allowed,true);

console.log('ACCESS_POLICY_GATE=PASS');
console.log(JSON.stringify({schema:access.schema,failClosedDefault:true,conflictResolution:'most_restrictive'},null,2));
