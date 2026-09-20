'use strict';
(function(root,factory){
  let snapshotApi=null,integrityApi=null;
  if(typeof module==='object'&&module.exports){
    snapshotApi=require('./registry-snapshot.js');
    integrityApi=require('./asset-integrity.js');
    module.exports=factory(()=>snapshotApi,()=>integrityApi);
  }else{
    root.BaumanRegistrySnapshotIntegrity=factory(()=>root.BaumanRegistrySnapshot,()=>root.BaumanAssetIntegrity);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(snapshotProvider,integrityProvider){
  const SCHEMA='BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_INTEGRITY_V1';
  const VERSION=1;
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`REGISTRY_SNAPSHOT_INTEGRITY_${code}`)};

  function snapshot(){
    const api=snapshotProvider();
    if(!api||typeof api.parseSnapshot!=='function'||typeof api.serializeSnapshot!=='function'||typeof api.exportSnapshot!=='function')fail('SNAPSHOT_RUNTIME_MISSING');
    return api;
  }
  function integrity(){
    const api=integrityProvider();
    if(!api||typeof api.sha256!=='function'||typeof api.verify!=='function'||typeof api.validateChecksumRecord!=='function')fail('INTEGRITY_RUNTIME_MISSING');
    return api;
  }
  function normalizeInstant(value){
    const raw=clean(value),parsed=new Date(raw);
    if(!raw||!raw.endsWith('Z')||Number.isNaN(parsed.getTime())||parsed.toISOString()!==raw)fail('INVALID_SEALED_AT');
    return raw;
  }
  function canonicalSnapshot(input){
    const api=snapshot();
    if(typeof input==='string'){
      const registry=api.parseSnapshot(input);
      return {registry,serialized:api.serializeSnapshot(registry)};
    }
    if(input&&typeof input==='object'&&input.schema===api.schema){
      const registry=api.parseSnapshot(input);
      return {registry,serialized:api.serializeSnapshot(registry)};
    }
    const serialized=api.serializeSnapshot(input);
    return {registry:api.importSnapshot(serialized),serialized};
  }
  async function seal(input,sealedAt){
    const api=snapshot(),canonical=canonicalSnapshot(input),exported=api.exportSnapshot(canonical.registry);
    const checksum=await integrity().sha256(canonical.serialized);
    return Object.freeze({
      schema:SCHEMA,
      envelopeVersion:VERSION,
      snapshotSchema:api.schema,
      registrySchema:exported.registrySchema,
      registryVersion:exported.registryVersion,
      recordCount:exported.recordCount,
      sealedAt:normalizeInstant(sealedAt),
      checksum:Object.freeze({...checksum}),
      snapshot:canonical.serialized
    });
  }
  function parseEnvelope(input){
    if(typeof input==='string'){
      try{return JSON.parse(input)}catch{return null}
    }
    return clone(input);
  }
  async function verifyEnvelope(input){
    const value=parseEnvelope(input);
    if(!value||typeof value!=='object'||Array.isArray(value))return {ok:false,reason:'not_object'};
    if(value.schema!==SCHEMA||value.envelopeVersion!==VERSION)return {ok:false,reason:'schema'};
    const api=snapshot();
    if(value.snapshotSchema!==api.schema)return {ok:false,reason:'snapshot_schema'};
    try{normalizeInstant(value.sealedAt)}catch(_){return {ok:false,reason:'sealed_at'};}
    if(typeof value.snapshot!=='string'||!value.snapshot)return {ok:false,reason:'snapshot_missing'};
    let registry;
    try{registry=api.importSnapshot(value.snapshot)}catch(error){return {ok:false,reason:'snapshot_invalid',error:clean(error?.message)};}
    const canonical=api.serializeSnapshot(registry);
    if(canonical!==value.snapshot)return {ok:false,reason:'snapshot_noncanonical'};
    const exported=api.exportSnapshot(registry);
    if(value.registrySchema!==exported.registrySchema||value.registryVersion!==exported.registryVersion||value.recordCount!==exported.recordCount)return {ok:false,reason:'metadata'};
    let checksum;
    try{checksum=integrity().validateChecksumRecord(value.checksum)}catch(_){return {ok:false,reason:'checksum_record'};}
    const result=await integrity().verify(value.snapshot,checksum);
    if(!result.ok)return {ok:false,reason:`checksum_${result.reason||'mismatch'}`,verification:clone(result)};
    return {ok:true,envelope:clone(value),registry:clone(registry),verification:clone(result)};
  }
  async function importVerified(input){
    const checked=await verifyEnvelope(input);
    if(!checked.ok)fail(`VERIFY_FAILED:${checked.reason}`);
    return clone(checked.registry);
  }
  function serializeEnvelope(value){
    const parsed=parseEnvelope(value);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))fail('INVALID_ENVELOPE');
    return snapshot().stableStringify(parsed);
  }
  return Object.freeze({
    schema:SCHEMA,
    version:VERSION,
    canonicalSnapshot,
    seal,
    verifyEnvelope,
    importVerified,
    serializeEnvelope
  });
});
