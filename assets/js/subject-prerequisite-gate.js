'use strict';
(function(){
  const KEY='baumanAdaptiveLearningV1';
  const map={
    ai:['python','linear-algebra','probability-statistics'],
    signal:['python','probability-statistics'],
    systems:['probability-statistics'],
    research:['python','probability-statistics'],
    foundation:[],
    programming:[]
  };
  const subject=location.pathname.match(/\/subjects\/([^/]+)\//)?.[1]||'';
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}}
  function ok(c){return['FUNCTIONAL','MASTERED','BAUMAN_READY'].includes(c?.state)}
  function render(){const req=map[subject]||[];if(!req.length)return;const c=state().competencies||{},missing=req.filter(id=>!ok(c[id]));let box=document.getElementById('subjectPrereqGate');if(!box){box=document.createElement('div');box.id='subjectPrereqGate';box.className='subject-prereq-gate';(document.querySelector('.main')||document.body).prepend(box)}if(!missing.length){box.innerHTML='<b>✓ Prerequisite gate</b><span>Nền cốt lõi hiện ở mức Functional trở lên.</span>';box.dataset.ready='1';return}box.dataset.ready='0';box.innerHTML=`<b>⚠ Prerequisite gate</b><span>Chưa nên học sâu phần nâng cao trước khi phục hồi: ${missing.join(', ')}.</span><small>Không khóa cứng nội dung. Bạn vẫn có thể xem trước, nhưng Mastery nâng cao sẽ không được coi là đáng tin nếu prerequisite còn ZERO/Dormant.</small>`}
  function style(){const s=document.createElement('style');s.textContent='.subject-prereq-gate{margin:10px 16px;padding:10px 12px;border-radius:12px;border:1px solid rgba(185,120,25,.28);background:rgba(255,244,215,.82);display:grid;gap:4px}.subject-prereq-gate[data-ready="1"]{border-color:rgba(30,130,85,.25);background:rgba(224,248,236,.75)}.subject-prereq-gate small{opacity:.72}';document.head.appendChild(s)}
  function init(){style();render();window.addEventListener('storage',e=>{if(e.key===KEY)render()});setInterval(render,15000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
