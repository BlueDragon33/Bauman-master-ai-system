/* Bauman Math Simulation Source V1
 * Read-only bridge for canonical simulation_content.json and legacy status.
 * Lesson simulations stay inside the lesson flow. Built-in Math Lab is an advanced generic tool, never a lesson fallback.
 */
(function mathSimulationSource(global){
  'use strict';
  const RELEASE='MATH_SIMULATION_SOURCE_V1';
  const CANONICAL='data/simulation_content.json';
  const LEGACY='data/simulations.json';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=170)=>{s=String(s??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
  let canonical={ok:false,records:[],error:null},legacy={ok:false,records:[],error:null},loaded=false;
  function recordsOf(raw){if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;return[]}
  async function one(path){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);const data=await r.json();return{ok:true,data,records:recordsOf(data),error:null}}catch(e){return{ok:false,data:null,records:[],error:String(e?.message||e)}}}
  async function load(){if(loaded)return;[canonical,legacy]=await Promise.all([one(CANONICAL),one(LEGACY)]);loaded=true;decorate()}
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(state().e169Path?.lessonId||state().e129LessonId||$('[data-current-lesson]')?.getAttribute('data-current-lesson')||'')}
  function theoryRecords(){
    const durable=global.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.getPayload?.();
    const sources=[durable,global.DB?.theory_lecture_content];
    for(const raw of sources){
      const arr=Array.isArray(raw)?raw:Array.isArray(raw?.records)?raw.records:Array.isArray(raw?.lessons)?raw.lessons:Array.isArray(raw?.items)?raw.items:[];
      if(arr.length)return arr;
    }
    return [];
  }
  function theoryRecord(){const id=lessonId();return theoryRecords().find(r=>(r.lessonId||r.id)===id)||null}
  function currentMatches(){const id=lessonId(),rec=theoryRecord(),ch=String(rec?.chapterId||state().e129ChapterId||'');return canonical.records.filter(x=>(id&&String(x.lessonId||'')===id)||(!id&&ch&&String(x.chapterId||'')===ch))}
  function embeddedCount(){const rec=theoryRecord();return (rec?.slides||[]).filter(x=>String(x?.role||'').toLowerCase()==='simulation').length}
  function recommendedMode(){
    const rec=theoryRecord(),text=[rec?.title,rec?.lessonTitle,rec?.chapterId,(rec?.tags||[]).join(' '),(rec?.slides||[]).map(x=>`${x.title||''} ${(x.blocks||[]).map(b=>b?.body||b?.text||b?.content||'').join(' ')}`).join(' ')].join(' ').toLocaleLowerCase('vi');
    if(/vector|vectơ|cosine|dot product|tích vô hướng|projection/.test(text))return'vector';
    if(/matrix|ma trận|covariance|hiệp phương sai|pca|svd|rank|hạng|eigen/.test(text))return'matrix';
    return'function';
  }
  function decorate(){
    const side=$('#mathWorkspaceLab .math-ws-lab-side');if(!side)return false;
    let host=$('#mathSimulationSource',side);if(!host){host=document.createElement('section');host.id='mathSimulationSource';host.className='math-sim-source';side.appendChild(host)}
    const matches=currentMatches(),embedded=embeddedCount(),mode=recommendedMode();
    host.innerHTML=`<div class="math-sim-source-head"><b>Nguồn mô phỏng</b><span class="${matches.length?'live':''}"><i></i>${matches.length?'CANONICAL':'ADVANCED TOOL'}</span></div><p>${matches.length?'Đã tìm thấy simulation_content record khớp lesson/chapter.':'Chưa có canonical record cho bài. Mô phỏng học tập dùng semantic slide ngay trong Lesson Player; Math Lab ở đây chỉ là công cụ tổng quát nâng cao.'}</p><div class="math-sim-source-grid"><div><b>${canonical.records.length}</b><span>simulation_content records</span></div><div><b>${embedded}</b><span>embedded simulation slide</span></div><div><b>${legacy.records.length}</b><span>legacy simulations.json</span></div><div><b>${esc(mode)}</b><span>mode gợi ý</span></div></div>${matches.length?`<div class="math-sim-source-records">${matches.slice(0,3).map(x=>`<div class="math-sim-source-record"><b>${esc(x.title||x.simulationId||'Simulation')}</b><span>${esc(clip(x.purpose||'',210))}</span></div>`).join('')}</div>`:''}`;
    return true;
  }
  function openForCurrent(){
    const embedded=embeddedCount();
    if(embedded&&global.BAUMAN_MATH_LEARNING_FLOW?.activate){
      global.BAUMAN_MATH_LEARNING_FLOW.activate('visualize');
      return true;
    }
    return false;
  }
  function bind(){document.addEventListener('click',e=>{if(e.target.closest('[data-math-ws="lab"],[data-math-v2-lab],[data-lf="lab"],[data-lf-step="lab"],[data-math-nav="lab"]'))setTimeout(decorate,90);if(e.target.closest('[data-e129-lesson],[data-e169-pick-activity],[data-math-nav]'))setTimeout(decorate,220)},true)}
  function selfCheck(){return{release:RELEASE,loaded,canonicalPath:CANONICAL,canonicalOk:canonical.ok,canonicalRecords:canonical.records.length,legacyPath:LEGACY,legacyRecords:legacy.records.length,currentMatches:currentMatches().length,embeddedSimulationSlides:embeddedCount(),theorySource:global.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.getPayload?.()?'E240':'DB',sampleRecordUsed:false,recommendedMode:recommendedMode(),academicWrites:false,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathSimulationSource==='1')return;document.body.dataset.mathSimulationSource='1';bind();load();[600,1400,2800].forEach(ms=>setTimeout(decorate,ms));global.BAUMAN_MATH_SIMULATION_SOURCE={release:RELEASE,load,decorate,openForCurrent,recommendedMode,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
