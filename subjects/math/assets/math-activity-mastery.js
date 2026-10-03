/* Bauman Math Activity Evidence V3 · MATH03
 * Legacy filename retained for backward compatibility.
 * Lesson Check is self-report/progress evidence; MATH03 ledger supplies performance evidence.
 * No mastery authority, no independent grading, no academic writes.
 */
(function mathActivityEvidence(global){
  'use strict';
  const RELEASE='MATH_ACTIVITY_EVIDENCE_V3_MATH03';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=0;
  function core(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(core().e186Path?.lessonId||core().e169Path?.lessonId||core().e129LessonId||'')}
  function activity(){return String(core().e186Path?.activityId||core().e169Path?.activityId||core().learnTab||'')}
  function source(){
    const id=lessonId(),flow=global.BAUMAN_MATH_LEARNING_FLOW;
    const check=flow?.checkSummary?.(id)||{items:[],total:0,answered:0,review:0,understood:0,complete:false};
    const lesson=flow?.lessonSnapshot?.(id)||{visitedCount:0,completedAt:0};
    const performance=global.BAUMAN_MATH_REASONING_EVIDENCE?.summaryForLesson?.(id)||{attempts:0,accepted:0,rejected:0,conditional:0,indeterminate:0,dimensions:{}};
    return{id,check,lesson,performance};
  }
  function itemState(item,lesson){
    if(item?.state==='review')return'review';
    if(item?.state==='understood')return'self_reported';
    return Number(lesson?.visitedCount||0)>0?'exposure':'unseen';
  }
  function summary(){
    const {check,lesson,performance}=source(),counts={selfReported:0,exposure:0,review:0,unseen:0};
    const items=(check.items||[]).map(item=>{const evidenceState=itemState(item,lesson);if(evidenceState==='self_reported')counts.selfReported++;else counts[evidenceState]++;return{...item,evidenceState}});
    return{...counts,total:items.length,items,performance,completedAt:Number(lesson?.completedAt||0),masteryAuthority:false};
  }
  function label(state){return state==='self_reported'?'Tự báo đã hiểu':state==='review'?'Cần ôn':state==='exposure'?'Đã tiếp xúc':'Chưa có evidence'}
  function ensureSummary(host){
    let box=$('#mathActivityMastery',host);
    if(!box){box=document.createElement('section');box.id='mathActivityMastery';box.className='math-activity-mastery';const strip=$('.math-activity-source-strip',host);strip?.insertAdjacentElement('afterend',box)}
    if(!box)return;
    const s=summary(),p=s.performance||{},attempts=Number(p.attempts||0),accepted=Number(p.accepted||0),rate=attempts?Math.round(accepted/attempts*100):0;
    const weak=s.items.filter(x=>x.evidenceState==='review'),preview=(weak.length?weak:s.items).slice(0,4);
    box.innerHTML=`<div class="math-am-top"><div><b>Bằng chứng học tập</b><span>${esc(lessonId()||'chưa có lesson')} · self-report ≠ mastery</span></div><strong>${attempts?accepted+'/'+attempts:'—'}</strong></div>
      <div class="math-am-track" aria-label="Tỉ lệ performance pilot đạt"><i style="width:${rate}%"></i></div>
      <div class="math-am-stats">
        <span class="math-am-stat performance"><strong>${accepted}</strong> Performance đạt</span>
        <span class="math-am-stat self-reported"><strong>${s.selfReported}</strong> Tự báo đã hiểu</span>
        <span class="math-am-stat review"><strong>${s.review}</strong> Cần ôn</span>
        <span class="math-am-stat unseen"><strong>${s.unseen}</strong> Chưa có evidence</span>
      </div>
      <div class="math-am-skill-list">${preview.length?preview.map(item=>`<div data-evidence-state="${item.evidenceState}"><span><i></i><b>${esc(item.title||'Mục kiểm tra')}</b><small>${esc(label(item.evidenceState))}</small></span>${item.evidenceState==='review'?'<button type="button" data-am-open-review>Ôn →</button>':''}</div>`).join(''):'<p>Chưa có Lesson Check/evidence đủ dữ liệu. Hệ thống không tự tạo mastery giả.</p>'}</div>`;
  }
  function apply(){const host=$('#mathActivityStudio');if(!host||!document.body.classList.contains('math-activity-studio-active'))return false;$$('.math-am-controls,.math-am-card-state',host).forEach(el=>el.remove());ensureSummary(host);return true}
  function refresh(){clearTimeout(timer);apply();timer=setTimeout(apply,70)}
  function bind(){document.addEventListener('click',e=>{if(e.target.closest('[data-am-open-review]')){e.preventDefault();global.BAUMAN_MATH_NAVIGATION?.route?.('review');return}if(e.target.closest('[data-lf-check-state],[data-lf="complete"],[data-e169-pick-activity],[data-activity-action],[data-math-nav],[data-e129-lesson]'))refresh()},true);document.addEventListener('bauman:math:lesson-completed',refresh);document.addEventListener('bauman:math:evidence-recorded',refresh)}
  function selfCheck(){const s=summary();return{release:RELEASE,ready:!!$('#mathActivityMastery'),lessonId:lessonId()||null,activity:activity()||null,total:s.total,selfReported:s.selfReported,exposure:s.exposure,review:s.review,unseen:s.unseen,performanceAttempts:s.performance?.attempts||0,performanceAccepted:s.performance?.accepted||0,canonicalSource:'BAUMAN_MATH_LEARNING_FLOW.checkSummary',performanceSource:'BAUMAN_MATH_REASONING_EVIDENCE',legacyLocalStorageWrites:false,academicWrites:false,gradingAuthority:false,masteryAuthority:false,selfReportIsMastery:false,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathActivityMastery==='3')return;document.body.dataset.mathActivityMastery='3';bind();[300,800,1600].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_ACTIVITY_MASTERY={release:RELEASE,refresh,apply,selfCheck,summary,resetLesson:()=>false}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
