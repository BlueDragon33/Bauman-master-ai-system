/* Bauman Master Hub V2
   UI-only orchestration layer. Keeps Main state, auth, routes and Subject Bridge authoritative. */
(()=>{
  'use strict';
  const RELEASE='HUB_PREMIUM_V2_2026_09';
  const DENSITY_KEY='bauman_hub_density_v2';
  const COLORS={math:['#4f46e5','#9b8cff','Σ'],russian:['#5d6adf','#9aa8ff','Я'],programming:['#b27a22','#ffd36f','</>'],ai:['#087c91','#35e2f0','◎'],systems:['#0e7f69','#54e2ae','⚙'],signal:['#176995','#4dc6ff','≈'],research:['#915323','#ffbd66','✦'],foundation:['#6e4e9d','#c297ff','▦']};
  const $q=(s,r=document)=>r.querySelector(s); const $qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
  const fmtDate=(s)=>{try{return new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit'}).format(new Date(s+'T12:00:00'))}catch{return s||'Hôm nay'}};
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  function stateRef(){return window.state||{} };
  function dataRef(){return window.BAUMAN_DATA||window.DATA||{} }
  function selectedSubject(){const s=stateRef();return s.subjects?.[s.lastStudy?.subjectId]||s.subjects?.[s.subject]||Object.values(s.subjects||{})[0]||{} }
  function subjectProgress(id){return clamp(stateRef().progress?.[id]||0)}
  function palette(id){return COLORS[id]||['#2b6ea4','#55c6ff','•']}
  function courseRows(subjectId){const data=dataRef();const stage=stateRef().subjectStage||stateRef().roadmapStage||'prepare';let rows=(data.courses||[]).filter(c=>c.subject===subjectId);const scoped=rows.filter(c=>c.stage===stage);if(scoped.length)rows=scoped;return rows.slice(0,4)}
  function reviewCount(subjectId){return (stateRef().reviewQueue||[]).filter(x=>!subjectId||x.subjectId===subjectId).length}
  function reportCount(subjectId){const reports=Object.values(stateRef().subjectReports||{});return reports.filter(x=>!subjectId||x?.subjectId===subjectId).length}
  function scheduleItems(){
    const s=stateRef(),entries=s.schedule?.entries||{},slots=[...(window.MAIN_SLOTS||[]),...(window.REVIEW_SLOTS||[])];
    const slotMap=Object.fromEntries(slots.map(x=>[x.id,x])); const out=[];
    for(const [key,val] of Object.entries(entries)){
      const [date,slotId]=key.split('|'); if(!date||date<today())continue;
      const slot=slotMap[slotId]||{};out.push({date,slotId,time:slot.time||'Theo lịch',...val});
    }
    return out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
  }
  function activityDates(){
    const list=(stateRef().activity||[]).map(x=>String(x.receivedAt||x.at||x.date||'').slice(0,10)).filter(Boolean);
    return [...new Set(list)].sort().reverse();
  }
  function streak(){
    const set=new Set(activityDates()); if(!set.size)return 0; let n=0,d=new Date();
    for(let i=0;i<90;i++){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');if(set.has(k))n++;else if(i>0)break;d.setDate(d.getDate()-1)}return n;
  }
  function overall(){const ids=Object.keys(stateRef().subjects||{});return ids.length?Math.round(ids.reduce((a,id)=>a+subjectProgress(id),0)/ids.length):0}
  function subjectCards(){
    const s=stateRef();const order=['math','russian','programming','ai','systems','signal','research','foundation'];
    return order.map(id=>s.subjects?.[id]).filter(Boolean).slice(0,5).map(sub=>{const [line,accent,icon]=palette(sub.id),pct=subjectProgress(sub.id);return `<button class="hub2-subject" style="--subject-line:${line};--subject-bg:${line}33;--subject-accent:${accent}" data-hub-subject="${safe(sub.id)}"><span class="icon">${safe(icon||sub.icon)}</span><b>${safe(sub.name)}</b><small>${safe(sub.eq?.[0]||sub.track||'Bauman')}</small><span class="hub2-progress"><span class="hub2-progress-track"><i style="width:${pct}%"></i></span><em>${pct}%</em></span></button>`}).join('')
  }
  function lessons(sub){
    const rows=courseRows(sub.id);if(!rows.length)return `<div class="hub2-empty">Chưa có học phần phù hợp ở giai đoạn hiện tại.</div>`;
    return rows.map((c,i)=>`<div class="hub2-lesson ${i===0?'active':''}"><span class="hub2-play">▶</span><span>${safe(c.name||c.vi||'Học theo lộ trình')}</span><small>${safe(c.hours||'')}</small><span class="hub2-check">${i===0?'●':'○'}</span></div>`).join('')
  }
  function scheduleHTML(){const rows=scheduleItems();if(!rows.length)return `<div class="hub2-empty">Chưa có ca học sắp tới. Mở Lịch học để xếp lịch.</div>`;const slotColors=['#49a9ff','#8b7cff','#45dda8','#f4b74c'];return rows.map((x,i)=>`<div class="hub2-schedule-row"><time>${safe(x.time)}</time><div style="--slot:${slotColors[i%slotColors.length]}">${safe(x.learningItem||x.label||x.subjectId||'Học theo lịch')}</div></div>`).join('')}
  function barsHTML(){const list=Object.values(stateRef().subjects||{}).slice(0,5);return list.map((s,i)=>{const [line]=palette(s.id),pct=subjectProgress(s.id);return `<div class="hub2-bar"><span>${safe(s.name)}</span><i><u style="--bar:${line};width:${pct}%"></u></i><b>${pct}%</b></div>`}).join('')}
  function achievementsHTML(){
    const done=Object.entries(stateRef().progress||{}).filter(([,v])=>Number(v)>=100); const strongest=Object.entries(stateRef().progress||{}).sort((a,b)=>Number(b[1])-Number(a[1]))[0]; const st=streak();const reviews=reviewCount();
    const items=[
      ['★',done.length?`Hoàn thành ${done.length} môn`:'Chưa có môn 100%'],
      ['✦',strongest?`Cao nhất ${clamp(strongest[1])}%`:'Bắt đầu tiến độ'],
      ['♛',st?`Chuỗi ${st} ngày`:'Tạo chuỗi học'],
      ['↻',reviews?`${reviews} mục cần ôn`:'Ôn tập sạch']
    ];return items.map(x=>`<div class="hub2-ach"><div class="hub2-badge">${x[0]}</div><span>${safe(x[1])}</span></div>`).join('')
  }
  function homeHTML(){
    const sub=selectedSubject(),pct=subjectProgress(sub.id),courses=(dataRef().courses||[]).filter(c=>c.subject===sub.id).length,reviews=reviewCount(sub.id),reports=reportCount(sub.id),schedule=scheduleItems(),stage=(dataRef().stages||[]).find(x=>x.id===stateRef().roadmapStage)||{};
    const art=sub.id==='math'?`background-image:url('assets/media/hub-pca.svg')`:`background-image:linear-gradient(135deg,rgba(7,17,31,.30),rgba(7,17,31,.72)),url('assets/media/hub-mountains.svg');background-size:cover`;
    return `<div class="hub2-dashboard"><div class="hub2-layout"><section class="hub2-maincol">
      <section class="hub2-hero"><div class="hub2-hero-copy"><h1>Kiến thức là sức mạnh<br>và bạn đang làm chủ nó.</h1><p>Học sâu hơn. Đi xa hơn. Cùng Bauman Master Hub.</p><div class="hub2-hero-actions"><button class="btn hub2-gold" data-hub-action="continue">Tiếp tục học　→</button><button class="btn hub2-outline" data-hub-action="roadmap">Khám phá lộ trình</button></div></div><div class="hub2-quote">“A sharper mind<br>A brighter you”</div></section>
      <div class="hub2-section-head"><h2>Chọn môn học</h2><button class="hub2-link" data-hub-action="subjects">Xem tất cả　→</button></div>
      <section class="hub2-subjects">${subjectCards()}</section>
      <section class="hub2-card hub2-continue"><div><div class="hub2-ring" style="--pct:${pct}"><b>${pct}%</b></div><div class="hub2-ring-label">Tiến độ môn</div></div><div class="hub2-continue-body"><div class="hub2-breadcrumb">${safe(stage.name||'Lộ trình Bauman')} · ${safe(sub.eq?.[0]||'')}</div><h2>${safe(sub.name||'Môn học')}</h2><div class="hub2-lesson-list">${lessons(sub)}</div><div class="hub2-continue-actions"><button class="btn hub2-gold" data-hub-action="continue">Tiếp tục học →</button></div></div><div class="hub2-pca" style="${art}"></div><div class="hub2-stats"><span><b>${courses}</b>Học phần</span><span><b>${pct}%</b>Tiến độ</span><span><b>${reviews}</b>Cần ôn</span><span><b>${reports}</b>Báo cáo</span></div></section>
      <section class="hub2-bottom"><article class="hub2-card hub2-achievements"><div class="hub2-section-head"><h2>Thành tựu gần đây</h2><button class="hub2-link" data-hub-action="progress">Xem tiến độ →</button></div><div class="hub2-ach-grid">${achievementsHTML()}</div></article><article class="hub2-card hub2-overall"><div class="hub2-section-head"><h2>Tiến độ tổng quan</h2></div><div class="hub2-overall-inner"><div class="hub2-donut" style="--pct:${overall()}"><b>${overall()}%</b></div><div class="hub2-bars">${barsHTML()}</div></div></article></section>
    </section><aside class="hub2-rail">
      <article class="hub2-card hub2-assistant"><h2 class="hub2-assistant-title">♙ AI Study Assistant</h2><div class="hub2-assistant-intro"><img src="assets/media/hub-ai-robot.svg" alt="AI Study Assistant"><p>Hỏi bất cứ điều gì về bài học, công thức, bài tập hay lộ trình học.</p></div><div class="hub2-suggestions"><button data-hub-ask="Giải thích nội dung đang học đơn giản hơn">Giải thích nội dung đang học đơn giản hơn?</button><button data-hub-ask="Cho ví dụ ứng dụng thực tế của môn đang học">Cho ví dụ ứng dụng thực tế</button><button data-hub-ask="Giúp tôi lập kế hoạch làm bài tập hôm nay">Làm bài tập này giúp mình với</button><button data-hub-ask="Gợi ý lộ trình học tiếp theo">Gợi ý lộ trình học tiếp theo</button></div><button class="hub2-ai-input" data-hub-action="ai"><span>Nhập câu hỏi của bạn...</span><b>➤</b></button></article>
      <article class="hub2-card hub2-schedule"><div class="hub2-section-head"><h2>Lịch học hôm nay</h2><button class="hub2-link" data-hub-action="schedule">Xem tất cả →</button></div><div class="hub2-schedule-date">${schedule.length?fmtDate(schedule[0].date):fmtDate(today())}</div><div class="hub2-schedule-list">${scheduleHTML()}</div></article>
      <article class="hub2-card hub2-motivation"><blockquote>Kỷ luật hôm nay<br>tạo nên phiên bản tốt hơn<br>của ngày mai.<small>BAUMAN MASTER HUB</small></blockquote></article>
    </aside></div></div>`
  }
  function patchHome(){if(!window.app)return;window.app.home=function(){const host=document.getElementById('page-home');if(host)host.innerHTML=homeHTML()}}
  function classifyViewport(){const w=innerWidth,h=innerHeight,r=w/Math.max(h,1);let mode='laptop';if(w<=760)mode='phone';else if(w<=1180||r<1.64)mode='tablet';document.body.dataset.hubViewport=mode}
  function pageClass(page){document.body.dataset.hubPage=page||stateRef().page||'home';document.body.classList.toggle('hub-page-home',(page||stateRef().page)==='home')}
  function enhanceTopbar(){
    const top=$q('.topbar');if(!top||$q('#hubGlobalSearch'))return;const wrap=document.createElement('label');wrap.className='hub-search';wrap.innerHTML='<span class="hub-search-icon">⌕</span><input id="hubGlobalSearch" autocomplete="off" placeholder="Tìm kiếm bài học, công thức, bài tập, mô phỏng..."><kbd>Ctrl K</kbd>';top.insertBefore(wrap,$q('.top-actions',top));
    const input=$q('#hubGlobalSearch');input.addEventListener('keydown',e=>{if(e.key==='Enter'){search(input.value);input.blur()}});document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}})
  }
  function enhanceBrand(){const logo=$q('.logo'),brandB=$q('.brand b'),brandS=$q('.brand small');if(logo)logo.textContent='◇';if(brandB)brandB.textContent='BAUMAN';if(brandS)brandS.textContent='MASTER HUB'}
  function enhanceNav(){
    const nav=$q('#nav');if(!nav||nav.dataset.hubV2==='1')return;nav.dataset.hubV2='1';const extras=[['study','▣','Học tập'],['simulation','⌬','Mô phỏng'],['exercise','✓','Bài tập'],['ai','◉','Vấn đáp cùng AI'],['review','↻','Ôn tập'],['progress','▥','Bản đồ năng lực'],['achievement','♛','Thành tích'],['settings','⚙','Cài đặt']];
    const existing=new Set($qa('button',nav).map(x=>x.textContent.trim()));for(const [act,icon,label] of extras){if(existing.has(label))continue;const b=document.createElement('button');b.type='button';b.className='hub-nav-action';b.dataset.hubAction=act;b.innerHTML=`<i>${icon}</i><span>${label}</span>`;nav.appendChild(b)}
  }
  function enhanceAppearance(){
    const menu=$q('#appearanceMenu');if(!menu||$q('#densitySelect'))return;const label=document.createElement('label');label.className='profile-line';label.innerHTML='<span>Mật độ giao diện</span><select id="densitySelect" class="field sm-field"><option value="compact">Gọn · laptop thấp</option><option value="balanced">Cân bằng</option><option value="comfortable">Thoáng</option></select>';menu.appendChild(label);const select=$q('#densitySelect'),v=localStorage.getItem(DENSITY_KEY)||'balanced';select.value=v;document.body.dataset.density=v;select.addEventListener('change',()=>{localStorage.setItem(DENSITY_KEY,select.value);document.body.dataset.density=select.value})
  }
  function openSelectedSubject(){const id=selectedSubject().id||stateRef().subject||'math';stateRef().subject=id;window.save?.();window.app?.openSubjectInPage?.(id)}
  function search(q){
    const query=String(q||'').trim().toLowerCase();if(!query)return;const data=dataRef(),s=stateRef();const subjects=Object.values(s.subjects||{}).filter(x=>(x.name+' '+(x.desc||'')+' '+(x.main||'')).toLowerCase().includes(query)).slice(0,6);const courses=(data.courses||[]).filter(x=>(x.name+' '+(x.ru||'')+' '+(x.note||'')).toLowerCase().includes(query)).slice(0,8);const body=`<div class="section-head"><div><h2>Kết quả tìm kiếm</h2><p>${safe(q)}</p></div></div><div class="course-list">${subjects.map(x=>`<button class="course" onclick="closeModal();pickSubject('${safe(x.id)}');app.page('subjects')"><h4>${safe(x.name)}</h4><p>${safe(x.desc||'')}</p></button>`).join('')}${courses.map(x=>`<button class="course" onclick="closeModal();pickSubject('${safe(x.subject)}');app.page('subjects')"><h4>${safe(x.name)}</h4><p>${safe(x.ru||x.note||'')}</p></button>`).join('')||'<div class="hub2-empty">Không có kết quả.</div>'}</div>`;window.openModal?window.openModal('Tìm kiếm',body,true):window.app?.page?.('subjects')
  }
  function ask(q){window.mentor?.open?.();setTimeout(()=>{const i=document.getElementById('aiInput');if(i){i.value=q||'';i.focus()}},30)}
  function action(a){
    if(a==='continue'||a==='study')return window.app?.continueStudy?.();if(a==='roadmap')return window.app?.page?.('roadmap');if(a==='subjects'||a==='exercise')return window.app?.page?.('subjects');if(a==='schedule'||a==='review')return window.app?.page?.('schedule');if(a==='ai')return ask('');if(a==='simulation')return openSelectedSubject();if(a==='progress')return window.app?.openHomeFrame?.('progress');if(a==='achievement'){window.app?.page?.('home');setTimeout(()=>$q('.hub2-achievements')?.scrollIntoView({behavior:'smooth',block:'center'}),80);return}if(a==='settings'){document.getElementById('appearanceMenu')?.classList.remove('hidden');return}
  }
  function bind(){
    document.addEventListener('click',e=>{const s=e.target.closest('[data-hub-subject]');if(s){const id=s.dataset.hubSubject;stateRef().subject=id;stateRef().lastStudy={...(stateRef().lastStudy||{}),subjectId:id,path:stateRef().subjects?.[id]?.mainPath||''};window.save?.();window.pickSubject?.(id);window.app?.page?.('subjects');return}const askBtn=e.target.closest('[data-hub-ask]');if(askBtn){ask(askBtn.dataset.hubAsk);return}const btn=e.target.closest('[data-hub-action]');if(btn)action(btn.dataset.hubAction)},true);
    window.addEventListener('resize',classifyViewport,{passive:true});
  }
  function patchPage(){if(!window.app||window.app.__hubV2PagePatched)return;const original=window.app.page.bind(window.app);window.app.page=function(p,persist=true){const r=original(p,persist);pageClass(p);return r};window.app.__hubV2PagePatched=true}
  function init(){patchHome();patchPage();enhanceTopbar();enhanceBrand();enhanceNav();enhanceAppearance();classifyViewport();pageClass();bind();window.app?.home?.();if(stateRef().page==='home')window.app?.page?.('home',false);window.BAUMAN_HUB_V2={release:RELEASE,refresh:()=>{window.app?.home?.();classifyViewport()},search,selfCheck:()=>({release:RELEASE,ready:!!$q('.hub2-dashboard'),viewport:document.body.dataset.hubViewport||'',appearance:!!$q('#appearanceBtn'),density:!!$q('#densitySelect'),search:!!$q('#hubGlobalSearch'),subjectBridge:!!window.BaumanSubjectRuntime,runtimeWrites:false})}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  /* Patch before main's DOMContentLoaded init fires. */
  patchHome();patchPage();
})();
