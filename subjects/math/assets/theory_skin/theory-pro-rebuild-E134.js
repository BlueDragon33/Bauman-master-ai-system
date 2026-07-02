/* E134 · Clean professional Theory tab rebuild for Math. */
(function(){
  'use strict';

  var PATCH = 'E134_MATH_THEORY_PRO_REBUILD';
  var applying = false;
  var restoreSearchFocus = false;
  var STAGE_ID_ALIAS = {hk1:'master_y1_s1',hk2:'master_y1_s2',hk3:'nir',hk4:'vkr',m1:'master_y1_s1',m2:'master_y1_s2',m3:'nir',m4:'vkr',prepare:'vn',preparatory:'prep',vietnam:'vn'};
  var MAIN_TO_STAGE = {vn:0,prep:1,master_y1_s1:2,master_y1_s2:3,nir:4,vkr:5,hk1:2,hk2:3,hk3:4,hk4:5,phd_bridge:6,phd_y1:7,phd_y2:8,phd_thesis:9};
  var LEARN_MODES = [
    ['theory','📘','Lý thuyết'],
    ['exercises','📝','Bài tập'],
    ['practice','🧩','Ứng dụng'],
    ['review','🔁','Ôn tập'],
    ['exam','🧪','Kiểm tra']
  ];
  var TAXONOMY = [
    {key:'pure',title:'TOÁN HỌC THUẦN TÚY',subtitle:'PURE MATHEMATICS',majors:[
      {key:'algebra',title:'Đại số và Cấu trúc',subtitle:'Algebra & Structures',subs:['Đại số đại cương & Trừu tượng','Đại số tuyến tính thuần túy'],match:['đại số','linear','tuyến tính','vector','ma trận','không gian vector','eigen','trị riêng','cấu trúc','nhóm','vành','trường']},
      {key:'analysis',title:'Giải tích toán học',subtitle:'Mathematical Analysis',subs:['Giải tích thực & Giải tích phức','Giải tích hàm & Phương trình vi phân'],match:['giải tích','calculus','đạo hàm','gradient','tích phân','hàm số','chuỗi','giới hạn','vi phân','phương trình vi phân','fourier','laplace']},
      {key:'geometry',title:'Hình học và Tôpô học',subtitle:'Geometry & Topology',subs:['Hình học vi phân & Hình học đại số','Tôpô học không gian'],match:['hình học','geometry','topo','tôpô','không gian metric','đa tạp','đường cong','mặt cong']},
      {key:'number_logic',title:'Lý thuyết số và Logic toán',subtitle:'Number Theory & Logic',subs:['Lý thuyết số đại số & Giải tích số','Cơ sở toán học & Lý thuyết tập hợp'],match:['lý thuyết số','số học','logic','tập hợp','mệnh đề','chứng minh','ngôn ngữ toán','rời rạc','đồ thị']}
    ]},
    {key:'applied',title:'TOÁN HỌC ỨNG DỤNG',subtitle:'APPLIED MATHEMATICS',majors:[
      {key:'probability_stats',title:'Xác suất và Thống kê toán học',subtitle:'Probability & Statistics',subs:['Lý thuyết xác suất & Quá trình ngẫu nhiên','Thống kê lý thuyết & Phân tích dữ liệu'],match:['xác suất','thống kê','ngẫu nhiên','stochastic','random','phân phối','bayes','ước lượng','kiểm định','dữ liệu']},
      {key:'computational',title:'Toán học tính toán',subtitle:'Computational Mathematics',subs:['Giải tích số & Phương pháp tính','Mô phỏng toán học & Rời rạc hóa'],match:['phương pháp số','giải tích số','numerical','tính toán','computational','mô phỏng','rời rạc hóa','sai số','thuật toán']},
      {key:'optimization',title:'Tối ưu hóa và Vận trù học',subtitle:'Optimization & Operations Research',subs:['Quy hoạch toán học & Lý thuyết trò chơi','Lý thuyết điều khiển tối ưu'],match:['tối ưu','optimization','quy hoạch','vận trù','game theory','trò chơi','điều khiển tối ưu','gradient descent','cực trị']},
      {key:'modeling',title:'Các mô hình toán học chuyên ngành',subtitle:'Mathematical Modeling',subs:['Toán kinh tế & Tài chính định lượng','Vật lý toán & Cơ học lý thuyết','Sinh học toán học'],match:['mô hình','model','kinh tế','tài chính','vật lý','cơ học','sinh học','robot','điều khiển','tín hiệu','ai','kỹ thuật']}
    ]}
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
  function stageKey(x){var key=s(x).trim(); return STAGE_ID_ALIAS[key] || key;}
  function currentStageKey(){return stageKey(st().stage) || 'vn';}
  function lessonId(l){return s(l && (l.lessonId || l.id));}
  function stageNo(l){var n = Number(l && (l.sourceStageNo != null ? l.sourceStageNo : l.stageNo)); if(isFinite(n))return n; var key=stageKey(l && l.stage); return MAIN_TO_STAGE[key] == null ? 0 : MAIN_TO_STAGE[key];}
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
  function currentStageNo(){
    var key=currentStageKey();
    var hit=lessons().find(function(l){return stageKey(l && l.stage) === key;});
    if(hit)return stageNo(hit);
    var n=MAIN_TO_STAGE[key];
    return n == null ? null : n;
  }
  function blockText(b){
    if(!b)return '';
    var direct=s(b.body || b.content || b.text || b.value).trim();
    if(direct)return direct;
    return arr(b.items || b.bullets || b.formulas || b.examples).map(function(item){
      if(item && typeof item === 'object')return s(item.text || item.body || item.content || item.q || item.a || JSON.stringify(item));
      return s(item);
    }).filter(Boolean).join('\n');
  }
  function slideText(l){
    return slides(l).map(function(sl){
      return [sl.title,sl.role,arr(sl.blocks).map(function(b){return [b && b.title,blockText(b)].join(' ');}).join(' '),sl.body,sl.content].join(' ');
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
  function taxonomyText(l){
    return norm([
      lessonTitle(l),chapterTitle(l),l && l.departmentTitle,l && l.disciplineTitle,
      l && l.sourceAnchors && l.sourceAnchors.primaryDiscipline,
      arr(l && l.sourceAnchors && l.sourceAnchors.secondaryDisciplines).join(' '),
      arr(l && l.sourceAnchors && l.sourceAnchors.pureLayer).join(' '),
      arr(l && l.sourceAnchors && l.sourceAnchors.appliedLayer).join(' '),
      arr(l && l.conceptIds).join(' ')
    ].join(' '));
  }
  function matchScore(text,words){
    return arr(words).reduce(function(sum,w){
      var k=norm(w);
      return sum + (k && text.indexOf(k)>=0 ? Math.max(1,k.split(/\s+/).length) : 0);
    },0);
  }
  function majorByKey(key){
    var found=null;
    TAXONOMY.forEach(function(domain){
      domain.majors.forEach(function(major){if(major.key===key)found={domain:domain,major:major};});
    });
    return found;
  }
  function lessonTaxonomy(l){
    var text=taxonomyText(l), best=null, score=-1;
    TAXONOMY.forEach(function(domain){
      domain.majors.forEach(function(major){
        var s=matchScore(text,major.match);
        if(s>score){score=s; best={domain:domain,major:major};}
      });
    });
    return score>0 && best ? best : {domain:TAXONOMY[1],major:TAXONOMY[1].majors[3]};
  }
  function stageGroups(xs){
    var map={};
    xs.forEach(function(l){
      var n=stageNo(l);
      if(!map[n])map[n]=[];
      map[n].push(l);
    });
    return Object.keys(map).map(Number).sort(function(a,b){return a-b;}).map(function(n){
      return {no:n,label:stageLabel(xs,n),lessons:map[n]};
    });
  }
  function lessonsForMajor(xs,key){
    return xs.filter(function(l){return lessonTaxonomy(l).major.key===key;});
  }
  function chapterGroups(xs){
    var map={}, out=[];
    xs.forEach(function(l){
      var key=chapterNo(l)+'|'+chapterTitle(l);
      if(!map[key]){map[key]={chapterNo:chapterNo(l),title:chapterTitle(l),lessons:[]}; out.push(map[key]);}
      map[key].lessons.push(l);
    });
    return out.sort(function(a,b){return a.chapterNo-b.chapterNo || a.title.localeCompare(b.title,'vi');});
  }
  function majorPopupState(){
    var parts=s(st().e134MajorPopup || '').split('|');
    var stage=Number(parts[0]);
    return parts.length===2 && parts[1] && stage===currentStageNo() ? {stage:stage,key:parts[1]} : null;
  }
  function currentLesson(xs){
    var state=st();
    var id=s(state.e134LessonId || state.lessonId);
    var stage=currentStageNo();
    if(stage == null)return null;
    var hit=xs.find(function(l){return lessonId(l) === id && stageNo(l) === stage;});
    if(hit)return hit;
    return xs.find(function(l){return stageNo(l) === stage;}) || null;
  }
  function currentSlide(l){
    var max = Math.max(0,slides(l).length - 1);
    var n = Number(st().e134SlideIndex || 0);
    return Math.max(0,Math.min(max,isFinite(n) ? n : 0));
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
    if(!body)return '';
    return body.split(/\n{2,}/).map(function(p){return '<p>'+esc(p.trim())+'</p>';}).join('');
  }
  function listHtml(items,formula){
    items=arr(items).map(function(item){
      if(item && typeof item === 'object')return s(item.text || item.body || item.content || item.q || item.a || JSON.stringify(item));
      return s(item);
    }).filter(function(x){return x.trim();});
    if(!items.length)return '';
    if(formula)return '<pre>'+items.map(esc).join('\n')+'</pre>';
    return '<ul class="e134-list">'+items.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
  }
  function blockHtml(b){
    var title=s(b && (b.title || b.type || 'Nội dung'));
    var type=norm(b && b.type);
    var formula = /formula|matrix|equation|cong thuc|ky hieu/.test(type + ' ' + norm(title));
    var body=blockText(b);
    var html=formula ? (body ? '<pre>'+esc(body)+'</pre>' : listHtml(b && b.items, true)) : (paragraphHtml(body) || listHtml(b && (b.items || b.bullets || b.examples), false));
    return html ? '<article class="e134-block '+(formula?'is-formula':'')+'"><h4>'+esc(title)+'</h4>'+html+'</article>' : '';
  }
  function slideBlocks(slide){
    var blocks=arr(slide && slide.blocks).map(blockHtml).filter(Boolean).join('');
    if(blocks)return blocks;
    var fallback=paragraphHtml((slide && (slide.body || slide.content || slide.summary)) || '');
    return fallback ? '<article class="e134-block">'+fallback+'</article>' : '<article class="e134-block"><h4>'+esc(slide && slide.title || 'Nội dung bài học')+'</h4><p>'+esc(s(slide && slide.role || 'Mục học này dùng metadata của bài, không có khối body riêng.'))+'</p></article>';
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
  function lessonButtons(xs,current,q){
    if(!xs.length)return '<div class="e134-empty-list"><b>Không có kết quả</b><span>Thử đổi từ khóa tìm kiếm.</span></div>';
    return xs.map(function(l){
      var on = lessonId(l) === lessonId(current);
      var snip = q ? searchSnippet(l,q) : '';
      return '<button class="e134-lesson-item '+(on?'active':'')+'" data-e134-lesson="'+esc(lessonId(l))+'"><span>Ch '+esc(chapterNo(l) || '')+'</span><b>'+esc(clip(lessonTitle(l),86))+'</b><small>'+esc(clip(chapterTitle(l),70))+'</small>'+(snip?'<em>'+esc(snip)+'</em>':'')+'</button>';
    }).join('');
  }
  function taxonomyStageTree(xs,current,q){
    var groups=stageGroups(xs);
    if(!groups.length)return '<div class="e134-empty-list"><b>Không có bài phù hợp</b><span>Từ khóa hiện tại chưa khớp lesson nào.</span></div>';
    var currentStage=stageNo(current);
    return '<div class="e134-stage-tree">'+groups.map(function(group,idx){
      var open=group.no===currentStage || (!!q && idx===0);
      return '<details class="e134-stage-node" '+(open?'open':'')+'><summary><span>GĐ '+esc(group.no)+'</span><b>'+esc(group.label)+'</b><small>'+group.lessons.length+' bài</small></summary>'+domainTree(group.lessons,group.no,current)+'</details>';
    }).join('')+'</div>';
  }
  function domainTree(stageLessons,stage,current){
    return '<div class="e134-domain-list">'+TAXONOMY.map(function(domain){
      var count=domain.majors.reduce(function(sum,major){return sum+lessonsForMajor(stageLessons,major.key).length;},0);
      if(!count)return '';
      var currentMajor=lessonTaxonomy(current).major.key;
      return '<details class="e134-domain-node" '+(domain.key==='pure'?'open':'')+'><summary><b>'+esc(domain.title)+'</b><small>'+esc(domain.subtitle)+' · '+count+' bài</small></summary><div class="e134-major-list">'+
        domain.majors.map(function(major){
          var ys=lessonsForMajor(stageLessons,major.key);
          if(!ys.length)return '';
          return '<button class="e134-major-button '+(currentMajor===major.key?'active':'')+'" data-e134-major="'+esc(major.key)+'" data-e134-major-stage="'+esc(stage)+'"><b>'+esc(major.title)+'</b><span>'+esc(major.subtitle)+'</span><small>'+ys.length+' bài</small></button>';
        }).join('')+'</div></details>';
    }).join('')+'</div>';
  }
  function taxonomyPopover(xs,current,q){
    var pop=majorPopupState();
    if(!pop)return '';
    var found=majorByKey(pop.key);
    if(!found)return '';
    var pool=xs.filter(function(l){return stageNo(l)===pop.stage && lessonTaxonomy(l).major.key===pop.key;});
    if(q)pool=pool.filter(function(l){return searchText(l).indexOf(norm(q))>=0;});
    var groups=chapterGroups(pool);
    return '<section class="e134-taxonomy-popover" role="dialog" aria-label="Chọn bài trong nhóm môn"><header><div><span>'+esc(stageLabel(xs,pop.stage))+'</span><h3>'+esc(found.major.title)+'</h3><p>'+esc(found.major.subtitle)+'</p></div><button data-e134-close-taxonomy>Đóng</button></header><div class="e134-subtracks">'+
      found.major.subs.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+
      '</div><div class="e134-popover-list">'+(groups.length?groups.map(function(group,i){
        var on=group.lessons.some(function(l){return lessonId(l)===lessonId(current);});
        return '<details class="e134-chapter-group" '+(on||i===0?'open':'')+'><summary><b>Ch '+esc(group.chapterNo)+' · '+esc(group.title)+'</b><small>'+group.lessons.length+' bài</small></summary><div>'+lessonButtons(group.lessons,current,q)+'</div></details>';
      }).join(''):'<div class="e134-empty-list"><b>Chưa có bài trong nhóm này</b><span>Nhóm sẽ hiện khi dữ liệu lesson khớp taxonomy.</span></div>')+'</div></section>';
  }
  function leftNav(xs,filtered,current,q,stage){
    return '<aside class="e134-left" aria-label="Danh sách bài lý thuyết">'+
      '<div class="e134-search-wrap"><label for="e134Search">Tìm bài học</label><input id="e134Search" data-e134-search value="'+esc(q)+'" placeholder="Tên bài, chương, khái niệm..."></div>'+
      taxonomyStageTree(filtered,current,q)+
      taxonomyPopover(xs,current,q)+
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
    var active=sl[idx] || null;
    var section = active ? '<section class="e134-read-section" id="e134-section-'+idx+'"><header><span>'+pad(idx)+'</span><div><small>'+esc(active.role || 'lesson section')+'</small><h3>'+esc(active.title || ('Mục '+(idx+1)))+'</h3></div></header>'+slideBlocks(active)+'</section>' : '<section class="e134-empty-state"><b>Chưa có slide lý thuyết</b><p>Hệ thống đã mở được bài, nhưng dữ liệu slide đang trống.</p></section>';
    return '<main class="e134-reader">'+
      '<section class="e134-lesson-head"><div><span class="e134-kicker">'+esc(stageLabel(lessons(),stageNo(lesson)))+' · Chương '+esc(chapterNo(lesson))+'</span><h1>'+esc(lessonTitle(lesson))+'</h1><p>'+esc(chapterTitle(lesson))+'</p></div><div class="e134-head-actions"><button data-e134-mode="lecture">Trình chiếu</button><button data-e134-open-storage>Kho dữ liệu</button></div></section>'+
      objectivePanel(lesson)+
      '<section class="e134-study-frame"><aside class="e134-inline-outline"><h3>Mục lục bài</h3>'+outline(sl,idx)+'</aside><div class="e134-read-body">'+section+'</div></section>'+
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
      '<div class="e134-layout">'+leftNav(xs,filtered,lesson,q,stage)+readerHtml(lesson,idx)+'</div>'+
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
    var activeStage = currentStageNo();
    var q=s(state.e134Query || '').trim();
    var lesson=currentLesson(xs);
    if(!lesson){
      applying=true; view.innerHTML=emptyShell('Không có bài lý thuyết cho giai đoạn đang chọn.');
      setTimeout(function(){applying=false;},0);
      return true;
    }
    var filtered = xs.filter(function(l){
      var stageOk = stageNo(l) === activeStage;
      var searchOk = !q || searchText(l).indexOf(norm(q)) >= 0;
      return stageOk && searchOk;
    });
    var idx=currentSlide(lesson);
    var mode=s(state.e134Mode || 'read') === 'lecture' ? 'lecture' : 'read';
    state.e134LessonId = lessonId(lesson);
    state.lessonId = lessonId(lesson);
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
    state.e134MajorPopup='';
    save(); render();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest && e.target.closest('.e134-shell .learn-structure-trigger,[data-e134-lesson],[data-e134-major],[data-e134-close-taxonomy],[data-e134-slide],[data-e134-mode],[data-e134-prev-slide],[data-e134-next-slide],[data-e134-open-storage]');
    if(!t)return;
    var state=st();
    if(t.matches && t.matches('.e134-shell .learn-structure-trigger')){
      var menu=t.closest('.learn-structure-menu');
      if(menu)menu.toggleAttribute('open');
      e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    if(t.hasAttribute('data-e134-lesson')){setLesson(t.getAttribute('data-e134-lesson')); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-major')){state.e134MajorPopup=s(t.getAttribute('data-e134-major-stage'))+'|'+s(t.getAttribute('data-e134-major')); save(); render(); e.preventDefault(); e.stopImmediatePropagation(); return;}
    if(t.hasAttribute('data-e134-close-taxonomy')){state.e134MajorPopup=''; save(); render(); e.preventDefault(); e.stopImmediatePropagation(); return;}
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
  function ownLectureKey(e){
    e.preventDefault();
    e.stopImmediatePropagation();
  }
  function isTypingTarget(el){
    var tag=s(el && el.tagName).toLowerCase();
    return !!(el && (el.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select'));
  }
  document.addEventListener('keydown',function(e){
    var state=st();
    if(s(state.view) !== 'learning' || s(state.learnTab || 'theory') !== 'theory' || s(state.e134Mode) !== 'lecture')return;
    if(isTypingTarget(e.target))return;
    var l=currentLesson(lessons());
    var total=slides(l).length;
    var idx=Number(state.e134SlideIndex || 0);
    var max=Math.max(0,total-1);
    var key=e.key;
    if(key === 'Escape'){ownLectureKey(e); state.e134Mode='read'; save(); render(); return;}
    if(key === 'ArrowLeft' || key === 'PageUp'){ownLectureKey(e); state.e134SlideIndex=Math.max(0,idx-1); save(); render(); return;}
    if(key === 'ArrowRight' || key === 'PageDown' || key === ' '){ownLectureKey(e); state.e134SlideIndex=Math.min(max,idx+1); save(); render(); return;}
    if(key === 'Home'){ownLectureKey(e); state.e134SlideIndex=0; save(); render(); return;}
    if(key === 'End'){ownLectureKey(e); state.e134SlideIndex=max; save(); render(); return;}
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
