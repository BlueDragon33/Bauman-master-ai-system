/* E212 Reader Pro content bridge · structured content + pro summary panel. */
(function(){
  'use strict';
  var RELEASE='E212_READER_PRO_CONTENT_AND_LAYOUT';
  var records=[], byId={}, byTitle={}, ready=false, loading=false, last='';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function short(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'...':s;}
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function load(){
    if(ready||loading)return Promise.resolve(ready);
    loading=true;
    return fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('theory content HTTP '+r.status);return r.json();}).then(function(j){
      records=(j&&j.records)||[];
      records.forEach(function(r){
        if(r.lessonId)byId[norm(r.lessonId)]=r;
        if(r.lessonTitle)byTitle[norm(r.lessonTitle)]=r;
        if(r.title)byTitle[norm(r.title)]=r;
      });
      ready=true; return true;
    }).catch(function(e){console.warn('[E212] theory content unavailable',e); return false;}).finally(function(){loading=false;});
  }
  function deck(){return document.querySelector('.e132-overlay-deck.open');}
  function mode(){var d=deck(); return d?text(d.querySelector('[data-e202-mode], .e132-clean-role')):'';}
  function currentIndex(){
    var d=deck(), c=d&&text(d.querySelector('[data-e202-count]'));
    var m=(c||'').match(/(\d+)\s*\//);
    return m?Math.max(0,parseInt(m[1],10)-1):0;
  }
  function candidates(){
    var s=state(), a=[];
    ['lessonId','currentLessonId','selectedLessonId','e129LessonId','theoryLessonId','lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])a.push(s[k]);});
    var selectors=['[data-e210-lesson-id]','.e210-source-line','.e129-lesson-title','.e129-reader-title','[data-e129-current-title]','.e129-chip-btn.active','.e129-chip-btn[aria-pressed="true"]','.e129-slide-chip.active','.e132-clean-side small','.e132-clean-main h1'];
    selectors.forEach(function(sel){Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(function(n){a.push(text(n));});});
    return a.filter(Boolean);
  }
  function findRecord(){
    var c=candidates(), i, k, n;
    for(i=0;i<c.length;i++){n=norm(c[i]); if(byId[n])return byId[n]; if(byTitle[n])return byTitle[n];}
    for(i=0;i<c.length;i++){
      n=norm(c[i]).replace(/^(dang trinh chieu|bai dang duoc trinh chieu|bai|kiem tra bai)\s*/,'').trim();
      if(byId[n])return byId[n]; if(byTitle[n])return byTitle[n];
    }
    for(i=0;i<c.length;i++){
      n=norm(c[i]);
      for(k in byTitle){if(k&&n.indexOf(k)>=0)return byTitle[k];}
      for(k in byId){if(k&&n.indexOf(k)>=0)return byId[k];}
    }
    return null;
  }
  function blockOf(slide,type){return (slide.blocks||[]).filter(function(b){return b.type===type;});}
  function firstText(slide){return blockOf(slide,'text')[0]||blockOf(slide,'formula')[0]||blockOf(slide,'qa')[0]||blockOf(slide,'code')[0]||null;}
  function formula(slide){var b=blockOf(slide,'formula')[0]; return b?b.body:'';}
  function application(slide){var t=blockOf(slide,'text'); return t[1]||t[2]||blockOf(slide,'code')[0]||blockOf(slide,'formula')[0]||t[0]||null;}
  function qa(slide){return blockOf(slide,'qa')[0]||null;}
  function setText(el,val){if(el)el.textContent=val||'';}
  function cardHtml(label,head,body,cls){return '<article class="e132-clean-card '+esc(cls||'concept')+'"><span class="e132-card-kicker">'+esc(label)+'</span><h3>'+esc(head||'')+'</h3><p class="e132-full-body">'+esc(body||'')+'</p></article>';}
  function ensureStyle(){
    if(document.getElementById('e212-reader-pro-style'))return;
    var css='.e211-reader-pro .e202-hero{grid-template-columns:minmax(0,1.85fr) minmax(300px,.85fr)!important;min-height:330px!important}.e211-reader-pro .e202-hero-copy{justify-content:flex-start!important;padding-top:18px!important}.e211-reader-pro .e202-insight{font-size:clamp(16px,1.15vw,19px)!important;line-height:1.55!important;max-width:900px!important}.e211-reader-pro .e132-clean-main h1{font-size:clamp(32px,3.2vw,48px)!important;line-height:1.03!important}.e211-reader-pro .e202-card-grid{max-height:230px!important;min-height:160px!important;grid-auto-rows:minmax(138px,1fr)!important}.e211-reader-pro .e132-clean-card{padding:12px 14px!important;min-height:138px!important}.e211-reader-pro .e132-clean-card h3{font-size:clamp(17px,1.15vw,21px)!important;line-height:1.16!important}.e211-reader-pro .e132-clean-card p{font-size:clamp(13px,.95vw,16px)!important;line-height:1.42!important}.e211-reader-pro .e202-visual{min-height:310px!important}.e211-summary-panel{border:1px solid rgba(125,211,252,.22);background:rgba(255,255,255,.055);border-radius:18px;padding:15px;text-align:left}.e211-summary-panel h3{margin:0 0 8px;color:#f8fbff;font-size:18px;line-height:1.2}.e211-summary-panel .e211-slide-name{margin:0 0 10px;color:#a7dfff;font-weight:900;font-size:13px}.e211-summary-list{margin:0;padding-left:18px;color:#d7e7f8;font-size:14px;line-height:1.42}.e211-summary-list li{margin:6px 0}.e211-keyline{margin-top:10px;border-top:1px solid rgba(125,211,252,.18);padding-top:8px;color:#c8d7eb;font-size:12px;font-weight:800}.e211-reader-pro .e202-formula-strip{max-width:920px!important}';
    var st=document.createElement('style'); st.id='e212-reader-pro-style'; st.textContent=css; document.head.appendChild(st);
  }
  function summaryItems(slide){
    var items=[];
    (slide.blocks||[]).forEach(function(b){
      if(items.length>=4)return;
      if(b&&b.body&&(b.type==='text'||b.type==='formula'||b.type==='qa'||b.type==='code'))items.push({title:b.title||'Ý chính',body:b.body});
    });
    return items;
  }
  function summaryPanel(record,slide,mainBlock,appBlock,formulaText){
    var items=summaryItems(slide);
    if(!items.length && mainBlock)items.push(mainBlock);
    if(items.length<2 && appBlock)items.push(appBlock);
    var lis=items.slice(0,4).map(function(x){return '<li><b>'+esc(x.title||'Ý')+':</b> '+esc(short(x.body||'',135))+'</li>';}).join('');
    var key=formulaText?'<div class="e211-keyline">Công thức/ký hiệu: '+esc(short(formulaText,130))+'</div>':'';
    return '<div class="e202-tag">Reader Pro</div><div class="e211-summary-panel"><h3>'+esc(record.lessonTitle||record.title||'Bài học')+'</h3><p class="e211-slide-name">Slide: '+esc(slide.title||'Nội dung chính')+'</p><ul class="e211-summary-list">'+lis+'</ul>'+key+'</div><div class="e202-note">Tóm tắt ý chính từ dữ liệu bài giảng gốc</div>';
  }
  function apply(){
    var d=deck(); if(!d)return;
    var m=mode();
    if(!/Reader Pro/i.test(m)){d.classList.remove('e211-reader-pro');return;}
    if(!ready){load().then(schedule); return;}
    var r=findRecord(); if(!r||!Array.isArray(r.slides)||!r.slides.length)return;
    ensureStyle();
    d.classList.add('e211-reader-pro');
    var idx=currentIndex();
    if(idx>=r.slides.length)idx=0;
    var s=r.slides[idx]||r.slides[0];
    var sig=(r.lessonId||r.lessonTitle)+'|'+idx+'|'+text(d.querySelector('[data-e202-count]'));
    if(sig===last)return; last=sig;

    var title=s.title||r.lessonTitle||r.title||'Bài học';
    var main=d.querySelector('.e132-clean-main');
    var h=main&&main.querySelector('h1');
    setText(h,title);

    var lessonTitle=r.lessonTitle||r.title||r.lessonId||'Bài học';
    var lessonLine=main&&main.querySelector('[data-e210-source-line], .e210-source-line');
    if(lessonLine)lessonLine.textContent='Bài đang được trình chiếu: '+lessonTitle;
    var side=d.querySelector('.e132-clean-side small');
    setText(side,lessonTitle);
    var chip=d.querySelector('[data-e210-lesson-id]');
    if(chip)chip.textContent='Đang trình chiếu: '+lessonTitle;

    var b1=firstText(s), b2=application(s), b3=qa(s), f=formula(s);
    var insight=main&&main.querySelector('.e202-insight');
    setText(insight,(b1&&b1.body)||title);

    var strip=main&&main.querySelector('.e202-formula-strip');
    if(f){
      if(!strip && main){
        var copy=main.querySelector('.e202-hero-copy');
        if(copy){strip=document.createElement('div');strip.className='e202-formula-strip';strip.innerHTML='<b>Công thức</b><code></code>';copy.appendChild(strip);}
      }
      if(strip){strip.style.display='grid'; setText(strip.querySelector('code'),f);}
    }else if(strip){strip.style.display='none';}

    var grid=main&&main.querySelector('.e202-card-grid');
    if(grid){
      grid.innerHTML=cardHtml((b1&&b1.title)||'Ý chính', title, (b1&&b1.body)||'', 'concept')+
        cardHtml((b2&&b2.title)||'Ứng dụng / Ý nghĩa', (b2&&b2.title)||'Ý nghĩa trong bài', (b2&&b2.body)||'', 'application')+
        cardHtml((b3&&b3.title)||'Tự kiểm', (b3&&b3.title)||'Câu hỏi tự kiểm', (b3&&b3.body)||('Bài đang trình chiếu: '+lessonTitle), 'check');
    }

    var visualBox=d.querySelector('.e202-visual');
    if(visualBox){visualBox.innerHTML=summaryPanel(r,s,b1,b2,f);}
  }
  var scheduled=false;
  function schedule(){if(scheduled)return; scheduled=true; requestAnimationFrame(function(){scheduled=false; apply();});}
  function boot(){load().then(schedule);try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}document.addEventListener('click',function(){setTimeout(schedule,0);},true);document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E211_READER_CONTENT={release:RELEASE,apply:apply,selfCheck:function(){var r=findRecord();return {ok:true,release:RELEASE,ready:ready,record:r&&(r.lessonTitle||r.lessonId)||'',mode:mode(),slideIndex:currentIndex()};}};
})();
