'use strict';
(function(){
  const SCHEMA='RUSSIAN_SCENARIO_RUNTIME_V1';
  const STORAGE_KEY='bauman_russian_scenario_runtime_v1';
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  let registry=null,ready=false,loadError=null,renderQueued=false;
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();
  const core=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,session:null,history:[],updatedAt:null});
  let state=(()=>{const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,history:Array.isArray(x?.history)?x.history:[]};})();
  function save(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian scenario state save failed',e)}schedule();}
  function scenarioById(id){return (registry?.scenarios||[]).find(x=>clean(x.id)===clean(id))||null;}
  function stageScenarios(stage){return (registry?.scenarios||[]).filter(x=>!stage||clean(x.stage)===clean(stage));}
  function validateRegistry(data){
    if(data?.schema!=='RUSSIAN_SCENARIO_REGISTRY_V1'||!Array.isArray(data?.scenarios))throw new Error('invalid scenario registry');
    const ids=new Set();
    for(const s of data.scenarios){
      if(!s?.id||ids.has(s.id))throw new Error('duplicate/missing scenario id'); ids.add(s.id);
      if(!s.startNode||!s.nodes?.[s.startNode])throw new Error('invalid start node '+s.id);
      for(const [id,node] of Object.entries(s.nodes||{}))for(const n of (node.next||[]))if(!s.nodes[n])throw new Error(`dangling node ${s.id}:${id}->${n}`);
    }
  }
  async function load(){
    if(ready)return clone(registry);
    try{
      const r=await fetch('data/scenario-registry.json',{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();validateRegistry(data);registry=data;ready=true;loadError=null;schedule();return clone(registry);
    }catch(error){ready=false;loadError=String(error?.message||error);schedule();return null;}
  }
  function start(id){
    const s=scenarioById(id);if(!s)return {ok:false,reason:'SCENARIO_NOT_FOUND'};
    state.session={scenarioId:s.id,nodeId:s.startNode,startedAt:now(),updatedAt:now(),completed:false,repairUsed:[],visited:[s.startNode],runId:`SCN-${Date.now()}`};
    save();return {ok:true,session:clone(state.session)};
  }
  function current(){
    const s=scenarioById(state.session?.scenarioId);const node=s?.nodes?.[state.session?.nodeId]||null;
    return {scenario:s,node,session:clone(state.session)};
  }
  function advance(nextId){
    const {scenario,node}=current();if(!scenario||!node)return {ok:false,reason:'NO_ACTIVE_SCENARIO'};
    const allowed=node.next||[];if(!allowed.includes(nextId))return {ok:false,reason:'INVALID_TRANSITION'};
    state.session.nodeId=nextId;state.session.updatedAt=now();state.session.visited=[...(state.session.visited||[]),nextId];
    const next=scenario.nodes[nextId];if(next?.completion){state.session.completed=true;state.session.completedAt=now();state.history.unshift(clone(state.session));state.history=state.history.slice(0,25);emitEvidence(scenario);}
    save();return {ok:true,session:clone(state.session)};
  }
  function repair(choice){
    const {node}=current();if(!node)return {ok:false,reason:'NO_ACTIVE_SCENARIO'};
    if(!(node.repairPath||[]).includes(choice))return {ok:false,reason:'INVALID_REPAIR'};
    state.session.repairUsed=[...(state.session.repairUsed||[]),{nodeId:state.session.nodeId,choice,at:now()}];state.session.updatedAt=now();save();return {ok:true};
  }
  function reset(){state.session=null;save();}
  function emitEvidence(scenario){
    try{
      window.RussianAssessmentMastery?.recordEvidence?.({
        evidenceId:`SCENARIO-PRACTICE-${state.session?.runId||Date.now()}`,
        competencyId:`scenario:${scenario.id}`,
        skill:'speaking',
        evidenceType:'scenario_practice_completion',
        result:{scenarioId:scenario.id,family:scenario.family,stage:scenario.stage,repairUsed:(state.session?.repairUsed||[]).length,completed:true},
        authoritative:false
      });
    }catch(e){console.warn('Scenario practice evidence emission failed',e)}
  }
  function context(){const c=current();return {schema:SCHEMA,scenarioId:c.scenario?.id||null,family:c.scenario?.family||null,nodeId:c.session?.nodeId||null,completed:Boolean(c.session?.completed),repairUsed:clone(c.session?.repairUsed||[]),runId:c.session?.runId||null};}
  function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const c=core();let panel=document.getElementById('ruScenarioRuntime');
    if(c.view!=='dialogue'){panel?.remove();return;}
    if(!panel){panel=document.createElement('section');panel.id='ruScenarioRuntime';panel.className='panel ru-scenario-runtime';view.prepend(panel);}
    if(!ready){panel.innerHTML=`<div class="ru-scenario-head"><span class="chip">RU05 · SCENARIO</span><h3>Kịch bản tình huống</h3><p>${loadError?`Không tải được registry: ${esc(loadError)}`:'Đang tải kịch bản...'}</p></div>`;return;}
    const options=stageScenarios(c.stage);
    const active=current();
    if(!active.scenario){
      panel.innerHTML=`<div class="ru-scenario-head"><span class="chip">RU05 · SCENARIO ENGINE</span><h3>Luyện tình huống theo state machine</h3><p>Chọn một kịch bản. Trạng thái được lưu cục bộ để có thể tiếp tục sau khi tải lại; hoàn thành chỉ là bằng chứng luyện tập, không tự ghi mastery.</p></div><div class="ru-scenario-list">${options.map(s=>`<button class="btn" data-ru-scenario-start="${esc(s.id)}"><b>${esc(s.titleVi||s.id)}</b><small>${esc(s.titleRu||'')} · ${esc(s.family||'')}</small></button>`).join('')||'<p>Không có kịch bản đúng stage; có thể đổi stage để luyện kịch bản khác.</p>'}</div>`;return;
    }
    const {scenario,node,session}=active;
    const authority=window.RussianLinguisticAuthority?.guard?.('dialogue',null,{authoritativeUse:true})||{allowed:false,label:'Chưa có hồ sơ thẩm quyền'};
    const next=(node?.next||[]).map(id=>`<button class="btn primary" data-ru-scenario-next="${esc(id)}">Tiếp: ${esc(id)}</button>`).join('');
    const repairs=(node?.repairPath||[]).map(x=>`<button class="btn soft" data-ru-scenario-repair="${esc(x)}">Sửa tình huống: ${esc(x)}</button>`).join('');
    panel.innerHTML=`<div class="ru-scenario-head"><span class="chip">RU05 · ${esc(scenario.family||'scenario')}</span><h3>${esc(scenario.titleVi||scenario.id)}</h3><p>${esc(scenario.titleRu||'')} · Mục tiêu: ${esc(scenario.goal||'')}</p></div><div class="ru-scenario-state"><article><b>Nút hiện tại</b><span>${esc(session.nodeId)}</span><small>${esc(node?.contextRef||scenario.contextRef||'')}</small></article><article><b>Unexpected turn</b><span>${esc(node?.unexpectedTurn||'Không có ở lượt này')}</span></article><article><b>Thẩm quyền ngôn ngữ</b><span>${esc(authority.label)}</span><small>${authority.allowed?'Có thể dùng như authoritative content.':'Chỉ dùng luyện tập; không nâng thành canonical truth.'}</small></article></div><div class="ru-scenario-actions">${repairs}${next}${node?.completion?'<span class="status">Đã hoàn thành vòng luyện tập</span>':''}<button class="btn" data-ru-scenario-reset="1">Kết thúc / đổi kịch bản</button></div>`;
  }
  document.addEventListener('click',e=>{
    const s=e.target.closest?.('[data-ru-scenario-start]');if(s){start(s.dataset.ruScenarioStart);return;}
    const n=e.target.closest?.('[data-ru-scenario-next]');if(n){advance(n.dataset.ruScenarioNext);return;}
    const r=e.target.closest?.('[data-ru-scenario-repair]');if(r){repair(r.dataset.ruScenarioRepair);return;}
    if(e.target.closest?.('[data-ru-scenario-reset]')){reset();return;}
    setTimeout(schedule,0);
  },true);
  document.addEventListener('DOMContentLoaded',async()=>{await load();const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false});schedule();});
  window.addEventListener('storage',e=>{if(e.key===CORE_KEY||e.key===STORAGE_KEY){state=e.key===STORAGE_KEY?parse(e.newValue,empty()):state;schedule();}});
  window.RussianScenarioRuntime={schema:SCHEMA,load,start,current,advance,repair,reset,context,status:()=>({ready,error:loadError,scenarioCount:(registry?.scenarios||[]).length,state:clone(state)})};
})();