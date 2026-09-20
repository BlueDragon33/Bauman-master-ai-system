'use strict';
(function(root,factory){
  let snapshotApi=null;
  if(typeof module==='object'&&module.exports){
    snapshotApi=require('./registry-snapshot.js');
    module.exports=factory(()=>snapshotApi);
  }else{
    root.BaumanRegistrySnapshotStore=factory(()=>root.BaumanRegistrySnapshot);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(snapshotProvider){
  const SCHEMA='BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_STORE_V1';
  const VERSION=1;
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`REGISTRY_SNAPSHOT_STORE_${code}`)};
  function snapshot(){
    const api=snapshotProvider();
    if(!api||typeof api.serializeSnapshot!=='function'||typeof api.importSnapshot!=='function'||typeof api.stableStringify!=='function')fail('SNAPSHOT_RUNTIME_MISSING');
    return api;
  }
  function assertStorage(storage){
    if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')fail('INVALID_STORAGE_ADAPTER');
    return storage;
  }
  function normalizeConfig(value){
    const config=value&&typeof value==='object'?value:{};
    const storageKey=clean(config.storageKey),stagingKey=clean(config.stagingKey);
    if(!storageKey||!stagingKey)fail('STORAGE_KEYS_REQUIRED');
    if(storageKey===stagingKey)fail('STORAGE_KEYS_MUST_DIFFER');
    return Object.freeze({storageKey,stagingKey});
  }
  function normalizeCommittedAt(value){
    const raw=clean(value);
    const parsed=new Date(raw);
    if(!raw||!raw.endsWith('Z')||Number.isNaN(parsed.getTime())||parsed.toISOString()!==raw)fail('INVALID_COMMITTED_AT');
    return raw;
  }
  const stableStringify=value=>snapshot().stableStringify(value);
  function seal(registryValue,committedAt){
    const api=snapshot();
    const snapshotText=api.serializeSnapshot(registryValue);
    const exported=api.exportSnapshot(registryValue);
    return Object.freeze({
      schema:SCHEMA,
      storeVersion:VERSION,
      snapshotSchema:api.schema,
      registrySchema:exported.registrySchema,
      registryVersion:exported.registryVersion,
      recordCount:exported.recordCount,
      committedAt:normalizeCommittedAt(committedAt),
      snapshot:snapshotText
    });
  }
  function verifyEnvelope(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {ok:false,reason:'not_object'};
    if(value.schema!==SCHEMA||value.storeVersion!==VERSION)return {ok:false,reason:'schema'};
    const api=snapshot();
    if(value.snapshotSchema!==api.schema)return {ok:false,reason:'snapshot_schema'};
    try{normalizeCommittedAt(value.committedAt);}catch(_){return {ok:false,reason:'committed_at'};}
    if(typeof value.snapshot!=='string'||!value.snapshot)return {ok:false,reason:'snapshot_missing'};
    let registry;
    try{registry=api.importSnapshot(value.snapshot);}catch(error){return {ok:false,reason:'snapshot_invalid',error:clean(error?.message)};}
    const canonical=api.serializeSnapshot(registry);
    if(canonical!==value.snapshot)return {ok:false,reason:'snapshot_noncanonical'};
    const exported=api.exportSnapshot(registry);
    if(value.registrySchema!==exported.registrySchema||value.registryVersion!==exported.registryVersion||value.recordCount!==exported.recordCount)return {ok:false,reason:'metadata'};
    return {ok:true,envelope:clone(value),registry:clone(registry)};
  }
  function parseRaw(raw){
    if(raw===null||raw===undefined||raw==='')return {present:false,valid:false,envelope:null,registry:null,reason:'empty'};
    if(typeof raw!=='string')return {present:true,valid:false,envelope:null,registry:null,reason:'raw_type'};
    try{
      const checked=verifyEnvelope(JSON.parse(raw));
      return {present:true,valid:checked.ok,envelope:checked.envelope||null,registry:checked.registry||null,reason:checked.reason||null};
    }catch(_){
      return {present:true,valid:false,envelope:null,registry:null,reason:'json'};
    }
  }
  function read(storageValue,configValue){
    const storage=assertStorage(storageValue),config=normalizeConfig(configValue);
    const final=parseRaw(storage.getItem(config.storageKey));
    const staging=parseRaw(storage.getItem(config.stagingKey));
    if(final.valid)return {status:'ok',envelope:final.envelope,registry:final.registry,hasStaging:staging.present,stagingValid:staging.valid};
    if(staging.valid)return {status:'staging',envelope:staging.envelope,registry:staging.registry,finalReason:final.reason};
    if(final.present||staging.present)return {status:'corrupt',envelope:null,registry:null,finalReason:final.reason,stagingReason:staging.reason};
    return {status:'empty',envelope:null,registry:null};
  }
  function commit(storageValue,configValue,registryValue,committedAt){
    const storage=assertStorage(storageValue),config=normalizeConfig(configValue);
    const envelope=seal(registryValue,committedAt),serialized=stableStringify(envelope);
    storage.setItem(config.stagingKey,serialized);
    const stagedRaw=storage.getItem(config.stagingKey);
    if(stagedRaw!==serialized)fail('STAGING_VERIFY_FAILED');
    if(!parseRaw(stagedRaw).valid)fail('STAGING_INVALID_AFTER_WRITE');
    storage.setItem(config.storageKey,serialized);
    const finalRaw=storage.getItem(config.storageKey);
    if(finalRaw!==serialized)fail('FINAL_VERIFY_FAILED');
    if(!parseRaw(finalRaw).valid)fail('FINAL_INVALID_AFTER_WRITE');
    storage.removeItem(config.stagingKey);
    return clone(envelope);
  }
  function recover(storageValue,configValue){
    const storage=assertStorage(storageValue),config=normalizeConfig(configValue),state=read(storage,config);
    if(state.status==='ok'){
      if(state.hasStaging)storage.removeItem(config.stagingKey);
      return read(storage,config);
    }
    if(state.status!=='staging')return state;
    const serialized=stableStringify(state.envelope);
    storage.setItem(config.storageKey,serialized);
    const finalRaw=storage.getItem(config.storageKey);
    if(finalRaw!==serialized)fail('RECOVERY_VERIFY_FAILED');
    if(!parseRaw(finalRaw).valid)fail('RECOVERY_INVALID_AFTER_WRITE');
    storage.removeItem(config.stagingKey);
    return read(storage,config);
  }
  function allowedWriteKeys(configValue){
    const config=normalizeConfig(configValue);
    return Object.freeze([config.storageKey,config.stagingKey]);
  }
  return Object.freeze({
    schema:SCHEMA,
    version:VERSION,
    stableStringify,
    seal,
    verifyEnvelope,
    read,
    commit,
    recover,
    allowedWriteKeys
  });
});
