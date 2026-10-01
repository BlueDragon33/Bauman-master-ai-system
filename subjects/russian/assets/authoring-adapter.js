'use strict';
(function(){
  const DRAFT_KEY='bauman_russian_authoring_draft_v1';
  const SCHEMA='RUSSIAN_RU08_AUTHORING_BROWSER_V1';
  const state={owners:null,governance:null,draft:null,lastValidation:null};
  const clean=v=>String(v??'').trim();
  const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.keys(v).sort().reduce((o,k)=>(o[k]=stable(v[k]),o),{}):v);
  const hash=async value=>{
    const bytes=new TextEncoder().encode(JSON.stringify(stable(value)));
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  };
  function ownerMap(){return new Map((state.owners?.owners||[]).map(x=>[x[0],{path:x[1],status:x[2]}]))}
  function parseRefs(v){return clean(v).split(/\r?\n|,/).map(clean).filter(Boolean)}
  function validate(d){
    const errors=[],warnings=[],owner=ownerMap().get(d.entityType);
    if(!owner||!owner.path)errors.push('Không xác định được canonical owner.');
    if(owner?.status&&String(owner.status).startsWith('PLANNED'))errors.push('Owner đang PLANNED; không được tạo dữ liệu giả để lấp schema.');
    if(!clean(d.canonicalId))errors.push('Thiếu canonical ID.');
    if(!clean(d.revision))errors.push('Thiếu revision.');
    if(!d.payload||typeof d.payload!=='object'||Array.isArray(d.payload)||!Object.keys(d.payload).length)errors.push('Payload rỗng.');
    if(!Array.isArray(d.sourceRefs)||!d.sourceRefs.length)warnings.push('Chưa có sourceRefs; candidate không đủ điều kiện promotion.');
    if(!clean(d.rollbackNote))errors.push('Thiếu rollback note.');
    if(!clean(d.diffSummary))errors.push('Thiếu diff summary.');
    if(d.generated&&d.confidence!=='VERIFIED')warnings.push('Generated candidate phải VERIFIED trước canonical patch.');
    return {ok:errors.length===0,errors,warnings,canonicalOwner:owner?.path||null,promotionReady:errors.length===0&&warnings.length===0&&(!d.generated||d.confidence==='VERIFIED')};
  }
  function saveDraft(d){state.draft=d;localStorage.setItem(DRAFT_KEY,JSON.stringify({schema:SCHEMA,draft:d,updatedAt:new Date().toISOString()}))}
  function restoreDraft(){try{const x=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');return x?.schema===SCHEMA?x.draft:null}catch(_){return null}}
  function clearDraft(){state.draft=null;localStorage.removeItem(DRAFT_KEY)}
  function reviewEnvelope(d){
    const v=validate(d);if(!v.ok)throw new Error(v.errors.join('; '));
    return {metadataOnly:true,subjectId:'russian',resourceType:d.entityType,resourceId:d.canonicalId,revision:d.revision,contentHash:d.contentHash,sourcePath:v.canonicalOwner,summary:d.diffSummary,rollbackNote:d.rollbackNote,generated:!!d.generated,payloadIncluded:false};
  }
  function download(name,value){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);
  }
  async function fromForm(form){
    const payload={title:clean(form.title.value),ru:clean(form.ru.value),vi:clean(form.vi.value),notes:clean(form.notes.value)};
    Object.keys(payload).forEach(k=>{if(!payload[k])delete payload[k]});
    const d={schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',candidateId:clean(form.candidateId.value)||('RU08-'+Date.now()),entityType:form.entityType.value,canonicalId:clean(form.canonicalId.value),revision:clean(form.revision.value),state:'DRAFT',payload,sourceRefs:parseRefs(form.sourceRefs.value),rollbackNote:clean(form.rollbackNote.value),diffSummary:clean(form.diffSummary.value),generated:form.generated.checked,confidence:form.confidence.value};
    d.contentHash=await hash(payload);return d;
  }
  function fill(form,d){
    if(!d)return;
    for(const k of ['candidateId','entityType','canonicalId','revision','rollbackNote','diffSummary','confidence'])if(form[k]&&d[k]!=null)form[k].value=d[k];
    form.sourceRefs.value=(d.sourceRefs||[]).join('\n');form.generated.checked=!!d.generated;
    form.title.value=d.payload?.title||'';form.ru.value=d.payload?.ru||'';form.vi.value=d.payload?.vi||'';form.notes.value=d.payload?.notes||'';
  }
  function renderResult(el,d,v){
    el.dataset.validation=v.ok?'pass':'fail';
    el.innerHTML='<b>'+(v.ok?'VALIDATED':'BLOCKED')+'</b><span>Owner: '+(v.canonicalOwner||'—')+'</span><span>Hash: '+(d.contentHash||'—')+'</span>'+
      (v.errors.length?'<ul>'+v.errors.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'')+
      (v.warnings.length?'<ul>'+v.warnings.map(x=>'<li>⚠ '+x+'</li>').join('')+'</ul>':'')+
      '<small>Validation không tự publish. Canonical write chỉ qua reviewed repository patch.</small>';
  }
  async function init(){
    const root=document.querySelector('[data-russian-authoring]');if(!root)return;
    const form=root.querySelector('form'),result=root.querySelector('[data-authoring-result]'),preview=root.querySelector('[data-authoring-preview]'),raw=root.querySelector('[data-authoring-raw]');
    const [owners,governance]=await Promise.all([fetch('docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json').then(r=>r.json()),fetch('data/authoring-governance.json').then(r=>r.json())]);
    state.owners=owners;state.governance=governance;
    const allowed=new Set(governance.authorableEntityTypes||[]);
    for(const [type,owner,status] of owners.owners||[]){
      if(!allowed.has(type)||String(status).startsWith('PLANNED'))continue;
      const o=document.createElement('option');o.value=type;o.textContent=type+' · '+owner;form.entityType.append(o);
    }
    fill(form,restoreDraft());root.dataset.ready='1';
    root.addEventListener('input',async()=>{const d=await fromForm(form);saveDraft(d);raw.textContent=JSON.stringify(d,null,2)});
    root.querySelector('[data-authoring-validate]').addEventListener('click',async()=>{
      const d=await fromForm(form);d.state='VALIDATED';const v=validate(d);if(v.ok)saveDraft(d);state.lastValidation=v;renderResult(result,d,v);preview.textContent=JSON.stringify({payload:d.payload,canonicalOwner:v.canonicalOwner,sourceRefs:d.sourceRefs,rollbackNote:d.rollbackNote,diffSummary:d.diffSummary},null,2);raw.textContent=JSON.stringify(d,null,2);
    });
    root.querySelector('[data-authoring-export]').addEventListener('click',async()=>{const d=await fromForm(form);const v=validate(d);renderResult(result,d,v);if(v.ok)download((d.candidateId||'candidate')+'.json',d)});
    root.querySelector('[data-authoring-envelope]').addEventListener('click',async()=>{const d=await fromForm(form);const v=validate(d);renderResult(result,d,v);if(v.ok)download((d.candidateId||'candidate')+'.review-envelope.json',reviewEnvelope(d))});
    root.querySelector('[data-authoring-clear]').addEventListener('click',()=>{clearDraft();form.reset();result.textContent='Draft đã xóa khỏi local storage.';preview.textContent='';raw.textContent=''});
    root.querySelector('[data-authoring-import]').addEventListener('change',async e=>{
      const f=e.target.files?.[0];if(!f)return;let data;
      try{data=JSON.parse(await f.text())}catch(_){result.textContent='Import staging: JSON không hợp lệ.';return}
      const items=Array.isArray(data)?data:[data];if(items.length>500){result.textContent='Import staging bị chặn: tối đa 500 item.';return}
      const report=items.map((x,i)=>({index:i,entityType:x.entityType||'',canonicalId:x.canonicalId||'',validation:validate({...x,payload:x.payload||{}})}));
      preview.textContent=JSON.stringify({mode:'STAGING_ONLY',count:items.length,report},null,2);result.textContent='Import staging đã phân tích '+items.length+' item; chưa có canonical write.';
    });
    raw.textContent=state.draft?JSON.stringify(state.draft,null,2):'Chưa có draft.';
  }
  window.RussianAuthoringAdapter=Object.freeze({schema:SCHEMA,validate,reviewEnvelope,hash,restoreDraft,clearDraft,state:()=>JSON.parse(JSON.stringify(state))});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();