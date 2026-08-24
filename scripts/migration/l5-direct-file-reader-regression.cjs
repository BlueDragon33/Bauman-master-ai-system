'use strict';

const fs=require('fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  try{
    await page.goto(BASE_URL+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.BaumanOfflineDirectFileReader?.selfCheck?.().ok===true,{timeout:10000});

    const self=await page.evaluate(()=>window.BaumanOfflineDirectFileReader.selfCheck());
    check('direct reader runtime ready',self.ok===true,JSON.stringify(self));
    check('direct reader declares non-persistent mode',self.stored===false,JSON.stringify(self));
    check('direct text preview is bounded',Number(self.textPreviewBytes)===300000,String(self.textPreviewBytes));

    const textProbe=await page.evaluate(async()=>{
      const before=(await window.BaumanOfflineContentLibrary.listPacks()).map(x=>x.packId);
      const oneMb='x'.repeat(1024*1024);
      const file=new File([oneMb],'large-notes.txt',{type:'text/plain'});
      const result=await window.BaumanOfflineDirectFileReader.previewFile(file);
      const after=(await window.BaumanOfflineContentLibrary.listPacks()).map(x=>x.packId);
      const pre=document.querySelector('.offline-preview-text pre');
      return {before,after,result,previewLength:pre?.textContent?.length||0,title:document.querySelector('.offline-library-dialog h2')?.textContent||''};
    });
    check('direct text reader does not create IndexedDB pack',JSON.stringify(textProbe.before)===JSON.stringify(textProbe.after),JSON.stringify({before:textProbe.before,after:textProbe.after}));
    check('direct text reader marks large preview truncated',textProbe.result?.truncated===true,JSON.stringify(textProbe.result));
    check('direct text reader does not read entire 1MB into DOM',textProbe.previewLength<=300000,String(textProbe.previewLength));
    check('direct text reader shows selected filename',textProbe.title.includes('large-notes.txt'),textProbe.title);

    const htmlProbe=await page.evaluate(async()=>{
      window.__l5DirectLocalBreach=false;
      const html='<!doctype html><meta charset="utf-8"><h1>Local sandbox</h1><script>parent.__l5DirectLocalBreach=true<\/script>';
      const file=new File([html],'local-unsafe.html',{type:'text/html'});
      await window.BaumanOfflineDirectFileReader.previewFile(file);
      await new Promise(resolve=>setTimeout(resolve,250));
      const frame=document.querySelector('iframe.offline-sandbox-frame');
      return {sandbox:frame?.getAttribute('sandbox'),breach:window.__l5DirectLocalBreach===true,src:String(frame?.src||''),note:document.querySelector('.offline-sandbox-note')?.textContent||''};
    });
    check('direct HTML uses empty sandbox permissions',htmlProbe.sandbox==='',JSON.stringify(htmlProbe));
    check('direct HTML cannot mutate parent',htmlProbe.breach===false,JSON.stringify(htmlProbe));
    check('direct HTML uses local object URL',htmlProbe.src.startsWith('blob:'),htmlProbe.src);
    check('direct HTML explains sandbox',/sandbox/i.test(htmlProbe.note),htmlProbe.note);

    const revokeProbe=await page.evaluate(()=>{window.BaumanOfflineDirectFileReader.revoke();return window.BaumanOfflineDirectFileReader.selfCheck();});
    check('direct reader remains healthy after revoke',revokeProbe.ok===true,JSON.stringify(revokeProbe));
  }catch(error){failures.push(`direct reader fatal: ${error.stack||error.message}`);}
  finally{await page.close();await browser.close();}

  const report={generatedAt:new Date().toISOString(),baseUrl:BASE_URL,checks,failures};
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_DIRECT_FILE_READER_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
  console.log(`L5 direct file reader regression: ${checks.length} checks, ${failures.length} failure(s).`);
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 direct file reader regression PASS.');
})().catch(error=>{console.error(error);process.exit(1);});
