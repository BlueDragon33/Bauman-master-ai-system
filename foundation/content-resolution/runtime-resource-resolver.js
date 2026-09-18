'use strict';
(function(root,factory){
  let registryApi=null,accessApi=null;
  if(typeof module==='object'&&module.exports){
    registryApi=require('../content-registry/content-asset-registry.js');
    accessApi=require('../content-registry/access-policy.js');
    module.exports=factory(()=>registryApi,()=>accessApi);
  }else{
    root.BaumanRuntimeResourceResolver=factory(
      ()=>root.BaumanContentAssetRegistry,
      ()=>root.BaumanAccessPolicy
    );
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(registryProvider,accessProvider){
  const SCHEMA='BAUMAN_RUNTIME_RESOURCE_RESOLVER_V1';
  const DESCRIPTOR_SCHEMA='BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1';
  const MODES=Object.freeze({
    learner_runtime:Object.freeze(new Set(['verified','active'])),
    audit_historical:Object.freeze(new Set(['verified','active','superseded']))
  });
  const LOCATOR_ORDER=Object.freeze(['repository_relative','content_hash','https_url']);
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`RUNTIME_RESOURCE_RESOLVER_${code}`)};

  function registry(){
    const api=registryProvider();
    if(!api||typeof api.normalizeRegistry!=='function'||typeof api.findRecord!=='function'||typeof api.parseRegistryId!=='function'||typeof api.validateLocator!=='function')fail('REGISTRY_RUNTIME_MISSING');
    return api;
  }
  function access(){
    const api=accessProvider();
    if(!api||typeof api.evaluateReadAccess!=='function')fail('ACCESS_POLICY_MISSING');
    return api;
  }
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))deepFreeze(child);
    return value;
  }
  function descriptor(value){return deepFreeze({schema:DESCRIPTOR_SCHEMA,...clone(value)});}
  function normalizeRequest(value){
    const request=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    const targetRegistryId=clean(request.targetRegistryId);
    if(!targetRegistryId)fail('TARGET_REQUIRED');
    const mode=clean(request.mode);
    if(!MODES[mode])fail('INVALID_MODE');
    const context=request.accessContext&&typeof request.accessContext==='object'&&!Array.isArray(request.accessContext)?request.accessContext:{};
    const rawPolicy=request.runtimePolicy&&typeof request.runtimePolicy==='object'&&!Array.isArray(request.runtimePolicy)?request.runtimePolicy:{};
    const availableProviders=[...new Set((Array.isArray(rawPolicy.availableProviders)?rawPolicy.availableProviders:[]).map(clean).filter(Boolean))].sort();
    const allowedHttpsOrigins=[...new Set((Array.isArray(rawPolicy.allowedHttpsOrigins)?rawPolicy.allowedHttpsOrigins:[]).map(clean).filter(Boolean).map(value=>{
      try{const url=new URL(value);return url.protocol==='https:'&&url.origin===value?url.origin:''}catch{return ''}
    }).filter(Boolean))].sort();
    const runtimePolicy=Object.freeze({
      allowRepositoryRelative:rawPolicy.allowRepositoryRelative===true,
      allowHttps:rawPolicy.allowHttps===true,
      allowedHttpsOrigins:Object.freeze(allowedHttpsOrigins),
      availableProviders:Object.freeze(availableProviders)
    });
    return Object.freeze({
      targetRegistryId,
      mode,
      accessContext:Object.freeze({
        private:context.private===true,
        course:context.course===true,
        organization:context.organization===true
      }),
      runtimePolicy,
      preferredAssetId:clean(request.preferredAssetId)
    });
  }
  function accessSummary(decision){
    return Object.freeze({
      allowed:decision.allowed===true,
      visibility:clean(decision.visibility),
      reason:clean(decision.reason),
      policyIds:Object.freeze([...(decision.policyIds||[])].sort()),
      defaulted:decision.defaulted===true
    });
  }
  function targetAccess(registryValue,targetId,request){
    return access().evaluateReadAccess(registryValue,targetId,request.accessContext);
  }
  function allowedAssetState(asset,mode){
    return MODES[mode].has(clean(asset?.state));
  }
  function validateRepositoryLocator(locator){
    const value=clean(locator?.value);
    if(/[?#]/.test(value))return false;
    try{registry().validateLocator(locator);return true}catch{return false}
  }
  function locatorPlan(asset,request){
    const normalized=[];
    for(const raw of Array.isArray(asset?.locators)?asset.locators:[]){
      let locator;
      try{locator=registry().validateLocator(raw)}catch{continue}
      normalized.push(locator);
    }
    const byKind=kind=>normalized.filter(x=>x.kind===kind).sort((a,b)=>a.value.localeCompare(b.value));
    for(const kind of LOCATOR_ORDER){
      if(kind==='repository_relative'){
        if(!request.runtimePolicy.allowRepositoryRelative)continue;
        const items=byKind(kind).filter(validateRepositoryLocator);
        if(items.length)return Object.freeze({status:'resolved',locator:items[0],transport:'package_relative'});
      }
      if(kind==='content_hash'){
        const items=byKind(kind);
        if(!items.length)continue;
        if(request.runtimePolicy.availableProviders.includes('content_hash')){
          return Object.freeze({status:'resolved',locator:items[0],transport:'content_addressed_provider'});
        }
      }
      if(kind==='https_url'){
        if(!request.runtimePolicy.allowHttps)continue;
        const items=byKind(kind).filter(item=>{
          try{return request.runtimePolicy.allowedHttpsOrigins.includes(new URL(item.value).origin)}catch{return false}
        });
        if(items.length)return Object.freeze({status:'resolved',locator:items[0],transport:'https'});
      }
    }
    if(byKind('content_hash').length&&!request.runtimePolicy.availableProviders.includes('content_hash')){
      return Object.freeze({status:'provider_required',provider:'content_hash'});
    }
    return Object.freeze({status:'blocked',reason:'no_allowed_locator'});
  }
  function inspectAsset(registryValue,assetId,request,targetDecision){
    const asset=registry().findRecord(registryValue,assetId);
    if(!asset)return descriptor({status:'not_found',targetRegistryId:request.targetRegistryId,assetRegistryId:assetId,reason:'asset_not_found',mode:request.mode});
    if(!allowedAssetState(asset,request.mode)){
      return descriptor({status:'blocked',targetRegistryId:request.targetRegistryId,assetRegistryId:assetId,reason:`asset_state_${clean(asset.state)||'unknown'}`,mode:request.mode});
    }
    if(!clean(asset.checksumId)||!registry().findRecord(registryValue,asset.checksumId)){
      return descriptor({status:'blocked',targetRegistryId:request.targetRegistryId,assetRegistryId:assetId,reason:'checksum_missing',mode:request.mode});
    }
    const assetDecision=targetDecision&&assetId===request.targetRegistryId?targetDecision:targetAccess(registryValue,assetId,request);
    if(!assetDecision.allowed){
      return descriptor({
        status:'blocked',
        targetRegistryId:request.targetRegistryId,
        assetRegistryId:assetId,
        reason:'asset_access_denied',
        mode:request.mode,
        access:Object.freeze({asset:accessSummary(assetDecision)})
      });
    }
    const planned=locatorPlan(asset,request);
    if(planned.status==='provider_required'){
      return descriptor({
        status:'provider_required',
        targetRegistryId:request.targetRegistryId,
        assetRegistryId:assetId,
        provider:planned.provider,
        reason:'content_hash_provider_required',
        mode:request.mode,
        access:Object.freeze({asset:accessSummary(assetDecision)})
      });
    }
    if(planned.status!=='resolved'){
      return descriptor({
        status:'blocked',
        targetRegistryId:request.targetRegistryId,
        assetRegistryId:assetId,
        reason:planned.reason||'no_allowed_locator',
        mode:request.mode,
        access:Object.freeze({asset:accessSummary(assetDecision)})
      });
    }
    return descriptor({
      status:'resolved',
      targetRegistryId:request.targetRegistryId,
      assetRegistryId:asset.registryId,
      canonicalEntityId:asset.canonicalEntityId,
      mediaType:asset.mediaType,
      assetType:asset.assetType,
      checksumId:asset.checksumId,
      locator:Object.freeze({...planned.locator}),
      transport:planned.transport,
      mode:request.mode,
      access:Object.freeze({asset:accessSummary(assetDecision)})
    });
  }
  function attachTargetAccess(result,targetDecision,contentId){
    const value=clone(result);
    value.access=value.access&&typeof value.access==='object'?value.access:{};
    value.access.target=accessSummary(targetDecision);
    if(contentId)value.contentRegistryId=contentId;
    return descriptor(value);
  }
  function resolve(registryValue,requestValue){
    const reg=registry().normalizeRegistry(registryValue);
    const request=normalizeRequest(requestValue);
    let parsed;
    try{parsed=registry().parseRegistryId(request.targetRegistryId)}
    catch{return descriptor({status:'not_found',targetRegistryId:request.targetRegistryId,reason:'invalid_target_id',mode:request.mode})}
    if(parsed.recordType!=='asset'&&parsed.recordType!=='content'){
      return descriptor({status:'blocked',targetRegistryId:request.targetRegistryId,reason:'unsupported_target_type',mode:request.mode});
    }
    const target=registry().findRecord(reg,request.targetRegistryId);
    if(!target)return descriptor({status:'not_found',targetRegistryId:request.targetRegistryId,reason:'target_not_found',mode:request.mode});
    const decision=targetAccess(reg,request.targetRegistryId,request);
    if(!decision.allowed){
      return descriptor({
        status:'blocked',
        targetRegistryId:request.targetRegistryId,
        reason:'target_access_denied',
        mode:request.mode,
        access:Object.freeze({target:accessSummary(decision)})
      });
    }
    if(parsed.recordType==='asset'){
      return attachTargetAccess(inspectAsset(reg,target.registryId,request,decision),decision,null);
    }

    const linked=[...new Set((Array.isArray(target.assetIds)?target.assetIds:[]).map(clean).filter(Boolean))].sort();
    if(request.preferredAssetId){
      if(!linked.includes(request.preferredAssetId)){
        return descriptor({
          status:'blocked',
          targetRegistryId:request.targetRegistryId,
          reason:'preferred_asset_not_linked',
          mode:request.mode,
          access:Object.freeze({target:accessSummary(decision)})
        });
      }
      return attachTargetAccess(inspectAsset(reg,request.preferredAssetId,request,null),decision,target.registryId);
    }
    if(!linked.length){
      return descriptor({
        status:'not_found',
        targetRegistryId:request.targetRegistryId,
        reason:'content_has_no_assets',
        mode:request.mode,
        access:Object.freeze({target:accessSummary(decision)})
      });
    }
    const results=linked.map(id=>inspectAsset(reg,id,request,null));
    const resolved=results.filter(x=>x.status==='resolved');
    if(resolved.length===1)return attachTargetAccess(resolved[0],decision,target.registryId);
    if(resolved.length>1){
      return descriptor({
        status:'ambiguous',
        targetRegistryId:request.targetRegistryId,
        contentRegistryId:target.registryId,
        reason:'multiple_viable_assets',
        candidateAssetIds:Object.freeze(resolved.map(x=>x.assetRegistryId).sort()),
        candidateCount:resolved.length,
        mode:request.mode,
        access:Object.freeze({target:accessSummary(decision)})
      });
    }
    const provider=results.filter(x=>x.status==='provider_required');
    if(provider.length){
      return descriptor({
        status:'provider_required',
        targetRegistryId:request.targetRegistryId,
        contentRegistryId:target.registryId,
        provider:'content_hash',
        reason:'content_hash_provider_required',
        candidateCount:provider.length,
        mode:request.mode,
        access:Object.freeze({target:accessSummary(decision)})
      });
    }
    const denied=results.filter(x=>x.reason==='asset_access_denied');
    return descriptor({
      status:'blocked',
      targetRegistryId:request.targetRegistryId,
      contentRegistryId:target.registryId,
      reason:denied.length?'no_readable_asset':'no_eligible_asset',
      mode:request.mode,
      access:Object.freeze({target:accessSummary(decision)})
    });
  }
  return Object.freeze({
    schema:SCHEMA,
    descriptorSchema:DESCRIPTOR_SCHEMA,
    modes:Object.freeze(Object.keys(MODES)),
    locatorOrder:LOCATOR_ORDER,
    normalizeRequest,
    resolve
  });
});
