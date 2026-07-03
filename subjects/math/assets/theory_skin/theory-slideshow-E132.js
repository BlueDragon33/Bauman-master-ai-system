/* E160 · Isolated Theory Slideshow Deck · Full Lecture Mode
 * Builds a separate overlay deck after E129 switches to presenting mode.
 * Default mode is full lecture: render every block without truncation.
 * Compact mode remains optional for quick presentation preview only.
 */
(function(){
  'use strict';
  var RELEASE='E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE';
  var idx=0;
  var deck=null;
  var model=[];
  var mode='full';
  var ROLES=['problem_framing','deep_essence','counter_intuition','real_bridge','notation','core_formula','assumption_gate','mini_case','interpretation','simulation','common_mistakes','application','practice','professor_qa','bridge','takeaway'];
  var LABEL={problem_framing:'Problem Gate',deep_essence:'Big Idea',counter_intuition:'Contrast',real_bridge:'Engineering Bridge',notation:'Notation',core_formula:'Formula Hero',assumption_gate:'Assumption Gate',mini_case:'Mini Case',interpretation:'Meaning Lens',simulation:'Simulation',common_mistakes:'Mistake Alert',application:'Lab Work',practice:'Practice',professor_qa:'Professor Q&A',bridge:'Next Bridge',takeaway:'Takeaway'};
  var LIMIT={problem_framing:2,deep_essence:2,counter_intuition:2,real_bridge:2,notation:2,core_formula:3,assumption_gate:3,mini_case:2,interpretation:3,simulation:2,common_mistakes:3,application:2,practice:3,professor_qa:3,bridge:2,takeaway:2};

  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function save(){try{api().save&&api().save();}catch(_){} }
  function css(name){return !!document.querySelector('link[href*="'+name+'"]');}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function rawText(n){return (n&&n.textContent||'').replace(/\r\n/g,'\n').trim();}
  function compact(s,n){s=String(s||'').replace(/\s+/g,' ').trim();n=n||210;return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s;}
  function sentenceBits(s,max){
    s=String(s||'').replace(/\s+/g,' ').trim();
    var bits=s.split(/(?<=[.!?。])\s+|;\s+|\.\s+/).map(function(x){return compact(x,155);}).filter(Boolean);
    if(!bits.length&&s) bits=[compact(s,155)];
    return bits.slice(0,max||2);
  }
  function isPresenting(){return document.body.classList.contains('e129-presenting')||!!document.querySelector('.e129-theory-shell.presenting');}
  function sourceSlides(){return Array.prototype.slice.call(document.querySelectorAll('.e129-theory-shell.presenting .e129-slide-list .e129-slide'));}
  function clamp(n){return Math.max(0,Math.min(Math.max(model.length-1,0),n));}

  function roleFor(slide,i){
    var t=text(slide).toLowerCase();
    if(/norm|dot|cosine|công thức|cong thuc|formula|ký hiệu|ky hieu/.test(t)) return 'core_formula';
    if(/lab work|python|c\+\+|ứng dụng lập trình|ung dung lap trinh|nhiệm vụ|nhiem vu/.test(t)) return 'application';
    if(/mô phỏng|mo phong|simulation|numpy/.test(t)) return 'simulation';
    if(/lỗi|loi|mistake|sai lầm|sai lam/.test(t)) return 'common_mistakes';
    if(/vấn đáp|van dap|professor|q&a|câu hỏi|cau hoi/.test(t)) return 'professor_qa';
    if(/kết luận|ket luan|takeaway|nhớ lâu|nho lau/.test(t)) return 'takeaway';
    if(/cầu sang|cau sang|bài tiếp theo|bai tiep theo/.test(t)) return 'bridge';
    if(/điều kiện|dieu kien|assumption|cổng điều kiện|cong dieu kien/.test(t)) return 'assumption_gate';
    if(/phản trực giác|phan truc giac|contrast/.test(t)) return 'counter_intuition';
    return ROLES[i]||'slide';
  }
  function tone(role){
    if(role==='core_formula'||role==='notation') return 'formula';
    if(role==='application'||role==='practice'||role==='simulation') return 'lab';
    if(role==='assumption_gate'||role==='common_mistakes'||role==='counter_intuition') return 'warning';
    if(role==='professor_qa') return 'qa';
    if(role==='bridge'||role==='takeaway'||role==='real_bridge') return 'bridge';
    return 'concept';
  }

  function rawBlocks(slide){
    var nodes=Array.prototype.slice.call(slide.children).filter(function(n){return !n.matches('.e132-slide-meta,.e132-slide-orb,.e132-slide-body');});
    var blocks=[];
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.tagName==='H3' && i===0) continue;
      if(n.tagName==='H3'){
        var next=nodes[i+1];
        var b={title:text(n),body:'',kind:'text'};
        if(next && (next.tagName==='P'||next.tagName==='PRE')){b.body=rawText(next);b.kind=next.tagName==='PRE'?'formula':'text';i++;}
        blocks.push(b);
      }else if(n.tagName==='PRE'){
        var raw=rawText(n); var parts=raw.split('\n');
        blocks.push({title:compact(parts.shift()||'Công thức',90),body:parts.join('\n')||raw,kind:'formula'});
      }else if(n.tagName==='P'){
        blocks.push({title:'Ý chính',body:rawText(n),kind:'text'});
      }
    }
    return blocks.filter(function(b){return b.title||b.body;});
  }
  function fullBlocks(blocks){
    return blocks.map(function(b){
      return {
        title:compact(b.title||'Ý chính',120),
        kind:b.kind==='formula'?'formula':'text',
        body:String(b.body||'').trim()
      };
    });
  }
  function compactBlocks(blocks,role){
    var max=LIMIT[role]||2;
    return blocks.slice(0,max).map(function(b){
      var kind=b.kind==='formula'?'formula':'text';
      var bullets=kind==='formula'?[compact(b.body,260)]:sentenceBits(b.body,2);
      return {title:compact(b.title||'Ý chính',64),kind:kind,bullets:bullets};
    });
  }

  function readModel(){
    var ss=sourceSlides();
    model=ss.map(function(slide,i){
      var h=slide.querySelector(':scope > h3');
      var title=compact(text(h).replace(/^\d+\.\s*/, '') || ('Slide '+(i+1)),140);
      var role=roleFor(slide,i);
      var blocks=rawBlocks(slide);
      return {title:title,role:role,tone:tone(role),fullBlocks:fullBlocks(blocks),compactBlocks:compactBlocks(blocks,role),rawBlockCount:blocks.length};
    });
    if(idx>=model.length) idx=0;
    return model.length;
  }

  function ensureDeck(){
    if(deck) return deck;
    deck=document.createElement('section');
    deck.className='e132-overlay-deck';
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-label','E160 Theory Slideshow Full Lecture');
    deck.innerHTML='<div class="e132-deck-bg"></div><header class="e132-cleanbar"><div><b>E160 Theory Deck</b><span data-e132-clean-count>Slide</span><span data-e132-mode-label>Full lecture</span></div><nav><button data-e132-prev type="button">‹</button><button data-e132-next type="button">›</button><button data-e132-mode type="button">Compact</button><button data-e132-exit type="button">Thoát</button></nav></header><div class="e132-clean-progress"><span></span></div><main class="e132-clean-stage" data-e132-stage></main><footer class="e132-clean-hint">← → / Space để chuyển slide · Esc để thoát · Full lecture hiển thị đủ block từ theory_lecture_content</footer>';
    document.body.appendChild(deck);
    deck.addEventListener('click',function(e){
      var t=e.target.closest('[data-e132-prev],[data-e132-next],[data-e132-mode],[data-e132-exit]');
      if(!t) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if(t.hasAttribute('data-e132-prev')) move(-1);
      if(t.hasAttribute('data-e132-next')) move(1);
      if(t.hasAttribute('data-e132-mode')) toggleMode();
      if(t.hasAttribute('data-e132-exit')) closeDeck();
    },true);
    return deck;
  }

  function fullBlockHtml(b){
    var body=b.body||'Chưa có nội dung chi tiết.';
    if(b.kind==='formula') return '<article class="e132-clean-card formula"><h3>'+esc(b.title)+'</h3><pre>'+esc(body)+'</pre></article>';
    return '<article class="e132-clean-card text"><h3>'+esc(b.title)+'</h3><p class="e132-full-body">'+esc(body)+'</p></article>';
  }
  function compactBlockHtml(b){
    var items=b.bullets&&b.bullets.length?b.bullets:['Chưa có ý chính.'];
    var body=b.kind==='formula'?'<pre>'+esc(items.join('\n'))+'</pre>':'<ul>'+items.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
    return '<article class="e132-clean-card '+esc(b.kind)+'"><h3>'+esc(b.title)+'</h3>'+body+'</article>';
  }
  function render(){
    if(!deck||!model.length) return;
    idx=clamp(idx);
    var s=model[idx];
    var full=mode!=='compact';
    var blocks=full?s.fullBlocks:s.compactBlocks;
    if(!blocks.length) blocks=[full?{title:'Nội dung',kind:'text',body:'Slide chưa có block chi tiết.'}:{title:'Nội dung',kind:'text',bullets:['Slide chưa có block chi tiết.']}];
    deck.setAttribute('data-tone',s.tone);
    deck.setAttribute('data-mode',full?'full':'compact');
    deck.querySelector('[data-e132-clean-count]').textContent=String(idx+1).padStart(2,'0')+' / '+String(model.length).padStart(2,'0')+' · '+s.rawBlockCount+' blocks';
    deck.querySelector('[data-e132-mode-label]').textContent=full?'Full lecture':'Compact preview';
    var modeBtn=deck.querySelector('[data-e132-mode]'); if(modeBtn) modeBtn.textContent=full?'Compact':'Full';
    deck.querySelector('.e132-clean-progress span').style.width=((idx+1)/model.length*100)+'%';
    deck.querySelector('[data-e132-stage]').innerHTML='<section class="e132-clean-slide"><aside class="e132-clean-side"><span class="e132-clean-role">'+esc(LABEL[s.role]||s.role)+'</span><strong>'+String(idx+1).padStart(2,'0')+'</strong><small>'+esc(s.role)+'</small></aside><article class="e132-clean-main"><h1>'+esc(s.title)+'</h1><div class="e132-clean-grid">'+blocks.map(full?fullBlockHtml:compactBlockHtml).join('')+'</div></article></section>';
  }
  function openDeck(){
    if(!readModel()) return false;
    ensureDeck();
    mode='full';
    document.body.classList.add('e132-overlay-open');
    deck.classList.add('open');
    render();
    return true;
  }
  function closeDeck(){
    var st=state();
    st.e129Present=false; save();
    document.body.classList.remove('e132-overlay-open','e129-presenting');
    if(deck) deck.classList.remove('open');
    try{ if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render) window.BAUMAN_MATH_THEORY_E129.render(); }catch(_){}
  }
  function move(delta){idx=clamp(idx+delta); render();}
  function toggleMode(){mode=mode==='compact'?'full':'compact'; render();}
  function enhance(){
    if(isPresenting()) return openDeck();
    if(deck) deck.classList.remove('open');
    document.body.classList.remove('e132-overlay-open');
    return false;
  }

  document.addEventListener('keydown',function(e){
    if(!document.body.classList.contains('e132-overlay-open')) return;
    if(['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','f','F','c','C'].indexOf(e.key)<0) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter') move(1);
    if(e.key==='ArrowLeft'||e.key==='PageUp') move(-1);
    if(e.key==='Escape') closeDeck();
    if(e.key==='f'||e.key==='F'){mode='full'; render();}
    if(e.key==='c'||e.key==='C'){mode='compact'; render();}
  },true);

  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){} enhance();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

  window.BAUMAN_MATH_THEORY_E132={release:RELEASE,enhance:enhance,openDeck:openDeck,closeDeck:closeDeck,setMode:function(next){mode=next==='compact'?'compact':'full'; render(); return mode;},selfCheck:function(){var open=document.body.classList.contains('e132-overlay-open');var slides=model.length||sourceSlides().length;var current=model[idx]||null;return {ok:!!window.BAUMAN_MATH_THEORY_E129&&css('theory-slideshow-E132.css'),release:RELEASE,e129Detected:!!window.BAUMAN_MATH_THEORY_E129,importTargetUnchanged:'theory_lecture_content',isolatedOverlay:true,keyboardCaptured:true,fullLectureModeDefault:true,compactContent:false,compactModeOptional:true,overlayOpen:open,slidesDetected:slides,currentSlide:idx+1,currentRawBlockCount:current?current.rawBlockCount:0,displayedBlocks:current?(mode==='compact'?current.compactBlocks.length:current.fullBlocks.length):0,canvaReference:true};}};
})();
