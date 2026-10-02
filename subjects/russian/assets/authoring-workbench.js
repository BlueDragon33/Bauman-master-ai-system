'use strict';
(async function(){
  const SCHEMA='RUSSIAN_AUTHORING_CANDIDATE_V1';
  const fieldSpecs={
    Stage:[['id','ID','text',true],['title','Title','text',true]],
    MacroModule:[['id','ID','text',true],['title','Title','text',true],['stage','Stage','text',false]],
    Unit:[['id','ID','text',true],['title','Title','text',true],['moduleId','Module ID','text',true]],
    MicroLesson:[['id','ID','text',true],['title','Title','text',true],['unitId','Unit ID','text',true]],
    GrammarConcept:[['id','ID','text',true],['title','Title','text',true],['rule','Rule','textarea',true],['sourceRefs','Source refs (comma)','array',false]],
    LexicalEntry:[['id','ID','text',true],['ru','Russian','text',true],['vi','Vietnamese','text',true],['stress','Stress','text',false]],
    SpeakingItem:[['id','ID','text',true],['stage','Stage','text',true],['ru','Russian','textarea',true],['vi','Vietnamese','textarea',false]],
    DialogueScenario:[['id','ID','text',true],['stage','Stage','text',true],['titleRu','Title RU','text',true],['titleVi','Title VI','text',true],['goal','Outcome goal','textarea',true]],
    DeepSpeakingTask:[['id','ID','text',true],['stage','Stage','text',true],['titleRu','Title RU','text',true],['titleVi','Title VI','text',true],['goal','Outcome goal','textarea',true]],
    ReadingText:[['id','ID','text',true],['targets','Targets (comma)','array',true],['level','Level','text',true],['genre','Genre','text',true],['operations','Operations (comma)','array',true],['output','Output contract','text',true]],
    WritingTask:[['id','ID','text',true],['stage','Stage','text',true],['mode','Mode','text',true],['title','Title','text',true],['prompt_ru','Prompt RU','textarea',true],['prompt_vi','Prompt VI','textarea',false],['target_words','Target words','number',false]],
    TechnicalConcept:[['id','ID','text',true],['domain','Domain','text',true],['ru','Russian term','text',true],['en','English','text',false],['vi','Vietnamese','text',false],['authorityStatus','Authority status','text',true],['sourceRefs','Source refs (comma)','array',true]],
    AcademicFunction:[['id','ID','text',true],['ruLabel','RU label','text',true],['vi','Vietnamese','text',true],['patterns','Patterns (comma)','array',true],['targets','Targets (comma)','array',true]],
    Exercise:[['id','ID','text',true],['type','Type','text',true],['prompt','Prompt','textarea',true],['answerPolicy','Answer policy','text',false]],
    AssessmentItem:[['id','ID','text',true],['type','Type','text',true],['prompt','Prompt','textarea',true],['rubricRef','Rubric ref','text',true]],
    PerformanceTask:[['id','ID','text',true],['targets','Targets (comma)','array',true],['mode','Mode','text',true],['input','Input contract','text',true],['output','Output contract','textarea',true],['evidenceTypes','Evidence types (comma)','array',true]],
    MediaAsset:[['id','ID','text',true],['type','Type','text',true],['url','URL/path','text',true],['transcriptRef','Transcript ref','text',false]],
    ProvenanceRecord:[['id','ID','text',true],['sourceType','Source type','text',true],['sourceRef','Source ref','text',true],['status','Status','text',true]]
  };
  const $=s=>document.querySelector(s), clean=v=>String(v??'').trim(), split=v=>clean(v).split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  let governance=null,ownerMap=new Map(),last=null;
  function stable(v){return Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v)}
  async function sha256(v){const bytes=new TextEncoder().encode(stable(v));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  async function load(){
    const [g,o]=await Promise.all([fetch('data/authoring-governance.json').then(r=>r.json()),fetch('docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json').then(r=>r.json())]);
    governance=g;ownerMap=new Map((o.owners||[]).map(x=>[x[0],{path:x[1],status:x[2]}]));
    const allowed=(g.authorableEntityTypes||[]).filter(x=>fieldSpecs[x]);
    $('#ruResponsibility').innerHTML=allowed.map(x=>`<option value="${x}">${x}</option>`).join('');
    $('#ruCandidateId').value='RU08-'+Date.now().toString(36).toUpperCase();
    renderFields();renderOwner();
  }
  function renderFields(){
    const type=$('#ruResponsibility').value,spec=fieldSpecs[type]||[];
    $('#ruPayloadFields').innerHTML=spec.map(([name,label,kind,required])=>{
      const attrs=`data-payload-field="${name}" data-kind="${kind}" ${required?'required':''}`;
      const control=kind==='textarea'?`<textarea ${attrs} rows="3"></textarea>`:`<input ${attrs} type="${kind==='number'?'number':'text'}">`;
      return `<label>${label}${control}</label>`;
    }).join('');
  }
  function renderOwner(){const row=ownerMap.get($('#ruResponsibility').value);$('#ruCanonicalOwner').textContent=row?row.path+' · '+row.status:'Không có canonical owner'}
  function payload(){
    const out={};document.querySelectorAll('[data-payload-field]').forEach(el=>{const name=el.dataset.payloadField,kind=el.dataset.kind;let v=el.value;if(kind==='array')v=split(v);else if(kind==='number')v=clean(v)?Number(v):null;else v=clean(v);if(v!==''&&v!==null&&(!Array.isArray(v)||v.length))out[name]=v});return out;
  }
  async function candidate(){
    const p=payload();return {schema:SCHEMA,candidateId:clean($('#ruCandidateId').value),responsibility:$('#ruResponsibility').value,canonicalId:clean($('#ruCanonicalId').value),revision:clean($('#ruRevision').value),state:'VALIDATED',payload:p,sourceRefs:split($('#ruSourceRefs').value),rollbackNote:clean($('#ruRollbackNote').value),diffSummary:clean($('#ruDiffSummary').value),contentHash:await sha256(p),generated:false,canonicalPatched:false};
  }
  async function validate(){
    const c=await candidate(),errors=[],spec=fieldSpecs[c.responsibility]||[],owner=ownerMap.get(c.responsibility);
    for(const k of ['candidateId','canonicalId','revision','rollbackNote','diffSummary'])if(!clean(c[k]))errors.push('Thiếu '+k);
    if(!owner?.path)errors.push('Không có canonical owner');
    if(!governance.authorableEntityTypes.includes(c.responsibility))errors.push('Entity type không được author');
    if(!c.sourceRefs.length)errors.push('Cần sourceRefs trước review');
    for(const [name,,kind,required] of spec){if(!required)continue;const v=c.payload[name];if(v==null||v===''||(kind==='array'&&!v.length))errors.push('Thiếu payload.'+name)}
    last={candidate:c,owner:owner?.path||null,ok:!errors.length,errors};
    const box=$('#ruValidationResult');box.className=last.ok?'ru-validation-ok':'ru-validation-fail';box.innerHTML=`<h2>Validation</h2><p>${last.ok?'PASS · candidate chỉ sẵn sàng gửi review, chưa ghi canonical.':'FAIL'}</p>${errors.length?'<ul>'+errors.map(x=>'<li>'+x+'</li>').join('')+'</ul>':''}`;
    $('#ruCandidateJson').textContent=JSON.stringify(c,null,2);return last;
  }
  async function preview(){
    const v=await validate(),c=v.candidate,box=$('#ruCandidatePreview');box.hidden=false;box.innerHTML=`<h2>Candidate preview</h2><dl><dt>Responsibility</dt><dd>${c.responsibility}</dd><dt>Canonical owner</dt><dd>${v.owner||''}</dd><dt>Canonical ID</dt><dd>${c.canonicalId}</dd><dt>Revision</dt><dd>${c.revision}</dd><dt>Content hash</dt><dd>${c.contentHash}</dd><dt>Diff</dt><dd>${c.diffSummary}</dd><dt>Rollback</dt><dd>${c.rollbackNote}</dd></dl><pre>${JSON.stringify(c.payload,null,2).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</pre>`;
    box.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function envelope(){
    const v=await validate();if(!v.ok)return;
    const c=v.candidate,env={subjectId:'russian',resourceType:c.responsibility,resourceId:c.canonicalId,revision:c.revision,contentHash:c.contentHash,sourcePath:v.owner,summary:c.diffSummary,metadataOnly:true,candidateId:c.candidateId};
    $('#ruCandidateJson').textContent=JSON.stringify({candidate:c,reviewEnvelope:env},null,2);$('#ruAdvancedJson').open=true;
  }
  $('#ruResponsibility').addEventListener('change',()=>{renderFields();renderOwner()});
  $('#ruValidateCandidate').addEventListener('click',validate);$('#ruPreviewCandidate').addEventListener('click',preview);$('#ruReviewEnvelope').addEventListener('click',envelope);
  await load();
  window.RussianAuthoringWorkbench={schema:'RUSSIAN_RU08_AUTHORING_WORKBENCH_V1',candidate,validate,ownerFor:type=>ownerMap.get(type)||null,policy:{directCanonicalWrite:false,rawJsonDefault:false,reviewMetadataOnly:true}};
})().catch(err=>{console.error('Russian authoring workbench failed',err);document.getElementById('ruValidationResult').innerHTML='<h2>Validation</h2><p>Không tải được authoring contracts.</p>'});