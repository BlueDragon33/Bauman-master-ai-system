/* E129 · Theory Tab Frame/Content Shell
 * Purpose: render a clean Theory tab from DataVault frame/content sources.
 * E126 and E128 remain compatibility layers until later cleanup rounds.
 */
(function(){
  'use strict';
  var RELEASE = 'E129_THEORY_FRAME_CONTENT_SHELL';
  var CONTRACT = {
    release: RELEASE,
    contractDoc: 'subjects/math/THEORY_TAB_CONTRACT_E129.md',
    status: 'frame_content_shell_active',
    runtimeBehavior: 'e129_renders_theory_shell_from_frame_content',
    primaryFrameSource: 'theory_lecture_frame',
    primaryFramePath: 'data/theory_lecture_frame.json',
    primaryContentSource: 'theory_lecture_content',
    primaryContentPath: 'data/theory_lecture_content.json',
    legacySource: 'lessons',
    legacyPath: 'data/lessons.json',
    legacyRole: 'compatibility_fallback_only',
    activeStages: ['vn','prep','hk1','hk2','hk3','hk4'],
    activeStageNos: [0,1,2,3,4,5],
    activeChapterRange: { min: 1, max: 40 },
    frameworkOnlyStages: ['phd_bridge','phd_y1','phd_y2','phd_thesis'],
    frameworkOnlyChapterRange: { min: 41, max: 56 },
    storageRoute: {
      view: 'storage',
      domain: 'theory',
      group: 'Bài giảng lý thuyết',
      defaultFrameFile: 'theory_lecture_frame',
      defaultContentFile: 'theory_lecture_content',
      legacyFile: 'lessons'
    },
    renderStates: {
      frameOnly: 'show_clean_placeholder_from_frame',
      frameAndContent: 'show_full_theory_reader',
      legacyFallback: 'show_lessons_with_compatibility_badge'
    },
    requiredContentFields: ['lessonId','chapterId','lessonTitle|title','slides'],
    preferredSlideRoles: [
      'problem_framing','deep_essence','counter_intuition','real_bridge',
      'notation','core_formula','assumption_gate','mini_case',
      'interpretation','simulation','common_mistakes','application',
      'practice','professor_qa','bridge','takeaway'
    ],
    forbidden: [
      'hard_code_academic_tree_into_ui',
      'make_lessons_json_primary_again',
      'merge_frame_and_content_into_one_giant_json',
      'break_storage_overview_planning_mindmap_other_tabs'
    ]
  };

  var cache = { frame:null, content:null, legacy:null, chapters:[], records:[], legacyLessons:[], loaded:false, loading:false, error:null };
  var stageLabels = {vn:'GĐ0 · Việt Nam',prep:'GĐ1 · Dự bị Nga',hk1:'GĐ2 · ThS năm 1 HK1',hk2:'GĐ3 · ThS năm 1 HK2',hk3:'GĐ4 · ThS năm 2 HK3',hk4:'GĐ5 · VKR',phd_bridge:'GĐ6 · Cầu nối TS',phd_y1:'GĐ7 · TS năm 1',phd_y2:'GĐ8 · TS năm 2',phd_thesis:'GĐ9 · Luận án'};

  function arr(v){ return Array.isArray(v) ? v : []; }
  function S(v){ return String(v == null ? '' : v); }
  function H(v){ return S(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function clip(v,n){ var s=S(v).replace(/\s+/g,' ').trim(); n=n||120; return s.length>n?s.slice(0,n-1)+'…':s; }
  function db(){ return window.DB || {}; }
  function api(){ return window.__BAUMAN_CORE_API || {}; }
  function state(){
    var st = api().state || window.__MATH_STATE;
    if(!st){ st = { view:'learning', learnTab:'theory', stage:'vn' }; window.__MATH_STATE = st; }
    if(!st.stage) st.stage = 'vn';
    if(!st.view) st.view = 'learning';
    if(!st.learnTab) st.learnTab = 'theory';
    return st;
  }
  function save(){ try{ api().save && api().save(); }catch(_){ } }
  function isTheoryState(){ var st=state(); return S(st.view)==='learning' && S(st.learnTab||'theory')==='theory'; }
  function shouldRenderE129(){ return isTheoryState() || !window.__BAUMAN_CORE_API; }
  function setHeader(title,sub){
    try{
      var pageTitle=document.getElementById('pageTitle'); if(pageTitle) pageTitle.textContent=title||'Lý thuyết';
      var pageSub=document.getElementById('pageSub'); if(pageSub) pageSub.textContent=sub||'E129 · DataVault frame/content';
      var core=document.getElementById('coreLabel'); if(core) core.textContent='MATH · E129 Theory Shell';
      document.documentElement.setAttribute('data-theory-contract', RELEASE);
    }catch(_){ }
  }
  function fetchJson(path,fallback){
    return fetch(path,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error(path+' HTTP '+r.status); return r.text(); }).then(function(txt){
      if(!txt || !txt.trim()) return fallback;
      return JSON.parse(txt);
    }).catch(function(e){ cache.error = e; return fallback; });
  }
  function extractRecords(raw){
    if(Array.isArray(raw)) return raw;
    if(raw && Array.isArray(raw.records)) return raw.records;
    if(raw && Array.isArray(raw.lessons)) return raw.lessons;
    if(raw && Array.isArray(raw.items)) return raw.items;
    if(raw && Array.isArray(raw.content)) return raw.content;
    if(raw && raw.data) return extractRecords(raw.data);
    return [];
  }
  function normalizeFrame(raw){
    var out=[];
    if(Array.isArray(raw)){
      raw.forEach(function(ch){ out.push(normalizeChapter(ch, ch.stageId||ch.stage||'vn', ch.stageTitle||'', ch.disciplineId||'', ch.disciplineTitle||'')); });
      return out.filter(Boolean);
    }
    arr(raw && raw.stages).forEach(function(stage){
      arr(stage.disciplines).forEach(function(disc){
        arr(disc.chapters).forEach(function(ch){ out.push(normalizeChapter(ch, stage.stageId, stage.stageTitle, disc.disciplineId, disc.disciplineTitle)); });
      });
    });
    return out.filter(Boolean);
  }
  function normalizeChapter(ch,stageId,stageTitle,disciplineId,disciplineTitle){
    if(!ch) return null;
    var id=S(ch.chapterId||ch.id).trim();
    if(!id) return null;
    return {
      chapterId:id,
      chapterNo:Number(ch.chapterNo||ch.localChapterNo||ch.globalChapterNo||0)||0,
      chapterTitle:S(ch.chapterTitle||ch.globalChapterTitle||ch.title||id),
      stageId:S(ch.stageId||stageId||'vn'),
      stageTitle:S(ch.stageTitle||stageTitle||stageLabels[stageId]||stageId||''),
      disciplineId:S(ch.disciplineId||disciplineId||''),
      disciplineTitle:S(ch.disciplineTitle||disciplineTitle||'Chưa phân môn'),
      secondaryDisciplineIds:arr(ch.secondaryDisciplineIds),
      pureLayer:arr(ch.pureLayer),
      appliedLayer:arr(ch.appliedLayer),
      bridgeQuestion:S(ch.bridgeQuestion||''),
      targetOutcome:S(ch.targetOutcome||''),
      suggestedLessonCount:Number(ch.suggestedLessonCount||0)||0,
      contentStatus:S(ch.contentStatus||'')
    };
  }
  function normalizeRecord(r){
    if(!r || typeof r!=='object') return null;
    var id=S(r.lessonId||r.id).trim();
    var chapterId=S(r.chapterId||r.sourceChapterId||(r.sourceAnchors&&r.sourceAnchors.chapterId)||'').trim();
    if(!id && !chapterId) return null;
    return Object.assign({},r,{lessonId:id||('lesson_'+chapterId),chapterId:chapterId,title:S(r.lessonTitle||r.title||r.displayTitle||id||'Bài giảng')});
  }
  function rebuildFromDb(){
    if(!cache.frame && db().theory_lecture_frame) cache.frame = db().theory_lecture_frame;
    if(!cache.content && db().theory_lecture_content) cache.content = db().theory_lecture_content;
    if(!cache.legacy && db().lessons) cache.legacy = db().lessons;
    cache.chapters = normalizeFrame(cache.frame||{});
    cache.records = extractRecords(cache.content||{}).map(normalizeRecord).filter(Boolean);
    cache.legacyLessons = extractRecords(cache.legacy||{}).map(normalizeRecord).filter(Boolean);
  }
  function loadData(){
    if(cache.loaded) return Promise.resolve(cache);
    if(cache.loading) return new Promise(function(resolve){ var t=setInterval(function(){ if(cache.loaded||cache.error){ clearInterval(t); resolve(cache); } },80); });
    cache.loading = true;
    return Promise.all([
      fetchJson(CONTRACT.primaryFramePath,{}),
      fetchJson(CONTRACT.primaryContentPath,{records:[]}),
      fetchJson(CONTRACT.legacyPath,[])
    ]).then(function(items){
      cache.frame = items[0]; cache.content = items[1]; cache.legacy = items[2];
      rebuildFromDb(); cache.loaded = true; cache.loading = false; return cache;
    });
  }
  function countSource(name){
    if(name===CONTRACT.primaryFrameSource) return cache.chapters.length || (db().theory_lecture_frame ? 1 : 0);
    if(name===CONTRACT.primaryContentSource) return cache.records.length;
    if(name===CONTRACT.legacySource) return cache.legacyLessons.length;
    var value = db()[name];
    if(Array.isArray(value)) return value.length;
    if(value && Array.isArray(value.records)) return value.records.length;
    if(value && Array.isArray(value.lessons)) return value.lessons.length;
    if(value && Array.isArray(value.items)) return value.items.length;
    return value ? 1 : 0;
  }
  function sourceStatus(){
    rebuildFromDb();
    return { frame: countSource(CONTRACT.primaryFrameSource), content: countSource(CONTRACT.primaryContentSource), legacy: countSource(CONTRACT.legacySource), frameSource: CONTRACT.primaryFrameSource, contentSource: CONTRACT.primaryContentSource, legacySource: CONTRACT.legacySource };
  }
  function applyAdapterMetadata(){
    var A = window.SUBJECT_ADAPTER;
    if(!A) return false;
    A.version = RELEASE; A.release = RELEASE; A.latestPatch = RELEASE; A.theoryContract = CONTRACT;
    A.dataSourceMeta = A.dataSourceMeta || {};
    A.dataSourceMeta.theory_lecture_frame = Object.assign({}, A.dataSourceMeta.theory_lecture_frame || {}, { label:'Bài giảng lý thuyết · Khung', path:CONTRACT.primaryFramePath, group:'Bài giảng lý thuyết', required:true, plannedCount:56, description:'E129 primary frame source: stage/discipline/chapter shell, not long lecture content.' });
    A.dataSourceMeta.theory_lecture_content = Object.assign({}, A.dataSourceMeta.theory_lecture_content || {}, { label:'Bài giảng lý thuyết · Nội dung', path:CONTRACT.primaryContentPath, group:'Bài giảng lý thuyết', required:true, plannedCount:0, description:'E129 primary content source: lesson records/slides keyed by lessonId and chapterId.' });
    A.dataSourceMeta.lessons = Object.assign({}, A.dataSourceMeta.lessons || {}, { label:'Bài giảng cũ / tương thích', path:CONTRACT.legacyPath, group:'Tương thích', required:false, description:'E129 compatibility fallback only. New Theory imports must target theory_lecture_content.' });
    A.ui = A.ui || {};
    A.ui.coreLabel='MATH · E129 Theory Shell'; A.ui.heroBadge='Math Bauman · E129'; A.ui.heroTitle='Toán Bauman · Theory Frame/Content Shell'; A.ui.subtitle='Lý thuyết thống nhất theo DataVault frame/content';
    A.ui.overviewSubtitle='E129: khung đọc từ theory_lecture_frame, nội dung đọc từ theory_lecture_content, lessons chỉ là tương thích.';
    A.ui.learningSubtitle='Tab Lý thuyết hiển thị được cả khi mới có khung, sau đó đọc bài giảng thật từ Dữ liệu môn học.';
    A.ui.storageSubtitle='Kho môn học ưu tiên cặp Lý thuyết: Khung môn học và Dữ liệu môn học; lessons chỉ dùng khi cần tương thích.';
    A.ui.assistantToast='E129: Theory shell đã đọc frame/content; E126/E128 giữ làm compatibility.';
    return true;
  }
  function currentStage(){ return S(state().e129Stage||state().stage||'vn'); }
  function stageChapters(){
    var q=S(state().e129Query||'').toLowerCase().trim();
    return cache.chapters.filter(function(ch){
      var okStage = ch.stageId===currentStage();
      var text = [ch.chapterTitle,ch.disciplineTitle,ch.bridgeQuestion,ch.targetOutcome,ch.pureLayer.join(' '),ch.appliedLayer.join(' ')].join(' ').toLowerCase();
      return okStage && (!q || text.indexOf(q)>=0);
    });
  }
  function pickChapter(list){
    var id=S(state().e129ChapterId||'');
    var hit=list.find(function(ch){return ch.chapterId===id;});
    if(hit) return hit;
    hit=list[0]||cache.chapters.find(function(ch){return ch.stageId===currentStage();})||cache.chapters[0]||null;
    if(hit) state().e129ChapterId=hit.chapterId;
    return hit;
  }
  function recordsForChapter(ch){ if(!ch) return []; return cache.records.filter(function(r){return r.chapterId===ch.chapterId;}); }
  function legacyForChapter(ch){ if(!ch) return []; return cache.legacyLessons.filter(function(r){return r.chapterId===ch.chapterId || Number(r.sourceChapterNo||0)===ch.chapterNo;}); }
  function groupByDiscipline(list){
    var groups=[]; var map={};
    list.forEach(function(ch){ var k=ch.disciplineId||ch.disciplineTitle||'other'; if(!map[k]){map[k]={id:k,title:ch.disciplineTitle||'Chưa phân môn',chapters:[]};groups.push(map[k]);} map[k].chapters.push(ch); });
    return groups;
  }
  function renderTree(list,current){
    if(!list.length) return '<div class="e129-empty">Không có chương phù hợp bộ lọc.</div>';
    return groupByDiscipline(list).map(function(g){
      return '<section class="e129-disc"><div class="e129-disc-title">'+H(g.title)+'</div>'+g.chapters.map(function(ch){
        var count=recordsForChapter(ch).length; var legacy=legacyForChapter(ch).length; var active=current&&current.chapterId===ch.chapterId;
        return '<button class="e129-chapter-btn '+(active?'active':'')+'" data-e129-chapter="'+H(ch.chapterId)+'"><b>'+H(ch.chapterTitle)+'</b><span>'+H(ch.bridgeQuestion||ch.targetOutcome||'Khung đã sẵn sàng nhập nội dung')+'</span><span>'+count+' bài nội dung · '+legacy+' legacy</span></button>';
      }).join('')+'</section>';
    }).join('');
  }
  function pillList(items){ items=arr(items).filter(Boolean); return items.length?'<div class="e129-pill-row">'+items.map(function(x){return '<span class="e129-pill">'+H(x)+'</span>';}).join('')+'</div>':'<p class="e129-muted">Chưa có dữ liệu lớp này trong khung.</p>'; }
  function blockHtml(b){
    if(!b || typeof b!=='object') return '<p>'+H(b)+'</p>';
    var title=S(b.title||b.type||'Nội dung'); var body=S(b.body||b.content||b.text||'');
    if((S(b.type).toLowerCase()==='formula') || /formula|công thức|ký hiệu/i.test(title)) return '<pre>'+H(title+'\n'+body)+'</pre>';
    return '<h3>'+H(title)+'</h3><p>'+H(body||'Chưa có nội dung chi tiết.')+'</p>';
  }
  function slideHtml(sl,i){
    var blocks=arr(sl&&sl.blocks);
    return '<article class="e129-slide"><h3>'+(i+1)+'. '+H(sl&& (sl.title||sl.role) || 'Slide')+'</h3>'+(blocks.length?blocks.map(blockHtml).join(''):'<p>'+H(sl&& (sl.body||sl.content||sl.text) || 'Slide chưa có block chi tiết.')+'</p>')+'</article>';
  }
  function renderContent(ch,records,legacy){
    if(records.length){
      var chosenId=S(state().e129LessonId||records[0].lessonId); var rec=records.find(function(r){return r.lessonId===chosenId;})||records[0]; state().e129LessonId=rec.lessonId;
      var slides=arr(rec.slides);
      return '<section class="e129-placeholder"><span class="e129-badge">Dữ liệu môn học · theory_lecture_content</span><h2>'+H(rec.title)+'</h2><p class="e129-muted">lessonId: <code>'+H(rec.lessonId)+'</code> · chapterId: <code>'+H(rec.chapterId)+'</code></p><div class="e129-pill-row">'+records.map(function(r){return '<button class="e129-chip-btn '+(r.lessonId===rec.lessonId?'active':'')+'" data-e129-lesson="'+H(r.lessonId)+'">'+H(clip(r.title,44))+'</button>';}).join('')+'</div><div class="e129-slide-list">'+(slides.length?slides.map(slideHtml).join(''):'<article class="e129-slide"><h3>Chưa có slide</h3><p>Record đã tồn tại nhưng chưa có mảng slides hợp lệ.</p></article>')+'</div></section>';
    }
    if(legacy.length){
      var l=legacy[0];
      return '<section class="e129-placeholder"><span class="e129-badge">Compatibility: lessons.json fallback</span><h2>'+H(l.title||'Bài legacy')+'</h2><p>Chương này có dữ liệu cũ trong <code>lessons.json</code>. E129 chỉ dùng để xem tương thích; nhập mới vẫn phải đi vào <code>theory_lecture_content.json</code>.</p><div class="e129-slide-list">'+arr(l.slides).map(slideHtml).join('')+'</div></section>';
    }
    return '<section class="e129-placeholder"><span class="e129-badge">Frame-only · chờ nội dung</span><h2>Chưa có nội dung bài giảng</h2><p>Khung chương đã có trong <code>theory_lecture_frame.json</code>, nhưng chưa có record tương ứng trong <code>theory_lecture_content.json</code>.</p><ol><li>Giữ nguyên <code>chapterId</code>: <code>'+H(ch&&ch.chapterId)+'</code></li><li>Tạo record có <code>lessonId</code>, <code>chapterId</code>, <code>lessonTitle/title</code>, <code>slides</code>.</li><li>Nhập qua Kho môn học → Học tập → Lý thuyết → Dữ liệu môn học.</li></ol></section>';
  }
  function renderTheory(){
    var view=document.getElementById('view'); if(!view) return false;
    rebuildFromDb();
    if(!cache.chapters.length){ view.innerHTML='<section class="e129-panel e129-reader"><span class="e129-badge">E129</span><h1>Chưa tải được khung Lý thuyết</h1><p class="e129-muted">Kiểm tra <code>data/theory_lecture_frame.json</code> hoặc chạy bằng Live Server.</p></section>'; return false; }
    state().view='learning'; state().learnTab='theory';
    var list=stageChapters(); var ch=pickChapter(list); var records=recordsForChapter(ch); var legacy=legacyForChapter(ch); var status=sourceStatus();
    setHeader('Lý thuyết','E129 · Frame/content shell · '+status.frame+' chương khung · '+status.content+' record nội dung · '+status.legacy+' legacy');
    var stages=CONTRACT.activeStages.concat(CONTRACT.frameworkOnlyStages);
    view.innerHTML='<main class="e129-theory-shell '+(state().e129Present?'presenting':'')+'" data-e129-release="'+RELEASE+'"><aside class="e129-panel e129-sidebar"><div class="e129-side-head"><span class="e129-badge">E129 · Theory Shell</span><h2>Khung Lý thuyết</h2><p>Đọc khung từ <code>theory_lecture_frame</code>, nội dung từ <code>theory_lecture_content</code>.</p><input class="e129-search" data-e129-query placeholder="Tìm chương, phân môn, bridge..." value="'+H(state().e129Query||'')+'"><div class="e129-status"><div class="e129-stat"><b>'+status.frame+'</b><span>khung</span></div><div class="e129-stat"><b>'+status.content+'</b><span>content</span></div><div class="e129-stat"><b>'+status.legacy+'</b><span>legacy</span></div></div></div><div class="e129-stage-tabs">'+stages.map(function(st){return '<button class="'+(currentStage()===st?'active':'')+'" data-e129-stage="'+H(st)+'">'+H(stageLabels[st]||st)+'</button>';}).join('')+'</div><div class="e129-tree">'+renderTree(list,ch)+'</div></aside><section class="e129-panel e129-reader"><header class="e129-reader-head"><div><div class="e129-kicker">'+H(ch&&ch.stageTitle)+' · '+H(ch&&ch.disciplineTitle)+'</div><h1>'+H(ch&&ch.chapterTitle||'Chọn chương')+'</h1><p class="e129-muted">'+H(ch&& (ch.targetOutcome||ch.bridgeQuestion) || 'Khung đã sẵn sàng. Nội dung sẽ đi vào DataVault.')+'</p></div><div class="e129-actions"><button class="e129-action primary" data-e129-open-vault>Kho Lý thuyết</button><button class="e129-action ghost" data-e129-present>'+(state().e129Present?'Thoát trình chiếu':'Trình chiếu')+'</button><button class="e129-action ghost" data-e129-refresh>Tải lại JSON</button></div></header><div class="e129-grid"><article class="e129-card"><h3>Câu hỏi cầu nối</h3><p>'+H(ch&&ch.bridgeQuestion||'Chưa có bridgeQuestion trong khung.')+'</p></article><article class="e129-card"><h3>Lớp thuần túy</h3>'+pillList(ch&&ch.pureLayer)+'</article><article class="e129-card"><h3>Lớp ứng dụng</h3>'+pillList(ch&&ch.appliedLayer)+'</article></div>'+renderContent(ch,records,legacy)+'</section></main>';
    document.body.classList.toggle('e129-presenting',!!state().e129Present);
    return true;
  }
  function renderStorage(){
    var view=document.getElementById('view'); if(!view) return false;
    state().view='storage'; setHeader('Kho Lý thuyết','E129 · Mở đúng cặp Khung môn học / Dữ liệu môn học');
    var status=sourceStatus();
    view.innerHTML='<main class="e129-theory-shell"><section class="e129-panel e129-reader"><span class="e129-badge">Kho môn học → Học tập → Lý thuyết</span><h1>DataVault Lý thuyết</h1><p class="e129-muted">Lượt 4 chỉ dựng route rõ ràng. Importer chuyên dụng sẽ được nối sâu ở lượt sau.</p><div class="e129-grid"><article class="e129-card"><h3>Khung môn học</h3><p><code>theory_lecture_frame.json</code></p><p>'+status.frame+' chương/frame đang sẵn sàng.</p></article><article class="e129-card"><h3>Dữ liệu môn học</h3><p><code>theory_lecture_content.json</code></p><p>'+status.content+' record nội dung hiện có.</p></article><article class="e129-card"><h3>Legacy</h3><p><code>lessons.json</code></p><p>'+status.legacy+' bài tương thích. Không dùng làm nguồn chính.</p></article></div><div class="e129-placeholder"><h2>Luật nhập mới</h2><ol><li>Nhập bài mới vào <code>theory_lecture_content</code>.</li><li>Không sửa cây chương trong content.</li><li>Không đưa <code>lessons.json</code> thành nguồn chính.</li></ol><button class="e129-action primary" data-e129-back-theory>Quay lại Lý thuyết</button></div></section></main>';
    return true;
  }
  function buildHostNav(){
    var nav=document.getElementById('nav');
    if(nav && !nav.querySelector('[data-e129-nav]')){
      nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-e129-nav="theory">📘 Lý thuyết E129</button><button class="nav-item" data-e129-nav="storage">🗄 Kho Lý thuyết</button>');
    }
    var stageSel=document.getElementById('stageSelect');
    if(stageSel && !stageSel.querySelector('option[data-e129-stage]')){
      stageSel.innerHTML=CONTRACT.activeStages.concat(CONTRACT.frameworkOnlyStages).map(function(st){return '<option data-e129-stage="1" value="'+H(st)+'">'+H(stageLabels[st]||st)+'</option>';}).join('');
      stageSel.value=currentStage();
    }
  }
  function openTheoryVault(){
    var st=state(); st.view='storage'; st.storageDomain='theory'; st.storageFile=CONTRACT.storageRoute.defaultContentFile; st.storageFrameFile=CONTRACT.storageRoute.defaultFrameFile; st.storageContentFile=CONTRACT.storageRoute.defaultContentFile; st.storageLegacyFile=CONTRACT.storageRoute.legacyFile; save(); renderStorage(); return st;
  }
  function render(){
    applyAdapterMetadata(); buildHostNav();
    if(state().view==='storage' && state().storageDomain==='theory') return renderStorage();
    if(shouldRenderE129()) return renderTheory();
    return false;
  }
  function scheduleRender(delay){ setTimeout(function(){ loadData().then(render); },delay||0); }
  function selfCheck(){ var status=sourceStatus(); return { ok:!!(cache.chapters.length||status.frame), release:RELEASE, contractDoc:CONTRACT.contractDoc, adapterMarked:!!(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.theoryContract), sources:status, primaryFrameSource:CONTRACT.primaryFrameSource, primaryContentSource:CONTRACT.primaryContentSource, legacySource:CONTRACT.legacySource, renderReplacement:true, frameOnlyRenderable:cache.chapters.length>0, note:'E129 shell is active. E126/E128 remain compatibility layers.' }; }

  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-e129-stage],[data-e129-chapter],[data-e129-lesson],[data-e129-open-vault],[data-e129-present],[data-e129-refresh],[data-e129-back-theory],[data-e129-nav]'); if(!t) return;
    var st=state();
    if(t.hasAttribute('data-e129-nav')){ var v=t.getAttribute('data-e129-nav'); if(v==='storage'){openTheoryVault();}else{st.view='learning';st.learnTab='theory';renderTheory();} e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-stage')){ st.e129Stage=t.getAttribute('data-e129-stage'); st.stage=st.e129Stage; st.e129ChapterId=''; st.e129LessonId=''; st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-chapter')){ st.e129ChapterId=t.getAttribute('data-e129-chapter'); st.e129LessonId=''; st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-lesson')){ st.e129LessonId=t.getAttribute('data-e129-lesson'); renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-open-vault')){ openTheoryVault(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-present')){ st.e129Present=!st.e129Present; renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-refresh')){ cache.loaded=false; cache.loading=false; loadData().then(renderTheory); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-back-theory')){ st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
  },true);
  document.addEventListener('input',function(e){ if(e.target&&e.target.matches&&e.target.matches('[data-e129-query]')){ state().e129Query=e.target.value||''; renderTheory(); } },true);
  document.addEventListener('change',function(e){ if(e.target&&e.target.id==='stageSelect'&&e.target.querySelector('option[data-e129-stage]')){ state().e129Stage=e.target.value; state().stage=e.target.value; state().e129ChapterId=''; renderTheory(); } },true);

  window.BAUMAN_MATH_THEORY_E129_CONTRACT = CONTRACT;
  window.BAUMAN_MATH_THEORY_E129 = { release:RELEASE, contract:CONTRACT, applyAdapterMetadata:applyAdapterMetadata, sourceStatus:sourceStatus, openTheoryVault:openTheoryVault, render:render, selfCheck:selfCheck };
  window.BAUMAN_MATH_E129_OWNS_THEORY = true;

  applyAdapterMetadata();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ scheduleRender(0); scheduleRender(650); });
  else { scheduleRender(0); scheduleRender(650); }
})();
