'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const SESSION_KEY='bauman_russian_scenario_session_v1';
  const SCHEMA='RUSSIAN_SCENARIO_RUNTIME_V1';
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const familyLabel={ 'real-life':'Đời sống',administration:'Hành chính',classroom:'Lớp học',lab:'Phòng lab',seminar:'Seminar',research:'Nghiên cứu',defense:'Bảo vệ' };
  const repairLabel={
    'ask-repeat':'Xin nhắc lại','ask-slower':'Xin nói chậm hơn','state-missing-document':'Nói rõ thiếu giấy tờ','ask-where-to-go':'Hỏi bước tiếp theo',
    'confirm-file':'Xác nhận tài liệu','describe-symptom':'Mô tả lỗi','ask-next-step':'Hỏi cách xử lý','ask-clarification':'Xin làm rõ',
    'give-short-example':'Đưa ví dụ ngắn','restate-scope':'Nói lại phạm vi','ask-priority':'Hỏi ưu tiên','clarify-question':'Làm rõ câu hỏi',
    'answer-with-limitation':'Trả lời kèm giới hạn'
  };
  let registry=null, ready=false, renderQueued=false;
  let state=parse(sessionStorage.getItem(SESSION_KEY),null);

  const core=()=>parse(localStorage.getItem(CORE_KEY),{});
  const activeView=()=>clean(core().view)==='dialogue';
  const emit=(type,extra={})=>{
    const detail={schema:SCHEMA,type,at:new Date().toISOString(),scenarioId:state?.scenarioId||null,nodeId:state?.nodeId||null,practiceOnly:true,writesMastery:false,writesSrs:false,writesPlanner:false,...extra};
    window.dispatchEvent(new CustomEvent('russian:scenario-practice',{detail}));
  };
  function persist(type='state',extra={}){
    if(state)sessionStorage.setItem(SESSION_KEY,JSON.stringify(state));else sessionStorage.removeItem(SESSION_KEY);
    emit(type,extra); schedule();
  }
  function scenarioById(id){return registry?.scenarios?.find(x=>x.id===id)||null}
  function currentScenario(){return state?scenarioById(state.scenarioId):null}
  function currentNode(){const s=currentScenario();return s&&state?s.nodes?.[state.nodeId]||null:null}
  function validateScenario(s){
    if(!s?.id||!s.startNode||!s.nodes?.[s.startNode])throw new Error('Invalid scenario contract');
    const ids=new Set(Object.keys(s.nodes));
    for(const [id,node] of Object.entries(s.nodes)){
      for(const next of node.next||[])if(!ids.has(next))throw new Error('Dangling scenario edge '+s.id+':'+id+'->'+next);
    }
    return true;
  }
  async function load(){
    if(ready)return registry;
    const res=await fetch('data/scenario-registry.json',{cache:'force-cache'});
    if(!res.ok)throw new Error('Scenario registry unavailable: '+res.status);
    const json=await res.json();
    if(json?.schema!=='RUSSIAN_SCENARIO_REGISTRY_V1'||!Array.isArray(json.scenarios))throw new Error('Scenario registry schema mismatch');
    json.scenarios.forEach(validateScenario);
    registry=json;ready=true;
    if(state&&!scenarioById(state.scenarioId))state=null;
    schedule(); emit('ready',{scenarioCount:json.scenarios.length});
    return registry;
  }
  function start(id){
    const s=scenarioById(id);if(!s)throw new Error('Unknown scenario '+id);
    state={schema:SCHEMA,scenarioId:s.id,nodeId:s.startNode,startedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),history:[s.startNode],repairs:[],completed:false,completion:null};
    persist('start',{family:s.family,stage:s.stage});return clone(state);
  }
  function repair(action){
    const node=currentNode();if(!node)throw new Error('No active scenario node');
    const allowed=node.repairPath||[];if(!allowed.includes(action))throw new Error('Repair action not allowed at current node');
    state.repairs.push({nodeId:state.nodeId,action,at:new Date().toISOString()});state.updatedAt=new Date().toISOString();
    persist('repair',{action});return clone(state);
  }
  function advance(nextId){
    const s=currentScenario(),node=currentNode();if(!s||!node)throw new Error('No active scenario');
    if(node.completion){
      state.completed=true;state.completion=node.completion;state.completedAt=state.updatedAt=new Date().toISOString();
      persist('complete',{completion:node.completion});return clone(state);
    }
    const choices=node.next||[];const next=nextId||choices[0];
    if(!next||!choices.includes(next)||!s.nodes[next])throw new Error('Invalid scenario transition');
    state.nodeId=next;state.history.push(next);state.updatedAt=new Date().toISOString();
    if(s.nodes[next]?.completion){state.completed=true;state.completion=s.nodes[next].completion;state.completedAt=state.updatedAt;}
    persist(state.completed?'complete':'node',{from:node,next});return clone(state);
  }
  function clear(){state=null;persist('clear');return null}
  function resume(){return clone(state)}
  function deterministicRun(id){
    start(id);let guard=0;
    while(state&&!state.completed&&guard++<30){
      const node=currentNode();if(!node)throw new Error('Scenario node disappeared');
      if(node.repairPath?.length)repair(node.repairPath[0]);
      advance();
    }
    if(!state?.completed)throw new Error('Scenario did not terminate deterministically');
    return clone(state);
  }
  const humanize=v=>clean(v).replace(/-/g,' ');
  function panelHtml(){
    if(!registry)return '<section class="ru-scenario-runner" data-ru-scenario-runner="1"><b>Đang tải kịch bản…</b></section>';
    const scenarios=registry.scenarios||[];
    const selected=currentScenario()||scenarios[0];
    const node=currentNode();
    const progress=state&&selected?Math.max(1,state.history?.length||1):0;
    const options=scenarios.map(s=>`<option value="${esc(s.id)}" ${selected?.id===s.id?'selected':''}>${esc(familyLabel[s.family]||s.family)} · ${esc(s.titleVi||s.id)}</option>`).join('');
    const repairButtons=state&&!state.completed?(node?.repairPath||[]).map(a=>`<button type="button" data-ru-scenario-repair="${esc(a)}">${esc(repairLabel[a]||humanize(a))}</button>`).join(''):'';
    const nextButtons=state&&!state.completed&&!node?.completion?(node?.next||[]).map(n=>`<button type="button" class="primary" data-ru-scenario-next="${esc(n)}">Tiếp tục</button>`).join(''):'';
    const startButton=!state||state.scenarioId!==selected?.id?`<button type="button" class="primary" data-ru-scenario-start="${esc(selected?.id||'')}">Bắt đầu kịch bản</button>`:'';
    const restart=state?`<button type="button" data-ru-scenario-start="${esc(selected?.id||'')}">Làm lại</button>`:'';
    const unexpected=node?.unexpectedTurn?`<p class="ru-scenario-unexpected"><b>Tình huống bất ngờ:</b> ${esc(humanize(node.unexpectedTurn))}</p>`:'';
    const status=state?(state.completed?'Đã hoàn thành luyện tập':'Đang luyện'): 'Chưa bắt đầu';
    return `<section class="ru-scenario-runner" data-ru-scenario-runner="1" role="region" aria-label="Kịch bản giao tiếp">
      <header><div><span>RU05 · SCENARIO PRACTICE</span><h3>Kịch bản giao tiếp có nhánh</h3><p>Trạng thái luyện tập tách khỏi điểm/mastery. Refresh trong cùng tab vẫn giữ phiên đang luyện.</p></div><strong>${esc(status)}</strong></header>
      <label>Chọn tình huống<select data-ru-scenario-select>${options}</select></label>
      ${selected?`<div class="ru-scenario-meta"><b>${esc(selected.titleVi||selected.id)}</b><span>${esc(familyLabel[selected.family]||selected.family)} · ${esc(selected.stage||'')} · ${esc(selected.goal||'')}</span></div>`:''}
      ${state?`<div class="ru-scenario-state"><span>Bước ${progress}</span><code>${esc(state.nodeId||'')}</code>${node?.contextRef?`<small>Nguồn ngữ cảnh: ${esc(node.contextRef)}</small>`:''}</div>`:''}
      ${unexpected}
      ${state?.completed?`<p class="ru-scenario-complete">Hoàn thành ở mức <b>practice</b>; không tự ghi mastery.</p>`:''}
      <div class="ru-scenario-actions">${repairButtons}${nextButtons}${startButton}${restart}</div>
    </section>`;
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    let panel=document.querySelector('[data-ru-scenario-runner]');
    if(!activeView()){panel?.remove();return}
    if(!panel){panel=document.createElement('div');panel.dataset.ruScenarioRunner='1';view.prepend(panel)}
    panel.outerHTML=panelHtml();
  }
  function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render()})}
  document.addEventListener('click',e=>{
    const startBtn=e.target.closest?.('[data-ru-scenario-start]');if(startBtn){e.preventDefault();start(startBtn.dataset.ruScenarioStart);return}
    const next=e.target.closest?.('[data-ru-scenario-next]');if(next){e.preventDefault();advance(next.dataset.ruScenarioNext);return}
    const rep=e.target.closest?.('[data-ru-scenario-repair]');if(rep){e.preventDefault();repair(rep.dataset.ruScenarioRepair);return}
  },true);
  document.addEventListener('change',e=>{if(e.target?.matches?.('[data-ru-scenario-select]')){state=null;sessionStorage.removeItem(SESSION_KEY);schedule()}},true);
  document.addEventListener('DOMContentLoaded',()=>{load().catch(err=>{console.warn('Russian scenario runtime load failed',err);ready=true;schedule()});const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false});schedule()});
  window.addEventListener('storage',schedule);
  window.RussianScenarioRuntime={schema:SCHEMA,load,start,repair,advance,clear,resume,deterministicRun,current:()=>({scenario:clone(currentScenario()),node:clone(currentNode()),state:clone(state)}),registry:()=>clone(registry),policy:{sessionStorageOnly:true,practiceOnly:true,writesMastery:false,writesSrs:false,writesPlanner:false}};
})();