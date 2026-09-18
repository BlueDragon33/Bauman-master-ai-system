'use strict';
(function(root){
  const STATUS_SCHEMA='BAUMAN_ACADEMIC_CONTENT_RESOLUTION_SHADOW_V1';
  const ENABLE_PARAM='contentResolutionShadow';
  const ENABLE_VALUE='1';
  const RESOURCES=Object.freeze([
    Object.freeze({id:'official-curriculum',path:'assets/data/official-curriculum-iu5-2026.json',authoritativeGlobal:'BAUMAN_CURRICULUM_2026'}),
    Object.freeze({id:'prerequisite-registry',path:'assets/data/prerequisite-registry-iu5-2026.json',authoritativeGlobal:'BAUMAN_PREREQ_2026'}),
    Object.freeze({id:'prerequisite-pack-manifest',path:'assets/data/prerequisite-packs/manifest-2026.json',authoritativeGlobal:null})
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
  async function directResource(row){
    const url=new URL(row.path,root.document.baseURI).href;
    const response=await root.fetch(url,{cache:'no-cache'});
    if(!response.ok)throw new Error(`SHADOW_DIRECT_HTTP_${response.status}:${row.id}`);
    const buffer=await response.arrayBuffer();
    const bytes=new Uint8Array(buffer);
    const digestBuffer=await root.crypto.subtle.digest('SHA-256',bytes);
    const digest=Array.from(new Uint8Array(digestBuffer),byte=>byte.toString(16).padStart(2,'0')).join('');
    return {bytes,digest,json:JSON.parse(new TextDecoder().decode(bytes))};
  }
  function appendDiagnosticAsset(registry,row,direct){
    const checksumId=`bdr:checksum:academic-shadow-runtime:${row.id}`;
    const assetId=`bdr:asset:academic-shadow-runtime:${row.id}`;
    registry=root.BaumanContentAssetRegistry.appendRecord(registry,{
      registryId:checksumId,algorithm:'sha256',digest:direct.digest,byteLength:direct.bytes.byteLength,recordVersion:1
    });
    registry=root.BaumanContentAssetRegistry.appendRecord(registry,{
      registryId:assetId,
      canonicalEntityId:`bd:artifact:academic-shadow-runtime:${row.id}`,
      assetType:'document',
      mediaType:'application/json',
      checksumId,
      locators:[{kind:'repository_relative',value:row.path}],
      state:'verified',
      recordVersion:1
    });
    return {registry,assetId};
  }
  async function run(){
    if(!enabled()){
      publish({enabled:false,ready:true,passed:null});
      return;
    }
    publish({enabled:true,ready:false,passed:null});
    try{
      const packStatus=await waitForAcademicReady();
      const authoritativeBefore={
        curriculum:JSON.stringify(root.BAUMAN_CURRICULUM_2026),
        prerequisite:JSON.stringify(root.BAUMAN_PREREQ_2026),
        packStatus:JSON.stringify(packStatus)
      };
      await loadDependencies();
      let registry=root.BaumanContentAssetRegistry.emptyRegistry();
      const directMap={};
      const assets={};
      for(const row of RESOURCES){
        const direct=await directResource(row);
        directMap[row.id]=direct;
        const appended=appendDiagnosticAsset(registry,row,direct);
        registry=appended.registry;
        assets[row.id]=appended.assetId;
      }
      const registryBefore=JSON.stringify(registry);
      const adapter=root.BaumanPackageRelativeFetchAdapter.create({baseUrl:root.document.baseURI});
      const results=[];
      for(const row of RESOURCES){
        const descriptor=root.BaumanRuntimeResourceResolver.resolve(registry,{
          targetRegistryId:assets[row.id],
          mode:'learner_runtime',
          accessContext:{private:true},
          runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}
        });
        const plan=root.BaumanRuntimeDeliveryPlan.buildPlan(registry,descriptor);
        let verifiedJson=null;
        const execution=await root.BaumanRuntimeDeliveryExecutor.execute(plan,{[adapter.adapterId]:adapter.load},async payload=>{
          verifiedJson=JSON.parse(new TextDecoder().decode(payload));
        });
        const directJson=directMap[row.id].json;
        const directParity=JSON.stringify(verifiedJson)===JSON.stringify(directJson);
        const authoritativeParity=row.authoritativeGlobal
          ? JSON.stringify(verifiedJson)===JSON.stringify(root[row.authoritativeGlobal])
          : true;
        results.push(freeze({
          id:row.id,
          path:row.path,
          descriptorStatus:descriptor.status,
          planStatus:plan.status,
          executionStatus:execution.status,
          directParity,
          authoritativeParity,
          digest:execution.integrity?.digest||null,
          byteLength:execution.integrity?.byteLength||0
        }));
      }
      const currentPackStatus=root.BAUMAN_PREREQ_PACKS_2026_STATUS;
      const manifest=directMap['prerequisite-pack-manifest'].json;
      const expectedPacks=Array.isArray(manifest?.packs)?manifest.packs.length:0;
      const packParity=currentPackStatus?.ready===true&&currentPackStatus.failed===0&&currentPackStatus.expected===expectedPacks&&currentPackStatus.loaded===expectedPacks;
      const globalsUnchanged=
        JSON.stringify(root.BAUMAN_CURRICULUM_2026)===authoritativeBefore.curriculum&&
        JSON.stringify(root.BAUMAN_PREREQ_2026)===authoritativeBefore.prerequisite&&
        JSON.stringify(root.BAUMAN_PREREQ_PACKS_2026_STATUS)===authoritativeBefore.packStatus;
      const registryUnchanged=JSON.stringify(registry)===registryBefore;
      const passed=results.every(row=>row.descriptorStatus==='resolved'&&row.planStatus==='ready'&&row.executionStatus==='verified'&&row.directParity&&row.authoritativeParity)&&packParity&&globalsUnchanged&&registryUnchanged;
      publish({
        enabled:true,
        ready:true,
        passed,
        resources:results,
        packParity,
        globalsUnchanged,
        registryUnchanged,
        error:passed?null:'SHADOW_PARITY_FAILED'
      });
    }catch(error){
      publish({enabled:true,ready:true,passed:false,error:String(error?.message||error)});
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
