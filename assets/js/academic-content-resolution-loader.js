'use strict';
(function(root){
  const SCHEMA='BAUMAN_ACADEMIC_VERIFIED_CONTENT_LOADER_V1';
  const RESULT_SCHEMA='BAUMAN_ACADEMIC_VERIFIED_CONTENT_RESULT_V1';
  const REGISTRY_CANDIDATE_PATH='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json';
  const RESOURCES=Object.freeze([
    Object.freeze({key:'curriculum',contentId:'bdr:content:academic-2026:official-curriculum'}),
    Object.freeze({key:'prerequisite',contentId:'bdr:content:academic-2026:prerequisite-registry'}),
    Object.freeze({key:'manifest',contentId:'bdr:content:academic-2026:prerequisite-pack-manifest'})
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
  function fail(code){throw new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_${code}`)}
  function loadScript(relative,globalName){
    if(root[globalName])return Promise.resolve();
    const url=new URL(relative,root.document.baseURI).href;
    return new Promise((resolve,reject)=>{
      const existing=Array.from(root.document.scripts).find(script=>script.src===url);
      if(existing){
        if(root[globalName])return resolve();
        existing.addEventListener('load',()=>root[globalName]?resolve():reject(new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_DEPENDENCY_GLOBAL_MISSING:${globalName}`)),{once:true});
        existing.addEventListener('error',()=>reject(new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_DEPENDENCY_LOAD_FAILED:${relative}`)),{once:true});
        return;
      }
      const script=root.document.createElement('script');
      script.src=url;
      script.async=false;
      script.dataset.baumanAcademicVerifiedLoader='1';
      script.addEventListener('load',()=>root[globalName]?resolve():reject(new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_DEPENDENCY_GLOBAL_MISSING:${globalName}`)),{once:true});
      script.addEventListener('error',()=>reject(new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_DEPENDENCY_LOAD_FAILED:${relative}`)),{once:true});
      root.document.head.appendChild(script);
    });
  }
  async function loadDependencies(){
    for(const dependency of DEPENDENCIES)await loadScript(dependency.path,dependency.global);
  }
  async function loadRegistry(baseUrl,fetchFn){
    const response=await fetchFn(new URL(REGISTRY_CANDIDATE_PATH,baseUrl).href,{cache:'no-cache'});
    if(!response?.ok)fail(`REGISTRY_HTTP_${Number(response?.status)||0}`);
    const registry=await response.json();
    root.BaumanContentAssetRegistry.assertIntegrity(registry);
    const meta=registry.extensions?.academicCore2026;
    if(meta?.schema!=='BAUMAN_ACADEMIC_CORE_REGISTRY_CANDIDATE_V1')fail('REGISTRY_SCHEMA');
    if(meta.status!=='promotion_candidate'||meta.authority!=='candidate_only'||meta.runtimeAuthoritySwitch!==false)fail('REGISTRY_AUTHORITY');
    if(meta.resourceCount!==3||meta.checksumAlgorithm!=='sha256')fail('REGISTRY_SCOPE');
    return registry;
  }
  async function loadCore(optionsValue={}){
    const options=optionsValue&&typeof optionsValue==='object'&&!Array.isArray(optionsValue)?optionsValue:{};
    const baseUrl=String(options.baseUrl||root.document?.baseURI||'').trim();
    if(!baseUrl)fail('BASE_URL_REQUIRED');
    let parsedBase;
    try{parsedBase=new URL(baseUrl)}catch{fail('INVALID_BASE_URL')}
    if(parsedBase.protocol!=='http:'&&parsedBase.protocol!=='https:')fail('INVALID_BASE_PROTOCOL');
    const hasFetch=Object.prototype.hasOwnProperty.call(options,'fetchFn');
    const fetchFn=hasFetch?options.fetchFn:(typeof root.fetch==='function'?root.fetch.bind(root):null);
    if(typeof fetchFn!=='function')fail('FETCH_UNAVAILABLE');

    await loadDependencies();
    const registry=await loadRegistry(parsedBase.href,fetchFn);
    const registryBefore=JSON.stringify(registry);
    const adapterOptions={baseUrl:parsedBase.href};
    if(hasFetch)adapterOptions.fetchFn=fetchFn;
    const adapter=root.BaumanPackageRelativeFetchAdapter.create(adapterOptions);
    const data={},verification=[];
    for(const row of RESOURCES){
      const descriptor=root.BaumanRuntimeResourceResolver.resolve(registry,{
        targetRegistryId:row.contentId,
        mode:'learner_runtime',
        accessContext:{private:true},
        runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}
      });
      if(descriptor.status!=='resolved')fail(`RESOLUTION_${row.key}_${descriptor.status}`);
      const plan=root.BaumanRuntimeDeliveryPlan.buildPlan(registry,descriptor);
      let parsed=null;
      const execution=await root.BaumanRuntimeDeliveryExecutor.execute(plan,{[adapter.adapterId]:adapter.load},async payload=>{
        parsed=JSON.parse(new TextDecoder().decode(payload));
      });
      if(execution.status!=='verified'||parsed===null)fail(`VERIFICATION_${row.key}_${execution.status}`);
      data[row.key]=parsed;
      verification.push(freeze({
        key:row.key,
        contentRegistryId:row.contentId,
        assetRegistryId:descriptor.assetRegistryId,
        path:plan.resource.value,
        digest:execution.integrity.digest,
        byteLength:execution.integrity.byteLength,
        status:execution.status
      }));
    }
    if(JSON.stringify(registry)!==registryBefore)fail('REGISTRY_MUTATED');
    return freeze({
      schema:RESULT_SCHEMA,
      status:'verified',
      registryMode:'pinned_candidate',
      candidateStatus:registry.extensions.academicCore2026.status,
      candidateAuthority:registry.extensions.academicCore2026.authority,
      data,
      verification
    });
  }
  root.BaumanAcademicVerifiedContentLoader=Object.freeze({
    schema:SCHEMA,
    resultSchema:RESULT_SCHEMA,
    registryCandidatePath:REGISTRY_CANDIDATE_PATH,
    resourceCount:RESOURCES.length,
    loadCore
  });
})(typeof globalThis!=='undefined'?globalThis:this);
