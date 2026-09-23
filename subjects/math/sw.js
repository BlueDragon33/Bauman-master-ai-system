/* Bauman Math Offline Shell V2 */
const CACHE='bauman-math-shell-v2';
const CORE=[
  './',
  './index.html',
  './assets/core-subject.css',
  './assets/math.css',
  './assets/math-premium.css?v=2',
  './assets/math-reader-pro.css?v=2',
  './assets/math-dashboard.css',
  './assets/math-navigation.css',
  './assets/math-learning-flow.css',
  './assets/math-study-library.css',
  './assets/math-responsive-pro.css',
  './assets/subject-adapter.js',
  './assets/theory_skin/theory-tab-E129.js',
  './assets/theory_skin/theory-content-source-E240.js',
  './assets/math-premium.js',
  './assets/math-reader-role-map.js',
  './assets/math-dashboard.js',
  './assets/math-navigation.js',
  './assets/math-learning-flow.js?v=3',
  './assets/math-study-library.js?v=2',
  './data/curriculum.json',
  './data/chapter_spine.json',
  './data/discipline_spine.json',
  './data/theory_lecture_content.json'
];
const HEAVY_DATA=/\/(?:lessons|speaking|dialogue-bauman-az|vocab|grammar|grammar-path)\.json(?:\?|$)/i;

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('bauman-math-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const length=Number(response.headers.get('content-length')||0);
      const withinBudget=!length||length<=12*1024*1024;
      if(withinBudget)cache.put(request,response.clone());
    }
    return response;
  }catch(error){
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    throw error;
  }
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:true});
  const network=fetch(request).then(response=>{
    if(response&&response.ok)cache.put(request,response.clone());
    return response;
  }).catch(()=>null);
  return cached||await network||Response.error();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request).catch(()=>caches.match('./index.html')));
    return;
  }
  if(/\/data\/.*\.json(?:\?|$)/i.test(url.pathname)){
    event.respondWith(networkFirst(request));
    return;
  }
  if(/\.(?:css|js|svg|png|jpg|jpeg|webp|woff2?)(?:\?|$)/i.test(url.pathname)){
    event.respondWith(staleWhileRevalidate(request));
  }
});
