'use strict';
(function(){
  const SCHEMA='RUSSIAN_RU06_PRODUCTION_RUNTIME_V1';
  const STORAGE_KEY='bauman_russian_ru06_production_practice_v1';
  const CACHE='russian-ru06-production-data-v1';
  const SOURCES=['technical-concepts','academic-functions','reading','performance-tasks'];
  const clean=v=>String(v??'').trim();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  let data={technical:[],functions:[],reading:[],tasks:[]},ready=false,loadSource='none';
  let state=readState();

  function readState(){
    try{
      const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      return x&&x.schema===SCHEMA?x:{schema:SCHEMA,target:'R14',drafts:{},updatedAt:null,authority:'PRACTICE_ONLY'};
    }catch(_){return {schema:SCHEMA,target:'R14',drafts:{},updatedAt:null,authority:'PRACTICE_ONLY'}}
  }
  function save(){state.updatedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('russian:ru06-production',{detail:clone(state)}))}
  async function fetchJson(name){
    const url='data/'+name+'.json';
    try{
      const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error('HTTP_'+r.status);
      try{const cache=await caches.open(CACHE);await cache.put(url,r.clone())}catch(_){}
      return {value:await r.json(),source:'network'};
    }catch(error){
      try{const cache=await caches.open(CACHE),hit=await cache.match(url);if(!hit)throw error;return {value:await hit.json(),source:'cache'}}catch(_){return {value:null,source:'unavailable'}}
    }
  }
  async function load(){
    const out={};let cached=false,missing=false;
    for(const n of SOURCES){const r=await fetchJson(n);out[n]=r.value;if(r.source==='cache')cached=true;if(r.source==='unavailable')missing=true}
    data.technical=Array.isArray(out['technical-concepts'])?out['technical-concepts']:[];
    data.functions=Array.isArray(out['academic-functions'])?out['academic-functions']:(out['academic-functions']?.functions||[]);
    data.reading=Array.isArray(out.reading)?out.reading:(out.reading?.items||[]);
    data.tasks=Array.isArray(out['performance-tasks'])?out['performance-tasks']:(out['performance-tasks']?.tasks||[]);
    loadSource=missing?'partial-unavailable':cached?'cache':'network';ready=true;renderSoon();return snapshot();
  }
  function targets(){
    const all=new Set();
    for(const item of [...data.technical,...data.functions,...data.reading,...data.tasks])for(const t of item.targets||[])all.add(t);
    return [...all].sort((a,b)=>Number(a.replace(/\D/g,''))-Number(b.replace(/\D/g,'')));
  }
  function byTarget(items,target){return items.filter(x=>(x.targets||[]).includes(target))}
  function snapshot(){
    return {schema:SCHEMA,loadSource,ready,state:clone(state),counts:{technical:data.technical.length,functions:data.functions.length,reading:data.reading.length,tasks:data.tasks.length},policy:{writesMastery:false,writesSrs:false,writesPlanner:false,officialAssessment:false,unverifiedIsPracticeOnly:true}};
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    const writing=view.querySelector('.writing-studio,.writing-shell,.writing-layout,.writing-main,[data-writing-root],.writing-workspace')||((document.getElementById('pageTitle')?.textContent||'').toLowerCase().includes('viết')?view:null);
    const old=view.querySelector('[data-ru06-production-runtime]');
    if(!writing){old?.remove();return}
    old?.remove();
    const panel=document.createElement('section');panel.dataset.ru06ProductionRuntime='1';panel.className='ru06-production-lab panel';panel.tabIndex=0;panel.setAttribute('aria-label','RU06 Production and Transfer Lab');
    if(!ready){panel.innerHTML='<h3>RU06 Production & Transfer Lab</h3><p>Đang tải dữ liệu học thuật/kỹ thuật…</p>';writing.prepend(panel);return}
    const target=state.target||targets()[0]||'R14',terms=byTarget(data.technical,target).slice(0,12),funcs=byTarget(data.functions,target).slice(0,8),reads=byTarget(data.reading,target).slice(0,4),tasks=byTarget(data.tasks,target).slice(0,4);
    const termHtml=terms.length?terms.map(x=>'<li><b lang="ru">'+esc(x.ru||x.id)+'</b><span>'+esc(x.vi||x.en||'')+'</span><small>'+esc(x.authorityStatus||'UNVERIFIED')+' · '+esc((x.sourceRefs||[]).join(', ')||'no source ref')+'</small></li>').join(''):'<li>Chưa có thuật ngữ cho target này.</li>';
    const fnHtml=funcs.length?funcs.map(x=>'<article><b lang="ru">'+esc(x.ruLabel||x.id)+'</b><span>'+esc(x.vi||'')+'</span><code>'+esc((x.patterns||[])[0]||'')+'</code><small>Practice pattern · provenance must be verified before authority.</small></article>').join(''):'<p>Chưa có academic function cho target này.</p>';
    const readHtml=reads.length?reads.map(x=>'<li><b>'+esc(x.id)+'</b><span>'+esc((x.operations||[]).join(' → '))+'</span><small>Output: '+esc(x.output||'')+'</small></li>').join(''):'<li>Chưa có reading task.</li>';
    const taskHtml=tasks.length?tasks.map(x=>'<li><b>'+esc(x.id)+'</b><span>'+esc(x.mode||'')+'</span><small>Output: '+esc(x.output||'')+'</small></li>').join(''):'<li>Chưa có performance task.</li>';
    panel.innerHTML='<header class="ru06-head"><div><span class="chip">RU06 · ACADEMIC / TECHNICAL / RESEARCH</span><h3>Production & Transfer Lab</h3><p>Concept → term → function → reading → production → transfer. Practice-only; không tự ghi mastery.</p></div><small>'+esc(loadSource)+'</small></header>'+
      '<div class="ru06-target"><label for="ru06Target">Target</label><select id="ru06Target" class="input">'+targets().map(t=>'<option value="'+esc(t)+'" '+(t===target?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>'+
      '<div class="ru06-grid"><section><h4>Technical concepts</h4><ul>'+termHtml+'</ul></section><section><h4>Academic functions</h4><div class="ru06-functions">'+fnHtml+'</div></section><section><h4>Reading operations</h4><ul>'+readHtml+'</ul></section><section><h4>Performance / transfer</h4><ul>'+taskHtml+'</ul></section></div>'+
      '<section class="ru06-draft"><h4>Practice production</h4><textarea class="textarea" data-ru06-draft placeholder="Viết câu/đoạn tiếng Nga dùng thuật ngữ và academic function ở trên…">'+esc(state.drafts[target]||'')+'</textarea><div><button class="btn primary" type="button" data-ru06-save>Lưu draft luyện tập</button><span>Draft local-only · không phải bài nộp chính thức.</span></div></section>';
    writing.prepend(panel);
  }
  let raf=0;function renderSoon(){cancelAnimationFrame(raf);raf=requestAnimationFrame(render)}
  document.addEventListener('change',e=>{if(e.target?.id==='ru06Target'){state.target=e.target.value;save();renderSoon()}});
  document.addEventListener('click',e=>{if(!e.target?.closest?.('[data-ru06-save]'))return;const t=state.target;state.drafts[t]=document.querySelector('[data-ru06-draft]')?.value||'';save();renderSoon()});
  function observe(){
    const view=document.getElementById('view');if(!view)return;
    new MutationObserver(records=>{
      const meaningful=records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>!(n.nodeType===1&&n.matches?.('[data-ru06-production-runtime]'))));
      if(meaningful)renderSoon();
    }).observe(view,{subtree:true,childList:true});
  }
  window.RussianAcademicProduction=Object.freeze({schema:SCHEMA,load,snapshot,setTarget(t){state.target=t;save();renderSoon()},storageKey:STORAGE_KEY});
  const boot=()=>{observe();load()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();