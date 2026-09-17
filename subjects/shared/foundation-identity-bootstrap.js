'use strict';
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanFoundationIdentityBootstrap=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  const SCHEMA='BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1';
  const REGISTRY_URL='../../foundation/domain-model/legacy-mapping-registry.v1.json';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const parse=(raw,fallback=null)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  function dependencies(){
    const identity=root.BaumanIdentityRuntime,store=root.BaumanIdentityOverlayStore,extractor=root.BaumanLegacySnapshotExtractor;
    if(!identity||!store||!extractor)throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_DEPENDENCY_MISSING');
    return {identity,store,extractor};
  }
  function readOnlyStorage(storage){
    if(!storage||typeof storage.getItem!=='function')throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_STORAGE_MISSING');
    return Object.freeze({
      getItem:key=>storage.getItem(key),
      setItem:()=>{throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_READ_ONLY');},
      removeItem:()=>{throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_READ_ONLY');}
    });
  }
  function snapshots(registry,storage,hostTask){
    const out={};
    for(const system of Array.isArray(registry?.systems)?registry.systems:[]){
      if(system.systemId==='bauman-subject-host'){
        out[system.systemId]=hostTask&&typeof hostTask==='object'?clone(hostTask):{};
        continue;
      }
      out[system.systemId]=system.storageKey?parse(storage.getItem(system.storageKey),{}):{};
    }
    return out;
  }
  function buildReport(registry,storageValue,hostTask,nowValue){
    const {identity,store,extractor}=dependencies(),storage=readOnlyStorage(storageValue),source=snapshots(registry,storage,hostTask);
    const descriptors=extractor.extractAll(registry,source),persisted=store.read(storage,registry);
    const base=(persisted.status==='ok'||persisted.status==='staging')?persisted.overlay:identity.emptyOverlay();
    const planned=store.planMappings(registry,descriptors,base,clean(nowValue)||new Date().toISOString());
    return Object.freeze({
      schema:SCHEMA,
      mode:'silent-read-only',
      registrySchema:registry?.schema||'',
      identitySchema:identity.schema,
      persistedStatus:persisted.status,
      descriptorCount:descriptors.length,
      mappingCount:Object.keys(planned.mappings||{}).length,
      plannedChecksum:store.checksum(planned),
      descriptors:clone(descriptors),
      overlay:clone(planned)
    });
  }
  async function loadRegistry(fetchImpl){
    if(typeof fetchImpl!=='function')throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_FETCH_MISSING');
    const response=await fetchImpl(REGISTRY_URL,{cache:'no-cache'});
    if(!response?.ok)throw new Error(`FOUNDATION_IDENTITY_BOOTSTRAP_REGISTRY_HTTP:${response?.status||0}`);
    const registry=await response.json();
    if(registry?.schema!=='BAUMAN_LEGACY_MAPPING_REGISTRY_V1')throw new Error('FOUNDATION_IDENTITY_BOOTSTRAP_REGISTRY_SCHEMA');
    return registry;
  }
  async function run(options={}){
    try{
      const registry=options.registry||await loadRegistry(options.fetchImpl||root.fetch?.bind(root));
      const storage=options.storage||root.localStorage;
      const hostTask=options.hostTask!==undefined?options.hostTask:(root.BaumanSubjectHost?.getTask?.()||root.BAUMAN_HOST_TASK||{});
      const report=buildReport(registry,storage,hostTask,options.now);
      root.BAUMAN_FOUNDATION_IDENTITY_REPORT=report;
      if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('bauman:foundation-identity-ready',{detail:report}));
      return report;
    }catch(error){
      const failure=Object.freeze({schema:SCHEMA,mode:'silent-read-only',status:'unavailable',error:clean(error?.message||error)});
      root.BAUMAN_FOUNDATION_IDENTITY_REPORT=failure;
      return failure;
    }
  }
  function schedule(){
    if(!root.document)return;
    const start=()=>root.setTimeout?root.setTimeout(()=>run(),0):Promise.resolve().then(()=>run());
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  }
  schedule();
  return Object.freeze({schema:SCHEMA,registryUrl:REGISTRY_URL,readOnlyStorage,snapshots,buildReport,loadRegistry,run});
});
