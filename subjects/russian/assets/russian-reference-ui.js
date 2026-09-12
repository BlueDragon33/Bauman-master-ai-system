'use strict';
(function(){
  const STORAGE_KEY='bauman_russian_v11_clean_skeleton';
  const ROUTES=[
    {keys:['bảng chữ','bang chu','cyrillic','chữ cái','chu cai','viết','viet'],label:'Bảng chữ cái & luyện viết',route:{view:'writing',mode:'handwriting'}},
    {keys:['phát âm','phat am','pronunciation','shadow','nói','noi'],label:'Phát âm & luyện nói',route:{view:'dialogue'}},
    {keys:['từ vựng','tu vung','vocab','слово','привет'],label:'Từ vựng',route:{view:'vocab'}},
    {keys:['ngữ pháp','ngu phap','grammar','падеж','падежи','cách'],label:'Ngữ pháp',route:{view:'grammar'}},
    {keys:['nghe','audio','video','слуш'],label:'Nghe hiểu & Video/Audio',route:{view:'media'}},
    {keys:['đọc','doc','lý thuyết','ly thuyet','bài học','bai hoc'],label:'Bài học/Lý thuyết',route:{view:'learning',learnTab:'theory'}},
    {keys:['bài tập','bai tap','exercise'],label:'Bài tập',route:{view:'learning',learnTab:'exercises'}},
    {keys:['ôn','on tap','review'],label:'Ôn tập',route:{view:'learning',learnTab:'review'}},
    {keys:['kiểm tra','kiem tra','test','exam'],label:'Kiểm tra',route:{view:'learning',learnTab:'exam'}},
    {keys:['mind','sơ đồ','so do'],label:'Mind map',route:{view:'mindmap'}},
    {keys:['dữ liệu','du lieu','json','lưu trữ','luu tru'],label:'Kho dữ liệu',route:{view:'storage'}}
  ];
  const SKILLS=[
    ['АБ','Bảng chữ Cyrillic','Nhìn · viết','writing','#3f8cff',22],
    ['◉','Phát âm','Nghe và nói','dialogue','#a879ff',18],
    ['▣','Từ vựng','Mở thẻ nhớ','vocab','#34d7a0',16],
    ['▤','Ngữ pháp','Nền tảng','grammar','#ff7089',14],
    ['◌','Giao tiếp','Hội thoại','dialogue','#e9b64e',17],
    ['◍','Nghe hiểu','Audio & Video','media','#31c8e5',18],
    ['▥','Luyện đọc','Bài học','learning','#7288ff',13],
    ['⌘','Mind map','Neo trí nhớ','mindmap','#b177ff',12]
  ];

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(_){return {}}
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function routeClick(route){
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.route=JSON.stringify(route||{});
    btn.hidden=true;
    document.body.appendChild(btn);
    btn.click();
    setTimeout(()=>btn.remove(),0);
  }
  function stageMeta(stage){
    const map={vn:['A1',18],prep:['A2',34],hk1:['B1',50],hk2:['B2',68],hk3:['C1',84],hk4:['C1+',96],all:['A1→C1',50]};
    return map[stage]||map.vn;
  }
  function progressMeta(state){
    const test=state.testSession||{};
    const answered=Math.max(0,Number(test.answered||0));
    const target=Math.max(1,Number(test.targetQuestions||100));
    const correct=Math.max(0,Number(test.correct||0));
    const reviewDone=Object.keys(state.reviewProgress?.done||{}).length;
    const reviewWrong=Object.keys(state.reviewProgress?.wrong||{}).length;
    const exams=Object.values(state.examProgress?.paperResults||{}).filter(Boolean);
    const passed=exams.filter(x=>x&&x.passed).length;
    const recent=(state.recentAccess||[]).length;
    const raw=Math.round(Math.min(1,(answered/target)*.55+Math.min(reviewDone,20)/20*.25+Math.min(recent,6)/6*.10+Math.min(passed,4)/4*.10)*100);
    return {percent:raw,answered,correct,reviewDone,reviewWrong,passed,recent};
  }
  function latestRoute(state){
    const recent=Array.isArray(state.recentAccess)?state.recentAccess[0]:null;
    if(recent?.view)return {view:recent.view,learnTab:recent.view==='learning'?(state.learnTab||'theory'):undefined};
    return {view:'learning',learnTab:'theory'};
  }
  function skillHtml(state){
    const p=progressMeta(state).percent;
    return SKILLS.map((s,i)=>{
      const [ico,title,sub,view,color,base]=s;
      const val=Math.max(6,Math.min(100,base+Math.round(p*(.22+i*.012))));
      const route=view==='learning'?{view,learnTab:'theory'}:{view};
      return `<button class="ru-skill-card" style="--skill:${color};--p:${val}%" data-route='${esc(JSON.stringify(route))}'><span class="ico">${ico}</span><b>${esc(title)}</b><span>${esc(sub)}</span><div class="mini-progress"><i></i></div></button>`;
    }).join('');
  }
  function dashboardHtml(){
    const st=readState();
    const p=progressMeta(st);
    const [cefr,cefrPct]=stageMeta(st.stage||'vn');
    const route=latestRoute(st);
    const recent=(st.recentAccess||[])[0];
    const recentLabel=recent?.label||'Bài học hiện tại';
    const recentStage=recent?.stage||st.stage||'vn';
    const achievements=[
      ['🔥',p.recent?`${p.recent} lượt`:'Bắt đầu','Duy trì'],
      ['★',p.reviewDone?`${p.reviewDone} câu`:'Ôn tập','Hoàn thành'],
      ['▣',p.answered?`${p.answered} câu`:'Bài học','Đã làm'],
      ['◉',p.correct?`${p.correct} đúng`:'Nghe/Nói','Luyện tập'],
      ['♛',p.passed?`${p.passed} đề`:'Mục tiêu','Đạt chuẩn']
    ];
    return `<section class="ru-dashboard-enhancer" data-ru-dashboard="1">
      <div class="ru-section-title"><h3>Chọn nội dung học</h3><small>Đi thẳng vào kỹ năng cần luyện →</small></div>
      <div class="ru-skill-grid">${skillHtml(st)}</div>
      <div class="ru-dashboard-middle">
        <article class="ru-continue-card"><header><b>Tiếp tục học</b><span>Điểm gần nhất</span></header><div class="ru-continue-body"><div class="ru-continue-visual"></div><div class="ru-continue-copy"><span class="ru-cefr-pill">${esc(cefr)} · ${esc(recentStage.toUpperCase())}</span><b>${esc(recentLabel)}</b><p>Quay lại đúng điểm bạn vừa học và tiếp tục theo tiến độ đã lưu.</p><button data-route='${esc(JSON.stringify(route))}'>▶ Tiếp tục học →</button></div></div></article>
        <article class="ru-next-card"><header><b>Bài học tiếp theo</b><span>Gợi ý theo lộ trình</span></header><div class="ru-next-content"><div class="ru-next-thumb"></div><div><span class="ru-cefr-pill">${esc(cefr)} · Lộ trình</span><b>Học theo lịch hôm nay</b><p>Mở đúng chặng học đã được điều phối theo giai đoạn hiện tại.</p><button data-act="route-modal">Xem lịch →</button></div></div></article>
      </div>
      <div class="ru-dashboard-bottom">
        <article class="ru-progress-card"><div class="ru-card-head"><b>Tiến độ tổng quan</b><small>Từ dữ liệu học đã lưu</small></div><div class="ru-progress-content"><div class="ru-donut" style="--v:${p.percent}"><b>${p.percent}%</b><small>hoàn thành</small></div><div class="ru-progress-lines"><span>Ôn tập đã xong <b>${p.reviewDone} câu</b></span><span>Câu kiểm tra đã làm <b>${p.answered}</b></span><span>Đề đã đạt <b>${p.passed}</b></span><span>Cần sửa <b>${p.reviewWrong} câu</b></span></div></div><div class="ru-cefr-strip"><span class="ru-cefr-pill">${esc(cefr)}</span><span>Hướng tới C1</span><div class="ru-cefr-track" style="--cefr:${cefrPct}%"><i></i></div></div></article>
        <article class="ru-achievement-card"><div class="ru-card-head"><b>Thành tựu gần đây</b><small>Không dùng số liệu giả</small></div><div class="ru-achievements">${achievements.map(a=>`<article><span class="ru-badge">${a[0]}</span><b>${esc(a[1])}</b><span>${esc(a[2])}</span></article>`).join('')}</div></article>
        <article class="ru-schedule-card"><div class="ru-card-head"><b>Lịch học hôm nay</b><button class="btn soft" data-act="route-modal">Xem tất cả →</button></div><div class="ru-schedule-list"><button data-route='{"view":"media"}'><i></i><span>Khởi động</span><b>Video/Audio mở tai</b></button><button data-route='{"view":"dialogue"}'><i></i><span>Nghe/Nói</span><b>Nhại & đóng vai</b></button><button data-route='{"view":"vocab"}'><i></i><span>Phụ trợ</span><b>Từ/cụm dùng ngay</b></button><button data-route='{"view":"learning","learnTab":"review"}'><i></i><span>Cuối buổi</span><b>Ôn lỗi trọng điểm</b></button></div></article>
      </div>
    </section>`;
  }

  function enhanceOverview(){
    const view=document.getElementById('view');
    if(!view)return;
    const isOverview=!!view.querySelector('.overview-v128');
    document.body.classList.toggle('ru-is-overview',isOverview);
    if(!isOverview)return;
    if(view.querySelector('[data-ru-dashboard="1"]'))return;
    const host=view.querySelector('.overview-v128');
    const hero=host?.querySelector('.overview-top-only-hero');
    if(!host||!hero)return;
    hero.insertAdjacentHTML('afterend',dashboardHtml());
  }
  function syncProgress(){
    const dash=document.querySelector('[data-ru-dashboard="1"]');
    if(!dash)return;
    const fresh=document.createElement('div');
    fresh.innerHTML=dashboardHtml();
    const next=fresh.firstElementChild;
    if(next)dash.replaceWith(next);
  }
  function updateRailVisibility(){
    const rail=document.getElementById('russianRightRail');
    if(!rail)return;
    const title=document.getElementById('pageTitle')?.textContent||'';
    rail.dataset.viewTitle=title;
  }
  function routeMatches(q){
    q=q.trim().toLowerCase();
    if(!q)return ROUTES.slice(0,5);
    return ROUTES.filter(x=>x.keys.some(k=>k.includes(q)||q.includes(k))).slice(0,7);
  }
  function bindSearch(){
    const input=document.getElementById('russianGlobalSearch');
    const hints=document.getElementById('russianSearchHints');
    if(!input||!hints)return;
    const paint=()=>{
      const matches=routeMatches(input.value);
      hints.innerHTML=matches.map((m,i)=>`<button type="button" data-ru-search-index="${i}">${esc(m.label)}</button>`).join('');
      hints.classList.toggle('hidden',!input.value.trim()||!matches.length);
      Array.from(hints.querySelectorAll('button')).forEach((b,i)=>b.addEventListener('click',()=>{routeClick(matches[i].route);input.value='';hints.classList.add('hidden')}));
    };
    input.addEventListener('input',paint);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){const m=routeMatches(input.value)[0];if(m){routeClick(m.route);input.value='';hints.classList.add('hidden')}}if(e.key==='Escape')hints.classList.add('hidden')});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}});
    document.addEventListener('click',e=>{if(!e.target.closest('.ru-global-search-wrap'))hints.classList.add('hidden')});
  }
  function bindRailAi(){
    const input=document.getElementById('ruRailAiPrompt');
    const send=document.getElementById('ruRailAiSend');
    if(!input||!send)return;
    const run=()=>{
      const text=input.value.trim();
      const ai=document.getElementById('aiBtn');
      if(!ai)return;
      ai.click();
      if(!text)return;
      setTimeout(()=>{
        const prompt=document.getElementById('aiPrompt');
        if(prompt){prompt.value=text;prompt.dispatchEvent(new Event('input',{bubbles:true}));}
        const go=document.querySelector('[data-act="ai-run"]');
        if(go)go.click();
      },80);
    };
    send.addEventListener('click',run);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}});
  }
  function observeView(){
    const view=document.getElementById('view');
    if(!view)return;
    let queued=false;
    const run=()=>{queued=false;enhanceOverview();updateRailVisibility()};
    const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(run)});
    observer.observe(view,{childList:true,subtree:false});
    run();
    window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY)syncProgress()});
  }
  function init(){
    bindSearch();
    bindRailAi();
    observeView();
    document.body.classList.add('ru-reference-ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
