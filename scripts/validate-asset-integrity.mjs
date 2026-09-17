import assert from 'node:assert/strict';
import integrity from '../foundation/content-registry/asset-integrity.js';

const ABC_SHA256='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const EMPTY_SHA256='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const abc=await integrity.sha256('abc');
assert.deepEqual(abc,{algorithm:'sha256',digest:ABC_SHA256,byteLength:3});
const empty=await integrity.sha256(new Uint8Array());
assert.deepEqual(empty,{algorithm:'sha256',digest:EMPTY_SHA256,byteLength:0});

const checksum=await integrity.createChecksumRecord('bdr:checksum:test:abc-001','abc');
assert.equal(checksum.digest,ABC_SHA256);
assert.equal(checksum.byteLength,3);
assert.equal(checksum.recordVersion,1);

const locator=await integrity.contentHashLocator('abc');
assert.deepEqual(locator,{kind:'content_hash',value:`sha256:${ABC_SHA256}`});

const verified=await integrity.verify('abc',checksum);
assert.equal(verified.ok,true);
assert.equal(verified.state,'verified');
assert.equal(verified.reason,null);

const corrupted=await integrity.verify('abd',checksum);
assert.equal(corrupted.ok,false);
assert.equal(corrupted.state,'quarantined');
assert.equal(corrupted.reason,'digest_mismatch');

const truncated=await integrity.verify('ab',checksum);
assert.equal(truncated.ok,false);
assert.equal(truncated.state,'quarantined');
assert.equal(truncated.reason,'byte_length_and_digest_mismatch');

const asset={registryId:'bdr:asset:test:abc-001',canonicalEntityId:'bd:artifact:test:abc-001',assetType:'document',mediaType:'text/plain',checksumId:checksum.registryId,locators:[locator],state:'staged',recordVersion:1};
const assetVerification=await integrity.verifyAsset('abc',asset,checksum);
assert.equal(assetVerification.ok,true);
assert.equal(assetVerification.assetId,asset.registryId);

const successor=integrity.successorState(asset,assetVerification,'bdr:asset:test:abc-002');
assert.equal(successor.state,'verified');
assert.equal(successor.supersedesId,asset.registryId);
assert.equal(successor.recordVersion,2);
assert.equal(asset.state,'staged','successor planning must not mutate original asset');

console.log('ASSET_INTEGRITY_GATE=PASS');
console.log(JSON.stringify({schema:integrity.schema,knownVectors:2,verifiedState:verified.state,corruptState:corrupted.state,successorVersion:successor.recordVersion},null,2));
