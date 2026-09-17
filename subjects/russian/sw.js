'use strict';
const CACHE='russian-app-shell-v1';
const DATA_CACHE='russian-learning-data-v1';
const SHELL=[
  './','./index.html','./manifest.webmanifest','../shared/host-bridge.js',
  './assets/core.css','./assets/russian.css','./assets/russian-reference-ui.css','./assets/russian-reference-ui-polish.css',
  './assets/learning-state.css','./assets/content-contract.css','./assets/learning-flow.css','./assets/vocab-srs.css','./assets/speaking-coach.css','./assets/academic-language.css','./assets/runtime-optimizer.css',
  './assets/subject-adapter.js','./assets/ui-cleanup-contract.js','./assets/content-contract.js','./assets/planning-bridge.js','./assets/russian-optional-data-loader.js','./assets/core.js','./assets/learning-state.js','./assets/learning-flow.js','./assets/vocab-srs.js','./assets/speaking-coach.js','./assets/academic-language.js','./assets/ai-mentor-guard.js','./assets/runtime-optimizer.js','./assets/russian-reference-ui.js'
];
const OPTIONAL_LARGE=new Set(['dialogue-bauman-az.json','deep-speaking-bauman.json','speaking-link-index.json']);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const isRussian=url.pathname.includes('/subjects/russian/');
  const isSharedHost=url.pathname.endsWith('/subjects/shared/host-bridge.js');
  if(!isRussian&&!isSharedHost)return;
  const file=url.pathname.split('/').pop()||'';
  const isData=url.pathname.includes('/subjects/russian/data/')&&!OPTIONAL_LARGE.has(file);
  if(isData){
    event.respondWith(caches.open(DATA_CACHE).then(async cache=>{
      const hit=await cache.match(req);if(hit)return hit;
      const res=await fetch(req);if(res&&res.ok)cache.put(req,res.clone());return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res&&res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone()));return res;})).catch(()=>caches.match('./index.html')));
});
