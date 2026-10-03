import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-data-truth';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-TRUTH-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-truth-e2e',signingInput:'bauman-truth-e2e:'+deviceId});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.truth-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_HUB_TRUTH?.selfCheck?.().patched===true,null,{timeout:15000});

  const semantics=await page.evaluate(()=>{
    const t=window.BAUMAN_HUB_TRUTH;
    return {
      self:t.selfCheck(),
      zero:t.progress({x:0},'x'),
      missing:t.progress({},'x'),
      partial:t.averageProgress({a:0},['a','b']),
      local:t.local(3,{source:'qa.local'})
    };
  });
  assert.equal(semantics.zero.status,'CURRENT');
  assert.equal(semantics.zero.value,0);
  assert.equal(semantics.missing.status,'UNAVAILABLE');
  assert.equal(semantics.missing.value,null);
  assert.equal(semantics.partial.status,'STALE');
  assert.equal(semantics.partial.value,0);
  assert.equal(semantics.local.status,'LOCAL_HUB');

  const roadmap=await page.evaluate(()=>{
    state.progress={};
    save();
    app.page('roadmap',false);
    window.BAUMAN_HUB_ROADMAP_V4?.render?.();
    const empty=[...document.querySelectorAll('#page-roadmap .hub-rm-stage-progress')].map(x=>({status:x.dataset.truthStatus,text:x.querySelector('b')?.textContent}));
    const sid=Object.keys(state.subjects||{})[0];
    state.progress[sid]=0;
    save();
    window.BAUMAN_HUB_ROADMAP_V4?.render?.();
    const after=[...document.querySelectorAll('#page-roadmap .hub-rm-stage-progress')].map(x=>({status:x.dataset.truthStatus,text:x.querySelector('b')?.textContent}));
    return {sid,empty,after,nav:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page)};
  });
  assert.deepEqual(roadmap.nav,['home','roadmap','subjects','schedule','research']);
  assert.ok(roadmap.empty.length>=4,'Roadmap truth-state progress surfaces missing');
  assert.ok(roadmap.empty.every(x=>x.text==='—'),'Missing Roadmap progress rendered as numeric zero');
  assert.ok(roadmap.after.some(x=>x.text==='0%'),'A genuine stored zero disappeared from Roadmap projection');

  await page.screenshot({path:path.join(OUT,'hub-data-truth-roadmap.png'),fullPage:true});
  assert.deepEqual(errors,[],'Hub data truth browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({semantics,roadmap},null,2));
  console.log('HUB_DATA_TRUTH_BROWSER_PASS');
}finally{
  await browser?.close();
}
