'use strict';
(function(root,factory){
  const api=factory(()=>root.crypto);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanAssetIntegrity=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(cryptoProvider){
  const INTEGRITY_SCHEMA='BAUMAN_ASSET_INTEGRITY_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`ASSET_INTEGRITY_${code}`)};
  const HEX64=/^[0-9a-f]{64}$/;

  function cryptoApi(){
    const api=cryptoProvider();
    if(!api?.subtle||typeof api.subtle.digest!=='function')fail('WEBCRYPTO_UNAVAILABLE');
    return api;
  }
  function toBytes(value){
    if(typeof value==='string')return new TextEncoder().encode(value);
    if(value instanceof ArrayBuffer)return new Uint8Array(value.slice(0));
    if(ArrayBuffer.isView(value))return new Uint8Array(value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength));
    fail('UNSUPPORTED_INPUT');
  }
  function hex(buffer){return Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('');}
  function validateChecksumRecord(record){
    if(!record||typeof record!=='object'||Array.isArray(record))fail('INVALID_CHECKSUM_RECORD');
    if(clean(record.algorithm)!=='sha256')fail('UNSUPPORTED_ALGORITHM');
    if(!HEX64.test(clean(record.digest)))fail('INVALID_DIGEST');
    if(!Number.isInteger(record.byteLength)||record.byteLength<0)fail('INVALID_BYTE_LENGTH');
    if(record.recordVersion!==undefined&&(!Number.isInteger(record.recordVersion)||record.recordVersion<1))fail('INVALID_RECORD_VERSION');
    return clone(record);
  }
  async function sha256(value){
    const bytes=toBytes(value);
    const digest=await cryptoApi().subtle.digest('SHA-256',bytes);
    return Object.freeze({algorithm:'sha256',digest:hex(digest),byteLength:bytes.byteLength});
  }
  async function contentHashLocator(value){
    const result=await sha256(value);
    return Object.freeze({kind:'content_hash',value:`sha256:${result.digest}`});
  }
  async function createChecksumRecord(registryId,value,recordVersion=1){
    const id=clean(registryId);
    if(!/^bdr:checksum:[a-z0-9][a-z0-9-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id))fail('INVALID_CHECKSUM_REGISTRY_ID');
    if(!Number.isInteger(recordVersion)||recordVersion<1)fail('INVALID_RECORD_VERSION');
    const result=await sha256(value);
    return Object.freeze({registryId:id,...result,recordVersion});
  }
  async function verify(value,checksumRecord){
    const expected=validateChecksumRecord(checksumRecord);
    const actual=await sha256(value);
    const digestMatch=actual.digest===expected.digest;
    const lengthMatch=actual.byteLength===expected.byteLength;
    const ok=digestMatch&&lengthMatch;
    let reason=null;
    if(!lengthMatch&&!digestMatch)reason='byte_length_and_digest_mismatch';
    else if(!lengthMatch)reason='byte_length_mismatch';
    else if(!digestMatch)reason='digest_mismatch';
    return Object.freeze({
      schema:INTEGRITY_SCHEMA,
      ok,
      state:ok?'verified':'quarantined',
      reason,
      expected:Object.freeze({algorithm:'sha256',digest:expected.digest,byteLength:expected.byteLength}),
      actual
    });
  }
  async function verifyAsset(value,assetRecord,checksumRecord){
    if(!assetRecord||typeof assetRecord!=='object'||Array.isArray(assetRecord))fail('INVALID_ASSET_RECORD');
    const assetId=clean(assetRecord.registryId),checksumId=clean(assetRecord.checksumId);
    if(!/^bdr:asset:/.test(assetId))fail('INVALID_ASSET_REGISTRY_ID');
    if(!checksumId||checksumId!==clean(checksumRecord?.registryId))fail('CHECKSUM_REFERENCE_MISMATCH');
    const result=await verify(value,checksumRecord);
    return Object.freeze({...result,assetId,checksumId});
  }
  function successorState(assetRecord,verification,newRegistryId){
    if(!assetRecord||typeof assetRecord!=='object'||Array.isArray(assetRecord))fail('INVALID_ASSET_RECORD');
    if(!verification||verification.schema!==INTEGRITY_SCHEMA)fail('INVALID_VERIFICATION_RESULT');
    const priorId=clean(assetRecord.registryId),nextId=clean(newRegistryId);
    if(!priorId||!nextId||priorId===nextId)fail('INVALID_SUCCESSOR_ID');
    if(!/^bdr:asset:[a-z0-9][a-z0-9-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(nextId))fail('INVALID_SUCCESSOR_ID');
    const next=clone(assetRecord);
    next.registryId=nextId;
    next.supersedesId=priorId;
    next.state=verification.ok?'verified':'quarantined';
    next.recordVersion=(Number.isInteger(assetRecord.recordVersion)?assetRecord.recordVersion:1)+1;
    return next;
  }
  return Object.freeze({
    schema:INTEGRITY_SCHEMA,
    toBytes,
    validateChecksumRecord,
    sha256,
    contentHashLocator,
    createChecksumRecord,
    verify,
    verifyAsset,
    successorState
  });
});
