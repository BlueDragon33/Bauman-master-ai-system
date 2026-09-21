'use strict';
(function(){
  const STORAGE_KEY=window.SUBJECT_ADAPTER?.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const NAV_META={
    overview:['⌂','Tổng quan'],
    learning:['▤','Bài học'],
    media:['◉','Nghe & Nói'],
    writing:['✎','Luyện chữ'],
    vocab:['▣','Từ vựng'],
    grammar:['▥','Ngữ pháp'],
    dialogue:['◌','Hội thoại'],
    mindmap:['◇','Sơ đồ nhớ'],
    storage:['⚙','Dữ liệu']
  };
  const TAB_INTRO={
    learning:['BÀI HỌC','Học theo từng bài, hiểu gọn và luyện ngay','Lý thuyết · Bài tập · Nghe/Nói · Ôn tập · Kiểm tra',['Theo bài','Có kiểm tra','Giữ tiến độ']],
    media:['NGHE & NÓI','Mở tai trước, nhại đúng nhịp, nói lại ngay','Video/Audio làm đầu vào; hội thoại và shadowing là đầu ra.',['Nghe thật','Nhại câu','Phản xạ']],
    dialogue:['HỘI THOẠI','Luyện phản xạ trong tình huống thật','Chọn bối cảnh, nghe mẫu, đổi vai và nói lại theo tốc độ của bạn.',['Đổi vai','Shadowing','Tình huống']],
    writing:['LUYỆN CHỮ','Nhận diện mặt chữ, nghe tên chữ và viết đúng nét','Từ chữ in đến chữ viết tay; vừa nghe, vừa nhận diện, vừa luyện viết.',['33 chữ','Nghe + viết','Chữ tay']],
    vocab:['TỪ VỰNG','Nhớ từ bằng ngữ cảnh và hình dung, không học danh sách khô','Tập trung từ/cụm dùng được ngay, có phát âm và ví dụ thực tế.',['Theo chủ đề','Flashcard','Ôn cách quãng']],
    grammar:['NGỮ PHÁP','Hiểu cấu trúc qua câu dùng thật','Quy tắc ngắn, ví dụ rõ, lỗi thường gặp và bài tập nhỏ.',['Cốt lõi','Ví dụ','Bài tập']],
    mindmap:['SƠ ĐỒ NHỚ','Nhìn một lần để thấy mối liên hệ','Dùng sơ đồ để nối âm, từ, cấu trúc và lộ trình ôn tập.',['Trực quan','Nối ý','Ôn nhanh']],
    storage:['DỮ LIỆU','Kho nguồn học tập và công cụ quản lý','Khu kỹ thuật phục vụ dữ liệu; không chen vào luồng học hằng ngày.',['Nguồn học','Khôi phục','Xuất/Nhập']]
  };
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function state(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(_){return {}}}
  function metrics(){
    const st=state(),test=st.testSession||{};
    const answered=Math.max(0,Number(test.answered||0)),target=Math.max(1,Number(test.targetQuestions||100));
    const correct=Math.max(0,Math.min(answered,Number(test.correct||0)));
    const reviewDone=Object.keys(st.reviewProgress?.done||{}).length;
    const reviewWrong=Object.keys(st.reviewProgress?.wrong||{}).length;
    const exams=Object.values(st.examProgress?.paperResults||{}).filter(Boolean);
    const passed=exams.filter(x=>x&&x.passed).length;
    const recent=Array.isArray(st.recentAccess)?st.recentAccess.length:0;
    const percent=Math.round(Math.min(1,(answered/target)*.55+Math.min(reviewDone,20)/20*.25+Math.min(recent,6)/6*.10+Math.min(passed,4)/4*.10)*100);
    return {st,answered,target,correct,reviewDone,reviewWrong,passed,recent,percent};
  }
  function stageLabel(st){
    const map={vn:['A1','Khởi động'],prep:['A2','Dự bị'],hk1:['B1','Học thuật'],hk2:['B2','Học thuật'],hk3:['C1','Nghiên cứu'],hk4:['C1+','Bảo vệ'],all:['A1→C1','Tổng hợp']};
    return map[st.stage||'vn']||map.vn;
  }
  function upgradeBrand(){
    document.body.classList.add('ru-future-ui');
    const title=document.getElementById('subjectTitle'),sub=document.getElementById('subjectSubtitle');
    if(title)title.textContent='Tiếng Nga';
    if(sub)sub.textContent='Nghe • Nói • Đọc • Viết';
    const cap=document.querySelector('.ru-brand-caption');if(cap)cap.textContent='MỞ MỘT NGÔN NGỮ · MỞ RỘNG THẾ GIỚI';
    const quote=document.querySelector('.ru-sidebar-quote');
    if(quote)quote.innerHTML='<span>“Язык открывает новый мир”</span><small>Một ngôn ngữ mới mở ra một thế giới mới.</small>';
    const core=document.getElementById('coreLabel');if(core)core.textContent='TIẾNG NGA · HỌC MỖI NGÀY';
    const search=document.getElementById('russianGlobalSearch');
    if(search){search.placeholder='Tìm bài học, từ vựng, ngữ pháp...';search.setAttribute('aria-label','Tìm trong site Tiếng Nga')}
    document.querySelectorAll('#nav button[data-view]').forEach(btn=>{
      const meta=NAV_META[btn.dataset.view];if(!meta)return;
      const b=btn.querySelector('b'),span=btn.querySelector('span');if(b)b.textContent=meta[0];if(span)span.textContent=meta[1];
    });
  }
  function heroHtml(){
    return '<div class="rf-hero"><span class="rf-hero-eyebrow">KHÁM PHÁ TIẾNG NGA TỪ ÂM THANH ĐẾN GIAO TIẾP</span><h2>Học tiếng Nga <em>dễ hiểu</em> và cuốn hút</h2><p>Bắt đầu từ phát âm chuẩn, nhận diện chữ cái, mở rộng từ vựng qua ngữ cảnh, nắm ngữ pháp cốt lõi và luyện viết từng bước.</p><div class="rf-hero-pills"><span>🎙 Phát âm chuẩn</span><span>▧ Học trực quan</span><span>◉ Thực hành hằng ngày</span><span>✓ Tiến bộ rõ ràng</span></div></div><div class="rf-skyline" aria-hidden="true"><i class="rf-tower t1"></i><i class="rf-tower t2"></i><i class="rf-tower t3"></i><i class="rf-tower t4"></i><i class="rf-tower t5"></i></div><button class="rf-hero-cta" data-act="route-modal">Mở lịch học hôm nay →</button>';
  }
  function module(route,cls,ico,title,sub,items){
    return '<button class="rf-module-card '+cls+'" data-route=\''+esc(JSON.stringify(route))+'\'><div class="rf-module-head"><span class="rf-module-icon">'+ico+'</span><div><h4>'+esc(title)+'</h4><p>'+esc(sub)+'</p></div></div><ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></button>';
  }
  function dashboardHtml(){
    const m=metrics(),sl=stageLabel(m.st);
    const pct=Math.max(0,Math.min(100,m.percent));
    const steps=[
      ['1','Làm quen âm','#3177f5'],['2','Bảng chữ cái & viết','#4caaf0'],['3','Từ vựng cơ bản','#18b88a'],
      ['4','Ngữ pháp nền','#f29a32'],['5','Hội thoại thực tế','#eb5d8e'],['6','Tự tin giao tiếp','#7457ee']
    ];
    return '<section class="ru-dashboard-enhancer rf-dashboard" data-ru-dashboard="1">'+
      '<div class="rf-progress-strip">'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">'+esc(sl[0])+'</span><div class="rf-progress-copy"><span>Trình độ hiện tại</span><b>'+esc(sl[1])+' ('+esc(sl[0])+')</b><i style="--rf-p:'+pct+'%"></i></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">✓</span><div class="rf-progress-copy"><span>Ôn tập đã hoàn thành</span><b>'+m.reviewDone+' câu</b></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">◉</span><div class="rf-progress-copy"><span>Câu kiểm tra đã làm</span><b>'+m.answered+' / '+m.target+'</b></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">★</span><div class="rf-progress-copy"><span>Đề đã đạt</span><b>'+m.passed+' đề</b></div></article>'+
      '</div>'+
      '<div class="rf-module-grid">'+
        module({view:'media'},'rf-module-listen','◉','Nghe & Nói','Làm quen âm thanh, phát âm chuẩn',['Nghe theo chủ đề','Nhại và shadowing','Chuyển sang hội thoại'])+
        module({view:'writing',mode:'handwriting'},'rf-module-alpha','Ая','Bảng chữ cái','Nhận diện và viết đúng nét',['33 chữ cái tiếng Nga','Nghe tên chữ và âm','Chữ in & chữ viết tay'])+
        module({view:'vocab'},'rf-module-vocab','▣','Từ vựng','Học qua ngữ cảnh, dễ nhớ',['Từ/cụm theo chủ đề','Flashcard thông minh','Ví dụ dùng thực tế'])+
        module({view:'grammar'},'rf-module-grammar','▥','Ngữ pháp','Hiểu đơn giản, dùng được ngay',['Quy tắc cốt lõi','Ví dụ trực quan','Bài tập ngắn'])+
        module({view:'writing',mode:'handwriting'},'rf-module-write','✎','Luyện chữ','Viết đẹp từ những nét đầu tiên',['Hướng dẫn từng nét','Nghe + viết','Tự luyện trên canvas'])+
      '</div>'+
      '<div class="rf-dashboard-lower">'+
        '<article class="rf-dashboard-card"><div class="rf-card-head"><div><h4>Hôm nay học gì?</h4><span>Ba việc ngắn, đúng ưu tiên nghe → nói → viết</span></div><button class="rf-link" data-act="route-modal">Xem lịch →</button></div><div class="rf-today-list">'+
          '<div class="rf-today-task"><span>1</span><div><b>Mở tai với Video/Audio</b><small>Nghe một đoạn ngắn và bắt nhịp âm.</small></div><button data-route=\'{"view":"media"}\'>Bắt đầu</button></div>'+
          '<div class="rf-today-task"><span>2</span><div><b>Hội thoại phản xạ</b><small>Nghe mẫu, nhại và đổi vai.</small></div><button data-route=\'{"view":"dialogue"}\'>Bắt đầu</button></div>'+
          '<div class="rf-today-task"><span>3</span><div><b>Luyện chữ Cyrillic</b><small>Nhìn chữ, nghe tên và viết lại.</small></div><button data-route=\'{"view":"writing","mode":"handwriting"}\'>Bắt đầu</button></div>'+
        '</div></article>'+
        '<article class="rf-dashboard-card"><div class="rf-card-head"><div><h4>Phát âm nhanh</h4><span>Nghe và nhại theo từng từ</span></div><button class="rf-link" data-route=\'{"view":"vocab"}\'>Xem thêm →</button></div><div class="rf-pron-grid">'+
          [['спасибо','spa-see-ba'],['привет','pri-vyet'],['хлеб','khlyep'],['замок','za-MOK']].map(x=>'<div class="rf-pron-word"><b>'+x[0]+'</b><small>['+x[1]+']</small><button type="button" data-rf-speak="'+x[0]+'" aria-label="Nghe '+x[0]+'">🔊</button></div>').join('')+
        '</div></article>'+
        '<article class="rf-dashboard-card"><div class="rf-card-head"><div><h4>Tiến độ hiện tại</h4><span>Dữ liệu thật đã lưu</span></div><button class="rf-link" data-route=\'{"view":"learning","learnTab":"review"}\'>Ôn tập →</button></div><div class="rf-week-wrap"><div class="rf-week-ring" style="--v:'+pct+'"><b>'+pct+'%</b></div><div class="rf-week-lines"><span>Đã ôn <b>'+m.reviewDone+'</b></span><span>Đã làm <b>'+m.answered+'</b></span><span>Trả lời đúng <b>'+m.correct+'</b></span><span>Cần sửa <b>'+m.reviewWrong+'</b></span></div></div></article>'+
        '<article class="rf-dashboard-card rf-roadmap"><div class="rf-card-head"><div><h4>Lộ trình kỹ năng</h4><span>Từ âm thanh đến giao tiếp</span></div><button class="rf-link" data-act="route-modal">Mở lịch chi tiết →</button></div><div class="rf-roadmap-track">'+steps.map(s=>'<div class="rf-road-step"><i style="--step:'+s[2]+'">'+s[0]+'</i><b>'+s[1]+'</b></div>').join('')+'</div></article>'+
      '</div>'+
    '</section>';
  }
  function upgradeOverview(){
    const host=document.querySelector('.overview-v128');if(!host)return;
    const hero=host.querySelector('.overview-top-only-hero');
    if(hero&&!hero.querySelector('.rf-hero'))hero.innerHTML=heroHtml();
    const dash=host.querySelector('[data-ru-dashboard="1"]');
    if(dash&&!dash.classList.contains('rf-dashboard'))dash.outerHTML=dashboardHtml();
  }
  function currentView(){
    const active=document.querySelector('#nav button.active[data-view]');return active?.dataset.view||'overview';
  }
  function upgradeTabIntro(){
    const view=currentView(),root=document.getElementById('view');if(!root||view==='overview')return;
    let intro=root.querySelector(':scope > .rf-tab-intro');
    const meta=TAB_INTRO[view]||['TIẾNG NGA','Học tập tập trung','Mọi công cụ nằm đúng nơi, không làm rối luồng học.',['Tập trung','Rõ ràng','Thực hành']];
    if(!intro){
      intro=document.createElement('section');intro.className='rf-tab-intro';
      root.prepend(intro);
    }
    if(intro.dataset.view===view)return;
    intro.dataset.view=view;
    intro.innerHTML='<div><span>'+esc(meta[0])+'</span><h3>'+esc(meta[1])+'</h3><p>'+esc(meta[2])+'</p></div><div class="rf-tab-badges">'+meta[3].map(x=>'<b>'+esc(x)+'</b>').join('')+'</div>';
  }
  function speak(text){
    try{
      if(!('speechSynthesis'in window))return;
      speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=.82;speechSynthesis.speak(u);
    }catch(_){}
  }
  function bind(){
    if(document.documentElement.dataset.rfBound==='1')return;
    document.documentElement.dataset.rfBound='1';
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-rf-speak]');if(b){e.preventDefault();speak(b.dataset.rfSpeak||'')}
    });
  }
  let scheduled=false;
  function upgrade(){
    scheduled=false;upgradeBrand();upgradeOverview();upgradeTabIntro();bind();
  }
  function schedule(){
    if(scheduled)return;scheduled=true;requestAnimationFrame(upgrade);
  }
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.RUSSIAN_FUTURE_UI={version:'RUSSIAN_FUTURE_REFERENCE_UI_V1',upgrade,metrics};
})();