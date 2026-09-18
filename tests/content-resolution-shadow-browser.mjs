import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/content-resolution-shadow-browser';
const profile=JSON.parse(fs.readFileSync('foundation/content-resolution/shadow/academic-core-2026.v1.json','utf8'));
fs.mkdirSync(OUT,{recursive:true});

const summary={status:'RUNNING',consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[],resources:[]};
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();
  page.on('console',message=>{if(message.type()==='error')summary.consoleErrors.push(message.text())});
  page.on('pageerror',error=>summary.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>summary.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`));
  page.on('response',response=>{if(response.status()>=400)summary.httpErrors.push(`${response.status()} ${response.url()}`)});

  await page.goto(new URL('foundation/content-resolution/examples/browser-shadow-harness.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  const scripts=[
    'foundation/domain-model/canonical-identity-runtime.js',
    'foundation/content-registry/content-asset-registry.js',
    'foundation/content-registry/access-policy.js',
    'foundation/content-registry/asset-integrity.js',
    'foundation/content-resolution/runtime-resource-resolver.js',
    'foundation/content-resolution/runtime-delivery-plan.js',
    'foundation/content-resolution/runtime-delivery-executor.js',
    'foundation/content-resolution/adapters/package-relative-fetch-adapter.js'
  ];
  for(const relative of scripts)await page.addScriptTag({url:new URL(relative,BASE).href});

  const result=await page.evaluate(async({profile,base})=>{
    const hex=buffer=>Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('');
    const sha=async bytes=>hex(await crypto.subtle.digest('SHA-256',bytes));
    let registry=window.BaumanContentAssetRegistry.emptyRegistry();
    const direct={};
    for(const row of profile.resources){
      const response=await fetch(new URL(row.path,base).href,{cache:'no-cache'});
      if(!response.ok)throw new Error(`SHADOW_DIRECT_HTTP_${response.status}:${row.path}`);
      const buffer=await response.arrayBuffer();
      const bytes=new Uint8Array(buffer);
      const digest=await sha(bytes);
      direct[row.id]=JSON.parse(new TextDecoder().decode(bytes));
      const checksumId=`bdr:checksum:academic-shadow:${row.id}`;
      const assetId=`bdr:asset:academic-shadow:${row.id}`;
      registry=window.BaumanContentAssetRegistry.appendRecord(registry,{registryId:checksumId,algorithm:'sha256',digest,byteLength:bytes.byteLength,recordVersion:1});
      registry=window.BaumanContentAssetRegistry.appendRecord(registry,{registryId:assetId,canonicalEntityId:`bd:artifact:academic-shadow:${row.id}`,assetType:'document',mediaType:'application/json',checksumId,locators:[{kind:'repository_relative',value:row.path}],state:'verified',recordVersion:1});
    }
    const before=JSON.stringify(registry);
    const rows=[];
    for(const row of profile.resources){
      const assetId=`bdr:asset:academic-shadow:${row.id}`;
      const descriptor=window.BaumanRuntimeResourceResolver.resolve(registry,{
        targetRegistryId:assetId,
        mode:'learner_runtime',
        accessContext:{private:true},
        runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}
      });
      const plan=window.BaumanRuntimeDeliveryPlan.buildPlan(registry,descriptor);
      const adapter=window.BaumanPackageRelativeFetchAdapter.create({baseUrl:base});
      let parsed=null;
      const execution=await window.BaumanRuntimeDeliveryExecutor.execute(plan,{[adapter.adapterId]:adapter.load},async payload=>{
        parsed=JSON.parse(new TextDecoder().decode(payload));
      });
      rows.push({
        id:row.id,
        descriptorStatus:descriptor.status,
        planStatus:plan.status,
        executionStatus:execution.status,
        parity:JSON.stringify(parsed)===JSON.stringify(direct[row.id]),
        digest:execution.integrity?.digest||null,
        byteLength:execution.integrity?.byteLength||null
      });
    }
    return {rows,registryUnchanged:JSON.stringify(registry)===before};
  },{profile,base:BASE});

  assert.equal(result.rows.length,3);
  for(const row of result.rows){
    assert.equal(row.descriptorStatus,'resolved',`${row.id}: descriptor not resolved`);
    assert.equal(row.planStatus,'ready',`${row.id}: delivery plan not ready`);
    assert.equal(row.executionStatus,'verified',`${row.id}: execution not verified`);
    assert.equal(row.parity,true,`${row.id}: verified JSON differs from direct JSON`);
    assert.match(row.digest,/^[0-9a-f]{64}$/);
    assert.ok(row.byteLength>0);
  }
  assert.equal(result.registryUnchanged,true,'browser shadow mutated diagnostic registry');
  assert.deepEqual(summary.consoleErrors,[]);
  assert.deepEqual(summary.pageErrors,[]);
  assert.deepEqual(summary.failedRequests,[]);
  assert.deepEqual(summary.httpErrors,[]);
  summary.resources=result.rows;
  summary.status='PASS';
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  console.log('CONTENT_RESOLUTION_BROWSER_SHADOW_GATE=PASS');
  console.log(JSON.stringify({resources:result.rows.length,allVerified:true,parity:true,registryUnchanged:true},null,2));
}catch(error){
  summary.status='FAIL';
  summary.error=String(error?.stack||error);
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  throw error;
}finally{
  await browser?.close();
}
