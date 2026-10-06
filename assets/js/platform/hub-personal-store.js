/* Hub personal data: one local IndexedDB owner. Device Gate and subject stores
 * remain outside this boundary. Synchronous projections use an initialized
 * cache; completion promises describe durable writes, never localStorage. */
(()=>{
'use strict';
const DB_NAME='bauman-hub-personal',DB_VERSION=1,SCHEMA_VERSION=1;
const MAIN='bauman_main_all_phases_subjects_v1';
const USERS='bauman_main_users_fullcode_v1',CURRENT='bauman_current_user_fullcode_v1';
const KEYS=Object.freeze([
  MAIN,'bauman_academic_2026_diagnostics_v1',
  'bauman_academic_2026_schedule_preview_v1','bauman_academic_2026_schedule_transactions_v1',
  'bauman_schedule_reference_notes_v1','bauman_subjects_reference_notes_v1',
  'bauman_subjects_reference_custom_v1','bauman_subjects_reference_teacher_overrides_v1',
  'bauman_thesis_reference_tasks_v1','bauman_thesis_reference_notes_v1'
]);
const ARRAY_KEYS=new Set(KEYS.filter(k=>/reference_(notes|custom|tasks)_v1$/.test(k)));
const ACADEMIC_KEYS=new Set(KEYS.filter(k=>k.startsWith('bauman_academic_')));
const MANAGED=Object.freeze({name:'Bauman Master Hub',email:'app-manager@bauman.local',role:'user',managedBy:'app-manager'});
const DEFAULT_PROFILE=Object.freeze({email:'local@bauman.dev',name:'Người học',role:'admin'});
const clone=value=>value==null?value:structuredClone(value);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const recordId=(scope,key)=>JSON.stringify([scope,key]);
let db=null,cache={},committedCache={},accounts=[],profile=null,scopeId=null,ready=false,readOnly=false;
let keyVersions={},writeFailures={};
let chain=Promise.resolve(),status={state:'UNINITIALIZED',schemaVersion:SCHEMA_VERSION};
let generation=0,writeVersion=0;

function report(state,error){
  status={state,schemaVersion:SCHEMA_VERSION,scopeId,readOnly,error:error?String(error.message||error):null};
  window.dispatchEvent(new CustomEvent('hub-personal-store-status',{detail:clone(status)}));
}
function enqueue(operation){
  const result=chain.then(operation);
  chain=result.catch(()=>{});
  // Callers may be synchronous renderers. Observe every rejected write while
  // preserving its rejection for callers which await persistence.
  result.catch(error=>{if(status.state!=='MIGRATION_FAILED')report('WRITE_FAILED',error)});
  return result;
}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function transaction(stores,mode,work){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(stores,mode);let value,error;
    tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(error||tx.error||new DOMException('Storage transaction aborted','AbortError'));tx.onerror=()=>{};
    try{value=work(tx)}catch(err){error=err;tx.abort()}
  });
}
async function open(){
  if(db)return db;
  if(!window.indexedDB)throw new Error('IndexedDB không khả dụng. Dữ liệu cũ vẫn được giữ nguyên.');
  db=await new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{for(const store of ['records','attachments','meta','accounts'])req.result.createObjectStore(store,{keyPath:'id'})};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    req.onblocked=()=>report('BLOCKED',new Error('Đóng tab Hub cũ để mở kho dữ liệu.'));
  });
  db.onversionchange=()=>{db.close();db=null;ready=false;report('BLOCKED',new Error('Kho dữ liệu đã đổi phiên bản. Hãy tải lại Hub.'))};
  return db;
}
async function getRow(store,id){return request(db.transaction(store,'readonly').objectStore(store).get(id))}
function legacy(key){
  const text=localStorage.getItem(key);
  if(text===null)return null;
  try{return JSON.parse(text)}catch{throw new Error(`Dữ liệu cũ không hợp lệ (${key}); chưa thay đổi nguồn phục hồi.`)}
}
function safeProfile(value){
  if(!object(value)||typeof value.email!=='string'||!value.email.trim())return null;
  return {email:value.email.trim().toLowerCase(),name:String(value.name||'Người học'),role:String(value.role||'user'),...(value.managedBy==='app-manager'?{managedBy:'app-manager'}:{})};
}
function managed(){return (document.querySelector('meta[name="bauman-access-mode"]')?.content||'').trim().toLowerCase()==='managed'||window.BAUMAN_RUNTIME_CONFIG?.control?.accessMode==='managed'}
function validate(key,value){
  if(!KEYS.includes(key))throw new Error('Unknown Hub personal record: '+key);
  if(ARRAY_KEYS.has(key)?!Array.isArray(value):!object(value))throw new Error('Invalid Hub personal record: '+key);
  return clone(value);
}
function sanitize(key,value,scope){
  value=validate(key,value);
  if(key==='bauman_subjects_reference_notes_v1'||key==='bauman_thesis_reference_notes_v1')value=value.filter(x=>object(x)&&x.id&&!['n1','n2','n3','n4'].includes(x.id));
  if(key==='bauman_thesis_reference_tasks_v1')value=value.filter(x=>object(x)&&x.id&&!/^t(?:0[1-9]|1[0-6])$/.test(x.id));
  if(ACADEMIC_KEYS.has(key)){
    const users=object(value.users)?value.users:{};
    // Old anonymous records belong to the one legacy owner, never every scope.
    const own=users[scope]||users.anonymous;
    value.users=own?{[scope]:clone(own)}:{};
  }
  return value;
}
function canonicalValue(key,value,scope){
  value=sanitize(key,value,scope);
  if(key===MAIN)for(const files of Object.values(value.researchFiles||{})){
    if(!Array.isArray(files))throw new Error('Invalid research attachment list');
    for(const file of files)if(!object(file)||typeof file.attachmentId!=='string'||file.content!==undefined)throw new Error('Binary payloads require the dedicated attachment store');
  }
  return value;
}
function fromDataURL(url){
  const match=/^data:([^,]*),(.*)$/s.exec(url);
  if(!match)throw new Error('Invalid research attachment Data URL');
  const mime=match[1].split(';')[0]||'text/plain';
  if(/;base64(?:;|$)/i.test(match[1]))return new Blob([Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0))],{type:mime});
  return new Blob([decodeURIComponent(match[2])],{type:mime});
}
async function digest(blob){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function extractAttachments(main,scope){
  const blobs=[];
  if(!object(main.researchFiles))return blobs;
  for(const [item,files] of Object.entries(main.researchFiles)){
    if(!Array.isArray(files))throw new Error('Invalid research attachment list');
    for(let i=0;i<files.length;i++){
      const file=files[i];if(!object(file))throw new Error('Invalid research attachment metadata');
      if(typeof file.content==='string'){
        const blob=fromDataURL(file.content),hash=await digest(blob);
        const id='legacy-'+await digest(new Blob([JSON.stringify([scope,item,i,file.name,hash])]));
        const mime=file.mime||blob.type;
        const payload=blob.type===mime?blob:blob.slice(0,blob.size,mime);
        blobs.push({id:recordId(scope,id),scopeId:scope,attachmentId:id,blob:payload,sha256:hash});
        files[i]={...file,attachmentId:id,mime,size:blob.size,sha256:hash};delete files[i].content;
      }else if(!file.attachmentId)throw new Error('Missing research attachment payload');
    }
  }
  return blobs;
}
async function loadScope(scope){
  const next={};
  for(const key of KEYS){const row=await getRow('records',recordId(scope,key));if(row){if(row.schemaVersion!==SCHEMA_VERSION)throw new Error('Unsupported Hub record schema');next[key]=validate(key,row.value)}}
  return next;
}
async function verifyMigration(scope,values,blobs){
  const loaded=await loadScope(scope);
  for(const [key,value] of Object.entries(values))if(JSON.stringify(loaded[key])!==JSON.stringify(value))throw new Error('Migration parity failed: '+key);
  for(const value of blobs){const row=await getRow('attachments',value.id);if(!row?.blob||await digest(row.blob)!==value.sha256)throw new Error('Migration attachment parity failed')}
}
async function migrate(scope){
  let marker=await getRow('meta','legacy-migration');
  if(marker?.scopeId&&marker.scopeId!==scope)return;
  if(marker?.state==='COMPLETE')return;
  const values={},blobs=[];
  for(const key of KEYS){const value=legacy(key);if(value!==null)values[key]=sanitize(key,value,scope)}
  if(values[MAIN])blobs.push(...await extractAttachments(values[MAIN],scope));
  const oldAccounts=legacy(USERS);
  if(oldAccounts!==null&&!Array.isArray(oldAccounts))throw new Error('Invalid legacy account compatibility store');
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(['records','attachments','meta','accounts'],'readwrite');let error;
    tx.oncomplete=resolve;tx.onabort=()=>reject(error||tx.error);tx.onerror=()=>{};
    const meta=tx.objectStore('meta'),claim=meta.get('legacy-migration');
    claim.onsuccess=()=>{
      if(claim.result?.scopeId&&claim.result.scopeId!==scope)return;
      if(claim.result?.state==='COMPLETE')return;
      try{
        for(const [key,value] of Object.entries(values))tx.objectStore('records').put({id:recordId(scope,key),scopeId:scope,key,schemaVersion:SCHEMA_VERSION,value});
        for(const blob of blobs)tx.objectStore('attachments').put(blob);
        // Preserve existing credential store. Managed access never grants auth
        // based on these compatibility records.
        if(oldAccounts!==null)tx.objectStore('accounts').put({id:'global',schemaVersion:SCHEMA_VERSION,value:oldAccounts});
        meta.put({id:'legacy-migration',schemaVersion:SCHEMA_VERSION,scopeId:scope,state:'VERIFYING'});
      }catch(err){error=err;tx.abort()}
    };
  });
  marker=await getRow('meta','legacy-migration');
  if(marker?.scopeId!==scope)return;
  await verifyMigration(scope,values,blobs);
  await transaction(['meta'],'readwrite',tx=>tx.objectStore('meta').put({...marker,state:'COMPLETE'}));
  // Legacy keys remain untouched for rollback until a separately authorized
  // cleanup release. Completed claims prevent stale legacy data re-import.
}
async function initialize(options={}){
  return enqueue(async()=>{
    ready=false;readOnly=false;cache={};committedCache={};keyVersions={};writeFailures={};generation++;report('OPENING');
    try{
      profile=safeProfile(options.profile)||(managed()?{...MANAGED}:safeProfile(legacy(CURRENT))||{...DEFAULT_PROFILE});scopeId=profile.email;
      await open();
      const saved=await getRow('meta','current-profile');
      let resolved=safeProfile(options.profile);
      if(!resolved){
        if(managed())resolved={...MANAGED};
        else{resolved=safeProfile(saved?.value)||safeProfile(legacy(CURRENT));if(resolved?.managedBy==='app-manager')resolved=null;resolved=resolved||{...DEFAULT_PROFILE}}
      }
      profile=resolved;scopeId=resolved.email;
      await migrate(scopeId);
      cache=await loadScope(scopeId);
      committedCache=clone(cache);
      accounts=(await getRow('accounts','global'))?.value||[];
      await transaction(['meta'],'readwrite',tx=>tx.objectStore('meta').put({id:'current-profile',value:profile,schemaVersion:SCHEMA_VERSION}));
      ready=true;report('READY');return clone(status);
    }catch(error){
      // A migration failure never replaces a recoverable dataset with defaults.
      // Prefer the committed scope; otherwise project only this legacy owner.
      try{
        const marker=db?await getRow('meta','legacy-migration'):null;
        cache=db?await loadScope(scopeId):{};
        const legacyOwner=safeProfile(legacy(CURRENT));
        const canRecoverLegacy=marker?.scopeId?marker.scopeId===scopeId:!options.profile||!legacyOwner||legacyOwner.email===scopeId;
        if(!Object.keys(cache).length&&canRecoverLegacy)for(const key of KEYS){const value=legacy(key);if(value!==null)cache[key]=sanitize(key,value,scopeId)}
        readOnly=Object.keys(cache).length>0;
        const recoveredAccounts=db?(await getRow('accounts','global'))?.value:null;
        const oldAccounts=recoveredAccounts||legacy(USERS);accounts=Array.isArray(oldAccounts)?oldAccounts:[];
      }catch{cache={};readOnly=false}
      report('MIGRATION_FAILED',error);throw error;
    }
  });
}
function requireReady(){if(!ready)throw new Error('Kho dữ liệu Hub chưa sẵn sàng; nguồn dữ liệu cũ vẫn được giữ nguyên.')}
function get(key,fallback=null){if(!ready&&!readOnly)requireReady();return clone(Object.hasOwn(cache,key)?cache[key]:fallback)}
function set(key,value){
  requireReady();value=canonicalValue(key,value,scopeId);
  const scope=scopeId,epoch=generation,version=++writeVersion,prior=clone(cache[key]??null);keyVersions[key]=version;cache[key]=clone(value);
  return enqueue(async()=>{
    try{await writeAtomic(scope,{[key]:value},[],{[key]:prior});if(generation===epoch){committedCache[key]=clone(value);delete writeFailures[key]}if(!Object.keys(writeFailures).length)report('READY');return clone(value)}
    catch(error){if(generation===epoch){writeFailures[key]=error;if(keyVersions[key]===version){if(committedCache[key]===undefined)delete cache[key];else cache[key]=clone(committedCache[key])}}throw error}
  });
}
async function flush(){await chain;const error=Object.values(writeFailures)[0];if(error)throw error}
function writeAtomic(scope,values,blobs,expected,nextProfile,sourceGuard){
  return new Promise((resolve,reject)=>{
      const tx=db.transaction(nextProfile?['records','attachments','meta']:['records','attachments'],'readwrite');let error;
      tx.oncomplete=resolve;tx.onabort=()=>reject(error||tx.error||new DOMException('Aborted','AbortError'));tx.onerror=()=>{};
      const records=tx.objectStore('records'),checks=Object.entries(expected).map(([key,value])=>({scope,key,value}));
      if(sourceGuard)for(const [key,value] of Object.entries(sourceGuard.values))checks.push({scope:sourceGuard.scope,key,value});
      let remaining=checks.length;
      const write=()=>{
        try{
          for(const row of blobs){if(row.scopeId!==scope)throw new Error('Attachment scope mismatch');tx.objectStore('attachments').put(row)}
          for(const [key,value] of Object.entries(values))records.put({id:recordId(scope,key),scopeId:scope,key,schemaVersion:SCHEMA_VERSION,value});
          if(nextProfile)tx.objectStore('meta').put({id:'current-profile',schemaVersion:SCHEMA_VERSION,value:nextProfile});
          if(values[MAIN]){
            const referenced=new Set(Object.values(values[MAIN].researchFiles||{}).flat().map(file=>file.attachmentId));
            const cursor=tx.objectStore('attachments').openCursor();
            cursor.onsuccess=()=>{const row=cursor.result;if(!row)return;if(row.value.scopeId===scope&&!referenced.has(row.value.attachmentId))row.delete();row.continue()};
          }
        }catch(err){error=err;tx.abort()}
      };
      if(!remaining)write();
      for(const check of checks){const req=records.get(recordId(check.scope,check.key));req.onsuccess=()=>{
        if(error)return;
        if(JSON.stringify(req.result?.value??null)!==JSON.stringify(check.value??null)){error=new Error('Dữ liệu đã thay đổi ở tab khác. Hãy tải lại trước khi tiếp tục.');tx.abort();return}
        if(--remaining===0)write();
      }}
    });
}
function commit(changes,{blobs=[],expected={}}={}){
  requireReady();const scope=scopeId,epoch=generation;
  const values=Object.fromEntries(Object.entries(changes).map(([key,value])=>[key,canonicalValue(key,value,scope)]));
  const versions=Object.fromEntries(Object.keys(values).map(key=>[key,keyVersions[key]]));
  return enqueue(async()=>{
    const guarded={...Object.fromEntries(Object.keys(values).map(key=>[key,committedCache[key]??null])),...expected};
    await writeAtomic(scope,values,blobs,guarded);
    if(generation===epoch)for(const [key,value] of Object.entries(values)){committedCache[key]=clone(value);delete writeFailures[key];if(versions[key]===keyVersions[key])cache[key]=clone(value)}if(!Object.keys(writeFailures).length)report('READY');return clone(values);
  });
}
function getAccounts(){if(!ready&&!readOnly)requireReady();return clone(accounts)}
function setAccounts(value){
  requireReady();if(!Array.isArray(value))throw new Error('Invalid account compatibility store');const next=clone(value);
  return enqueue(async()=>{await transaction(['accounts'],'readwrite',tx=>tx.objectStore('accounts').put({id:'global',schemaVersion:SCHEMA_VERSION,value:next}));accounts=next;return clone(next)});
}
function currentUser(){return clone(profile)}
function setCurrentUser(value){
  requireReady();const next=safeProfile(value);
  if(next&&next.email!==scopeId)throw new Error('Profile scope change requires reload/bootstrap');
  profile=next;
  return enqueue(()=>transaction(['meta'],'readwrite',tx=>tx.objectStore('meta').put({id:'current-profile',schemaVersion:SCHEMA_VERSION,value:next})));
}
async function getAttachment(id){if(!ready&&!readOnly)requireReady();if(!db)throw new Error('Research attachment is unavailable');const row=await getRow('attachments',recordId(scopeId,id));if(!row?.blob)throw new Error('Research attachment is unavailable');return row.blob}
async function addResearchAttachment(item,file,mainValue){
  requireReady();await flush();
  const scope=scopeId,main=clone(mainValue||cache[MAIN]||{}),before=get(MAIN,null);
  const id=crypto.randomUUID(),sha256=await digest(file),mime=file.type||'application/octet-stream';
  const blob=file.slice(0,file.size,mime),ext=file.name.split('.').at(-1).toLowerCase();
  const metadata={name:file.name,mime,typeLabel:mime.startsWith('video/')?'Video':ext==='json'?'JSON':'HTML',attachmentId:id,size:file.size,sha256,addedAt:new Date().toISOString()};
  main.researchFiles=main.researchFiles||{};main.researchFiles[item]=[...(main.researchFiles[item]||[]),metadata].slice(-8);
  await commit({[MAIN]:main},{blobs:[{id:recordId(scope,id),scopeId:scope,attachmentId:id,blob,sha256}],expected:{[MAIN]:before}});
  return clone(main);
}
function redact(value){
  if(Array.isArray(value))return value.map(redact);
  if(!object(value))return value;
  return Object.fromEntries(Object.entries(value).filter(([key])=>!/^password(?:Hash|Salt|Iterations)?$/i.test(key)).map(([key,item])=>[key,redact(item)]));
}
async function exportBundle(){
  if(!ready&&!readOnly)requireReady();await flush();
  const records=redact(clone(cache)),attachments=[];
  const recoveryBlobs=readOnly&&records[MAIN]?await extractAttachments(records[MAIN],scopeId):[];
  for(const files of Object.values(records[MAIN]?.researchFiles||{}))for(const file of files){
    const blob=recoveryBlobs.find(x=>x.attachmentId===file.attachmentId)?.blob||await getAttachment(file.attachmentId),bytes=new Uint8Array(await blob.arrayBuffer());
    let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
    attachments.push({attachmentId:file.attachmentId,mime:blob.type,size:blob.size,sha256:await digest(blob),base64:btoa(binary)});
  }
  return {schema:'bauman-hub-personal-backup',version:SCHEMA_VERSION,scopeId,profile:safeProfile(profile),exportedAt:new Date().toISOString(),records,attachments};
}
function pristineDefaultScope(){
  if(managed()||scopeId!==DEFAULT_PROFILE.email||accounts.length)return false;
  for(const [key,value] of Object.entries(cache)){
    if(key===MAIN){
      for(const name of ['progress','subjectReports','subjectCapabilities','subjectRouteReceipts','researchChecks','researchFiles'])if(Object.keys(value[name]||{}).length)return false;
      if(value.deepStudyJournal?.entries?.length||value.activity?.length||value.reviewQueue?.length||value.activeTask)return false;
      if(Object.values(value.schedule?.entries||{}).some(entry=>!['auto','review'].includes(entry.source)))return false;
    }else if(ACADEMIC_KEYS.has(key)){
      for(const user of Object.values(value.users||{}))if(Object.keys(user.gateDiagnostics||{}).length||user.preview||user.transactions?.length)return false;
    }else if(Array.isArray(value)?value.length:Object.keys(value).length)return false;
  }
  return true;
}
async function importBundle(bundle,{normalizeState,allowEmptyStandaloneProfileRecovery=false}={}){
  requireReady();await flush();
  let scope=scopeId,values,blobs=[],recoveryProfile=null;
  if(bundle?.schema==='bauman-hub-personal-backup'){
    if(bundle.version!==SCHEMA_VERSION||!object(bundle.records)||!Array.isArray(bundle.attachments))throw new Error('Backup version/profile is incompatible');
    if(bundle.scopeId!==scope){
      const incoming=safeProfile(bundle.profile);
      if(!allowEmptyStandaloneProfileRecovery||!incoming||incoming.managedBy||incoming.email!==bundle.scopeId||!pristineDefaultScope()||Object.keys(await loadScope(incoming.email)).length)throw new Error('Backup profile is incompatible');
      scope=incoming.email;recoveryProfile=incoming;
    }
    values=Object.fromEntries(Object.entries(bundle.records).map(([key,value])=>[key,sanitize(key,redact(value),scope)]));
    const ids=new Set();
    for(const row of bundle.attachments){
      if(typeof row.attachmentId!=='string'||ids.has(row.attachmentId)||typeof row.base64!=='string')throw new Error('Invalid attachment backup');ids.add(row.attachmentId);
      const blob=new Blob([Uint8Array.from(atob(row.base64),c=>c.charCodeAt(0))],{type:row.mime});
      const hash=await digest(blob);if(blob.size!==row.size||hash!==row.sha256)throw new Error('Attachment backup integrity failed');
      blobs.push({id:recordId(scope,row.attachmentId),scopeId:scope,attachmentId:row.attachmentId,blob,sha256:hash});
    }
    for(const files of Object.values(values[MAIN]?.researchFiles||{}))for(const file of files){
      const row=blobs.find(x=>x.attachmentId===file.attachmentId);
      if(!row||file.content!==undefined||row.blob.type!==file.mime||row.blob.size!==file.size||row.sha256!==file.sha256)throw new Error('Missing or mismatched attachment body');
    }
  }else if(object(bundle?.state)){
    values={[MAIN]:redact(validate(MAIN,bundle.state))};
    blobs=await extractAttachments(values[MAIN],scope);
    // Legacy users are deliberately excluded; importing learner data must not
    // overwrite current access credentials or change the current profile.
  }else throw new Error('Unsupported personal backup');
  if(normalizeState&&values[MAIN])values[MAIN]=normalizeState(values[MAIN]);
  // Portable restore replaces this scope's complete personal dataset. Missing
  // sidecars in legacy bundles retain their existing recoverable data.
  if(bundle.schema==='bauman-hub-personal-backup')for(const key of KEYS)if(!(key in values))values[key]=ARRAY_KEYS.has(key)?[]:{};
  if(recoveryProfile){
    const guarded=Object.fromEntries(Object.keys(values).map(key=>[key,null]));
    return enqueue(async()=>{
      if(!pristineDefaultScope())throw new Error('Hub đã có dữ liệu cá nhân; không đổi profile khi khôi phục.');
      const canonical=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,canonicalValue(key,value,scope)]));
      const sourceGuard={scope:scopeId,values:Object.fromEntries(KEYS.map(key=>[key,committedCache[key]??null]))};
      await writeAtomic(scope,canonical,blobs,guarded,recoveryProfile,sourceGuard);
      profile=recoveryProfile;scopeId=scope;cache=clone(canonical);committedCache=clone(canonical);keyVersions={};writeFailures={};generation++;report('READY');return clone(canonical);
    });
  }
  return commit(values,{blobs,expected:{[MAIN]:get(MAIN,null)}});
}
window.BAUMAN_HUB_PERSONAL_STORE=Object.freeze({
  schemaVersion:SCHEMA_VERSION,keys:KEYS,initialize,get,set,commit,flush,
  currentUser,setCurrentUser,getAccounts,setAccounts,getAttachment,addResearchAttachment,exportBundle,importBundle,
  get ready(){return ready},get readOnly(){return readOnly},get scopeId(){return scopeId},get status(){return clone(status)}
});
})();
