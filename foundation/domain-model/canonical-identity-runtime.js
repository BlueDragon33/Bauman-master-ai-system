'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanIdentityRuntime=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const CANONICAL_PREFIX='bd';
  const OVERLAY_SCHEMA='BAUMAN_IDENTITY_OVERLAY_V1';
  const ALLOWED_KINDS=new Set(['source','knowledge','competency','task','evidence','artifact','workflow','research','person','agent']);
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const encode=value=>encodeURIComponent(clean(value));
  const decode=value=>decodeURIComponent(String(value||''));
  const requireValue=(value,label)=>{const v=clean(value);if(!v)throw new Error(`IDENTITY_RUNTIME_INVALID_${label.toUpperCase()}`);return v;};
  function canonicalId(kind,namespace,localId){
    const k=requireValue(kind,'kind');
    if(!ALLOWED_KINDS.has(k))throw new Error(`IDENTITY_RUNTIME_UNKNOWN_KIND:${k}`);
    const ns=requireValue(namespace,'namespace');
    const id=requireValue(localId,'localId');
    return `${CANONICAL_PREFIX}:${encode(k)}:${encode(ns)}:${encode(id)}`;
  }
  function parseCanonicalId(value){
    const raw=clean(value),parts=raw.split(':');
    if(parts.length!==4||parts[0]!==CANONICAL_PREFIX)throw new Error('IDENTITY_RUNTIME_INVALID_CANONICAL_ID');
    const kind=decode(parts[1]),namespace=decode(parts[2]),localId=decode(parts[3]);
    if(!ALLOWED_KINDS.has(kind))throw new Error(`IDENTITY_RUNTIME_UNKNOWN_KIND:${kind}`);
    if(!namespace||!localId)throw new Error('IDENTITY_RUNTIME_EMPTY_CANONICAL_SEGMENT');
    return {canonicalId:raw,kind,namespace,localId};
  }
  function systemFor(registry,systemId){
    const id=requireValue(systemId,'systemId');
    const systems=Array.isArray(registry?.systems)?registry.systems:[];
    const system=systems.find(item=>item?.systemId===id);
    if(!system)throw new Error(`IDENTITY_RUNTIME_UNKNOWN_SYSTEM:${id}`);
    return system;
  }
  function scopeFor(system,scope){
    const name=requireValue(scope,'scope');
    const rule=(Array.isArray(system?.scopeRules)?system.scopeRules:[]).find(item=>item?.scope===name);
    if(!rule)throw new Error(`IDENTITY_RUNTIME_UNKNOWN_SCOPE:${system?.systemId||''}:${name}`);
    return rule;
  }
  function resolveLegacy(registry,systemId,scope,legacyId){
    const system=systemFor(registry,systemId),rule=scopeFor(system,scope),legacy=requireValue(legacyId,'legacyId');
    const localId=`${requireValue(rule.localPrefix,'localPrefix')}/${legacy}`;
    return {
      canonicalId:canonicalId(rule.kind,system.namespace,localId),
      kind:rule.kind,
      namespace:system.namespace,
      legacy:{systemId:system.systemId,scope:rule.scope,id:legacy,storageKey:system.storageKey||null,schema:system.legacySchema||null}
    };
  }
  function mappingKey(systemId,scope,legacyId){return [systemId,scope,legacyId].map(encode).join('|');}
  function emptyOverlay(){return {schema:OVERLAY_SCHEMA,version:1,mappings:{},extensions:{}};}
  function normalizeOverlay(value){
    const overlay=value&&typeof value==='object'?clone(value):emptyOverlay();
    overlay.schema=overlay.schema||OVERLAY_SCHEMA;
    if(overlay.schema!==OVERLAY_SCHEMA)throw new Error(`IDENTITY_RUNTIME_OVERLAY_SCHEMA_MISMATCH:${overlay.schema}`);
    overlay.version=Number(overlay.version)||1;
    overlay.mappings=overlay.mappings&&typeof overlay.mappings==='object'&&!Array.isArray(overlay.mappings)?overlay.mappings:{};
    overlay.extensions=overlay.extensions&&typeof overlay.extensions==='object'&&!Array.isArray(overlay.extensions)?overlay.extensions:{};
    return overlay;
  }
  function ensureMapping(overlayValue,registry,systemId,scope,legacyId,mappedAt){
    const overlay=normalizeOverlay(overlayValue),resolved=resolveLegacy(registry,systemId,scope,legacyId),key=mappingKey(systemId,scope,legacyId),existing=overlay.mappings[key];
    if(existing){
      if(existing.canonicalId!==resolved.canonicalId)throw new Error(`IDENTITY_RUNTIME_MAPPING_CONFLICT:${key}`);
      return overlay;
    }
    overlay.mappings[key]={...resolved,mappedAt:clean(mappedAt)||new Date().toISOString()};
    return overlay;
  }
  function mapLegacyRecord(registry,systemId,scope,legacyId,record){
    const resolved=resolveLegacy(registry,systemId,scope,legacyId);
    return {canonicalId:resolved.canonicalId,legacy:resolved.legacy,record:clone(record)};
  }
  function findCanonical(overlayValue,systemId,scope,legacyId){
    const overlay=normalizeOverlay(overlayValue),row=overlay.mappings[mappingKey(systemId,scope,legacyId)];
    return row?.canonicalId||null;
  }
  return Object.freeze({
    schema:'BAUMAN_CANONICAL_IDENTITY_RUNTIME_V1',
    overlaySchema:OVERLAY_SCHEMA,
    canonicalId,
    parseCanonicalId,
    resolveLegacy,
    mappingKey,
    emptyOverlay,
    normalizeOverlay,
    ensureMapping,
    mapLegacyRecord,
    findCanonical
  });
});
