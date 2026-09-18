'use strict';
(function(root,factory){
  let integrityApi=null;
  if(typeof module==='object'&&module.exports){
    integrityApi=require('../content-registry/asset-integrity.js');
    module.exports=factory(()=>integrityApi);
  }else{
    root.BaumanRuntimeDeliveryExecutor=factory(()=>root.BaumanAssetIntegrity);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(integrityProvider){
  const SCHEMA='BAUMAN_RUNTIME_DELIVERY_EXECUTION_V1';
  const PLAN_SCHEMA='BAUMAN_RUNTIME_DELIVERY_PLAN_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const fail=code=>{throw new Error(`RUNTIME_DELIVERY_EXECUTOR_${code}`)};

  function integrity(){
    const api=integrityProvider();
    if(!api||typeof api.verify!=='function')fail('INTEGRITY_RUNTIME_MISSING');
    return api;
  }
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))deepFreeze(child);
    return value;
  }
  function summary(value){return deepFreeze(clone(value));}
  function normalizePlan(value){
    const plan=value&&typeof value==='object'&&!Array.isArray(value)?clone(value):null;
    if(!plan||plan.schema!==PLAN_SCHEMA)fail('INVALID_PLAN_SCHEMA');
    if(plan.status!=='ready')fail('PLAN_NOT_READY');
    if(!clean(plan.adapterId))fail('ADAPTER_ID_REQUIRED');
    if(plan.integrity?.verificationRequired!==true||plan.integrity?.algorithm!=='sha256'||!/^[0-9a-f]{64}$/.test(clean(plan.integrity?.digest))||!Number.isInteger(plan.integrity?.byteLength)||plan.integrity.byteLength<0)fail('INVALID_INTEGRITY_REQUIREMENT');
    return deepFreeze(plan);
  }
  function copyPayload(value){
    if(typeof value==='string')return value;
    if(value instanceof ArrayBuffer)return value.slice(0);
    if(ArrayBuffer.isView(value))return new Uint8Array(value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength));
    return null;
  }
  function payloadFromAdapter(value){
    if(value&&typeof value==='object'&&!ArrayBuffer.isView(value)&&!(value instanceof ArrayBuffer)&&Object.prototype.hasOwnProperty.call(value,'bytes'))return value.bytes;
    return value;
  }
  function blocked(plan,reason,extra={}){
    return summary({
      schema:SCHEMA,
      status:'blocked',
      reason,
      adapterId:plan.adapterId,
      assetRegistryId:plan.identity?.assetRegistryId||null,
      ...extra
    });
  }
  async function execute(planValue,adapterMapValue,consumer){
    const plan=normalizePlan(planValue);
    const adapters=adapterMapValue&&typeof adapterMapValue==='object'&&!Array.isArray(adapterMapValue)?adapterMapValue:{};
    const adapter=adapters[plan.adapterId];
    if(typeof adapter!=='function')return blocked(plan,'adapter_missing');
    let raw;
    try{raw=await adapter(plan)}catch{return blocked(plan,'adapter_error')}
    const payload=copyPayload(payloadFromAdapter(raw));
    if(payload===null)return blocked(plan,'adapter_invalid_payload');
    const verification=await integrity().verify(payload,{
      algorithm:'sha256',
      digest:plan.integrity.digest,
      byteLength:plan.integrity.byteLength
    });
    if(!verification.ok){
      return blocked(plan,'integrity_mismatch',{
        verification:Object.freeze({
          reason:verification.reason,
          expected:verification.expected,
          actual:verification.actual
        })
      });
    }
    const verifiedContext=summary({
      schema:SCHEMA,
      status:'verified',
      adapterId:plan.adapterId,
      assetRegistryId:plan.identity?.assetRegistryId||null,
      canonicalEntityId:plan.identity?.canonicalEntityId||null,
      media:plan.media||null,
      integrity:Object.freeze({
        algorithm:'sha256',
        digest:verification.actual.digest,
        byteLength:verification.actual.byteLength
      })
    });
    let consumed=false;
    if(typeof consumer==='function'){
      const consumerPayload=copyPayload(payload);
      await consumer(consumerPayload,verifiedContext);
      consumed=true;
    }
    return summary({...verifiedContext,consumed});
  }
  return Object.freeze({schema:SCHEMA,planSchema:PLAN_SCHEMA,execute});
});
