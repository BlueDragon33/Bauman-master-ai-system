'use strict';

const VERSION='2026.08.24-l5.10';
const CACHE_NAME=`bauman-shell-${VERSION}`;
const OFFLINE_CONTENT_CACHE='bauman-offline-content-v1';
const ROADMAP_MANIFEST='./assets/data/roadmap/iu5-090401-11-v3.json';
const SHELL=[
  './',
  './index.html',
  './assets/css/main.css',
  './assets/css/academic-roadmap-v3.css',
  './assets/css/offline-library.css',
  './assets/css/offline-subject-pack.css',
  './assets/css/runtime-diagnostics.css',
  './assets/css/device-access-gate.css',
  './assets/js/platform/runtime-config.js',
  './assets/js/platform/device-access-gate.js',
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
  './assets/js/data.js',
  './assets/js/academic-data-v3.js',
  './assets/js/main.js',
  './assets/js/platform/academic-runtime-v3-bridge.js',
  './assets/js/platform/academic-roadmap-v3-bridge.js',
  './assets/js/platform/site-routing-bridge.js',
  './assets/js/platform/offline-library-ui.js',
  './assets/js/platform/offline-html-sandbox-guard.js',
  './assets/js/platform/offline-import-quota-guard.js',
  './assets/js/platform/offline-direct-file-reader.js',
  './assets/js/platform/offline-subject-pack-refcount-guard.js',
  './assets/js/platform/offline-subject-pack-manager.js',
  './assets/js/platform/runtime-self-diagnostics.js',
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

function canonicalRequestUrl(urlLike){
  const url=new URL(urlLike,self.location.href);
  url.hash='';
  url.search='';
  return url.href;
}

async function explicitOfflineMatch(request){
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return null;
  const cache=await caches.open(OFFLINE_CONTENT_CACHE);
  return (await cache.match(request,{ignoreSearch:false}))||(await cache.match(canonicalRequestUrl(url.href),{ignoreSearch:false}))||null;
}

async function shellMatch(request,url){
  if(!cacheEligible(url))return null;
  const cache=await caches.open(CACHE_NAME);
  return (await cache.match(request,{ignoreSearch:false}))||(await cache.match(url.pathname.replace(/^\//,'./'),{ignoreSearch:false}))||null;
}

async function refreshCache(request,cacheName,key){
  try{
    const response=await fetch(request,{cache:'no-cache'});
    if(!response||!response.ok)return false;
    const cache=await caches.open(cacheName);
    await cache.put(key,response.clone());
    return true;
  }catch(_){return false;}
}

self.addEventListener('install',(event)=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      for(const path of SHELL){
        const response=await fetch(path,{cache:'no-cache'});
        if(!response.ok)throw new Error(`Shell fetch failed ${response.status}: ${path}`);
        await cache.put(path,response.clone());
      }
    }catch(error){
      await caches.delete(CACHE_NAME);
      throw error;
    }
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
  if(url.origin!==self.location.origin)return;

  const explicitPromise=explicitOfflineMatch(request);
  const shellPromise=shellMatch(request,url);
  const refreshPromise=Promise.all([explicitPromise,shellPromise]).then(([explicit,shellCached])=>{
    if(explicit)return refreshCache(request,OFFLINE_CONTENT_CACHE,canonicalRequestUrl(request.url));
    if(shellCached)return refreshCache(request,CACHE_NAME,request);
    return false;
  }).catch(()=>false);
  event.waitUntil(refreshPromise);

  event.respondWith((async()=>{
    const explicit=await explicitPromise;
    if(explicit)return explicit;

    const shellCached=await shellPromise;
    if(shellCached)return shellCached;

    try{return await fetch(request);}catch(_){return Response.error();}
  })());
});