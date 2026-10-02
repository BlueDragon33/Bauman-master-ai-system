'use strict';
(async function(){
  const $=s=>document.querySelector(s);
  const lifecycle=['DRAFT','VALIDATED','REVIEW_REQUESTED','APPROVED','CANONICAL_PATCHED','PUBLISHED','SUPERSEDED','ARCHIVED'];
  const state={owners:new Map(),governance:null,candidate:null,reviewEnvelope:null};
  const text=v=>String(v??'').trim();
  const esc=v=>text(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const lines=v=>text(v).split(/\r?\n/).map(text).filter(Boolean);
  const schemaFor=type=>state.governance?.entitySchemas?.[type]||null;
  function renderSchemaFields(type){
    const root=$('#dynamicFields'),schema=schemaFor(type);
    if(!root)return;
    if(!schema){root.innerHTML='<legend>Trường theo schema thực thể</legend><p class="ru-schema-hint">Schema chưa được khai báo.</p>';return}
    const control=f=>{
      const id='detail-'+f.id,req=f.required?' aria-required="true"':'',label=esc(f.label)+(f.required?' *':'');
      if(f.type==='textarea')return '<label>'+label+'<textarea id="'+esc(id)+'" data-detail="'+esc(f.id)+'"'+req+'></textarea></label>';
      if(f.type==='select')return '<label>'+label+'<select id="'+esc(id)+'" data-detail="'+esc(f.id)+'"'+req+'>'+((f.options||[]).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join(''))+'</select></label>';
      return '<label>'+label+'<input id="'+esc(id)+'" data-detail="'+esc(f.id)+'" type="'+esc(f.type||'text')+'"'+req+'></label>';
    };
    root.innerHTML='<legend>Trường theo schema thực thể</legend><p class="ru-schema-hint">Policies: '+esc((schema.validationPolicies||[]).join(' · '))+'</p>'+schema.fields.map(control).join('');
  }
  function detailPayload(){
    const out={};
    document.querySelectorAll('[data-detail]').forEach(el=>{out[el.dataset.detail]=text(el.value)});
    return out;
  }
  const stableStringify=value=>{
    if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';
    return JSON.stringify(value);
  };
  async function sha256(value){
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stableStringify(value)));
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function paintLifecycle(active='DRAFT'){
    $('#lifecycle').innerHTML=lifecycle.map(x=>'<li class="'+(x===active?'active':'')+'">'+x+'</li>').join('');
  }
  function ownerFor(type){return state.owners.get(type)||''}
  function payload(){return {ru:text($('#ruText').value),vi:text($('#viText').value),details:detailPayload()}}
  async function buildCandidate(nextState='DRAFT'){
    const p=payload();
    return {schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',candidateId:'RU08-'+Date.now(),
      responsibility:text($('#responsibility').value),canonicalId:text($('#canonicalId').value),
      revision:text($('#revision').value),state:nextState,payload:p,sourceRefs:lines($('#sourceRefs').value),
      rollbackNote:text($('#rollbackNote').value),diffSummary:text($('#diffSummary').value),generated:false,
      contentHash:await sha256(p)};
  }
  function validate(c){
    const errors=[],schema=schemaFor(c.responsibility),details=c.payload?.details||{};
    if(c.schema!=='RUSSIAN_AUTHORING_CANDIDATE_V1')errors.push('Sai schema');
    if(!ownerFor(c.responsibility))errors.push('Không có canonical owner cho responsibility');
    if(!schema)errors.push('Không có entity schema cho responsibility');
    for(const k of ['candidateId','canonicalId','revision','rollbackNote','diffSummary'])if(!text(c[k]))errors.push('Thiếu '+k);
    if(!text(c.payload?.ru))errors.push('Thiếu nội dung tiếng Nga');
    if(!Array.isArray(c.sourceRefs)||!c.sourceRefs.length)errors.push('Thiếu sourceRefs');
    if(c.sourceRefs.some(x=>/^ai:|generated|chatgpt/i.test(x)))errors.push('AI/generated output không được dùng làm authority source');
    for(const f of schema?.fields||[])if(f.required&&!text(details[f.id]))errors.push('Thiếu '+f.label);
    const policies=schema?.validationPolicies||[];
    if(policies.includes('stress')&&!/\u0301/.test(text(details.stress)))errors.push('Trọng âm phải được biểu diễn tường minh bằng dấu sắc kết hợp');
    if(policies.includes('dialogue-role-turns')){
      if(lines(details.roles).length<2)errors.push('Dialogue cần ít nhất 2 vai');
      if(lines(details.turnPlan).length<2)errors.push('Dialogue cần ít nhất 2 lượt');
    }
    if(policies.includes('audio-transcript-pairing')&&details.mediaType==='audio'&&!text(details.transcript))errors.push('Audio asset phải có transcript');
    if(policies.includes('provenance')&&c.sourceRefs.some(x=>!text(x)))errors.push('Provenance source trống');
    return {ok:errors.length===0,errors,canonicalOwner:ownerFor(c.responsibility),metadataOnly:true,canonicalWrite:false,entitySchema:c.responsibility,validationPolicies:policies};
  }
  function renderPreview(c){
    $('#preview').classList.remove('empty');
    $('#preview').innerHTML='<b>'+esc(c.canonicalId)+'</b><p lang="ru">'+esc(c.payload.ru)+'</p>'+
      (c.payload.vi?'<small>'+esc(c.payload.vi)+'</small>':'')+
      '<dl><dt>Owner</dt><dd>'+esc(ownerFor(c.responsibility))+'</dd><dt>Hash</dt><dd><code>'+esc(c.contentHash)+'</code></dd><dt>Schema</dt><dd>'+esc(c.responsibility)+'</dd></dl>'+
      '<details><summary>Schema fields</summary><pre>'+esc(JSON.stringify(c.payload?.details||{},null,2))+'</pre></details>';
  }
  function reviewEnvelope(c){
    return {schema:'RUSSIAN_CONTENT_REVIEW_ENVELOPE_V1',candidateId:c.candidateId,canonicalId:c.canonicalId,
      responsibility:c.responsibility,canonicalOwner:ownerFor(c.responsibility),contentHash:c.contentHash,
      state:'REVIEW_REQUESTED',sourceRefCount:c.sourceRefs.length,diffSummary:c.diffSummary,rollbackNote:c.rollbackNote,
      metadataOnly:true,learningContentStored:false};
  }
  function download(name,obj){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));
    a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);
  }
  try{
    const [owners,gov]=await Promise.all([
      fetch('docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('data/authoring-governance.json',{cache:'no-store'}).then(r=>r.json())
    ]);
    state.governance=gov;
    for(const row of owners.owners||[])state.owners.set(row[0],row[1]);
    const authorable=(gov.authorableEntityTypes||[]).filter(x=>state.owners.has(x));
    $('#responsibility').innerHTML=authorable.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
    const refreshOwner=()=>{
      const t=text($('#responsibility').value),owner=ownerFor(t);
      $('#ownerPanel').innerHTML='<b>'+esc(t)+'</b><span>Canonical owner: <code>'+esc(owner||'UNRESOLVED')+'</code></span><small>Browser candidate cannot write this path directly.</small>';
      renderSchemaFields(t);
      state.candidate=null;state.reviewEnvelope=null;$('#reviewBtn').disabled=true;$('#exportBtn').disabled=true;
    };
    $('#responsibility').addEventListener('change',refreshOwner);refreshOwner();paintLifecycle();
  }catch(e){
    $('#ownerPanel').textContent='Không tải được governance/owner registry: '+e.message;
    $('#candidateForm').querySelectorAll('button,input,select,textarea').forEach(x=>x.disabled=true);
  }
  $('#candidateForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const c=await buildCandidate('VALIDATED'),v=validate(c);
    if(!v.ok)c.state='DRAFT';
    state.candidate=c;$('#validation').textContent=JSON.stringify(v,null,2);paintLifecycle(c.state);renderPreview(c);
    $('#reviewBtn').disabled=!v.ok;$('#exportBtn').disabled=!v.ok;
  });
  $('#previewBtn').addEventListener('click',async()=>{const c=state.candidate||await buildCandidate('DRAFT');state.candidate=c;renderPreview(c);paintLifecycle(c.state)});
  $('#reviewBtn').addEventListener('click',()=>{
    if(!state.candidate)return;
    const v=validate(state.candidate);if(!v.ok)return;
    state.candidate.state='REVIEW_REQUESTED';state.reviewEnvelope=reviewEnvelope(state.candidate);
    $('#validation').textContent=JSON.stringify({ok:true,reviewEnvelope:state.reviewEnvelope},null,2);paintLifecycle('REVIEW_REQUESTED');
  });
  $('#exportBtn').addEventListener('click',()=>{if(state.candidate)download((state.candidate.candidateId||'russian-candidate')+'.json',{candidate:state.candidate,reviewEnvelope:state.reviewEnvelope})});
  window.RussianAuthorWorkspace={state,validate,ownerFor,schemaFor,reviewEnvelope,buildCandidate};
})();