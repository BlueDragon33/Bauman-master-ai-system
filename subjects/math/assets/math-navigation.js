/* Bauman Math Learner Navigation
 * Canonical learner-first shell: Tổng quan · Lộ trình · Học · Luyện tập · Ôn tập.
 * Advanced resources remain contextual/command-palette tools.
 */
(function mathNavigation(global){
  'use strict';
  const RELEASE='MATH_LEARNER_NAV_IA_V1';
  let active='overview', timer=0,formulaFocus=null,commandFocus=null;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const PRIMARY_ITEMS=[
    {id:'overview',group:'Học tập',icon:'⌂',label:'Tổng quan',sub:'Hôm nay học gì?',key:'1'},
    {id:'roadmap',group:'Học tập',icon:'⌁',label:'Lộ trình',sub:'Giai đoạn → Chương',key:'2'},
    {id:'learn',group:'Học tập',icon:'▤',label:'Học',sub:'Bài học hiện tại',key:'3'},
    {id:'practice',group:'Học tập',icon:'✎',label:'Luyện tập',sub:'Bài tập theo nhu cầu',key:'4'},
    {id:'review',group:'Học tập',icon:'↺',label:'Ôn tập',sub:'Ôn đúng điểm yếu',key:'5'}
  ];
  const ADVANCED_ITEMS=[
    {id:'lab',group:'Công cụ',icon:'∿',label:'Mô phỏng',sub:'Công cụ theo ngữ cảnh',key:'L'},
    {id:'formula',group:'Công cụ',icon:'∑',label:'Công thức',sub:'Công thức bài đang học',key:'F'},
    {id:'resources',group:'Công cụ',icon:'⌕',label:'Tài nguyên',sub:'Tìm kiếm & tài nguyên theo bài',key:'R'},
    {id:'control',group:'Công cụ',icon:'☷',label:'Công cụ học',sub:'Hiển thị & kiểm soát',key:'C'},
    {id:'vault',group:'Hệ thống',icon:'▣',label:'Kho dữ liệu',sub:'Quản trị nội dung nâng cao',key:'D'}
  ];
  const ITEMS=[...PRIMARY_ITEMS,...ADVANCED_ITEMS];

  function toast(message){
    const existing=$('#mathWsToast');
    if(existing){ existing.textContent=message; existing.style.opacity='1'; clearTimeout(existing._timer); existing._timer=setTimeout(()=>existing.style.opacity='0',1800); return; }
    console.info('[Math Navigation]',message);
  }

  function navHtml(){
    return '<section class="math-unified-group" aria-label="Điều hướng học tập">'+
      PRIMARY_ITEMS.map(x=>`<button type="button" class="math-unified-nav-button ${x.id===active?'active':''}" data-math-unified="1" data-math-nav="${x.id}" aria-current="${x.id===active?'page':'false'}" title="${esc(x.label)} · ${esc(x.sub)}"><i class="math-unified-icon">${x.icon}</i><span class="math-unified-copy"><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span><span class="math-unified-tail">${esc(x.key)}</span></button>`).join('')+
    '</section>';
  }

  function ensureNav(){
    const nav=$('#nav'); if(!nav) return;
    let root=$('#mathUnifiedNav',nav);
    if(!root){ root=document.createElement('div'); root.id='mathUnifiedNav'; root.className='math-unified-nav'; nav.appendChild(root); }
    $('#mathUnifiedSystem')?.remove();
    root.innerHTML=navHtml();
  }

  let roadmapCache=null;
  async function loadRoadmap(){
    if(roadmapCache) return roadmapCache;
    const [curriculumRes,frameRes,contentRes]=await Promise.all([
      fetch('data/curriculum.json'),
      fetch('data/theory_lecture_frame.json'),
      fetch('data/theory_lecture_content.json')
    ]);
    if(!curriculumRes.ok||!frameRes.ok||!contentRes.ok) throw new Error('Không tải được dữ liệu lộ trình.');
    const curriculum=await curriculumRes.json();
    const frame=await frameRes.json();
    const content=await contentRes.json();
    const records=Array.isArray(content)?content:(content?.records||content?.lessons||content?.items||[]);
    roadmapCache={curriculum,frame,records};
    return roadmapCache;
  }
  function setPageHeader(title,sub){
    const h=$('#pageTitle'); if(h) h.textContent=title;
    const p=$('#pageSub'); if(p) p.textContent=sub||'';
  }
  function roadmapChapters(data,stageId){
    const allowed=new Set((data.curriculum?.stages||[]).find(x=>x.id===stageId)?.chapterIds||[]);
    return (data.frame?.chapters||[])
      .filter(ch=>ch.stageId===stageId && (!allowed.size||allowed.has(ch.chapterId)))
      .sort((a,b)=>(Number(a.localChapterNo||a.chapterNo)||0)-(Number(b.localChapterNo||b.chapterNo)||0));
  }
  function recordsForChapter(data,chapterId){
    return (data.records||[]).filter(x=>(x.chapterId||'')===chapterId);
  }
  function chapterProgress(records){
    const ids=records.map(x=>x.lessonId||x.id).filter(Boolean);
    try{return global.BAUMAN_MATH_LEARNING_FLOW?.chapterSnapshot?.(ids)||{lessonCount:ids.length,startedLessons:0,completedLessons:0,visitedSteps:0,totalSteps:ids.length*9,percent:0,completionPercent:0,status:'not_started'}}catch(_){
      return {lessonCount:ids.length,startedLessons:0,completedLessons:0,visitedSteps:0,totalSteps:ids.length*9,percent:0,completionPercent:0,status:'not_started'};
    }
  }
  function roadmapStatus(ch,records,progress){
    if(ch.locked) return {key:'locked',label:'Đang khóa'};
    if(!records.length) return {key:'empty',label:'Chưa có học liệu'};
    if(progress.status==='completed') return {key:'completed',label:'Đã hoàn thành'};
    if(progress.startedLessons>0) return {key:'learning',label:'Đang học'};
    return {key:'not-started',label:'Chưa học'};
  }
  function roadmapHtml(data,stageId){
    const stages=data.curriculum?.stages||[];
    const stage=stages.find(x=>x.id===stageId)||stages[0]||{};
    const chapters=roadmapChapters(data,stage.id);
    const stageTabs=stages.map(x=>`<button type="button" class="math-roadmap-stage ${x.id===stage.id?'active':''}" data-math-roadmap-stage="${esc(x.id)}">${esc(x.title||x.id)}</button>`).join('');
    const groups=[];
    chapters.forEach(ch=>{
      const key=ch.disciplineId||'other';
      let g=groups.find(x=>x.key===key);
      if(!g){g={key,title:ch.disciplineTitle||'Cụm kiến thức',items:[]};groups.push(g);}
      g.items.push(ch);
    });
    const body=groups.length?groups.map(g=>`<section class="math-roadmap-department"><header><span>CỤM KIẾN THỨC</span><h3>${esc(g.title)}</h3></header><div class="math-roadmap-chapters">${g.items.map(ch=>{
      const records=recordsForChapter(data,ch.chapterId);
      const progress=chapterProgress(records);
      const status=roadmapStatus(ch,records,progress);
      const actual=records.length;
      const planned=Number(ch.suggestedLessonCount)||actual;
      const canOpen=actual>0&&!ch.locked;
      const progressText=progress.startedLessons>0?`${progress.completedLessons||0}/${actual} bài hoàn thành · ${progress.percent}% bước đã mở`:'Chưa có tiến độ';
      return `<article class="math-roadmap-chapter" data-roadmap-status="${status.key}">
        <div class="math-roadmap-chapter-main">
          <div class="math-roadmap-chapter-kicker"><span>Chương ${esc(ch.localChapterNo||ch.chapterNo||'')}</span><span class="math-roadmap-status">${esc(status.label)}</span></div>
          <h4>${esc(ch.chapterTitle||ch.chapterId)}</h4>
          <p>${esc(ch.targetOutcome||ch.bridgeQuestion||'Mục tiêu chương chưa có trong khung hiện tại.')}</p>
          <div class="math-roadmap-progress" aria-label="Tỷ lệ bài đã hoàn thành"><i style="width:${Math.max(0,Math.min(100,progress.completionPercent||0))}%"></i></div>
          <small>${esc(progressText)}</small>
        </div>
        <div class="math-roadmap-meta">
          <span>${actual}/${planned} bài có học liệu</span>
          <span>${esc(ch.contentStatus||'')}</span>
          ${canOpen?`<button type="button" data-math-roadmap-chapter="${esc(ch.chapterId)}" data-math-roadmap-stage-id="${esc(ch.stageId||stage.id)}">Học chương này →</button>`:'<button type="button" disabled>Chưa thể mở</button>'}
        </div>
      </article>`;
    }).join('')}</div></section>`).join(''):`<div class="math-roadmap-empty"><b>Chưa có chương được ánh xạ cho giai đoạn này.</b><span>Dữ liệu khung vẫn được giữ nguyên; hệ thống không tự bịa nội dung thay thế.</span></div>`;
    const readyCount=chapters.filter(ch=>recordsForChapter(data,ch.chapterId).length>0).length;
    return `<section class="math-roadmap-shell"><header class="math-roadmap-head"><div><span>LỘ TRÌNH HỌC TẬP</span><h2>${esc(stage.title||stage.id||'Lộ trình Toán')}</h2><p>${esc(stage.goal||'Theo dõi vị trí học và mở đúng chương cần học tiếp.')}</p></div><aside><b>${readyCount}/${chapters.length}</b><span>chương đã có học liệu</span></aside></header><nav class="math-roadmap-stages" aria-label="Giai đoạn">${stageTabs}</nav>${body}</section>`;
  }
  async function renderRoadmap(stageId){
    setActive('roadmap');
    document.body.classList.add('math-roadmap-active');
    const view=$('#view'); if(!view) return;
    setPageHeader('Lộ trình','Giai đoạn → Cụm kiến thức → Chương. Tiến độ chỉ dùng dữ liệu học đã ghi nhận.');
    view.innerHTML='<section class="math-roadmap-loading">Đang đọc lộ trình Toán…</section>';
    try{
      const data=await loadRoadmap();
      const fallback=$('#stageSelect')?.value||data.curriculum?.stages?.[0]?.id||'vn';
      view.innerHTML=roadmapHtml(data,stageId||fallback);
    }catch(error){
      view.innerHTML='<section class="math-roadmap-empty"><b>Không tải được lộ trình.</b><span>Hãy thử lại từ mục Lộ trình. Bài học hiện tại không bị thay đổi.</span></section>';
      console.error('[Math Roadmap]',error);
    }
  }
  function leaveRoadmap(){document.body.classList.remove('math-roadmap-active','math-chapter-overview-active');}
  function lessonProgress(lessonId){
    try{return global.BAUMAN_MATH_LEARNING_FLOW?.lessonSnapshot?.(lessonId)||{visitedCount:0,totalSteps:9,percent:0,status:'not_started',activeStepLabel:'Lý thuyết'}}catch(_){
      return {visitedCount:0,totalSteps:9,percent:0,status:'not_started',activeStepLabel:'Lý thuyết'};
    }
  }
  async function renderChapterOverview(chapterId,stageId){
    const view=$('#view'); if(!view)return;
    leaveRoadmap(); document.body.classList.add('math-chapter-overview-active'); setActive('learn');
    setPageHeader('Chương','Mục tiêu chương, tiến độ đã ghi nhận và các bài học theo thứ tự.');
    view.innerHTML='<section class="math-roadmap-loading">Đang mở chương…</section>';
    try{
      const data=await loadRoadmap();
      const ch=(data.frame?.chapters||[]).find(x=>x.chapterId===chapterId);
      if(!ch) throw new Error('Chapter not found: '+chapterId);
      const records=recordsForChapter(data,chapterId);
      const progress=chapterProgress(records);
      const pure=(ch.pureLayer||[]).slice(0,6);
      const applied=(ch.appliedLayer||[]).slice(0,6);
      const lessons=records.map((rec,index)=>{
        const id=rec.lessonId||rec.id||'';
        const lp=lessonProgress(id);
        const completed=Number(lp.completedAt||0)>0;
        const started=lp.visitedCount>0;
        const status=completed?'Đã hoàn thành':started?'Đang học':'Chưa học';
        const cta=completed?'Xem lại':started?'Tiếp tục':'Bắt đầu';
        const slideCount=Array.isArray(rec.slides)?rec.slides.length:0;
        return `<article class="math-chapter-lesson" data-lesson-status="${completed?'completed':started?'learning':'not-started'}">
          <div class="math-chapter-lesson-no">${String(index+1).padStart(2,'0')}</div>
          <div class="math-chapter-lesson-copy">
            <div class="math-chapter-lesson-title"><span>${esc(status)}</span><h3>${esc(rec.title||rec.lessonTitle||id)}</h3></div>
            <p>${slideCount?slideCount+' phần nội dung trong bài':'Nội dung bài đã được ánh xạ vào Reader'} · ${completed?'Đã hoàn thành Lesson Check':started?esc(lp.activeStepLabel)+' · '+lp.percent+'% bước đã mở':'Chưa có tiến độ học'}</p>
            <div class="math-chapter-lesson-progress"><i style="width:${completed?100:Math.max(0,Math.min(100,lp.percent))}%"></i></div>
          </div>
          <button type="button" data-math-chapter-lesson="${esc(id)}" data-math-chapter-id="${esc(chapterId)}" data-math-chapter-stage="${esc(stageId||ch.stageId||'')}">${cta} →</button>
        </article>`;
      }).join('');
      view.innerHTML=`<section class="math-chapter-shell">
        <button type="button" class="math-chapter-back" data-math-chapter-back="${esc(stageId||ch.stageId||'')}">← Quay lại lộ trình</button>
        <header class="math-chapter-head">
          <div>
            <span>${esc(ch.stageTitle||stageId||'Giai đoạn')} · ${esc(ch.disciplineTitle||'Cụm kiến thức')}</span>
            <h2>${esc(ch.chapterTitle||chapterId)}</h2>
            <p>${esc(ch.targetOutcome||'Mục tiêu chương chưa được khai báo trong nguồn.')}</p>
          </div>
          <aside><b>${progress.completedLessons||0}/${records.length}</b><span>bài đã hoàn thành</span><strong>${progress.startedLessons} bài đã bắt đầu · ${progress.percent}% bước đã mở</strong></aside>
        </header>
        <section class="math-chapter-context">
          <article><span>TẠI SAO CẦN HỌC</span><p>${esc(ch.bridgeQuestion||'Khung hiện tại chưa khai báo cầu nối ứng dụng riêng cho chương này.')}</p></article>
          <article><span>KIẾN THỨC CỐT LÕI</span><div>${pure.length?pure.map(x=>`<i>${esc(x)}</i>`).join(''):'<em>Chưa có metadata.</em>'}</div></article>
          <article><span>LIÊN HỆ KỸ THUẬT</span><div>${applied.length?applied.map(x=>`<i>${esc(x)}</i>`).join(''):'<em>Chưa có metadata.</em>'}</div></article>
        </section>
        <div class="math-chapter-source-note">Điều kiện vào và thời lượng chỉ hiển thị khi nguồn học thuật khai báo. Hệ thống không tự ước lượng để lấp chỗ trống.</div>
        <section class="math-chapter-lessons">
          <header><div><span>DANH SÁCH BÀI</span><h3>Học theo thứ tự trong chương</h3></div><b>${records.length} bài có học liệu</b></header>
          ${lessons||'<div class="math-roadmap-empty"><b>Chương chưa có bài học khả dụng.</b><span>Không có nội dung giả được tạo để lấp chỗ trống.</span></div>'}
        </section>
      </section>`;
    }catch(error){
      view.innerHTML='<section class="math-roadmap-empty"><b>Không mở được chương.</b><span>Dữ liệu học hiện tại không bị thay đổi. Hãy quay lại Lộ trình và thử lại.</span></section>';
      console.error('[Math Chapter]',error);
    }
  }
  function openRoadmapChapter(chapterId,stageId){renderChapterOverview(chapterId,stageId);}
  function openChapterLesson(lessonId,chapterId,stageId){
    leaveRoadmap(); setActive('learn');
    routeTheory(()=>{
      const stageButton=$$('[data-e129-stage]').find(x=>x.getAttribute('data-e129-stage')===stageId);
      if(stageButton)stageButton.click();
      setTimeout(()=>{
        const chapterButton=$$('[data-e129-chapter]').find(x=>x.getAttribute('data-e129-chapter')===chapterId);
        if(!chapterButton){toast('Reader chưa dựng route cho chương này.');return;}
        chapterButton.click();
        setTimeout(()=>{
          const lessonButton=$$('[data-e129-lesson]').find(x=>x.getAttribute('data-e129-lesson')===lessonId);
          if(lessonButton){lessonButton.click();setActive('learn');scheduleSync(180);}
          else toast('Bài học chưa có route Reader tương ứng.');
        },140);
      },140);
    });
  }

  function setActive(id){
    active=id||'overview';
    if(PRIMARY_ITEMS.some(x=>x.id===active)) document.body.dataset.mathPrimaryRoute=active;
    $$('.math-unified-nav-button').forEach(b=>{
      const on=b.dataset.mathNav===active;
      b.classList.toggle('active',on);
      b.setAttribute('aria-current',on?'page':'false');
    });
  }

  function hiddenTheoryButton(){ return $('[data-e129-nav="theory"]'); }
  function routeTheory(done){
    const btn=hiddenTheoryButton();
    if(btn){ btn.click(); setTimeout(()=>done&&done(),90); return true; }
    try{ global.BAUMAN_MATH_THEORY_E129?.render?.(); setTimeout(()=>done&&done(),120); return true; }catch(_){ return false; }
  }

  function routeActivity(activity,primaryId){
    leaveRoadmap(); setActive(primaryId||activity);
    const e186=global.BAUMAN_MATH_E186_LESSON_FIRST;
    if(e186?.open){
      e186.open('activity');
      setTimeout(()=>{
        const pick=$(`[data-e186-pick="activity"][data-e186-id="${activity}"]`);
        if(pick){pick.click();scheduleSync(180);}
        else toast('Phân mục này chưa có trong route bài học hiện tại.');
      },50);
      return;
    }
    routeTheory(()=>{
      const opener=$('[data-e169-open="activity"]');
      if(!opener){ toast('Chưa tìm thấy Learning Path của bài hiện tại.'); return; }
      opener.click();
      setTimeout(()=>{
        const pick=$(`[data-e169-pick-activity="${activity}"]`);
        if(pick){ pick.click(); scheduleSync(180); }
        else toast('Hoạt động này chưa có route trong chương hiện tại.');
      },70);
    });
  }

  function route(id){
    if(!id) return;
    const alias={theory:'learn',exercises:'practice',application:'practice',exam:'practice'};
    const canonical=alias[id]||id;
    if(canonical==='overview'){
      leaveRoadmap(); setActive('overview'); setPageHeader('Tổng quan','Tiếp tục học, mục tiêu hiện tại và các điểm cần ôn.');
      const view=$('#view'); if(view) view.innerHTML='';
      ($('#mathPremiumDashboard')||$('#mathV2Dashboard')||$('.main'))?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(canonical==='roadmap'){renderRoadmap();return;}
    if(canonical==='learn'){
      leaveRoadmap();setActive('learn');
      if(global.BAUMAN_MATH_LEARNING_FLOW?.resume?.()){scheduleSync(260);return;}
      routeTheory(()=>{$('#view')?.scrollIntoView({behavior:'smooth',block:'start'});scheduleSync(120);});
      return;
    }
    if(canonical==='practice'){routeActivity(id==='practice'?'exercises':id,'practice');return;}
    if(canonical==='review'){routeActivity('review','review');return;}
    if(id==='lab'){leaveRoadmap();global.BAUMAN_MATH_WORKSPACE?.openLab?.();return;}
    if(id==='control'){leaveRoadmap();global.BAUMAN_MATH_WORKSPACE?.openControl?.();return;}
    if(id==='formula'){leaveRoadmap();openFormulaFocus();return;}
    if(id==='resources'){leaveRoadmap();global.BAUMAN_MATH_STUDY_LIBRARY?.open?.();return;}
    if(id==='vault'){
      leaveRoadmap();
      if(global.BAUMAN_MATH_THEORY_E129?.openTheoryVault){global.BAUMAN_MATH_THEORY_E129.openTheoryVault();scheduleSync(150);}
      else toast('Kho dữ liệu chưa sẵn sàng ở màn hiện tại.');
    }
  }

  function collectFormulas(){
    const out=[],seen=new Set();
    const candidates=[...$$('[data-current-lesson] pre'),...$$('.e129-slide pre'),...$$('[data-math-ws-type~="formula"]')];
    candidates.forEach((el,index)=>{
      const text=(el.matches('pre')?el.textContent:(el.querySelector('pre')?.textContent||el.textContent)||'').replace(/\s+$/,'').trim();
      if(!text) return;
      const key=text.replace(/\s+/g,' ').slice(0,220); if(seen.has(key)) return; seen.add(key);
      const host=el.closest('.e129-slide,[data-current-lesson],article,section');
      const title=(host?.querySelector('h2,h3,h4')?.textContent||`Công thức ${out.length+1}`).trim();
      const note=(host?.querySelector('p')?.textContent||'').trim();
      out.push({title,text,note,element:el,index});
    });
    return out.slice(0,60);
  }

  function ensureFormulaFocus(){
    if($('#mathFormulaFocus')) return;
    const layer=document.createElement('section'); layer.id='mathFormulaFocus'; layer.className='math-formula-focus'; layer.setAttribute('role','dialog'); layer.setAttribute('aria-modal','true'); layer.setAttribute('aria-labelledby','mathFormulaFocusTitle'); layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<div class="math-formula-focus-shell"><header class="math-formula-focus-head"><div><span class="math-formula-focus-kicker">Formula Focus</span><h2 id="mathFormulaFocusTitle">Công thức trong bài đang mở</h2><p>Đọc trực tiếp từ Reader hiện tại; không tạo hay sửa công thức nguồn.</p></div><button type="button" class="math-formula-close" data-formula-close aria-label="Đóng công thức">×</button></header><div class="math-formula-focus-body"><nav id="mathFormulaIndex" class="math-formula-index"></nav><main id="mathFormulaStage" class="math-formula-stage"></main></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer||e.target.closest('[data-formula-close]')) closeFormulaFocus(); });
  }

  function renderFormulaFocus(selected=0){
    ensureFormulaFocus(); const list=collectFormulas(), index=$('#mathFormulaIndex'), stage=$('#mathFormulaStage');
    if(!index||!stage) return;
    if(!list.length){ index.innerHTML='<div class="math-formula-stage-empty">Chưa phát hiện block công thức trong bài đang mở.</div>'; stage.innerHTML='<div class="math-formula-stage-empty">Mở một bài có công thức trong E129 Reader hoặc dùng Math Lab để tiếp tục.</div>'; return; }
    const pick=Math.max(0,Math.min(selected,list.length-1)), item=list[pick];
    index.innerHTML=list.map((x,i)=>`<button type="button" data-formula-index="${i}" class="${i===pick?'active':''}">${esc(x.title.slice(0,95))}</button>`).join('');
    stage.innerHTML=`<article class="math-formula-stage-card"><span>Công thức ${pick+1}/${list.length}</span><pre>${esc(item.text)}</pre>${item.note?`<p>${esc(item.note.slice(0,700))}</p>`:''}</article>`;
    $$('[data-formula-index]',index).forEach(b=>b.addEventListener('click',()=>renderFormulaFocus(Number(b.dataset.formulaIndex)||0)));
  }
  function openFormulaFocus(){ formulaFocus=document.activeElement;renderFormulaFocus(0);const layer=$('#mathFormulaFocus');layer?.classList.add('open');layer?.setAttribute('aria-hidden','false');setTimeout(()=>$('.math-formula-close',layer)?.focus(),20); }
  function closeFormulaFocus(){ const layer=$('#mathFormulaFocus');layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');if(formulaFocus&&typeof formulaFocus.focus==='function')setTimeout(()=>formulaFocus.focus(),0);formulaFocus=null; }

  function ensureCommand(){
    if($('#mathCommandPalette')) return;
    const layer=document.createElement('section'); layer.id='mathCommandPalette'; layer.className='math-command-palette'; layer.setAttribute('role','dialog'); layer.setAttribute('aria-modal','true'); layer.setAttribute('aria-label','Đi tới chức năng hoặc tài nguyên'); layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<div class="math-command-shell"><input id="mathCommandSearch" class="math-command-search" type="search" autocomplete="off" aria-label="Tìm chức năng hoặc tài nguyên" placeholder="Đi tới: Học, Tài nguyên, Mô phỏng, Công thức…"><div id="mathCommandList" class="math-command-list"></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer) closeCommand(); });
    $('#mathCommandSearch')?.addEventListener('input',renderCommandList);
    $('#mathCommandSearch')?.addEventListener('keydown',e=>{
      const rows=$$('.math-command-item').filter(x=>x.offsetParent!==null); let idx=rows.findIndex(x=>x.classList.contains('active'));
      if(e.key==='ArrowDown'){e.preventDefault();idx=(idx+1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='ArrowUp'){e.preventDefault();idx=(idx-1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='Enter'){e.preventDefault();(rows[idx>=0?idx:0])?.click();}
      if(e.key==='Escape'){closeCommand();}
    });
  }
  function renderCommandList(){
    ensureCommand(); const value=($('#mathCommandSearch')?.value||'').toLocaleLowerCase('vi').trim(); const list=ITEMS.filter(x=>!value||`${x.label} ${x.sub} ${x.group}`.toLocaleLowerCase('vi').includes(value));
    const host=$('#mathCommandList'); if(!host)return;
    host.innerHTML=list.map((x,i)=>`<button type="button" class="math-command-item ${i===0?'active':''}" data-command-route="${x.id}"><i>${x.icon}</i><span><b>${esc(x.label)}</b><small>${esc(x.group)} · ${esc(x.sub)}</small></span><kbd>${esc(x.key)}</kbd></button>`).join('')||'<div class="math-formula-stage-empty">Không có chức năng phù hợp.</div>';
    $$('[data-command-route]',host).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.commandRoute;closeCommand();route(id);}));
  }
  function openCommand(){ ensureCommand();commandFocus=document.activeElement;renderCommandList();const layer=$('#mathCommandPalette');layer?.classList.add('open');layer?.setAttribute('aria-hidden','false'); const s=$('#mathCommandSearch'); if(s){s.value='';s.focus();renderCommandList();} }
  function closeCommand(){ const layer=$('#mathCommandPalette');layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');if(commandFocus&&typeof commandFocus.focus==='function')setTimeout(()=>commandFocus.focus(),0);commandFocus=null; }

  function syncFromRuntime(){
    if(document.body.classList.contains('math-roadmap-active')){setActive('roadmap');return;}
    if(document.body.classList.contains('e129-theory-storage')) return;
    const title=($('#pageTitle')?.textContent||'').toLocaleLowerCase('vi');
    if(title.includes('ôn tập')) setActive('review');
    else if(title.includes('bài tập')||title.includes('thực hành')||title.includes('ứng dụng')||title.includes('kiểm tra')) setActive('practice');
    else if(title.includes('lý thuyết')||document.querySelector('[data-current-lesson]')) setActive('learn');
  }
  function scheduleSync(ms=100){clearTimeout(timer);timer=setTimeout(()=>{ensureNav();syncFromRuntime();global.BAUMAN_MATH_PREMIUM?.refresh?.();global.BAUMAN_MATH_DASHBOARD_V2?.refresh?.();},ms);}

  function bind(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-math-nav]'); if(nav){e.preventDefault();route(nav.dataset.mathNav);return;}
      const stage=e.target.closest('[data-math-roadmap-stage]'); if(stage){e.preventDefault();renderRoadmap(stage.dataset.mathRoadmapStage);return;}
      const chapter=e.target.closest('[data-math-roadmap-chapter]'); if(chapter){e.preventDefault();openRoadmapChapter(chapter.dataset.mathRoadmapChapter,chapter.dataset.mathRoadmapStageId);return;}
      const lesson=e.target.closest('[data-math-chapter-lesson]'); if(lesson){e.preventDefault();openChapterLesson(lesson.dataset.mathChapterLesson,lesson.dataset.mathChapterId,lesson.dataset.mathChapterStage);return;}
      const back=e.target.closest('[data-math-chapter-back]'); if(back){e.preventDefault();renderRoadmap(back.dataset.mathChapterBack);return;}
      const sys=e.target.closest('[data-math-system]'); if(sys){e.preventDefault();const a=sys.dataset.mathSystem;if(a==='command')openCommand();if(a==='focus')global.BAUMAN_MATH_WORKSPACE?.openControl?.();if(a==='theme')$('#themeBtn')?.click();return;}
      if(e.target.closest('[data-e129-nav],[data-e186-pick],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-open-vault],[data-e129-refresh]')) scheduleSync(160);
    },true);
    document.addEventListener('keydown',e=>{
      const openLayer=$('#mathCommandPalette.open')||$('#mathFormulaFocus.open');
      if(e.key==='Tab'&&openLayer){
        const focusable=$('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',openLayer).filter(x=>x.offsetParent!==null);
        if(focusable.length){
          const first=focusable[0],last=focusable[focusable.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();return;}
          if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();return;}
        }
      }
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();return;}
      if(e.key==='Escape'){closeCommand();closeFormulaFocus();}
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&document.activeElement===document.body){
        const hit=ITEMS.find(x=>x.key.toLowerCase()===e.key.toLowerCase()); if(hit) route(hit.id);
      }
    });
  }

  function selfCheck(){return{release:RELEASE,ready:document.body.classList.contains('math-nav-ready'),primaryItems:PRIMARY_ITEMS.length,advancedItems:ADVANCED_ITEMS.length,roadmap:!!roadmapCache,e129:!!global.BAUMAN_MATH_THEORY_E129,e186:!!global.BAUMAN_MATH_E186_LESSON_FIRST,workspace:!!global.BAUMAN_MATH_WORKSPACE,mutationObserver:false,academicWrites:false,learnerFirstIA:true};}
  function init(){
    if(!document.body||document.body.dataset.mathUnifiedNav==='1')return;
    document.body.dataset.mathUnifiedNav='1';document.body.classList.add('math-nav-ready');ensureFormulaFocus();ensureCommand();bind();ensureNav();setActive(active);
    [250,700,1400,2400].forEach(ms=>setTimeout(()=>{ensureNav();syncFromRuntime();},ms));
    global.BAUMAN_MATH_NAVIGATION={release:RELEASE,route,openCommand,openFormulaFocus,refresh:()=>{ensureNav();syncFromRuntime();},selfCheck};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
