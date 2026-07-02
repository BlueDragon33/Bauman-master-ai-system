/* E130 · Program Frame UI View
 * UI route only. No import target change. No chapterId migration.
 */
(function(){
  'use strict';
  var RELEASE='E130_MATH_PROGRAM_FRAME_UI_VIEW';
  var FRAME_PATH='data/math_program_frame.json';
  var MAP_PATH='data/math_program_map.json';
  var cache={frame:null,map:null,error:null};

  function api(){return window.__BAUMAN_CORE_API||{};}
  function st(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function arr(x){return Array.isArray(x)?x:[];}
  function el(tag,cls,text){var n=document.createElement(tag); if(cls)n.className=cls; if(text!=null)n.textContent=String(text); return n;}
  function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);}
  function save(){try{api().save&&api().save();}catch(_){}}
  function setHeader(title,sub){
    var p=document.getElementById('pageTitle'); if(p)p.textContent=title||'Lý thuyết';
    var s=document.getElementById('pageSub'); if(s)s.textContent=sub||'';
    var c=document.getElementById('coreLabel'); if(c)c.textContent='MATH · E130 Program Frame';
  }
  function load(){
    if(cache.frame&&cache.map)return Promise.resolve(cache);
    return Promise.all([
      fetch(FRAME_PATH,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(FRAME_PATH+' '+r.status);return r.json();}),
      fetch(MAP_PATH,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(MAP_PATH+' '+r.status);return r.json();})
    ]).then(function(xs){cache.frame=xs[0];cache.map=xs[1];return cache;}).catch(function(e){cache.error=e;return cache;});
  }
  function byLecture(map){
    var out={};
    arr(map&&map.chapterMappings).forEach(function(m){
      [m.primaryProgramLectureId].concat(arr(m.secondaryProgramLectureIds)).filter(Boolean).forEach(function(id){(out[id]=out[id]||[]).push(m);});
    });
    Object.keys(out).forEach(function(k){out[k].sort(function(a,b){return Number(a.chapterNo||0)-Number(b.chapterNo||0);});});
    return out;
  }
  function toggle(active){
    var box=el('div','e130-route-toggle'); box.setAttribute('data-e130-toggle','1');
    var b1=el('button',active==='bauman'?'active':'','Lộ trình Bauman'); b1.type='button'; b1.setAttribute('data-e130-route','bauman');
    var b2=el('button',active==='program'?'active':'','Khung bài giảng Bauman'); b2.type='button'; b2.setAttribute('data-e130-route','program');
    box.appendChild(b1); box.appendChild(b2); return box;
  }
  function chapterPills(parent,items,anchorId){
    var wrap=el('div','e130-chapter-pills');
    if(!items.length){wrap.appendChild(el('div','e130-empty','Chưa map chương nào vào anchor này.')); parent.appendChild(wrap); return;}
    items.forEach(function(m){
      var b=el('button',m.primaryProgramLectureId===anchorId?'primary':'secondary');
      b.type='button'; b.setAttribute('data-e130-chapter',m.chapterId||'');
      b.appendChild(el('b','',m.chapterNo?'C'+m.chapterNo:'C?'));
      b.appendChild(el('span','',m.stageId||''));
      b.appendChild(el('em','',m.roadmapRole||m.disciplineId||'mapped'));
      wrap.appendChild(b);
    });
    parent.appendChild(wrap);
  }
  function anchorCard(a,lookup){
    var card=el('article','e130-anchor-card'); card.setAttribute('data-e130-anchor',a.programLectureId||'');
    var head=el('header'); head.appendChild(el('span','e130-no','Bài giảng '+(a.lectureNo||'?'))); head.appendChild(el('h4','',a.title||'Lecture anchor')); card.appendChild(head);
    var focus=el('p','e130-focus'); focus.textContent='Trọng tâm Bauman: '+(a.baumanFocus||''); card.appendChild(focus);
    var ms=arr(lookup[a.programLectureId]);
    var meta=el('div','e130-meta'); meta.appendChild(el('span','',arr(a.stageHints).join(' · ')||'stage pending')); meta.appendChild(el('span','',ms.length+' chương liên kết')); meta.appendChild(el('span','','Lab Work')); card.appendChild(meta);
    var lab=el('div','e130-lab'); lab.textContent='Ứng dụng lập trình: '+arr(a.labWork&&a.labWork.suggestedTasks).slice(0,3).join(' · '); card.appendChild(lab);
    chapterPills(card,ms,a.programLectureId);
    return card;
  }
  function renderProgram(data){
    var view=document.getElementById('view'); if(!view)return false;
    var frame=data.frame||{}, map=data.map||{}, lookup=byLecture(map);
    clear(view); setHeader('Khung bài giảng Bauman E130','21 anchor gom chương/bài/nội dung theo định hướng 09.04.01');
    var main=el('main','e130-program-view'); main.setAttribute('data-e130-release',RELEASE); main.appendChild(toggle('program'));
    var hero=el('section','e130-hero');
    var htext=el('div'); htext.appendChild(el('span','e130-kicker','E130 · Program Frame')); htext.appendChild(el('h2','',frame.title||'Khung chương trình Toán')); htext.appendChild(el('p','',frame.orientation||''));
    var stats=el('aside'); stats.appendChild(el('b','',arr(map.chapterMappings).length)); stats.appendChild(el('span','','chương active đã map'));
    hero.appendChild(htext); hero.appendChild(stats); main.appendChild(hero);
    main.appendChild(el('div','e130-note','21 anchor là trục gom nội dung, không phải giới hạn 21 bài. Nội dung thật vẫn nhập qua theory_lecture_content và các nguồn *_content.'));
    arr(frame.blocks).forEach(function(block){
      var bs=el('section','e130-block'); var bh=el('div','e130-block-head');
      bh.appendChild(el('span','','Khối '+(block.blockNo||''))); bh.appendChild(el('h3','',block.blockTitle||'')); bh.appendChild(el('p','',block.blockRole||'')); bs.appendChild(bh);
      arr(block.sections).forEach(function(sec){var ss=el('section','e130-section'); ss.appendChild(el('h3','',sec.sectionTitle||'')); var grid=el('div','e130-anchor-grid'); arr(sec.lectureAnchors).forEach(function(a){grid.appendChild(anchorCard(a,lookup));}); ss.appendChild(grid); bs.appendChild(ss);});
      main.appendChild(bs);
    });
    view.appendChild(main); return true;
  }
  function openProgram(){
    var s=st(); s.view='learning'; s.learnTab='theory'; s.e130Route='program'; save();
    var view=document.getElementById('view'); if(view){clear(view); view.appendChild(el('main','e130-program-view','Đang tải khung chương trình E130...'));}
    setHeader('Khung bài giảng Bauman E130','Đang tải math_program_frame/map...');
    load().then(function(data){if(data.error){if(view){clear(view);view.appendChild(el('main','e130-program-view','Không tải được E130: '+data.error.message));}return;} renderProgram(data);});
  }
  function openBauman(){
    var s=st(); s.view='learning'; s.learnTab='theory'; s.e130Route='bauman'; save();
    try{if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render){window.BAUMAN_MATH_THEORY_E129.render(); return;}}catch(_){ }
    try{api().render&&api().render();}catch(_){ }
  }
  function injectToggle(){var view=document.getElementById('view'); if(!view||view.querySelector('[data-e130-toggle]'))return; var shell=view.querySelector('.e129-theory-shell'); if(shell)shell.parentNode.insertBefore(toggle('bauman'),shell);}
  function buildNav(){var nav=document.getElementById('nav'); if(!nav||nav.querySelector('[data-e130-open-program]'))return; var b=el('button','nav-btn','🧭 Khung bài giảng E130'); b.type='button'; b.setAttribute('data-e130-open-program','1'); nav.appendChild(b);}
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest&&e.target.closest('[data-e130-route],[data-e130-open-program],[data-e130-chapter]'); if(!t)return;
    if(t.hasAttribute('data-e130-route')){t.getAttribute('data-e130-route')==='program'?openProgram():openBauman(); e.preventDefault(); e.stopPropagation();}
    else if(t.hasAttribute('data-e130-open-program')){openProgram(); e.preventDefault(); e.stopPropagation();}
    else if(t.hasAttribute('data-e130-chapter')){st().chapterId=t.getAttribute('data-e130-chapter'); openBauman(); e.preventDefault(); e.stopPropagation();}
  },true);
  var mo=new MutationObserver(function(){setTimeout(function(){buildNav(); injectToggle();},0);});
  function boot(){buildNav(); injectToggle(); var app=document.getElementById('app')||document.body; if(app)mo.observe(app,{childList:true,subtree:true}); if(st().e130Route==='program')openProgram();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E130_PROGRAM_VIEW={release:RELEASE,open:openProgram,back:openBauman,selfCheck:function(){var meta=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.dataSourceMeta)||{};return {ok:!!(window.BAUMAN_MATH_E130_PROGRAM_FRAME&&meta.math_program_frame&&meta.math_program_map),release:RELEASE,routeToggle:true,defaultRoute:'bauman',programFramePath:meta.math_program_frame&&meta.math_program_frame.path,programMapPath:meta.math_program_map&&meta.math_program_map.path,importTargetUnchanged:'theory_lecture_content'};}};
})();
