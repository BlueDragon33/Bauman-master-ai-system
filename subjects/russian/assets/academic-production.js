'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_academic_production_v1';
  const RECOVERY_KEY=STORAGE_KEY+'_recovery_meta';
  const DATA_CACHE_KEY='bauman_russian_ru06_data_v1';
  const SCHEMA='RUSSIAN_RU06_ACADEMIC_PRODUCTION_V1';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();
  const words=v=>clean(v)?clean(v).split(/\s+/).filter(Boolean).length:0;
  let datasets=null,loadError=null,blocked=false,queued=false;

  function empty(){return {schema:SCHEMA,activeTaskId:'',work:{},updatedAt:null};}
  function loadState(){
    const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return empty();
    try{const value=JSON.parse(raw);return {...empty(),...value,work:value?.work&&typeof value.work==='object'?value.work:{}};}
    catch(error){blocked=true;try{localStorage.setItem(RECOVERY_KEY,JSON.stringify({reason:'malformed-json',detectedAt:now(),length:raw.length,error:String(error?.message||error)}));}catch(_){}return empty();}
  }
  let state=loadState();
  function save(){if(blocked)return false;state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch(_){return false}}
  function core(){return parse(localStorage.getItem(CORE_KEY),{});}
  function work(id){return state.work[id]||(state.work[id]={sourceNotes:'',draft:'',presentation:'',qa:'',snapshots:[],selfChecks:[],updatedAt:null});}
  function taskList(){return arr(datasets?.performance?.tasks);}
  function task(){return taskList().find(x=>x.id===state.activeTaskId)||taskList()[0]||null;}
  const intersects=(a,b)=>arr(a).some(x=>arr(b).includes(x));
  function datasetTrust(id){
    const row=arr(datasets?.provenance?.datasets).find(x=>clean(x.id)===clean(id));
    return {id,status:clean(row?.status||'UNKNOWN').toUpperCase(),confidence:clean(row?.confidence||''),rule:clean(row?.rule||'')};
  }
  const verifiedStatus=v=>['VERIFIED','VERIFIED_WITH_VARIANTS'].includes(clean(v).toUpperCase());
  function readingFor(t){return arr(datasets?.reading?.tasks).filter(x=>intersects(x.targets,t?.targets));}
  function conceptCandidatesFor(t){return arr(datasets?.technical?.concepts).filter(x=>intersects(x.targets,t?.targets)).slice(0,24);}
  function conceptsFor(t){return conceptCandidatesFor(t).filter(x=>verifiedStatus(x.authorityStatus)).slice(0,12);}
  function functionsFor(t){
    if(!verifiedStatus(datasetTrust('academic-functions').status))return [];
    const ids=new Set(readingFor(t).flatMap(x=>arr(x.academicFunctions)));
    return arr(datasets?.academic?.functions).filter(x=>ids.has(x.id)).slice(0,10);
  }
  function cacheData(value){try{localStorage.setItem(DATA_CACHE_KEY,JSON.stringify(value));}catch(_){}}
  async function loadData(){
    try{
      const names=['technical-concepts','academic-functions','reading','performance-tasks','provenance'];
      const values=await Promise.all(names.map(name=>fetch('data/'+name+'.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(name+':HTTP '+r.status);return r.json();})));
      datasets={technical:values[0],academic:values[1],reading:values[2],performance:values[3],provenance:values[4]};
      if(!taskList().length)throw new Error('performance-task-empty');
      loadError=null;cacheData(datasets);
    }catch(error){
      loadError=String(error?.message||error);
      const cached=parse(localStorage.getItem(DATA_CACHE_KEY),null);
      if(cached&&arr(cached?.performance?.tasks).length)datasets=cached;else datasets=null;
    }
    if(!state.activeTaskId&&taskList()[0])state.activeTaskId=taskList()[0].id;
    schedule();return datasets;
  }

  function updateField(field,value){
    const t=task();if(!t)return;
    const row=work(t.id);row[field]=String(value??'');row.updatedAt=now();save();schedule();
  }
  function snapshot(kind){
    const t=task();if(!t)return null;
    const row=work(t.id);
    const payload={kind,at:now(),sourceNotes:row.sourceNotes,draft:row.draft,presentation:row.presentation,qa:row.qa,wordCount:words(row.draft)};
    row.snapshots.push(payload);row.snapshots=row.snapshots.slice(-12);row.updatedAt=payload.at;save();
    try{window.RussianAssessmentMastery?.recordEvidence?.({competencyId:'production:'+t.id,skill:t.mode?.includes('research')?'research':'academic',evidenceType:'learner-production-snapshot',result:{taskId:t.id,kind,wordCount:payload.wordCount},authoritative:false});}catch(_){}
    schedule();return payload;
  }
  function selfCheck(label){
    const t=task();if(!t)return null;const row=work(t.id);
    const item={label:clean(label),at:now()};row.selfChecks.push(item);row.selfChecks=row.selfChecks.slice(-20);row.updatedAt=item.at;save();schedule();return item;
  }
  function status(){return {schema:SCHEMA,ready:Boolean(datasets),offlineFallback:Boolean(datasets)&&Boolean(loadError),loadError,blocked,activeTaskId:state.activeTaskId,taskCount:taskList().length,trust:{technical:datasetTrust('technical-concepts'),academicFunctions:datasetTrust('academic-functions'),reading:datasetTrust('reading'),performanceTasks:datasetTrust('performance-tasks')},state:JSON.parse(JSON.stringify(state))};}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}

  function render(){
    const view=document.getElementById('view');if(!view)return;
    const c=core();let panel=document.getElementById('ruAcademicProduction');
    const active=c.view==='writing'&&c.writingMode==='academic';
    if(!active){panel?.remove();return;}
    if(!datasets){
      if(!panel){panel=document.createElement('section');panel.id='ruAcademicProduction';panel.className='ru-production-studio';view.prepend(panel);}
      panel.innerHTML='<header><span>RU06 · ACADEMIC / TECHNICAL / RESEARCH</span><h3>Production workspace</h3></header><p>'+(loadError?'Không tải được canonical RU06 data: '+esc(loadError):'Đang tải canonical RU06 data...')+'</p>';return;
    }
    const t=task();if(!t)return;
    const row=work(t.id),reads=readingFor(t),conceptCandidates=conceptCandidatesFor(t),concepts=conceptsFor(t),functions=functionsFor(t);
    const technicalTrust=datasetTrust('technical-concepts'),academicTrust=datasetTrust('academic-functions');
    if(!panel){panel=document.createElement('section');panel.id='ruAcademicProduction';panel.className='ru-production-studio';view.prepend(panel);}
    const options=taskList().map(x=>'<option value="'+esc(x.id)+'" '+(x.id===t.id?'selected':'')+'>'+esc(x.id+' · '+x.mode)+'</option>').join('');
    const withheldConcepts=Math.max(0,conceptCandidates.length-concepts.length);
    const conceptHtml=concepts.map(x=>'<span title="'+esc(arr(x.sourceRefs).join(' · '))+'"><b>'+esc(x.ru)+'</b> · '+esc(x.vi)+' <i>VERIFIED</i></span>').join('')||'<span>Không có thuật ngữ VERIFIED gắn trực tiếp.</span>';
    const functionHtml=verifiedStatus(academicTrust.status)
      ?(functions.map(x=>'<span><b>'+esc(x.ruLabel)+'</b> · '+esc(arr(x.patterns).slice(0,2).join(' / '))+'</span>').join('')||'<span>Không có function gắn trực tiếp.</span>')
      :'<span><b>Tạm ẩn mẫu tiếng Nga.</b> academic-functions đang '+esc(academicTrust.status)+' theo RU03, nên pattern không được trình bày như canonical linguistic truth.</span>';
    const readingHtml=reads.map(x=>'<article><b>'+esc(x.id+' · '+x.genre)+'</b><span>'+esc(arr(x.operations).join(' → '))+'</span><small>Đầu ra: '+esc(x.output)+'</small></article>').join('')||'<article><span>Chưa có reading task trực tiếp.</span></article>';
    const offline=loadError?'<span class="ru-production-offline">Canonical data từ cache offline</span>':'';
    panel.innerHTML='<header><div><span>RU06 · CONCEPT → SOURCE → PRODUCTION → TRANSFER</span><h3>'+esc(t.id+' · '+t.mode)+'</h3><p>Đầu ra: '+esc(t.output)+' · Evidence contract: '+esc(arr(t.evidenceTypes).join(', '))+'</p></div>'+offline+'</header>'+
      '<div class="ru-production-selector"><label>Nhiệm vụ<select data-ru-production-task>'+options+'</select></label><span>Targets: '+esc(arr(t.targets).join(' · '))+'</span></div>'+
      '<div class="ru-production-reference"><section><h4>Reading/source operation</h4>'+readingHtml+'</section><section><h4>Technical terms</h4><small>Dataset '+esc(technicalTrust.status)+' · chỉ hiển thị item VERIFIED · '+String(withheldConcepts)+' item chưa đủ authority đang được giữ lại.</small><div class="ru-production-chips">'+conceptHtml+'</div></section><section><h4>Academic functions</h4><small>Dataset '+esc(academicTrust.status)+' · fail-closed theo RU03.</small><div class="ru-production-chips">'+functionHtml+'</div></section></div>'+
      '<div class="ru-production-work"><label>1. Source notes / evidence refs<textarea data-ru-production-field="sourceNotes" placeholder="Ghi nguồn, dữ kiện, điều kiện, giới hạn...">'+esc(row.sourceNotes)+'</textarea></label>'+
      '<label>2. Draft / technical explanation<textarea data-ru-production-field="draft" placeholder="Tự viết bằng tiếng Nga; hệ thống không tự thay claim, số liệu, công thức hay citation.">'+esc(row.draft)+'</textarea></label>'+
      '<label>3. Presentation / oral outline<textarea data-ru-production-field="presentation" placeholder="Dàn ý trình bày, seminar, НИР hoặc ВКР...">'+esc(row.presentation)+'</textarea></label>'+
      '<label>4. Q&A / defense log<textarea data-ru-production-field="qa" placeholder="Câu hỏi bất ngờ → trả lời → evidence → limitation...">'+esc(row.qa)+'</textarea></label></div>'+
      '<div class="ru-production-actions"><button class="btn primary" data-ru-production="snapshot">Lưu snapshot</button><button class="btn soft" data-ru-production-check="source-linked">Đã kiểm nguồn</button><button class="btn soft" data-ru-production-check="claim-bounded">Đã giới hạn claim</button><button class="btn soft" data-ru-production-check="novel-transfer">Đã thử ngữ cảnh mới</button></div>'+
      '<div class="ru-production-status"><b>'+String(row.snapshots.length)+' snapshot · '+String(words(row.draft))+' từ draft · '+String(row.selfChecks.length)+' self-check</b><span>Không tự chấm mastery/official score. RU04 mới có quyền diễn giải evidence chính thức.</span></div>';
  }

  document.addEventListener('change',event=>{
    const select=event.target.closest?.('[data-ru-production-task]');
    if(select){state.activeTaskId=clean(select.value);save();schedule();return;}
  },true);
  document.addEventListener('input',event=>{
    const field=event.target.closest?.('[data-ru-production-field]')?.dataset.ruProductionField;
    if(field)updateField(field,event.target.value);
  },true);
  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-ru-production]')?.dataset.ruProduction;
    const check=event.target.closest?.('[data-ru-production-check]')?.dataset.ruProductionCheck;
    if(action==='snapshot'){event.preventDefault();snapshot('learner-production');return;}
    if(check){event.preventDefault();selfCheck(check);return;}
    setTimeout(schedule,0);
  },true);
  document.addEventListener('DOMContentLoaded',()=>{loadData();schedule();});
  window.RussianAcademicProduction={schema:SCHEMA,loadData,status,listTasks:()=>JSON.parse(JSON.stringify(taskList())),select:id=>{if(taskList().some(t=>t.id===id)){state.activeTaskId=id;save();schedule();return true}return false},snapshot,selfCheck};
})();