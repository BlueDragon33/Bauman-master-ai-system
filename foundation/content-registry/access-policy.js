'use strict';
(function(root,factory){
  let registryApi=null;
  if(typeof module==='object'&&module.exports){
    registryApi=require('./content-asset-registry.js');
    module.exports=factory(()=>registryApi);
  }else{
    root.BaumanAccessPolicy=factory(()=>root.BaumanContentAssetRegistry);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(registryProvider){
  const SCHEMA='BAUMAN_ACCESS_POLICY_V1';
  const ORDER=Object.freeze({private:0,course:1,organization:2,public:3});
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`ACCESS_POLICY_${code}`)};
  function api(){
    const value=registryProvider();
    if(!value||typeof value.normalizeRegistry!=='function'||typeof value.parseRegistryId!=='function')fail('REGISTRY_RUNTIME_MISSING');
    return value;
  }
  function normalize(registryValue){return api().normalizeRegistry(registryValue);}
  function assertTarget(registry,targetId){
    const parsed=api().parseRegistryId(clean(targetId));
    if(!registry.records[parsed.recordType]?.[parsed.registryId])fail(`TARGET_MISSING:${parsed.registryId}`);
    return parsed.registryId;
  }
  function policiesForScope(registryValue,targetId){
    const registry=normalize(registryValue),scope=assertTarget(registry,targetId);
    return Object.values(registry.records.access||{})
      .filter(record=>record.scope===scope)
      .sort((a,b)=>a.registryId.localeCompare(b.registryId))
      .map(clone);
  }
  function effectiveVisibility(registryValue,targetId){
    const policies=policiesForScope(registryValue,targetId);
    if(!policies.length)return Object.freeze({visibility:'private',policyIds:[],defaulted:true});
    let visibility='public';
    for(const policy of policies){
      const v=clean(policy.visibility);
      if(!(v in ORDER))fail(`INVALID_VISIBILITY:${v}`);
      if(ORDER[v]<ORDER[visibility])visibility=v;
    }
    return Object.freeze({visibility,policyIds:policies.map(x=>x.registryId),defaulted:false});
  }
  function normalizeContext(contextValue){
    const context=contextValue&&typeof contextValue==='object'&&!Array.isArray(contextValue)?contextValue:{};
    return Object.freeze({
      private:context.private===true,
      course:context.course===true,
      organization:context.organization===true
    });
  }
  function evaluateReadAccess(registryValue,targetId,contextValue){
    const target=clean(targetId),policy=effectiveVisibility(registryValue,target),context=normalizeContext(contextValue);
    let allowed=false,reason='';
    if(policy.visibility==='public'){allowed=true;reason='public';}
    else if(policy.visibility==='organization'){allowed=context.organization;reason=allowed?'organization_entitled':'organization_required';}
    else if(policy.visibility==='course'){allowed=context.course;reason=allowed?'course_entitled':'course_required';}
    else {allowed=context.private;reason=allowed?'private_entitled':'private_required';}
    return Object.freeze({schema:SCHEMA,targetId:target,allowed,visibility:policy.visibility,reason,policyIds:policy.policyIds,defaulted:policy.defaulted});
  }
  function filterReadable(registryValue,registryIds,contextValue){
    if(!Array.isArray(registryIds))fail('REGISTRY_IDS_REQUIRED');
    const seen=new Set(),out=[];
    for(const raw of registryIds){
      const id=clean(raw);
      if(!id||seen.has(id))continue;
      seen.add(id);
      if(evaluateReadAccess(registryValue,id,contextValue).allowed)out.push(id);
    }
    return Object.freeze(out.sort());
  }
  return Object.freeze({schema:SCHEMA,policiesForScope,effectiveVisibility,evaluateReadAccess,filterReadable});
});
