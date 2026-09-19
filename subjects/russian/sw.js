'use strict';
const CACHE='russian-app-shell-v2';
const DATA_CACHE='russian-learning-data-v2';
const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/core.css',
  './assets/russian.css',
  './assets/russian-reference-ui.css',
  './assets/russian-reference-ui-polish.css',
  './assets/learning-state.css',
  './assets/content-contract.css',
  './assets/learning-flow.css',
  './assets/cyrillic-literacy.css',
  './assets/handwriting-motor-coach.css',
  './assets/reading-bridge.css',
  './assets/dictation-listen-write.css',
  './assets/vocab-srs.css',
  './assets/multimodal-review.css',
  './assets/skill-gated-assessment.css',
  './assets/weakness-repair-router.css',
  './assets/visual-vocabulary-runtime.css',
  './assets/speaking-coach.css',
  './assets/listening-ladder.css',
  './assets/dialogue-scaffold.css',
  './assets/academic-language.css',
  './assets/grammar-pattern-coach.css',
  './assets/runtime-optimizer.css',
  './assets/asset-reliability.css',
  './assets/subject-adapter.js',
  './assets/ui-cleanup-contract.js',
  './assets/content-contract.js',
  '../shared/host-bridge.js',
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js',
  '../shared/foundation-identity-persistence.js',
  '../shared/foundation-identity-projection.js',
  '../shared/foundation-canonical-context.js',
  './assets/planning-bridge.js',
  './assets/russian-optional-data-loader.js',
  './assets/visual-vocabulary-runtime.js',
  './assets/ai-direct-explanation.js',
  './assets/dialogue-scaffold.js',
  './assets/core.js',
  './assets/learning-state.js',
  './assets/learning-flow.js',
  './assets/cyrillic-literacy.js',
  './assets/handwriting-motor-coach.js',
  './assets/reading-bridge.js',
  './assets/dictation-listen-write.js',
  './assets/vocab-srs.js',
  './assets/multimodal-review.js',
  './assets/skill-gated-assessment.js',
  './assets/listening-ladder.js',
  './assets/speaking-coach.js',
  './assets/academic-language.js',
  './assets/grammar-pattern-coach.js',
  './assets/ai-mentor-guard.js',
  './assets/weakness-repair-router.js',
  './assets/asset-reliability.js',
  './assets/runtime-optimizer.js',
  './assets/russian-reference-ui.js'
];
const OPTIONAL_LARGE=new Set(['dialogue-bauman-az.json','deep-speaking-bauman.json','speaking-link-index.json']);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const isRussian=url.pathname.includes('/subjects/russian/');
  const isSharedSupport=url.pathname.includes('/subjects/shared/');
  const isFoundationSupport=url.pathname.includes('/foundation/domain-model/');
  if(!isRussian&&!isSharedSupport&&!isFoundationSupport)return;
  const file=url.pathname.split('/').pop()||'';
  const isDataPath=url.pathname.includes('/subjects/russian/data/');
  const isOptionalLarge=isDataPath&&OPTIONAL_LARGE.has(file);

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
