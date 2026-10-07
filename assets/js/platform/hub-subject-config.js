/* Hub application/device configuration. No learner progress, subject internals,
 * private stores, or implicit authoring capabilities belong to this owner. */
(()=>{
'use strict';
const DB='bauman-hub-application',VERSION=1;
// Targets are the existing Hub-declared routes, moved from main's path maps.
const IDS=new Set(['russian','math','programming','ai','systems','signal','research','entrepreneurship','ergonomics','mivar','foreign-language','security-elective','specialization-elective','practice-workflow','foundation']);
const clone=x=>structuredClone(x),object=x=>x&&typeof x==='object'&&!Array.isArray(x);
let db=null,opening=null,config={id:'subject-config',version:VERSION,entries:{},legacyClaimed:false},status='UNAVAILABLE',recoveryRequired=false;
function metadata(id){return (window.BAUMAN_DATA?.subjects||[]).find(x=>x.id===id)||null}
function defaults(id){return IDS.has(id)&&metadata(id)?{entry:`subjects/${id}/index.html`,editor:`subjects/${id}/editor.html`}:null}
function safeURL(target){try{if(typeof target!=='string'||!target.trim())return null;const url=new URL(target,location.href);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url:null}catch{return null}}
function legacyCandidates(legacyState){
 const candidates=[];
 for(const [id,saved] of Object.entries(legacyState?.subjects||{})){
  const base=defaults(id);if(!base||!object(saved))continue;const fields={};
  if(typeof saved.mainPath==='string'&&saved.mainPath&&saved.mainPath!==base.entry)fields.entry=saved.mainPath;
  if(typeof saved.editorPath==='string'&&saved.editorPath&&saved.editorPath!==base.editor)fields.editor=saved.editorPath;
  if(Object.keys(fields).length)candidates.push([id,fields]);
 }
 return candidates;
}
async function open(){
 if(db)return db;if(opening)return opening;
 opening=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB,VERSION);
  req.onupgradeneeded=()=>req.result.createObjectStore('configuration',{keyPath:'id'});
  req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Kho cấu hình Hub đang bị chặn. Hãy đóng tab cũ.'));
  req.onsuccess=()=>{db=req.result;db.onversionchange=()=>{db.close();db=null;opening=null;status='UNAVAILABLE'};resolve(db)};
 }).catch(error=>{opening=null;throw error});return opening;
}
function update(change){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('configuration','readwrite'),store=tx.objectStore('configuration');let next,error;
  tx.oncomplete=()=>{config=clone(next);resolve(clone(config))};tx.onabort=()=>reject(error||tx.error);tx.onerror=()=>{};
  const req=store.get('subject-config');
  req.onsuccess=()=>{try{const row=req.result||{id:'subject-config',version:VERSION,entries:{},legacyClaimed:false};if(row.version!==VERSION||!object(row.entries))throw new Error('Phiên bản cấu hình Hub chưa được hỗ trợ.');next=change(clone(row));store.put(next)}catch(e){error=e;tx.abort()}};
 });
}
async function initialize({legacyState,scopeId}={}){
 recoveryRequired=legacyCandidates(legacyState).length>0;
 try{
  await open();
  // Compute candidates before the transaction, then claim using its latest
  // row. Another profile/tab cannot clone or replace the first migration.
  const candidates=legacyCandidates(legacyState);
  await update(row=>{
   if(!row.legacyClaimed&&candidates.length){
    for(const [id,fields] of candidates)row.entries[id]={...fields,...(row.entries[id]||{})};
    row.legacyClaimed=true;row.legacySource=String(scopeId||'existing-profile');
   }
   return row;
  });status='CURRENT';recoveryRequired=false;return {status,legacyClaimed:config.legacyClaimed};
 }catch(error){status='UNAVAILABLE';throw error}
}
function getConfiguration(id){const base=defaults(id);return base?{...base,...clone(config.entries[id]||{})}:null}
function getDescriptor(id){
 const meta=metadata(id),values=getConfiguration(id);if(!meta||!values)return null;
 const target=status==='CURRENT'?safeURL(values.entry):null;
 return {subjectId:id,name:meta.name,source:'HUB_APPLICATION_CONFIG',authoring:null,launch:target?{transport:'iframe',target:target.href}:null};
}
function isAdmin(){return window.BAUMAN_HUB_PERSONAL_STORE?.currentUser?.()?.role==='admin'&&window.BAUMAN_HUB_PERSONAL_STORE?.readOnly!==true}
async function setOverride(id,fields){
 if(!isAdmin())throw new Error('Chỉ quản trị thiết bị được sửa cấu hình môn học.');
 if(status!=='CURRENT'||!defaults(id)||!object(fields))throw new Error('Cấu hình môn học chưa khả dụng.');
 const patch={};for(const key of ['entry','editor'])if(Object.hasOwn(fields,key)){if(typeof fields[key]!=='string')throw new Error('Đường dẫn phải là văn bản.');patch[key]=fields[key].trim()}
 await update(row=>{row.entries[id]={...(row.entries[id]||{}),...patch};return row});return getDescriptor(id);
}
function openAdminEditor(id){if(!isAdmin())return false;const url=safeURL(getConfiguration(id)?.editor);if(status!=='CURRENT'||!url)return false;window.open(url.href,'_blank','noopener');return true}
window.BAUMAN_HUB_SUBJECT_CONFIG=Object.freeze({initialize,getDescriptor,getConfiguration,setOverride,openAdminEditor,hasLegacyOverrides:state=>legacyCandidates(state).length>0,get ready(){return status==='CURRENT'},get status(){return status},get recoveryRequired(){return recoveryRequired}});
})();
