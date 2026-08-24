'use strict';

const fs=require('fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:800}});
  const page=await context.newPage();
  try{
    await page.goto(BASE_URL+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>!!window.BaumanOfflineDirectFileReader&&!!window.BaumanOfflineContentLibrary,{timeout:10000});

    const self=await page.evaluate(()=>window.BaumanOfflineDirectFileReader.selfCheck());
    check('direct reader runtime ready',self?.ok===true&&self?.stored===false,JSON.stringify(self));
    check('text preview budget is 300KB',Number(self?.textPreviewBytes)===300000,String(self?.textPreviewBytes));

    const textProbe=await page.evaluate(async()=>{
      const lib=window.BaumanOfflineContentLibrary;
      const reader=window.BaumanOfflineDirectFileReader;
      const before=(await lib.listPacks()).map(x=>x.packId).sort();
      const payload='A'.repeat(420000)+'\nEND-MARKER-SHOULD-NOT-BE-PREVIEWED';
      const file=new File([payload],'large-note.txt',{type:'text/plain'});
      const result=await reader.previewFile(file);
      const pre=document.querySelector('.offline-preview-text pre');
      const rendered=pre?.textContent||'';
      const after=(await lib.listPacks()).map(x=>x.packId).sort();
      return {
        result,
        before,
        after,
        renderedLength:rendered.length,
        hasEndMarker:rendered.includes('END-MARKER-SHOULD-NOT-BE-PREVIEWED'),
        note:document.querySelector('.offline-sandbox-note')?.textContent||document.querySelector('.offline-preview-text p')?.textContent||''
      };
    });
    check('large text is marked truncated',textProbe.result?.truncated===true,JSON.stringify(textProbe.result));
    check('large text preview does not read the whole file',textProbe.renderedLength<=300000&&!textProbe.hasEndMarker,`${textProbe.renderedLength} chars, endMarker=${textProbe.hasEndMarker}`);
    check('direct preview creates no IndexedDB pack',JSON.stringify(textProbe.before)===JSON.stringify(textProbe.after),JSON.stringify({before:textProbe.before,after:textProbe.after}));
    check('large text preview explains clipping/no-copy',/300|preview|không parse|không bị sao chép/i.test(textProbe.note),textProbe.note);

    const htmlProbe=await page.evaluate(async()=>{
      const reader=window.BaumanOfflineDirectFileReader;
      window.__l5DirectSandboxBreach=false;
      const html='<!doctype html><meta charset="utf-8"><h1>probe</h1><script>parent.__l5DirectSandboxBreach=true<\/script>';
      const file=new File([html],'unsafe-local.html',{type:'text/html'});
      const result=await reader.previewFile(file);
      await new Promise(resolve=>setTimeout(resolve,250));
      const frame=document.querySelector('iframe.offline-sandbox-frame');
      return {
        result,
        sandbox:frame?.getAttribute('sandbox'),
        breach:window.__l5DirectSandboxBreach===true,
        note:document.querySelector('.offline-sandbox-note')?.textContent||''
      };
    });
    check('local HTML uses empty sandbox permission set',htmlProbe.sandbox==='',JSON.stringify(htmlProbe));
    check('local HTML cannot mutate parent Web App',htmlProbe.breach===false,JSON.stringify(htmlProbe));
    check('local HTML isolation is explained',/sandbox|không cấp quyền/i.test(htmlProbe.note),htmlProbe.note);

    const cleanup=await page.evaluate(()=>{
      window.BaumanOfflineDirectFileReader.revoke();
      const root=document.getElementById('modalRoot');
      if(root)root.innerHTML='';
      return window.BaumanOfflineDirectFileReader.selfCheck();
    });
    check('direct reader cleanup keeps zero-copy contract',cleanup?.stored===false,JSON.stringify(cleanup));
  }catch(error){failures.push(`browser regression fatal: ${error.stack||error.message}`);}
  finally{await context.close();await browser.close();}

  const report={generatedAt:new Date().toISOString(),baseUrl:BASE_URL,checks,failures};
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_DIRECT_LOCAL_READER_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
  console.log(`L5 direct local reader regression: ${checks.length} checks, ${failures.length} failure(s).`);
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 direct local reader regression PASS.');
})().catch(error=>{console.error(error);process.exit(1);});
