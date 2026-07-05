/* E210 lesson identity label for the active slideshow only. */
(function(){
  'use strict';
  var RELEASE='E210_LESSON_IDENTITY_LABEL';
  var last='';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function clean(s){
    s=String(s||'').replace(/\s+/g,' ').trim();
    s=s.replace(/^(Reader Pro|C0\d Level C|Stable renderer|Slide|Bài đang mở|Trình chiếu)\s*[:·-]?\s*/i,'');
    s=s.replace(/\b(Reader source|Mode|Stable Math Deck)\b/gi,'').replace(/\s+/g,' ').trim();
    return s||'Bài đang mở';
  }
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function attr(n){
    if(!n)return'';
    var a=[text(n)];
    ['data-lesson-id','data-id','data-key','data-title','aria-label','title'].forEach(function(k){var v=n.getAttribute&&n.getAttribute(k); if(v)a.push(v);});
    return a.join(' ');
  }
  function activeShell(){return document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');}
  function lessonTitle(){
    var s=state(), cand=[];
    ['lessonTitle','currentLessonTitle','selectedTheoryTitle','currentLessonId','selectedLessonId','e129LessonId','theoryLessonId'].forEach(function(k){if(s&&s[k])cand.push(s[k]);});
    var shell=activeShell();
    if(shell){
      ['.e129-lesson-title','.e129-reader-title','[data-e129-current-title]','.e129-chip-btn.active','.e129-chip-btn[aria-pressed="true"]','.e129-slide-chip.active'].forEach(function(sel){
        Array.prototype.slice.call(shell.querySelectorAll(sel)).forEach(function(n){cand.push(attr(n));});
      });
    }
    var h=document.querySelector('.e132-overlay-deck.open .e132-clean-main h1');
    if(h)cand.push(text(h));
    for(var i=0;i<cand.length;i++){
      var t=clean(cand[i]);
      if(t && t.length>5 && !/^(Reader Pro|Bài đang mở)$/i.test(t)) return t;
    }
    return 'Bài đang mở';
  }
  function ensureStyle(){
    if(document.getElementById('e210-lesson-identity-style'))return;
    var css='.e210-lesson-id{display:inline-flex;align-items:center;max-width:640px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid rgba(125,211,252,.28);background:rgba(14,165,233,.10);color:#dff6ff;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:900;letter-spacing:.02em}.e210-source-line{margin-top:4px;color:#9fc6e8;font-size:12px;font-weight:850;letter-spacing:.02em}.e210-check-line{margin-top:8px;border-top:1px solid rgba(125,211,252,.16);padding-top:8px;color:#bae6fd;font-size:12px;font-weight:800}';
    var st=document.createElement('style'); st.id='e210-lesson-identity-style'; st.textContent=css; document.head.appendChild(st);
  }
  function apply(){
    var deck=document.querySelector('.e132-overlay-deck.open');
    if(!deck)return;
    ensureStyle();
    var title=lessonTitle();
    var sig=title+'|'+text(deck.querySelector('[data-e202-count]'))+'|'+text(deck.querySelector('[data-e202-mode]'));
    if(sig===last)return;
    last=sig;
    var bar=deck.querySelector('.e132-cleanbar div');
    if(bar){
      var chip=bar.querySelector('[data-e210-lesson-id]');
      if(!chip){chip=document.createElement('span'); chip.className='e210-lesson-id'; chip.setAttribute('data-e210-lesson-id','1'); bar.appendChild(chip);}
      chip.textContent='Đang trình chiếu: '+title;
    }
    var main=deck.querySelector('.e132-clean-main');
    var h=main&&main.querySelector('h1');
    if(h){
      var line=main.querySelector('[data-e210-source-line]');
      if(!line){line=document.createElement('div'); line.className='e210-source-line'; line.setAttribute('data-e210-source-line','1'); h.insertAdjacentElement('afterend',line);}
      line.textContent='Bài đang được trình chiếu: '+title;
    }
    var check=deck.querySelector('.e132-clean-card.check');
    if(check){
      var c=check.querySelector('[data-e210-check-line]');
      if(!c){c=document.createElement('div'); c.className='e210-check-line'; c.setAttribute('data-e210-check-line','1'); check.appendChild(c);}
      c.textContent='Kiểm tra bài: '+title;
    }
  }
  var scheduled=false;
  function schedule(){if(scheduled)return; scheduled=true; requestAnimationFrame(function(){scheduled=false; apply();});}
  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
    document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E210_LESSON_IDENTITY={release:RELEASE,apply:apply,selfCheck:function(){return {ok:true,release:RELEASE,lesson:lessonTitle(),active:!!document.querySelector('.e132-overlay-deck.open')};}};
})();
