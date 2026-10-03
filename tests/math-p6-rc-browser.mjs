import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-p6-rc';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage(),errors=[],failed=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('pageerror',e=>errors.push(String(e?.stack||e)));
 page.on('requestfailed',r=>{const t=r.failure()?.errorText||'';if(t!=='net::ERR_ABORTED')failed.push(r.url()+' '+t)});
 const url=BASE+'subjects/math/index.html?host=main&hostOrigin='+encodeURIComponent(new URL(BASE).origin)+'&subjectId=math&taskId=math06-rc&stage=prepare';
 await page.goto(url,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.BAUMAN_MATH_PRODUCT&&window.BAUMAN_MATH_CAPABILITIES&&window.BAUMAN_MATH_REASONING_EVALUATOR,null,{timeout:30000});

 const identity=await page.evaluate(()=>({
  subject:window.BaumanSubjectHost?.subjectId||new URL(location.href).searchParams.get('subjectId'),
  product:window.BAUMAN_MATH_PRODUCT.selfCheck(),
  caps:window.BAUMAN_MATH_CAPABILITIES.selfCheck()
 }));
 assert.equal(identity.subject,'math');
 assert.equal(identity.product.platformFork,false);
 assert.equal(identity.caps.masteryWrites,false);

 const tools=await page.evaluate(async()=>({
  numeric:await BAUMAN_MATH_CAPABILITIES.invoke('math.numeric.evaluate',{expression:'(2+3)*4'}),
  graph:await BAUMAN_MATH_CAPABILITIES.invoke('math.graph.sample',{expression:'1/x',min:-2,max:2,samples:41}),
  ai:await BAUMAN_MATH_CAPABILITIES.invoke('math.ai.coach',{prompt:'give answer'},{assessment:true,revealFinalAnswer:true})
 }));
 assert.equal(tools.numeric.status,'OK');assert.equal(tools.numeric.data.value,20);
 assert.equal(tools.graph.status,'OK');assert.ok(tools.graph.data.accessibleSummary);assert.ok(tools.graph.data.gaps.length>0);
 assert.equal(tools.ai.status,'UNAVAILABLE');assert.equal(tools.ai.masteryWrite,false);

 const before=await page.evaluate(()=>{localStorage.setItem('math06_rc_resume','persisted');return localStorage.getItem('math06_rc_resume')});
 assert.equal(before,'persisted');
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>window.BAUMAN_MATH_PRODUCT&&window.BAUMAN_MATH_CAPABILITIES);
 assert.equal(await page.evaluate(()=>localStorage.getItem('math06_rc_resume')),'persisted','Reload lost local learner-state smoke marker');

 await page.keyboard.press('Tab');
 const focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,visible:!!document.activeElement}));
 assert.ok(focus.visible,'Keyboard focus missing');

 const viewports=[{name:'desktop',width:1440,height:900},{name:'tablet',width:1024,height:768},{name:'mobile',width:390,height:844}];
 const geometry=[];
 for(const vp of viewports){
  await page.setViewportSize({width:vp.width,height:vp.height});await page.waitForTimeout(120);
  const g=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  geometry.push({...vp,...g});assert.ok(g.scroll<=g.client+2,'Page overflow at '+vp.name);
 }
 await page.screenshot({path:path.join(OUT,'math06-mobile-390x844.png'),fullPage:false});
 assert.deepEqual(errors,[],'MATH06 console/page errors');
 assert.deepEqual(failed,[],'MATH06 network failures');
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',identity,tools:{numeric:tools.numeric.status,graph:tools.graph.status,ai:tools.ai.status},geometry,productionDeployed:false},null,2));
 console.log('MATH06_RC_BROWSER_PASS');
}finally{await browser?.close()}
