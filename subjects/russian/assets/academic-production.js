'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_academic_production_v1';
  const SCHEMA='RUSSIAN_ACADEMIC_PRODUCTION_SESSION_V1';
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const now=()=>new Date().toISOString();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const core=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,taskId:'',sourceNotes:[],claims:[],integrity:{numbers:false,equations:false,'code-identifiers':false,'figures-tables':false,'experimental-results':false},snapshots:[],updatedAt:null});
  let state=(()=>{const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,sourceNotes:Array.isArray(x?.sourceNotes)?x.sourceNotes:[],claims:Array.isArray(x?.claims)?x.claims:[],integrity:{...empty().integrity,...(x?.integrity||{})},snapshots:Array.isArray(x?.snapshots)?x.snapshots:[]}})();
  let queued=false,notice='';

  function data(name){return window.RussianRuntimeData?.get?.(name)||null}
  function tasks(){return Array.isArray(data('performance-tasks')?.tasks)?data('performance-tasks').tasks:[]}
  function readings(){return Array.isArray(data('reading')?.tasks)?data('reading').tasks:[]}
  function functions(){return Array.isArray(data('academic-functions')?.functions)?data('academic-functions').functions:[]}
  function concepts(){return Array.isArray(data('technical-concepts')?.concepts)?data('technical-concepts').concepts:[]}
  function stageTargets(stage=core().stage){
    return ({vn:['R11'],prep:['R11','R12'],hk1:['R11','R12','R14'],hk2:['R15','R16','R17','R18'],hk3:['R19','R20','R21','R22'],hk4:['R23','R24','R25','R26']}[stage]||['R11']);
  }
  function activeTask(){
    const all=tasks(),id=clean(state.taskId);
    const exact=all.find(x=>x.id===id); if(exact)return exact;
    const wanted=new Set(stageTargets());
    return all.find(x=>(x.targets||[]).some(t=>wanted.has(t)))||all[0]||null;
  }
  function relatedReading(task=activeTask()){
    if(!task)return null;const targets=new Set(task.targets||[]);
    return readings().find(x=>(x.targets||[]).some(t=>targets.has(t)))||null;
  }
  function relatedFunctions(task=activeTask()){
    if(!task)return [];const targets=new Set(task.targets||[]);
    const ids=new Set(relatedReading(task)?.academicFunctions||[]);
    return functions().filter(x=>ids.has(x.id)||(x.targets||[]).some(t=>targets.has(t))).slice(0,8);
  }
  function relatedConcepts(task=activeTask()){
    if(!task)return [];const targets=new Set(task.targets||[]);
    const ids=new Set(relatedReading(task)?.technicalConcepts||[]);
    return concepts().filter(x=>ids.has(x.id)||(x.targets||[]).some(t=>targets.has(t))).slice(0,14);
  }
  function save(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian academic production save failed',e)}schedule()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  function say(v){notice=clean(v);schedule()}
  function addSource(){
    const ref=clean(document.getElementById('ruProdSourceRef')?.value);
    const note=clean(document.getElementById('ruProdSourceNote')?.value);
    if(!ref)return say('Nguồn cần có sourceRef rõ ràng; không tạo nguồn giả.');
    state.sourceNotes.push({id:'SRC-'+Date.now().toString(36),sourceRef:ref,note,at:now()});
    state.sourceNotes=state.sourceNotes.slice(-30);save();
    const a=document.getElementById('ruProdSourceRef'),b=document.getElementById('ruProdSourceNote');if(a)a.value='';if(b)b.value='';
    say('Đã lưu source note cục bộ. Nó không tự xác nhận claim là đúng.');
  }
  function addClaim(){
    const type=clean(document.getElementById('ruProdClaimType')?.value)||'learner-claim';
    const text=clean(document.getElementById('ruProdClaimText')?.value);
    const sourceRef=clean(document.getElementById('ruProdClaimSource')?.value);
    if(!text)return say('Claim đang trống.');
    if(type==='source-fact'&&!sourceRef)return say('source-fact bắt buộc có sourceRef; hệ thống không bịa nguồn.');
    const generated=type==='generated-suggestion';
    state.claims.push({id:'CLM-'+Date.now().toString(36),type,text,sourceRef:sourceRef||null,generated,canonical:false,at:now()});
    state.claims=state.claims.slice(-50);save();
    const a=document.getElementById('ruProdClaimText'),b=document.getElementById('ruProdClaimSource');if(a)a.value='';if(b)b.value='';
    say(generated?'Đã lưu gợi ý sinh tự động ở trạng thái non-canonical.':'Đã lưu claim vào lineage.');
  }
  function toggleIntegrity(key){if(!(key in state.integrity))return;state.integrity[key]=!state.integrity[key];save()}
  function snapshot(){
    const task=activeTask();if(!task)return say('Chưa có performance task.');
    const draft=clean(document.querySelector('[data-input="writingDraft"]')?.value||core().writingDraft||'');
    if(!draft)return say('Bản nháp chính đang trống.');
    const snap={id:'PROD-'+Date.now().toString(36),taskId:task.id,revision:'draft-'+(state.snapshots.length+1),at:now(),wordCount:draft.split(/\s+/).filter(Boolean).length,claimIds:state.claims.map(x=>x.id),sourceRefs:[...new Set([...state.sourceNotes.map(x=>x.sourceRef),...state.claims.map(x=>x.sourceRef).filter(Boolean)])],integrity:clone(state.integrity),authoritative:false,masteryWrite:false};
    state.snapshots.push(snap);state.snapshots=state.snapshots.slice(-20);save();
    window.dispatchEvent(new CustomEvent('russian:academic-production-evidence',{detail:clone(snap)}));
    say('Đã tạo production snapshot. Đây là evidence thao tác, không phải điểm/mức mastery.');
    return clone(snap);
  }
  function setTask(id){if(tasks().some(x=>x.id===id)){state.taskId=id;save()}}
  function context(){
    const task=activeTask(),r=relatedReading(task);
    return {schema:SCHEMA,taskId:task?.id||'',mode:task?.mode||'',targets:clone(task?.targets||[]),readingId:r?.id||'',sourceRefs:[...new Set([...state.sourceNotes.map(x=>x.sourceRef),...state.claims.map(x=>x.sourceRef).filter(Boolean)])].slice(-12),claimCount:state.claims.length,generatedClaimCount:state.claims.filter(x=>x.generated).length,integrity:clone(state.integrity),authoritative:false,masteryWrite:false};
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const c=core(),active=c.view==='writing'&&c.writingMode==='academic';
    let panel=document.getElementById('ruAcademicProduction');
    if(!active){panel?.remove();return}
    const task=activeTask();
    if(!task){if(!panel){panel=document.createElement('section');panel.id='ruAcademicProduction';panel.className='ru-academic-production';view.append(panel)}panel.innerHTML='<b>RU06 production data chưa sẵn sàng.</b>';return}
    if(!state.taskId)state.taskId=task.id;
    const reading=relatedReading(task),afs=relatedFunctions(task),tcs=relatedConcepts(task);
    if(!panel){panel=document.createElement('section');panel.id='ruAcademicProduction';panel.className='ru-academic-production';view.append(panel)}
    panel.innerHTML=`
      <header><div><span>RU06 · ACADEMIC PRODUCTION</span><h3>Source → claim → draft → transfer</h3><p>Dùng owner RU03 cho linguistic truth và RU04 cho scoring/mastery. Panel này chỉ điều phối production evidence.</p></div><small>${esc(task.mode)} · ${esc((task.targets||[]).join(', '))}</small></header>
      <div class="ru-prod-taskbar"><label>Nhiệm vụ<select id="ruProdTask">${tasks().map(x=>`<option value="${esc(x.id)}" ${x.id===task.id?'selected':''}>${esc(x.id)} · ${esc(x.mode)}</option>`).join('')}</select></label><article><b>${esc(task.output||'')}</b><span>Input: ${esc(task.input||'')}</span></article></div>
      <div class="ru-prod-grid">
        <section><h4>1 · Đọc & chức năng học thuật</h4><p>${reading?esc(reading.id+' · '+reading.genre+' · '+(reading.operations||[]).join(' → ')):'Không có reading task trực tiếp; không bịa nguồn.'}</p><div class="ru-prod-chips">${afs.map(x=>`<span title="${esc((x.patterns||[]).join(' / '))}">${esc(x.ruLabel||x.id)}</span>`).join('')}</div></section>
        <section><h4>2 · Thuật ngữ kỹ thuật</h4><div class="ru-prod-chips">${tcs.map(x=>`<span class="${x.authorityStatus==='VERIFIED'?'verified':''}">${esc(x.ru)} · ${esc(x.authorityStatus)}</span>`).join('')||'<span>Không có thuật ngữ bắt buộc.</span>'}</div></section>
        <section><h4>3 · Source notes</h4><input id="ruProdSourceRef" placeholder="sourceRef / DOI / URL / tài liệu đã duyệt"><textarea id="ruProdSourceNote" placeholder="Ghi chú nguồn"></textarea><button data-ru-prod="source">Thêm source note</button><small>${state.sourceNotes.length} source note</small></section>
        <section><h4>4 · Claim lineage</h4><select id="ruProdClaimType"><option>source-fact</option><option>interpretation</option><option selected>learner-claim</option><option>generated-suggestion</option></select><input id="ruProdClaimSource" placeholder="sourceRef nếu claim dựa nguồn"><textarea id="ruProdClaimText" placeholder="Claim / diễn giải / ý của người học"></textarea><button data-ru-prod="claim">Thêm claim</button><small>${state.claims.length} claim · generated luôn non-canonical</small></section>
      </div>
      <section class="ru-prod-integrity"><h4>5 · Representation integrity</h4><p>Đánh dấu sau khi tự kiểm tra representation; checklist không tự chấm đúng/sai.</p><div>${Object.entries(state.integrity).map(([k,v])=>`<button class="${v?'checked':''}" data-ru-integrity="${esc(k)}">${v?'✓ ':''}${esc(k)}</button>`).join('')}</div></section>
      <section class="ru-prod-lineage"><h4>Lineage hiện tại</h4><div>${state.claims.slice(-6).map(x=>`<article><b>${esc(x.type)}</b><span>${esc(x.text)}</span><small>${x.sourceRef?'source: '+esc(x.sourceRef):x.generated?'generated · non-canonical':'learner-owned claim'}</small></article>`).join('')||'<p>Chưa có claim.</p>'}</div></section>
      <footer><button class="primary" data-ru-prod="snapshot">Tạo production snapshot</button><span>${state.snapshots.length} snapshot · mastery write: 0</span></footer>
      ${notice?`<div class="ru-prod-notice">${esc(notice)}</div>`:''}`;
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('[data-ru-prod]')?.dataset.ruProd;
    if(a){e.preventDefault();if(a==='source')addSource();else if(a==='claim')addClaim();else if(a==='snapshot')snapshot();return}
    const i=e.target.closest?.('[data-ru-integrity]')?.dataset.ruIntegrity;if(i){e.preventDefault();toggleIntegrity(i);return}
    setTimeout(schedule,0);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='ruProdTask')setTask(e.target.value);else setTimeout(schedule,10)},true);
  document.addEventListener('DOMContentLoaded',()=>{schedule();const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false})});
  window.addEventListener('russian:runtime-data-ready',schedule);
  window.RussianAcademicProduction={schema:SCHEMA,get:()=>clone(state),context,tasks:()=>clone(tasks()),setTask,snapshot,authoritative:false,masteryWrite:false};
})();
