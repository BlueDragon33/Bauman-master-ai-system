import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = await import(process.env.BAUMAN_PLAYWRIGHT_MODULE || 'playwright');
const BASE = process.env.BAUMAN_E2E_BASE_URL || 'http://127.0.0.1:4173/';
const OUT = process.env.BAUMAN_E2E_ARTIFACT_DIR || 'artifacts/math-p1-forensic';
const LESSON = 'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140';

fs.mkdirSync(OUT,{recursive:true});

const report = {
  schemaVersion:'1.0.0',
  audit:'MATH01_FORENSIC_BASELINE',
  status:'RUNNING',
  baseUrl:BASE,
  lessonId:LESSON,
  runtime:{},
  performance:{},
  responsive:[],
  accessibility:{},
  capabilities:{},
  errors:{page:[],requests:[],http:[]}
};

function elapsed(start){ return Math.round((performance.now()-start)*100)/100; }

let browser;
try {
  browser = await chromium.launch({
    headless:true,
    ...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})
  });
  const context = await browser.newContext({viewport:{width:1440,height:900}});
  const page = await context.newPage();

  page.on('pageerror',e=>report.errors.page.push(String(e?.message||e)));
  page.on('requestfailed',r=>report.errors.requests.push({url:r.url(),error:r.failure()?.errorText||'failed'}));
  page.on('response',r=>{if(r.status()>=400)report.errors.http.push({url:r.url(),status:r.status()})});

  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=math01-forensic&stage=prepare`;
  const navStart=performance.now();
  await page.goto(url,{waitUntil:'load',timeout:30000});
  report.performance.gotoWallMs=elapsed(navStart);

  await page.waitForFunction(
    ()=>window.BAUMAN_MATH_NAVIGATION &&
       window.BAUMAN_MATH_LEARNING_FLOW &&
       window.BAUMAN_MATH_WORKSPACE &&
       window.BAUMAN_MATH_E234_TYPESET &&
       window.BAUMAN_MATH_E186_LESSON_FIRST,
    null,{timeout:30000}
  );
  await page.waitForFunction(
    ()=>window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.getPayload?.() ||
        window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>0,
    null,{timeout:30000}
  );

  report.runtime = await page.evaluate(()=>({
    primaryRoute:document.body.dataset.mathPrimaryRoute||null,
    theorySource:window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.source?.()||null,
    theoryStatus:window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.()||null,
    modules:{
      navigation:!!window.BAUMAN_MATH_NAVIGATION,
      learningFlow:!!window.BAUMAN_MATH_LEARNING_FLOW,
      workspace:!!window.BAUMAN_MATH_WORKSPACE,
      formulaTypeset:!!window.BAUMAN_MATH_E234_TYPESET,
      activityStudio:!!window.BAUMAN_MATH_ACTIVITY_STUDIO,
      activityMastery:!!window.BAUMAN_MATH_ACTIVITY_MASTERY,
      formulaLibrary:!!window.BAUMAN_MATH_FORMULA_LIBRARY,
      simulationSource:!!window.BAUMAN_MATH_SIMULATION_SOURCE,
      professorDrill:!!window.BAUMAN_MATH_PROFESSOR_DRILL
    }
  }));

  report.performance.navigation = await page.evaluate(()=>{
    const n=performance.getEntriesByType('navigation')[0];
    return n?{
      durationMs:Math.round(n.duration*100)/100,
      domContentLoadedMs:Math.round(n.domContentLoadedEventEnd*100)/100,
      loadEventMs:Math.round(n.loadEventEnd*100)/100,
      transferSize:n.transferSize||0,
      encodedBodySize:n.encodedBodySize||0,
      decodedBodySize:n.decodedBodySize||0
    }:null;
  });

  report.performance.resources = await page.evaluate(()=>{
    const rows=performance.getEntriesByType('resource');
    const sum=k=>rows.reduce((n,r)=>n+Number(r[k]||0),0);
    return {
      count:rows.length,
      transferSize:sum('transferSize'),
      encodedBodySize:sum('encodedBodySize'),
      decodedBodySize:sum('decodedBodySize'),
      slowest:rows.slice().sort((a,b)=>b.duration-a.duration).slice(0,12).map(r=>({
        name:r.name.split('/').slice(-3).join('/'),
        initiatorType:r.initiatorType,
        durationMs:Math.round(r.duration*100)/100,
        transferSize:r.transferSize||0,
        decodedBodySize:r.decodedBodySize||0
      }))
    };
  });

  let t=performance.now();
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('roadmap'));
  await page.waitForSelector('.math-roadmap-shell',{timeout:10000});
  report.performance.roadmapRouteMs=elapsed(t);

  t=performance.now();
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const lessonChoice=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await lessonChoice.waitFor({state:'visible',timeout:10000});
  await lessonChoice.click();
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:10000});
  report.performance.lessonOpenMs=elapsed(t);

  report.performance.formulaRender500 = await page.evaluate(()=>{
    const render=window.BAUMAN_MATH_E234_TYPESET?.render;
    if(typeof render!=='function')return null;
    const samples=[
      'cov(X,Y)=sum_{i=1}^{n}((x_i-mu_x)(y_i-mu_y))/(n-1)',
      '||Ax-b||^2 = sqrt(sum_{i=1}^{n}(r_i^2))',
      'R^{m x n} => R^{k x n}'
    ];
    const start=performance.now();
    let sink='';
    for(let i=0;i<500;i++)sink=render(samples[i%samples.length]);
    const total=performance.now()-start;
    return {totalMs:Math.round(total*100)/100,avgMs:Math.round(total/500*10000)/10000,outputLength:sink.length};
  });

  t=performance.now();
  await page.evaluate(()=>window.BAUMAN_MATH_WORKSPACE.openLab());
  await page.waitForFunction(()=>document.getElementById('mathWorkspaceLab')?.classList.contains('open'),null,{timeout:5000});
  await page.waitForSelector('#mathLabSvg',{timeout:5000});
  report.performance.mathLabOpenMs=elapsed(t);
  await page.keyboard.press('Escape');

  t=performance.now();
  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY?.open?.());
  await page.waitForFunction(()=>document.querySelectorAll('#mathFlList .math-fl-item').length>0,null,{timeout:10000});
  report.performance.formulaLibraryOpenMs=elapsed(t);
  report.performance.formulaLibraryItems=await page.locator('#mathFlList .math-fl-item').count();
  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY?.close?.());

  const memoryBefore=await page.evaluate(()=>performance.memory?{
    usedJSHeapSize:performance.memory.usedJSHeapSize,
    totalJSHeapSize:performance.memory.totalJSHeapSize,
    jsHeapSizeLimit:performance.memory.jsHeapSizeLimit
  }:null);
  for(let i=0;i<8;i++){
    await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('roadmap'));
    await page.waitForSelector('.math-roadmap-shell',{timeout:10000});
    await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('learn'));
    await page.waitForSelector('#view',{timeout:10000});
  }
  const memoryAfter=await page.evaluate(()=>performance.memory?{
    usedJSHeapSize:performance.memory.usedJSHeapSize,
    totalJSHeapSize:performance.memory.totalJSHeapSize,
    jsHeapSizeLimit:performance.memory.jsHeapSizeLimit
  }:null);
  report.performance.routeCycleMemory={before:memoryBefore,after:memoryAfter,cycles:8};

  for(const [label,width,height] of [
    ['wide',1920,1080],['desktop',1440,900],['laptop',1280,800],
    ['small-laptop',1024,768],['tablet',768,1024],['mobile-wide',430,932],['mobile',390,844]
  ]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('learn'));
    await page.waitForSelector('#view',{timeout:10000});
    const snap=await page.evaluate(()=>{
      const root=document.documentElement;
      const visible=[...document.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>{
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none';
      });
      const small=visible.map(el=>{
        const r=el.getBoundingClientRect();
        return {tag:el.tagName.toLowerCase(),id:el.id||'',text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60),w:Math.round(r.width),h:Math.round(r.height)};
      }).filter(x=>x.w<44||x.h<44);
      return {
        clientWidth:root.clientWidth,
        scrollWidth:root.scrollWidth,
        horizontalOverflow:Math.max(0,root.scrollWidth-root.clientWidth),
        visibleInteractive:visible.length,
        touchTargetsUnder44:small.length,
        touchTargetExamples:small.slice(0,12)
      };
    });
    report.responsive.push({label,width,height,...snap});
  }

  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('learn'));
  await page.locator('body').click({position:{x:5,y:5}});
  const focusTrail=[];
  for(let i=0;i<12;i++){
    await page.keyboard.press('Tab');
    focusTrail.push(await page.evaluate(()=>{
      const el=document.activeElement,cs=el?getComputedStyle(el):null;
      return el?{
        tag:el.tagName.toLowerCase(),id:el.id||'',text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,70),
        outlineStyle:cs?.outlineStyle||'',outlineWidth:cs?.outlineWidth||'',boxShadow:cs?.boxShadow||''
      }:null;
    }));
  }
  report.accessibility=await page.evaluate(()=>{
    const accessibleName=el=>(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim();
    const buttons=[...document.querySelectorAll('button')];
    const inputs=[...document.querySelectorAll('input,select,textarea')];
    const unlabeledInputs=inputs.filter(el=>{
      if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.getAttribute('title'))return false;
      if(el.id&&document.querySelector(`label[for="${CSS.escape(el.id)}"]`))return false;
      return !el.closest('label');
    });
    return {
      landmarks:{main:document.querySelectorAll('main,[role="main"]').length,nav:document.querySelectorAll('nav,[role="navigation"]').length},
      headings:[...document.querySelectorAll('h1,h2,h3')].slice(0,30).map(x=>({level:Number(x.tagName.slice(1)),text:x.textContent.trim().slice(0,100)})),
      buttons:buttons.length,
      buttonsWithoutAccessibleName:buttons.filter(x=>!accessibleName(x)).length,
      inputs:inputs.length,
      inputsWithoutLabel:unlabeledInputs.length,
      mathRoleNodes:document.querySelectorAll('[role="math"]').length,
      graphs:[...document.querySelectorAll('svg')].map(x=>({id:x.id||'',role:x.getAttribute('role')||'',label:x.getAttribute('aria-label')||''})).slice(0,20),
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });
  report.accessibility.focusTrail=focusTrail;

  report.capabilities=await page.evaluate(()=>({
    symbolicEvaluator:!!(window.BAUMAN_MATH_SYMBOLIC_EVALUATOR||window.BAUMAN_MATH_CAS),
    externalCAS:!!window.BAUMAN_MATH_CAS,
    aiMathProvider:!!(window.BAUMAN_MATH_AI||window.BAUMAN_AI_MENTOR),
    formulaRenderer:'BAUMAN_MATH_E234_TYPESET custom parser',
    learnerStateOwner:'BAUMAN_MATH_LEARNING_FLOW',
    activityMasteryPolicy:window.BAUMAN_MATH_ACTIVITY_MASTERY?.selfCheck?.()||null,
    activityStudioPolicy:window.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.()||null,
    professorDrillPolicy:window.BAUMAN_MATH_PROFESSOR_DRILL?.selfCheck?.()||null
  }));

  assert.deepEqual(report.errors.page,[],'MATH01 forensic browser probe observed page errors');
  assert.deepEqual(report.errors.requests,[],'MATH01 forensic browser probe observed failed requests');
  assert.deepEqual(report.errors.http,[],'MATH01 forensic browser probe observed HTTP errors');
  assert.ok(report.runtime.modules.navigation&&report.runtime.modules.learningFlow,'Core learner runtime did not boot');

  report.status='PASS_BASELINE_CAPTURED';
  fs.writeFileSync(path.join(OUT,'math-p1-forensic-baseline.json'),JSON.stringify(report,null,2));
  await page.screenshot({path:path.join(OUT,'math-p1-forensic-final.png'),fullPage:true});
  console.log(JSON.stringify({status:report.status,performance:report.performance,responsive:report.responsive,accessibility:report.accessibility,capabilities:report.capabilities},null,2));
} catch(error) {
  report.status='FAIL';
  report.error=String(error?.stack||error);
  fs.writeFileSync(path.join(OUT,'math-p1-forensic-baseline.json'),JSON.stringify(report,null,2));
  throw error;
} finally {
  await browser?.close();
}
