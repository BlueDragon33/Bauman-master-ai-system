/* Math learner overview.
 * Decision-first home: Continue Learning → Goal → Roadmap Position → Progress → Weak Points.
 * Reads canonical learning-flow state; never writes academic data or invents mastery.
 */
(function mathLearnerHome(global){
  'use strict';
  const RELEASE='MATH_LEARNER_HOME_V1';
  const VISIT_KEY='bauman_math_dashboard_visits_v1';
  let timer=0,lastLesson='';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function visits(){try{return JSON.parse(localStorage.getItem(VISIT_KEY)||'[]')}catch(_){return []}}
  function saveVisits(list){try{localStorage.setItem(VISIT_KEY,JSON.stringify(list.slice(0,40)))}catch(_){}}
  function currentLesson(){
    const host=$('[data-current-lesson]');
    const id=host?.getAttribute('data-current-lesson')||global.__MATH_STATE?.e129LessonId||'';
    const title=(host?.querySelector('.e169-reader-title h2,h2')||$('.e169-reader-title h2')||$('.e129-placeholder h2'))?.textContent?.trim()||'Chưa chọn bài học';
    return {id,title};
  }
  function recordVisit(){
    const cur=currentLesson();
    if(!cur.id||cur.id===lastLesson)return;
    lastLesson=cur.id;
    let list=visits().filter(x=>x.id!==cur.id);
    list.unshift({id:cur.id,title:cur.title,at:Date.now()});
    saveVisits(list);
  }
  function learningSnapshot(){
    try{return global.BAUMAN_MATH_LEARNING_FLOW?.snapshot?.()||null}catch(_){return null}
  }
  function currentStageLabel(){
    const select=$('#stageSelect');
    return select?.selectedOptions?.[0]?.textContent?.trim()||select?.value||'Giai đoạn hiện tại';
  }

  function ensure(){
    const main=$('.main'),view=$('#view');
    if(!main||!view||$('#mathV2Dashboard'))return;
    const wrap=document.createElement('section');
    wrap.id='mathV2Dashboard';
    wrap.className='math-home';
    wrap.innerHTML=`
      <section class="math-home-primary">
        <article class="math-home-card math-home-continue">
          <span class="math-home-label">TIẾP TỤC HỌC</span>
          <div class="math-home-continue-row">
            <div>
              <h2 id="mathV2LessonTitle">Đang xác định bài học…</h2>
              <p id="mathV2LessonMeta">Reader đang đồng bộ vị trí gần nhất.</p>
            </div>
            <button class="math-v2-continue" type="button" data-math-v2-action="continue">Tiếp tục học →</button>
          </div>
          <div class="math-home-progress" aria-label="Tiến độ bài hiện tại"><i id="mathHomeProgressBar"></i></div>
          <div class="math-home-step"><span id="mathHomeStep">Bước học hiện tại</span><b id="mathHomePct">0%</b></div>
        </article>

        <article class="math-home-card math-home-goal">
          <span class="math-home-label">MỤC TIÊU HIỆN TẠI</span>
          <h3 id="mathHomeGoal">Chọn bài đầu tiên trong lộ trình</h3>
          <p id="mathHomeGoalNote">Hệ thống ưu tiên một bước tiếp theo rõ ràng thay vì mở toàn bộ công cụ cùng lúc.</p>
        </article>
      </section>

      <section class="math-home-secondary">
        <article class="math-home-card math-home-roadmap">
          <div class="math-home-card-head">
            <span class="math-home-label">VỊ TRÍ TRONG LỘ TRÌNH</span>
            <button type="button" data-math-v2-action="roadmap">Xem lộ trình →</button>
          </div>
          <div class="math-home-path">
            <span id="mathHomeStage">Giai đoạn hiện tại</span><i>→</i><span id="mathHomeChapter">Chương đang học</span>
          </div>
        </article>

        <article class="math-home-card math-home-progress-card">
          <span class="math-home-label">TIẾN ĐỘ</span>
          <div class="math-home-metrics">
            <div><b id="mathV2Visited">0</b><span>Bài đã mở</span></div>
            <div><b id="mathHomeStepsDone">0/0</b><span>Bước bài hiện tại</span></div>
          </div>
        </article>

        <article class="math-home-card math-home-review">
          <span class="math-home-label">ÔN ĐIỂM YẾU</span>
          <div id="mathHomeReviewState" class="math-home-empty">
            <b>Chưa có dữ liệu cần ôn.</b>
            <span>Sau Lesson Check, chỉ những điểm yếu có bằng chứng mới xuất hiện ở đây.</span>
          </div>
          <button type="button" data-math-v2-action="review">Mở Ôn tập →</button>
        </article>
      </section>
    `;
    main.insertBefore(wrap,view);
  }

  function update(){
    recordVisit();
    const cur=currentLesson(),snap=learningSnapshot(),list=visits();
    const total=Number(snap?.totalSteps||0),done=Number(snap?.visitedCount||0);
    const stepIndex=Number(snap?.activeStepIndex||1),stepLabel=snap?.activeStepLabel||'Lý thuyết';
    const pct=Math.max(0,Math.min(100,Number(snap?.percent||0)));

    if($('#mathV2LessonTitle')) $('#mathV2LessonTitle').textContent=cur.id?cur.title:'Chưa có bài học đang mở';
    if($('#mathV2LessonMeta')) $('#mathV2LessonMeta').textContent=cur.id?`${cur.id} · Bước ${stepIndex}/${total||'—'} · ${stepLabel}`:'Bắt đầu từ Lộ trình để hệ thống dẫn tới bài phù hợp.';
    if($('#mathHomeProgressBar')) $('#mathHomeProgressBar').style.width=`${pct}%`;
    if($('#mathHomePct')) $('#mathHomePct').textContent=`${pct}%`;
    if($('#mathHomeStep')) $('#mathHomeStep').textContent=`Bước ${stepIndex}/${total||'—'} · ${stepLabel}`;
    if($('#mathV2Visited')) $('#mathV2Visited').textContent=String(list.length);
    if($('#mathHomeStepsDone')) $('#mathHomeStepsDone').textContent=`${done}/${total}`;
    if($('#mathHomeStage')) $('#mathHomeStage').textContent=currentStageLabel();
    if($('#mathHomeChapter')) $('#mathHomeChapter').textContent=snap?.chapterId||'Chương theo Reader hiện tại';
    if($('#mathHomeGoal')) $('#mathHomeGoal').textContent=cur.id?`Hoàn thành ${cur.title}`:'Chọn bài đầu tiên trong lộ trình';
    if($('#mathHomeGoalNote')) $('#mathHomeGoalNote').textContent=cur.id?`Tiếp theo: ${stepLabel}. Công cụ nâng cao chỉ mở khi bước học cần đến.`:'Lộ trình sẽ dẫn tới bài phù hợp, không yêu cầu tự ghép tài nguyên.';
  }

  function action(name){
    if(name==='continue'){global.BAUMAN_MATH_NAVIGATION?.route?.('learn');return;}
    if(name==='roadmap'){global.BAUMAN_MATH_NAVIGATION?.route?.('roadmap');return;}
    if(name==='review'){global.BAUMAN_MATH_NAVIGATION?.route?.('review');return;}
  }
  function bind(){
    document.addEventListener('click',e=>{
      const a=e.target.closest('[data-math-v2-action]');
      if(a){e.preventDefault();action(a.dataset.mathV2Action);return;}
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e169-pick-activity],[data-e129-refresh],[data-lf-step]'))schedule(180);
    },true);
    document.addEventListener('change',e=>{if(e.target?.id==='stageSelect')schedule(100)},true);
  }
  function schedule(ms=120){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function refresh(){ensure();setTimeout(update,40)}
  function selfCheck(){
    return {
      release:RELEASE,
      ready:!!$('#mathV2Dashboard'),
      canonicalProgressSource:!!global.BAUMAN_MATH_LEARNING_FLOW?.snapshot,
      fakeProgress:false,
      advancedToolsOnHome:false,
      mutationObserver:false,
      academicWrites:false
    };
  }
  function init(){
    if(!document.body||document.body.dataset.mathDashboardV2==='1')return;
    document.body.dataset.mathDashboardV2='1';
    bind();refresh();
    [450,1100,2200].forEach(ms=>setTimeout(refresh,ms));
    global.BAUMAN_MATH_DASHBOARD_V2={release:RELEASE,refresh,selfCheck};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
