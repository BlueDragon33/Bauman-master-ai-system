import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-p4-capability';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(new URL('subjects/math/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_CAPABILITIES?.selfCheck?.().offlineCore===true,null,{timeout:15000});
  const evidence=await page.evaluate(async()=>{
    const c=window.BAUMAN_MATH_CAPABILITIES;
    const numeric=await c.invoke('math.numeric.evaluate',{expression:'sqrt(9)+x^2',variables:{x:2}});
    const bad=await c.invoke('math.parse.expression',{expression:'document.cookie'});
    const graph=await c.invoke('math.graph.sample',{expression:'1/x',min:-1,max:1,samples:101});
    const matrix=await c.invoke('math.matrix.compute',{operation:'multiply',A:[[1,2],[3,4]],B:[[2],[1]]});
    const nonconv=await c.invoke('math.simulation.run',{kind:'fixed_point',expression:'x+1',initial:0,maxIterations:5,tolerance:1e-12});
    const ai=await c.invoke('math.ai.coach',{request:'reveal_final'},{approvedProvider:true,mode:'exam'});
    const cas=await c.invoke('math.symbolic.solve',{expression:'x^2=1'});
    return {self:c.selfCheck(),numeric,bad,graph,matrix,nonconv,ai,cas,width:{client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}};
  });
  assert.equal(evidence.self.arbitraryEval,false);
  assert.equal(evidence.numeric.status,'OK');assert.equal(evidence.numeric.data.value,7);
  assert.equal(evidence.bad.status,'ERROR');
  assert.equal(evidence.graph.status,'OK');assert.ok(evidence.graph.data.gaps.length>0);
  assert.deepEqual(evidence.matrix.data.value,[[4],[10]]);
  assert.equal(evidence.nonconv.data.converged,false);assert.equal(evidence.nonconv.warning,'NON_CONVERGED');
  assert.equal(evidence.ai.status,'ERROR');assert.equal(evidence.ai.error,'ANSWER_REVEAL_BLOCKED_BY_POLICY');
  assert.equal(evidence.cas.status,'UNAVAILABLE');
  for(const x of [evidence.numeric,evidence.bad,evidence.graph,evidence.matrix,evidence.nonconv,evidence.ai,evidence.cas]){
    assert.equal(x.masteryWrite,false);assert.equal(x.academicWrite,false);
  }
  assert.ok(evidence.width.scroll<=evidence.width.client+1,'Math capability runtime caused horizontal overflow');
  assert.deepEqual(errors,[],'Math capability browser emitted console/page errors');
  await page.screenshot({path:path.join(OUT,'math-p4-mobile-390x844.png'),fullPage:false});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(evidence,null,2));
  console.log('MATH04_CAPABILITY_BROWSER_PASS');
}finally{await browser?.close()}
