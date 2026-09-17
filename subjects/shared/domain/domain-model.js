'use strict';
(function(root){
  const SCHEMA='BAUMAN_DOMAIN_ENTITY_V1';
  const SCHEMA_VERSION=1;
  const ENTITY_TYPES=Object.freeze(['source','knowledge','competency','task','evidence','artifact','research']);
  const RESEARCH_KINDS=Object.freeze(['paper','claim','research_question','hypothesis','experiment','dataset','code','config','result','figure','table','publication','dissertation_chapter']);
  const ID_RE=/^bauman:(source|knowledge|competency|task|evidence|artifact|research):([a-z0-9][a-z0-9._-]{0,63}):([a-z0-9][a-z0-9._-]{0,127})$/;
  const COMPONENT_RE=/^[a-z0-9][a-z0-9._-]*$/;
  const FORBIDDEN_EVIDENCE_FIELDS=new Set(['mastery','mastered','completionStatus']);

  const isObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const hasOwn=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);

  function assert(condition,message){if(!condition)throw new Error(message);}
  function assertComponent(value,label,max){
    assert(typeof value==='string'&&value.length>0,`${label} must be a non-empty string`);
    assert(value.length<=max,`${label} is too long`);
    assert(COMPONENT_RE.test(value),`${label} must be explicit lowercase ASCII [a-z0-9._-]`);
    return value;
  }

  function makeId(entityType,namespace,localId){
    assert(ENTITY_TYPES.includes(entityType),`Unknown entityType: ${entityType}`);
    assertComponent(namespace,'namespace',64);
    assertComponent(localId,'localId',128);
    return `bauman:${entityType}:${namespace}:${localId}`;
  }

  function parseId(id){
    const match=typeof id==='string'?id.match(ID_RE):null;
    if(!match)return null;
    return {id,entityType:match[1],namespace:match[2],localId:match[3]};
  }

  function isCanonicalId(id,expectedType){
    const parsed=parseId(id);
    return !!parsed&&(!expectedType||parsed.entityType===expectedType);
  }

  function validateIso(value,label){
    if(value==null||value==='')return;
    assert(typeof value==='string'&&!Number.isNaN(Date.parse(value)),`${label} must be ISO-date compatible`);
  }

  function validateRefs(refs){
    assert(Array.isArray(refs),'refs must be an array');
    refs.forEach((ref,index)=>{
      assert(isObject(ref),`refs[${index}] must be an object`);
      assert(typeof ref.relation==='string'&&ref.relation.trim(),`refs[${index}].relation is required`);
      assert(isCanonicalId(ref.id),`refs[${index}].id must be canonical`);
    });
  }

  function validateProvenance(provenance){
    assert(Array.isArray(provenance),'provenance must be an array');
    provenance.forEach((entry,index)=>{
      assert(isObject(entry),`provenance[${index}] must be an object`);
      assert(isCanonicalId(entry.sourceId,'source'),`provenance[${index}].sourceId must be a canonical source ID`);
      assert(typeof entry.relation==='string'&&entry.relation.trim(),`provenance[${index}].relation is required`);
      if(hasOwn(entry,'locator'))assert(typeof entry.locator==='string',`provenance[${index}].locator must be a string`);
    });
  }

  function forbidMasteryPayload(payload,label){
    if(!isObject(payload))return;
    for(const key of FORBIDDEN_EVIDENCE_FIELDS){
      assert(!hasOwn(payload,key),`${label}.${key} is forbidden; evidence and mastery are separate`);
    }
  }

  function validateEntity(entity){
    const errors=[];
    try{
      assert(isObject(entity),'entity must be an object');
      assert(entity.schema===SCHEMA,`schema must be ${SCHEMA}`);
      assert(entity.schemaVersion===SCHEMA_VERSION,`schemaVersion must be ${SCHEMA_VERSION}`);
      const parsed=parseId(entity.id);
      assert(parsed,'id must be canonical');
      assert(ENTITY_TYPES.includes(entity.entityType),'entityType is invalid');
      assert(entity.entityType===parsed.entityType,'entityType must match canonical id');
      assert(entity.namespace===parsed.namespace,'namespace must match canonical id');
      assert(typeof entity.title==='string'&&entity.title.trim(),'title is required');
      assert(Number.isInteger(entity.revision)&&entity.revision>=1,'revision must be an integer >= 1');
      validateIso(entity.createdAt,'createdAt');
      validateIso(entity.updatedAt,'updatedAt');
      validateProvenance(entity.provenance);
      validateRefs(entity.refs);
      assert(isObject(entity.extensions),'extensions must be an object');

      if(entity.entityType==='source'){
        assert(isObject(entity.source),'source payload is required');
        assert(typeof entity.source.kind==='string'&&entity.source.kind.trim(),'source.kind is required');
        assert(typeof entity.source.locator==='string'&&entity.source.locator.trim(),'source.locator is required');
      }
      if(entity.entityType==='knowledge'){
        assert(isObject(entity.knowledge),'knowledge payload is required');
        assert(typeof entity.knowledge.kind==='string'&&entity.knowledge.kind.trim(),'knowledge.kind is required');
      }
      if(entity.entityType==='competency'){
        assert(isObject(entity.competency),'competency payload is required');
        assert(typeof entity.competency.statement==='string'&&entity.competency.statement.trim(),'competency.statement is required');
      }
      if(entity.entityType==='task'){
        assert(isObject(entity.task),'task payload is required');
        assert(typeof entity.task.kind==='string'&&entity.task.kind.trim(),'task.kind is required');
        assert(isObject(entity.task.evidencePolicy),'task.evidencePolicy is required');
        forbidMasteryPayload(entity.task,'task');
      }
      if(entity.entityType==='evidence'){
        assert(isObject(entity.evidence),'evidence payload is required');
        assert(typeof entity.evidence.kind==='string'&&entity.evidence.kind.trim(),'evidence.kind is required');
        assert(isCanonicalId(entity.evidence.taskRef,'task'),'evidence.taskRef must be a canonical task ID');
        forbidMasteryPayload(entity.evidence,'evidence');
      }
      if(entity.entityType==='artifact'){
        assert(isObject(entity.artifact),'artifact payload is required');
        assert(typeof entity.artifact.kind==='string'&&entity.artifact.kind.trim(),'artifact.kind is required');
        assert(Array.isArray(entity.artifact.lineage),'artifact.lineage must be an array');
        entity.artifact.lineage.forEach((ref,index)=>assert(isCanonicalId(ref),`artifact.lineage[${index}] must be canonical`));
      }
      if(entity.entityType==='research'){
        assert(isObject(entity.research),'research payload is required');
        assert(RESEARCH_KINDS.includes(entity.research.kind),`research.kind must be one of: ${RESEARCH_KINDS.join(', ')}`);
      }
    }catch(error){errors.push(error.message);}
    return {ok:errors.length===0,errors};
  }

  function assertValidEntity(entity){
    const result=validateEntity(entity);
    assert(result.ok,result.errors.join('; '));
    return entity;
  }

  function createEntity(input){
    assert(isObject(input),'input must be an object');
    const entity={
      schema:SCHEMA,
      schemaVersion:SCHEMA_VERSION,
      revision:1,
      provenance:[],
      refs:[],
      extensions:{},
      ...clone(input)
    };
    assertValidEntity(entity);
    return entity;
  }

  function assertImmutableIdentity(previous,next){
    assertValidEntity(previous);
    assertValidEntity(next);
    for(const key of ['id','entityType','namespace'])assert(previous[key]===next[key],`${key} is immutable`);
    return true;
  }

  function ref(id,relation){
    assert(isCanonicalId(id),'ref id must be canonical');
    assert(typeof relation==='string'&&relation.trim(),'ref relation is required');
    return {id,relation};
  }

  function provenance(sourceId,relation,locator){
    assert(isCanonicalId(sourceId,'source'),'sourceId must be a canonical source ID');
    assert(typeof relation==='string'&&relation.trim(),'provenance relation is required');
    const entry={sourceId,relation};
    if(locator!=null)entry.locator=String(locator);
    return entry;
  }

  function legacyMapping({entityType,namespace,legacyId,legacyLocator,canonicalLocalId,sourceSchema=''}){
    assert(typeof legacyId==='string'&&legacyId.length>0,'legacyId is required');
    assert(typeof legacyLocator==='string'&&legacyLocator.trim(),'legacyLocator is required because legacy IDs are not guaranteed unique');
    const canonicalId=makeId(entityType,namespace,canonicalLocalId);
    return Object.freeze({legacyId,legacyLocator,canonicalId,entityType,namespace,sourceSchema:String(sourceSchema||'')});
  }

  const api=Object.freeze({
    schema:SCHEMA,
    schemaVersion:SCHEMA_VERSION,
    entityTypes:ENTITY_TYPES,
    researchKinds:RESEARCH_KINDS,
    idPattern:ID_RE,
    makeId,
    parseId,
    isCanonicalId,
    validateEntity,
    assertValidEntity,
    createEntity,
    assertImmutableIdentity,
    ref,
    provenance,
    legacyMapping,
    clone
  });

  root.BaumanDomainModel=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
