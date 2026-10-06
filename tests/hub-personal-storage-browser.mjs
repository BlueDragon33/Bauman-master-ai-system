import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4186/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-storage/browser';
fs.mkdirSync(OUT,{recursive:true});
const checks=[];
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
async function fixture(){
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.route('**/storage-fixture',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="bauman-access-mode" content="standalone"><div id="toast"></div><script src="/assets/js/platform/hub-personal-store.js"></script>'}));
  await page.goto(new URL('storage-fixture',BASE).href);
  return {context,page};
}
try{
  const {context,page}=await fixture();
  assert.equal(await page.evaluate(()=>Boolean(window.BAUMAN_HUB_PERSONAL_STORE)),true,'Shared store is missing');
  const migration=await page.evaluate(async()=>{
    const key='bauman_main_all_phases_subjects_v1';
    localStorage.setItem(key,JSON.stringify({progress:{math:0},schedule:{entries:{slot:{source:'manual'}}},researchFiles:{item:[{name:'test.json',mime:'application/json',content:'data:application/json;base64,eyJhIjoxfQ==',addedAt:'2026-10-06'}]}}));
    localStorage.setItem('bauman_current_user_fullcode_v1',JSON.stringify({email:'a@example.com',name:'A',role:'user',password:'secret'}));
    localStorage.setItem('bauman_main_users_fullcode_v1',JSON.stringify([{email:'a@example.com',name:'A',passwordHash:'verifier',passwordSalt:'salt',passwordIterations:120000}]));
    localStorage.setItem('bauman_subjects_reference_notes_v1',JSON.stringify([{id:'n1',text:'sample'},{id:'my-note',text:'real'}]));
    localStorage.setItem('bauman_thesis_reference_tasks_v1',JSON.stringify([{id:'t01',title:'sample'},{id:'my-task',title:'real',date:'2026-10-06'}]));
    localStorage.setItem('bauman_academic_2026_diagnostics_v1',JSON.stringify({users:{'a@example.com':{gateDiagnostics:{P1:{D0:0,D1:0,D2:0,criticalMisconceptions:0}}},'b@example.com':{gateDiagnostics:{P2:{D0:100}}}}}));
    localStorage.setItem('bauman_academic_2026_schedule_preview_v1',JSON.stringify({users:{'a@example.com':{preview:{id:'preview-A'}}}}));
    localStorage.setItem('bauman_academic_2026_schedule_transactions_v1',JSON.stringify({users:{'a@example.com':{transactions:[{id:'tx-A',status:'rolled_back'}]}}}));
    const s=window.BAUMAN_HUB_PERSONAL_STORE;
    await s.initialize();
    const bundle=await s.exportBundle();
    const main=s.get(key,{}),file=main.researchFiles.item[0],blob=await s.getAttachment(file.attachmentId);
    return {scope:s.scopeId,status:s.status,main,file,text:await blob.text(),mime:blob.type,notes:s.get('bauman_subjects_reference_notes_v1',[]),tasks:s.get('bauman_thesis_reference_tasks_v1',[]),bundle,current:s.currentUser(),credentials:s.getAccounts(),legacyRetained:localStorage.getItem(key)!==null};
  });
  assert.equal(migration.scope,'a@example.com');
  assert.equal(migration.main.progress.math,0);
  assert.ok(!Object.hasOwn(migration.main.progress,'russian'));
  assert.equal(migration.text,'{"a":1}');assert.equal(migration.mime,'application/json');
  assert.equal(migration.file.name,'test.json');assert.equal(migration.file.content,undefined);
  assert.deepEqual(migration.notes,[{id:'my-note',text:'real'}]);assert.equal(migration.tasks.length,1);assert.equal(migration.tasks[0].id,'my-task');
  assert.ok(migration.legacyRetained,'Additive migration must retain recovery source');
  assert.ok(migration.credentials[0].passwordHash,'Credential compatibility store must preserve verifiers');
  assert.equal(migration.current.password,undefined);
  for(const field of ['passwordHash','passwordSalt','passwordIterations','password','b@example.com'])assert.ok(!JSON.stringify(migration.bundle).includes(field),`Backup leaked ${field}`);
  assert.equal(migration.bundle.attachments.length,1);checks.push('legacy migration / zero / filtering / attachment bytes / credentials / scoped backup');
  assert.equal(migration.bundle.records.bauman_academic_2026_schedule_preview_v1.users['a@example.com'].preview.id,'preview-A');
  assert.equal(migration.bundle.records.bauman_academic_2026_schedule_transactions_v1.users['a@example.com'].transactions[0].id,'tx-A');

  await page.reload();
  const reload=await page.evaluate(async()=>{const s=window.BAUMAN_HUB_PERSONAL_STORE;await s.initialize();await s.set('bauman_schedule_reference_notes_v1',[{id:'offline-note',text:'kept'}]);await s.flush();localStorage.clear();return s.get('bauman_main_all_phases_subjects_v1').researchFiles.item[0].attachmentId});
  await page.reload();
  assert.equal(await page.evaluate(async()=>{const s=window.BAUMAN_HUB_PERSONAL_STORE;await s.initialize();return s.get('bauman_main_all_phases_subjects_v1').researchFiles.item[0].attachmentId}),reload);
  assert.deepEqual(await page.evaluate(()=>window.BAUMAN_HUB_PERSONAL_STORE.get('bauman_schedule_reference_notes_v1')),[{id:'offline-note',text:'kept'}]);checks.push('reload without canonical localStorage keys / stable migration ids');

  const scopes=await page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE,bundle=await s.exportBundle();
    await s.initialize({profile:{email:'b@example.com',name:'B'}});
    const absent=s.get('bauman_main_all_phases_subjects_v1',null);
    await s.set('bauman_schedule_reference_notes_v1',[{id:'b',text:'scope B'}]);
    await s.initialize({profile:{email:'a@example.com',name:'A'}});
    const notes=s.get('bauman_schedule_reference_notes_v1');
    await s.set('bauman_schedule_reference_notes_v1',[]);
    await s.importBundle(bundle);
    const restored=s.get('bauman_schedule_reference_notes_v1');
    const attachment=s.get('bauman_main_all_phases_subjects_v1').researchFiles.item[0];
    const content=await (await s.getAttachment(attachment.attachmentId)).text();
    await s.initialize({profile:{email:'b@example.com',name:'B'}});
    return {absent,notes,restored,content,b:s.get('bauman_schedule_reference_notes_v1'),bundle};
  });
  assert.equal(scopes.absent,null);assert.deepEqual(scopes.notes,scopes.restored);assert.equal(scopes.content,'{"a":1}');assert.deepEqual(scopes.b,[{id:'b',text:'scope B'}]);checks.push('scope isolation / complete backup restore / no legacy cloning');

  const failure=await page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE;await s.initialize({profile:{email:'a@example.com'}});
    const before=JSON.stringify(s.get('bauman_main_all_phases_subjects_v1'));
    const original=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(value,...args){if(this.name==='attachments')throw new DOMException('Quota fixture','QuotaExceededError');return original.call(this,value,...args)};
    let error='';try{await s.addResearchAttachment('item',new File(['new'], 'new.json',{type:'application/json'}))}catch(e){error=e.name}
    finally{IDBObjectStore.prototype.put=original}
    const after=JSON.stringify(s.get('bauman_main_all_phases_subjects_v1'));
    const exported=await s.exportBundle();
    const bad=structuredClone(exported);bad.attachments=[];
    let invalid=false;try{await s.importBundle(bad)}catch{invalid=true}
    return {before,after,error,invalid,afterImport:JSON.stringify(s.get('bauman_main_all_phases_subjects_v1'))};
  });
  assert.equal(failure.error,'QuotaExceededError');assert.equal(failure.before,failure.after);assert.equal(failure.before,failure.afterImport);assert.equal(failure.invalid,true);checks.push('attachment quota failure atomicity / malformed backup rejected without data loss');
  const portable=await page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE,key='bauman_main_all_phases_subjects_v1';
    await s.addResearchAttachment('video-item',new File([new Uint8Array([0,1,255,128])],'clip.mp4',{type:'video/mp4'}));
    const bundle=await s.exportBundle();await s.set('bauman_academic_2026_schedule_transactions_v1',{users:{}});await s.importBundle(bundle);
    const file=s.get(key).researchFiles['video-item'][0],bytes=Array.from(new Uint8Array(await(await s.getAttachment(file.attachmentId)).arrayBuffer()));
    const restoredTx=s.get('bauman_academic_2026_schedule_transactions_v1').users[s.scopeId].transactions[0].id;
    const credentialsBefore=JSON.stringify(s.getAccounts());
    await s.importBundle({state:{progress:{math:23},researchFiles:{legacy:[{name:'old.json',mime:'application/json',content:'data:application/json;base64,e30='}]}},users:[{password:'must-ignore'}]});
    const legacy=s.get(key),body=await(await s.getAttachment(legacy.researchFiles.legacy[0].attachmentId)).text();
    return{bytes,name:file.name,mime:file.mime,restoredTx,legacyProgress:legacy.progress.math,body,credentialsSame:credentialsBefore===JSON.stringify(s.getAccounts())};
  });
  assert.deepEqual(portable,{bytes:[0,1,255,128],name:'clip.mp4',mime:'video/mp4',restoredTx:'tx-A',legacyProgress:23,body:'{}',credentialsSame:true});checks.push('binary video exact bytes / transaction backup parity / legacy import excludes credentials');
  const retention=await page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE;for(let i=0;i<9;i++)await s.addResearchAttachment('retained',new File([String(i)],`${i}.json`,{type:'application/json'}));
    const main=s.get('bauman_main_all_phases_subjects_v1'),refs=Object.values(main.researchFiles).flat().map(x=>x.attachmentId);
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('bauman-hub-personal');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    const rows=await new Promise((resolve,reject)=>{const r=db.transaction('attachments').objectStore('attachments').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();
    return{visible:main.researchFiles.retained.length,orphans:rows.filter(x=>x.scopeId===s.scopeId&&!refs.includes(x.attachmentId)).length};
  });
  assert.deepEqual(retention,{visible:8,orphans:0},'Evicted or replaced attachment references must release their scoped binary payloads');checks.push('bounded attachment retention / scoped orphan cleanup');
  const secondTab=await context.newPage();
  await secondTab.route('**/storage-fixture',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="bauman-access-mode" content="standalone"><script src="/assets/js/platform/hub-personal-store.js"></script>'}));
  await secondTab.goto(new URL('storage-fixture',BASE).href);await secondTab.evaluate(()=>window.BAUMAN_HUB_PERSONAL_STORE.initialize());
  await page.evaluate(async()=>{const s=window.BAUMAN_HUB_PERSONAL_STORE,key='bauman_main_all_phases_subjects_v1',main=s.get(key);main.progress.math=24;await s.set(key,main)});
  const staleWrite=await secondTab.evaluate(async()=>{const s=window.BAUMAN_HUB_PERSONAL_STORE,key='bauman_main_all_phases_subjects_v1',main=s.get(key);main.progress.math=99;let rejected=false;try{await s.set(key,main)}catch{rejected=true}await s.initialize();return{rejected,progress:s.get(key).progress.math}});
  assert.deepEqual(staleWrite,{rejected:true,progress:24},'A stale tab must reject rather than overwrite newer canonical data');await secondTab.close();checks.push('two tabs reject stale canonical writes / reload retains newer data');
  await context.close();

  const freshContext=await browser.newContext(),freshPage=await freshContext.newPage();
  await freshPage.goto(BASE);await freshPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  const freshRestore=await freshPage.evaluate(async bundle=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE,before=s.scopeId,note='bauman_schedule_reference_notes_v1';
    await s.set(note,[{id:'existing',text:'Keep'}]);let populatedRejected=false;try{await s.importBundle(bundle,{allowEmptyStandaloneProfileRecovery:true})}catch{populatedRejected=true}
    const kept=s.get(note)[0].text;await s.set(note,[]);
    const corrupt=structuredClone(bundle);corrupt.attachments[0].sha256='invalid';let invalidRejected=false;try{await s.importBundle(corrupt,{allowEmptyStandaloneProfileRecovery:true})}catch{invalidRejected=true}
    const invalidScopeUnchanged=s.scopeId===before;
    let restored=false,error='';try{await s.importBundle(bundle,{allowEmptyStandaloneProfileRecovery:true});restored=true}catch(e){error=String(e)}
    return{before,populatedRejected,kept,invalidRejected,invalidScopeUnchanged,restored,error,scope:s.scopeId,progress:s.get('bauman_main_all_phases_subjects_v1',{}).progress?.math};
  },migration.bundle);
  assert.equal(freshRestore.restored,true,'Portable recovery must restore an existing backed-up profile on a fresh standalone Hub');assert.equal(freshRestore.scope,'a@example.com');assert.equal(freshRestore.progress,0);
  assert.equal(freshRestore.populatedRejected,true);assert.equal(freshRestore.kept,'Keep');assert.equal(freshRestore.invalidRejected,true);assert.equal(freshRestore.invalidScopeUnchanged,true);
  await freshPage.reload();await freshPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');assert.equal(await freshPage.evaluate(()=>auth.current.email),'a@example.com');await freshContext.close();checks.push('clean standalone browser restores backed-up existing profile without account-switch UI');

  const unavailable=await fixture();
  const unavailableResult=await unavailable.page.evaluate(async()=>{
    localStorage.setItem('bauman_current_user_fullcode_v1',JSON.stringify({email:'owner@example.com'}));localStorage.setItem('bauman_main_all_phases_subjects_v1',JSON.stringify({progress:{math:42}}));
    Object.defineProperty(window,'indexedDB',{value:undefined});const s=window.BAUMAN_HUB_PERSONAL_STORE;
    let failed=false;try{await s.initialize({profile:{email:'different@example.com'}})}catch{failed=true}
    let inaccessible=false;try{s.get('bauman_main_all_phases_subjects_v1')}catch{inaccessible=true}
    return{failed,inaccessible,readOnly:s.readOnly,retained:JSON.parse(localStorage.getItem('bauman_main_all_phases_subjects_v1')).progress.math};
  });
  assert.deepEqual(unavailableResult,{failed:true,inaccessible:true,readOnly:false,retained:42});await unavailable.context.close();checks.push('unavailable IndexedDB fails closed across distinct existing profiles');

  const retry=await fixture();
  const interrupted=await retry.page.evaluate(async()=>{
    localStorage.setItem('bauman_main_all_phases_subjects_v1',JSON.stringify({progress:{math:42}}));
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(){if(this.name==='records')throw new DOMException('Interrupted migration','AbortError');return put.apply(this,arguments)};
    const s=window.BAUMAN_HUB_PERSONAL_STORE;let error='';try{await s.initialize()}catch(e){error=e.name}
    const recovery={readOnly:s.readOnly,progress:s.get('bauman_main_all_phases_subjects_v1',{}).progress.math};
    IDBObjectStore.prototype.put=put;
    const retained=JSON.parse(localStorage.getItem('bauman_main_all_phases_subjects_v1')).progress.math;
    await s.initialize();const result=s.get('bauman_main_all_phases_subjects_v1');
    await s.initialize({profile:{email:'another@example.com'}});
    return {error,recovery,retained,result,other:s.get('bauman_main_all_phases_subjects_v1',null)};
  });
  assert.equal(interrupted.error,'AbortError');assert.equal(interrupted.retained,42);assert.equal(interrupted.result.progress.math,42);assert.equal(interrupted.other,null);checks.push('interrupted migration retry / global single-owner claim');
  assert.deepEqual(interrupted.recovery,{readOnly:true,progress:42},'Failed migration must continue exposing the recoverable legacy state read-only');
  const durability=await retry.page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE;
    await s.set('bauman_schedule_reference_notes_v1',[{id:'saved',text:'durable'}]);
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(){if(this.name==='records')throw new DOMException('Quota','QuotaExceededError');return put.apply(this,arguments)};
    let failed=false;try{await s.set('bauman_schedule_reference_notes_v1',[{id:'lost',text:'not saved'}])}catch{failed=true}
    let flushFailed=false;try{await s.flush()}catch{flushFailed=true}
    IDBObjectStore.prototype.put=put;
    const kept=s.get('bauman_schedule_reference_notes_v1');
    await s.set('bauman_schedule_reference_notes_v1',[{id:'retry',text:'now saved'}]);await s.flush();
    return {failed,flushFailed,kept,retried:s.get('bauman_schedule_reference_notes_v1')};
  });
  assert.equal(durability.failed,true);assert.equal(durability.flushFailed,true,'flush must not claim failed writes are durable');assert.deepEqual(durability.kept,[{id:'saved',text:'durable'}]);assert.deepEqual(durability.retried,[{id:'retry',text:'now saved'}]);checks.push('write failure visibility / durable cache rollback / retry clears failure');
  const isolation=await retry.page.evaluate(async()=>{
    const s=window.BAUMAN_HUB_PERSONAL_STORE;
    await s.set('bauman_academic_2026_diagnostics_v1',{users:{[s.scopeId]:{gateDiagnostics:{P1:{D0:0}}},'private-other@example.com':{secret:'other'}}});
    const backup=await s.exportBundle();
    let embeddedRejected=false;try{await s.set('bauman_main_all_phases_subjects_v1',{researchFiles:{x:[{name:'x',content:'data:text/plain,secret'}]}})}catch{embeddedRejected=true}
    return {backup,embeddedRejected};
  });
  assert.ok(!JSON.stringify(isolation.backup).includes('private-other@example.com'),'Backup must never include another profile even in a legacy-shaped academic record');assert.equal(isolation.embeddedRejected,true,'Canonical record must not accept embedded binary payloads');checks.push('scoped writes / binary state invariant');
  await retry.context.close();
  const recoveryContext=await browser.newContext(),recoveryPage=await recoveryContext.newPage(),recoveryErrors=[];
  recoveryPage.on('pageerror',e=>recoveryErrors.push(String(e)));
  await recoveryPage.addInitScript(()=>{
    localStorage.setItem('bauman_main_all_phases_subjects_v1',JSON.stringify({progress:{math:42}}));
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(){if(this.name==='records')throw new DOMException('Quota fixture','QuotaExceededError');return put.apply(this,arguments)};
  });
  await recoveryPage.goto(BASE);
  await recoveryPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  const recovered=await recoveryPage.evaluate(()=>({progress:state.progress.math,readOnly:window.BAUMAN_HUB_PERSONAL_STORE.readOnly,shown:!document.getElementById('appRoot').classList.contains('hidden'),inert:document.getElementById('appRoot').inert,banner:!document.getElementById('hubPersonalStorageStatus').hidden}));
  assert.deepEqual(recovered,{progress:42,readOnly:true,shown:true,inert:true,banner:true});assert.deepEqual(recoveryErrors,[]);
  await recoveryContext.close();checks.push('real Hub migration failure / read-only recovery / visible status / no reset');
  const hubContext=await browser.newContext({viewport:{width:1440,height:900}}),hubPage=await hubContext.newPage(),hubErrors=[];
  hubPage.on('pageerror',e=>hubErrors.push(String(e)));hubPage.on('console',m=>{if(m.type()==='error')hubErrors.push(m.text())});
  await hubPage.addInitScript(()=>{
    if(window.top!==window)return;
    localStorage.setItem('bauman_current_user_fullcode_v1',JSON.stringify({email:'learner@example.com',name:'Learner',role:'admin'}));
    localStorage.setItem('bauman_main_all_phases_subjects_v1',JSON.stringify({progress:{math:0},schedule:{weekStart:'2026-10-05',autoFrom:'2026-10-01',autoTo:'2026-11-30',entries:{'2026-10-05|afternoon':{subjectId:'math',source:'manual',learningItem:'Keep'}}},deepStudyJournal:{version:1,entries:[{id:'j1',type:'error',title:'Kept',body:'Reflection'}]},researchFiles:{'ugv-r-0':[{name:'legacy.html',mime:'text/html',content:'data:text/html;base64,PGgxPkh1YjwvaDE+'}]}}));
    localStorage.setItem('bauman_schedule_reference_notes_v1',JSON.stringify([{id:'sn1',text:'Schedule note'}]));
    localStorage.setItem('bauman_subjects_reference_custom_v1',JSON.stringify([{key:'custom1',id:'custom1',name:'My course'}]));
    localStorage.setItem('bauman_subjects_reference_teacher_overrides_v1',JSON.stringify({math:'GV: Local'}));
    localStorage.setItem('bauman_thesis_reference_notes_v1',JSON.stringify([{id:'rn1',text:'Research note'}]));
  });
  await hubPage.goto(BASE);await hubPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  await hubPage.waitForFunction(()=>window.app?.__academic13fApplyPatched===true);
  const hubBackup=await hubPage.evaluate(async()=>{await save();return window.BAUMAN_HUB_PERSONAL_STORE.exportBundle()});
  assert.equal(hubBackup.records.bauman_main_all_phases_subjects_v1.progress.math,0);
  assert.equal(hubBackup.records.bauman_main_all_phases_subjects_v1.deepStudyJournal.entries[0].id,'j1');
  assert.equal(hubBackup.records.bauman_schedule_reference_notes_v1[0].text,'Schedule note');
  assert.equal(hubBackup.records.bauman_subjects_reference_custom_v1[0].key,'custom1');
  assert.equal(hubBackup.records.bauman_subjects_reference_teacher_overrides_v1.math,'GV: Local');
  assert.equal(hubBackup.records.bauman_thesis_reference_notes_v1[0].text,'Research note');
  await hubPage.evaluate(async bundle=>{state.progress.math=99;await save();await window.BAUMAN_HUB_PERSONAL_STORE.set('bauman_schedule_reference_notes_v1',[]);await window.BAUMAN_HUB_PERSONAL_STORE.importBundle(bundle);localStorage.clear()},hubBackup);
  await hubPage.reload();await hubPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  const restoredHub=await hubPage.evaluate(()=>({progress:state.progress.math,journal:state.deepStudyJournal.entries[0].id,manual:state.schedule.entries['2026-10-05|afternoon'].source,notes:window.BAUMAN_HUB_PERSONAL_STORE.get('bauman_schedule_reference_notes_v1')[0].text}));
  assert.deepEqual(restoredHub,{progress:0,journal:'j1',manual:'manual',notes:'Schedule note'});
  await hubPage.evaluate(()=>openResearchFile('ugv-r-0',0));await hubPage.waitForSelector('#modalRoot iframe[src^="blob:"]');
  assert.equal(await hubPage.locator('#modalRoot iframe').getAttribute('sandbox'),'','HTML attachments must not execute against Hub origin');
  await hubPage.evaluate(()=>closeModal());
  // Offline means the local runtime remains available while every external
  // provider is unreachable. No subject or external-provider data is accessed.
  await hubPage.route('**/*',route=>new URL(route.request().url()).origin===new URL(BASE).origin?route.continue():route.abort('internetdisconnected'));
  await hubPage.reload();await hubPage.waitForFunction(()=>document.documentElement.dataset.hubPersonalReady==='true');
  assert.equal(await hubPage.evaluate(()=>state.progress.math),0);
  for(const route of ['home','roadmap','subjects','schedule','research']){
    await hubPage.evaluate(route=>app.page(route,false),route);
    assert.equal(await hubPage.locator(`#page-${route}.active`).count(),1);
    assert.ok(await hubPage.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  }
  await hubPage.setViewportSize({width:390,height:844});
  for(const route of ['home','roadmap','subjects','schedule','research']){await hubPage.evaluate(route=>app.page(route,false),route);assert.ok(await hubPage.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`Mobile overflow: ${route}`)}
  assert.deepEqual(hubErrors,[]);await hubPage.screenshot({path:path.join(OUT,'storage-mobile-research.png'),fullPage:true});
  await hubContext.close();checks.push('real Hub complete migration / portable restore / binary open / five routes desktop-mobile / offline local reload');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks},null,2));
  console.log('HUB_PERSONAL_STORAGE_BROWSER_PASS '+checks.length);
}finally{await browser.close()}
