'use strict';
(function(root){
  const SCHEMA='BAUMAN_DOMAIN_MIGRATION_V1';
  const registry=new Map();
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const isObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const key=(entityType,fromVersion,toVersion)=>`${entityType}:${fromVersion}->${toVersion}`;

  function register({entityType,fromVersion,toVersion,migrate}){
    assert(typeof entityType==='string'&&entityType,'entityType is required');
    assert(Number.isInteger(fromVersion)&&fromVersion>=1,'fromVersion must be >= 1');
    assert(Number.isInteger(toVersion)&&toVersion===fromVersion+1,'migrations must advance exactly one schema version');
    assert(typeof migrate==='function','migrate must be a function');
    const id=key(entityType,fromVersion,toVersion);
    assert(!registry.has(id),`migration already registered: ${id}`);
    registry.set(id,migrate);
    return id;
  }

  function assertIdentityStable(before,after){
    for(const field of ['id','entityType','namespace'])assert(before[field]===after[field],`${field} cannot change during migration`);
  }

  function assertAdditive(before,after){
    for(const field of Object.keys(before)){
      assert(Object.prototype.hasOwnProperty.call(after,field),`additive migration cannot delete top-level field: ${field}`);
    }
  }

  function migrateEntity(input,targetVersion){
    assert(isObject(input),'migration input must be an object');
    assert(Number.isInteger(input.schemaVersion)&&input.schemaVersion>=1,'input.schemaVersion must be >= 1');
    const target=targetVersion==null?input.schemaVersion:targetVersion;
    assert(Number.isInteger(target)&&target>=input.schemaVersion,'targetVersion cannot go backwards');
    let current=clone(input);
    while(current.schemaVersion<target){
      const from=current.schemaVersion;
      const to=from+1;
      const id=key(current.entityType,from,to);
      const fn=registry.get(id);
      assert(fn,`missing explicit migration: ${id}`);
      const before=clone(current);
      const result=fn(clone(current));
      assert(isObject(result),'migration must return an object');
      assert(result!==current,'migration must return a new object');
      assert(result.schemaVersion===to,`migration ${id} must set schemaVersion=${to}`);
      assertIdentityStable(before,result);
      assertAdditive(before,result);
      current=clone(result);
    }
    return current;
  }

  function preserveLegacy(entity,{legacyId,legacyLocator,sourceSchema='',payload=null}={}){
    assert(isObject(entity),'entity is required');
    if(legacyId!=null){
      assert(typeof legacyId==='string'&&legacyId.length>0,'legacyId must be a non-empty string');
      assert(typeof legacyLocator==='string'&&legacyLocator.trim(),'legacyLocator is required when preserving legacy identity');
    }
    const next=clone(entity);
    next.extensions=isObject(next.extensions)?next.extensions:{};
    const existing=isObject(next.extensions.legacy)?next.extensions.legacy:{};
    next.extensions.legacy={
      ...existing,
      ...(legacyId!=null?{legacyId:String(legacyId),legacyLocator:String(legacyLocator)}:{}),
      ...(sourceSchema?{sourceSchema:String(sourceSchema)}:{}),
      ...(payload!=null?{payload:clone(payload)}:{})
    };
    return next;
  }

  function registered(){return [...registry.keys()].sort();}

  const api=Object.freeze({
    schema:SCHEMA,
    mode:'additive-pure',
    register,
    migrateEntity,
    preserveLegacy,
    assertIdentityStable,
    registered
  });

  root.BaumanDomainMigrations=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
