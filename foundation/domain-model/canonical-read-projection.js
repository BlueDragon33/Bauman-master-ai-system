'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanCanonicalReadProjection=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const SCHEMA='BAUMAN_CANONICAL_READ_PROJECTION_V1';
  const BOOTSTRAP_SCHEMA='BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1';
  const PERSISTENCE_SCHEMA='BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_V1';
  const DURABLE=new Set(['persisted','unchanged','recovered']);
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const encode=value=>encodeURIComponent(clean(value));
  const mappingKey=(systemId,scope,legacyId)=>[systemId,scope,legacyId].map(encode).join('|');
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))deepFreeze(child);
    return value;
  }
  function unavailable(status,reason,extra={}){
    return deepFreeze({schema:SCHEMA,status,durable:false,reason:clean(reason),mappingCount:0,checksum:null,...clone(extra)});
  }
  function normalizeInputs(report,persistence){
    if(!report||report.schema!==BOOTSTRAP_SCHEMA||report.mode!=='silent-read-only'||!report.overlay)return unavailable('unavailable','bootstrap_report_not_ready');
    if(!persistence||persistence.schema!==PERSISTENCE_SCHEMA)return unavailable('pending','persistence_report_not_ready',{plannedChecksum:clean(report.plannedChecksum)||null});
    if(!DURABLE.has(persistence.status))return unavailable('blocked',`persistence_${clean(persistence.status)||'unknown'}`,{plannedChecksum:clean(report.plannedChecksum)||null,persistenceStatus:clean(persistence.status)||'unknown'});
    const planned=clean(report.plannedChecksum),persisted=clean(persistence.checksum);
    if(!planned||!persisted||planned!==persisted)return unavailable('blocked','checksum_mismatch',{plannedChecksum:planned||null,persistedChecksum:persisted||null,persistenceStatus:persistence.status});
    return {report,persistence};
  }
  function rowsFromOverlay(overlay){
    const rows=[];
    for(const [key,value] of Object.entries(overlay?.mappings||{})){
      if(!value||typeof value!=='object'||!clean(value.canonicalId)||!value.legacy)continue;
      const legacy=value.legacy;
      const row={
        key,
        canonicalId:clean(value.canonicalId),
        kind:clean(value.kind),
        namespace:clean(value.namespace),
        mappedAt:clean(value.mappedAt)||null,
        legacy:{
          systemId:clean(legacy.systemId),
          scope:clean(legacy.scope),
          id:clean(legacy.id),
          storageKey:legacy.storageKey??null,
          schema:legacy.schema??null
        }
      };
      if(!row.legacy.systemId||!row.legacy.scope||!row.legacy.id)continue;
      rows.push(row);
    }
    rows.sort((a,b)=>a.key.localeCompare(b.key));
    return rows.map(deepFreeze);
  }
  function create(report,persistence){
    const input=normalizeInputs(report,persistence);
    if(input.schema===SCHEMA)return input;
    const rows=rowsFromOverlay(report.overlay),byKey=new Map(),byCanonical=new Map();
    for(const row of rows){
      byKey.set(row.key,row);
      if(!byCanonical.has(row.canonicalId))byCanonical.set(row.canonicalId,[]);
      byCanonical.get(row.canonicalId).push(row);
    }
    const canonicalFor=(systemId,scope,legacyId)=>byKey.get(mappingKey(systemId,scope,legacyId))?.canonicalId||null;
    const resolve=(systemId,scope,legacyId)=>{
      const row=byKey.get(mappingKey(systemId,scope,legacyId));
      return row?deepFreeze(clone(row)):null;
    };
    const reverse=canonicalId=>(byCanonical.get(clean(canonicalId))||[]).map(row=>deepFreeze(clone(row)));
    const list=(filters={})=>rows.filter(row=>{
      if(filters.systemId&&row.legacy.systemId!==clean(filters.systemId))return false;
      if(filters.scope&&row.legacy.scope!==clean(filters.scope))return false;
      if(filters.kind&&row.kind!==clean(filters.kind))return false;
      if(filters.namespace&&row.namespace!==clean(filters.namespace))return false;
      if(filters.canonicalId&&row.canonicalId!==clean(filters.canonicalId))return false;
      return true;
    }).map(row=>deepFreeze(clone(row)));
    const projectRecord=(systemId,scope,legacyId,record)=>{
      const row=resolve(systemId,scope,legacyId);
      if(!row)return null;
      return deepFreeze({canonicalId:row.canonicalId,identity:row,record:clone(record)});
    };
    const summary=()=>deepFreeze({schema:SCHEMA,status:'ready',durable:true,mappingCount:rows.length,checksum:clean(report.plannedChecksum),persistenceStatus:persistence.status,systems:[...new Set(rows.map(row=>row.legacy.systemId))].sort()});
    return Object.freeze({
      schema:SCHEMA,
      status:'ready',
      durable:true,
      checksum:clean(report.plannedChecksum),
      persistenceStatus:persistence.status,
      mappingCount:rows.length,
      canonicalFor,
      resolve,
      reverse,
      list,
      projectRecord,
      summary
    });
  }
  return Object.freeze({schema:SCHEMA,durableStatuses:Object.freeze([...DURABLE]),mappingKey,create});
});
