/* E132 · Theory Slideshow Enhancer
 * Enhances E129 presenting mode. Does not change imports or DataVault sources.
 * E132 hotfix: force visible slide decoration even when E129 emits plain article slides.
 */
(function(){
  'use strict';
  var RELEASE='E132_THEORY_UI_SLIDESHOW_HOTFIX_VISIBLE_DECK';
  var current=0;
  var lastCount=0;
  var ROLE_ORDER=['problem_framing','deep_essence','counter_intuition','real_bridge','notation','core_formula','assumption_gate','mini_case','interpretation','simulation','common_mistakes','application','practice','professor_qa','bridge','takeaway'];
  var ROLE_LABELS={problem_framing:'Problem Gate',deep_essence:'Big Idea',counter_intuition:'Contrast',real_bridge:'Engineering Bridge',notation:'Notation',core_formula:'Formula Hero',assumption_gate:'Assumption Gate',mini_case:'Mini Case',interpretation:'Meaning Lens',simulation:'Simulation',common_mistakes:'Mistake Alert',application:'Lab Work',practice:'Practice',professor_qa:'Professor Q&A',bridge:'Next Bridge',takeaway:'Takeaway'};

  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function isPresenting(){return document.body.classList.contains('e129-presenting')||!!document.querySelector('.e129-theory-shell.presenting');}
  function shell(){return document.querySelector('.e129-theory-shell.presenting');}
  function slides(){return Array.prototype.slice.call(document.querySelectorAll('.e129-theory-shell.presenting .e129-slide-list .e129-slide'));}
  function list(){return document.querySelector('.e129-theory-shell.presenting .e129-slide-list');}
  function text(n){return (n&&n.textContent||'').toLowerCase();}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function save(){try{api().save&&api().save();}catch(_){} }
  function hasCss(name){return !!document.querySelector('link[href*="'+name+'"]');}
  function cap(s){return String(s||'slide').replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});}

  function roleFor(slide,index){
    var t=text(slide);
    var ordered=ROLE_ORDER[index]||'';
    if(/norm|dot\(|dot product|cosine|công thức|cong thuc|formula|ký hiệu|ky hieu/.test(t)) return 'core_formula';
    if(/lab work|python|c\+\+|ứng dụng lập trình|ung dung lap trinh|nhiệm vụ|nhiem vu/.test(t)) return 'application';
    if(/mô phỏng|mo phong|simulation|numpy/.test(t)) return 'simulation';
    if(/lỗi|loi|mistake|sai lầm|sai lam/.test(t)) return 'common_mistakes';
    if(/vấn đáp|van dap|professor|q&a|câu hỏi|cau hoi/.test(t)) return 'professor_qa';
    if(/kết luận|ket luan|takeaway|nhớ lâu|nho lau/.test(t)) return 'takeaway';
    if(/cầu sang|cau sang|bài tiếp theo|bai tiep theo/.test(t)) return 'bridge';
    if(/điều kiện|dieu kien|assumption|cổng điều kiện|cong dieu kien/.test(t)) return 'assumption_gate';
    if(/phản trực giác|phan truc giac|contrast/.test(t)) return 'counter_intuition';
    return ordered||'slide';
  }

  function classFor(role){
    if(role==='core_formula'||role==='notation') return 'e132-role-formula';
    if(role==='application'||role==='practice'||role==='simulation') return 'e132-role-lab';
    if(role==='assumption_gate'||role==='common_mistakes'||role==='counter_intuition') return 'e132-role-warning';
    if(role==='professor_qa') return 'e132-role-qa';
    if(role==='takeaway'||role==='bridge'||role==='real_bridge') return 'e132-role-bridge';
    return 'e132-role-problem';
  }

  function decorate(slide,index,total){
    var role=roleFor(slide,index);
    var roleClass=classFor(role);
    slide.classList.remove('e132-role-formula','e132-role-lab','e132-role-warning','e132-role-qa','e132-role-bridge','e132-role-problem');
    slide.classList.add(roleClass,'e132-decorated-slide');
    slide.setAttribute('data-e132-role',role);
    slide.style.setProperty('--e132-slide-no','"'+String(index+1).padStart(2,'0')+'"');

    if(!slide.querySelector('.e132-slide-orb')){
      var orb=document.createElement('i'); orb.className='e132-slide-orb'; orb.setAttribute('aria-hidden','true'); slide.insertBefore(orb,slide.firstChild);
    }
    var meta=slide.querySelector('.e132-slide-meta');
    if(!meta){
      meta=document.createElement('div'); meta.className='e132-slide-meta'; slide.insertBefore(meta,slide.firstChild);
    }
    meta.innerHTML='<span class="e132-role-badge">'+(ROLE_LABELS[role]||cap(role))+'</span><span class="e132-slide-counter">'+String(index+1).padStart(2,'0')+' / '+total+'</span>';

    if(!slide.querySelector('.e132-slide-body')){
      var title=slide.querySelector(':scope > h3');
      var body=document.createElement('div'); body.className='e132-slide-body';
      var nodes=Array.prototype.slice.call(slide.childNodes).filter(function(n){return n!==meta&&n!==title&&!((n.classList||{}).contains&&n.classList.contains('e132-slide-orb'));});
      nodes.forEach(function(n){body.appendChild(n);});
      if(title&&title.nextSibling) slide.insertBefore(body,title.nextSibling); else slide.appendChild(body);
    }
  }

  function makeToolbar(total){
    var toolbar=document.createElement('div');
    toolbar.className='e132-deck-toolbar';
    toolbar.setAttribute('data-e132-toolbar','1');
    toolbar.innerHTML='<div class="e132-deck-title"><b>E132 Deck</b><span data-e132-count>Slide 1 / '+total+'</span></div><div class="e132-deck-actions"><button class="e132-deck-btn" data-e132-prev type="button">‹ Trước</button><button class="e132-deck-btn" data-e132-next type="button">Tiếp ›</button><button class="e132-deck-btn" data-e132-exit type="button">Thoát</button></div>';
    return toolbar;
  }

  function makeProgress(){
    var p=document.createElement('div'); p.className='e132-deck-progress'; p.setAttribute('data-e132-progress','1'); p.innerHTML='<span></span>'; return p;
  }

  function ensureControls(total){
    var l=list(); if(!l) return;
    l.classList.add('e132-deck-stage');
    var sh=shell(); if(sh) sh.setAttribute('data-e132-hotfix','visible-deck');
    if(!document.querySelector('[data-e132-toolbar]')) l.parentNode.insertBefore(makeToolbar(total),l);
    if(!document.querySelector('[data-e132-progress]')) l.parentNode.insertBefore(makeProgress(),l);
  }

  function update(){
    var ss=slides();
    if(!ss.length) return false;
    if(lastCount!==ss.length){current=clamp(current,0,ss.length-1);lastCount=ss.length;}
    current=clamp(current,0,ss.length-1);
    ss.forEach(function(sl,i){decorate(sl,i,ss.length);sl.classList.toggle('e132-active',i===current);sl.setAttribute('data-e132-index',String(i+1));});
    var c=document.querySelector('[data-e132-count]'); if(c)c.textContent='Slide '+(current+1)+' / '+ss.length;
    var bar=document.querySelector('[data-e132-progress] span'); if(bar)bar.style.width=((current+1)/ss.length*100)+'%';
    var st=state(); st.e132SlideIndex=current; save();
    return true;
  }

  function enhance(){
    if(!isPresenting()) return false;
    var ss=slides();
    if(!ss.length){var l=list(); if(l&&!document.querySelector('.e132-empty-deck')){var e=document.createElement('div');e.className='e132-empty-deck';e.textContent='Chưa có slide hợp lệ để trình chiếu.';l.parentNode.insertBefore(e,l);} return false;}
    var st=state(); if(typeof st.e132SlideIndex==='number') current=clamp(st.e132SlideIndex,0,ss.length-1);
    ensureControls(ss.length);
    return update();
  }

  function move(delta){current=clamp(current+delta,0,Math.max(0,slides().length-1)); update();}
  function exit(){var st=state(); st.e129Present=false; save(); try{ if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render){window.BAUMAN_MATH_THEORY_E129.render();return;} }catch(_){} document.body.classList.remove('e129-presenting');}

  document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('[data-e132-prev],[data-e132-next],[data-e132-exit]'); if(!t) return; if(t.hasAttribute('data-e132-prev')) move(-1); else if(t.hasAttribute('data-e132-next')) move(1); else if(t.hasAttribute('data-e132-exit')) exit(); e.preventDefault(); e.stopPropagation();},true);
  document.addEventListener('keydown',function(e){if(!isPresenting()) return; if(e.key==='ArrowRight'||e.key==='PageDown'){move(1);e.preventDefault();} else if(e.key==='ArrowLeft'||e.key==='PageUp'){move(-1);e.preventDefault();} else if(e.key==='Escape'){exit();e.preventDefault();}},true);

  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){} enhance();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

  window.BAUMAN_MATH_THEORY_E132={
    release:RELEASE,
    enhance:enhance,
    selfCheck:function(){
      var e129=!!window.BAUMAN_MATH_THEORY_E129;
      var tokens=hasCss('theory-ui-tokens-E132.css');
      var reader=hasCss('theory-reader-E132.css');
      var deck=hasCss('theory-slideshow-E132.css');
      return {ok:e129&&tokens&&reader&&deck,release:RELEASE,e129Detected:e129,importTargetUnchanged:'theory_lecture_content',tokensCssLoaded:tokens,readerCssLoaded:reader,slideshowCssLoaded:deck,slideshowEnhancer:true,visibleDeckHotfix:true,decoratedSlides:document.querySelectorAll('.e132-decorated-slide').length,canvaReference:true,canvaRuntimeMapping:'subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md',slidesDetected:slides().length,keyboard:true,escapeToExit:true};
    }
  };
})();
