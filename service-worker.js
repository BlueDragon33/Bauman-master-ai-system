'use strict';

const VERSION='2026.08.24-l5.3';
const CACHE_NAME=`bauman-shell-${VERSION}`;
const ROADMAP_MANIFEST='./assets/data/roadmap/iu5-090401-11-v3.json';
const SHELL=[
  './',
  './index.html',
  './assets/css/main.css',
  './assets/css/academic-roadmap-v3.css',
  './assets/css/offline-library.css',
  './assets/js/platform/runtime-config.js',
  './assets/js/platform/site-runtime.js',
  './assets/js/platform/offline-content-library.js',
  './assets/js/platform/storage-adapter.js',
  './assets/js/platform/state-schema.js',
  './assets/js/platform/main-state-repository.js',
  './assets/js/platform/personal-learning-schema.js',
  './assets/js/platform/personal-learning-migrator.js',
  './assets/js/platform/personal-learning-repository.js',
  './assets/js/platform/personal-learning-bootstrap.js',
  './assets/js/platform/platform-bootstrap.js',
  './assets/js/platform/academic-roadmap-v3-bridge.js',
  './assets/js/platform/site-routing-bridge.js',
  './assets/js/platform/offline-library-ui.js',
  './assets/js/platform/offline-html-sandbox-guard.js',
  './assets/js/data.js',
  './assets/js/main.js',
  './assets/js/planning-main.js',
  ROADMAP_MANIFEST
];

function cacheEligible(url){
  if(url.origin!==self.location.origin)return false;
  const path=url.pathname.toLowerCase();
  if(path.endsWith('/assets/data/roadmap/iu5-090401-11-v3.json'))return true;
  if(path.includes('/data/')||path.includes('/external-data/'))return false;
  if(path.endsWith('.json'))return false;
  return /\.(?:html?|css|js|svg|png|jpg|jpeg|webp|ico)$/.test(path)||path.endsWith('/');
}

self.addEventListener('install',(event)=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(async(path)=>{
      try{
        const response=await fetch(path,{cache:'no-cache'});
        if(response.ok)await cache.put(path,response.clone());
      }catch(_){ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',(event)=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter((name)=>name.startsWith('bauman-shell-')&&name!==CACHE_NAME).map((name)=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',(event)=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(!cacheEligible(url))return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(request,{ignoreSearch:false})||await cache.match(url.pathname.replace(/^\//,'./'),{ignoreSearch:false});
    const networkPromise=fetch(request).then(async(response)=>{
      if(response&&response.ok)await cache.put(request,response.clone());
      return response;
    }).catch(()=>null);

    if(cached){
      event.waitUntil(networkPromise);
      return cached;
    }
    return (await networkPromise)||Response.error();
  })());
});
