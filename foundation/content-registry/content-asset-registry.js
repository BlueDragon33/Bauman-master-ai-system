'use strict';
(function(root,factory){
  let identityApi=null;
  if(typeof module==='object'&&module.exports){
    identityApi=require('../domain-model/canonical-identity-runtime.js');
    module.exports=factory(()=>identityApi);
  }else{
    root.BaumanContentAssetRegistry=factory(()=>root.BaumanIdentityRuntime);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(identityProvider){
  const REGISTRY_SCHEMA='BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1';
  const RECORD_TYPES=Object.freeze(['asset','content','source','provenance','checksum','access']);
  const ASSET_STATES=new Set(['staged','verified','active','superseded','quarantined','missing']);
  const ASSET_TYPES=new Set(['pdf','ppt','pptx','audio','image','dataset','paper','document','video','archive','code','other']);
  const CONTENT_TYPES=new Set(['learning_material','reference','assessment','research_material','dataset','publication','generated_content','other']);
  const SOURCE_TYPES=new Set(['repository','external_url','citation','user_import','generated','legacy']);
  const PROVENANCE_TYPES=new Set(['captured','imported','transformed','generated','verified','superseded','relocated','linked']);
  const VISIBILITY=new Set(['private','course','organization','public']);
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`CONTENT_ASSET_REGISTRY_${code}`)};
  function identity(){const api=identityProvider();if(!api||typeof api.parseCanonicalId!=='function')fail('IDENTITY_RUNTIME_MISSING');return api;}
  function emptyRecords(){return RECORD_TYPES.reduce((out,type)=>{out[type]={};return out;},{});}
  function emptyRegistry(){return {schema:REGISTRY_SCHEMA,version:1,records:emptyRecords(),extensions:{}};}
  function normalizeRegistry(value){
    const registry=value&&typeof value==='object'?clone(value):emptyRegistry();
    registry.schema=registry.schema||REGISTRY_SCHEMA;
    if(registry.schema!==REGISTRY_SCHEMA)fail(`SCHEMA_MISMATCH:${registry.schema}`);
    registry.version=Number(registry.version)||1;
    registry.records=registry.records&&typeof registry.records==='object'&&!Array.isArray(registry.records)?registry.records:{};
    for(const type of RECORD_TYPES){
      const bucket=registry.records[type];
      registry.records[type]=bucket&&typeof bucket==='object'&&!Array.isArray(bucket)?bucket:{};
    }
    registry.extensions=registry.extensions&&typeof registry.extensions==='object'&&!Array.isArray(registry.extensions)?registry.extensions:{};
    return registry;
  }
  function parseRegistryId(value){
    const raw=clean(value),parts=raw.split(':');
    if(parts.length!==4||parts[0]!=='bdr')fail('INVALID_REGISTRY_ID');
    const [,recordType,namespace,localId]=parts;
    if(!RECORD_TYPES.includes(recordType))fail(`UNKNOWN_RECORD_TYPE:${recordType}`);
    if(!/^[a-z0-9][a-z0-9-]*$/.test(namespace)||!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(localId))fail('INVALID_REGISTRY_ID_SEGMENT');
    return {registryId:raw,recordType,namespace,localId};
  }
  function validateCanonicalId(value){
    const parsed=identity().parseCanonicalId(clean(value));
    if(parsed.kind!=='source'&&parsed.kind!=='artifact')fail(`INVALID_CANONICAL_KIND:${parsed.kind}`);
    return parsed;
  }
  function validateLocator(locator){
    if(!locator||typeof locator!=='object')fail('INVALID_LOCATOR');
    const kind=clean(locator.kind),value=clean(locator.value);
    if(!value)fail('EMPTY_LOCATOR');
    if(kind==='repository_relative'){
      if(value.startsWith('/')||/^[A-Za-z]:[\\/]/.test(value)||value.includes('\\')||value.split('/').includes('..'))fail('NON_PORTABLE_LOCATOR');
      return {kind,value};
    }
    if(kind==='https_url'){
      if(!/^https:\/\//.test(value))fail('INSECURE_EXTERNAL_LOCATOR');
      return {kind,value};
    }
    if(kind==='content_hash'){
      if(!/^sha256:[0-9a-f]{64}$/.test(value))fail('INVALID_CONTENT_HASH_LOCATOR');
      return {kind,value};
    }
    fail(`UNKNOWN_LOCATOR_KIND:${kind}`);
  }
  function assertBase(record,expectedType){
    if(!record||typeof record!=='object'||Array.isArray(record))fail('INVALID_RECORD');
    const parsed=parseRegistryId(record.registryId);
    if(parsed.recordType!==expectedType)fail(`RECORD_TYPE_MISMATCH:${parsed.recordType}:${expectedType}`);
    if(!Number.isInteger(record.recordVersion)||record.recordVersion<1)fail('INVALID_RECORD_VERSION');
    return parsed;
  }
  function has(registry,type,id){return Boolean(registry.records[type]?.[id]);}
  function findRecord(registryValue,registryId){
    const registry=normalizeRegistry(registryValue),parsed=parseRegistryId(registryId);
    return clone(registry.records[parsed.recordType][parsed.registryId]||null);
  }
  function validateReference(registry,id,type,label){
    const parsed=parseRegistryId(id);
    if(parsed.recordType!==type)fail(`${label}_TYPE_MISMATCH`);
    if(!has(registry,type,id))fail(`${label}_MISSING:${id}`);
    return parsed;
  }
  function validateProvenanceInput(registry,id){
    const parsed=parseRegistryId(id);
    if(parsed.recordType!=='asset'&&parsed.recordType!=='content')fail(`PROVENANCE_INPUT_TYPE_MISMATCH:${parsed.recordType}`);
    if(!has(registry,parsed.recordType,parsed.registryId))fail(`PROVENANCE_INPUT_MISSING:${parsed.registryId}`);
    return parsed;
  }
  function validateRecord(registry,record,type){
    assertBase(record,type);
    if(type==='source'){
      validateCanonicalId(record.canonicalEntityId);
      if(!SOURCE_TYPES.has(clean(record.sourceType)))fail('INVALID_SOURCE_TYPE');
      if(!clean(record.title)||!clean(record.capturedAt))fail('INVALID_SOURCE_METADATA');
      validateLocator(record.locator);
    }else if(type==='checksum'){
      if(record.algorithm!=='sha256'||!/^[0-9a-f]{64}$/.test(clean(record.digest)))fail('INVALID_CHECKSUM');
      if(!Number.isInteger(record.byteLength)||record.byteLength<0)fail('INVALID_BYTE_LENGTH');
    }else if(type==='asset'){
      validateCanonicalId(record.canonicalEntityId);
      if(!ASSET_TYPES.has(clean(record.assetType))||!clean(record.mediaType))fail('INVALID_ASSET_TYPE');
      if(!ASSET_STATES.has(clean(record.state)))fail('INVALID_ASSET_STATE');
      validateReference(registry,record.checksumId,'checksum','CHECKSUM');
      if(!Array.isArray(record.locators)||record.locators.length===0)fail('ASSET_LOCATOR_REQUIRED');
      record.locators.forEach(validateLocator);
    }else if(type==='provenance'){
      const eventType=clean(record.eventType);
      if(!PROVENANCE_TYPES.has(eventType)||!clean(record.at)||!clean(record.actor))fail('INVALID_PROVENANCE');
      const subject=parseRegistryId(record.subjectId);
      if(subject.recordType==='provenance'||subject.recordType==='checksum'||subject.recordType==='access')fail(`INVALID_PROVENANCE_SUBJECT_TYPE:${subject.recordType}`);
      if(!has(registry,subject.recordType,subject.registryId))fail(`PROVENANCE_SUBJECT_MISSING:${subject.registryId}`);
      if(!Array.isArray(record.sourceIds))fail('PROVENANCE_SOURCE_IDS_REQUIRED');
      record.sourceIds.forEach(id=>validateReference(registry,id,'source','PROVENANCE_SOURCE'));
      if(record.inputIds!==undefined){
        if(!Array.isArray(record.inputIds))fail('PROVENANCE_INPUT_IDS_INVALID');
        record.inputIds.forEach(id=>validateProvenanceInput(registry,id));
      }
      if(eventType==='transformed'&&(!Array.isArray(record.inputIds)||record.inputIds.length===0))fail('TRANSFORM_INPUT_REQUIRED');
      if(eventType==='generated'&&record.sourceIds.length===0&&(!Array.isArray(record.inputIds)||record.inputIds.length===0))fail('GENERATED_LINEAGE_REQUIRED');
      if(eventType==='verified')validateReference(registry,record.checksumId,'checksum','VERIFICATION_CHECKSUM');
      if(record.previousEventId!==undefined&&record.previousEventId!==null){
        validateReference(registry,record.previousEventId,'provenance','PREVIOUS_PROVENANCE');
        const previous=registry.records.provenance[record.previousEventId];
        if(previous.subjectId!==record.subjectId)fail('PREVIOUS_PROVENANCE_SUBJECT_MISMATCH');
      }
    }else if(type==='content'){
      validateCanonicalId(record.canonicalEntityId);
      if(!CONTENT_TYPES.has(clean(record.contentType))||!clean(record.title))fail('INVALID_CONTENT_METADATA');
      if(!Array.isArray(record.assetIds)||!Array.isArray(record.sourceIds)||!Array.isArray(record.provenanceEventIds))fail('CONTENT_REFERENCES_REQUIRED');
      record.assetIds.forEach(id=>validateReference(registry,id,'asset','CONTENT_ASSET'));
      record.sourceIds.forEach(id=>validateReference(registry,id,'source','CONTENT_SOURCE'));
      record.provenanceEventIds.forEach(id=>validateReference(registry,id,'provenance','CONTENT_PROVENANCE'));
    }else if(type==='access'){
      if(!VISIBILITY.has(clean(record.visibility))||!clean(record.scope))fail('INVALID_ACCESS_POLICY');
      const scope=parseRegistryId(record.scope);
      if(!has(registry,scope.recordType,scope.registryId))fail(`ACCESS_SCOPE_MISSING:${scope.registryId}`);
    }
    if(record.supersedesId!==undefined&&record.supersedesId!==null){
      const prior=parseRegistryId(record.supersedesId);
      if(prior.recordType!==type||!has(registry,type,prior.registryId))fail('INVALID_SUPERSEDES_REFERENCE');
    }
    return true;
  }
  function appendRecord(registryValue,recordValue){
    const registry=normalizeRegistry(registryValue),record=clone(recordValue),parsed=parseRegistryId(record?.registryId);
    if(has(registry,parsed.recordType,parsed.registryId))fail(`DUPLICATE_RECORD:${parsed.registryId}`);
    validateRecord(registry,record,parsed.recordType);
    registry.records[parsed.recordType][parsed.registryId]=record;
    return registry;
  }
  function listByType(registryValue,type){
    const registry=normalizeRegistry(registryValue),t=clean(type);
    if(!RECORD_TYPES.includes(t))fail(`UNKNOWN_RECORD_TYPE:${t}`);
    return Object.keys(registry.records[t]).sort().map(id=>clone(registry.records[t][id]));
  }
  function canonicalIndex(registryValue){
    const registry=normalizeRegistry(registryValue),index={};
    for(const type of ['source','asset','content']){
      for(const record of Object.values(registry.records[type])){
        if(!record?.canonicalEntityId)continue;
        const id=clean(record.canonicalEntityId);
        if(!index[id])index[id]=[];
        index[id].push(record.registryId);
      }
    }
    for(const ids of Object.values(index))ids.sort();
    return clone(index);
  }
  function assertIntegrity(registryValue){
    const registry=normalizeRegistry(registryValue);
    for(const type of RECORD_TYPES){
      for(const record of Object.values(registry.records[type]))validateRecord(registry,record,type);
    }
    return true;
  }
  return Object.freeze({
    schema:REGISTRY_SCHEMA,
    recordTypes:RECORD_TYPES,
    emptyRegistry,
    normalizeRegistry,
    parseRegistryId,
    validateLocator,
    findRecord,
    appendRecord,
    listByType,
    canonicalIndex,
    assertIntegrity
  });
});
