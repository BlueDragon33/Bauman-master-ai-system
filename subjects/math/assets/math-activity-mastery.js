/* Bauman Math Activity Mastery V2
 * Read-only learner mastery projection from the canonical Lesson Check state.
 * No second localStorage key, no independent grading, no academic writes.
 */
(function mathActivityMastery(global){
  'use strict';
  const RELEASE='MATH_ACTIVITY_MASTERY_V2_LESSON_CHECK_SOURCE';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=0;

  function core(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(core().e186Path?.lessonId||core().e169Path?.lessonId||core().e129LessonId||'')}
  function activity(){return String(core().e186Path?.activityId||core().e169Path?.activityId||core().learnTab||'')}
  function source(){
    const id=lessonId();
    const flow=global.BAUMAN_MATH_LEARNING_FLOW;
    const check=flow?.checkSummary?.(id)||{items:[],total:0,answered:0,review:0,understood:0,complete:false};
    const lesson=flow?.lessonSnapshot?.(id)||{visitedCount:0,completedAt:0};
    return{id,check,lesson};
  }
  function itemState(item,lesson){
    if(item?.state==='review')return'review';
    if(item?.state==='understood')return Number(lesson?.completedAt||0)>0?'mastered':'forming';
    return Number(lesson?.visitedCount||0)>0?'forming':'unseen';
  }
  function summary(){
    const {check,lesson}=source();
    const counts={mastered:0,forming:0,review:0,unseen:0};
    const items=(check.items||[]).map(item=>{const state=itemState(item,lesson);counts[state]++;return{...item,masteryState:state}});
    const total=items.length;
    return{...counts,total,items,completedAt:Number(lesson?.completedAt||0)};
  }
  function label(state){return state==='mastered'?'Đã chắc':state==='review'?'Cần ôn':state==='forming'?'Đang hình thành':'Chưa học'}
  function ensureSummary(host){
    let box=$('#mathActivityMastery',host);
    if(!box){
      box=document.createElement('section');
      box.id='mathActivityMastery';
      box.className='math-activity-mastery';
      const strip=$('.math-activity-source-strip',host);
      strip?.insertAdjacentElement('afterend',box);
    }
    if(!box)return;
    const s=summary();
    const pct=s.total?Math.round(s.mastered/s.total*100):0;
    const weak=s.items.filter(x=>x.masteryState==='review');
    const preview=(weak.length?weak:s.items).slice(0,4);
    box.innerHTML=`<div class="math-am-top"><div><b>Mastery theo Lesson Check</b><span>${esc(lessonId()||'chưa có lesson')} · một nguồn trạng thái</span></div><strong>${s.total?pct+'%':'—'}</strong></div>
      <div class="math-am-track"><i style="width:${pct}%"></i></div>
      <div class="math-am-stats">
        <span class="math-am-stat mastered"><strong>${s.mastered}</strong> Đã chắc</span>
        <span class="math-am-stat forming"><strong>${s.forming}</strong> Đang hình thành</span>
        <span class="math-am-stat review"><strong>${s.review}</strong> Cần ôn</span>
        <span class="math-am-stat unseen"><strong>${s.unseen}</strong> Chưa học</span>
      </div>
      <div class="math-am-skill-list">${preview.length?preview.map(item=>`<div data-mastery-state="${item.masteryState}"><span><i></i><b>${esc(item.title||'Mục kiểm tra')}</b><small>${esc(label(item.masteryState))}</small></span>${item.masteryState==='review'?'<button type="button" data-am-open-review>Ôn →</button>':''}</div>`).join(''):'<p>Chưa có Lesson Check đủ dữ liệu để dựng mastery. Hệ thống không tự tạo skill giả.</p>'}</div>`;
  }
  function apply(){
    const host=$('#mathActivityStudio');
    if(!host||!document.body.classList.contains('math-activity-studio-active'))return false;
    $$('.math-am-controls,.math-am-card-state',host).forEach(el=>el.remove());
    ensureSummary(host);
    return true;
  }
  function refresh(){clearTimeout(timer);apply();timer=setTimeout(apply,70)}
  function bind(){
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-am-open-review]')){e.preventDefault();global.BAUMAN_MATH_NAVIGATION?.route?.('review');return;}
      if(e.target.closest('[data-lf-check-state],[data-lf="complete"],[data-e169-pick-activity],[data-activity-action],[data-math-nav],[data-e129-lesson]'))refresh();
    },true);
    document.addEventListener('bauman:math:lesson-completed',refresh);
  }
  function selfCheck(){
    const s=summary();
    return{release:RELEASE,ready:!!$('#mathActivityMastery'),lessonId:lessonId()||null,activity:activity()||null,total:s.total,mastered:s.mastered,forming:s.forming,review:s.review,unseen:s.unseen,canonicalSource:'BAUMAN_MATH_LEARNING_FLOW.checkSummary',legacyLocalStorageWrites:false,academicWrites:false,gradingAuthority:false,mutationObserver:false};
  }
  function init(){
    if(!document.body||document.body.dataset.mathActivityMastery==='2')return;
    document.body.dataset.mathActivityMastery='2';
    bind();
    [300,800,1600].forEach(ms=>setTimeout(refresh,ms));
    global.BAUMAN_MATH_ACTIVITY_MASTERY={release:RELEASE,refresh,apply,selfCheck,resetLesson:()=>false};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
