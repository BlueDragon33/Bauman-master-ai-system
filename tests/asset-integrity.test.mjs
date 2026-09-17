import assert from 'node:assert/strict';
import integrity from '../foundation/content-registry/asset-integrity.js';

const ABC_SHA256='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const bytes=new Uint8Array([0,97,98,99,0]).subarray(1,4);
const bytesHash=await integrity.sha256(bytes);
assert.equal(bytesHash.digest,ABC_SHA256,'typed-array view hashing must respect byteOffset/byteLength');
assert.equal(bytesHash.byteLength,3);

const arrayBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
assert.equal((await integrity.sha256(arrayBuffer)).digest,ABC_SHA256,'ArrayBuffer hashing must be stable');

assert.throws(()=>integrity.toBytes({text:'abc'}),/UNSUPPORTED_INPUT/);
assert.throws(()=>integrity.validateChecksumRecord({algorithm:'md5',digest:'a'.repeat(64),byteLength:3}),/UNSUPPORTED_ALGORITHM/);
assert.throws(()=>integrity.validateChecksumRecord({algorithm:'sha256',digest:'A'.repeat(64),byteLength:3}),/INVALID_DIGEST/);
assert.throws(()=>integrity.validateChecksumRecord({algorithm:'sha256',digest:'a'.repeat(64),byteLength:-1}),/INVALID_BYTE_LENGTH/);
await assert.rejects(()=>integrity.createChecksumRecord('bdr:asset:test:wrong-type','abc'),/INVALID_CHECKSUM_REGISTRY_ID/);

const checksum=await integrity.createChecksumRecord('bdr:checksum:test:abc-001','abc');
const asset={registryId:'bdr:asset:test:abc-001',checksumId:'bdr:checksum:test:other',recordVersion:1,state:'staged'};
await assert.rejects(()=>integrity.verifyAsset('abc',asset,checksum),/CHECKSUM_REFERENCE_MISMATCH/);

const corrupt=await integrity.verify('xyz',checksum);
const quarantine=integrity.successorState(
  {registryId:'bdr:asset:test:abc-001',checksumId:checksum.registryId,recordVersion:1,state:'verified'},
  corrupt,
  'bdr:asset:test:abc-002'
);
assert.equal(quarantine.state,'quarantined');
assert.equal(quarantine.recordVersion,2);
assert.equal(quarantine.supersedesId,'bdr:asset:test:abc-001');
assert.throws(()=>integrity.successorState(asset,corrupt,asset.registryId),/INVALID_SUCCESSOR_ID/);

console.log('ASSET_INTEGRITY_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,typedArrayView:true,corruptionState:quarantine.state},null,2));
