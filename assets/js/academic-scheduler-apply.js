'use strict';
(function(){
  const VERSION='Academic Scheduler Apply · Pass 13F';
  const TX_STORAGE_KEY='bauman_academic_2026_schedule_transactions_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  const EXPLICIT_APPLY_ENABLED=true;
  const MAX_CHANGES=6;
  const ALLOWED_PREVIEW_ACTIONS=new Set(['DIAGNOSE','LOCATE_FAILED_NODES','REPAIR_MATCHED','BRIDGE_TO_READY','REPAIR','REVIEW_DIAGNOSTIC']);
  const MUTABLE_BASELINE_SOURCES=new Set(['auto','review']);
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function currentUserScope(){try{const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');return String(u?.email||'anonymous').toLowerCase()}catch{return 'anonymous'}}
  function stableValue(value){
    if(Array.isArray(value))return value.map(stableValue);
    if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stableValue(value[k])]));
    return value;
  }
  function sameValue(a,b){return JSON.stringify(stableValue(a))===JSON.stringify(stableValue(b))}
  function stableEntries(entries){return Object.fromEntries(Object.entries(entries||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v]))}
  function fnv1a(text){let hash=0x811c9dc5;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193)}return (hash>>>0).toString(16).padStart(8,'0')}
  function scheduleFingerprint(){const s=window.state?.schedule||{};return fnv1a(JSON.stringify({autoStage:s.autoStage||'',autoFrom:s.autoFrom||'',autoTo:s.autoTo||'',targetScore:Number(s.targetScore)||null,entries:stableEntries(s.entries||{})}))}
  function previewRuntime(){return window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026||null}
  function readPreview(){return previewRuntime()?.readStoredPreview?.()||null}

  function blankTxStore(){return {schema:'bauman_academic_schedule_transaction_store_v1',version:'PASS13F',users:{}}}
  function readTxStore(){try{const x=JSON.parse(localStorage.getItem(TX_STORAGE_KEY)||'null');return x&&typeof x==='object'?x:blankTxStore()}catch{return blankTxStore()}}
  function userTxState(store=readTxStore()){store.version='PASS13F';store.users=store.users&&typeof store.users==='object'?store.users:{};const scope=currentUserScope();store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{transactions:[]};store.users[scope].transactions=Array.isArray(store.users[scope].transactions)?store.users[scope].transactions:[];return {store,scope,user:store.users[scope]}}
  function persistTxStore(store){localStorage.setItem(TX_STORAGE_KEY,JSON.stringify(store));return true}
  function transactionHistory(){const {user}=userTxState();return clone(user.transactions||[])}
  function latestActiveTransaction(){const rows=transactionHistory().filter(x=>x.status==='applied');return rows.at(-1)||null}
  function makeTransactionId(){return globalThis.crypto?.randomUUID?.()||`academic-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}
  function saveMain(){if(typeof window.save!=='function')throw new Error('Main save() chưa sẵn sàng.');window.save()}

  function validatePreviewForApply(preview=readPreview()){
    if(!EXPLICIT_APPLY_ENABLED)throw new Error('Explicit Apply đang bị khóa.');
    if(!preview||preview.schema!=='bauman_academic_schedule_preview_v1')throw new Error('Chưa có scheduler preview hợp lệ để Apply.');
    if(preview.version!=='PASS13D'||preview.mode!=='preview_only')throw new Error('Preview version/mode không tương thích Pass13F.');
    if(!window.state?.schedule?.entries)throw new Error('Main schedule chưa sẵn sàng.');
    if(previewRuntime()?.previewIsStale?.(preview)!==false)throw new Error('Preview đã STALE vì lịch Main thay đổi. Hãy tạo preview mới.');
    if(scheduleFingerprint()!==preview.baselineFingerprint)throw new Error('Fingerprint hiện tại không khớp baseline của preview.');
    const changes=Array.isArray(preview.changes)?preview.changes:[];
    if(!changes.length)throw new Error('Preview không có thay đổi để Apply.');
    if(changes.length>MAX_CHANGES)throw new Error(`Preview vượt giới hạn ${MAX_CHANGES} thay đổi.`);
    const keys=new Set();
    for(const change of changes){
      if(!change?.key||keys.has(change.key))throw new Error('Preview có slot key thiếu hoặc trùng.');keys.add(change.key);
      if(!ALLOWED_PREVIEW_ACTIONS.has(change.action))throw new Error(`Action ${change.action||'—'} không được phép Apply.`);
      if(change.proposed?.source!=='academic_preview')throw new Error(`Slot ${change.key} không phải Academic preview.`);
      const current=window.state.schedule.entries[change.key]||null;
      if(!sameValue(current,change.current||null))throw new Error(`Slot ${change.key} đã thay đổi so với preview baseline.`);
      if(current&&!MUTABLE_BASELINE_SOURCES.has(current.source||''))throw new Error(`Slot ${change.key} hiện là manual/external và được bảo vệ.`);
      if(change.action==='REPAIR_MATCHED'){
        if(!(change.repairEvidence?.routeIds||[]).length||!(change.repairEvidence?.failedNodeIds||[]).length)throw new Error(`REPAIR_MATCHED ${change.key} thiếu repair evidence.`);
      }
      if(change.action==='STOP_BROAD'||change.action==='JIT_ONLY')throw new Error(`STOP/JIT gate không được Apply vào lịch broad remediation.`);
    }
    return {preview,changes};
  }

  function buildAppliedEntry(change,transactionId,appliedAt){
    const proposed=clone(change.proposed||{});
    return {...proposed,source:'academic_applied',academic2026:{...(proposed.academic2026||{}),transactionId,previewGeneratedAt:change.previewGeneratedAt||null,appliedAt,explicitUserApply:true}};
  }

  function applyApprovedPreview(options={}){
    if(options.confirmed!==true)throw new Error('Apply yêu cầu xác nhận rõ ràng của người dùng.');
    const {preview,changes}=validatePreviewForApply(),transactionId=makeTransactionId(),appliedAt=new Date().toISOString(),beforeFingerprint=scheduleFingerprint(),beforeEntries=clone(window.state.schedule.entries),nextEntries=clone(beforeEntries),entriesBefore={},entriesAfter={};
    for(const change of changes){
      entriesBefore[change.key]=clone(change.current||null);
      const applied=buildAppliedEntry({...change,previewGeneratedAt:preview.generatedAt},transactionId,appliedAt);
      nextEntries[change.key]=applied;entriesAfter[change.key]=clone(applied);
    }
    const rollbackToBefore=()=>{window.state.schedule.entries=clone(beforeEntries);try{saveMain()}catch{/* preserve best-effort rollback */}};
    try{
      window.state.schedule.entries=nextEntries;saveMain();
      const afterFingerprint=scheduleFingerprint();
      if(afterFingerprint===beforeFingerprint)throw new Error('Apply không tạo thay đổi fingerprint như kỳ vọng.');
      const tx={schema:'bauman_academic_schedule_transaction_v1',version:'PASS13F',id:transactionId,status:'applied',previewGeneratedAt:preview.generatedAt,stageId:preview.stageId,appliedAt,beforeFingerprint,afterFingerprint,changedKeys:changes.map(x=>x.key),entriesBefore,entriesAfter,manualExternalPreserved:Number(preview.summary?.manualOrExternalPreserved||0),requiresExactAfterFingerprintForRollback:true};
      const {store,user}=userTxState();user.transactions.push(tx);user.transactions=user.transactions.slice(-20);
      try{persistTxStore(store)}catch(err){rollbackToBefore();throw new Error(`Không lưu được transaction; lịch đã rollback: ${err.message||err}`)}
      refreshUi();return clone(tx);
    }catch(err){
      if(scheduleFingerprint()!==beforeFingerprint)rollbackToBefore();
      throw err;
    }
  }

  function rollbackLatest(options={}){
    if(options.confirmed!==true)throw new Error('Rollback yêu cầu xác nhận rõ ràng của người dùng.');
    const tx=latestActiveTransaction();if(!tx)throw new Error('Không có Academic transaction đang active để rollback.');
    const currentFingerprint=scheduleFingerprint();if(currentFingerprint!==tx.afterFingerprint)throw new Error('Không thể rollback: lịch đã thay đổi sau Apply. Hãy xử lý thay đổi mới trước.');
    const beforeRollbackEntries=clone(window.state.schedule.entries),nextEntries=clone(beforeRollbackEntries);
    for(const key of tx.changedKeys||[]){const original=tx.entriesBefore?.[key];if(original==null)delete nextEntries[key];else nextEntries[key]=clone(original)}
    const restoreApplied=()=>{window.state.schedule.entries=clone(beforeRollbackEntries);try{saveMain()}catch{/* best effort */}};
    try{
      window.state.schedule.entries=nextEntries;saveMain();
      const restoredFingerprint=scheduleFingerprint();if(restoredFingerprint!==tx.beforeFingerprint)throw new Error('Rollback verification failed: fingerprint không trở về baseline.');
      const {store,user}=userTxState();const row=user.transactions.find(x=>x.id===tx.id);if(row){row.status='rolled_back';row.rolledBackAt=new Date().toISOString();row.rollbackFingerprint=restoredFingerprint}persistTxStore(store);refreshUi();return clone(row||tx);
    }catch(err){restoreApplied();throw err}
  }

  function applyFromUi(){try{if(!confirm('Apply các thay đổi Academic 2026 trong preview vào lịch? Manual/external slot vẫn được bảo vệ và có transaction rollback.'))return null;const tx=applyApprovedPreview({confirmed:true});if(typeof window.toast==='function')window.toast(`Đã Apply ${tx.changedKeys.length} slot · có thể rollback`);return tx}catch(err){alert(err.message||String(err));return null}}
  function rollbackFromUi(){try{if(!confirm('Rollback transaction Academic gần nhất? Chỉ thực hiện nếu lịch chưa bị thay đổi sau Apply.'))return null;const tx=rollbackLatest({confirmed:true});if(typeof window.toast==='function')window.toast('Đã rollback lịch Academic về baseline');return tx}catch(err){alert(err.message||String(err));return null}}

  function renderControls(){
    const host=document.querySelector('[data-academic13d="preview"]');if(!host)return;
    host.querySelector('[data-academic13f="apply"]')?.remove();
    const preview=readPreview(),stale=preview?previewRuntime()?.previewIsStale?.(preview)!==false:true,changes=preview?.changes?.length||0,tx=latestActiveTransaction(),rollbackSafe=Boolean(tx&&scheduleFingerprint()===tx.afterFingerprint);
    const applyDisabled=!preview||stale||!changes;const status=!preview?'Chưa có preview':stale?'Preview STALE':`${changes} thay đổi · baseline hợp lệ`;
    host.insertAdjacentHTML('beforeend',`<div class="academic2026-apply-panel" data-academic13f="apply"><div><b>PASS 13F · Transactional Apply</b><small>${h(status)}. Apply chỉ chạy khi người dùng xác nhận; không có auto-apply.</small></div><div class="academic2026-apply-actions"><button class="btn primary" onclick="applyAcademicSchedulePreview2026()" ${applyDisabled?'disabled':''}>Apply preview đã duyệt</button><button class="btn" onclick="rollbackAcademicSchedule2026()" ${rollbackSafe?'':'disabled'}>Rollback transaction gần nhất</button></div>${tx?`<small>Transaction ${h(tx.id)} · ${h(tx.status)}${rollbackSafe?' · rollback-safe':' · lịch đã lệch fingerprint'}</small>`:''}</div>`);
  }
  function refreshUi(){try{if(window.app?.home)window.app.home();else renderControls()}catch{renderControls()}}
  function patchHome(){if(!window.app||window.app.__academic13fApplyPatched)return false;const app=window.app,oldHome=app.home?.bind(app);if(!oldHome)return false;app.__academic13fApplyPatched=true;app.home=function(){oldHome();renderControls()};app.home();return true}
  function init(attempt=0){const ready=previewRuntime()&&window.app?.__academic13dPreviewPatched&&window.app?.__academic2026Patched&&window.state?.schedule;if(ready&&patchHome()){console.info(VERSION,{explicitApply:EXPLICIT_APPLY_ENABLED,transactionStore:TX_STORAGE_KEY});return}if(attempt<60)setTimeout(()=>init(attempt+1),100);else console.warn(`${VERSION} disabled safely: prerequisite runtimes not ready`)}

  function loadPass14AAssets(){
    if(!document.querySelector('link[data-course-learning14a]')){const link=document.createElement('link');link.rel='stylesheet';link.href='assets/css/academic-course-learning.css';link.dataset.courseLearning14a='css';document.head.appendChild(link)}
    if(!document.querySelector('script[data-course-learning14a]')&&!window.BAUMAN_OFFICIAL_COURSE_LEARNING_2026){const script=document.createElement('script');script.src='assets/js/academic-course-learning.js';script.dataset.courseLearning14a='js';document.body.appendChild(script)}
  }

  window.applyAcademicSchedulePreview2026=applyFromUi;
  window.rollbackAcademicSchedule2026=rollbackFromUi;
  window.BAUMAN_ACADEMIC_SCHEDULER_APPLY_2026=Object.freeze({version:VERSION,applyApprovedPreview,rollbackLatest,validatePreviewForApply,transactionHistory,latestActiveTransaction,scheduleFingerprint,explicitApplyEnabled:EXPLICIT_APPLY_ENABLED,storageKey:TX_STORAGE_KEY});
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>init(0),0);setTimeout(loadPass14AAssets,0)});
})();