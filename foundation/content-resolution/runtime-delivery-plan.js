'use strict';
(function(root,factory){
  let registryApi=null;
  if(typeof module==='object'&&module.exports){
    registryApi=require('../content-registry/content-asset-registry.js');
    module.exports=factory(()=>registryApi);
  }else{
    root.BaumanRuntimeDeliveryPlan=factory(()=>root.BaumanContentAssetRegistry);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(registryProvider){
  const SCHEMA='BAUMAN_RUNTIME_DELIVERY_PLAN_V1';
  const DESCRIPTOR_SCHEMA='BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`RUNTIME_DELIVERY_PLAN_${code}`)};
  function registry(){
    const api=registryProvider();
    if(!api||typeof api.normalizeRegistry!=='function'||typeof api.findRecord!=='function'||typeof api.validateLocator!=='function')fail('REGISTRY_RUNTIME_MISSING');
    return api;
  }
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))deepFreeze(child);
    return value;
  }
  function linkedLocator(asset,locator){
    return (Array.isArray(asset?.locators)?asset.locators:[]).some(item=>clean(item?.kind)===clean(locator?.kind)&&clean(item?.value)===clean(locator?.value));
  }
  function adapterFor(transport,locator){
    if(transport==='package_relative'&&locator.kind==='repository_relative')return {adapterId:'package-relative-resource',requiresNetwork:false};
    if(transport==='https'&&locator.kind==='https_url'){
      let origin='';
      try{origin=new URL(locator.value).origin}catch{fail('INVALID_HTTPS_URL')}
      return {adapterId:'https-resource',requiresNetwork:true,origin};
    }
    if(transport==='content_addressed_provider'&&locator.kind==='content_hash')return {adapterId:'content-hash-resource',requiresNetwork:'provider_defined',provider:'content_hash'};
    fail('TRANSPORT_LOCATOR_MISMATCH');
  }
  function buildPlan(registryValue,descriptorValue){
    const descriptor=descriptorValue&&typeof descriptorValue==='object'&&!Array.isArray(descriptorValue)?clone(descriptorValue):null;
    if(!descriptor||descriptor.schema!==DESCRIPTOR_SCHEMA)fail('INVALID_DESCRIPTOR_SCHEMA');
    if(descriptor.status!=='resolved')fail('DESCRIPTOR_NOT_RESOLVED');
    const reg=registry().normalizeRegistry(registryValue);
    const asset=registry().findRecord(reg,clean(descriptor.assetRegistryId));
    if(!asset)fail('ASSET_NOT_FOUND');
    if(clean(asset.registryId)!==clean(descriptor.assetRegistryId))fail('ASSET_ID_MISMATCH');
    if(clean(asset.canonicalEntityId)!==clean(descriptor.canonicalEntityId))fail('CANONICAL_ID_MISMATCH');
    if(clean(asset.mediaType)!==clean(descriptor.mediaType)||clean(asset.assetType)!==clean(descriptor.assetType))fail('ASSET_METADATA_MISMATCH');
    if(clean(asset.checksumId)!==clean(descriptor.checksumId))fail('CHECKSUM_REFERENCE_MISMATCH');
    const checksum=registry().findRecord(reg,asset.checksumId);
    if(!checksum||checksum.algorithm!=='sha256'||!/^[0-9a-f]{64}$/.test(clean(checksum.digest))||!Number.isInteger(checksum.byteLength)||checksum.byteLength<0)fail('INVALID_CHECKSUM_RECORD');
    let locator;
    try{locator=registry().validateLocator(descriptor.locator)}catch{fail('INVALID_LOCATOR')}
    if(!linkedLocator(asset,locator))fail('LOCATOR_NOT_LINKED_TO_ASSET');
    const adapter=adapterFor(clean(descriptor.transport),locator);
    if(locator.kind==='content_hash'&&locator.value!==`sha256:${checksum.digest}`)fail('CONTENT_HASH_CHECKSUM_MISMATCH');
    return deepFreeze({
      schema:SCHEMA,
      status:'ready',
      adapterId:adapter.adapterId,
      transport:descriptor.transport,
      requiresNetwork:adapter.requiresNetwork,
      provider:adapter.provider||null,
      origin:adapter.origin||null,
      resource:Object.freeze({kind:locator.kind,value:locator.value}),
      integrity:Object.freeze({
        verificationRequired:true,
        checksumId:asset.checksumId,
        algorithm:'sha256',
        digest:checksum.digest,
        byteLength:checksum.byteLength
      }),
      identity:Object.freeze({
        targetRegistryId:descriptor.targetRegistryId,
        contentRegistryId:descriptor.contentRegistryId||null,
        assetRegistryId:asset.registryId,
        canonicalEntityId:asset.canonicalEntityId
      }),
      media:Object.freeze({mediaType:asset.mediaType,assetType:asset.assetType}),
      mode:descriptor.mode,
      access:clone(descriptor.access||{})
    });
  }
  return Object.freeze({schema:SCHEMA,descriptorSchema:DESCRIPTOR_SCHEMA,buildPlan});
});
