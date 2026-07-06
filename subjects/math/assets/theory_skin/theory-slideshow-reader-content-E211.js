/* E221 Reader Pro content bridge: formula popup with vertical code panel. */
(function(){
  'use strict';
  var RELEASE='E221_READER_PRO_FORMULA_MODAL_VERTICAL_CODE';
  var records=[], byId={}, byTitle={}, ready=false, loading=false, last='', formulaPopupState=null, fallbackModal=null;

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function short(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'...':s;}
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}

  function load(){
    if(ready||loading)return Promise.resolve(ready);
    loading=true;
    return fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('theory content HTTP '+r.status);
      return r.json();
    }).then(function(j){
      records=(j&&j.records)||[];
      records.forEach(function(r){
        if(r.lessonId)byId[norm(r.lessonId)]=r;
        if(r.lessonTitle)byTitle[norm(r.lessonTitle)]=r;
        if(r.title)byTitle[norm(r.title)]=r;
      });
      ready=true;
      return true;
    }).catch(function(e){
      console.warn('[E221] theory content unavailable',e);
      return false;
    }).finally(function(){loading=false;});
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
  function firstText(slide){return blockOf(slide,'text')[0]||blockOf(slide,'formula')[0]||blockOf(slide,'code')[0]||blockOf(slide,'qa')[0]||null;}
  function formula(slide){
    var blocks=blockOf(slide,'formula').map(function(b){return blockBody(b);}).filter(Boolean);
    return blocks.join('\n');
  }
  function application(slide,mainBlock){
    var t=blockOf(slide,'text').filter(function(b){return b!==mainBlock;});
    return t[0]||t[1]||blockOf(slide,'code')[0]||blockOf(slide,'formula')[0]||mainBlock||null;
  }
  function qa(slide){return blockOf(slide,'qa')[0]||null;}
  function setText(el,val){if(el)el.textContent=val||'';}
  function blockBody(b){return String((b&&b.body)||'').replace(/\s+/g,' ').trim();}
  function densityClass(s){
    var n=String(s||'').replace(/\s+/g,' ').trim().length;
    return n<170?'is-light':(n<360?'is-normal':(n<560?'is-dense':'is-overflow'));
  }
  function setDensity(el,body){
    if(!el)return;
    ['is-light','is-normal','is-dense','is-overflow'].forEach(function(c){el.classList.remove(c);});
    var d=densityClass(body);
    el.classList.add(d);
    el.setAttribute('data-e211-density',d.replace('is-',''));
  }
  function cardHtml(label,head,body,cls){
    var d=densityClass((head||'')+' '+(body||''));
    return '<article class="e132-clean-card '+esc(cls||'concept')+' '+d+'" data-e211-density="'+esc(d.replace('is-',''))+'"><span class="e132-card-kicker">'+esc(label||'')+'</span><h3>'+esc(head||'')+'</h3><p class="e132-full-body">'+esc(body||'')+'</p></article>';
  }

  function ensureStyle(){
    if(document.getElementById('e221-reader-pro-style'))return;
    ['e215-reader-pro-style','e216-reader-pro-style','e218-reader-pro-style','e219-reader-pro-style','e220-reader-pro-style'].forEach(function(id){
      var old=document.getElementById(id);
      if(old&&old.parentNode)old.parentNode.removeChild(old);
    });
    var css=''
      +'.e211-reader-pro .e202-formula-strip{grid-template-columns:auto minmax(0,1fr) auto!important;align-items:start!important;gap:10px!important}'
      +'.e211-reader-pro .e202-formula-strip code{white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important}'
      +'.e211-formula-full-btn{border:1px solid rgba(125,211,252,.42);border-radius:999px;background:rgba(8,47,73,.78);color:#e0f7ff;font-weight:850;font-size:12px;line-height:1;padding:8px 10px;cursor:pointer;white-space:nowrap}'
      +'.e211-formula-full-btn:hover{background:rgba(14,116,144,.9);border-color:rgba(165,243,252,.7)}'
      +'#modal.e211-formula-modal-host{position:fixed!important;inset:0!important;z-index:2147483600!important;display:grid!important;place-items:center!important;background:rgba(1,9,18,.82)!important;backdrop-filter:blur(12px)!important;padding:24px!important;overflow:auto!important}'
      +'#modal.e211-formula-modal-host.hidden{display:none!important}'
      +'#modal.e211-formula-modal-host .modal-card{position:relative!important;width:min(1180px,calc(100vw - 48px))!important;height:min(720px,calc(100vh - 48px))!important;max-width:none!important;max-height:none!important;margin:0!important;border:1px solid rgba(20,184,166,.34)!important;border-radius:26px!important;background:linear-gradient(135deg,rgba(6,18,35,.98),rgba(14,44,52,.96))!important;box-shadow:0 32px 100px rgba(0,0,0,.66), inset 0 1px 0 rgba(255,255,255,.08)!important;overflow:hidden!important;padding:0!important}'
      +'#modal.e211-formula-modal-host .modal-close{z-index:2!important;right:18px!important;top:16px!important;background:rgba(3,7,18,.72)!important;color:#fff!important;border:1px solid rgba(125,211,252,.25)!important;border-radius:999px!important}'
      +'#modal.e211-formula-modal-host #modalBody{height:100%!important;overflow:hidden!important}'
      +'.e211-formula-fallback{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;background:rgba(1,9,18,.82);backdrop-filter:blur(12px);padding:24px;overflow:auto}'
      +'.e211-formula-fallback.hidden{display:none!important}'
      +'.e211-formula-fallback-card{width:min(1180px,calc(100vw - 48px));height:min(720px,calc(100vh - 48px));overflow:hidden;border:1px solid rgba(20,184,166,.34);border-radius:26px;background:linear-gradient(135deg,rgba(6,18,35,.98),rgba(14,44,52,.96));box-shadow:0 32px 100px rgba(0,0,0,.66), inset 0 1px 0 rgba(255,255,255,.08);padding:0;position:relative}'
      +'.e211-formula-fallback-close{position:absolute;right:18px;top:16px;z-index:2;border:1px solid rgba(125,211,252,.25);border-radius:999px;background:rgba(3,7,18,.72);color:#fff;padding:8px 12px;cursor:pointer}'
      +'.e211-formula-modal{height:100%;box-sizing:border-box;padding:22px;display:grid;grid-template-rows:auto minmax(0,1fr);gap:14px;color:#eaf6ff;text-align:left;overflow:hidden}'
      +'.e211-formula-modal header{padding-right:60px;border-bottom:1px solid rgba(45,212,191,.18);padding-bottom:10px}'
      +'.e211-formula-modal h2{margin:0;color:#f8fbff;font-size:clamp(24px,2.1vw,34px);line-height:1.08;letter-spacing:-.02em}'
      +'.e211-formula-modal .e211-formula-context{margin:6px 0 0;color:#9ee7f5;font-size:12px;opacity:.8}'
      +'.e211-formula-bodygrid{min-height:0;display:grid;grid-template-columns:minmax(0,2.35fr) minmax(260px,.78fr);gap:14px;overflow:hidden}'
      +'.e211-formula-topgrid{min-height:0;display:grid;grid-template-rows:1fr 1fr 1fr;gap:14px;overflow:hidden}'
      +'.e211-formula-modal section{min-height:0;border:1px solid rgba(45,212,191,.2);border-radius:18px;background:linear-gradient(180deg,rgba(13,43,53,.76),rgba(6,21,37,.76));padding:15px;overflow:auto;scrollbar-width:thin}'
      +'.e211-formula-modal h3{margin:0 0 10px;color:#7dd3fc;font-size:12px;letter-spacing:.1em;text-transform:uppercase}'
      +'.e211-formula-modal p{margin:0;color:#d8ecff;font-size:15px;line-height:1.52}'
      +'.e211-formula-modal pre{margin:0;white-space:pre-wrap;overflow:auto;color:#e8fff7;font-size:14px;line-height:1.45}'
      +'.e211-formula-code-panel{height:100%;background:linear-gradient(180deg,rgba(18,30,53,.86),rgba(8,14,28,.86))!important;border-color:rgba(167,139,250,.32)!important}'
      +'.e211-formula-code-panel pre{max-height:none;min-height:0;font-size:13px;line-height:1.42}'
      +'@media(max-width:980px){.e211-formula-bodygrid{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) minmax(170px,.35fr);overflow:auto}.e211-formula-topgrid{grid-template-rows:repeat(3,minmax(150px,1fr));overflow:visible}.e211-formula-code-panel{height:auto}}';
    var st=document.createElement('style');
    st.id='e221-reader-pro-style';
    st.textContent=css;
    document.head.appendChild(st);
  }

  function isPanelExcludedBlock(b,mainBlock){
    var t=norm((b&&b.title)||'');
    if(/cau hoi|tu kiem|dien giai ky thuat|cau hoi dung can dat/.test(t))return true;
    if(b===mainBlock&&/van de hoc tap/.test(t))return true;
    return false;
  }
  function tooSimilar(a,b){
    a=norm(a); b=norm(b);
    if(!a||!b)return false;
    if(a.length>80&&(b.indexOf(a)>=0||a.indexOf(b)>=0))return true;
    var aw=a.split(' ').filter(function(x){return x.length>3;}), bw=b.split(' ').filter(function(x){return x.length>3;});
    if(!aw.length||!bw.length)return false;
    var set={}; bw.forEach(function(x){set[x]=1;});
    var hit=aw.filter(function(x){return set[x];}).length;
    return hit/Math.max(aw.length,1)>.62;
  }
  function advancedScore(b){
    var t=norm(((b&&b.title)||'')+' '+blockBody(b));
    var score=0;
    if(/mo rong|nang cao|ghi chu|luu y|truc giac|sai lam|dieu kien|so sanh|lien he|ung dung sau|dien giai sau/.test(t))score+=8;
    if(/gia thiet|rang buoc|ngoai le|he qua|kiem chung|on dinh|suy bien|bat bien|pham vi dung/.test(t))score+=4;
    if(/ung dung|ai|robot|sensor|du lieu|python|ma tran|mo hinh|toi uu|gradient|pca/.test(t))score+=2;
    if(/dinh nghia|khai niem|van de hoc tap|tom tat|y chinh|cau hoi|tu kiem|dien giai ky thuat|bai tap|quiz/.test(t))score-=7;
    if((b&&b.type)==='formula')score-=2;
    return score;
  }
  function isBasicRepeatBlock(b,mainBlock){
    var t=norm(((b&&b.title)||'')+' '+blockBody(b));
    if(isPanelExcludedBlock(b,mainBlock))return true;
    return /dinh nghia|khai niem|van de hoc tap|tom tat|y chinh|cau hoi|tu kiem|dien giai ky thuat|bai tap|quiz/.test(t);
  }
  function syntheticAdvancedNote(slide,mainBlock,applicationBlock){
    var f=formula(slide), appTitle=(applicationBlock&&applicationBlock.title)||'ngữ cảnh ứng dụng';
    var mainTitle=(mainBlock&&mainBlock.title)||slide.title||'ý chính';
    var lead='';
    if(f){
      lead='Góc nâng cao: xem công thức như một bộ điều kiện kiểm chứng. Trước khi dùng, hãy xác định chuẩn đo, miền giá trị, đơn vị và giả thiết khiến phép biến đổi hợp lệ; sau đó đối chiếu kết quả với '+appTitle+' để tránh đúng đại số nhưng sai ngữ cảnh.';
    }else if(applicationBlock){
      lead='Góc nâng cao: phần này nối '+mainTitle+' với '+appTitle+'. Khi chuyển sang bài toán kỹ thuật, hãy hỏi đại lượng nào bất biến, đại lượng nào bị xấp xỉ, và sai số lan sang quyết định cuối cùng như thế nào.';
    }else{
      lead='Góc nâng cao: thay vì học thuộc phát biểu, hãy kiểm tra điều kiện áp dụng, trường hợp biên và hệ quả nếu giả thiết bị phá vỡ. Cách đọc này giúp slide thành công cụ kiểm chứng khi giải bài hoặc viết mô hình.';
    }
    return {title:'Tham khảo thêm',body:short(lead,330),synthetic:true};
  }
  function selectAdvancedExtensionBlock(slide,mainBlock,applicationBlock,qaBlock){
    var used=[mainBlock,applicationBlock,qaBlock].filter(Boolean), lower=used.map(blockBody).filter(Boolean);
    var blocks=(slide.blocks||[]).filter(function(b){return b&&/text|code/.test(b.type||'');});
    var best=null;
    blocks.forEach(function(b){
      var body=blockBody(b), score=advancedScore(b);
      if(!body||used.indexOf(b)>=0||isBasicRepeatBlock(b,mainBlock))return;
      if(lower.some(function(x){return tooSimilar(body,x);}))return;
      if(score<=0)return;
      if(!best||score>best.score)best={score:score,block:b};
    });
    if(best)return {title:'Tham khảo thêm',body:short(blockBody(best.block),330),synthetic:false};
    return syntheticAdvancedNote(slide,mainBlock,applicationBlock);
  }
  function summaryPanelAdvanced(record,slide,mainBlock,applicationBlock,qaBlock){
    var ext=selectAdvancedExtensionBlock(slide,mainBlock,applicationBlock,qaBlock);
    var density=densityClass((ext.title||'')+' '+(ext.body||''));
    return '<div class="e211-summary-panel e211-extension-panel '+density+'" data-e211-density="'+esc(density.replace('is-',''))+'"><h3 class="e211-panel-title">Tham khảo thêm</h3><p class="e211-summary-lead">'+esc(ext.body)+'</p></div>';
  }

  function pythonUsageForFormula(f){
    var raw=String(f||''), n=norm(raw), hasNorm=(/norm|distance|metric/.test(n)||raw.indexOf('||')>=0), hasDot=(/dot|inner|projection|cos/.test(n)||raw.indexOf('·')>=0||raw.indexOf('⋅')>=0);
    if(hasNorm&&hasDot){
      return 'import numpy as np\n\nx = np.array([...], dtype=float)\ny = np.array([...], dtype=float)\n\nnorm_x = np.linalg.norm(x)\nnorm_y = np.linalg.norm(y)\ndot_xy = float(x @ y)\ndistance_xy = np.linalg.norm(x - y)\ncos_xy = dot_xy / (norm_x * norm_y) if norm_x and norm_y else np.nan';
    }
    if(/gradient|grad|nabla/.test(n)||raw.indexOf('∇')>=0){
      return 'import numpy as np\n\nx = np.array([...], dtype=float)\ngrad = np.array([...], dtype=float)\nlearning_rate = 0.05\nx_next = x - learning_rate * grad';
    }
    if(hasNorm){
      return 'import numpy as np\n\nx = np.array([...], dtype=float)\ny = np.array([...], dtype=float)\nnorm_x = np.linalg.norm(x)\ndistance_xy = np.linalg.norm(x - y)';
    }
    if(hasDot){
      return 'import numpy as np\n\nu = np.array([...], dtype=float)\nv = np.array([...], dtype=float)\ndot_value = float(u @ v)\nprojection_on_v = (dot_value / float(v @ v)) * v';
    }
    if(/matrix|ma tran|ax|linear|tuyen tinh/.test(n)){
      return 'import numpy as np\n\nA = np.array([[...], [...]], dtype=float)\nx = np.array([...], dtype=float)\ny = A @ x';
    }
    return 'import sympy as sp\n\n# Khai báo biến theo công thức trong slide.\nx = sp.symbols("x")\nexpr = sp.sympify("...")\nsp.simplify(expr)';
  }
  function formulaAnalysis(f){
    var n=norm(f), raw=String(f||'');
    if((raw.indexOf('||')>=0||/norm|distance/.test(n))&&(raw.indexOf('·')>=0||/dot|cos/.test(n))){
      return 'Bộ công thức này không chỉ để tính số. Norm đo độ lớn của vector, dot product đo mức cùng hướng có trọng số, distance đo độ lệch giữa hai vector, còn cosine tách riêng yếu tố góc khỏi độ lớn. Khi dùng trong dữ liệu kỹ thuật, cần kiểm tra cùng đơn vị đo, cùng chiều dữ liệu và cùng quy ước chuẩn hóa.';
    }
    if(/gradient|grad|nabla/.test(n)||raw.indexOf('∇')>=0){
      return 'Gradient cho biết hướng tăng nhanh nhất của hàm mục tiêu. Trong tối ưu, dấu trừ trước gradient dùng để đi về phía giảm lỗi; bước học quá lớn có thể dao động, quá nhỏ thì hội tụ chậm.';
    }
    return 'Phân tích công thức bằng cách tách từng đại lượng, xác định miền áp dụng, đơn vị đo và giả thiết đi kèm trước khi thay số. Công thức chỉ có ý nghĩa khi biến trong bài và dữ liệu thực tế dùng cùng quy ước.';
  }
  function formulaApplication(f,appBody){
    if(appBody)return short(appBody,420);
    if(String(f||'').indexOf('||')>=0)return 'Trong AI và xử lý tín hiệu, các phép đo vector thường dùng để so sánh mẫu, phát hiện sai lệch, đo độ tương đồng và chọn láng giềng gần nhất. Với robot hoặc cảm biến, cùng một công thức có thể đổi ý nghĩa nếu vector trạng thái dùng đơn vị khác nhau.';
    return 'Ứng dụng công thức như một phép kiểm tra giữa mô hình toán và dữ liệu: kết quả phải đúng về đơn vị, chiều dữ liệu và ý nghĩa kỹ thuật.';
  }
  function formulaModalHtml(ctx){
    var f=ctx.formula||'', slide=ctx.slide||{}, appBody=blockBody(ctx.applicationBlock), code=pythonUsageForFormula(f);
    return '<div class="e211-formula-modal"><header><h2>Công thức đầy đủ</h2><p class="e211-formula-context">'+esc(slide.title||'')+'</p></header><div class="e211-formula-bodygrid"><div class="e211-formula-topgrid">'+
      '<section><h3>Công thức đầy đủ</h3><pre>'+esc(f)+'</pre></section>'+
      '<section><h3>Phân tích công thức</h3><p>'+esc(formulaAnalysis(f))+'</p></section>'+
      '<section><h3>Ứng dụng</h3><p>'+esc(formulaApplication(f,appBody))+'</p></section>'+
      '</div><section class="e211-formula-code-panel"><h3>Cách dùng trong code Python</h3><pre>'+esc(code)+'</pre></section></div></div>';
  }
  function ensureFallbackModal(){
    if(fallbackModal)return fallbackModal;
    var wrap=document.createElement('div');
    wrap.className='e211-formula-fallback hidden';
    wrap.innerHTML='<div class="e211-formula-fallback-card"><button type="button" class="e211-formula-fallback-close" data-e211-formula-close>Đóng</button><div data-e211-formula-body></div></div>';
    document.body.appendChild(wrap);
    fallbackModal=wrap;
    return wrap;
  }
  function openFormulaModal(){
    if(!formulaPopupState||!formulaPopupState.formula)return false;
    var html=formulaModalHtml(formulaPopupState), modal=document.getElementById('modal'), body=document.getElementById('modalBody');
    if(modal&&body){
      body.innerHTML=html;
      modal.classList.add('e211-formula-modal-host');
      modal.classList.remove('hidden');
      modal.style.zIndex='2147483600';
      modal.setAttribute('aria-hidden','false');
      var close=document.getElementById('modalClose');
      if(close&&close.focus)close.focus();
      return true;
    }
    var fb=ensureFallbackModal();
    fb.querySelector('[data-e211-formula-body]').innerHTML=html;
    fb.classList.remove('hidden');
    return true;
  }
  function closeFormulaModal(){
    var modal=document.getElementById('modal'), body=document.getElementById('modalBody');
    if(modal&&body&&body.querySelector('.e211-formula-modal')){
      modal.classList.add('hidden');
      modal.classList.remove('e211-formula-modal-host');
      modal.style.zIndex='';
      modal.setAttribute('aria-hidden','true');
      body.innerHTML='';
      return true;
    }
    if(fallbackModal&&!fallbackModal.classList.contains('hidden')){
      fallbackModal.classList.add('hidden');
      var b=fallbackModal.querySelector('[data-e211-formula-body]');
      if(b)b.innerHTML='';
      return true;
    }
    return false;
  }
  function guardFormulaModalKey(e){
    if(e.key==='Escape'&&closeFormulaModal()){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    }
  }
  function ensureFormulaStrip(strip){
    if(!strip)return;
    if(!strip.querySelector('b')||!strip.querySelector('code'))strip.innerHTML='<b>CÔNG THỨC</b><code></code>';
    var btn=strip.querySelector('[data-e211-formula-full]');
    if(!btn){
      strip.insertAdjacentHTML('beforeend','<button type="button" class="e211-formula-full-btn" data-e211-formula-full>Xem đầy đủ</button>');
      btn=strip.querySelector('[data-e211-formula-full]');
    }
    if(btn&&!btn.__e211Bound){
      btn.__e211Bound=true;
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation)e.stopImmediatePropagation();
        openFormulaModal();
      },true);
    }
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
    if(lessonLine){lessonLine.textContent=''; lessonLine.style.display='none'; lessonLine.setAttribute('aria-hidden','true');}
    var side=d.querySelector('.e132-clean-side small');
    setText(side,lessonTitle);
    var chip=d.querySelector('[data-e210-lesson-id]');
    if(chip)chip.textContent='Đang trình chiếu: '+lessonTitle;

    var b1=firstText(s), b2=application(s,b1), b3=qa(s), f=formula(s);
    var insight=main&&main.querySelector('.e202-insight');
    var insightText=(b1&&b1.body)||title;
    setText(insight,insightText);
    setDensity(insight,insightText);

    var strip=main&&main.querySelector('.e202-formula-strip');
    if(f){
      if(!strip && main){
        var copy=main.querySelector('.e202-hero-copy');
        if(copy){strip=document.createElement('div');strip.className='e202-formula-strip';strip.innerHTML='<b>CÔNG THỨC</b><code></code>';copy.appendChild(strip);}
      }
      if(strip){strip.style.display='grid'; ensureFormulaStrip(strip); setText(strip.querySelector('code'),f); formulaPopupState={record:r,slide:s,formula:f,mainBlock:b1,applicationBlock:b2};}
    }else{formulaPopupState=null; if(strip){strip.style.display='none';}}

    var grid=main&&main.querySelector('.e202-card-grid');
    if(grid){
      grid.innerHTML=cardHtml((b1&&b1.title)||'Ý chính', title, (b1&&b1.body)||'', 'concept')+
        cardHtml((b2&&b2.title)||'Ứng dụng / Ý nghĩa', (b2&&b2.title)||'Ý nghĩa trong bài', (b2&&b2.body)||'', 'application')+
        cardHtml((b3&&b3.title)||'Tự kiểm', (b3&&b3.title)||'Câu hỏi tự kiểm', (b3&&b3.body)||'Tự hỏi: điều kiện áp dụng của slide là gì, đại lượng nào phải cùng quy ước, và kết quả sẽ sai ra sao nếu vi phạm điều kiện đó?', 'check');
    }

    var visualBox=d.querySelector('.e202-visual');
    if(visualBox){visualBox.innerHTML=summaryPanelAdvanced(r,s,b1,b2,b3);}
  }

  var scheduled=false;
  function schedule(){if(scheduled)return; scheduled=true; requestAnimationFrame(function(){scheduled=false; apply();});}
  function boot(){
    load().then(schedule);
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    window.addEventListener('keydown',guardFormulaModalKey,true);
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest&&e.target.closest('[data-e211-formula-full]');
      if(btn){e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); openFormulaModal(); return;}
      var closeBtn=e.target&&e.target.closest&&e.target.closest('#modalClose,[data-e211-formula-close]');
      if(closeBtn&&closeFormulaModal()){e.preventDefault(); e.stopPropagation(); return;}
      setTimeout(schedule,0);
    },true);
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&closeFormulaModal()){e.preventDefault(); e.stopPropagation(); return;}
      setTimeout(schedule,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E211_READER_CONTENT={release:RELEASE,apply:apply,selfCheck:function(){var r=findRecord();return {ok:true,release:RELEASE,ready:ready,record:r&&(r.lessonTitle||r.lessonId)||'',mode:mode(),slideIndex:currentIndex(),formulaPopup:!!formulaPopupState};}};
})();