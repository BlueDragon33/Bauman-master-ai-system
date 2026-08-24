'use strict';

const fs=require('fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const pages=[];
const check=(name,ok,detail='')=>{if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};

async function installLongTaskObserver(page){
  await page.addInitScript(()=>{
    window.__l5LongTasks=[];
    try{
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries())window.__l5LongTasks.push({duration:entry.duration,startTime:entry.startTime});
      });
      observer.observe({entryTypes:['longtask']});
    }catch(_){ }
  });
}

async function resourceNames(page){
  return page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name));
}

async function mainGate(browser){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await installLongTaskObserver(page);
  const started=Date.now();
  await page.goto(BASE_URL+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1200);
  await page.waitForFunction(()=>window.BaumanAcademicRoadmapV3?.selfCheck?.().loaded===true,{timeout:15000});
  const result=await page.evaluate(()=>{
    const measure=name=>{
      const t=performance.now();
      window.app.page(name,false);
      return performance.now()-t;
    };
    const roadmapMs=measure('roadmap');
    const subjectsMs=measure('subjects');
    const researchMs=measure('research');
    const runtime=window.BaumanAcademicRuntimeV3?.selfCheck?.()||null;
    const text=document.body.innerText||'';
    return {
      runtime,
      roadmapMs,subjectsMs,researchMs,
      domNodes:document.getElementsByTagName('*').length,
      courseCards:document.querySelectorAll('.academic-v3-course').length,
      nirCards:document.querySelectorAll('.academic-nir-card').length,
      longTasks:window.__l5LongTasks||[],
      hasDisplayCode:text.includes('09.04.01/11'),
      hasComparisonLabel:/hutech/i.test(text)
    };
  });
  result.navigationMs=Date.now()-started;
  pages.push({id:'main',...result});
  check('main academic runtime ready',result.runtime?.ok===true,JSON.stringify(result.runtime));
  check('main uses substantial V3 course graph',Number(result.runtime?.courseCount)>=45,String(result.runtime?.courseCount));
  check('main roadmap render budget',result.roadmapMs<1500,`${result.roadmapMs.toFixed(1)}ms`);
  check('main subjects render budget',result.subjectsMs<1500,`${result.subjectsMs.toFixed(1)}ms`);
  check('main research render budget',result.researchMs<1500,`${result.researchMs.toFixed(1)}ms`);
  check('main DOM budget',result.domNodes<6500,String(result.domNodes));
  check('main NIR card count',result.nirCards===4,String(result.nirCards));
  check('main display code visible',result.hasDisplayCode===true);
  check('main has no comparison-school UI label',result.hasComparisonLabel===false);
  await page.close();
}

async function russianGate(browser){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await installLongTaskObserver(page);
  await page.goto(BASE_URL+'/subjects/russian/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1500);
  let resources=await resourceNames(page);
  const startupHeavy=resources.filter(url=>/\/subjects\/russian\/data\/(?:vocab|tests|speaking)\.json(?:$|\?)/.test(url));
  const startup=await page.evaluate(()=>({domNodes:document.getElementsByTagName('*').length,longTasks:window.__l5LongTasks||[]}));
  check('russian startup heavy data deferred',startupHeavy.length===0,JSON.stringify(startupHeavy));
  check('russian startup DOM budget',startup.domNodes<6500,String(startup.domNodes));

  const vocabStart=Date.now();
  const vocabClicked=await page.evaluate(()=>{const el=document.querySelector('[data-view="vocab"]');if(!el)return false;el.click();return true;});
  check('russian vocab selector exists',vocabClicked===true);
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>/\/subjects\/russian\/data\/vocab\.json(?:$|\?)/.test(e.name)),{timeout:15000});
  await page.waitForTimeout(800);
  const vocab=await page.evaluate(()=>({
    domNodes:document.getElementsByTagName('*').length,
    rows:document.querySelectorAll('[data-vocab]').length,
    textLength:(document.body.innerText||'').length,
    longTasks:window.__l5LongTasks||[]
  }));
  vocab.readyMs=Date.now()-vocabStart;
  check('russian vocab page stays paginated',vocab.rows<=30,String(vocab.rows));
  check('russian vocab DOM budget',vocab.domNodes<7500,String(vocab.domNodes));
  check('russian vocab local-load budget',vocab.readyMs<12000,`${vocab.readyMs}ms`);

  const reviewStart=Date.now();
  await page.evaluate(()=>document.querySelector('[data-view="learning"]')?.click());
  await page.waitForTimeout(100);
  await page.evaluate(()=>document.querySelector('[data-learn="review"]')?.click());
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>/\/subjects\/russian\/data\/tests\.json(?:$|\?)/.test(e.name)),{timeout:15000});
  await page.waitForTimeout(800);
  const review=await page.evaluate(()=>({
    domNodes:document.getElementsByTagName('*').length,
    answerButtons:document.querySelectorAll('[data-review-answer],[data-answer]').length,
    buttons:document.querySelectorAll('button').length,
    longTasks:window.__l5LongTasks||[]
  }));
  review.readyMs=Date.now()-reviewStart;
  check('russian review DOM budget',review.domNodes<8500,String(review.domNodes));
  check('russian review button budget',review.buttons<700,String(review.buttons));
  check('russian review local-load budget',review.readyMs<12000,`${review.readyMs}ms`);

  const tasks=[...(review.longTasks||[])];
  const maxLong=tasks.reduce((max,item)=>Math.max(max,Number(item.duration)||0),0);
  check('russian max long task budget',maxLong<2500,`${maxLong.toFixed(1)}ms`);
  pages.push({id:'russian',startupHeavy,startup,vocab,review,maxLongTaskMs:maxLong});
  await page.close();
}

async function mathGate(browser){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await installLongTaskObserver(page);
  const started=Date.now();
  await page.goto(BASE_URL+'/subjects/math/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1500);
  const resources=await resourceNames(page);
  const result=await page.evaluate(()=>({domNodes:document.getElementsByTagName('*').length,longTasks:window.__l5LongTasks||[],self:window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.()||null}));
  result.navigationMs=Date.now()-started;
  result.legacyRequested=resources.some(url=>/\/subjects\/math\/data\/lessons\.json(?:$|\?)/.test(url));
  result.maxLongTaskMs=(result.longTasks||[]).reduce((max,item)=>Math.max(max,Number(item.duration)||0),0);
  pages.push({id:'math',...result});
  check('math E246 route ready',result.self?.ok===true,JSON.stringify(result.self));
  check('math legacy lessons deferred',result.legacyRequested===false);
  check('math startup DOM budget',result.domNodes<9000,String(result.domNodes));
  check('math max long task budget',result.maxLongTaskMs<2500,`${result.maxLongTaskMs.toFixed(1)}ms`);
  await page.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    await mainGate(browser);
    await russianGate(browser);
    await mathGate(browser);
  }catch(error){failures.push(`render performance fatal: ${error.stack||error.message}`);}
  finally{await browser.close();}

  const report={generatedAt:new Date().toISOString(),baseUrl:BASE_URL,budgets:{mainDom:6500,russianStartupDom:6500,russianLoadedDom:8500,mathDom:9000,mainRenderMs:1500,heavyLocalLoadMs:12000,maxLongTaskMs:2500},pages,failures};
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_RENDER_PERFORMANCE_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
  console.log(`L5 render performance regression: ${pages.length} pages, ${failures.length} failure(s).`);
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 render performance regression PASS.');
})().catch(error=>{console.error(error);process.exit(1);});
