/* Deep Study Journal v1
 * Learner reflection only. Never authoritative mastery/diagnostic/scheduler evidence.
 */
(function deepStudyJournal(global){
  'use strict';
  const RELEASE='DEEP_STUDY_JOURNAL_V1';
  const TYPES={
    feynman:{label:'Feynman checkpoint',hint:'Giải thích lại bằng lời của bạn: khái niệm là gì, tại sao đúng, ví dụ nào chứng minh bạn hiểu.'},
    error:{label:'Error Notebook',hint:'Ghi lỗi đã mắc, nguyên nhân, dấu hiệu nhận biết và cách tránh lặp lại.'},
    closed_ai:{label:'Closed-AI session',hint:'Ghi lại phần bạn tự làm khi không dùng AI/tài liệu trợ giúp và điểm còn vướng.'},
    oral_defense:{label:'Oral-defense note',hint:'Ghi câu hỏi vấn đáp, cách trả lời bằng lời của bạn và phần cần luyện lại.'}
  };
  const BOUNDARY=Object.freeze({
    authoritativeMasteryEvidence:false,
    masteryMutation:false,
    diagnosticMutation:false,
    prerequisiteMutation:false,
    schedulerMutation:false,
    progressMutation:false,
    subjectOwnershipMutation:false,
    storage:'hub-learner-state',
    backupRestore:'inherited-from-hub-state'
  });
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const now=()=>new Date().toISOString();
  const state=()=>global.state;
  const save=()=>global.save?.();

  function ensure(){
    const s=state();
    if(!s)return null;
    if(!s.deepStudyJournal||typeof s.deepStudyJournal!=='object')s.deepStudyJournal={version:1,entries:[]};
    if(!Array.isArray(s.deepStudyJournal.entries))s.deepStudyJournal.entries=[];
    s.deepStudyJournal.version=1;
    return s.deepStudyJournal;
  }
  function cleanText(v,max=5000){return String(v??'').replace(/\u0000/g,'').trim().slice(0,max)}
  function context(){
    const s=state()||{};
    return {subjectId:String(s.subject||''),courseId:String(s.searchFocusCourseId||'')};
  }
  function entries(){
    return [...(ensure()?.entries||[])].sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  }
  function add(payload={}){
    const journal=ensure();if(!journal)return null;
    const type=TYPES[payload.type]?payload.type:'feynman',ctx=context(),stamp=now();
    const entry={
      id:'dsj-'+stamp.replace(/[-:.TZ]/g,'')+'-'+Math.random().toString(36).slice(2,8),
      type,
      title:cleanText(payload.title||TYPES[type].label,160),
      body:cleanText(payload.body,5000),
      subjectId:cleanText(payload.subjectId??ctx.subjectId,80),
      courseId:cleanText(payload.courseId??ctx.courseId,80),
      createdAt:stamp,
      updatedAt:stamp
    };
    journal.entries.push(entry);save();return entry;
  }
  function update(id,payload={}){
    const journal=ensure();const e=journal?.entries.find(x=>x.id===id);if(!e)return null;
    if(payload.type&&TYPES[payload.type])e.type=payload.type;
    if(Object.prototype.hasOwnProperty.call(payload,'title'))e.title=cleanText(payload.title,160);
    if(Object.prototype.hasOwnProperty.call(payload,'body'))e.body=cleanText(payload.body,5000);
    if(Object.prototype.hasOwnProperty.call(payload,'subjectId'))e.subjectId=cleanText(payload.subjectId,80);
    if(Object.prototype.hasOwnProperty.call(payload,'courseId'))e.courseId=cleanText(payload.courseId,80);
    e.updatedAt=now();save();return e;
  }
  function remove(id){
    const journal=ensure();if(!journal)return false;
    const before=journal.entries.length;journal.entries=journal.entries.filter(x=>x.id!==id);
    if(journal.entries.length===before)return false;save();return true;
  }
  function editor(entry){
    const e=entry||{},type=TYPES[e.type]?e.type:'feynman';
    return `<section class="dsj-editor" data-dsj-editor>
      <div class="dsj-field-row"><label>Loại<select data-dsj-field="type">${Object.entries(TYPES).map(([id,x])=>`<option value="${id}" ${id===type?'selected':''}>${h(x.label)}</option>`).join('')}</select></label><label>Tiêu đề<input data-dsj-field="title" value="${h(e.title||TYPES[type].label)}" maxlength="160"></label></div>
      <p class="dsj-hint" data-dsj-hint>${h(TYPES[type].hint)}</p>
      <label>Nội dung<textarea data-dsj-field="body" maxlength="5000" placeholder="Viết bằng lời của bạn…">${h(e.body||'')}</textarea></label>
      <div class="dsj-field-row"><label>Môn / subject<input data-dsj-field="subjectId" value="${h(e.subjectId??context().subjectId)}" maxlength="80"></label><label>Học phần / course<input data-dsj-field="courseId" value="${h(e.courseId??context().courseId)}" maxlength="80"></label></div>
      <div class="dsj-actions"><button class="btn primary" data-dsj-action="save" data-id="${h(e.id||'')}">${e.id?'Lưu thay đổi':'Lưu ghi chú'}</button>${e.id?'<button class="btn" data-dsj-action="delete" data-id="'+h(e.id)+'">Xóa ghi chú</button>':''}<button class="btn" data-dsj-action="new">Ghi chú mới</button></div>
    </section>`;
  }
  function entryCard(e){
    const meta=TYPES[e.type]||TYPES.feynman;
    return `<button class="dsj-entry" data-dsj-action="edit" data-id="${h(e.id)}"><span>${h(meta.label)}</span><strong>${h(e.title||meta.label)}</strong><small>${h([e.subjectId,e.courseId].filter(Boolean).join(' · ')||'Không gắn môn/học phần')}</small><p>${h((e.body||'').slice(0,180))}${(e.body||'').length>180?'…':''}</p><time>${h((e.updatedAt||e.createdAt||'').replace('T',' ').slice(0,16))}</time></button>`;
  }
  function render(selectedId=''){
    const list=entries(),selected=list.find(x=>x.id===selectedId)||null;
    return `<div class="dsj-shell" data-deep-study-journal-v1>
      <header class="dsj-head"><div><span class="dsj-kicker">DEEP STUDY JOURNAL · REFLECTION ONLY</span><h3>Feynman · Error Notebook · Closed-AI · Oral Defense</h3><p>Ghi chú tự học để phản tư. Nội dung ở đây <b>không</b> được tính là mastery, diagnostic, prerequisite hay tiến độ chính thức.</p></div><span class="dsj-boundary">Non-authoritative</span></header>
      <div class="dsj-layout"><aside class="dsj-list"><div class="dsj-list-head"><b>Nhật ký</b><button class="btn" data-dsj-action="new">+ Mới</button></div>${list.length?list.map(entryCard).join(''):'<div class="dsj-empty">Chưa có ghi chú. Bắt đầu bằng một Feynman checkpoint sau buổi học.</div>'}</aside><main class="dsj-main">${editor(selected)}</main></div>
    </div>`;
  }
  function open(selectedId=''){
    global.openModal?.('Deep Study Journal',render(selectedId),true);
    bind();
  }
  function readForm(){
    const root=document.querySelector('[data-deep-study-journal-v1]');
    if(!root)return null;
    const get=name=>root.querySelector(`[data-dsj-field="${name}"]`)?.value??'';
    return {type:get('type'),title:get('title'),body:get('body'),subjectId:get('subjectId'),courseId:get('courseId')};
  }
  function refresh(selectedId=''){
    const root=document.querySelector('[data-deep-study-journal-v1]');if(!root)return open(selectedId);
    const wrap=root.parentElement;if(!wrap)return open(selectedId);
    root.outerHTML=render(selectedId);bind();
  }
  function bind(){
    const root=document.querySelector('[data-deep-study-journal-v1]');if(!root||root.dataset.bound==='1')return;
    root.dataset.bound='1';
    root.addEventListener('change',e=>{if(e.target?.dataset.dsjField==='type'){const x=TYPES[e.target.value]||TYPES.feynman;const hint=root.querySelector('[data-dsj-hint]');if(hint)hint.textContent=x.hint}});
    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-dsj-action]');if(!b)return;
      const action=b.dataset.dsjAction,id=b.dataset.id||'';
      if(action==='new')return refresh('');
      if(action==='edit')return refresh(id);
      if(action==='save'){const payload=readForm();if(!payload)return;const saved=id?update(id,payload):add(payload);return refresh(saved?.id||'')}
      if(action==='delete'){remove(id);return refresh('')}
    });
  }
  function selfCheck(){
    const journal=ensure();
    return {release:RELEASE,entries:journal?.entries?.length||0,...BOUNDARY,noSeparateStorage:true,noRoadmapMasteryWrites:true,noDiagnosticWrites:true,noSchedulerWrites:true};
  }
  global.openDeepStudyJournalV1=open;
  global.BAUMAN_DEEP_STUDY_JOURNAL_V1={release:RELEASE,types:TYPES,boundary:BOUNDARY,entries,add,update,remove,open,selfCheck};
})(window);
