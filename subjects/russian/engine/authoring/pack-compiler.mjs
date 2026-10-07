import {validateContentPack,buildPackManifest} from './content-pack-validator.mjs';
import {stableContentFingerprint} from '../content/promotion/promotion-registry.mjs';

const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

const COMMERCIAL_TRUST=new Set(['RU03_APPROVED','PUBLISHED_REFERENCE','CURATED','VERIFIED']);

export function compileContentPack(pack,{knownCompetencies=[],knownRefs=[],minimumEngineApi='1.0.0'}={}){
  const validation=validateContentPack(pack,{knownCompetencies,knownRefs});
  if(!validation.ok)throw new Error('Content pack validation failed: '+validation.errors.join('; '));

  const base=buildPackManifest(pack);
  const items=arr(pack.items);
  const itemIndex=items.map(item=>({
    id:clean(item.id),
    levelRange:clean(item.levelRange),
    competencies:arr(item.competencies).map(clean).filter(Boolean),
    semanticTargets:arr(item.semanticTargets).map(clean).filter(Boolean),
    linguisticRefs:arr(item.linguisticRefs).map(clean).filter(Boolean)
  }));
  const resourceRefs=[...new Set(items.flatMap(item=>arr(item.resources).map(x=>clean(x?.ref||x)).filter(Boolean)))].sort();
  const offlinePreloadRefs=[...new Set(items.flatMap(item=>arr(item.media).filter(x=>x?.offlinePreload===true).map(x=>clean(x?.ref||x?.id)).filter(Boolean)))].sort();
  const capabilities=[...new Set(items.flatMap(item=>arr(item.requiredCapabilities).map(clean).filter(Boolean)))].sort();
  const provenanceStatuses=items.map(item=>clean(item?.provenance?.status)).filter(Boolean);
  const commercialEligible=pack.commercial===true
    && items.every(item=>COMMERCIAL_TRUST.has(clean(item?.provenance?.status)))
    && items.flatMap(item=>arr(item.media)).every(media=>media?.commercialUseAllowed===true);

  const fingerprintSource={
    schemaVersion:pack.schemaVersion,
    packId:pack.packId,
    revision:pack.revision,
    commercial:pack.commercial===true,
    items:pack.items
  };
  const contentHash=stableContentFingerprint(fingerprintSource);

  return Object.freeze({
    schemaVersion:'RUSSIAN_ENGINE_COMPILED_PACK_V1',
    packId:base.packId,
    revision:base.revision,
    contentHash,
    minimumEngineApi:clean(minimumEngineApi)||'1.0.0',
    itemCount:base.itemCount,
    itemIndex,
    competencies:base.competencies,
    levelRanges:base.levelRanges,
    capabilities,
    resourceRefs,
    offlinePreloadRefs,
    provenanceSummary:{
      statuses:[...new Set(provenanceStatuses)].sort(),
      allCommerciallyTrusted:provenanceStatuses.length===items.length&&provenanceStatuses.every(x=>COMMERCIAL_TRUST.has(x))
    },
    commercialRequested:pack.commercial===true,
    commercialEligible,
    warnings:validation.warnings||[]
  });
}

export function createPackRegistry(){
  const byPack=new Map();
  const active=new Map();
  const events=[];

  function bucket(packId){
    const id=clean(packId);
    if(!id)throw new Error('packId required');
    if(!byPack.has(id))byPack.set(id,new Map());
    return byPack.get(id);
  }

  function install(manifest){
    if(manifest?.schemaVersion!=='RUSSIAN_ENGINE_COMPILED_PACK_V1')throw new Error('compiled pack manifest required');
    const revisions=bucket(manifest.packId);
    const existing=revisions.get(manifest.revision);
    if(existing){
      if(existing.contentHash!==manifest.contentHash)throw new Error('pack revision hash conflict '+manifest.packId+'@'+manifest.revision);
      return {installed:false,manifest:copy(existing)};
    }
    const row=copy(manifest);
    revisions.set(row.revision,row);
    events.push({type:'install',packId:row.packId,revision:row.revision,contentHash:row.contentHash});
    return {installed:true,manifest:copy(row)};
  }

  function activate(packId,revision){
    const revisions=bucket(packId);
    const row=revisions.get(clean(revision));
    if(!row)throw new Error('unknown pack revision '+clean(packId)+'@'+clean(revision));
    const previous=active.get(clean(packId))||null;
    active.set(clean(packId),row.revision);
    events.push({type:'activate',packId:clean(packId),revision:row.revision,previousRevision:previous});
    return copy(row);
  }

  function get(packId,revision){
    const row=bucket(packId).get(clean(revision));
    return row?copy(row):null;
  }

  function getActive(packId){
    const id=clean(packId),revision=active.get(id);
    return revision?get(id,revision):null;
  }

  function rollback(packId,revision){
    const current=active.get(clean(packId))||null;
    const row=activate(packId,revision);
    events.push({type:'rollback',packId:clean(packId),fromRevision:current,toRevision:row.revision});
    return row;
  }

  function revisions(packId){
    return [...bucket(packId).keys()].sort();
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_PACK_REGISTRY_V1',
    install,activate,get,getActive,rollback,revisions,
    events:()=>copy(events)
  });
}
