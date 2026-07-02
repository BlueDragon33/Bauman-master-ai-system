/* E132 · Theory Slideshow Enhancer
 * Enhances E129 presenting mode. Does not change imports or DataVault sources.
 */
(function(){
  'use strict';
  var RELEASE='E132_THEORY_UI_SLIDESHOW';
  var current=0;
  var lastCount=0;

  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function isPresenting(){return document.body.classList.contains('e129-presenting')||!!document.querySelector('.e129-theory-shell.presenting');}
  function slides(){return Array.prototype.slice.call(document.querySelectorAll('.e129-theory-shell.presenting .e129-slide-list .e129-slide'));}
  function list(){return document.querySelector('.e129-theory-shell.presenting .e129-slide-list');}
  function text(n){return (n&&n.textContent||'').toLowerCase();}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function save(){try{api().save&&api().save();}catch(_){} }

  function classify(slide){
    var t=text(slide);
    slide.classList.remove('e132-role-formula','e132-role-lab','e132-role-warning','e132-role-qa');
    if(/formula|công thức|ky hieu|ký hiệu|norm|cosine|dot/.test(t)) slide.classList.add('e132-role-formula');
    else if(/lab|ứng dụng|ung dung|mô phỏng|mo phong|practice|bài luyện|luyện tập|code|python|c\+\+/.test(t)) slide.classList.add('e132-role-lab');
    else if(/lỗi|loi|mistake|điều kiện|dieu kien|phản trực giác|phan truc giac|cảnh báo/.test(t)) slide.classList.add('e132-role-warning');
    else if(/qa|q&a|vấn đáp|van dap|câu hỏi|cau hoi|professor/.test(t)) slide.classList.add('e132-role-qa');
  }

  function makeToolbar(total){
    var toolbar=document.createElement('div');
    toolbar.className='e132-deck-toolbar';
    toolbar.setAttribute('data-e132-toolbar','1');
    toolbar.innerHTML='<div class="e132-deck-title"><b>E132</b><span data-e132-count>Slide 1 / '+total+'</span></div><div class="e132-deck-actions"><button class="e132-deck-btn" data-e132-prev type="button">‹ Trước</button><button class="e132-deck-btn" data-e132-next type="button">Tiếp ›</button><button class="e132-deck-btn" data-e132-exit type="button">Thoát</button></div>';
    return toolbar;
  }

  function makeProgress(){
    var p=document.createElement('div');
    p.className='e132-deck-progress';
    p.setAttribute('data-e132-progress','1');
    p.innerHTML='<span></span>';
    return p;
  }

  function ensureControls(total){
    var l=list(); if(!l) return;
    if(!document.querySelector('[data-e132-toolbar]')) l.parentNode.insertBefore(makeToolbar(total),l);
    if(!document.querySelector('[data-e132-progress]')) l.parentNode.insertBefore(makeProgress(),l);
  }

  function update(){
    var ss=slides();
    if(!ss.length) return false;
    if(lastCount!==ss.length){current=clamp(current,0,ss.length-1);lastCount=ss.length;}
    current=clamp(current,0,ss.length-1);
    ss.forEach(function(sl,i){classify(sl);sl.classList.toggle('e132-active',i===current);sl.setAttribute('data-e132-index',String(i+1));});
    var c=document.querySelector('[data-e132-count]'); if(c)c.textContent='Slide '+(current+1)+' / '+ss.length;
    var bar=document.querySelector('[data-e132-progress] span'); if(bar)bar.style.width=((current+1)/ss.length*100)+'%';
    var st=state(); st.e132SlideIndex=current; save();
    return true;
  }

  function enhance(){
    if(!isPresenting()) return false;
    var ss=slides();
    if(!ss.length){
      var l=list();
      if(l&&!document.querySelector('.e132-empty-deck')){var e=document.createElement('div');e.className='e132-empty-deck';e.textContent='Chưa có slide hợp lệ để trình chiếu.';l.parentNode.insertBefore(e,l);} return false;
    }
    var st=state();
    if(typeof st.e132SlideIndex==='number') current=clamp(st.e132SlideIndex,0,ss.length-1);
    ensureControls(ss.length);
    return update();
  }

  function move(delta){current+=delta; update();}
  function exit(){
    var st=state(); st.e129Present=false; save();
    try{ if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render){window.BAUMAN_MATH_THEORY_E129.render();return;} }catch(_){}
    document.body.classList.remove('e129-presenting');
  }

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest&&e.target.closest('[data-e132-prev],[data-e132-next],[data-e132-exit]');
    if(!t) return;
    if(t.hasAttribute('data-e132-prev')) move(-1);
    else if(t.hasAttribute('data-e132-next')) move(1);
    else if(t.hasAttribute('data-e132-exit')) exit();
    e.preventDefault(); e.stopPropagation();
  },true);

  document.addEventListener('keydown',function(e){
    if(!isPresenting()) return;
    if(e.key==='ArrowRight'||e.key==='PageDown'){move(1);e.preventDefault();}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){move(-1);e.preventDefault();}
    else if(e.key==='Escape'){exit();e.preventDefault();}
  },true);

  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){
    try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    enhance();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

  window.BAUMAN_MATH_THEORY_E132={
    release:RELEASE,
    enhance:enhance,
    selfCheck:function(){
      var e129=!!window.BAUMAN_MATH_THEORY_E129;
      return {ok:e129&&!!document.querySelector('link[href*="theory-ui-tokens-E132.css"]')&&!!document.querySelector('link[href*="theory-slideshow-E132.css"]'),release:RELEASE,e129Detected:e129,importTargetUnchanged:'theory_lecture_content',slideshowEnhancer:true,canvaReference:true,slidesDetected:slides().length,keyboard:true,escapeToExit:true};
    }
  };
})();
