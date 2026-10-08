import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-subject-config';
fs.mkdirSync(OUT,{recursive:true});
const MAIN='bauman_main_all_phases_subjects_v1',checks=[];
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
try{
 for(const role of ['admin','user']){
  const delayed=await browser.newContext(),p=await delayed.newPage();
  if(process.env.BAUMAN_E2E_EXPECT_PLATFORM_ACCESS==='1')await delayed.route(BASE,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
  await delayed.route('**/subjects/**',r=>r.fulfill({body:'Public fixture'}));
  await p.addInitScript(role=>{
   localStorage.setItem('bauman_current_user_fullcode_v1',JSON.stringify({email:role+'@fixture.local',name:role,role}));
   const open=indexedDB.open.bind(indexedDB);
   indexedDB.open=(...args)=>{
    const request=open(...args);if(args[0]!=='bauman-hub-application')return request;
    return new Proxy(request,{get:(target,key)=>Reflect.get(target,key,target),set(target,key,value){target[key]=key==='onsuccess'?event=>setTimeout(()=>value.call(target,event),1200):value;return true}});
   };
  },role);
  await p.goto(BASE);await p.waitForFunction(()=>BAUMAN_APP_MANAGER_ACCESS.selfCheck().ready);
  const early=await p.evaluate(()=>({access:BAUMAN_APP_MANAGER_ACCESS.selfCheck(),profile:BAUMAN_HUB_PERSONAL_STORE.currentUser(),configStatus:BAUMAN_HUB_SUBJECT_CONFIG.status,launch:BAUMAN_HUB_SUBJECT_LAUNCH.getLaunchState('math').status}));
  assert.equal(early.profile.role,role);assert.equal(early.configStatus,'UNAVAILABLE');assert.equal(early.launch,'UNAVAILABLE');
  assert.equal(early.access.localAdminVisible,role==='admin','Resolved standalone role must render before access readiness exposes controls during slow config initialization');
  await p.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  if(role==='user')assert.equal(await p.evaluate(async()=>{try{await BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{entry:'forbidden.html'});return false}catch{return true}}),true);
  await delayed.close();
 }
 checks.push('slow real IndexedDB config open preserves resolved admin/learner role visibility and keeps launches unavailable until initialization');
 const context=await browser.newContext(),page=await context.newPage();
 if(process.env.BAUMAN_E2E_EXPECT_PLATFORM_ACCESS==='1')await context.route(BASE,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
 await context.route('**/subjects/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Unused public fixture</title>'}));
 await page.addInitScript(MAIN=>{
  if(!sessionStorage.getItem('failure-seeded')){sessionStorage.setItem('failure-seeded','1');sessionStorage.setItem('fail-config','1');localStorage.setItem(MAIN,JSON.stringify({subjects:{math:{mainPath:'custom-retry.html',editorPath:'custom-retry-editor.html',priority:'q2'}},progress:{math:0},researchFiles:{}}));}
  const put=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){if(this.transaction.db.name==='bauman-hub-application'&&sessionStorage.getItem('fail-config'))throw new DOMException('Fixture application config quota failure','QuotaExceededError');return put.apply(this,args)};
 },MAIN);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const failed=await page.evaluate(async MAIN=>{await BAUMAN_HUB_PERSONAL_READY.catch(()=>{});await BAUMAN_HUB_PERSONAL_STORE.flush();return {raw:BAUMAN_HUB_PERSONAL_STORE.get(MAIN),status:BAUMAN_HUB_SUBJECT_CONFIG.status,bundle:await BAUMAN_HUB_PERSONAL_STORE.exportBundle()}},MAIN);
 assert.equal(failed.status,'UNAVAILABLE');
 assert.equal(failed.raw.subjects.math.mainPath,'custom-retry.html','A failed config migration must retain the committed legacy override for retry');
 assert.equal(failed.raw.progress.math,0);assert.ok(!JSON.stringify(failed.bundle).includes('mainPath'));
 assert.equal(await page.locator('#hubPersonalStorageStatus button').count(),1,'Failed config migration must expose recoverable learner backup');
 const recovery=await page.evaluate(async MAIN=>({bundle:await app.exportBackup(),raw:BAUMAN_HUB_PERSONAL_STORE.get(MAIN)}),MAIN);
 assert.equal(recovery.raw.subjects.math.mainPath,'custom-retry.html','Recovery UI must not save default runtime state over the original legacy configuration');
 assert.equal(recovery.bundle.records[MAIN].progress.math,0);
 checks.push('application config write failure preserves original scoped legacy override and learner progress while backup remains config-free');
 await page.evaluate(()=>{sessionStorage.removeItem('fail-config');localStorage.clear()});
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
 const retry=await page.evaluate(async MAIN=>({config:BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('math'),stored:BAUMAN_HUB_PERSONAL_STORE.get(MAIN),bundle:await BAUMAN_HUB_PERSONAL_STORE.exportBundle()}),MAIN);
 assert.equal(retry.config.entry,'custom-retry.html');assert.equal(retry.config.editor,'custom-retry-editor.html');
 assert.equal(retry.stored.subjects.math.mainPath,undefined);assert.equal(retry.stored.progress.math,0);
 checks.push('retry transfers original IndexedDB override after legacy localStorage source removal and commits cleaned learner state');
 const other=await context.newPage();await other.goto(BASE);await other.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
 await Promise.all([page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{entry:'concurrent-entry.html'})),other.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{editor:'concurrent-editor.html'}))]);
 await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.initialize());
 assert.deepEqual(await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('math')),{entry:'concurrent-entry.html',editor:'concurrent-editor.html'});
 checks.push('concurrent admin tabs merge unrelated fields atomically instead of overwriting cached config');
 await other.close();await context.close();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',checks,subjectPrivateReads:false},null,2));console.log('HUB_SUBJECT_CONFIG_BROWSER_PASS',checks.length);
}finally{await browser.close()}
