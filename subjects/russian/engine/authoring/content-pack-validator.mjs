const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];

export function validateContentPack(pack,{knownCompetencies=[],knownRefs=[]}={}){
  const errors=[];
  const warnings=[];
  const competencySet=new Set(arr(knownCompetencies));
  const refSet=new Set(arr(knownRefs));
  if(pack?.schemaVersion!=='RUSSIAN_ENGINE_CONTENT_PACK_V1')errors.push('invalid schemaVersion');
  if(!clean(pack?.packId))errors.push('packId required');
  if(!clean(pack?.revision))errors.push('revision required');
  if(!arr(pack?.items).length)errors.push('items required');

  const ids=new Set();
  for(const item of arr(pack?.items)){
    if(!clean(item?.id))errors.push('item id required');
    if(ids.has(item?.id))errors.push('duplicate item id '+item.id);
    ids.add(item?.id);

    for(const comp of arr(item?.competencies)){
      if(competencySet.size&&!competencySet.has(comp))errors.push(item.id+' unknown competency '+comp);
    }
    for(const ref of arr(item?.linguisticRefs)){
      if(refSet.size&&!refSet.has(ref))errors.push(item.id+' unknown linguistic ref '+ref);
    }

    if(item?.translationPolicy?.defaultVisible===true)errors.push(item.id+' translation visible by default');
    if(!clean(item?.provenance?.status))errors.push(item.id+' provenance status required');
    if(item?.provenance?.status==='GENERATED_UNREVIEWED'&&item?.canonical===true)errors.push(item.id+' generated unreviewed item cannot be canonical');

    for(const media of arr(item?.media)){
      if(!clean(media?.id))errors.push(item.id+' media id required');
      if(pack?.commercial===true&&media?.commercialUseAllowed!==true)errors.push(item.id+' media '+clean(media?.id)+' lacks commercial-use permission');
      if(!clean(media?.accessibilityFallback))warnings.push(item.id+' media '+clean(media?.id)+' missing accessibility fallback');
    }

    if(item?.scenario&&item.scenario.startNode){
      const nodes=item.scenario.nodes||{};
      if(!nodes[item.scenario.startNode])errors.push(item.id+' scenario startNode missing');
      for(const [nodeId,node] of Object.entries(nodes)){
        for(const next of arr(node?.next)){
          if(!nodes[next])errors.push(item.id+' scenario node '+nodeId+' points to missing '+next);
        }
      }
    }
  }

  return {ok:errors.length===0,errors,warnings,itemCount:arr(pack?.items).length};
}

export function buildPackManifest(pack){
  const items=arr(pack?.items);
  return {
    schemaVersion:'RUSSIAN_ENGINE_PACK_MANIFEST_V1',
    packId:clean(pack?.packId),
    revision:clean(pack?.revision),
    commercial:pack?.commercial===true,
    itemCount:items.length,
    levelRanges:[...new Set(items.map(x=>clean(x?.levelRange)).filter(Boolean))],
    competencies:[...new Set(items.flatMap(x=>arr(x?.competencies)))].sort()
  };
}
