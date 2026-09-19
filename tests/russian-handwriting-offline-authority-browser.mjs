import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const ROOT=process.cwd();
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-handwriting-offline-authority';
fs.mkdirSync(OUT,{recursive:true});

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bauman-russian-offline-authority-'));
const fixtureRoot=path.join(tmp,'runtime');
const russianRoot=path.join(fixtureRoot,'subjects','russian');
const sharedRoot=path.join(fixtureRoot,'subjects','shared');
const authorityDir=path.join(russianRoot,'assets','handwriting-authority','offline-e2e');

function digest(buffer){return crypto.createHash('sha256').update(buffer).digest('hex');}
function mime(file){
  const ext=path.extname(file).toLowerCase();
  return ({
    '.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
    '.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml',
    '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2',
    '.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.txt':'text/plain; charset=utf-8'
  })[ext]||'application/octet-stream';
}
function safeFile(urlPath){
  const pathname=decodeURIComponent(urlPath.split('?')[0]||'/');
  const normalized=path.posix.normalize(pathname).replace(/^\/+/, '');
  const full=path.resolve(fixtureRoot,normalized);
  if(!full.startsWith(path.resolve(fixtureRoot)+path.sep)&&full!==path.resolve(fixtureRoot))return null;
  let file=full;
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch(_){}
  return file;
}

fs.mkdirSync(path.dirname(russianRoot),{recursive:true});
fs.cpSync(path.join(ROOT,'subjects','russian'),russianRoot,{recursive:true});
fs.mkdirSync(path.dirname(sharedRoot),{recursive:true});
fs.cpSync(path.join(ROOT,'subjects','shared'),sharedRoot,{recursive:true});
fs.mkdirSync(authorityDir,{recursive:true});

const handwriting=JSON.parse(fs.readFileSync(path.join(russianRoot,'data','handwriting.json'),'utf8'));
const alphabetIds=handwriting.filter(x=>x?.mode==='alphabet'&&x?.id).map(x=>String(x.id));
assert.equal(alphabetIds.length,33,'Offline authority fixture requires exactly 33 Russian alphabet IDs');

const fontBytes=Buffer.from('offline-e2e-font-fixture-v1','utf8');
const licenseBytes=Buffer.from('offline-e2e-license-fixture-v1','utf8');
const coverage={
  schema:'RUSSIAN_HANDWRITING_GLYPH_COVERAGE_V1',
  alphabetIds,
  fontFamilies:['Offline E2E Handwriting'],
  reviewedAt:'2026-09-19T00:00:00.000Z',
  reviewedBy:'R-HW12 browser fixture'
};
const coverageBytes=Buffer.from(JSON.stringify(coverage),'utf8');
const relBase='subjects/russian/assets/handwriting-authority/offline-e2e/';
const fontRel=relBase+'fixture.woff2';
const licenseRel=relBase+'LICENSE.txt';
const coverageRel=relBase+'coverage.json';

fs.writeFileSync(path.join(authorityDir,'fixture.woff2'),fontBytes);
fs.writeFileSync(path.join(authorityDir,'LICENSE.txt'),licenseBytes);
fs.writeFileSync(path.join(authorityDir,'coverage.json'),coverageBytes);

const authoritySource=`'use strict';
(function(){
  window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY=Object.freeze({
    schema:'RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1',
    status:'ready',
    source:'bundled-vetted',
    trustedFamilies:Object.freeze(['Offline E2E Handwriting']),
    asset:'${fontRel}',
    assetSha256:'${digest(fontBytes)}',
    license:'${licenseRel}',
    licenseSha256:'${digest(licenseBytes)}',
    coverageManifest:'${coverageRel}',
    coverageSha256:'${digest(coverageBytes)}',
    verifiedAt:'2026-09-19T00:00:00.000Z',
    note:'R-HW12 isolated offline browser fixture'
  });
})();
`;
fs.writeFileSync(path.join(russianRoot,'assets','handwriting-glyph-authority.js'),authoritySource);

const swPath=path.join(russianRoot,'sw.js');
let sw=fs.readFileSync(swPath,'utf8');
const shellAnchor="'./assets/handwriting-glyph-authority.js','./assets/handwriting-recognition.js'";
if(!sw.includes(shellAnchor))throw new Error('R-HW12 could not find Russian Service Worker authority shell anchor');
sw=sw.replace(shellAnchor,
  "'./assets/handwriting-glyph-authority.js',"+
  "'./assets/handwriting-authority/offline-e2e/fixture.woff2',"+
  "'./assets/handwriting-authority/offline-e2e/LICENSE.txt',"+
  "'./assets/handwriting-authority/offline-e2e/coverage.json',"+
  "'./assets/handwriting-recognition.js'"
);
fs.writeFileSync(swPath,sw);

