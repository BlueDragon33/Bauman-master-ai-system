'use strict';
(function(root,factory){
  let registryApi=null;
  if(typeof module==='object'&&module.exports){
    registryApi=require('./content-asset-registry.js');
    module.exports=factory(()=>registryApi);
  }else{
    root.BaumanProvenanceChain=factory(()=>root.BaumanContentAssetRegistry);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(registryProvider){
  const SCHEMA='BAUMAN_PROVENANCE_CHAIN_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`PROVENANCE_CHAIN_${code}`)};

  function api(){
    const value=registryProvider();
    if(!value||typeof value.normalizeRegistry!=='function'||typeof value.appendRecord!=='function')fail('REGISTRY_RUNTIME_MISSING');
    return value;
  }
  function normalize(registryValue){return api().normalizeRegistry(registryValue);}
  function eventMap(registry){return registry.records.provenance||{};}
  function recordExists(registry,id){
    const parsed=api().parseRegistryId(id);
    return Boolean(registry.records[parsed.recordType]?.[parsed.registryId]);
  }
  function eventsForSubject(registryValue,subjectId){
    const registry=normalize(registryValue),target=clean(subjectId);
    if(!target)fail('SUBJECT_REQUIRED');
    return Object.values(eventMap(registry))
      .filter(event=>event.subjectId===target)
      .sort((a,b)=>clean(a.at).localeCompare(clean(b.at))||a.registryId.localeCompare(b.registryId))
      .map(clone);
  }
  function assertValidTimestamp(value,label){
    const text=clean(value);
    if(!text||Number.isNaN(Date.parse(text)))fail(`INVALID_TIMESTAMP:${label}`);
    return Date.parse(text);
  }
  function assertPreviousChains(registry){
    const events=eventMap(registry),done=new Set(),visiting=new Set();
    function visit(id){
      if(done.has(id))return;
      if(visiting.has(id))fail(`PREVIOUS_EVENT_CYCLE:${id}`);
      const event=events[id];
      if(!event)fail(`EVENT_MISSING:${id}`);
      visiting.add(id);
      const currentAt=assertValidTimestamp(event.at,id);
      if(event.previousEventId!==undefined&&event.previousEventId!==null){
        const previous=events[event.previousEventId];
        if(!previous)fail(`PREVIOUS_EVENT_MISSING:${event.previousEventId}`);
        if(previous.subjectId!==event.subjectId)fail(`PREVIOUS_EVENT_SUBJECT_MISMATCH:${id}`);
        const previousAt=assertValidTimestamp(previous.at,event.previousEventId);
        if(previousAt>currentAt)fail(`PREVIOUS_EVENT_TIME_ORDER:${id}`);
        visit(event.previousEventId);
      }
      visiting.delete(id);done.add(id);
    }
    Object.keys(events).sort().forEach(visit);
    return true;
  }
  function inputSubjects(registry,subjectId){
    const inputs=[];
    for(const event of Object.values(eventMap(registry))){
      if(event.subjectId!==subjectId||!Array.isArray(event.inputIds))continue;
      for(const id of event.inputIds)if(!inputs.includes(id))inputs.push(id);
    }
    return inputs.sort();
  }
  function assertLineageAcyclic(registry){
    const done=new Set(),visiting=new Set();
    function visit(subjectId){
      if(done.has(subjectId))return;
      if(visiting.has(subjectId))fail(`LINEAGE_CYCLE:${subjectId}`);
      if(!recordExists(registry,subjectId))fail(`LINEAGE_SUBJECT_MISSING:${subjectId}`);
      visiting.add(subjectId);
      for(const inputId of inputSubjects(registry,subjectId))visit(inputId);
      visiting.delete(subjectId);done.add(subjectId);
    }
    const subjects=[...new Set(Object.values(eventMap(registry)).map(event=>event.subjectId))].sort();
    subjects.forEach(visit);
    return true;
  }
  function assertProvenanceIntegrity(registryValue){
    const registry=normalize(registryValue);
    api().assertIntegrity(registry);
    for(const event of Object.values(eventMap(registry))){
      assertValidTimestamp(event.at,event.registryId);
      if(event.eventType==='transformed'&&(!Array.isArray(event.inputIds)||event.inputIds.length===0))fail(`TRANSFORM_INPUT_REQUIRED:${event.registryId}`);
      if(event.eventType==='generated'&&(event.sourceIds?.length||0)+(event.inputIds?.length||0)===0)fail(`GENERATED_LINEAGE_REQUIRED:${event.registryId}`);
      if(event.eventType==='verified'&&!clean(event.checksumId))fail(`VERIFICATION_CHECKSUM_REQUIRED:${event.registryId}`);
    }
    assertPreviousChains(registry);
    assertLineageAcyclic(registry);
    return true;
  }
  function appendEvent(registryValue,eventValue){
    const event=clone(eventValue);
    const parsed=api().parseRegistryId(event?.registryId);
    if(parsed.recordType!=='provenance')fail('EVENT_ID_REQUIRED');
    const next=api().appendRecord(registryValue,event);
    assertProvenanceIntegrity(next);
    return next;
  }
  function traceLineage(registryValue,subjectId){
    const registry=normalize(registryValue),rootId=clean(subjectId);
    if(!rootId)fail('SUBJECT_REQUIRED');
    if(!recordExists(registry,rootId))fail(`LINEAGE_SUBJECT_MISSING:${rootId}`);
    assertProvenanceIntegrity(registry);
    const subjects=new Set(),sources=new Set(),events=new Set(),checksums=new Set();
    const visiting=new Set();
    function walk(id){
      if(visiting.has(id))fail(`LINEAGE_CYCLE:${id}`);
      if(subjects.has(id))return;
      visiting.add(id);subjects.add(id);
      const parsed=api().parseRegistryId(id);
      if(parsed.recordType==='source')sources.add(id);
      for(const event of eventsForSubject(registry,id)){
        events.add(event.registryId);
        for(const sourceId of event.sourceIds||[])sources.add(sourceId);
        if(event.checksumId)checksums.add(event.checksumId);
        for(const inputId of event.inputIds||[])walk(inputId);
      }
      visiting.delete(id);
    }
    walk(rootId);
    return Object.freeze({
      schema:SCHEMA,
      rootId,
      subjectIds:[...subjects].sort(),
      sourceIds:[...sources].sort(),
      eventIds:[...events].sort(),
      checksumIds:[...checksums].sort()
    });
  }
  function latestEvent(registryValue,subjectId){
    const events=eventsForSubject(registryValue,subjectId);
    return events.length?events[events.length-1]:null;
  }
  return Object.freeze({
    schema:SCHEMA,
    eventsForSubject,
    latestEvent,
    assertPreviousChains,
    assertLineageAcyclic,
    assertProvenanceIntegrity,
    appendEvent,
    traceLineage
  });
});
