'use strict';
const CACHE='russian-app-shell-v16-engine-grounded-vector-ui';
const DATA_CACHE='russian-learning-data-v1';
const SHELL=[
  './','./index.html','./manifest.webmanifest','../shared/host-bridge.js',
  '../../foundation/domain-model/canonical-identity-runtime.js','../../foundation/domain-model/identity-overlay-store.js','../../foundation/domain-model/legacy-snapshot-extractor.js','../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js','../shared/foundation-identity-persistence.js','../shared/foundation-identity-projection.js','../shared/foundation-canonical-context.js',
  '../../platform/ui/tokens.css','../../platform/ui/foundations.css','../../platform/ui/components.css','../../platform/ui/layouts.css','../../platform/ui/responsive.css','../../platform/ui/bauman-ui.css','../../platform/ui/bauman-ui.css?v=1','../../platform/ui/bauman-ui.js','../../platform/ui/bauman-ui.js?v=1',
  './assets/core.css','./assets/russian.css','./assets/russian-future-ui.css',
  './assets/learning-state.css','./assets/content-contract.css','./assets/learning-flow.css','./assets/vocab-srs.css','./assets/speaking-coach.css','./assets/academic-language.css','./assets/capability-progression.css','./assets/runtime-optimizer.css',
  './assets/subject-adapter.js','./assets/ui-cleanup-contract.js','./assets/content-contract.js','./assets/planning-bridge.js','./assets/russian-optional-data-loader.js','./assets/listen-write-factory.js','./assets/speech-interaction-engine.js','./engine/integration/browser-bootstrap.js','./engine/speech/legacy-speech-provider.js','./engine/integration/grounded-browser-model.js','./engine/integration/grounded-experience.js','./engine/content/fixtures/grounded-scenes.v1.json','./assets/core.js','./assets/learning-state.js','./assets/learning-flow.js','./assets/handwriting-glyph-authority.js','./assets/handwriting-recognition.js','./assets/vocab-srs.js','./assets/speaking-coach.js','./assets/academic-language.js','./assets/capability-progression.js','./assets/ai-mentor-guard.js','./assets/assessment-mastery.js','./assets/review-scheduler.js','./assets/adaptive-planner.js','./assets/runtime-optimizer.js','./assets/russian-future-ui.js'
];
const PROTECTED_OFFLINE=['../../foundation/domain-model/legacy-mapping-registry.v1.json'];
const OPTIONAL_LARGE=new Set(['dialogue-bauman-az.json','deep-speaking-bauman.json','speaking-link-index.json']);
const PRECACHE_REPORT='./__precache-report.json';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function cacheShellAsset(cache,url){
  let lastError=null;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const req=new Request(url,{cache:'reload'});
      const res=await fetch(req);
      if(!res||!res.ok)throw new Error(url+' HTTP '+(res?.status||0));
      await cache.put(req,res.clone());
      return {url,status:'cached'};
    }catch(e){
      lastError=e;
      if(attempt<3)await sleep(500*attempt);
    }
  }
  return {url,status:'failed',error:String(lastError?.message||lastError||'unknown precache error')};
}
async function cacheShellWithRetry(){
  const cache=await caches.open(CACHE);
  const results=[];
  for(const url of SHELL)results.push(await cacheShellAsset(cache,url));
  const failed=results.filter(item=>item.status==='failed');
  const report={schema:'RUSSIAN_SW_PRECACHE_REPORT_V1',cache:CACHE,total:SHELL.length,cached:SHELL.length-failed.length,failed,generatedAt:Date.now()};
  await cache.put(PRECACHE_REPORT,new Response(JSON.stringify(report),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}));
  return report;
}
self.addEventListener('install',event=>{event.waitUntil(cacheShellWithRetry().then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const isRussian=url.pathname.includes('/subjects/russian/');
  const isSharedRuntime=url.pathname.startsWith('/subjects/shared/')&&(url.pathname.endsWith('/host-bridge.js')||url.pathname.includes('/foundation-'));
  const isFoundationIdentity=url.pathname.startsWith('/foundation/domain-model/')&&(url.pathname.endsWith('.js')||url.pathname.endsWith('/legacy-mapping-registry.v1.json'));
  const isPlatformUi=url.pathname.startsWith('/platform/ui/')&&(url.pathname.endsWith('.css')||url.pathname.endsWith('.js'));
  if(!isRussian&&!isSharedRuntime&&!isFoundationIdentity&&!isPlatformUi)return;
  const file=url.pathname.split('/').pop()||'';
  const isDataPath=url.pathname.includes('/subjects/russian/data/');
  const isAuthority=url.pathname.endsWith('/subjects/russian/assets/handwriting-glyph-authority.js');
  const isAuthorityAsset=url.pathname.includes('/subjects/russian/assets/handwriting-authority/');
  const isOptionalLarge=isDataPath&&OPTIONAL_LARGE.has(file);

  if(isAuthority||isAuthorityAsset){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      try{
        const res=await fetch(req,{cache:'no-store'});
        if(res&&res.ok){await cache.put(req,res.clone());return res;}
        const hit=await cache.match(req);
        return hit||res;
      }catch(_){
        const hit=await cache.match(req);
        return hit||Response.error();
      }
    }));
    return;
  }

  if(isOptionalLarge){
    event.respondWith(fetch(req).catch(()=>new Response(JSON.stringify({offline:true,optional:true,source:file}),{status:503,statusText:'Optional source unavailable offline',headers:{'Content-Type':'application/json'}})));
    return;
  }

  if(isDataPath){
    event.respondWith(caches.open(DATA_CACHE).then(async cache=>{
      try{
        const res=await fetch(req);
        if(res&&res.ok)await cache.put(req,res.clone());
        return res;
      }catch(_){
        const hit=await cache.match(req);
        return hit||new Response(JSON.stringify({offline:true,missing:true,source:file}),{status:503,statusText:'Required learning data unavailable offline',headers:{'Content-Type':'application/json'}});
      }
    }));
    return;
  }

  event.respondWith(caches.match(req).then(async hit=>{
    if(hit)return hit;
    try{
      const res=await fetch(req);
      if(res&&res.ok)await caches.open(CACHE).then(c=>c.put(req,res.clone()));
      return res;
    }catch(_){
      if(req.mode==='navigate')return (await caches.match('./index.html'))||Response.error();
      return Response.error();
    }
  }));
});
