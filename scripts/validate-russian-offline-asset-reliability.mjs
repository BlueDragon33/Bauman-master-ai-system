import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error('RUSSIAN_OFFLINE_ASSET_RELIABILITY_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const ROOT=path.resolve('subjects/russian');

function indexDependencies(html){
  const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(x=>x==='manifest.webmanifest'||x.startsWith('assets/')||x.startsWith('../')||x.startsWith('../../'));
  return ['./','./index.html',...Array.from(new Set(refs)).map(x=>x==='manifest.webmanifest'?'./manifest.webmanifest':x.startsWith('assets/')?'./'+x:x)];
}
function quotedArray(js,name){
  const m=js.match(new RegExp('const '+name+'=\\[([\\s\\S]*?)\\];'));
  assert(m,'Missing array '+name);
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]);
}
function jsonArray(js,name){
  const m=js.match(new RegExp('const '+name+'=(\\[[\\s\\S]*?\\]);'));
  assert(m,'Missing JSON array '+name);
  try{return JSON.parse(m[1])}catch{fail('Invalid JSON array '+name)}
}

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_OFFLINE_ASSET_RELIABILITY_CONTRACT_V1','Unexpected offline reliability contract');
  assert(c.readiness?.requiresCompleteAppShell===true&&c.readiness?.requiresCompleteRequiredData===true,'Offline ready must require shell and data');
  assert(c.readiness?.falseReadyForbidden===true,'False offline-ready state is allowed');
  assert(Array.isArray(c.requiredData)&&c.requiredData.length===17,'Required offline data set must contain 17 sources');
  for(const x of ['cyrillic-sound-map','reading-bridge','grammar-pattern-bridge'])assert(c.requiredData.includes(x),'Missing post-rebuild required data: '+x);
  assert(c.media?.externalNetworkOnlyExplicit===true&&c.media?.offlineExternalEmbedForbidden===true&&c.media?.offlineExternalOpenDisabled===true,'External media offline policy weakened');
  assert(c.visualAssets?.failedImageExplicitState==='missing_visual_asset'&&c.visualAssets?.translationFallbackForbidden===true,'Visual failure policy weakened');
  assert(c.serviceWorker?.navigationOnlyHtmlFallback===true&&c.serviceWorker?.requiredDataMissingStatus===503&&c.serviceWorker?.requiredDataMissingJson===true,'Required-data fallback policy weakened');
  assert(c.serviceWorker?.cacheAllLocalEntryDependencies===true&&c.serviceWorker?.supportFoundationAndSharedDependencies===true,'Package dependency policy weakened');
  return true;
}

export function validateInventory(html,sw,runtime,c){
  assert(!html.includes('\\n'),'Literal newline escape remains in Russian entry page');
  const expected=indexDependencies(html);
  const shell=quotedArray(sw,'SHELL');
  const runtimeShell=jsonArray(runtime,'SHELL_REQUIRED');
  assert(JSON.stringify(shell)===JSON.stringify(expected),'Service-worker shell does not exactly match Russian entry dependencies');
  assert(JSON.stringify(runtimeShell)===JSON.stringify(expected),'Runtime shell readiness inventory does not match entry dependencies');
  for(const item of expected){
    if(item==='./')continue;
    const abs=path.resolve(ROOT,item);
    assert(fs.existsSync(abs),'Shell dependency missing on disk: '+item);
    assert(fs.statSync(abs).isFile(),'Shell dependency is not a file: '+item);
  }
  const data=jsonArray(runtime,'CORE_DATA');
  assert(JSON.stringify(data)===JSON.stringify(c.requiredData),'Runtime required-data inventory drifted from contract');
  for(const name of c.requiredData){
    const p=path.join(ROOT,'data',name+'.json');
    assert(fs.existsSync(p),'Required offline data file missing: data/'+name+'.json');
  }
  return true;
}

export function validateServiceWorker(sw,c){
  assert(sw.includes("const CACHE='russian-app-shell-v2'"),'App-shell cache version not upgraded');
  assert(sw.includes("const DATA_CACHE='russian-learning-data-v2'"),'Learning-data cache version not upgraded');
  assert(sw.includes("const isSharedSupport=url.pathname.includes('/subjects/shared/')"),'Shared dependency fetch support missing');
  assert(sw.includes("const isFoundationSupport=url.pathname.includes('/foundation/domain-model/')"),'Foundation dependency fetch support missing');
  for(const name of c.optionalLarge)assert(sw.includes(name+'.json'),'Optional-large policy missing '+name);
  assert(sw.includes("status:503,statusText:'Required learning data unavailable offline'"),'Required data must return explicit 503 offline state');
  assert(sw.includes("JSON.stringify({offline:true,missing:true,source:file})"),'Required data 503 must be JSON');
  assert(sw.includes("status:503,statusText:'Optional source unavailable offline'"),'Optional data must return explicit 503 offline state');
  assert(sw.includes("if(req.mode==='navigate')"),'HTML fallback must be navigation-only');
  assert(!sw.includes("catch(()=>caches.match('./index.html'))"),'Arbitrary asset requests must not receive HTML fallback');
  return true;
}

