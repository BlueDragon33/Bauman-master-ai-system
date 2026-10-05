import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-truth-ux-cleanup';
fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
const errors=[],results=[],networkErrors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Ho_Chi_Minh'});
 const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))networkErrors.push({url:r.url(),status:r.status()})});
 await page.route('http://127.0.0.1:3003/**',async route=>{
  const pathname=new URL(route.request().url()).pathname,device={deviceId:'f'.repeat(64),deviceCode:'BM-HUB-QA',status:'approved'};
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'GET,POST,OPTIONS','content-type':'application/json'};
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
  const body=pathname.endsWith('/challenge')?{challengeId:'hub-cleanup',signingInput:'hub-cleanup'}:pathname.endsWith('/verify')?{device,sessionToken:'bm1.hub-cleanup',expiresAt:Date.now()+3600000}:{device};
  return route.fulfill({status:200,headers,body:JSON.stringify(body)});
 });
 await page.goto(process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden')&&window.BAUMAN_HUB_TRUTH?.selfCheck().patched);
 await page.evaluate(()=>{state.progress={};app.page('home',false);BAUMAN_HUB_SAFE.refresh()});
 const empty=await page.locator('#page-home .hub-safe-donut b').textContent();
 assert.equal(empty,'—','Home owner must not coerce missing progress to zero');
 await page.evaluate(()=>{state.progress={russian:0};BAUMAN_HUB_SAFE.refresh()});
 assert.equal(await page.locator('#page-home .hub-safe-donut b').textContent(),'0%');
 assert.ok((await page.locator('#page-home .hub-safe-overall').textContent()).includes('1/'),'Home must disclose partial coverage');
 await page.evaluate(()=>{state.subjectContracts={russian:{status:'registered',contractVersion:'1',readCapabilities:[{capability:'progressSummary',ttlSeconds:60}],sendCapabilities:[]}};state.subjectSummaries={russian:{progressSummary:{value:37,source:'public:russian',asOf:'2020-01-01T00:00:00Z'}}};app.page('subjects',false)});
 const stale=page.locator('#page-subjects [data-course-key="russian"]');
 assert.equal(await stale.getAttribute('data-truth-status'),'STALE');assert.ok((await stale.textContent()).includes('Chưa đồng bộ'));
 await page.evaluate(()=>app.openHomeFrame('progress'));
 assert.ok((await page.locator('#modalRoot').textContent()).includes('Chưa đồng bộ'),'progress modal must preserve stale disclosure');
 await page.evaluate(()=>closeModal());
 assert.equal(await page.locator('#page-subjects [onclick*="openEditor"]').count(),0);
 assert.ok(Number(await page.locator('#page-subjects .hub-v6-kpi b').first().textContent())>0,'chrome catalog count must come from Subjects owner');
 const heroColor=await page.locator('#page-subjects .hub-v6-hero h2').evaluate(el=>getComputedStyle(el).color);
 assert.ok(heroColor==='rgb(255, 255, 255)','dark shared hero must use readable on-media text');
 await page.evaluate(()=>{state.subjectContracts.russian.status='disabled';state.progress.russian=100;app.page('home',false)});
 assert.ok(!(await page.locator('.hub-safe-achievements').textContent()).includes('Hoàn thành 1 môn'),'Home achievements must not bypass unavailable contract');
 await page.evaluate(()=>app.page('subjects',false));
 assert.equal(await stale.locator('.subjects-page__course-actions .is-primary').isDisabled(),true,'unavailable launch must be visible and disabled');
 await page.evaluate(()=>{state.subjectContracts.russian.status='registered';app.subjects()});
 // Launch acceptance inspects only the declared outbound URL. Never fetch subject runtime.
 await page.route('**/subjects/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Public launch test transport</title>'}));
 await stale.locator('.subjects-page__course-actions .is-primary').click();
 assert.ok((await page.locator('#subjectFrame').getAttribute('src')).includes('subjects/russian/index.html'));
 await page.evaluate(()=>{app.closeStudy?.();document.getElementById('studyRoot').innerHTML='';state.subjectContracts={};state.subjectSummaries={};app.page('research',false)});
 assert.equal(await page.locator('[data-research-setup]').count(),1,'unconfigured workspace requires explicit setup');
 await page.locator('[data-research-configure]').click();
 assert.equal(await page.evaluate(()=>state.researchWorkspace.configured),true);
 await page.evaluate(()=>{let answers=['My milestone','2026-12-01','My work package','My attachment','https://example.org/paper'];window.prompt=()=>answers.shift();BAUMAN_THESIS_REF.addMilestone();BAUMAN_THESIS_REF.addWorkPackage();BAUMAN_THESIS_REF.addAttachment()});
 await page.locator('[aria-label="Trạng thái My work package"]').selectOption('done');
 await page.evaluate(()=>{BAUMAN_THESIS_REF.openCreate()});
 await page.fill('#thesisTaskTitle','Hub persisted task');
 await page.evaluate(()=>BAUMAN_THESIS_REF.createTask());
 assert.equal(await page.evaluate(()=>state.researchWorkspace.tasks.length),1);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
 await page.evaluate(()=>app.page('research',false));
 assert.ok((await page.locator('#page-research').textContent()).includes('Hub persisted task'),'task must survive Hub reload');
 assert.equal(await page.evaluate(()=>state.researchWorkspace.milestones[0].title),'My milestone');
 assert.equal(await page.evaluate(()=>state.researchWorkspace.workPackages[0].status),'done');
 assert.equal(await page.locator('a[href="https://example.org/paper"]').count(),1);
 await context.setOffline(true);
 await page.evaluate(()=>{window.prompt=()=> 'Offline Hub note';BAUMAN_THESIS_REF.addNote()});
 assert.ok((await page.locator('.thesis-page__notes').textContent()).includes('Offline Hub note'),'local planning remains usable offline in the loaded Hub');
 await context.setOffline(false);
 console.log('TRUTH_LAUNCH_WORKSPACE_PERSISTENCE_OFFLINE_PASS');
 const settling=[];
 for(const route of ['home','roadmap','subjects','schedule','research']){
  await page.evaluate(id=>app.page(id,false),route);await page.waitForTimeout(300);
  const changes=await page.evaluate(async id=>{const host=document.getElementById('page-'+id);let changes=0;const observer=new MutationObserver(rows=>changes+=rows.length);observer.observe(host,{childList:true});await new Promise(resolve=>setTimeout(resolve,300));observer.disconnect();return changes},route);
  assert.equal(changes,0,`${route} must settle without competing owner rerenders`);settling.push({route,changes});
 }
 const widths=process.env.HUB_QA_VIEWPORTS?process.env.HUB_QA_VIEWPORTS.split(',').map(Number):[1366,1440,1920,744,768,820,1024,375,390,393,430];
 for(const width of widths){
  await page.setViewportSize({width,height:width<744?844:1000});
  for(const route of ['home','roadmap','subjects','schedule','research']){
   await page.evaluate(id=>app.page(id,false),route);
   await page.waitForTimeout(100);
   const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,active:[...document.querySelectorAll('.page.active')].map(x=>x.id),nav:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page)}));
   assert.ok(geometry.scroll<=width+1,`${route} overflow at ${width}: ${geometry.scroll}`);
   assert.deepEqual(geometry.active,['page-'+route]);assert.deepEqual(geometry.nav,['home','roadmap','subjects','schedule','research']);
   if(route==='research'&&width<744){
    const action=await page.locator('#page-research .thesis-page__header-actions .thesis-page__button--primary').boundingBox();
    assert.ok(action.y+action.height<844-70,'phone primary task action must be above fixed bottom navigation');
   }
   if(['subjects','schedule','research'].includes(route)){
    const contrast=await page.locator('.page.active .hub-v6-hero').evaluate(hero=>{
     const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
     // The brightest stop of the fixed dark header, including its translucent gold overlay,
     // is bounded by rgb(60,60,60). Use that conservative bound rather than the darkest stop.
     const background=lum([60,60,60]);
     return [...hero.querySelectorAll('h2,p,b,small')].map(el=>{const style=getComputedStyle(el),rgb=style.color.match(/[\d.]+/g).slice(0,3).map(Number),text=lum(rgb);return {text:el.textContent,ratio:(Math.max(text,background)+.05)/(Math.min(text,background)+.05),size:parseFloat(style.fontSize)}});
    });
    assert.ok(contrast.every(x=>x.ratio>=4.5),`${route} hero contrast fails at ${width}`);
   }
   results.push({route,width,...geometry});
   await page.screenshot({path:path.join(OUT,`${route}-${width}.png`),fullPage:true});
  }
  console.log('VIEWPORT_PASS '+width);
 }
 await page.evaluate(()=>app.page('research',false));
 const primary=page.locator('#page-research .thesis-page__header-actions .thesis-page__button--primary');
 await primary.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const focus=await primary.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {active:document.activeElement===el,outline:s.outlineStyle,width:parseFloat(s.outlineWidth),height:r.height}});
 assert.equal(focus.active,true);assert.notEqual(focus.outline,'none');assert.ok(focus.width>=2);assert.ok(focus.height>=44);
 assert.deepEqual(errors,[]);
 assert.deepEqual(networkErrors,[]);
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),results,settling,focus,errors,networkErrors,offline:'LOCAL_HUB_IN_SESSION_PASS; cold offline reload outside existing Hub capability',subjectInternalReads:false},null,2));
 console.log('HUB_TRUTH_UX_CLEANUP_BROWSER_PASS '+results.length+' route/viewport checks');
}finally{await browser.close()}
