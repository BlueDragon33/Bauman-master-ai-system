'use strict';
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanFoundationIdentityPersistence=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  const SCHEMA='BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_V1';
  let inFlight=null;
  let lastResult=null;
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  function deps(){
    const bootstrap=root.BaumanFoundationIdentityBootstrap,store=root.BaumanIdentityOverlayStore;
    if(!bootstrap||!store)throw new Error('FOUNDATION_IDENTITY_PERSISTENCE_DEPENDENCY_MISSING');
    return {bootstrap,store};
  }
  function legacySnapshot(registry,storage){
    const out={};
    for(const system of Array.isArray(registry?.systems)?registry.systems:[]){
      if(system.storageKey)out[system.storageKey]=storage.getItem(system.storageKey);
    }
    return out;
  }
  function sameLegacy(before,after){
    const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    for(const key of keys)if(before?.[key]!==after?.[key])return false;
    return true;
  }
  function result(status,extra={}){
    lastResult=Object.freeze({schema:SCHEMA,status,...extra});
    root.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT=lastResult;
    if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('bauman:foundation-identity-persistence',{detail:lastResult}));
    return lastResult;
  }
  async function persist(report=root.BAUMAN_FOUNDATION_IDENTITY_REPORT,options={}){
    if(inFlight)return inFlight;
    inFlight=(async()=>{
      try{
        if(!report||report.schema!=='BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1'||report.mode!=='silent-read-only'||!report.overlay){
          return result('skipped',{reason:'bootstrap_report_not_ready'});
        }
        const {bootstrap,store}=deps();
        const registry=options.registry||await bootstrap.loadRegistry(options.fetchImpl||root.fetch?.bind(root));
        const policy=registry?.persistence||{};
        if(policy.browserPersistenceMode!=='verified_overlay_only'||policy.browserAutoCommitAllowed!==true||policy.legacyKeysNeverWritten!==true){
          return result('blocked-policy',{reason:'persistence_policy_not_verified'});
        }
        const storage=options.storage||root.localStorage;
        if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')throw new Error('FOUNDATION_IDENTITY_PERSISTENCE_STORAGE_MISSING');
        if(store.checksum(report.overlay)!==report.plannedChecksum)return result('blocked-integrity',{reason:'bootstrap_checksum_mismatch'});
        const beforeLegacy=legacySnapshot(registry,storage);
        let current=store.read(storage,registry);
        if(current.status==='corrupt')return result('blocked-corrupt',{reason:'existing_overlay_corrupt',mappingCount:Object.keys(report.overlay.mappings||{}).length});
        if(current.status==='ok'&&store.checksum(current.overlay)===report.plannedChecksum){
          return result('unchanged',{mappingCount:Object.keys(report.overlay.mappings||{}).length,checksum:report.plannedChecksum});
        }
        if(current.status==='staging'&&store.checksum(current.overlay)===report.plannedChecksum){
          current=store.recover(storage,registry);
          const afterRecoveryLegacy=legacySnapshot(registry,storage);
          if(!sameLegacy(beforeLegacy,afterRecoveryLegacy))throw new Error('FOUNDATION_IDENTITY_PERSISTENCE_LEGACY_MUTATION');
          return result('recovered',{mappingCount:Object.keys(report.overlay.mappings||{}).length,checksum:report.plannedChecksum,persistedStatus:current.status});
        }
        const at=clean(options.now)||new Date().toISOString();
        const envelope=store.commit(storage,registry,report.overlay,at);
        const verified=store.read(storage,registry);
        if(verified.status!=='ok'||store.checksum(verified.overlay)!==report.plannedChecksum)throw new Error('FOUNDATION_IDENTITY_PERSISTENCE_VERIFY_FAILED');
        const afterLegacy=legacySnapshot(registry,storage);
        if(!sameLegacy(beforeLegacy,afterLegacy))throw new Error('FOUNDATION_IDENTITY_PERSISTENCE_LEGACY_MUTATION');
        return result('persisted',{mappingCount:Object.keys(report.overlay.mappings||{}).length,checksum:envelope.checksum,persistedStatus:verified.status});
      }catch(error){
        return result('failed',{error:clean(error?.message||error)});
      }finally{
        inFlight=null;
      }
    })();
    return inFlight;
  }
  function schedule(report){
    if(!report||report.status==='unavailable')return;
    if(root.queueMicrotask)root.queueMicrotask(()=>persist(report));else Promise.resolve().then(()=>persist(report));
  }
  if(typeof root.addEventListener==='function')root.addEventListener('bauman:foundation-identity-ready',event=>schedule(event?.detail));
  if(root.BAUMAN_FOUNDATION_IDENTITY_REPORT)schedule(root.BAUMAN_FOUNDATION_IDENTITY_REPORT);
  return Object.freeze({schema:SCHEMA,persist,legacySnapshot,sameLegacy,getLastResult:()=>clone(lastResult)});
});
