const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];

const CYRILLIC=/[А-Яа-яЁё]/;
const TRANSLATION_KEYS=new Set(['translation','translationVi','translationEn','vietnamese','englishTranslation']);

function scanTranslationKeys(value,path='root',hits=[]){
  if(!value||typeof value!=='object')return hits;
  for(const [key,val] of Object.entries(value)){
    const next=path+'.'+key;
    if(TRANSLATION_KEYS.has(key))hits.push(next);
    if(val&&typeof val==='object')scanTranslationKeys(val,next,hits);
  }
  return hits;
}

export function preflightSceneCatalog(catalog){
  const scenes=arr(catalog?.scenes);
  const errors=[];
  const warnings=[];
  const surfaces=new Map();

  for(const scene of scenes){
    const id=clean(scene?.sceneId)||'unknown';
    const text=clean(scene?.stimulus?.audioText);
    const objects=arr(scene?.world?.objects);
    const objectIds=new Set(objects.map(x=>clean(x?.id)).filter(Boolean));
    const semanticTargets=arr(scene?.semanticTargets).map(clean).filter(Boolean);
    const relation=clean(scene?.expectedAction?.semanticRelation);

    if(scene?.stimulus?.language!=='ru')errors.push(id+': language must be ru');
    if(!text)errors.push(id+': Russian stimulus required');
    else if(!CYRILLIC.test(text))errors.push(id+': Cyrillic stimulus required');
    if(!clean(scene?.revision))errors.push(id+': revision required');
    if(!clean(scene?.status))errors.push(id+': status required');
    if(!objectIds.has(clean(scene?.expectedAction?.objectId)))errors.push(id+': expected object missing');
    if(relation&&!semanticTargets.includes(relation))errors.push(id+': semantic relation not declared in semanticTargets');
    for(const item of objects){
      if(!clean(item?.accessibilityLabel))errors.push(id+': object '+clean(item?.id)+' missing accessibilityLabel');
    }
    const translationHits=scanTranslationKeys(scene);
    for(const hit of translationHits)errors.push(id+': translation leakage '+hit);
    if(scene?.canonical===true||scene?.status==='RU03_APPROVED'){
      errors.push(id+': fixture catalog cannot self-claim canonical approval');
    }

    const signature=JSON.stringify({
      expectedObjectId:clean(scene?.expectedAction?.objectId),
      semanticTargets:[...semanticTargets].sort()
    });
    if(text){
      if(!surfaces.has(text))surfaces.set(text,[]);
      surfaces.get(text).push({id,signature});
    }

    warnings.push(id+': linguistic correctness, naturalness and pronunciation remain HUMAN_REVIEW_REQUIRED');
  }

  for(const [text,rows] of surfaces){
    const signatures=new Set(rows.map(x=>x.signature));
    if(signatures.size>1){
      errors.push('duplicate Russian surface with conflicting semantics: '+text+' ['+rows.map(x=>x.id).join(',')+']');
    }
  }

  return {
    schema:'RUSSIAN_ENGINE_LINGUISTIC_PREFLIGHT_V1',
    ok:errors.length===0,
    errors,
    warnings,
    sceneCount:scenes.length,
    linguisticCorrectness:'REVIEW_REQUIRED'
  };
}
