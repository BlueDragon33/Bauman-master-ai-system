'use strict';
(function(root){
  const STATUS_SCHEMA='BAUMAN_ACADEMIC_CONTENT_RESOLUTION_SHADOW_V1';
  const ENABLE_PARAM='contentResolutionShadow';
  const ENABLE_VALUE='1';
  const REGISTRY_CANDIDATE_PATH='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json';
  const RESOURCES=Object.freeze([
    Object.freeze({id:'official-curriculum',contentId:'bdr:content:academic-2026:official-curriculum',authoritativeGlobal:'BAUMAN_CURRICULUM_2026'}),
    Object.freeze({id:'prerequisite-registry',contentId:'bdr:content:academic-2026:prerequisite-registry',authoritativeGlobal:'BAUMAN_PREREQ_2026'}),
    Object.freeze({id:'prerequisite-pack-manifest',contentId:'bdr:content:academic-2026:prerequisite-pack-manifest',authoritativeGlobal:null})
  ]);
  const DEPENDENCIES=Object.freeze([
    Object.freeze({path:'foundation/domain-model/canonical-identity-runtime.js',global:'BaumanIdentityRuntime'}),
    Object.freeze({path:'foundation/content-registry/content-asset-registry.js',global:'BaumanContentAssetRegistry'}),
    Object.freeze({path:'foundation/content-registry/access-policy.js',global:'BaumanAccessPolicy'}),
    Object.freeze({path:'foundation/content-registry/asset-integrity.js',global:'BaumanAssetIntegrity'}),
    Object.freeze({path:'foundation/content-resolution/runtime-resource-resolver.js',global:'BaumanRuntimeResourceResolver'}),
    Object.freeze({path:'foundation/content-resolution/runtime-delivery-plan.js',global:'BaumanRuntimeDeliveryPlan'}),
    Object.freeze({path:'foundation/content-resolution/runtime-delivery-executor.js',global:'BaumanRuntimeDeliveryExecutor'}),
    Object.freeze({path:'foundation/content-resolution/adapters/package-relative-fetch-adapter.js',global:'BaumanPackageRelativeFetchAdapter'})
  ]);
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
  function loadScript(relative,globalName){
    if(root[globalName])return Promise.resolve();
    const url=new URL(relative,root.document.baseURI).href;
    return new Promise((resolve,reject)=>{
      const existing=Array.from(root.document.scripts).find(script=>script.src===url);
      if(existing){
        if(root[globalName])return resolve();
        existing.addEventListener('load',()=>root[globalName]?resolve():reject(new Error(`SHADOW_DEPENDENCY_GLOBAL_MISSING:${globalName}`)),{once:true});
        existing.addEventListener('error',()=>reject(new Error(`SHADOW_DEPENDENCY_LOAD_FAILED:${relative}`)),{once:true});
        return;
      }
      const script=root.document.createElement('script');
      script.src=url;
      script.async=false;
      script.dataset.baumanContentResolutionShadow='1';
      script.addEventListener('load',()=>root[globalName]?resolve():reject(new Error(`SHADOW_DEPENDENCY_GLOBAL_MISSING:${globalName}`)),{once:true});
      script.addEventListener('error',()=>reject(new Error(`SHADOW_DEPENDENCY_LOAD_FAILED:${relative}`)),{once:true});
      root.document.head.appendChild(script);
    });
  }
  async function loadDependencies(){
    for(const dependency of DEPENDENCIES)await loadScript(dependency.path,dependency.global);
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
  async function loadPinnedRegistry(){
    const url=new URL(REGISTRY_CANDIDATE_PATH,root.document.baseURI).href;
    const response=await root.fetch(url,{cache:'no-cache'});
    if(!response.ok)throw new Error(`SHADOW_REGISTRY_HTTP_${response.status}`);
    const registry=await response.json();
    root.BaumanContentAssetRegistry.assertIntegrity(registry);
    const meta=registry.extensions?.academicCore2026;
    if(meta?.schema!=='BAUMAN_ACADEMIC_CORE_REGISTRY_CANDIDATE_V1')throw new Error('SHADOW_REGISTRY_CANDIDATE_SCHEMA');
    if(meta.status!=='promotion_candidate'||meta.authority!=='candidate_only'||meta.runtimeAuthoritySwitch!==false)throw new Error('SHADOW_REGISTRY_CANDIDATE_AUTHORITY');
    if(meta.resourceCount!==3||meta.checksumAlgorithm!=='sha256')throw new Error('SHADOW_REGISTRY_CANDIDATE_SCOPE');
    return registry;
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
      await loadDependencies();
      const registry=await loadPinnedRegistry();
      const registryBefore=JSON.stringify(registry);
      const adapter=root.BaumanPackageRelativeFetchAdapter.create({baseUrl:root.document.baseURI});
      const results=[];
      const verifiedMap={};
      for(const row of RESOURCES){
        const descriptor=root.BaumanRuntimeResourceResolver.resolve(registry,{
          targetRegistryId:row.contentId,
          mode:'learner_runtime',
          accessContext:{private:true},
          runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}
        });
        const plan=root.BaumanRuntimeDeliveryPlan.buildPlan(registry,descriptor);
        let verifiedJson=null;
        const execution=await root.BaumanRuntimeDeliveryExecutor.execute(plan,{[adapter.adapterId]:adapter.load},async payload=>{
          verifiedJson=JSON.parse(new TextDecoder().decode(payload));
        });
        verifiedMap[row.id]=verifiedJson;
        const authoritativeParity=row.authoritativeGlobal
          ? JSON.stringify(verifiedJson)===JSON.stringify(root[row.authoritativeGlobal])
          : true;
        results.push(freeze({
          id:row.id,
          contentRegistryId:row.contentId,
          assetRegistryId:descriptor.assetRegistryId||null,
          path:plan.resource?.value||null,
          descriptorStatus:descriptor.status,
          planStatus:plan.status,
          executionStatus:execution.status,
          pinnedVerification:execution.status==='verified',
          authoritativeParity,
          digest:execution.integrity?.digest||null,
          byteLength:execution.integrity?.byteLength||0
        }));
      }
      const currentPackStatus=root.BAUMAN_PREREQ_PACKS_2026_STATUS;
      const manifest=verifiedMap['prerequisite-pack-manifest'];
      const expectedPacks=Array.isArray(manifest?.packs)?manifest.packs.length:0;
      const packParity=currentPackStatus?.ready===true&&currentPackStatus.failed===0&&currentPackStatus.expected===expectedPacks&&currentPackStatus.loaded===expectedPacks;
      const globalsUnchanged=
        JSON.stringify(root.BAUMAN_CURRICULUM_2026)===authoritativeBefore.curriculum&&
        JSON.stringify(root.BAUMAN_PREREQ_2026)===authoritativeBefore.prerequisite&&
        JSON.stringify(root.BAUMAN_PREREQ_PACKS_2026_STATUS)===authoritativeBefore.packStatus;
      const registryUnchanged=JSON.stringify(registry)===registryBefore;
      const passed=results.every(row=>row.descriptorStatus==='resolved'&&row.planStatus==='ready'&&row.executionStatus==='verified'&&row.pinnedVerification&&row.authoritativeParity)&&packParity&&globalsUnchanged&&registryUnchanged;
      publish({
        enabled:true,
        ready:true,
        passed,
        registryMode:'pinned_candidate',
        candidateStatus:registry.extensions.academicCore2026.status,
        candidateAuthority:registry.extensions.academicCore2026.authority,
        resources:results,
        packParity,
        globalsUnchanged,
        registryUnchanged,
        error:passed?null:'SHADOW_PINNED_PARITY_FAILED'
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
