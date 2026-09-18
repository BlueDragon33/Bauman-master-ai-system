'use strict';
(function(root,factory){
  let registryApi=null,provenanceApi=null;
  if(typeof module==='object'&&module.exports){
    registryApi=require('./content-asset-registry.js');
    provenanceApi=require('./provenance-chain.js');
    module.exports=factory(()=>registryApi,()=>provenanceApi);
  }else{
    root.BaumanRegistrySnapshot=factory(()=>root.BaumanContentAssetRegistry,()=>root.BaumanProvenanceChain);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(registryProvider,provenanceProvider){
  const SCHEMA='BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_V1';
  const VERSION=1;
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`REGISTRY_SNAPSHOT_${code}`)};
  function registryApi(){
    const api=registryProvider();
    if(!api||typeof api.normalizeRegistry!=='function'||typeof api.assertIntegrity!=='function')fail('REGISTRY_RUNTIME_MISSING');
    return api;
  }
  function provenanceApi(){
    const api=provenanceProvider();
    if(!api||typeof api.assertProvenanceIntegrity!=='function')fail('PROVENANCE_RUNTIME_MISSING');
    return api;
  }
  function stableValue(value){
    if(Array.isArray(value))return value.map(stableValue);
    if(value&&typeof value==='object'){
      const out={};
      for(const key of Object.keys(value).sort())out[key]=stableValue(value[key]);
      return out;
    }
    return value;
  }
  function stableStringify(value){return JSON.stringify(stableValue(value));}
  function assertBucketKeyBinding(registry){
    for(const type of registryApi().recordTypes){
      for(const [key,record] of Object.entries(registry.records[type]||{})){
        if(clean(record?.registryId)!==key)fail(`BUCKET_KEY_MISMATCH:${type}:${key}`);
        const parsed=registryApi().parseRegistryId(key);
        if(parsed.recordType!==type)fail(`BUCKET_TYPE_MISMATCH:${type}:${key}`);
      }
    }
    return true;
  }
  function validateRegistry(registryValue){
    const registry=registryApi().normalizeRegistry(registryValue);
    assertBucketKeyBinding(registry);
    registryApi().assertIntegrity(registry);
    provenanceApi().assertProvenanceIntegrity(registry);
    return registry;
  }
  function exportSnapshot(registryValue){
    const registry=validateRegistry(registryValue);
    const records={};
    let recordCount=0;
    for(const type of registryApi().recordTypes){
      records[type]=Object.values(registry.records[type]||{})
        .map(clone)
        .sort((a,b)=>a.registryId.localeCompare(b.registryId));
      recordCount+=records[type].length;
    }
    return Object.freeze({
      schema:SCHEMA,
      snapshotVersion:VERSION,
      registrySchema:registry.schema,
      registryVersion:registry.version,
      recordCount,
      records:Object.freeze(records),
      registryExtensions:clone(registry.extensions||{})
    });
  }
  function serializeSnapshot(registryValue){return stableStringify(exportSnapshot(registryValue));}
  function parseSnapshot(input){
    let snapshot;
    if(typeof input==='string'){
      try{snapshot=JSON.parse(input);}catch{fail('INVALID_JSON');}
    }else snapshot=clone(input);
    if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))fail('INVALID_SNAPSHOT');
    if(snapshot.schema!==SCHEMA||snapshot.snapshotVersion!==VERSION)fail('SCHEMA_MISMATCH');
    if(snapshot.registrySchema!==registryApi().schema)fail('REGISTRY_SCHEMA_MISMATCH');
    if(!Number.isInteger(snapshot.registryVersion)||snapshot.registryVersion<1)fail('INVALID_REGISTRY_VERSION');
    if(!snapshot.records||typeof snapshot.records!=='object'||Array.isArray(snapshot.records))fail('RECORDS_REQUIRED');
    const recordTypes=registryApi().recordTypes;
    for(const key of Object.keys(snapshot.records))if(!recordTypes.includes(key))fail(`UNKNOWN_RECORD_BUCKET:${key}`);
    const registry=registryApi().emptyRegistry();
    registry.version=snapshot.registryVersion;
    registry.extensions=snapshot.registryExtensions&&typeof snapshot.registryExtensions==='object'&&!Array.isArray(snapshot.registryExtensions)?clone(snapshot.registryExtensions):{};
    let count=0;
    for(const type of recordTypes){
      const rows=snapshot.records[type];
      if(!Array.isArray(rows))fail(`INVALID_RECORD_BUCKET:${type}`);
      for(const row of rows){
        const id=clean(row?.registryId);
        if(!id)fail(`RECORD_ID_REQUIRED:${type}`);
        if(registry.records[type][id])fail(`DUPLICATE_RECORD:${id}`);
        const parsed=registryApi().parseRegistryId(id);
        if(parsed.recordType!==type)fail(`BUCKET_TYPE_MISMATCH:${type}:${id}`);
        registry.records[type][id]=clone(row);
        count++;
      }
    }
    if(snapshot.recordCount!==count)fail(`RECORD_COUNT_MISMATCH:${snapshot.recordCount}:${count}`);
    return validateRegistry(registry);
  }
  function importSnapshot(input){return clone(parseSnapshot(input));}
  function canonicalDigestInput(input){
    const registry=parseSnapshot(input);
    return serializeSnapshot(registry);
  }
  return Object.freeze({
    schema:SCHEMA,
    version:VERSION,
    stableStringify,
    validateRegistry,
    exportSnapshot,
    serializeSnapshot,
    parseSnapshot,
    importSnapshot,
    canonicalDigestInput
  });
});
