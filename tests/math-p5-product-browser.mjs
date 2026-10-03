import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-p5-product';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage(),errors=[],failed=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('pageerror',e=>errors.push(String(e?.stack||e)));
 page.on('requestfailed',r=>failed.push(r.url()+' '+(r.failure()?.errorText||'')));
 await page.goto(BASE+'subjects/math/index.html?host=main&hostOrigin='+encodeURIComponent(new URL(BASE).origin)+'&subjectId=math&taskId=math05-e2e&stage=prepare',{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.BAUMAN_MATH_PRODUCT&&window.BAUMAN_MATH_CAPABILITIES&&window.BAUMAN_MATH_NAVIGATION,null,{timeout:30000});
 const base=await page.evaluate(()=>({
   product:window.BAUMAN_MATH_PRODUCT.selfCheck(),
   caps:window.BAUMAN_MATH_CAPABILITIES.selfCheck(),
   nav:[...document.querySelectorAll('#nav button,[data-math-nav]')].map(x=>x.textContent.trim()).filter(Boolean).slice(0,20),
   title:document.title
 }));
 assert.equal(base.product.platformFork,false);
 assert.equal(base.product.capabilityFacade,true);
 assert.equal(base.product.keyboardCriticalInputs,true);
 assert.equal(base.caps.masteryWrites,false);
 assert.equal(base.caps.academicWrites,false);

 const tool=await page.evaluate(async()=>({
   numeric:await window.BAUMAN_MATH_PRODUCT.invoke('math.numeric.evaluate',{expression:'2+3*4'}),
   symbolic:await window.BAUMAN_MATH_PRODUCT.invoke('math.symbolic.solve',{expression:'x^2-1'}),
   graph:await window.BAUMAN_MATH_PRODUCT.invoke('math.graph.sample',{expression:'1/x',min:-1,max:1,samples:21})
 }));
 assert.equal(tool.numeric.status,'OK');assert.equal(tool.numeric.data.value,14);
 assert.equal(tool.symbolic.status,'UNAVAILABLE');
 assert.equal(tool.numeric.masteryWrite,false);assert.equal(tool.graph.academicWrite,false);
 assert.ok(tool.graph.data.accessibleSummary,'Graph result lacks accessible summary');

 const input=await page.evaluate(()=>window.BAUMAN_MATH_PRODUCT.inputDescriptor('unit_quantity'));
 assert.equal(input.control,'number+unit');assert.equal(input.keyboard,true);

 for(const vp of [{width:1024,height:768},{width:390,height:844}]){
   await page.setViewportSize(vp);await page.waitForTimeout(150);
   const o=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(o.scroll<=o.client+2,'MATH05 page overflow '+vp.width+': '+o.scroll+'/'+o.client);
 }
 await page.screenshot({path:path.join(OUT,'math05-mobile-390x844.png'),fullPage:false});
 assert.deepEqual(errors,[],'MATH05 browser console/page errors');
 assert.deepEqual(failed,[],'MATH05 browser failed requests');
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',product:base.product,tool:{numeric:tool.numeric.status,symbolic:tool.symbolic.status,graph:tool.graph.status}},null,2));
 console.log('MATH05_PRODUCT_BROWSER_PASS');
}finally{await browser?.close()}
