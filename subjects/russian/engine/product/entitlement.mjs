const arr=value=>Array.isArray(value)?value:[];
const clean=value=>String(value??'').trim();

export function createEntitlementView({profileId='local-default',grants=[]}={}){
  const id=clean(profileId)||'local-default';
  const granted=new Set(arr(grants).map(clean).filter(Boolean));
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_ENTITLEMENT_VIEW_V1',
    profileId:id,
    has(entitlementId){return granted.has(clean(entitlementId));},
    require(entitlementId){
      const key=clean(entitlementId);
      return granted.has(key)
        ? {available:true,id:key}
        : {available:false,id:key,reason:'not-entitled'};
    },
    list(){return [...granted].sort();}
  });
}

export function validateEntitlementBoundary(record){
  const errors=[];
  if(!clean(record?.profileId))errors.push('profileId required');
  if(clean(record?.paymentCustomerId))errors.push('paymentCustomerId cannot be canonical Engine identity');
  if(clean(record?.billingProvider))errors.push('billingProvider must stay outside Engine entitlement semantics');
  return {ok:errors.length===0,errors};
}