export function validateRuntime(runtime){
  assert(runtime.includes("const SHELL_CACHE='russian-app-shell-v2'"),'Runtime shell cache name drifted');
  assert(runtime.includes("const DATA_CACHE='russian-learning-data-v2'"),'Runtime data cache name drifted');
  assert(runtime.includes('let preparing=false, prepared=0, shellPrepared=0, verified=false'),'Runtime must start unverified instead of trusting stale counters');
  assert(runtime.includes('const ready=verified&&dataReady&&shellReady'),'Paint readiness must require cache verification');
  assert(runtime.includes('ready:verified&&shellPrepared>=SHELL_REQUIRED.length&&prepared>=CORE_DATA.length'),'Public readiness must require verified shell and data');
  assert(runtime.includes('countCachedShell')&&runtime.includes('cacheShell'),'Shell cache verification/preparation missing');
  assert(runtime.includes('Promise.all([countCachedShell(SHELL_REQUIRED),countCached(CORE_DATA)])'),'Reconciliation must verify shell and data together');
  return true;
}

export async function validateRuntimeBehavior(runtime){
  const store=new Map([['ru_offline_core_count','999'],['ru_offline_shell_count','999']]);
  const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
  const cache={match:async()=>({ok:true}),put:async()=>{}};
  const caches={open:async()=>cache};
  const window={
    caches,
    addEventListener:()=>{},
    navigator:{onLine:true},
    RussianRuntimeOptimizer:null
  };
  const document={querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{}};
  const navigator={onLine:true,connection:{saveData:false},serviceWorker:undefined};
  const sandbox={window,document,navigator,localStorage,caches,fetch:async()=>({ok:true,clone(){return this;}}),location:{protocol:'https:'},requestIdleCallback:undefined,setTimeout:()=>0,console};
  vm.createContext(sandbox);
  vm.runInContext(runtime,sandbox,{filename:'runtime-optimizer.js'});
  const api=window.RussianRuntimeOptimizer;
  assert(api?.schema==='RUSSIAN_RUNTIME_OPTIMIZER_V1','Runtime optimizer API missing');
  const before=api.status();
  assert(before.ready===false&&before.verified===false,'Stale localStorage counters caused false ready before Cache Storage verification');
  await api.reconcileOfflineCore();
  const after=api.status();
  assert(after.ready===true&&after.verified===true&&after.shellPrepared===after.shellTotal&&after.prepared===after.total,'Verified complete caches did not produce true ready state');
  return true;
}

export function validateMediaAndVisual(core,asset,css){
  assert(core.includes('function mediaNetworkOnly(m)'),'Network-only media classifier missing');
  assert(core.includes('networkOnly&&navigator.onLine===false'),'Offline external-media branch missing');
  assert(core.includes('Nguồn external chưa dùng được khi offline'),'Explicit offline external-media message missing');
  assert(core.includes('data-ru-network-media'),'External iframe marker missing');
  assert(core.includes('data-ru-visual-asset="vocab"'),'Vocabulary visual asset marker missing');
  assert(core.includes('data-ru-visual-asset="ai"'),'AI visual asset marker missing');
  assert(core.includes("window.addEventListener('online',refreshNetworkSensitiveView)")&&core.includes("window.addEventListener('offline',refreshNetworkSensitiveView)"),'Media view does not react to network changes');
  assert(asset.includes("const SCHEMA='RUSSIAN_ASSET_RELIABILITY_V1'"),'Asset reliability runtime missing');
  assert(asset.includes("const FALLBACK='missing_visual_asset'"),'Explicit visual fallback state missing');
  assert(asset.includes("document.addEventListener('error'")&&asset.includes('},true);'),'Visual asset error capture missing');
  for(const bad of ['meaningVi','meaning_vi','.english','translation_vi','translation_en'])assert(!asset.includes(bad),'Asset fallback must not use translation field: '+bad);
  assert(css.includes('.ru-asset-missing')&&css.includes('.media-offline-unavailable'),'Asset reliability presentation missing');
  return true;
}

export function validateAssetBehavior(asset){
  let errorHandler=null,replaced=null;
  const document={
    addEventListener:(type,fn)=>{if(type==='error')errorHandler=fn;},
    createElement:()=>({
      className:'',dataset:{},textContent:'',
      setAttribute(){},
    })
  };
  const root={};
  const sandbox={window:root,document,console};
  vm.createContext(sandbox);
  vm.runInContext(asset,sandbox,{filename:'asset-reliability.js'});
  assert(root.RussianAssetReliability?.fallback==='missing_visual_asset','Asset reliability API missing');
  const img={
    tagName:'IMG',dataset:{},
    matches:()=>true,closest:()=>null,
    replaceWith:node=>{replaced=node;}
  };
  errorHandler?.({target:img});
  assert(replaced?.textContent==='missing_visual_asset'&&replaced?.dataset?.ruAssetFallback==='1','Broken visual did not become explicit missing_visual_asset state');
  return true;
}

export async function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts','offline-asset-reliability-contract.v1.json'),'utf8'));
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const runtime=fs.readFileSync(path.join(ROOT,'assets','runtime-optimizer.js'),'utf8');
  const core=fs.readFileSync(path.join(ROOT,'assets','core.js'),'utf8');
  const asset=fs.readFileSync(path.join(ROOT,'assets','asset-reliability.js'),'utf8');
  const css=fs.readFileSync(path.join(ROOT,'assets','asset-reliability.css'),'utf8');
  validateContract(c);
  validateInventory(html,sw,runtime,c);
  validateServiceWorker(sw,c);
  validateRuntime(runtime);
  await validateRuntimeBehavior(runtime);
  validateMediaAndVisual(core,asset,css);
  validateAssetBehavior(asset);
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  await loadAndValidate();
  console.log('RUSSIAN_OFFLINE_ASSET_RELIABILITY_GATE=PASS');
  console.log(JSON.stringify({shellFromEntry:true,requiredData:17,falseReadyBlocked:true,externalMediaExplicit:true,visualFailureExplicit:true},null,2));
}
