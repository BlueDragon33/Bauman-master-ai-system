// Browser-only, no mock networking: exercise every shipped subject shell with
// all non-loopback browser requests physically denied by Playwright routing.
// This proves bounded local-only use while the installed localhost server runs.
// It does NOT prove service-worker reload after stopping localhost, user-data
// backup/restore, individual lesson mastery, or authenticated external approval.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||"playwright");
const BASE=process.env.BAUMAN_E2E_BASE_URL||"http://127.0.0.1:4173/";
const ORIGIN=new URL(BASE).origin;
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(ORIGIN))
  throw new Error("Local-only acceptance requires a loopback origin, never a public URL");

const subjects=[
  "ai","entrepreneurship","ergonomics","foreign-language","foundation",
  "math","mivar","practice-workflow","programming","research","russian",
  "security-elective","signal","specialization-elective","systems"
];
const routes=["/",...subjects.map(name=>"/subjects/"+name+"/index.html")];
const out=process.env.BAUMAN_E2E_ARTIFACT_DIR||"artifacts/hub-all-subject-local-only";
fs.mkdirSync(out,{recursive:true});
const sourceRevision=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
const evidence={
  kind:"bauman-whole-hub-loopback-only-browser-v1",
  sourceRevision,
  localOrigin:ORIGIN,
  externalBrowserRequestsAllowed:false,
  localServerRequired:true,
  browserDisconnectedFromLocalServer:"UNVERIFIED",
  canonicalLearningSaveRestore:"UNVERIFIED",
  routes:[],
  blockedRemoteRequests:[]
};
let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:"block"});
  await context.route("**/*",async route=>{
    const request=route.request();
    let url;
    try{url=new URL(request.url())}catch{await route.abort("internetdisconnected");return;}
    if(url.origin===ORIGIN){await route.continue();return;}
    evidence.blockedRemoteRequests.push({route:request.url().slice(0,160),type:request.resourceType()});
    await route.abort("internetdisconnected");
  });
  const failures=[];
  for(const routePath of routes){
    const page=await context.newPage();
    const pageErrors=[];
    page.on("pageerror",error=>pageErrors.push(String(error).slice(0,220)));
    let status=null,title="",bodyLength=0,result="FAIL",reason="";
    try{
      const response=await page.goto(new URL(routePath,BASE).href,{waitUntil:"domcontentloaded",timeout:30000});
      status=response?.status()??null;
      assert.equal(status,200,"Local route must be real HTTP 200");
      title=await page.title();
      // A client-rendered Hub may have an empty body at DOMContentLoaded.
      // Wait for a real, observable task-facing shell, not an arbitrary timer.
      await page.waitForFunction(
        ()=>((document.body?.innerText||"").trim().length>=30),
        null,{timeout:12000}
      );
      bodyLength=(await page.locator("body").innerText({timeout:12000})).trim().length;
      assert.ok(bodyLength>=30,"Core subject must render meaningful visible text");
      // Browser session must continue to navigate with all remote endpoints blocked.
      // Page exceptions are recorded for follow-up but are not a false server result.
      result="LOCAL_CORE_ROUTE_PASS";
    }catch(error){
      reason=String(error instanceof Error?error.message:error).slice(0,380);
      failures.push(routePath+": "+reason);
    }finally{
      evidence.routes.push({route:routePath,status,title,bodyLength,result,reason,pageErrors});
      await page.close();
    }
  }
  evidence.result=failures.length?"FAIL":"SCOPED_LOCAL_CORE_PASS";
  evidence.failureCount=failures.length;
  fs.writeFileSync(path.join(out,"summary.json"),JSON.stringify(evidence,null,2));
  assert.deepEqual(failures,[], "Whole-Hub local-only routes have failures; inspect summary.json");
  console.log("BAUMAN WHOLE-HUB LOCAL-ONLY BROWSER PASS",
    routes.length,"routes; source",sourceRevision,
    "; full offline reload and saved user-data restoration remain UNVERIFIED");
  await context.close();
}finally{await browser?.close();}
