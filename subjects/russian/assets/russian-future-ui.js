'use strict';
(function(){
  const STORAGE_KEY=window.SUBJECT_ADAPTER?.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const NAV_META={
    overview:['⌂','Tổng quan'],
    learning:['▤','Bài học'],
    media:['◉','Video'],
    writing:['✎','Luyện chữ'],
    vocab:['▣','Từ vựng'],
    grammar:['▥','Ngữ pháp'],
    dialogue:['◌','Nghe & Nói'],
    mindmap:['◇','Sơ đồ nhớ'],
    storage:['⚙','Dữ liệu']
  };
  const ROUTES=[
    {keys:['bảng chữ','bang chu','cyrillic','chữ cái','chu cai','viết','viet'],label:'Luyện chữ',route:{view:'writing',mode:'handwriting'}},
    {keys:['phát âm','phat am','pronunciation','shadow','nói','noi','hội thoại','hoi thoai'],label:'Nghe & Nói',route:{view:'dialogue'}},
    {keys:['video','audio','nghe hiểu','nghe hieu'],label:'Video',route:{view:'media'}},
    {keys:['từ vựng','tu vung','vocab','слово','привет'],label:'Từ vựng',route:{view:'vocab'}},
    {keys:['ngữ pháp','ngu phap','grammar','падеж','падежи','cách'],label:'Ngữ pháp',route:{view:'grammar'}},
    {keys:['đọc','doc','lý thuyết','ly thuyet','bài học','bai hoc'],label:'Bài học',route:{view:'learning',learnTab:'theory'}},
    {keys:['bài tập','bai tap','exercise'],label:'Bài tập',route:{view:'learning',learnTab:'exercises'}},
    {keys:['ôn','on tap','review'],label:'Ôn tập',route:{view:'learning',learnTab:'review'}},
    {keys:['kiểm tra','kiem tra','test','exam'],label:'Kiểm tra',route:{view:'learning',learnTab:'exam'}},
    {keys:['mind','sơ đồ','so do'],label:'Sơ đồ nhớ',route:{view:'mindmap'}},
    {keys:['dữ liệu','du lieu','json','lưu trữ','luu tru','backup'],label:'Dữ liệu học',route:{view:'storage'}},
    {keys:['ai','mentor','trợ lý','tro ly','giải thích','giai thich'],label:'AI Mentor',aiQuick:'intro'},
    {keys:['lịch','lich','hôm nay','hom nay','kế hoạch','ke hoach'],label:'Kế hoạch hôm nay',act:'route-modal'}
  ];
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
  function triggerCore(dataset){
    const btn=document.createElement('button');
    btn.type='button';
    Object.entries(dataset||{}).forEach(([k,v])=>{if(v!=null)btn.dataset[k]=String(v)});
    btn.hidden=true;
    document.body.appendChild(btn);
    btn.click();
    queueMicrotask(()=>btn.remove());
  }
  function runSearchResult(item){
    if(!item)return;
    if(item.route)return triggerCore({route:JSON.stringify(item.route)});
    if(item.aiQuick)return triggerCore({aiQuick:item.aiQuick});
    if(item.act)return triggerCore({act:item.act});
  }
  function routeMatches(q){
    q=String(q||'').trim().toLowerCase();
    if(!q)return ROUTES.slice(0,6).map(x=>({...x,group:'KHU HỌC'}));
    return ROUTES.filter(x=>x.keys.some(k=>k.includes(q)||q.includes(k))).slice(0,6).map(x=>({...x,group:'HOẠT ĐỘNG'}));
  }
  function searchMatches(q){
    const text=String(q||'').trim();
    const content=text&&window.RussianLearningSearch?.query?window.RussianLearningSearch.query(text,4):[];
    const routes=routeMatches(text);
    const seen=new Set();
    return [...content,...routes].filter(item=>{
      const key=(item.group||'')+'|'+(item.label||'')+'|'+JSON.stringify(item.route||item.aiQuick||item.act||'');
      if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,24);
  }
  function bindSearch(){
    const input=document.getElementById('russianGlobalSearch');
    const hints=document.getElementById('russianSearchHints');
    if(!input||!hints||input.dataset.rfSearchBound==='1')return;
    input.dataset.rfSearchBound='1';
    const keyHint=input.closest('.ru-global-search-wrap')?.querySelector('kbd');
    if(keyHint)keyHint.textContent=/Mac|iPhone|iPad/i.test(navigator.platform||navigator.userAgent||'')?'⌘ K':'Ctrl K';
    const close=()=>{hints.classList.add('hidden');input.setAttribute('aria-expanded','false')};
    const choose=item=>{runSearchResult(item);input.value='';close()};
    const paint=()=>{
      const matches=searchMatches(input.value);
      const grouped=new Map();
      matches.forEach((m,i)=>{const g=m.group||'KẾT QUẢ';if(!grouped.has(g))grouped.set(g,[]);grouped.get(g).push({m,i})});
      hints.innerHTML=Array.from(grouped.entries()).map(([group,items])=>'<section class="rf-search-group" role="group" aria-label="'+esc(group)+'"><b>'+esc(group)+'</b>'+items.map(({m,i})=>'<button type="button" role="option" data-rf-search-index="'+i+'"><span>'+esc(m.label)+'</span>'+(m.meta?'<small>'+esc(m.meta)+'</small>':'')+'</button>').join('')+'</section>').join('');
      hints.classList.toggle('hidden',!matches.length);
      input.setAttribute('aria-expanded',matches.length?'true':'false');
      Array.from(hints.querySelectorAll('button')).forEach(b=>{const i=Number(b.dataset.rfSearchIndex);b.addEventListener('click',()=>choose(matches[i]),{once:true})});
    };
    input.addEventListener('input',paint);
    input.addEventListener('focus',paint);
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){const m=searchMatches(input.value)[0];if(m){e.preventDefault();choose(m)}return}
      if(e.key==='ArrowDown'){const first=hints.querySelector('button');if(first&&!hints.classList.contains('hidden')){e.preventDefault();first.focus()}return}
      if(e.key==='Escape')close();
    });
    hints.addEventListener('keydown',e=>{
      const buttons=Array.from(hints.querySelectorAll('button'));const current=e.target.closest?.('button');const i=buttons.indexOf(current);
      if(e.key==='Escape'){e.preventDefault();input.focus();close();return}
      if(e.key==='ArrowDown'&&i>=0){e.preventDefault();buttons[(i+1)%buttons.length]?.focus();return}
      if(e.key==='ArrowUp'&&i>=0){e.preventDefault();(i===0?input:buttons[i-1])?.focus();return}
      if(e.key==='Enter'&&i>=0){e.preventDefault();current.click()}
    });
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}});
    document.addEventListener('click',e=>{if(!e.target.closest('.ru-global-search-wrap'))close()});
  }
  function stageLabel(st){
    const map={vn:['A1','Khởi động'],prep:['A2','Dự bị'],hk1:['B1','Học thuật'],hk2:['B2','Học thuật'],hk3:['C1','Nghiên cứu'],hk4:['C1+','Bảo vệ'],all:['A1→C1','Tổng hợp']};
    return map[st.stage||'vn']||map.vn;
  }
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function setAttr(el,name,value){if(el&&el.getAttribute(name)!==value)el.setAttribute(name,value)}
  function upgradeBrand(){
    document.body.classList.add('ru-future-ui');
    const title=document.getElementById('subjectTitle'),sub=document.getElementById('subjectSubtitle');
    setText(title,'Tiếng Nga');
    setText(sub,'Nghe • Nói • Đọc • Viết');
    setText(document.querySelector('.ru-brand-caption'),'MỞ MỘT NGÔN NGỮ · MỞ RỘNG THẾ GIỚI');
    const quote=document.querySelector('.ru-sidebar-quote');
    if(quote&&quote.dataset.rfFutureQuote!=='1'){
      quote.dataset.rfFutureQuote='1';
      quote.innerHTML='<span>“Язык открывает новый мир”</span><small>Một ngôn ngữ mới mở ra một thế giới mới.</small>';
    }
    setText(document.getElementById('coreLabel'),'TIẾNG NGA · HỌC MỖI NGÀY');
    const search=document.getElementById('russianGlobalSearch');
    setAttr(search,'placeholder','Tìm bài học, từ vựng, ngữ pháp...');
    setAttr(search,'aria-label','Tìm trong site Tiếng Nga');
    document.querySelectorAll('#nav button[data-view]').forEach(btn=>{
      const meta=NAV_META[btn.dataset.view];if(!meta)return;
      setText(btn.querySelector('b'),meta[0]);
      setText(btn.querySelector('span'),meta[1]);
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
    const recent=Array.isArray(m.st.recentAccess)?m.st.recentAccess[0]:null;
    const continueRoute=recent?.view?{view:recent.view,...(recent.view==='learning'?{learnTab:m.st.learnTab||'theory'}:{})}:{view:'media'};
    const continueLabel=recent?.label||'Video mở tai · bắt đầu từ âm thanh';
    const reviewCount=m.reviewWrong||Math.max(0,m.reviewDone?0:1);
    return '<section class="ru-dashboard-enhancer rf-dashboard" data-ru-dashboard="1">'+
      '<div class="rf-continue-band">'+
        '<article class="rf-continue-card"><div><span>HỌC TIẾP</span><h3>'+esc(continueLabel)+'</h3><p>'+(recent?'Quay lại đúng nơi bạn vừa học. Trạng thái và tiến độ hiện tại được giữ nguyên.':'Bắt đầu bằng nghe để làm quen nhịp tiếng Nga trước khi mở rộng sang chữ, từ và ngữ pháp.')+'</p></div><div class="rf-continue-actions"><b>'+pct+'%</b><button data-route=\''+esc(JSON.stringify(continueRoute))+'\'>Tiếp tục học →</button></div></article>'+
        '<article class="rf-review-now"><span>CẦN ÔN</span><b>'+(m.reviewWrong?m.reviewWrong+' mục cần sửa':(m.reviewDone?'Không có lỗi tồn đọng':'Chưa có dữ liệu ôn'))+'</b><p>'+(m.reviewWrong?'Xử lý lỗi cũ trước khi nạp thêm nội dung mới.':'Hệ thống chỉ đưa ôn tập lên khi đã có dữ liệu học thật.')+'</p><button data-route=\'{"view":"learning","learnTab":"review"}\'>Mở ôn tập →</button></article>'+
      '</div>'+
      '<article class="rf-today-plan"><div class="rf-card-head"><div><h4>Kế hoạch hôm nay</h4><span>Ba bước ngắn, ưu tiên nghe → nói → viết</span></div><button class="rf-link" data-act="route-modal">Xem lịch →</button></div><div class="rf-today-list">'+
        '<div class="rf-today-task"><span>1</span><div><b>Nghe một đoạn ngắn</b><small>Chỉ nghe trước, chưa vội đọc transcript.</small></div><button data-route=\'{"view":"media"}\'>Nghe</button></div>'+
        '<div class="rf-today-task"><span>2</span><div><b>Nhại và đổi vai</b><small>Lặp lại âm, nhịp rồi phản xạ trong hội thoại.</small></div><button data-route=\'{"view":"dialogue"}\'>Nói</button></div>'+
        '<div class="rf-today-task"><span>3</span><div><b>Nghe và viết</b><small>Nhận diện chữ, nghe âm rồi viết lại.</small></div><button data-route=\'{"view":"writing","mode":"handwriting"}\'>Viết</button></div>'+
      '</div></article>'+
      '<div class="rf-module-section"><div class="rf-card-head"><div><h4>5 kỹ năng chính</h4><span>Chọn đúng việc cần luyện, không phải đi tìm tính năng</span></div></div><div class="rf-module-grid">'+
        module({view:'media'},'rf-module-listen','◉','Video','Nghe trước, hiểu tình huống',['Chỉ nghe','Xem theo mục tiêu','Nối sang nói'])+
        module({view:'dialogue'},'rf-module-speak','◌','Nghe & Nói','Nhại, shadowing, đổi vai',['Nghe mẫu','Nhại câu','Phản xạ'])+
        module({view:'writing',mode:'handwriting'},'rf-module-alpha','Ая','Luyện chữ','Nhìn, nghe và viết Cyrillic',['Chữ in & chữ tay','Nghe tên chữ','Viết đúng nét'])+
        module({view:'vocab'},'rf-module-vocab','▣','Từ vựng','Hiểu bằng hình và ngữ cảnh Nga',['Hình → từ','Nghe → nhắc lại','Recall & ôn'])+
        module({view:'grammar'},'rf-module-grammar','▥','Ngữ pháp','Nhìn mẫu, dùng ngay trong câu',['Ví dụ trước','Pattern ngắn','Luyện ngay'])+
      '</div></div>'+
      '<div class="rf-progress-strip">'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">'+esc(sl[0])+'</span><div class="rf-progress-copy"><span>Giai đoạn</span><b>'+esc(sl[1])+' ('+esc(sl[0])+')</b><i style="--rf-p:'+pct+'%"></i></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">✓</span><div class="rf-progress-copy"><span>Đã ôn</span><b>'+m.reviewDone+' câu</b></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">◉</span><div class="rf-progress-copy"><span>Đã kiểm tra</span><b>'+m.answered+' / '+m.target+'</b></div></article>'+
        '<article class="rf-progress-item"><span class="rf-progress-icon">★</span><div class="rf-progress-copy"><span>Đề đạt</span><b>'+m.passed+' đề</b></div></article>'+
      '</div>'+
      '<div class="rf-dashboard-lower"><article class="rf-dashboard-card rf-home-review"><div class="rf-card-head"><div><h4>Ôn tập trọng điểm</h4><span>'+(reviewCount?'Ưu tiên phần cần củng cố':'Chưa có nội dung đến hạn')+'</span></div><button class="rf-link" data-route=\'{"view":"learning","learnTab":"review"}\'>Ôn ngay →</button></div><p>'+(m.reviewWrong?'Có '+m.reviewWrong+' mục sai đang chờ sửa. Hoàn thành chúng trước khi mở thêm nhiều từ mới.':'Khi có dữ liệu học, khu vực này sẽ chỉ đưa lên những mục quan trọng nhất.')+'</p></article></div>'+
    '</section>';
  }
  function collapseLegacyOverview(host,hero,dashboard){
    if(!host||!hero||!dashboard)return;
    const existing=Array.from(host.children).find(x=>x.classList?.contains('ru-legacy-overview-details'));
    if(existing)return;
    const legacy=Array.from(host.children).filter(x=>x!==hero&&x!==dashboard);
    if(!legacy.length)return;
    const details=document.createElement('details');
    details.className='ru-legacy-overview-details';
    const summary=document.createElement('summary');
    summary.innerHTML='<span>Công cụ & nội dung nâng cao</span><small>Mở khi cần</small>';
    const body=document.createElement('div');
    body.className='ru-legacy-overview-body';
    legacy.forEach(node=>body.appendChild(node));
    details.append(summary,body);
    host.appendChild(details);
  }
  function upgradeOverview(){
    const host=document.querySelector('.overview-v128');
    document.body.classList.toggle('ru-is-overview',!!host);
    if(!host)return;
    const hero=host.querySelector('.overview-top-only-hero');if(!hero)return;
    if(!hero.querySelector('.rf-hero'))hero.innerHTML=heroHtml();
    let dash=host.querySelector('[data-ru-dashboard="1"]');
    if(!dash){hero.insertAdjacentHTML('afterend',dashboardHtml());dash=host.querySelector('[data-ru-dashboard="1"]');}
    else if(!dash.classList.contains('rf-dashboard')){dash.outerHTML=dashboardHtml();dash=host.querySelector('[data-ru-dashboard="1"]');}
    collapseLegacyOverview(host,hero,dash);
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
    bindSearch();
    if(document.documentElement.dataset.rfBound==='1')return;
    document.documentElement.dataset.rfBound='1';
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-rf-speak]');if(b){e.preventDefault();speak(b.dataset.rfSpeak||'')}
    });
    window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY)schedule()});
  }
  let scheduled=false;
  function upgrade(){
    scheduled=false;upgradeBrand();upgradeOverview();upgradeTabIntro();bind();
    window.RussianContentContract?.enhance?.();
    window.RussianVocabSrs?.refresh?.();
  }
  function schedule(){
    if(scheduled)return;scheduled=true;requestAnimationFrame(upgrade);
  }
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.RUSSIAN_FUTURE_UI={version:'RUSSIAN_FUTURE_REFERENCE_UI_V1',upgrade,metrics};
})();