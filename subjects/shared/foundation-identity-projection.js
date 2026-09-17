'use strict';
(function(root){
  const SCHEMA='BAUMAN_FOUNDATION_IDENTITY_PROJECTION_BRIDGE_V1';
  let current=null;
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  function core(){return root.BaumanCanonicalReadProjection||null;}
  function report(status,extra={}){
    const value=Object.freeze({schema:SCHEMA,status,...extra});
    root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT=value;
    if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('bauman:foundation-identity-projection',{detail:value}));
    return value;
  }
  function rebuild(){
    const api=core();
    if(!api){current=null;return report('unavailable',{reason:'projection_core_missing'});}
    const projection=api.create(root.BAUMAN_FOUNDATION_IDENTITY_REPORT,root.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT);
    if(projection.status!=='ready'){
      current=null;
      return report(projection.status,{reason:projection.reason||'projection_not_ready',durable:false,persistenceStatus:projection.persistenceStatus||null,plannedChecksum:projection.plannedChecksum||null});
    }
    current=projection;
    const summary=projection.summary();
    const value=report('ready',{durable:true,mappingCount:summary.mappingCount,checksum:summary.checksum,persistenceStatus:summary.persistenceStatus,systems:summary.systems});
    if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('bauman:foundation-identity-projection-ready',{detail:value}));
    return value;
  }
  const facade=Object.freeze({
    schema:SCHEMA,
    rebuild,
    status:()=>clone(root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT||{schema:SCHEMA,status:'pending',durable:false}),
    canonicalFor:(systemId,scope,legacyId)=>current?.canonicalFor(systemId,scope,legacyId)||null,
    resolve:(systemId,scope,legacyId)=>current?.resolve(systemId,scope,legacyId)||null,
    reverse:canonicalId=>current?.reverse(canonicalId)||[],
    list:filters=>current?.list(filters)||[],
    projectRecord:(systemId,scope,legacyId,record)=>current?.projectRecord(systemId,scope,legacyId,record)||null,
    summary:()=>current?.summary()||Object.freeze({schema:core()?.schema||'BAUMAN_CANONICAL_READ_PROJECTION_V1',status:'pending',durable:false,mappingCount:0,checksum:null,persistenceStatus:clean(root.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT?.status)||null,systems:[]})
  });
  root.BaumanFoundationIdentityProjection=facade;
  root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT=Object.freeze({schema:SCHEMA,status:'pending',durable:false});
  if(typeof root.addEventListener==='function'){
    root.addEventListener('bauman:foundation-identity-persistence',rebuild);
    root.addEventListener('bauman:foundation-identity-ready',()=>{
      if(root.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT)rebuild();
    });
  }
  if(root.BAUMAN_FOUNDATION_IDENTITY_REPORT&&root.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT){
    if(root.queueMicrotask)root.queueMicrotask(rebuild);else Promise.resolve().then(rebuild);
  }
})(typeof globalThis!=='undefined'?globalThis:this);
