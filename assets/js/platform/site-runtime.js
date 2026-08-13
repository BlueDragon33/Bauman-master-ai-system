(function(global){
  'use strict';

  const config=global.BAUMAN_RUNTIME_CONFIG||{};
  const VERSION='2026.08.13-l5.1';

  function runtimeBase(){
    if(global.document?.baseURI)return global.document.baseURI;
    if(global.location?.href)return global.location.href;
    return 'http://localhost/';
  }

  function toUrl(path,base){
    return new URL(String(path||''),base||runtimeBase());
  }

  function assertSameOrigin(url){
    const origin=global.location?.origin;
    if(origin&&origin!=='null'&&url.origin!==origin)throw new Error('Cross-origin subject/static route is not allowed by site runtime');
    return url;
  }

  function resolvePath(path,options){
    const opts=options||{};
    const url=toUrl(path,opts.base);
    if(opts.sameOrigin!==false)assertSameOrigin(url);
    return url.href;
  }

  function withVersion(path,version){
    const url=toUrl(path);
    assertSameOrigin(url);
    if(!url.searchParams.has('v'))url.searchParams.set('v',String(version||VERSION));
    return url.href;
  }

  function buildSubjectUrl(path,params){
    const url=toUrl(path);
    assertSameOrigin(url);
    Object.entries(params||{}).forEach(([key,value])=>{
      if(value===undefined||value===null)return;
      url.searchParams.set(key,String(value));
    });
    return url.href;
  }

  function isCacheEligible(urlLike){
    const url=toUrl(urlLike);
    if(global.location?.origin&&global.location.origin!=='null'&&url.origin!==global.location.origin)return false;
    const pathname=url.pathname.toLowerCase();
    if(pathname.includes('/data/')||pathname.includes('/external-data/'))return false;
    if(pathname.endsWith('.json'))return false;
    return /\.(?:html?|css|js|svg|png|jpg|jpeg|webp|ico)$/.test(pathname)||pathname.endsWith('/');
  }

  async function registerServiceWorker(){
    if(config.features?.serviceWorkerCache!==true)return {registered:false,reason:'feature-disabled'};
    if(!('serviceWorker' in (global.navigator||{})))return {registered:false,reason:'unsupported'};
    if(!/^https?:$/.test(global.location?.protocol||''))return {registered:false,reason:'non-http-context'};
    try{
      const registration=await global.navigator.serviceWorker.register(`service-worker.js?v=${encodeURIComponent(VERSION)}`,{scope:'./'});
      return {registered:true,scope:registration.scope,version:VERSION};
    }catch(error){
      return {registered:false,reason:'registration-failed',error:String(error?.message||error)};
    }
  }

  const api=Object.freeze({
    version:VERSION,
    enabled:config.features?.siteRuntime===true,
    cacheEnabled:config.features?.serviceWorkerCache===true,
    resolvePath,
    withVersion,
    buildSubjectUrl,
    isCacheEligible,
    registerServiceWorker
  });

  global.BaumanSiteRuntime=api;
  global.BAUMAN_SITE_RUNTIME_AUDIT=function(){
    return {
      version:VERSION,
      enabled:api.enabled,
      cacheEnabled:api.cacheEnabled,
      base:runtimeBase(),
      currentPath:global.location?.pathname||'',
      serviceWorkerSupported:'serviceWorker' in (global.navigator||{})
    };
  };
})(window);
