const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function selectNextGroundedScene({
  scenes=[],
  completedSceneIds=[],
  recentObservations=[],
  desiredSetting='',
  capabilities={}
}={}){
  const done=new Set(arr(completedSceneIds).map(clean));
  const available=arr(scenes).filter(scene=>
    arr(scene?.requiredCapabilities).every(cap=>capabilities?.[cap]===true)
  );
  if(!available.length)return {scene:null,reason:'no-capability-compatible-scene'};

  const observations=arr(recentObservations);
  const last=observations[observations.length-1]||null;
  if(last&&last.providerFailure!==true){
    const source=available.find(x=>x.sceneId===last.sceneId);
    if(source&&(last.success===false||Number(last.supportLevel)>=4)){
      const target=arr(source.semanticTargets)[0];
      const remediation=available
        .filter(x=>x.sceneId!==source.sceneId&&arr(x.semanticTargets).includes(target))
        .sort((a,b)=>a.sceneId.localeCompare(b.sceneId))[0]||source;
      return {scene:copy(remediation),reason:'remediation',fromSceneId:source.sceneId};
    }
    if(source&&last.success===true&&Number(last.supportLevel)===0){
      const transfer=available
        .filter(x=>x.sceneId!==source.sceneId&&x.transferGroup===source.transferGroup&&!done.has(x.sceneId))
        .sort((a,b)=>a.sceneId.localeCompare(b.sceneId))[0];
      if(transfer)return {scene:copy(transfer),reason:'unseen-transfer',fromSceneId:source.sceneId};
    }
  }

  const setting=clean(desiredSetting);
  const candidates=available
    .filter(x=>!done.has(x.sceneId))
    .filter(x=>!setting||x.setting===setting)
    .sort((a,b)=>a.sceneId.localeCompare(b.sceneId));
  if(candidates.length)return {scene:copy(candidates[0]),reason:setting?'new-in-setting':'new-content'};

  const fallback=available.slice().sort((a,b)=>a.sceneId.localeCompare(b.sceneId))[0];
  return {scene:copy(fallback),reason:'catalog-cycle'};
}
