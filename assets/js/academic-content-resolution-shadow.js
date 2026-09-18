'use strict';
(function(root){
  const STATUS_SCHEMA='BAUMAN_ACADEMIC_CONTENT_RESOLUTION_SHADOW_V1';
  const ENABLE_PARAM='contentResolutionShadow';
  const ENABLE_VALUE='1';
  const RESOURCE_MAP=Object.freeze({
    curriculum:Object.freeze({id:'official-curriculum',authoritativeGlobal:'BAUMAN_CURRICULUM_2026'}),
    prerequisite:Object.freeze({id:'prerequisite-registry',authoritativeGlobal:'BAUMAN_PREREQ_2026'}),
    manifest:Object.freeze({id:'prerequisite-pack-manifest',authoritativeGlobal:null})
  });
  const freeze=value=>{
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))freeze(child);
    return value;
  };
  const publish=value=>{
    root.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS=freeze({
      schema:STATUS_SCHEMA,
      enabled:false,
      ready:false,
      passed:null,
      registryMode:null,
      resources:[],
      error:null,
      ...value
    });
    try{root.dispatchEvent(new CustomEvent('bauman:content-resolution-shadow-status',{detail:root.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS}))}catch{}
    return root.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS;
  };
  function enabled(){
    try{return new URLSearchParams(root.location?.search||'').get(ENABLE_PARAM)===ENABLE_VALUE}catch{return false}
  }
  async function waitForAcademicReady(timeoutMs=30000){
    const started=Date.now();
    while(Date.now()-started<timeoutMs){
      const packStatus=root.BAUMAN_PREREQ_PACKS_2026_STATUS;
      if(root.BAUMAN_CURRICULUM_2026&&root.BAUMAN_PREREQ_2026&&packStatus?.ready===true)return packStatus;
      await new Promise(resolve=>setTimeout(resolve,25));
    }
    throw new Error('SHADOW_ACADEMIC_READY_TIMEOUT');
  }
  async function run(){
    if(!enabled()){
      publish({enabled:false,ready:true,passed:null,registryMode:null});
      return;
    }
    publish({enabled:true,ready:false,passed:null,registryMode:'pinned_candidate'});
    try{
      const packStatus=await waitForAcademicReady();
      const authoritativeBefore={
        curriculum:JSON.stringify(root.BAUMAN_CURRICULUM_2026),
        prerequisite:JSON.stringify(root.BAUMAN_PREREQ_2026),
        packStatus:JSON.stringify(packStatus)
      };
      const loader=root.BaumanAcademicVerifiedContentLoader;
      if(!loader||typeof loader.loadCore!=='function')throw new Error('SHADOW_VERIFIED_LOADER_MISSING');
      const verified=await loader.loadCore({baseUrl:root.document.baseURI});
      if(verified?.status!=='verified'||verified.registryMode!=='pinned_candidate')throw new Error('SHADOW_VERIFIED_LOADER_RESULT');
      const results=verified.verification.map(item=>{
        const map=RESOURCE_MAP[item.key];
        if(!map)throw new Error(`SHADOW_UNKNOWN_VERIFIED_RESOURCE:${item.key}`);
        const authoritativeParity=map.authoritativeGlobal
          ? JSON.stringify(verified.data[item.key])===JSON.stringify(root[map.authoritativeGlobal])
          : true;
        return freeze({
          id:map.id,
          contentRegistryId:item.contentRegistryId,
          assetRegistryId:item.assetRegistryId,
          path:item.path,
          descriptorStatus:item.descriptorStatus,
          planStatus:item.planStatus,
          executionStatus:item.executionStatus,
          pinnedVerification:item.status==='verified',
          authoritativeParity,
          digest:item.digest,
          byteLength:item.byteLength
        });
      });
      const currentPackStatus=root.BAUMAN_PREREQ_PACKS_2026_STATUS;
      const manifest=verified.data.manifest;
      const expectedPacks=Array.isArray(manifest?.packs)?manifest.packs.length:0;
      const packParity=currentPackStatus?.ready===true&&currentPackStatus.failed===0&&currentPackStatus.expected===expectedPacks&&currentPackStatus.loaded===expectedPacks;
      const globalsUnchanged=
        JSON.stringify(root.BAUMAN_CURRICULUM_2026)===authoritativeBefore.curriculum&&
        JSON.stringify(root.BAUMAN_PREREQ_2026)===authoritativeBefore.prerequisite&&
        JSON.stringify(root.BAUMAN_PREREQ_PACKS_2026_STATUS)===authoritativeBefore.packStatus;
      const registryUnchanged=verified.registryUnchanged===true;
      const passed=results.length===3&&results.every(row=>row.descriptorStatus==='resolved'&&row.planStatus==='ready'&&row.executionStatus==='verified'&&row.pinnedVerification&&row.authoritativeParity)&&packParity&&globalsUnchanged&&registryUnchanged;
      publish({
        enabled:true,
        ready:true,
        passed,
        registryMode:'pinned_candidate',
        loaderSchema:loader.schema,
        candidateStatus:verified.candidateStatus,
        candidateAuthority:verified.candidateAuthority,
        resources:results,
        packParity,
        globalsUnchanged,
        registryUnchanged,
        error:passed?null:'SHADOW_VERIFIED_LOADER_PARITY_FAILED'
      });
    }catch(error){
      publish({enabled:true,ready:true,passed:false,registryMode:'pinned_candidate',error:String(error?.message||error)});
    }
  }
  root.BaumanAcademicContentResolutionShadow=Object.freeze({
    schema:STATUS_SCHEMA,
    enabled,
    run
  });
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true});
  else setTimeout(run,0);
})(typeof globalThis!=='undefined'?globalThis:this);
