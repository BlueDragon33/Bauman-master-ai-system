const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

function versionTuple(v){return clean(v).split('.').map(x=>Number(x)||0).slice(0,3);}
function gte(a,b){const A=versionTuple(a),B=versionTuple(b);for(let i=0;i<3;i++){if((A[i]||0)>(B[i]||0))return true;if((A[i]||0)<(B[i]||0))return false;}return true;}

export function resolvePackItem({registry,packId,itemId,engineApiVersion='1.0.0'}={}){
  if(!registry?.getActive)throw new Error('pack registry required');
  const manifest=registry.getActive(packId);
  if(!manifest)throw new Error('active pack revision required');
  if(!gte(engineApiVersion,manifest.minimumEngineApi))throw new Error('engine api incompatible');
  const item=(manifest.itemIndex||[]).find(x=>clean(x.id)===clean(itemId));
  if(!item)throw new Error('item not found in active pack revision');
  return {
    schema:'RUSSIAN_ENGINE_PACK_RESOLUTION_V1',
    packId:manifest.packId,
    revision:manifest.revision,
    contentHash:manifest.contentHash,
    item:copy(item),
    capabilities:[...(manifest.capabilities||[])],
    offlinePreloadRefs:[...(manifest.offlinePreloadRefs||[])]
  };
}
