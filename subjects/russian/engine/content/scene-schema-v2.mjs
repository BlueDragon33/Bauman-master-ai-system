const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];

export function validateGroundedSceneV2(scene){
  const errors=[];
  if(!clean(scene?.sceneId))errors.push('sceneId required');
  if(!clean(scene?.revision))errors.push('revision required');
  if(scene?.status!=='FIXTURE_NONCANONICAL_PENDING_RU03'&&!['CURATED','VERIFIED'].includes(scene?.status))errors.push('invalid status');
  if(!clean(scene?.setting))errors.push('setting required');
  if(!arr(scene?.targetCompetencies).length)errors.push('targetCompetencies required');
  if(!arr(scene?.semanticTargets).length)errors.push('semanticTargets required');
  if(scene?.stimulus?.language!=='ru'||!clean(scene?.stimulus?.audioText))errors.push('Russian stimulus required');
  const objects=arr(scene?.world?.objects);
  if(objects.length<2)errors.push('at least two world objects required');
  const ids=new Set();
  for(const item of objects){
    if(!clean(item?.id))errors.push('object id required');
    if(ids.has(item?.id))errors.push('duplicate object id '+item.id);
    ids.add(item?.id);
    if(!clean(item?.visual?.value))errors.push('object visual value required');
  }
  if(scene?.expectedAction?.kind!=='select-object')errors.push('select-object action required');
  if(!ids.has(scene?.expectedAction?.objectId))errors.push('expected object missing from world');
  if(!clean(scene?.transferGroup))errors.push('transferGroup required');
  if(scene?.supportPolicy?.translationDefault!=='hidden')errors.push('translation must be hidden by default');
  if(!arr(scene?.requiredCapabilities).length)errors.push('requiredCapabilities required');
  return {ok:errors.length===0,errors};
}

export function validateGroundedSceneCatalogV2(catalog){
  const scenes=arr(catalog?.scenes),errors=[];
  const ids=new Set();
  for(const scene of scenes){
    const result=validateGroundedSceneV2(scene);
    if(ids.has(scene?.sceneId))errors.push('duplicate sceneId '+scene.sceneId);
    ids.add(scene?.sceneId);
    for(const e of result.errors)errors.push((scene?.sceneId||'unknown')+': '+e);
  }
  return {
    ok:errors.length===0,
    errors,
    sceneCount:scenes.length,
    settings:[...new Set(scenes.map(x=>clean(x.setting)).filter(Boolean))].sort()
  };
}
