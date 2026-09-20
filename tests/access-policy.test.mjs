import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import access from '../foundation/content-registry/access-policy.js';

let registry=registryApi.emptyRegistry();
const put=record=>{registry=registryApi.appendRecord(registry,record);};
const makeSource=(id,title)=>({registryId:`bdr:source:test:${id}`,canonicalEntityId:`bd:source:test:${id}`,sourceType:'repository',title,locator:{kind:'repository_relative',value:`subjects/test/${id}.txt`},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1});
const a=makeSource('a-001','A'),b=makeSource('b-001','B'),c=makeSource('c-001','C'),d=makeSource('d-001','D');
[a,b,c,d].forEach(put);
put({registryId:'bdr:access:test:a-org',scope:a.registryId,visibility:'organization',recordVersion:1});
put({registryId:'bdr:access:test:b-public',scope:b.registryId,visibility:'public',recordVersion:1});
put({registryId:'bdr:access:test:c-public',scope:c.registryId,visibility:'public',recordVersion:1});
put({registryId:'bdr:access:test:c-private',scope:c.registryId,visibility:'private',recordVersion:1});

assert.equal(access.evaluateReadAccess(registry,a.registryId,{}).allowed,false);
assert.equal(access.evaluateReadAccess(registry,a.registryId,{organization:true}).allowed,true);
assert.equal(access.evaluateReadAccess(registry,b.registryId,{}).allowed,true);
assert.equal(access.effectiveVisibility(registry,c.registryId).visibility,'private');
assert.equal(access.evaluateReadAccess(registry,c.registryId,{}).allowed,false);
assert.equal(access.evaluateReadAccess(registry,d.registryId,{}).visibility,'private');
assert.equal(access.evaluateReadAccess(registry,d.registryId,{}).defaulted,true);
assert.deepEqual(access.filterReadable(registry,[d.registryId,b.registryId,a.registryId,b.registryId],{organization:true}),[a.registryId,b.registryId].sort());
assert.throws(()=>access.effectiveVisibility(registry,'bdr:source:test:missing'),/TARGET_MISSING/);
assert.throws(()=>access.filterReadable(registry,'not-an-array',{}),/REGISTRY_IDS_REQUIRED/);

const before=JSON.stringify(registry);
access.evaluateReadAccess(registry,a.registryId,{organization:true});
access.policiesForScope(registry,c.registryId);
assert.equal(JSON.stringify(registry),before,'access evaluation must be read-only');

console.log('ACCESS_POLICY_TEST=PASS');
console.log(JSON.stringify({negativeCases:2,readOnly:true,duplicateFiltering:true,failClosed:true},null,2));
