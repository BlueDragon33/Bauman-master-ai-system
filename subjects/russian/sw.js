'use strict';
const CACHE='russian-app-shell-v4-clean-learning-ui';
const DATA_CACHE='russian-learning-data-v1';
const SHELL=[
  './','./index.html','./manifest.webmanifest','../shared/host-bridge.js',
  '../../foundation/domain-model/canonical-identity-runtime.js','../../foundation/domain-model/identity-overlay-store.js','../../foundation/domain-model/legacy-snapshot-extractor.js','../../foundation/domain-model/canonical-read-projection.js','../../foundation/domain-model/legacy-mapping-registry.v1.json',
  '../shared/foundation-identity-bootstrap.js','../shared/foundation-identity-persistence.js','../shared/foundation-identity-projection.js','../shared/foundation-canonical-context.js',
  './assets/core.css','./assets/russian.css','./assets/russian-future-ui.css',
  './assets/learning-state.css','./assets/content-contract.css','./assets/learning-flow.css','./assets/vocab-srs.css','./assets/speaking-coach.css','./assets/academic-language.css','./assets/capability-progression.css','./assets/runtime-optimizer.css',
  './assets/subject-adapter.js','./assets/ui-cleanup-contract.js','./assets/content-contract.js','./assets/planning-bridge.js','./assets/russian-optional-data-loader.js','./assets/listen-write-factory.js','./assets/core.js','./assets/learning-state.js','./assets/learning-flow.js','./assets/handwriting-glyph-authority.js','./assets/handwriting-recognition.js','./assets/vocab-srs.js','./assets/speaking-coach.js','./assets/academic-language.js','./assets/capability-progression.js','./assets/ai-mentor-guard.js','./assets/runtime-optimizer.js','./assets/russian-future-ui.js'
];
const OPTIONAL_LARGE=new Set(['dialogue-bauman-az.json','deep-speaking-bauman.json','speaking-link-index.json']);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const isRussian=url.pathname.includes('/subjects/russian/');
  const isSharedRuntime=url.pathname.startsWith('/subjects/shared/')&&(url.pathname.endsWith('/host-bridge.js')||url.pathname.includes('/foundation-'));
  const isFoundationIdentity=url.pathname.startsWith('/foundation/domain-model/')&&(url.pathname.endsWith('.js')||url.pathname.endsWith('/legacy-mapping-registry.v1.json'));
  if(!isRussian&&!isSharedRuntime&&!isFoundationIdentity)return;
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
