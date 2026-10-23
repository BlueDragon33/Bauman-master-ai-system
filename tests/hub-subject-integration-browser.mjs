import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-subject-integration';
fs.mkdirSync(OUT,{recursive:true});
const MAIN='bauman_main_all_phases_subjects_v1',checks=[];
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
try{
 const context=await browser.newContext();
 const adminFixture=process.env.BAUMAN_E2E_EXPECT_PLATFORM_ACCESS==='1';
 if(adminFixture)await context.route(BASE,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
 // Public launch fixtures intercept every subject URL before the server can
 // access a subject file. The fixture emits only the existing ready contract.
 const fixture=`<!doctype html><title>Public learner fixture</title><script>const subjectId=new URL(location.href).searchParams.get('subjectId');addEventListener('message',e=>{if(e.data?.type==='BAUMAN_ASSIGN_TASK')parent.postMessage({type:'TEST_ONLY_TASK_OBSERVED',task:e.data},location.origin)});parent.postMessage({type:'BAUMAN_SUBJECT_READY',subjectId},location.origin);</script>`;
 await context.route('**/subjects/**',route=>route.fulfill({contentType:'text/html',body:fixture}));
 await context.route('**/public-fixtures/**',route=>route.fulfill({contentType:'text/html',body:fixture}));
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(({MAIN})=>{
  if(sessionStorage.getItem('integration-seeded'))return;
  sessionStorage.setItem('integration-seeded','1');
  localStorage.setItem(MAIN,JSON.stringify({subjects:{math:{mainPath:'public-fixtures/math-learn.html',editorPath:'public-fixtures/math-editor.html',priority:'q2'}},lastStudy:{subjectId:'math',path:'public-fixtures/math-learn.html'},progress:{math:0},researchFiles:{}}));
 },{MAIN});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
 const migrated=await page.evaluate(async MAIN=>{
  const config=window.BAUMAN_HUB_SUBJECT_CONFIG; if(!config)throw Error('Hub descriptor/config boundary missing');
  const store=window.BAUMAN_HUB_PERSONAL_STORE;
  return {descriptor:config.getDescriptor('math'),configuration:config.getConfiguration('math'),state:window.state,bundle:await store.exportBundle(),stored:store.get(MAIN),scope:store.scopeId};
 },MAIN);
 assert.equal(migrated.configuration.entry,'public-fixtures/math-learn.html');
 assert.equal(migrated.configuration.editor,'public-fixtures/math-editor.html');
 assert.equal(migrated.descriptor.authoring,null,'An editor path must not create an authoring capability');
 assert.equal(migrated.state.progress.math,0);assert.equal(migrated.state.subjects.math.priority,'q2');
 for(const data of [migrated.state,migrated.stored,migrated.bundle])for(const key of ['mainPath','editorPath','public-fixtures/math-learn.html'])assert.ok(!JSON.stringify(data).includes(key),'Transport leaked into learner state/backup');
 checks.push('legacy custom overrides migrated once to device config; learner zero/priority preserved; durable state and backup exclude transport');
 await page.evaluate(()=>{window.integrationTaskObserved=null;window.addEventListener('message',e=>{if(e.data?.type==='TEST_ONLY_TASK_OBSERVED')window.integrationTaskObserved=e.data.task});window.app.openSubjectInPage('math',{learningItem:'Integration fixture'})});
 try{await page.waitForFunction(()=>window.integrationTaskObserved?.subjectId==='math')}catch(error){console.log('LAUNCH_DIAGNOSTIC',await page.evaluate(()=>({src:document.getElementById('subjectFrame')?.src,task:state.activeTask,observed:window.integrationTaskObserved,viewer:document.getElementById('studyRoot').innerHTML.slice(0,300)})),errors);throw error}
 const launch=await page.evaluate(()=>({src:document.getElementById('subjectFrame').src,task:window.integrationTaskObserved,state:window.state.lastStudy}));
 assert.equal(new URL(launch.src).pathname,'/public-fixtures/math-learn.html');
 assert.equal(new URL(launch.src).searchParams.get('protocol'),'planning-v3');
 assert.equal(launch.task.type,'BAUMAN_ASSIGN_TASK');assert.equal(launch.task.subjectId,'math');
 assert.equal(launch.task.protocol,'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS');assert.ok(Array.isArray(launch.task.sessions));assert.ok(launch.task.missionId);
 assert.equal(launch.state.path,undefined);checks.push('adapter in-Hub launch retains task query, ready handshake and task handoff');
 await page.evaluate(()=>{document.getElementById('studyRoot').innerHTML=''});
 const popupPromise=context.waitForEvent('page');await page.evaluate(()=>app.openSubjectTab('math'));const popup=await popupPromise;
 await popup.waitForLoadState('domcontentloaded');assert.equal(new URL(popup.url()).pathname,'/public-fixtures/math-learn.html');await popup.close();checks.push('adapter tab launch retains declared target');
 for(const entry of ['', 'javascript:alert(1)','https://user:pass@example.com/']){
  const unavailable=await page.evaluate(async entry=>{await BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{entry});document.getElementById('studyRoot').innerHTML='';const result=app.openSubjectInPage('math');return {result,state:BAUMAN_HUB_SUBJECT_LAUNCH.getLaunchState('math'),frame:!!document.getElementById('subjectFrame')}},entry);
  assert.equal(unavailable.state.status,'UNAVAILABLE');assert.equal(unavailable.frame,false);assert.equal(unavailable.result.status,'UNAVAILABLE');
 }
 assert.equal(await page.evaluate(()=>BAUMAN_HUB_SUBJECT_LAUNCH.getLaunchState('unknown').status),'UNAVAILABLE');
 await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{entry:'public-fixtures/math-learn.html'}));checks.push('missing/unsafe/credentialed/unknown targets are UNAVAILABLE without navigation');
 async function assertMathLaunch(action){await page.evaluate(()=>{document.getElementById('studyRoot').innerHTML='';window.integrationTaskObserved=null});await action();await page.waitForFunction(()=>window.integrationTaskObserved?.subjectId==='math');assert.equal(new URL(await page.locator('#subjectFrame').getAttribute('src')).pathname,'/public-fixtures/math-learn.html');}
 await assertMathLaunch(()=>page.evaluate(()=>{state.lastStudy={subjectId:'math'};app.continueStudy()}));
 await assertMathLaunch(()=>page.evaluate(()=>{state.schedule.edit=false;state.schedule.entries['2026-10-08|afternoon']={subjectId:'math',itemId:'integration-slot',learningItem:'Schedule fixture',source:'manual'};openScheduleSlot('2026-10-08','afternoon')}));
 assert.equal(await page.evaluate(()=>state.activeTask.date),'2026-10-08');
 await assertMathLaunch(()=>page.evaluate(()=>BAUMAN_SUBJECTS_REF.openSubject('math')));
 await assertMathLaunch(async()=>{await page.evaluate(()=>{state.subject='math';mentor.ask('giải thích nội dung đang học')});await page.locator('#aiLog button').last().click()});
 await assertMathLaunch(async()=>{await page.evaluate(()=>{app.page('home');BAUMAN_HUB_OVERVIEW_SEARCH_V2.openSearch('toan')});await page.locator('[data-hub-search-kind="subject"][data-hub-search-subject="math"]').first().click();await page.waitForFunction(()=>state.subject==='math'&&document.getElementById('page-subjects').classList.contains('active'));await page.locator('#page-subjects .subjects-page__course-actions button[onclick*="math"]').first().click()});
 checks.push('Home continue, Schedule mission context, reference Subjects, mentor and global search preserve adapter launch');
 const cleanEditor=await page.evaluate(()=>{app.page('subjects');app.subjects();return {canonical:app.subjectDetailHTML(state.subjects.math),reference:document.getElementById('page-subjects').innerHTML}});
 for(const html of Object.values(cleanEditor))assert.doesNotMatch(html,/openSubjectEditor|openEditor|Dữ liệu môn/);
 checks.push('canonical and reference learner surfaces contain no direct editor');
 const configBefore=await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('math'));
 await page.evaluate(async MAIN=>{const bundle=await BAUMAN_HUB_PERSONAL_STORE.exportBundle();bundle.records[MAIN].subjects.math.mainPath='public-fixtures/foreign.html';bundle.records[MAIN].subjects.math.editorPath='public-fixtures/foreign-editor.html';await BAUMAN_HUB_PERSONAL_STORE.importBundle(bundle,{normalizeState});},MAIN);
 assert.deepEqual(await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('math')),configBefore);
 assert.ok(!JSON.stringify(await page.evaluate(()=>BAUMAN_HUB_PERSONAL_STORE.exportBundle())).includes('mainPath'));checks.push('portable restore cannot alter device config or restore raw transport');
 await page.evaluate(async()=>{await BAUMAN_HUB_PERSONAL_STORE.initialize({profile:{email:'second@example.com',name:'Second',role:'user'}});await BAUMAN_HUB_SUBJECT_CONFIG.initialize({legacyState:{subjects:{math:{mainPath:'public-fixtures/second.html'}}},scopeId:'second@example.com'});});
 assert.deepEqual(await page.evaluate(()=>BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('math')),configBefore);
 assert.equal(await page.evaluate(()=>app.openSubjectEditor('math')),false,'Non-admin editor access must remain denied');
 assert.equal(await page.evaluate(async()=>{try{await BAUMAN_HUB_SUBJECT_CONFIG.setOverride('math',{entry:'public-fixtures/unauthorized.html'});return false}catch{return true}}),true);
 checks.push('second profile does not clone/overwrite the global config; non-admin config/editor access denied');
 assert.deepEqual(errors,[]);
 await context.close();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',checks,subjectPrivateReads:false,subjectFileRequestsIntercepted:true,accessScope:adminFixture?'explicit standalone admin HTML with actual packaged assets':'source standalone Hub'},null,2));
 console.log('HUB_SUBJECT_INTEGRATION_BROWSER_PASS',checks.length);
}finally{await browser.close()}
