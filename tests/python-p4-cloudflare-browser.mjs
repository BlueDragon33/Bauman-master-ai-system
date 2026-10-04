import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from '../runtime/python-cloudflare/node_modules/playwright/index.mjs';

const real=process.env.BAUMAN_PYTHON04_BROWSER_REAL==='true';
const endpoint=process.env.BAUMAN_PYTHON04_BASE_URL,key=process.env.BAUMAN_PYTHON04_ACCEPTANCE_SECRET;
if(real&&(!endpoint||!key||!process.env.BAUMAN_BUILD_REVISION))throw Error('Real browser gate requires actual configured provider/revision');
const port=3014,base='http://127.0.0.1:'+port+'/';
const server=spawn(process.execPath,['scripts/serve-local-runtime.mjs','--port',String(port),'--root',process.env.BAUMAN_PYTHON04_BROWSER_ROOT||'.'],{stdio:['ignore','pipe','pipe']});
let launchError;server.on('error',e=>launchError=e);
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
const errors=[];
try {
  let ready=false;
  for(let i=0;i<50;i++){
    if(launchError||server.exitCode!==null)throw launchError||Error('Test static server failed');
    try{if((await fetch(base+'_local/health')).ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  assert.ok(ready,'Test server startup deadline');
  if(real) {
    const health=await (await fetch(endpoint+'/__python04/health')).json();
    assert.equal(health.revision,process.env.BAUMAN_BUILD_REVISION);
    assert.equal(health.learnerExecutionEnabled,false);
  }
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
    const context=await browser.newContext({viewport});const page=await context.newPage();let offline=false;
    page.setDefaultTimeout(40000);page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/api/python/*',async route=>{
      if(offline)return route.abort('internetdisconnected');
      const request=route.request();
      // Test driver alone holds the acceptance key. Browser bundles, requests,
      // Python inputs and UI never receive it. This does not replace auth tests.
      if(real) {
        assert.ok(!request.postData().includes(key));
        const operation=new URL(request.url()).pathname.split('/').pop();
        const response=await fetch(endpoint+'/__python04/'+operation,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:request.postData(),signal:AbortSignal.timeout(35000)});
        const body=await response.text();assert.ok(!body.includes(key));
        return route.fulfill({status:response.status,contentType:'application/json',body});
      }
      return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({status:'acceptance_pending',officialEvidence:false})});
    });
    await page.goto(base+'subjects/programming/python-lab.html');
    await page.evaluate(()=>localStorage.setItem('bauman_programming_roadmap_v1_same_ui','{"sentinel":"preserved"}'));
    const run=async(code,mode='run',status='completed')=>{
      await page.locator('#pythonMode').selectOption(mode);await page.locator('#pythonCode').fill(code);await page.locator('#pythonRun').click();
      await page.waitForSelector('#pythonStatus[data-status="'+status+'"]');
    };
    if(real) {
      await run('print(6 * 7)');assert.match(await page.locator('#pythonOutput').textContent(),/42/);
      assert.match(await page.locator('#pythonIdentity').textContent(),/3\.14\.8.*python04-cf-stdlib-v1/);
      await run('def solve(values):\n    return sum(values)','test');assert.match(await page.locator('#pythonTests').textContent(),/4 passed.*0 failed/);
      await run('print(missing_name)','trace','runtime_error');assert.match(await page.locator('#pythonException').textContent(),/NameError/);
      await page.locator('#pythonHint').click();assert.match(await page.locator('#pythonAdvice').textContent(),/tên biến/);
      await run('x=21\n# %%\nprint(x*2)','notebook');assert.match(await page.locator('#pythonOutput').textContent(),/42/);
      await page.locator('#pythonRestart').click();await run('print(x)','run','runtime_error');
      await page.locator('#pythonCode').fill('while True: pass');await page.locator('#pythonRun').click();
      await page.waitForTimeout(1000);await page.locator('#pythonCancel').click();
      await page.waitForTimeout(10000);assert.equal(await page.locator('#pythonStatus').getAttribute('data-status'),'cancelled');
    } else {
      await run('print(42)','run','acceptance_pending');
      assert.equal(await page.locator('#pythonOutput').textContent(),'');
    }
    offline=true;await context.setOffline(true);await run('print(1)','run','provider_unavailable');
    offline=false;await context.setOffline(false);await page.reload();
    assert.equal(await page.evaluate(()=>localStorage.getItem('bauman_programming_roadmap_v1_same_ui')),'{"sentinel":"preserved"}');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('#pythonCode').getAttribute('aria-label'),'Mã Python không tin cậy');
    assert.equal(await page.locator('#pythonStatus').getAttribute('role'),'status');
    assert.equal(await page.evaluate(()=>window.SUBJECT_ADAPTER.pythonRuntime.offlineExecution),false);
    await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'PASS',gate:real?'REAL_CLOUDFLARE_BROWSER':'DISABLED_GATE_UI_ONLY',root:process.env.BAUMAN_PYTHON04_BROWSER_ROOT||'.',viewports:['desktop','mobile'],statePreserved:true,officialAssessment:false}));
} finally {await browser.close();server.kill('SIGTERM');}
