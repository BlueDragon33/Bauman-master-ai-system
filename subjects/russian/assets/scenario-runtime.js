'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_scenario_runtime_v1';
  const RECOVERY_KEY=STORAGE_KEY+'_recovery_meta';
  const REGISTRY_CACHE_KEY='bauman_russian_scenario_registry_v1';
  const SCHEMA='RUSSIAN_RU05_SCENARIO_RUNTIME_V1';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();
  let registry=null,loadError=null,blocked=false,queued=false,loadingPromise=null;

  function empty(){return {schema:SCHEMA,activeScenarioId:'',runs:{},updatedAt:null};}
  function loadState(){
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return empty();
    try{
      const value=JSON.parse(raw);
      return {...empty(),...value,runs:value?.runs&&typeof value.runs==='object'?value.runs:{}};
    }catch(error){
      blocked=true;
      try{localStorage.setItem(RECOVERY_KEY,JSON.stringify({reason:'malformed-json',detectedAt:now(),length:raw.length,error:String(error?.message||error)}));}catch(_){}
      return empty();
    }
  }
  let state=loadState();

  function save(){
    if(blocked)return false;
    state.updatedAt=now();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch(_){return false}
  }
  function core(){return parse(localStorage.getItem(CORE_KEY),{});}
  function scenarios(){return arr(registry?.scenarios);}
  function byId(id){return scenarios().find(s=>clean(s.id)===clean(id))||null;}
  function runFor(id){return state.runs?.[clean(id)]||null;}
  function activeScenario(){return byId(state.activeScenarioId)||scenarios()[0]||null;}
  function activeRun(){const s=activeScenario();return s?runFor(s.id):null;}

  function validateScenario(s){
    const errors=[];
    const nodes=s?.nodes&&typeof s.nodes==='object'?s.nodes:{};
    const ids=new Set(Object.keys(nodes));
    if(!clean(s?.id))errors.push('missing-id');
    if(!clean(s?.startNode)||!ids.has(s.startNode))errors.push('invalid-start');
    const seen=new Set(),stack=ids.has(s?.startNode)?[s.startNode]:[];
    let completion=0,repair=0,unexpected=0;
    while(stack.length){
      const id=stack.pop();if(seen.has(id))continue;seen.add(id);
      const node=nodes[id]||{};
      if(node.completion)completion++;
      if(arr(node.repairPath).length)repair++;
      if(node.unexpectedTurn)unexpected++;
      for(const next of arr(node.next)){if(!ids.has(next))errors.push('dangling-next:'+id+'->'+next);else stack.push(next);}
    }
    if(seen.size!==ids.size)errors.push('unreachable-node');
    if(!completion)errors.push('missing-completion');
    if(!repair)errors.push('missing-repair');
    if(!unexpected)errors.push('missing-unexpected-turn');
    return {ok:errors.length===0,errors};
  }

  function validateRegistry(value=registry){
    const list=arr(value?.scenarios);
    const ids=new Set(),errors=[];
    if(value?.schema!=='RUSSIAN_SCENARIO_REGISTRY_V1')errors.push('registry-schema');
    for(const s of list){
      if(ids.has(s.id))errors.push('duplicate:'+s.id);ids.add(s.id);
      const v=validateScenario(s);if(!v.ok)errors.push(...v.errors.map(e=>s.id+':'+e));
    }
    return {ok:errors.length===0,errors,scenarios:list.length};
  }

  async function loadRegistry(){
    if(registry)return registry;
    if(loadingPromise)return loadingPromise;
    loadingPromise=(async()=>{
      let value=null;
      try{
        const res=await fetch('data/scenario-registry.json',{cache:'no-store'});
        if(!res.ok)throw new Error('HTTP '+res.status);
        value=await res.json();
        const valid=validateRegistry(value);
        if(!valid.ok)throw new Error('invalid-registry '+valid.errors.join(','));
        registry=value;loadError=null;
        try{localStorage.setItem(REGISTRY_CACHE_KEY,JSON.stringify(value));}catch(_){}
      }catch(error){
        loadError=String(error?.message||error);
        const cached=parse(localStorage.getItem(REGISTRY_CACHE_KEY),null);
        const valid=validateRegistry(cached);
        if(valid.ok){registry=cached;loadError='offline-cache:'+loadError;}else registry=null;
      }
      if(!state.activeScenarioId&&scenarios()[0])state.activeScenarioId=scenarios()[0].id;
      schedule();
      return registry;
    })();
    try{return await loadingPromise;}finally{loadingPromise=null;}
  }

  function newRun(s){
    const run={runId:'RU05-'+clean(s.id)+'-'+Date.now(),scenarioId:s.id,nodeId:s.startNode,completed:false,startedAt:now(),updatedAt:now(),events:[{type:'start',nodeId:s.startNode,at:now()}],repairs:[],history:[s.startNode]};
    state.runs[s.id]=run;state.activeScenarioId=s.id;save();schedule();return run;
  }
  function start(id){
    const s=byId(id)||activeScenario();if(!s)return null;
    return newRun(s);
  }
  function resume(id){
    const s=byId(id)||activeScenario();if(!s)return null;
    state.activeScenarioId=s.id;save();schedule();return runFor(s.id)||newRun(s);
  }
  function repair(strategy){
    const s=activeScenario(),run=activeRun();if(!s||!run||run.completed)return null;
    const node=s.nodes?.[run.nodeId]||{};
    if(!arr(node.repairPath).includes(strategy))return null;
    const event={type:'repair',strategy,nodeId:run.nodeId,at:now()};
    run.repairs.push(event);run.events.push(event);run.updatedAt=event.at;save();schedule();return run;
  }
  function advance(nextId){
    const s=activeScenario(),run=activeRun();if(!s||!run||run.completed)return null;
    const node=s.nodes?.[run.nodeId]||{};
    const allowed=arr(node.next);
    const target=clean(nextId)||allowed[0]||'';
    if(!allowed.includes(target))return null;
    run.nodeId=target;run.updatedAt=now();run.events.push({type:'advance',nodeId:target,at:run.updatedAt});run.history.push(target);
    const next=s.nodes?.[target]||{};
    if(next.completion){
      run.completed=true;run.completedAt=now();run.events.push({type:'complete',nodeId:target,at:run.completedAt});
      try{window.RussianAssessmentMastery?.recordEvidence?.({competencyId:'scenario:'+s.id,skill:'interaction',evidenceType:'scenario-practice-completion',result:{scenarioId:s.id,runId:run.runId,repairs:run.repairs.length},authoritative:false});}catch(_){}
    }
    save();schedule();return run;
  }
  function reset(id){
    const s=byId(id)||activeScenario();if(!s)return null;
    delete state.runs[s.id];state.activeScenarioId=s.id;save();schedule();return null;
  }

  function currentNode(){
    const s=activeScenario(),run=activeRun();return s&&run?s.nodes?.[run.nodeId]||null:null;
  }
  function status(){
    const valid=validateRegistry();
    return {schema:SCHEMA,ready:Boolean(registry),loading:Boolean(loadingPromise),lazyOnCapabilityUse:true,offlineFallback:Boolean(registry)&&Boolean(loadError),loadError,blocked,registry:valid,state:JSON.parse(JSON.stringify(state))};
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const c=core();
    let panel=document.getElementById('ruScenarioRuntime');
    if(c.view!=='dialogue'){panel?.remove();return;}
    if(!registry){
      if(!loadingPromise)loadRegistry();
      if(!panel){panel=document.createElement('section');panel.id='ruScenarioRuntime';panel.className='ru-scenario-runtime';view.prepend(panel);}
      panel.innerHTML='<header><span>RU05 · SCENARIO ENGINE</span><h3>Kịch bản tương tác</h3></header><p>'+(loadError?'Không tải được registry: '+esc(loadError):'Đang tải scenario registry theo nhu cầu...')+'</p>';
      return;
    }
    const stage=clean(c.stage)||'vn';
    const list=scenarios().filter(s=>stage==='all'||clean(s.stage)===stage);
    const available=list.length?list:scenarios();
    if(!available.some(s=>s.id===state.activeScenarioId))state.activeScenarioId=available[0]?.id||'';
    const s=activeScenario(),run=s?runFor(s.id):null,node=s&&run?s.nodes?.[run.nodeId]||{}:null;
    if(!panel){panel=document.createElement('section');panel.id='ruScenarioRuntime';panel.className='ru-scenario-runtime';view.prepend(panel);}
    const options=available.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===state.activeScenarioId?'selected':'')+'>'+esc(x.family+' · '+x.titleVi)+'</option>').join('');
    const repairButtons=node?arr(node.repairPath).map(x=>'<button class="btn soft" data-ru-scenario-repair="'+esc(x)+'">Sửa: '+esc(x)+'</button>').join(''):'';
    const nextButtons=node?arr(node.next).map(x=>'<button class="btn primary" data-ru-scenario-next="'+esc(x)+'">Tiếp tục → '+esc(x)+'</button>').join(''):'';
    const runStatus=!run?'Chưa bắt đầu':run.completed?'Hoàn thành luyện tập':'Đang ở nút '+esc(run.nodeId);
    const unexpected=node?.unexpectedTurn?'<div class="ru-scenario-turn"><b>Tình huống bất ngờ</b><span>'+esc(node.unexpectedTurn)+'</span></div>':'';
    const offline=loadError?'<span class="ru-scenario-offline">Registry đang dùng cache offline</span>':'';
    panel.innerHTML='<header><div><span>RU05 · SCENARIO ENGINE</span><h3>'+esc(s?.titleVi||'Kịch bản tương tác')+'</h3><p>'+esc(s?.titleRu||'')+' · '+esc(s?.goal||'')+'</p></div>'+offline+'</header>'+
      '<div class="ru-scenario-controls"><label>Kịch bản<select data-ru-scenario-select>'+options+'</select></label><div><button class="btn" data-ru-scenario="start">'+(run?'Bắt đầu lại':'Bắt đầu')+'</button><button class="btn soft" data-ru-scenario="resume">Resume</button></div></div>'+
      '<div class="ru-scenario-state"><article><b>Trạng thái</b><span>'+runStatus+'</span></article><article><b>Vai</b><span>'+esc(arr(s?.roles).join(' · '))+'</span></article><article><b>Repair đã dùng</b><span>'+String(run?.repairs?.length||0)+'</span></article></div>'+
      unexpected+
      '<div class="ru-scenario-actions">'+repairButtons+nextButtons+'</div>'+
      '<small>Scenario completion là PRACTICE_COMPLETION_ONLY. Không ghi mastery, không mở khóa stage và STT lỗi không được tính là learner failure.</small>';
  }

  document.addEventListener('change',event=>{
    const sel=event.target.closest?.('[data-ru-scenario-select]');if(!sel)return;
    state.activeScenarioId=clean(sel.value);save();schedule();
  },true);
  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-ru-scenario]')?.dataset.ruScenario;
    const next=event.target.closest?.('[data-ru-scenario-next]')?.dataset.ruScenarioNext;
    const rep=event.target.closest?.('[data-ru-scenario-repair]')?.dataset.ruScenarioRepair;
    if(action){event.preventDefault();if(action==='start')start(state.activeScenarioId);else if(action==='resume')resume(state.activeScenarioId);return;}
    if(next){event.preventDefault();advance(next);return;}
    if(rep){event.preventDefault();repair(rep);return;}
    setTimeout(schedule,0);
  },true);
  document.addEventListener('DOMContentLoaded',()=>{schedule();});
  window.addEventListener('russian:route-received',schedule);
  window.RussianScenarioRuntime={schema:SCHEMA,loadRegistry,status,validateRegistry,list:()=>JSON.parse(JSON.stringify(scenarios())),start,resume,repair,advance,reset,activeRun:()=>JSON.parse(JSON.stringify(activeRun()||null))};
})();