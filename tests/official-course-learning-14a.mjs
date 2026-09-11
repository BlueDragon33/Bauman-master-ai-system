import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='b'.repeat(64),deviceCode='BM-14A-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14a',signingInput:`bauman-14a:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14a',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));
await mockControl(page);
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
await page.locator('#loginBtn').click();
await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
await page.waitForFunction(()=>Boolean(window.BAUMAN_OFFICIAL_COURSE_LEARNING_2026?.getArchitecture?.()&&window.app?.__courseLearning14aPatched),null,{timeout:15000});

const model=await page.evaluate(()=>{
  const rt=window.BAUMAN_OFFICIAL_COURSE_LEARNING_2026,arch=rt.getArchitecture();
  return {
    version:rt.version,
    readOnly:rt.readOnly,
    courses:arch.courseBlueprints.map(x=>x.courseId),
    defaultLane:arch.policy.defaultLane,
    schedulerMutation:arch.policy.schedulerMutation,
    contentMutation:arch.policy.courseContentMutation,
    d03:rt.courseModel('d03'),
    p02:rt.courseModel('p02')
  };
});
assert.equal(model.version,'Official Course Learning · Pass 14A');
assert.equal(model.readOnly,true);
assert.equal(model.schedulerMutation,false);
assert.equal(model.contentMutation,false);
assert.deepEqual(model.courses,['d01','d02','d03','d04','d05','d06','d15','p02']);
assert.deepEqual(model.defaultLane,['PREREQUISITE_ASSURANCE','COURSE_CORE','GRADED_EVENT','EVIDENCE_REUSE']);
assert.equal(model.d03.course.credits,4);
assert.deepEqual(model.d03.blueprint.criticalGates,['P3','P9']);
assert.equal(model.p02.course.credits,21);
assert.equal(model.p02.course.hours,756);

await page.waitForSelector('[data-course-learning14a="home"]');
assert.equal(await page.locator('.course14a-card').count(),8);
assert.equal(await page.getByText('Official Course Learning Architecture · HK1',{exact:true}).count(),1);

await page.locator('.course14a-card').filter({hasText:'d03'}).click();
await page.waitForSelector('.course14a-modal');
assert.equal(await page.getByText('PUBLIC IU5 EVIDENCE',{exact:true}).count(),1);
assert.equal(await page.getByText('iu5_analytical_models_public',{exact:true}).count(),1);
await page.locator('#modalRoot .btn').filter({hasText:'Đóng'}).click().catch(()=>{});

await page.locator('.course14a-card').filter({hasText:'p02'}).click();
await page.waitForSelector('.course14a-modal');
const modalText=await page.locator('.course14a-modal').innerText();
must(modalText.includes('21 cr · 756 h'),'p02 official 21cr/756h missing from modal');
must(modalText.includes('iu5_nir_public'),'p02 public NIR evidence missing');

await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>{document.getElementById('modalRoot').innerHTML='';window.app.page('home',false);window.app.home()});
await page.waitForSelector('[data-course-learning14a="home"]');
const mobile=await page.evaluate(()=>{const root=document.getElementById('page-home'),grid=document.querySelector('.course14a-grid');return{client:root?.clientWidth||0,scroll:root?.scrollWidth||0,columns:grid?getComputedStyle(grid).gridTemplateColumns:''}});
must(mobile.scroll<=mobile.client+2,`Pass14A mobile overflow: ${JSON.stringify(mobile)}`);
must(mobile.columns.trim().split(/\s+/).length===1,`Pass14A grid is not one column: ${mobile.columns}`);
assert.deepEqual(errors,[],'Page errors detected during Pass14A browser acceptance');

await context.close();
await browser.close();
console.log('PASS14A browser acceptance',JSON.stringify({courses:model.courses.length,mobile}));
