'use strict';
(function(){
  const STORAGE_KEY='bauman_russian_authoring_studio_v1';
  const SCHEMA='RUSSIAN_AUTHORING_CANDIDATE_V1';
  const LIFECYCLE=['DRAFT','VALIDATED','REVIEW_REQUESTED','APPROVED','CANONICAL_PATCHED','PUBLISHED'];
  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
  const now=()=>new Date().toISOString();
  let owners=[],governance=null,provenance=null,current=null,notice='';

  function state(){return parse(localStorage.getItem(STORAGE_KEY),{candidates:{},activeId:''});}
  function writeState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}
  function persist(candidate){
    const s=state();s.candidates=s.candidates||{};s.candidates[candidate.candidateId]=candidate;s.activeId=candidate.candidateId;writeState(s);current=candidate;render();
  }
  function active(){
    const s=state();return s.candidates?.[s.activeId]||null;
  }
  async function sha256(value){
    const data=new TextEncoder().encode(JSON.stringify(value));
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function ownerFor(responsibility){return owners.find(row=>row[0]===responsibility)||null;}
  function formValue(id){return clean(document.getElementById(id)?.value);}
  function sourceRefs(){return formValue('sourceRefs').split(/\n|,/).map(clean).filter(Boolean);}
  function variants(){return formValue('acceptedVariants').split(/\n/).map(clean).filter(Boolean);}
  function candidateFromForm(){
    const responsibility=formValue('responsibility'),owner=ownerFor(responsibility);
    const payload={
      text:formValue('contentText'),
      stress:formValue('stress'),
      yoPolicy:formValue('yoPolicy'),
      morphology:formValue('morphology'),
      government:formValue('government'),
      acceptedVariants:variants(),
      audioRef:formValue('audioRef'),
      transcript:formValue('transcript'),
      technicalTerminology:formValue('technicalTerminology'),
      assessmentAlignment:formValue('assessmentAlignment'),
      researchLineage:formValue('researchLineage')
    };
    return {
      schema:SCHEMA,
      candidateId:formValue('candidateId')||('ru-candidate-'+Date.now()),
      responsibility,
      canonicalId:formValue('canonicalId'),
      canonicalOwnerPath:owner?.[1]||'',
      canonicalOwnerState:owner?.[2]||'UNKNOWN',
      revision:formValue('revision')||('draft-'+new Date().toISOString().slice(0,10)),
      state:'DRAFT',
      payload,
      generated:false,
      sourceRefs:sourceRefs(),
      reviewer:null,reviewedAt:null,confidence:null,
      rollbackNote:formValue('rollbackNote'),
      diffSummary:formValue('diffSummary'),
      canonicalPatched:false,
      createdAt:now(),updatedAt:now(),
      validation:{ok:false,errors:[],warnings:[]}
    };
  }
  function validate(c){
    const errors=[],warnings=[],owner=ownerFor(c.responsibility);
    if(!c.candidateId)errors.push('candidateId is required');
    if(!owner)errors.push('Responsibility has no canonical owner');
    if(owner&&/PLANNED/.test(owner[2]))errors.push('Canonical owner is planned but not materialized');
    if(!c.canonicalId)errors.push('canonicalId is required');
    if(!c.revision)errors.push('revision is required');
    if(!c.rollbackNote)errors.push('rollback note is required');
    if(!c.diffSummary)errors.push('diff summary is required');
    if(!clean(c.payload?.text))errors.push('content text is required');
    if(!arr(c.sourceRefs).length)errors.push('at least one source/provenance reference is required');
    if(c.responsibility==='LexicalEntry'&&!clean(c.payload?.stress))warnings.push('Lexical entry has no explicit stress metadata');
    if(['GrammarConcept','AcademicFunction'].includes(c.responsibility)&&!clean(c.payload?.government)&&!clean(c.payload?.morphology))warnings.push('Grammar/morphology/government metadata is empty');
    if(c.responsibility==='MediaAsset'&&(!clean(c.payload?.audioRef)||!clean(c.payload?.transcript)))errors.push('MediaAsset requires audio/transcript pairing');
    if(c.responsibility==='AssessmentItem'&&!clean(c.payload?.assessmentAlignment))errors.push('AssessmentItem requires assessment alignment');
    if(['TechnicalConcept','PerformanceTask'].includes(c.responsibility)&&!clean(c.payload?.technicalTerminology))warnings.push('Technical terminology metadata is empty');
    if(['ReadingText','WritingTask','PerformanceTask'].includes(c.responsibility)&&!clean(c.payload?.researchLineage))warnings.push('Research/source lineage is empty');
    const validation={ok:errors.length===0,errors,warnings,checkedAt:now()};
    return {...c,validation,state:validation.ok?'VALIDATED':'DRAFT',updatedAt:now()};
  }
  async function previewCandidate(c){
    const contentHash=await sha256({responsibility:c.responsibility,canonicalId:c.canonicalId,revision:c.revision,payload:c.payload,sourceRefs:c.sourceRefs});
    return {...c,contentHash,updatedAt:now()};
  }
  function reviewEnvelope(c){
    return {
      reviewId:crypto.randomUUID(),
      subjectId:'russian',
      resourceType:c.responsibility,
      resourceId:c.canonicalId,
      revision:c.revision,
      contentHash:c.contentHash,
      sourcePath:c.canonicalOwnerPath,
      summary:c.diffSummary,
      candidateId:c.candidateId,
      metadataOnly:true
    };
  }
  function nextState(c,target,proof){
    const currentIndex=LIFECYCLE.indexOf(c.state),targetIndex=LIFECYCLE.indexOf(target);
    if(targetIndex!==currentIndex+1)throw new Error('State skipping is forbidden: '+c.state+' → '+target);
    if(target==='REVIEW_REQUESTED'&&!c.contentHash)throw new Error('Preview/content hash required before review');
    if(target==='APPROVED'&&!clean(proof))throw new Error('Reviewer approval receipt is required');
    if(target==='CANONICAL_PATCHED'&&!/^[a-f0-9]{7,64}$/i.test(clean(proof)))throw new Error('Canonical repository patch SHA is required');
    if(target==='PUBLISHED'&&!/^[a-f0-9]{7,64}$/i.test(clean(proof)))throw new Error('Published repository/release SHA is required');
    const out={...c,state:target,updatedAt:now()};
    if(target==='APPROVED'){out.reviewerReceipt=clean(proof);out.reviewer='external-review';out.reviewedAt=now();}
    if(target==='CANONICAL_PATCHED'){out.canonicalPatched=true;out.canonicalPatchSha=clean(proof);}
    if(target==='PUBLISHED'){out.publishedSha=clean(proof);out.publishedAt=now();}
    return out;
  }
  function rollbackPlan(c){
    return {schema:'RUSSIAN_AUTHORING_ROLLBACK_V1',candidateId:c.candidateId,canonicalId:c.canonicalId,canonicalOwnerPath:c.canonicalOwnerPath,publishedSha:c.publishedSha||null,canonicalPatchSha:c.canonicalPatchSha||null,previousContentHash:c.previousContentHash||null,rollbackNote:c.rollbackNote,generatedAt:now(),action:'create-reviewed-repository-revert; never rewrite learner history'};
  }
  function downloadJson(name,value){
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function setNotice(v){notice=clean(v);render();}
  function populateForm(c){
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??'';};
    set('candidateId',c.candidateId);set('responsibility',c.responsibility);set('canonicalId',c.canonicalId);set('revision',c.revision);
    set('sourceRefs',arr(c.sourceRefs).join('\n'));set('rollbackNote',c.rollbackNote);set('diffSummary',c.diffSummary);
    set('contentText',c.payload?.text);set('stress',c.payload?.stress);set('yoPolicy',c.payload?.yoPolicy);set('morphology',c.payload?.morphology);set('government',c.payload?.government);
    set('acceptedVariants',arr(c.payload?.acceptedVariants).join('\n'));set('audioRef',c.payload?.audioRef);set('transcript',c.payload?.transcript);
    set('technicalTerminology',c.payload?.technicalTerminology);set('assessmentAlignment',c.payload?.assessmentAlignment);set('researchLineage',c.payload?.researchLineage);
  }
  function candidateCard(c){
    if(!c)return '<div class="authoring-empty">Chưa có candidate. Điền form theo trường có cấu trúc rồi bấm Validate.</div>';
    const errs=arr(c.validation?.errors),warns=arr(c.validation?.warnings);
    return '<div class="authoring-candidate-card"><div><span class="authoring-state">'+esc(c.state)+'</span><h3>'+esc(c.canonicalId||c.candidateId)+'</h3><p>'+esc(c.canonicalOwnerPath||'Chưa resolve owner')+'</p></div>'+
      '<dl><div><dt>Hash</dt><dd>'+esc(c.contentHash||'Chưa preview')+'</dd></div><div><dt>Sources</dt><dd>'+String(arr(c.sourceRefs).length)+'</dd></div><div><dt>Lỗi</dt><dd>'+String(errs.length)+'</dd></div><div><dt>Cảnh báo</dt><dd>'+String(warns.length)+'</dd></div></dl>'+
      (errs.length?'<ul class="authoring-errors">'+errs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
      (warns.length?'<ul class="authoring-warnings">'+warns.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+'</div>';
  }
  function render(){
    const c=current||active();
    const status=document.getElementById('authoringStatus');if(status)status.innerHTML=candidateCard(c)+(notice?'<p class="authoring-notice">'+esc(notice)+'</p>':'');
    const life=document.getElementById('authoringLifecycle');if(life)life.innerHTML=LIFECYCLE.map(x=>'<span class="'+(c?.state===x?'active ':'')+(c&&LIFECYCLE.indexOf(x)<LIFECYCLE.indexOf(c.state)?'done':'')+'">'+x+'</span>').join('');
    const handoff=document.getElementById('authoringHandoff');if(handoff){
      handoff.textContent=c?.reviewEnvelope?JSON.stringify(c.reviewEnvelope,null,2):'Review envelope sẽ xuất hiện sau bước “Prepare review”.';
    }
  }
  async function bootstrap(){
    const [ownersRes,govRes,provRes]=await Promise.all([
      fetch('docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('data/authoring-governance.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('data/provenance.json',{cache:'no-store'}).then(r=>r.json())
    ]);
    owners=arr(ownersRes.owners);governance=govRes;provenance=provRes;
    const select=document.getElementById('responsibility');
    const allowed=new Set(arr(governance.authorableEntityTypes));
    select.innerHTML=owners.filter(row=>allowed.has(row[0])).map(row=>'<option value="'+esc(row[0])+'">'+esc(row[0]+' · '+row[1]+' · '+row[2])+'</option>').join('');
    current=active();if(current)populateForm(current);render();
  }

  document.addEventListener('click',async event=>{
    const action=event.target.closest?.('[data-authoring-action]')?.dataset.authoringAction;if(!action)return;
    event.preventDefault();
    try{
      if(action==='new'){current=null;document.getElementById('authoringForm').reset();setNotice('Form mới đã sẵn sàng.');return;}
      if(action==='validate'){current=validate(candidateFromForm());persist(current);setNotice(current.validation.ok?'Validation PASS. Có thể preview.':'Validation FAIL. Sửa lỗi trước khi tiếp tục.');return;}
      if(action==='preview'){if(!current||current.state!=='VALIDATED')throw new Error('Candidate phải VALIDATED trước preview');current=await previewCandidate(current);persist(current);setNotice('Preview/hash đã tạo. Chưa ghi canonical content.');return;}
      if(action==='review'){if(!current||current.state!=='VALIDATED')throw new Error('Candidate phải VALIDATED');if(!current.contentHash)current=await previewCandidate(current);current=nextState(current,'REVIEW_REQUESTED');current.reviewEnvelope=reviewEnvelope(current);persist(current);window.dispatchEvent(new CustomEvent('russian:authoring-review-request',{detail:current.reviewEnvelope}));setNotice('Đã tạo metadata-only review envelope. Canonical content chưa bị ghi.');return;}
      if(action==='approve'){if(!current||current.state!=='REVIEW_REQUESTED')throw new Error('Candidate chưa ở REVIEW_REQUESTED');current=nextState(current,'APPROVED',formValue('reviewReceipt'));persist(current);setNotice('Đã ghi approval receipt. Vẫn chưa được phép ghi canonical.');return;}
      if(action==='patch'){if(!current||current.state!=='APPROVED')throw new Error('Candidate chưa APPROVED');current=nextState(current,'CANONICAL_PATCHED',formValue('patchSha'));persist(current);setNotice('Đã gắn repository patch SHA. Studio không tự sửa repo.');return;}
      if(action==='publish'){if(!current||current.state!=='CANONICAL_PATCHED')throw new Error('Candidate chưa CANONICAL_PATCHED');current=nextState(current,'PUBLISHED',formValue('publishSha'));persist(current);setNotice('Đã gắn published/release SHA từ quy trình bên ngoài. Không giả lập deployment.');return;}
      if(action==='export-review'){if(!current?.reviewEnvelope)throw new Error('Chưa có review envelope');downloadJson(current.candidateId+'-review.json',current.reviewEnvelope);return;}
      if(action==='rollback'){if(!current)throw new Error('Chưa có candidate');downloadJson(current.candidateId+'-rollback.json',rollbackPlan(current));setNotice('Đã tạo rollback plan; rollback phải đi qua reviewed repository revert.');return;}
      if(action==='export'){if(!current)throw new Error('Chưa có candidate');downloadJson(current.candidateId+'.json',current);return;}
    }catch(error){setNotice(String(error?.message||error));}
  });
  document.addEventListener('change',event=>{
    const input=event.target.closest?.('#candidateImport');if(!input?.files?.[0])return;
    const reader=new FileReader();reader.onload=()=>{try{const c=JSON.parse(String(reader.result||''));if(c.schema!==SCHEMA)throw new Error('Sai candidate schema');current=c;persist(c);populateForm(c);setNotice('Đã import candidate; hãy validate lại trước review.');}catch(error){setNotice('Import lỗi: '+String(error?.message||error));}};reader.readAsText(input.files[0]);
  });
  document.addEventListener('DOMContentLoaded',()=>bootstrap().catch(error=>setNotice('Bootstrap lỗi: '+String(error?.message||error))));
  window.RussianAuthoringStudio={schema:SCHEMA,validate,reviewEnvelope,rollbackPlan,getCurrent:()=>JSON.parse(JSON.stringify(current||active()||null)),governance:()=>JSON.parse(JSON.stringify(governance||null)),provenance:()=>JSON.parse(JSON.stringify(provenance||null))};
})();