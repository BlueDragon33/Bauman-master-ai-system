'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_scenario_session_v1';
  const SCHEMA='RUSSIAN_SCENARIO_SESSION_V1';
  const clean=v=>String(v??'').trim();
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const now=()=>new Date().toISOString();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const core=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,run:null,lastCompletedRun:null});
  let store=(()=>{const x=parse(sessionStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,schema:SCHEMA}})();
  let queued=false;

  function data(){return window.RussianRuntimeData?.get?.('scenario-registry')||null}
  function scenarios(){return Array.isArray(data()?.scenarios)?data().scenarios:[]}
  function scenario(id=store.run?.scenarioId){return scenarios().find(x=>x.id===id)||null}
  function node(s=scenario(),id=store.run?.nodeId){return s?.nodes?.[id]||null}
  function runId(){return 'RU05-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
  function save(){try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(store))}catch(e){console.warn('Russian scenario session save failed',e)}schedule()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  function emit(type,detail={}){
    const r=store.run;if(!r)return null;
    const event={schema:'RUSSIAN_ORAL_EVIDENCE_EVENT_V1',type,runId:r.runId,scenarioId:r.scenarioId,nodeId:r.nodeId,turn:r.turn,at:now(),authoritative:false,masteryWrite:false,...detail};
    r.evidence=Array.isArray(r.evidence)?r.evidence:[];r.evidence.push(event);r.evidence=r.evidence.slice(-100);
    window.dispatchEvent(new CustomEvent('russian:oral-evidence',{detail:clone(event)}));
    return event;
  }
  function start(id){
    const s=scenario(id)||scenarios()[0];if(!s)return {ok:false,error:'NO_SCENARIO_DATA'};
    store.run={schema:SCHEMA,runId:runId(),scenarioId:s.id,scenarioRevision:data()?.contentRevision||data()?.revision||'registry-current',status:'active',nodeId:s.startNode,turn:0,startedAt:now(),updatedAt:now(),supportLevel:0,history:[],evidence:[],worldState:{goal:s.goal||'',family:s.family||'',stage:s.stage||''}};
    emit('scenario-started',{goal:s.goal||'',family:s.family||''});save();return {ok:true,run:clone(store.run)};
  }
  function advance(nextId){
    const r=store.run,s=scenario();if(!r||!s||r.status!=='active')return {ok:false,error:'NO_ACTIVE_RUN'};
    const n=node(s,r.nodeId);if(!n)return {ok:false,error:'INVALID_NODE'};
    const allowed=Array.isArray(n.next)?n.next:[];
    const target=nextId||allowed[0];
    if(!target||!s.nodes?.[target])return finish(n.completion?'success':'partial');
    r.history.push({nodeId:r.nodeId,at:now(),action:'advance',to:target});
    emit('turn-completed',{from:r.nodeId,to:target});
    r.nodeId=target;r.turn=Number(r.turn||0)+1;r.updatedAt=now();
    const nn=node(s,target);
    if(nn?.unexpectedTurn)emit('unexpected-turn',{kind:nn.unexpectedTurn});
    if(nn?.completion)return finish(nn.completion==='practice'?'success':nn.completion);
    save();return {ok:true,run:clone(r)};
  }
  function repair(strategy){
    const r=store.run,n=node();if(!r||!n||r.status!=='active')return {ok:false,error:'NO_ACTIVE_RUN'};
    const allowed=Array.isArray(n.repairPath)?n.repairPath:[];
    if(!allowed.includes(strategy))return {ok:false,error:'INVALID_REPAIR'};
    r.history.push({nodeId:r.nodeId,at:now(),action:'repair',strategy});
    r.supportLevel=Math.max(Number(r.supportLevel||0),1);
    emit('repair-used',{strategy,repairSuccess:true,supportLevel:r.supportLevel});
    r.updatedAt=now();save();return {ok:true,run:clone(r)};
  }
  function finish(outcome='success'){
    const r=store.run;if(!r)return {ok:false,error:'NO_ACTIVE_RUN'};
    r.status=['success','partial','fail-recoverable'].includes(outcome)?outcome:'success';
    r.completedAt=now();r.updatedAt=r.completedAt;
    emit('task-goal-completed',{outcome:r.status,goal:r.worldState?.goal||''});
    store.lastCompletedRun=clone(r);save();return {ok:true,run:clone(r)};
  }
  function replay(){
    const id=store.run?.scenarioId||store.lastCompletedRun?.scenarioId;return start(id);
  }
  function cancel(){
    if(store.run?.status==='active'){store.run.status='cancelled';store.run.updatedAt=now();emit('scenario-cancelled')}
    save();
  }
  function setScenario(id){
    if(store.run?.status==='active'&&store.run.scenarioId===id)return;
    store.run=null;
    const el=document.getElementById('ruScenarioSelect');if(el)el.value=id;
    save();
  }
  function currentSnapshot(){return clone(store)}
  function card(s){
    const selected=(store.run?.scenarioId||'')===s.id;
    return `<option value="${esc(s.id)}" ${selected?'selected':''}>${esc(s.titleVi||s.titleRu||s.id)} · ${esc(s.family||'')}</option>`;
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const active=core().view==='dialogue';
    let panel=document.getElementById('ruScenarioRuntime');
    if(!active){panel?.remove();return}
    const list=scenarios();
    if(!list.length){
      if(!panel){panel=document.createElement('section');panel.id='ruScenarioRuntime';panel.className='ru-scenario-runtime';view.prepend(panel)}
      panel.innerHTML='<div class="ru-scenario-error"><b>Scenario registry chưa sẵn sàng</b><span>Đối thoại cơ bản vẫn dùng được; scenario không được giả lập bằng dữ liệu bịa.</span></div>';return;
    }
    if(!panel){panel=document.createElement('section');panel.id='ruScenarioRuntime';panel.className='ru-scenario-runtime';view.prepend(panel)}
    const r=store.run,s=scenario(),n=node();
    const running=!!r&&r.status==='active';
    const repairs=running&&Array.isArray(n?.repairPath)?n.repairPath:[];
    const next=running&&Array.isArray(n?.next)?n.next:[];
    const history=Array.isArray(r?.history)?r.history:[];
    panel.innerHTML=`
      <header class="ru-scenario-head">
        <div><span>RU05 · SCENARIO RUNTIME</span><h3>Kịch bản giao tiếp theo mục tiêu</h3><p>Scenario quản lý lượt, hiểu nhầm, repair và hoàn thành. Nó phát evidence quan sát được nhưng không tự ghi mastery/SRS.</p></div>
        <small>${running?'Đang chạy · '+esc(r.runId):r?'Kết thúc · '+esc(r.status):'Chưa bắt đầu'}</small>
      </header>
      <div class="ru-scenario-toolbar">
        <label for="ruScenarioSelect">Kịch bản</label>
        <select id="ruScenarioSelect" ${running?'disabled':''}>${list.map(card).join('')}</select>
        <button type="button" data-ru-scenario="start">${r?'Chạy lượt mới':'Bắt đầu'}</button>
        ${r?'<button type="button" data-ru-scenario="replay">Replay · run mới</button>':''}
      </div>
      ${s?`<div class="ru-scenario-grid">
        <article><label>Mục tiêu</label><b>${esc(s.titleRu||s.titleVi||s.id)}</b><p>${esc(s.goal||'')}</p><small>${esc(s.family||'')} · ${esc(s.stage||'')} · ${esc(s.contextRef||'')}</small></article>
        <article><label>World / turn state</label><b>${running?esc(r.nodeId):'—'}</b><p>${running&&n?.unexpectedTurn?'Tình huống bất ngờ: '+esc(n.unexpectedTurn):running?'Tiếp tục theo mục tiêu; không cần khớp một câu duy nhất.':'Chọn Start để tạo run mới.'}</p><small>${running?'Turn '+r.turn+' · support '+r.supportLevel:history.length+' history event'}</small></article>
      </div>`:''}
      ${running?`<div class="ru-scenario-actions">
        ${repairs.map(x=>`<button type="button" class="repair" data-ru-repair="${esc(x)}">Repair · ${esc(x)}</button>`).join('')}
        ${next.map(x=>`<button type="button" data-ru-next="${esc(x)}">Tiếp tục → ${esc(x)}</button>`).join('')}
        ${!next.length?'<button type="button" data-ru-scenario="finish">Hoàn thành mục tiêu</button>':''}
        <button type="button" class="muted" data-ru-scenario="cancel">Dừng lượt</button>
      </div>`:''}
      <footer><span>Text fallback luôn khả dụng; micro/STT/AI không phải điều kiện để scenario chạy.</span><span>Evidence: ${r?.evidence?.length||0} · Mastery write: 0</span></footer>`;
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('[data-ru-scenario]')?.dataset.ruScenario;
    if(a){e.preventDefault();if(a==='start'){const id=document.getElementById('ruScenarioSelect')?.value||scenarios()[0]?.id;start(id)}else if(a==='replay')replay();else if(a==='finish')finish('success');else if(a==='cancel')cancel();return}
    const rep=e.target.closest?.('[data-ru-repair]')?.dataset.ruRepair;if(rep){e.preventDefault();repair(rep);return}
    const nx=e.target.closest?.('[data-ru-next]')?.dataset.ruNext;if(nx){e.preventDefault();advance(nx);return}
    setTimeout(schedule,0);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='ruScenarioSelect')setScenario(e.target.value)},true);
  function boot(){schedule();const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false})}
  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('russian:runtime-data-ready',schedule);
  window.addEventListener('online',schedule);window.addEventListener('offline',schedule);
  window.RussianScenarioEngine={schema:SCHEMA,start,advance,repair,finish,replay,cancel,get:currentSnapshot,scenarios:()=>clone(scenarios()),authoritative:false,masteryWrite:false};
})();
