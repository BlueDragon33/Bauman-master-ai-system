const clean=value=>String(value??'').trim();
const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function createEntitlementPort({isAvailable,snapshot}={}){
  if(typeof isAvailable!=='function')throw new TypeError('entitlement port requires isAvailable()');
  if(typeof snapshot!=='function')throw new TypeError('entitlement port requires snapshot()');

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_ENTITLEMENT_PORT_V1',

    async isAvailable({profileId,id}={}){
      const profile=clean(profileId),target=clean(id);
      if(!profile||!target)throw new Error('profileId and id are required');
      const result=await isAvailable({profileId:profile,id:target});
      return result===true;
    },

    async snapshot(profileId){
      const id=clean(profileId);
      if(!id)throw new Error('profileId is required');
      const result=await snapshot(id);
      return copy({
        profileId:id,
        packs:Array.isArray(result?.packs)?result.packs.map(clean).filter(Boolean):[],
        capabilities:Array.isArray(result?.capabilities)?result.capabilities.map(clean).filter(Boolean):[],
        source:clean(result?.source)||'platform-entitlement-adapter'
      });
    }
  });
}