const server=http.createServer((req,res)=>{
  const file=safeFile(req.url||'/');
  if(!file||!fs.statSync(file,{throwIfNoEntry:false})?.isFile()){
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');return;
  }
  res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const address=server.address();
const base=`http://127.0.0.1:${address.port}/subjects/russian/`;

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
  await context.addInitScript(()=>{
    const original=CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText=function(text){
      const metrics=original.call(this,text);
      if(String(text)==='ДдЖжФфЯяШш'&&String(this.font).includes('Offline E2E Handwriting'))return {width:Number(metrics.width||0)+41};
      return metrics;
    };
    class OfflineE2EFontFace{
      constructor(family,source){this.family=family;this.source=source;this.status='unloaded';}
      async load(){this.status='loaded';return this;}
    }
    try{Object.defineProperty(window,'FontFace',{configurable:true,value:OfflineE2EFontFace});}catch(_){window.FontFace=OfflineE2EFontFace;}
    const fonts=document.fonts,proto=Object.getPrototypeOf(fonts);
    const originalCheck=fonts.check.bind(fonts);
    const fakeAdd=()=>fonts;
    const fakeCheck=(font,text)=>String(font).includes('Offline E2E Handwriting')?true:originalCheck(font,text);
    try{Object.defineProperty(fonts,'add',{configurable:true,value:fakeAdd});}catch(_){try{Object.defineProperty(proto,'add',{configurable:true,value:fakeAdd});}catch(__){}}
    try{Object.defineProperty(fonts,'check',{configurable:true,value:fakeCheck});}catch(_){try{Object.defineProperty(proto,'check',{configurable:true,value:fakeCheck});}catch(__){}}
  });

  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>navigator.serviceWorker?.ready&&!!window.RussianHandwritingRecognition?.getCapability,null,{timeout:15000});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>window.RussianHandwritingRecognition?.getCapability?.().canScore===true,null,{timeout:15000});

  // Reload once online so the page is under the installed Russian Service Worker.
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>navigator.serviceWorker?.controller&&window.RussianHandwritingRecognition?.getCapability?.().canScore===true,null,{timeout:15000});
  await page.locator('[data-view="writing"]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-ru-handwriting-choice]').length===4,null,{timeout:15000});

  const cached=await page.evaluate(async paths=>{
    const names=await caches.keys();
    const cache=await caches.open('russian-app-shell-v1');
    const checks={};
    for(const p of paths){
      const url=new URL(p,location.href).href;
      checks[p]=Boolean(await cache.match(url));
    }
    return {names,checks,controller:Boolean(navigator.serviceWorker.controller)};
  },[
    './assets/handwriting-glyph-authority.js',
    './assets/handwriting-authority/offline-e2e/fixture.woff2',
    './assets/handwriting-authority/offline-e2e/LICENSE.txt',
    './assets/handwriting-authority/offline-e2e/coverage.json'
  ]);
  assert.ok(cached.controller,'R-HW12 page is not controlled by the Russian Service Worker');
  for(const [asset,ok] of Object.entries(cached.checks))assert.equal(ok,true,'R-HW12 authority asset not cached: '+asset);

  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianHandwritingRecognition?.getCapability?.().canScore===true,null,{timeout:15000});
  await page.locator('[data-view="writing"]').first().click();
  await page.waitForFunction(()=>document.querySelector('.ru-handwriting-recognition')?.dataset.ruRecognitionState==='ready'&&document.querySelectorAll('[data-ru-handwriting-choice]').length===4,null,{timeout:15000});

  const offline=await page.evaluate(()=>({
    online:navigator.onLine,
    controlled:Boolean(navigator.serviceWorker?.controller),
    capability:window.RussianHandwritingRecognition.getCapability(),
    choiceCount:document.querySelectorAll('[data-ru-handwriting-choice]').length,
    state:window.RussianHandwritingRecognition.getState()
  }));
  assert.equal(offline.online,false,'R-HW12 browser did not enter offline mode');
  assert.equal(offline.controlled,true,'R-HW12 offline page lost Service Worker control');
  assert.equal(offline.capability.canScore,true,'Ready authority cannot score after full offline reload');
  assert.equal(offline.capability.mode,'approved-handwriting-authority');
  assert.equal(offline.capability.authority?.runtimeStatus,'verified');
  assert.equal(offline.capability.authority?.trusted,true);
  assert.equal(offline.choiceCount,4,'Offline ready authority did not expose four recognition choices');

  const before=Number(offline.state.attempts||0);
  await page.locator('[data-ru-handwriting-choice]').nth(1).click();
  await page.waitForFunction(n=>Number(window.RussianHandwritingRecognition.getState().attempts||0)===n+1,before,{timeout:10000});
  const scored=await page.evaluate(()=>window.RussianHandwritingRecognition.getState());
  assert.equal(scored.lastCorrect,false,'R-HW12 deterministic wrong choice did not record a scored miss offline');
  assert.deepEqual(errors,[],'R-HW12 emitted console/page errors');

  await page.screenshot({path:path.join(OUT,'ready-authority-offline.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',cached,offline:{...offline,state:undefined},scored},null,2));
  console.log('RUSSIAN_HANDWRITING_OFFLINE_AUTHORITY_BROWSER=PASS');
}finally{
  try{if(browser)await browser.close();}catch(_){}
  await new Promise(resolve=>server.close(()=>resolve()));
  fs.rmSync(tmp,{recursive:true,force:true});
}
