'use strict';
(function(){
  const SCHEMA='RUSSIAN_ACADEMIC_PRODUCTION_RUNTIME_V1';
  const STORAGE_KEY='bauman_russian_academic_production_v1';
  const DATASETS=['technical-concepts','academic-functions','reading','performance-tasks'];
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const now=()=>new Date().toISOString();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const empty=()=>({schema:SCHEMA,taskId:'',notes:'',draft:'',sourceRefs:[],claimLog:[],snapshots:[],updatedAt:null});
  let state={...empty(),...parse(localStorage.getItem(STORAGE_KEY),empty())};
  let data={}; let ready=false; let error=null; let queued=false;

  function save(){state.updatedAt=now();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));schedule();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
  function stage(){try{return parse(localStorage.getItem(window.SUBJECT_ADAPTER?.storageKey||'bauman_russian_survival_master_v11_clean_skeleton'),{}).stage||'vn'}catch(_){return 'vn'}}
  function stageTargets(){return ({vn:['R11','R12'],prep:['R11','R12','R14'],hk1:['R14','R16','R17','R18'],hk2:['R18','R19','R20','R21'],hk3:['R19','R20','R21','R22','R23'],hk4:['R23','R24','R25','R26']})[stage()]||[];}
  function tasks(){const targets=new Set(stageTargets());return (data['performance-tasks']?.tasks||[]).filter(x=>(x.targets||[]).some(t=>targets.has(t)));}
  function activeTask(){const xs=tasks();return xs.find(x=>x.id===state.taskId)||xs[0]||data['performance-tasks']?.tasks?.[0]||null;}
  function authority(datasetId,item,authoritativeUse=false){return window.RussianLinguisticAuthority?.guard?.(datasetId,item,{authoritativeUse})||{allowed:!authoritativeUse,authoritative:false,status:'UNKNOWN',label:'Chưa tải thẩm quyền',sourceRefs:item?.sourceRefs||[]};}
  function conceptsFor(task){const targets=new Set(task?.targets||[]);return (data['technical-concepts']?.concepts||[]).filter(x=>(x.targets||[]).some(t=>targets.has(t))).slice(0,12);}
  function functionsFor(task){const targets=new Set(task?.targets||[]);return (data['academic-functions']?.functions||[]).filter(x=>(x.targets||[]).some(t=>targets.has(t))).slice(0,10);}
  function readingsFor(task){const targets=new Set(task?.targets||[]);return (data.reading?.tasks||[]).filter(x=>(x.targets||[]).some(t=>targets.has(t))).slice(0,8);}
  function addSource(ref){ref=clean(ref);if(!ref||state.sourceRefs.includes(ref))return;state.sourceRefs.push(ref);save();}
  function addClaim(type='learner-claim'){
    const text=clean(document.getElementById('ruProdClaim')?.value); if(!text)return;
    state.claimLog.push({id:'CLAIM-'+Date.now(),type,text,sourceRefs:[...state.sourceRefs],at:now(),authority:'LEARNER_AUTHORED'});save();
  }
  function snapshot(kind='draft'){
    const value=clean(document.getElementById('ruProdDraft')?.value); state.draft=value;
    state.snapshots.push({id:'SNAP-'+Date.now(),kind,at:now(),draft:value,sourceRefs:[...state.sourceRefs],claimCount:state.claimLog.length});
    save();
    window.RussianAssessmentMastery?.recordEvidence?.({
      evidenceId:'RU06-'+Date.now(),competencyId:'academic-production:'+clean(activeTask()?.id||'task'),skill:'research',evidenceType:'learner-production-snapshot',result:{kind,hasDraft:Boolean(value),claimCount:state.claimLog.length,sourceCount:state.sourceRefs.length},authoritative:false
    });
  }
  function taskSelect(xs,active){return `<select id="ruProdTask">${xs.map(x=>`<option value="${esc(x.id)}" ${x.id===active?.id?'selected':''}>${esc(x.id)} · ${esc(x.mode||x.output||'nhiệm vụ')}</option>`).join('')}</select>`;}
  function render(){
    const view=document.getElementById('view');if(!view||!ready)return;
    const core=parse(localStorage.getItem(window.SUBJECT_ADAPTER?.storageKey||'bauman_russian_survival_master_v11_clean_skeleton'),{});
    const shouldShow=core.view==='writing'&&core.writingMode==='academic';
    let panel=document.getElementById('ruAcademicProduction');
    if(!shouldShow){panel?.remove();return;}
    const xs=tasks();const task=activeTask();if(!task)return;
    if(!state.taskId){state.taskId=task.id;save();return;}
    const concepts=conceptsFor(task), funcs=functionsFor(task), reads=readingsFor(task);
    const conceptHtml=concepts.map(c=>{const a=authority('technical-concepts',c,true);return `<button class="ru-prod-chip ${a.authoritative?'verified':'unverified'}" data-ru-prod-source="${esc((c.sourceRefs||[])[0]||'')}" title="${esc(a.label)}"><b>${esc(c.ru)}</b><small>${esc(c.vi||c.en||'')} · ${esc(a.status)}</small></button>`}).join('');
    const fnHtml=funcs.map(f=>`<article><b>${esc(f.ruLabel||f.id)}</b><span>${esc(f.vi||'')}</span><small>${esc((f.patterns||[]).join(' · '))}</small><em>Practice pattern · không tự động là thẩm quyền ngôn ngữ</em></article>`).join('');
    const rdHtml=reads.map(r=>`<article><b>${esc(r.id)} · ${esc(r.genre)}</b><span>${esc((r.operations||[]).join(' → '))}</span><small>Đầu ra: ${esc(r.output||'')}</small></article>`).join('');
    const claims=state.claimLog.slice(-8).map(c=>`<li><b>${esc(c.type)}</b> ${esc(c.text)}<small>${esc((c.sourceRefs||[]).join(', ')||'chưa gắn nguồn')}</small></li>`).join('');
    const html=`<section class="ru-prod-head"><div><span>RU06 · ACADEMIC / TECHNICAL / RESEARCH</span><h3>Production Lab</h3><p>Nhiệm vụ sản sinh có lineage nguồn. Hệ thống không tự bịa citation, không tự sửa bản thảo và không biến hoạt động thành mastery.</p></div>${taskSelect(xs,task)}</section>
    <div class="ru-prod-grid"><section><h4>Nhiệm vụ</h4><b>${esc(task.mode||task.id)}</b><p><strong>Input:</strong> ${esc(task.input||'')}</p><p><strong>Output:</strong> ${esc(task.output||'')}</p><small>Rubric owner: ${esc(task.rubricRef||'RU04')}</small></section><section><h4>Đọc / thao tác nguồn</h4>${rdHtml||'<p>Chưa có reading task khớp stage.</p>'}</section></div>
    <section><h4>Thuật ngữ kỹ thuật theo authority</h4><div class="ru-prod-chips">${conceptHtml||'<span>Chưa có thuật ngữ khớp nhiệm vụ.</span>'}</div><p class="ru-prod-note">Chỉ chip VERIFIED + nguồn ngoài repo được coi là authority. Mục SOURCE_ASSERTED/UNVERIFIED chỉ dùng luyện tập, không được trình bày như chuẩn chính thức.</p></section>
    <section><h4>Chức năng học thuật để luyện</h4><div class="ru-prod-functions">${fnHtml||'<p>Chưa có mẫu chức năng học thuật.</p>'}</div></section>
    <section class="ru-prod-work"><label>Nguồn đang dùng<input id="ruProdSource" placeholder="DOI / URL / sách / tiêu chuẩn / nguồn được phê duyệt"></label><button data-ru-prod="add-source">+ Gắn nguồn</button><div class="ru-prod-sources">${state.sourceRefs.map(x=>`<span>${esc(x)}</span>`).join('')||'<span>Chưa gắn nguồn</span>'}</div><label>Claim của bạn<input id="ruProdClaim" placeholder="Viết claim / nhận định của chính bạn"></label><button data-ru-prod="add-claim">Ghi claim + lineage</button><ol>${claims||'<li>Chưa có claim.</li>'}</ol><label>Bản thảo<textarea id="ruProdDraft" placeholder="Viết phần giải thích / báo cáo / đề cương / defense answer ở đây...">${esc(state.draft)}</textarea></label><div><button data-ru-prod="snapshot">Lưu snapshot bằng chứng luyện tập</button><button data-ru-prod="rewrite">Lưu snapshot rewrite</button></div></section>`;
    if(!panel){panel=document.createElement('section');panel.id='ruAcademicProduction';panel.className='ru-academic-production';view.append(panel);}panel.innerHTML=html;
  }
  async function load(){try{const rows=await Promise.all(DATASETS.map(async n=>{const r=await fetch(`data/${n}.json`,{cache:'force-cache'});if(!r.ok)throw new Error(`${n}: HTTP ${r.status}`);return [n,await r.json()]}));data=Object.fromEntries(rows);ready=true;error=null;render();return true;}catch(e){ready=false;error=String(e?.message||e);return false;}}
  document.addEventListener('change',e=>{if(e.target?.id==='ruProdTask'){state.taskId=e.target.value;save();}});
  document.addEventListener('input',e=>{if(e.target?.id==='ruProdDraft'){state.draft=e.target.value;}});
  document.addEventListener('click',e=>{const a=e.target.closest?.('[data-ru-prod]')?.dataset.ruProd;if(!a)return;e.preventDefault();if(a==='add-source'){addSource(document.getElementById('ruProdSource')?.value);if(document.getElementById('ruProdSource'))document.getElementById('ruProdSource').value='';}else if(a==='add-claim')addClaim();else if(a==='snapshot')snapshot('draft');else if(a==='rewrite')snapshot('rewrite');});
  document.addEventListener('click',e=>{const ref=e.target.closest?.('[data-ru-prod-source]')?.dataset.ruProdSource;if(ref){e.preventDefault();addSource(ref);}});
  window.addEventListener('russian:linguistic-authority-ready',schedule);
  document.addEventListener('DOMContentLoaded',()=>{void load();const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false});});
  window.RussianAcademicProduction={schema:SCHEMA,load,status:()=>({schema:SCHEMA,ready,error,datasets:Object.keys(data)}),get:()=>clone(state),tasks:()=>clone(tasks()),activeTask:()=>clone(activeTask()),authority,snapshot};
})();