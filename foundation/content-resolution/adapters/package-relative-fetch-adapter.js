'use strict';
(function(root,factory){
  const api=factory(()=>typeof root.fetch==='function'?root.fetch.bind(root):null);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanPackageRelativeFetchAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fetchProvider){
  const SCHEMA='BAUMAN_PACKAGE_RELATIVE_FETCH_ADAPTER_V1';
  const PLAN_SCHEMA='BAUMAN_RUNTIME_DELIVERY_PLAN_V1';
  const ADAPTER_ID='package-relative-resource';
  const clean=value=>String(value??'').trim();
  const fail=code=>{throw new Error(`PACKAGE_RELATIVE_FETCH_ADAPTER_${code}`)};

  function normalizeBaseUrl(value){
    let url;
    try{url=new URL(clean(value))}catch{fail('INVALID_BASE_URL')}
    if(url.protocol!=='http:'&&url.protocol!=='https:')fail('INVALID_BASE_PROTOCOL');
    if(url.username||url.password)fail('BASE_CREDENTIALS_FORBIDDEN');
    return url;
  }
  function validatePath(value){
    const path=clean(value);
    if(!path)fail('PATH_REQUIRED');
    if(path.startsWith('/')||path.startsWith('//')||/^[A-Za-z]:[\\/]/.test(path)||path.includes('\\')||path.split('/').includes('..'))fail('NON_PORTABLE_PATH');
    if(/[?#]/.test(path))fail('QUERY_FRAGMENT_FORBIDDEN');
    return path;
  }
  function validatePlan(value){
    if(!value||typeof value!=='object'||Array.isArray(value)||value.schema!==PLAN_SCHEMA)fail('INVALID_PLAN');
    if(value.status!=='ready'||value.adapterId!==ADAPTER_ID||value.transport!=='package_relative')fail('PLAN_ADAPTER_MISMATCH');
    if(value.resource?.kind!=='repository_relative')fail('RESOURCE_KIND_MISMATCH');
    return validatePath(value.resource.value);
  }
  function create(optionsValue={}){
    const options=optionsValue&&typeof optionsValue==='object'&&!Array.isArray(optionsValue)?optionsValue:{};
    const baseUrl=normalizeBaseUrl(options.baseUrl);
    const hasExplicitFetch=Object.prototype.hasOwnProperty.call(options,'fetchFn');
    const fetchFn=hasExplicitFetch?options.fetchFn:fetchProvider();
    if(typeof fetchFn!=='function')fail('FETCH_UNAVAILABLE');
    async function load(plan){
      const path=validatePlan(plan);
      const target=new URL(path,baseUrl);
      if(target.origin!==baseUrl.origin)fail('CROSS_ORIGIN_FORBIDDEN');
      const response=await fetchFn(target.href,{
        method:'GET',
        cache:'no-cache',
        credentials:'same-origin',
        redirect:'error'
      });
      if(!response||response.ok!==true)fail(`HTTP_${Number(response?.status)||0}`);
      if(typeof response.arrayBuffer!=='function')fail('ARRAY_BUFFER_UNAVAILABLE');
      const buffer=await response.arrayBuffer();
      if(!(buffer instanceof ArrayBuffer))fail('INVALID_ARRAY_BUFFER');
      return new Uint8Array(buffer.slice(0));
    }
    return Object.freeze({schema:SCHEMA,adapterId:ADAPTER_ID,baseOrigin:baseUrl.origin,load});
  }
  return Object.freeze({schema:SCHEMA,adapterId:ADAPTER_ID,create});
});
