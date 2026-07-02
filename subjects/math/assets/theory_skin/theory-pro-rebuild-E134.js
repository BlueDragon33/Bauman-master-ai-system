/* E134 · Clean professional Theory tab rebuild for Math. */
(function(){
  'use strict';

  var PATCH = 'E134_MATH_THEORY_PRO_REBUILD';
  var applying = false;
  var restoreSearchFocus = false;
  var STAGE_TO_MAIN = {0:'vn',1:'prep',2:'hk1',3:'hk2',4:'hk3',5:'hk4'};
  var MAIN_TO_STAGE = {vn:0,prep:1,hk1:2,hk2:3,hk3:4,hk4:5};
  var LEARN_MODES = [
    ['theory','📘','Lý thuyết'],
    ['exercises','📝','Bài tập'],
    ['practice','🧩','Ứng dụng'],
    ['review','🔁','Ôn tập'],
    ['exam','🧪','Kiểm tra']
  ];

  function api(){return window.__BAUMAN_CORE_API || {};}
  function st(){try{return api().state || window.__MATH_STATE || {};}catch(_){return window.__MATH_STATE || {};}}
  function db(){return window.DB || {};}
  function arr(x){return Array.isArray(x) ? x : [];}
  function s(x){return x == null ? '' : String(x);}
  function esc(x){return s(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function plain(x){return s(x).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
  function norm(x){try{return plain(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return plain(x).toLowerCase();}}
  function clip(x,n){x=plain(x); n=n || 120; return x.length > n ? x.slice(0,n-1) + '…' : x;}
  function pad(n){return String(Number(n || 0) + 1).padStart(2,'0');}
  function lessonId(l){return s(l && (l.lessonId || l.id));}
  function stageNo(l){var n = Number(l && (l.sourceStageNo != null ? l.sourceStageNo : l.stageNo)); if(isFinite(n))return n; return MAIN_TO_STAGE[s(l && l.stage)] || 0;}
  function chapterNo(l){var n = Number(l && (l.sourceChapterNo != null ? l.sourceChapterNo : l.chapterNo)); return isFinite(n) ? n : 0;}
  function lessonTitle(l){return s(l && (l.displayTitle || l.shortTitle || l.title || lessonId(l) || 'Bài lý thuyết'));}
  function chapterTitle(l){return s(l && (l.chapterTitle || (l.sourceAnchors && l.sourceAnchors.chapterTitle) || 'Chương học'));}
  function anchor(l,k){return s(l && l.sourceAnchors && l.sourceAnchors[k]);}
  function sourceLessons(){var raw=db().lessons; return Array.isArray(raw) ? raw : (raw && Array.isArray(raw.lessons) ? raw.lessons : []);}
  function contentLessons(){var raw=db().theory_lecture_content; return Array.isArray(raw) ? raw : (raw && Array.isArray(raw.records) ? raw.records : []);}
  function frameData(){var raw=db().theory_lecture_frame; return raw && typeof raw === 'object' ? raw : {};}
  function hasTheoryDataSlot(){
    var d=db();
    return Object.prototype.hasOwnProperty.call(d,'lessons') || Object.prototype.hasOwnProperty.call(d,'theory_lecture_content');
  }
  function isTheory(l){return !!(l && (l.kind === 'theory' || l.contentRole === 'theory_only' || arr(l.slides).length));}
  function lessons(){
    var map = new Map();
    sourceLessons().concat(contentLessons()).forEach(function(l){
      if(!isTheory(l))return;
      var id = lessonId(l);
      if(!id)return;
      map.set(id,Object.assign({},map.get(id) || {},l));
    });
    return Array.from(map.values()).sort(function(a,b){
      return stageNo(a)-stageNo(b) || chapterNo(a)-chapterNo(b) || lessonTitle(a).localeCompare(lessonTitle(b),'vi');
    });
  }
  function slides(l){return arr(l && l.slides);}
  function safeBody(b){return s(b && (b.body || b.content || b.text || b.value));}
  function slideText(l){
    return slides(l).map(function(sl){
      return [sl.title,sl.role,arr(sl.blocks).map(function(b){return [b && b.title,safeBody(b)].join(' ');}).join(' '),sl.body,sl.content].join(' ');
    }).join(' ');
  }
  function searchText(l){
    return norm([lessonTitle(l),chapterTitle(l),l && l.departmentTitle,l && l.stageName,arr(l && l.conceptIds).join(' '),JSON.stringify(l && l.sourceAnchors || {}),slideText(l)].join(' '));
  }
  function searchSnippet(l,q){
    if(!q)return '';
    var hay = plain([lessonTitle(l),chapterTitle(l),slideText(l)].join(' '));
    var idx = norm(hay).indexOf(norm(q));
    if(idx < 0)return '';
    var raw = hay.slice(Math.max(0,idx-54),Math.min(hay.length,idx+150));
    return clip((idx>54?'… ':'') + raw,190);
  }
  function currentLesson(xs){
    var state=st();
    var id=s(state.e134LessonId || state.lessonId);
    var hit=xs.find(function(l){return lessonId(l) === id;});
    if(hit)return hit;
    var stage = state.e134Stage && state.e134Stage !== 'all' ? Number(state.e134Stage) : MAIN_TO_STAGE[s(state.stage)] || 0;
    return xs.find(function(l){return stageNo(l) === stage;}) || xs[0] || null;
  }
  function currentSlide(l){
    var max = Math.max(0,slides(l).length - 1);
    var n = Number(st().e134SlideIndex || 0);
    return Math.max(0,Math.min(max,isFinite(n) ? n : 0));
  }
  function stageOptions(xs){
    var seen = {};
    xs.forEach(function(l){seen[stageNo(l)] = true;});
    return Object.keys(seen).map(Number).sort(function(a,b){return a-b;});
  }
  function stageLabel(xs,n){
    var hit = xs.find(function(l){return stageNo(l) === n;});
    return s((hit && (hit.stageName || anchor(hit,'stageTitle'))) || ('Giai đoạn ' + n));
  }
  function frameSummary(){
    var f=frameData();
    var stages=arr(f.stages);
    var chapters=0;
    stages.forEach(function(stage){
      arr(stage.disciplines).forEach(function(d){chapters += arr(d.chapters).length;});
    });
    return {stages:stages.length || Number(f.stageCount || 0) || 0, chapters:chapters || Number(f.chapterCount || 0) || 0};
  }
  function paragraphHtml(text){
    var body=s(text).trim();
    if(!body)return '<p class="e134-muted">Chưa có nội dung chi tiết cho khối này.</p>';
    return body.split(/\n{2,}/).map(function(p){return '<p>'+esc(p.trim())+'</p>';}).join('');
  }
  function blockHtml(b){
    var title=s(b && (b.title || b.type || 'Nội dung'));
    var type=norm(b && b.type);
    var formula = /formula|matrix|equation|cong thuc|ky hieu/.test(type + ' ' + norm(title));
    return '<article class="e134-block '+(formula?'is-formula':'')+'"><h4>'+esc(title)+'</h4>'+(formula?'<pre>'+esc(safeBody(b))+'</pre>':paragraphHtml(safeBody(b)))+'</article>';
  }
  function slideBlocks(slide){
    var blocks=arr(slide && slide.blocks);
    if(blocks.length)return blocks.map(blockHtml).join('');
    return '<article class="e134-block">'+paragraphHtml((slide && (slide.body || slide.content)) || '')+'</article>';
  }
  function structureMenu(active){
    return '<details class="learn-structure-menu e134-learn-menu"><summary class="learn-structure-trigger"><span>🧭</span><b>Cấu trúc bài học</b><u>▾</u></summary><div class="learn-structure-dropdown" role="menu">'+
      LEARN_MODES.map(function(m){return '<button class="learn-structure-choice '+(active===m[0]?'active':'')+'" data-learn="'+esc(m[0])+'" data-e122-learn="'+esc(m[0])+'" data-e122-focus="'+esc(m[0])+'"><span>'+esc(m[1])+'</span><b>'+esc(m[2])+'</b></button>';}).join('')+
      '</div></details>';
  }
  function topBar(lesson,mode){
    return '<header class="e134-topbar">'+
      '<div class="e134-top-left">'+structureMenu('theory')+'<div class="e134-now"><span>Đang học</span><b>'+esc(clip(lessonTitle(lesson),72))+'</b></div></div>'+
      '<div class="e134-top-actions"><div class="e134-switch" role="group" aria-label="Chế độ lý thuyết"><button class="'+(mode==='read'?'active':'')+'" data-e134-mode="read">Đọc</button><button class="'+(mode==='lecture'?'active':'')+'" data-e134-mode="lecture">Trình chiếu</button></div><span class="e134-id">'+esc(lessonId(lesson) || 'lessonId')+'</span></div>'+
      '</header>';
  }
  function stageFilters(xs,active){
    var opts = stageOptions(xs);
    var allActive = active === 'all';
    return '<div class="e134-stage-filter"><button class="'+(allActive?'active':'')+'" data-e134-stage="all">Tất cả <small>'+xs.length+'</small></button>'+
      opts.map(function(n){var count=xs.filter(function(l){return stageNo(l)===n;}).length; return '<button class="'+(!allActive && Number(active)===n?'active':'')+'" data-e134-stage="'+n+'">GĐ '+n+' <small>'+count+'</small></button>';}).join('')+
      '</div>';
  }
  function lessonList(xs,current,q){
    if(!xs.length)return '<div class="e134-empty-list"><b>Không có kết quả</b><span>Thử bỏ lọc giai đoạn hoặc đổi từ khóa tìm kiếm.</span></div>';
    return xs.map(function(l){
      var on = lessonId(l) === lessonId(current);
      var snip = q ? searchSnippet(l,q) : '';
      return '<button class="e134-lesson-item '+(on?'active':'')+'" data-e134-lesson="'+esc(lessonId(l))+'"><span>Ch '+esc(chapterNo(l) || '')+'</span><b>'+esc(clip(lessonTitle(l),86))+'</b><small>'+esc(clip(chapterTitle(l),70))+'</small>'+(snip?'<em>'+esc(snip)+'</em>':'')+'</button>';
    }).join('');
  }
  function leftNav(xs,filtered,current,q,stage){
    return '<aside class="e134-left" aria-label="Danh sách bài lý thuyết">'+
      '<div class="e134-search-wrap"><label for="e134Search">Tìm bài học</label><input id="e134Search" data-e134-search value="'+esc(q)+'" placeholder="Tên bài, chương, khái niệm..."></div>'+
      stageFilters(xs,stage)+
      '<div class="e134-result-count"><b>'+filtered.length+'</b><span>kết quả trong '+xs.length+' bài</span></div>'+
      '<div class="e134-lesson-list">'+lessonList(filtered,current,q)+'</div>'+
      '</aside>';
  }
  function outline(slides,idx){
    if(!slides.length)return '<div class="e134-mini-empty">Bài này chưa có slide.</div>';
    return '<nav class="e134-outline">'+slides.map(function(sl,i){return '<button class="'+(i===idx?'active':'')+'" data-e134-slide="'+i+'"><span>'+pad(i)+'</span><b>'+esc(clip(sl.title || ('Mục '+(i+1)),64))+'</b></button>';}).join('')+'</nav>';
  }
  function objectivePanel(l){
    var pure=arr(l && l.sourceAnchors && l.sourceAnchors.pureLayer).concat(arr(l && l.pureLayer)).slice(0,5);
    var applied=arr(l && l.sourceAnchors && l.sourceAnchors.appliedLayer).concat(arr(l && l.appliedLayer)).slice(0,5);
    return '<section class="e134-objectives">'+
      '<article><span>Câu hỏi dẫn đường</span><p>'+esc(anchor(l,'bridgeQuestion') || 'Đọc bài để xác định đối tượng, giả thiết, công thức và kết luận cần kiểm chứng.')+'</p></article>'+
      '<article><span>Đầu ra cần đạt</span><p>'+esc(anchor(l,'targetOutcome') || 'Hiểu bản chất, biết điều kiện áp dụng và tránh lỗi học thuộc máy móc.')+'</p></article>'+
      '<article><span>Lớp thuần túy</span><p>'+esc(pure.join(' · ') || 'Dữ liệu lớp thuần túy chưa khai báo.')+'</p></article>'+
      '<article><span>Lớp ứng dụng</span><p>'+esc(applied.join(' · ') || 'Dữ liệu lớp ứng dụng chưa khai báo.')+'</p></article>'+
      '</section>';
  }
  function readerHtml(lesson,idx){
    var sl=slides(lesson);
    var sections = sl.map(function(item,i){
      return '<section class="e134-read-section" id="e134-section-'+i+'"><header><span>'+pad(i)+'</span><div><small>'+esc(item.role || 'lesson section')+'</small><h3>'+esc(item.title || ('Mục '+(i+1)))+'</h3></div></header>'+slideBlocks(item)+'</section>';
    }).join('');
    if(!sections)sections = '<section class="e134-empty-state"><b>Chưa có slide lý thuyết</b><p>Hệ thống đã mở được bài, nhưng dữ liệu slide đang trống.</p></section>';
    return '<main class="e134-reader">'+
      '<section class="e134-lesson-head"><div><span class="e134-kicker">'+esc(stageLabel(lessons(),stageNo(lesson)))+' · Chương '+esc(chapterNo(lesson))+'</span><h1>'+esc(lessonTitle(lesson))+'</h1><p>'+esc(chapterTitle(lesson))+'</p></div><div class="e134-head-actions"><button data-e134-mode="lecture">Trình chiếu</button><button data-e134-open-storage>Kho dữ liệu</button></div></section>'+
      objectivePanel(lesson)+
      '<section class="e134-read-body">'+sections+'</section>'+
      '</main>';
  }
  function rightPanel(lesson,idx,total){
    var fs=frameSummary();
    var concepts=arr(lesson && lesson.conceptIds).slice(0,8);
    return '<aside class="e134-right" aria-label="Công cụ học lý thuyết">'+
      '<section><h3>Mục lục bài</h3>'+outline(slides(lesson),idx)+'</section>'+
      '<section><h3>Khái niệm</h3><div class="e134-tags">'+(concepts.length?concepts.map(function(x){return '<span>'+esc(x)+'</span>';}).join(''):'<span>Chưa gắn concept</span>')+'</div></section>'+
      '<section><h3>Nguồn dữ liệu</h3><dl class="e134-data"><div><dt>Lessons</dt><dd>'+lessons().length+'</dd></div><div><dt>Frame</dt><dd>'+fs.chapters+' chương</dd></div><div><dt>Slide</dt><dd>'+total+'</dd></div></dl></section>'+
      '<section><h3>Thao tác</h3><div class="e134-tool-buttons"><button data-e134-mode="lecture">Mở trình chiếu</button><button data-e134-open-storage>Mở dữ liệu</button></div></section>'+
      '</aside>';
  }
  function normalShell(xs,filtered,lesson,q,stage,idx){
    return '<section class="e134-shell" data-e134="1" data-e134-mode="read">'+topBar(lesson,'read')+
      '<div class="e134-layout">'+leftNav(xs,filtered,lesson,q,stage)+readerHtml(lesson,idx)+rightPanel(lesson,idx,slides(lesson).length)+'</div>'+
      '</section>';
  }
  function lectureShell(lesson,idx){
    var sl=slides(lesson);
    var total=Math.max(1,sl.length);
    var current=sl[idx] || {};
    return '<section class="e134-shell" data-e134="1" data-e134-mode="lecture">'+topBar(lesson,'lecture')+
      '<main class="e134-lecture">'+
      '<header><div><span>Slide '+esc(idx+1)+'/'+esc(total)+' · '+esc(chapterTitle(lesson))+'</span><h1>'+esc(current.title || lessonTitle(lesson))+'</h1></div><button data-e134-mode="read">Thoát</button></header>'+
      '<article class="e134-lecture-card"><div class="e134-lecture-progress"><i style="width:'+Math.round(((idx+1)/total)*100)+'%"></i></div>'+slideBlocks(current)+'</article>'+
      '<footer><button data-e134-prev-slide '+(idx<=0?'disabled':'')+'>← Trước</button><button data-e134-next-slide '+(idx>=total-1?'disabled':'')+'>Tiếp →</button><button data-e134-mode="read">Quay lại đọc</button></footer>'+
      '</main></section>';
  }
  function emptyShell(message){
    var loading = /Đang tải/.test(s(message));
    return '<section class="e134-shell" data-e134="1"><div class="e134-empty-state"><span>Lý thuyết</span><b>'+esc(message || 'Chưa có dữ liệu bài học')+'</b><p>'+esc(loading ? 'Hệ thống đang nạp lessons.json và theory_lecture_content.json. Giao diện sẽ tự mở khi dữ liệu sẵn sàng.' : 'Kiểm tra lessons.json hoặc theory_lecture_content.json trong Kho dữ liệu môn Toán.')+'</p>'+(loading?'':'<button data-e134-open-storage>Mở Kho dữ liệu</button>')+'</div></section>';
  }
  function stateForRender(){
    var state=st();
    var view=s(state.view || 'overview');
    if(view !== 'learning')return null;
    if(s(state.learnTab || 'theory') !== 'theory')return null;
    state.e122Focus = 'theory';
    return state;
  }
  function render(){
    var view=document.getElementById('view');
    var state=stateForRender();
    if(!view || !state)return false;
    var xs=lessons();
    if(!xs.length){
      var pending = !hasTheoryDataSlot();
      applying=true; view.innerHTML=emptyShell(pending ? 'Đang tải dữ liệu lý thuyết…' : 'Không tìm thấy bài lý thuyết.');
      setTimeout(function(){applying=false; if(pending)render();},250);
      return true;
    }
    var activeStage = state.e134Stage == null ? 'all' : s(state.e134Stage || 'all');
    var q=s(state.e134Query || '').trim();
    var lesson=currentLesson(xs);
    if(!lesson)lesson=xs[0];
    var filtered = xs.filter(function(l){
      var stageOk = activeStage === 'all' || stageNo(l) === Number(activeStage);
      var searchOk = !q || searchText(l).indexOf(norm(q)) >= 0;
      return stageOk && searchOk;
    });
    var idx=currentSlide(lesson);
    var mode=s(state.e134Mode || 'read') === 'lecture' ? 'lecture' : 'read';
    state.e134LessonId = lessonId(lesson);
    state.lessonId = lessonId(lesson);
    state.stage = STAGE_TO_MAIN[stageNo(lesson)] || state.stage;
    var html = mode === 'lecture' ? lectureShell(lesson,idx) : normalShell(xs,filtered,lesson,q,activeStage,idx);
    applying=true;
    view.innerHTML=html;
    if(restoreSearchFocus){
      var input=view.querySelector('[data-e134-search]');
      if(input){input.focus({preventScroll:true}); try{input.setSelectionRange(input.value.length,input.value.length);}catch(_){}}
      restoreSearchFocus=false;
    }
    setTimeout(function(){applying=false;},0);
    return true;
  }
  function save(){try{if(api().save)api().save();}catch(_){}}
  function coreRender(){try{if(api().render)api().render(); else render();}catch(_){setTimeout(render,0);}}
  function setLesson(id){
    var xs=lessons();
    var l=xs.find(function(x){return lessonId(x) === id;});
    if(!l)return;
    var state=st();
    state.view='learning'; state.learnTab='theory'; state.e122Focus='theory';
    state.e134LessonId=lessonId(l); state.lessonId=lessonId(l); state.e134SlideIndex=0;
    state.stage=STAGE_TO_MAIN[stageNo(l)] || state.stage;
    save(); render();
  }
  function setStage(value){
    var state=st();
    state.e134Stage=value || 'all';
    if(value && value !== 'all'){
      var first=lessons().find(function(l){return stageNo(l) === Number(value);});
      if(first){state.e134LessonId=lessonId(first); state.lessonId=lessonId(first); state.stage=STAGE_TO_MAIN[stageNo(first)] || state.stage; state.e134SlideIndex=0;}
    }
    state.view='learning'; state.learnTab='theory'; state.e122Focus='theory';
    save(); render();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest && e.target.closest('.e134-shell .learn-structure-trigger,[data-e134-lesson],[data-e134-stage],[data-e134-slide],[data-e134-mode],[data-e134-prev-slide],[data-e134-next-slide],[data-e134-open-storage]');
    if(!t)return;
    var state=st();
    if(t.matches && t.matches('.e134-shell .learn-structure-trigger')){
      var menu=t.closest('.learn-structure-menu');
      if(menu)menu.toggleAttribute('open');
      e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    if(t.hasAttribute('data-e134-lesson')){setLesson(t.getAttribute('data-e134-lesson')); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-stage')){setStage(t.getAttribute('data-e134-stage')); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-slide')){state.e134SlideIndex=Number(t.getAttribute('data-e134-slide')) || 0; save(); render(); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-mode')){state.view='learning'; state.learnTab='theory'; state.e122Focus='theory'; state.e134Mode=t.getAttribute('data-e134-mode') === 'lecture' ? 'lecture' : 'read'; save(); render(); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-prev-slide') || t.hasAttribute('data-e134-next-slide')){
      var l=currentLesson(lessons());
      var total=slides(l).length;
      var idx=Number(state.e134SlideIndex || 0);
      state.e134SlideIndex=t.hasAttribute('data-e134-prev-slide') ? Math.max(0,idx-1) : Math.min(Math.max(0,total-1),idx+1);
      state.e134Mode='lecture'; save(); render(); e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    if(t.hasAttribute('data-e134-open-storage')){
      state.view='storage'; state.storageFile='theory_lecture_content'; state.storageGroup='Học tập/Lý thuyết';
      save(); coreRender(); e.preventDefault(); e.stopImmediatePropagation(); return;
    }
  },true);
  document.addEventListener('input',function(e){
    var input=e.target && e.target.matches && e.target.matches('[data-e134-search]') ? e.target : null;
    if(!input)return;
    st().e134Query=input.value || '';
    restoreSearchFocus=true;
    save(); render();
  },true);
  document.addEventListener('keydown',function(e){
    var state=st();
    if(s(state.view) !== 'learning' || s(state.learnTab || 'theory') !== 'theory' || s(state.e134Mode) !== 'lecture')return;
    if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape')return;
    if(e.key === 'Escape'){state.e134Mode='read'; save(); render(); e.preventDefault(); return;}
    var l=currentLesson(lessons());
    var total=slides(l).length;
    var idx=Number(state.e134SlideIndex || 0);
    state.e134SlideIndex=e.key === 'ArrowLeft' ? Math.max(0,idx-1) : Math.min(Math.max(0,total-1),idx+1);
    save(); render(); e.preventDefault();
  },true);
  var mo = new MutationObserver(function(){if(applying)return; setTimeout(render,0);});
  function boot(){
    var view=document.getElementById('view');
    if(!view){setTimeout(boot,50); return;}
    mo.observe(view,{childList:true,subtree:false});
    render();
  }
  if(document.readyState === 'loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.__BAUMAN_MATH_E134_READY__ = true;
  window.BAUMAN_MATH_E134_SELF_CHECK=function(){
    try{
      var xs=lessons();
      var before={view:st().view,learnTab:st().learnTab,e122Focus:st().e122Focus,e134Mode:st().e134Mode};
      st().view='learning'; st().learnTab='theory'; st().e122Focus='theory'; st().e134Mode='read';
      var rendered=render();
      var html=s((document.getElementById('view') || {}).innerHTML);
      Object.keys(before).forEach(function(k){st()[k]=before[k];});
      return {ok:!!(rendered && xs.length && /e134-shell/.test(html) && !/e126-theory-integrated/.test(html)),patch:PATCH,lessons:xs.length,frameChapters:frameSummary().chapters,lecture:/data-e134-mode="lecture"/.test(html),final:true};
    }catch(e){return {ok:false,patch:PATCH,error:s(e && e.message || e)};}
  };
})();
