'use strict';
(function(root,factory){
  const api=factory(()=>root.BaumanIdentityRuntime);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanIdentityOverlayStore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(identityProvider){
  const STORE_SCHEMA='BAUMAN_IDENTITY_OVERLAY_STORE_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  function identity(){const api=identityProvider();if(!api)throw new Error('IDENTITY_OVERLAY_STORE_RUNTIME_MISSING');return api;}
  function assertStorage(storage){
    if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')throw new Error('IDENTITY_OVERLAY_STORE_INVALID_ADAPTER');
    return storage;
  }
  function config(registry){
    const p=registry?.persistence||{};
    if(p.storeSchema!==STORE_SCHEMA)throw new Error('IDENTITY_OVERLAY_STORE_SCHEMA_CONFIG_MISMATCH');
    if(!clean(p.storageKey)||!clean(p.stagingKey)||p.storageKey===p.stagingKey)throw new Error('IDENTITY_OVERLAY_STORE_INVALID_KEYS');
    if(p.legacyKeysNeverWritten!==true||p.stagingRequired!==true||p.readBackVerificationRequired!==true)throw new Error('IDENTITY_OVERLAY_STORE_UNSAFE_POLICY');
    return p;
  }
  function canonicalize(value){
    if(Array.isArray(value))return value.map(canonicalize);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=canonicalize(value[key]);return out;},{});
    return value;
  }
  const stableStringify=value=>JSON.stringify(canonicalize(value));
  function checksum(value){
    const text=typeof value==='string'?value:stableStringify(value);let hash=2166136261;
    for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
    return hash.toString(16).padStart(8,'0');
  }
  function seal(overlayValue,committedAt){
    const overlay=identity().normalizeOverlay(overlayValue);
    return {schema:STORE_SCHEMA,storeVersion:1,overlaySchema:identity().overlaySchema,committedAt:clean(committedAt)||new Date().toISOString(),checksum:checksum(overlay),overlay};
  }
  function verifyEnvelope(value){
    if(!value||typeof value!=='object')return {ok:false,reason:'not_object'};
    if(value.schema!==STORE_SCHEMA||Number(value.storeVersion)!==1)return {ok:false,reason:'schema'};
    if(value.overlaySchema!==identity().overlaySchema)return {ok:false,reason:'overlay_schema'};
    let overlay;try{overlay=identity().normalizeOverlay(value.overlay);}catch(_){return {ok:false,reason:'overlay_invalid'};}
    if(clean(value.checksum)!==checksum(overlay))return {ok:false,reason:'checksum'};
    return {ok:true,envelope:{...clone(value),overlay}};
  }
  function parseRaw(raw){if(!raw)return {present:false,valid:false,envelope:null,reason:'empty'};try{const checked=verifyEnvelope(JSON.parse(raw));return {present:true,valid:checked.ok,envelope:checked.envelope||null,reason:checked.reason||null};}catch(_){return {present:true,valid:false,envelope:null,reason:'json'};}}
  function read(storageValue,registry){
    const storage=assertStorage(storageValue),p=config(registry),final=parseRaw(storage.getItem(p.storageKey)),staging=parseRaw(storage.getItem(p.stagingKey));
    if(final.valid)return {status:'ok',envelope:final.envelope,overlay:clone(final.envelope.overlay),hasStaging:staging.present};
    if(staging.valid)return {status:'staging',envelope:staging.envelope,overlay:clone(staging.envelope.overlay),finalReason:final.reason};
    if(final.present||staging.present)return {status:'corrupt',envelope:null,overlay:null,finalReason:final.reason,stagingReason:staging.reason};
    return {status:'empty',envelope:null,overlay:identity().emptyOverlay()};
  }
  function planMappings(registry,descriptors,overlayValue,mappedAt){
    let overlay=identity().normalizeOverlay(overlayValue);
    for(const row of Array.isArray(descriptors)?descriptors:[]){
      if(!row||typeof row!=='object')throw new Error('IDENTITY_OVERLAY_STORE_INVALID_DESCRIPTOR');
      overlay=identity().ensureMapping(overlay,registry,row.systemId,row.scope,row.legacyId,mappedAt);
    }
    return overlay;
  }
  function commit(storageValue,registry,overlayValue,committedAt){
    const storage=assertStorage(storageValue),p=config(registry),envelope=seal(overlayValue,committedAt),serialized=stableStringify(envelope);
    storage.setItem(p.stagingKey,serialized);
    if(storage.getItem(p.stagingKey)!==serialized)throw new Error('IDENTITY_OVERLAY_STORE_STAGING_VERIFY_FAILED');
    storage.setItem(p.storageKey,serialized);
    if(storage.getItem(p.storageKey)!==serialized)throw new Error('IDENTITY_OVERLAY_STORE_FINAL_VERIFY_FAILED');
    storage.removeItem(p.stagingKey);
    return clone(envelope);
  }
  function recover(storageValue,registry){
    const storage=assertStorage(storageValue),p=config(registry),state=read(storage,registry);
    if(state.status==='ok'){if(state.hasStaging)storage.removeItem(p.stagingKey);return state;}
    if(state.status!=='staging')return state;
    const serialized=stableStringify(state.envelope);
    storage.setItem(p.storageKey,serialized);
    if(storage.getItem(p.storageKey)!==serialized)throw new Error('IDENTITY_OVERLAY_STORE_RECOVERY_VERIFY_FAILED');
    storage.removeItem(p.stagingKey);
    return read(storage,registry);
  }
  function allowedWriteKeys(registry){const p=config(registry);return Object.freeze([p.storageKey,p.stagingKey]);}
  return Object.freeze({schema:STORE_SCHEMA,stableStringify,checksum,seal,verifyEnvelope,read,planMappings,commit,recover,allowedWriteKeys});
});
