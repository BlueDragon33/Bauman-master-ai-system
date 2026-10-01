'use strict';
(function(){
  const SCHEMA='RUSSIAN_RU05_SCENARIO_RUNTIME_V1';
  const KEY='bauman_russian_scenario_session_v1';
  const CACHE='russian-scenario-registry-v1';
  const URL='data/scenario-registry.json';
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const now=()=>new Date().toISOString();
  let registry=null,loadSource='none',loadError='';
  let session=readSession();

  function readSession(){
    try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.schema===SCHEMA?x:null}catch(_){return null}
  }
  function saveSession(){
    if(!session){localStorage.removeItem(KEY);return}
    session.updatedAt=now();
    localStorage.setItem(KEY,JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('russian:scenario-session',{detail:clone(session)}));
  }
  function validateRegistry(value){
    if(!value||value.schema!=='RUSSIAN_SCENARIO_REGISTRY_V1'||!Array.isArray(value.scenarios))throw new Error('SCENARIO_REGISTRY_SCHEMA_INVALID');
    const ids=new Set();
    for(const s of value.scenarios){
      if(!s?.id||ids.has(s.id)||!s.startNode||!s.nodes?.[s.startNode])throw new Error('SCENARIO_GRAPH_INVALID:'+clean(s?.id));
      ids.add(s.id);
      const nodeIds=Object.keys(s.nodes),seen=new Set(),stack=[s.startNode];
      let complete=false,repair=false,unexpected=false;
      while(stack.length){
        const id=stack.pop();if(seen.has(id))continue;seen.add(id);
        const node=s.nodes[id];if(!node)throw new Error('SCENARIO_NODE_MISSING:'+s.id+':'+id);
        if(node.completion)complete=true;
        if(Array.isArray(node.repairPath)&&node.repairPath.length)repair=true;
        if(node.unexpectedTurn)unexpected=true;
        for(const next of node.next||[]){if(!s.nodes[next])throw new Error('SCENARIO_EDGE_DANGLING:'+s.id+':'+next);stack.push(next)}
      }
      if(seen.size!==nodeIds.length||!complete||!repair||!unexpected)throw new Error('SCENARIO_GRAPH_INCOMPLETE:'+s.id);
    }
    return value;
  }
  async function load(){
    try{
      const response=await fetch(URL,{cache:'no-cache'});
      if(!response.ok)throw new Error('HTTP_'+response.status);
      registry=validateRegistry(await response.clone().json());loadSource='network';loadError='';
      try{const cache=await caches.open(CACHE);await cache.put(URL,response.clone())}catch(_){}
    }catch(error){
      loadError=clean(error?.message)||'load-failed';
      try{
        const cache=await caches.open(CACHE),response=await cache.match(URL);
        if(!response)throw error;
        registry=validateRegistry(await response.json());loadSource='cache';
      }catch(_){registry=null;loadSource='unavailable'}
    }
    reconcile();renderSoon();return registry;
  }
  function scenarioById(id){return registry?.scenarios?.find(x=>x.id===id)||null}
  function reconcile(){
    if(!session)return;
    const s=scenarioById(session.scenarioId);
    if(!s||!s.nodes?.[session.nodeId]){session=null;saveSession()}
  }
  function start(scenarioId){
    const s=scenarioById(scenarioId);if(!s)return false;
    session={schema:SCHEMA,scenarioId:s.id,nodeId:s.startNode,startedAt:now(),updatedAt:now(),history:[{type:'start',nodeId:s.startNode,at:now()}],completion:'IN_PROGRESS',authority:'PRACTICE_ONLY'};
    saveSession();renderSoon();return true;
  }
  function advance(nextId){
    const s=scenarioById(session?.scenarioId),node=s?.nodes?.[session?.nodeId];if(!s||!node)return false;
    const allowed=node.next||[],target=clean(nextId)||allowed[0];if(!allowed.includes(target))return false;
    session.nodeId=target;session.history.push({type:'advance',nodeId:target,at:now()});
    if(s.nodes[target]?.completion)session.completion='PRACTICE_COMPLETE';
    saveSession();renderSoon();return true;
  }
  function repair(action){
    const s=scenarioById(session?.scenarioId),node=s?.nodes?.[session?.nodeId];if(!s||!node)return false;
    const actions=node.repairPath||[];if(!actions.includes(action))return false;
    session.history.push({type:'repair',action,nodeId:session.nodeId,at:now()});saveSession();
    return advance((node.next||[])[0]||'');
  }
  function reset(){session=null;saveSession();renderSoon()}
  function snapshot(){return {schema:SCHEMA,loadSource,loadError,registry:clone(registry),session:clone(session),policy:{writesMastery:false,writesSrs:false,writesPlanner:false,officialAssessment:false}}}
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function nodeLabel(node,id){
    if(node?.completion)return 'Hoàn tất tình huống';
    if(node?.unexpectedTurn)return 'Tình huống bất ngờ: '+String(node.unexpectedTurn).replace(/-/g,' ');
    return 'Lượt '+String(id||'').replace(/-/g,' ');
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const host=view.querySelector('.dialogue-nine-wrap,.v1295-speech-room,.dialogue-nine-room');
    const old=view.querySelector('[data-ru-scenario-runtime]');
    if(!host){old?.remove();return}
    old?.remove();
    const panel=document.createElement('section');panel.dataset.ruScenarioRuntime='1';panel.className='ru-scenario-runtime panel';panel.setAttribute('aria-label','Luyện tình huống có nhánh');panel.tabIndex=0;
    if(!registry){
      panel.innerHTML='<header><span class="chip">RU05 · SCENARIO</span><h3>Luyện tình huống có nhánh</h3></header><p>Không tải được scenario registry. Hội thoại cơ bản vẫn hoạt động; scenario nâng cao tạm dùng fallback không AI.</p><small data-scenario-source>'+esc(loadSource)+' · '+esc(loadError)+'</small>';
      host.prepend(panel);return;
    }
    const scenarios=registry.scenarios||[],active=scenarioById(session?.scenarioId),node=active?.nodes?.[session?.nodeId];
    const options=scenarios.map(s=>'<option value="'+esc(s.id)+'" '+(active?.id===s.id?'selected':'')+'>'+esc(s.family+' · '+(s.titleVi||s.titleRu||s.id))+'</option>').join('');
    const history=(session?.history||[]).slice(-6).map(x=>'<li>'+esc(x.type+(x.action?' · '+x.action:'')+(x.nodeId?' · '+x.nodeId:''))+'</li>').join('');
    const repairs=(node?.repairPath||[]).map(x=>'<button class="btn soft" type="button" data-scenario-repair="'+esc(x)+'">'+esc(x.replace(/-/g,' '))+'</button>').join('');
    const next=(node?.next||[]).map(x=>'<button class="btn primary" type="button" data-scenario-next="'+esc(x)+'">Tiếp tục → '+esc(x.replace(/-/g,' '))+'</button>').join('');
    panel.innerHTML='<header class="ru-scenario-head"><div><span class="chip">RU05 · SCENARIO RUNTIME</span><h3>Luyện tình huống có nhánh</h3><p>Practice-only · không ghi mastery/SRS/planner.</p></div><small data-scenario-source>'+esc(loadSource)+'</small></header>'+
      '<div class="ru-scenario-picker"><label for="ruScenarioSelect">Tình huống</label><select id="ruScenarioSelect" class="input">'+options+'</select><button class="btn" type="button" data-scenario-start>'+(active?'Bắt đầu lại':'Bắt đầu')+'</button></div>'+
      (active?'<article class="ru-scenario-card"><span>'+esc(active.family+' · '+active.stage)+'</span><h4>'+esc(active.titleVi||active.titleRu||active.id)+'</h4><p><b>Mục tiêu:</b> '+esc(active.goal)+'</p><p data-scenario-node><b>'+esc(nodeLabel(node,session.nodeId))+'</b></p>'+(node?.unexpectedTurn?'<p class="ru-scenario-pressure">⚡ '+esc(node.unexpectedTurn.replace(/-/g,' '))+'</p>':'')+'<div class="ru-scenario-actions">'+repairs+next+(node?.completion?'<button class="btn" type="button" data-scenario-reset>Kết thúc / đổi tình huống</button>':'')+'</div><details><summary>Lịch sử lượt</summary><ol>'+history+'</ol></details></article>':'<p>Chọn một tình huống survival, university, lab/technical, research hoặc defense để luyện phản xạ và repair strategy.</p>');
    host.prepend(panel);
  }
  let raf=0;function renderSoon(){cancelAnimationFrame(raf);raf=requestAnimationFrame(render)}
  document.addEventListener('change',e=>{if(e.target?.id==='ruScenarioSelect'&&session)start(e.target.value)});
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('[data-scenario-start],[data-scenario-next],[data-scenario-repair],[data-scenario-reset]');if(!b)return;
    if(b.hasAttribute('data-scenario-start'))start(document.getElementById('ruScenarioSelect')?.value||registry?.scenarios?.[0]?.id);
    else if(b.hasAttribute('data-scenario-next'))advance(b.dataset.scenarioNext);
    else if(b.hasAttribute('data-scenario-repair'))repair(b.dataset.scenarioRepair);
    else reset();
  });
  function observeView(){
    const view=document.getElementById('view');if(!view)return;
    new MutationObserver(records=>{
      const meaningful=records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>!(n.nodeType===1&&n.matches?.('[data-ru-scenario-runtime]'))));
      if(meaningful)renderSoon();
    }).observe(view,{subtree:true,childList:true});
  }
  window.RussianScenarioRuntime=Object.freeze({schema:SCHEMA,load,start,advance,repair,reset,snapshot,validateRegistry,storageKey:KEY});
  const boot=()=>{observeView();load()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();