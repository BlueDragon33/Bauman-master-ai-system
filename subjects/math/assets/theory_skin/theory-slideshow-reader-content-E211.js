/* E218 Reader Pro content bridge: advanced panel + formula modal. */
(function(){
  'use strict';
  var RELEASE='E218_READER_PRO_ADVANCED_PANEL_FORMULA_POPUP';
  var records=[], byId={}, byTitle={}, ready=false, loading=false, last='', formulaPopupState=null;

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
      console.warn('[E218] theory content unavailable',e);
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
  function formula(slide){var b=blockOf(slide,'formula')[0]; return b?b.body:'';}
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
    if(document.getElementById('e218-reader-pro-style'))return;
    ['e215-reader-pro-style','e216-reader-pro-style'].forEach(function(id){
      var old=document.getElementById(id);
      if(old&&old.parentNode)old.parentNode.removeChild(old);
    });
    var css=''
      +'.e211-reader-pro .e202-hero{grid-template-columns:minmax(0,1.85fr) minmax(300px,.85fr)!important;min-height:330px!important}'
      +'.e211-reader-pro .e202-hero-copy{justify-content:flex-start!important;padding-top:18px!important}'
      +'.e211-reader-pro .e202-insight{font-size:clamp(16px,1.15vw,19px)!important;line-height:1.55!important;max-width:900px!important}'
      +'.e211-reader-pro .e132-clean-main h1{font-size:clamp(32px,3.2vw,48px)!important;line-height:1.03!important}'
      +'.e211-reader-pro .e202-card-grid{max-height:230px!important;min-height:160px!important;grid-auto-rows:minmax(138px,1fr)!important}'
      +'.e211-reader-pro .e132-clean-card{padding:12px 14px!important;min-height:138px!important}'
      +'.e211-reader-pro .e132-clean-card h3{font-size:clamp(17px,1.15vw,21px)!important;line-height:1.16!important}'
      +'.e211-reader-pro .e132-clean-card p{font-size:clamp(13px,.95vw,16px)!important;line-height:1.42!important}'
      +'.e211-reader-pro .e202-visual{min-height:310px!important}'
      +'.e211-summary-panel{border:1px solid rgba(125,211,252,.22);background:rgba(255,255,255,.055);border-radius:18px;padding:16px;text-align:left}'
      +'.e211-extension-panel{display:flex;min-height:0;max-height:100%;flex-direction:column;gap:8px;overflow:auto}'
      +'.e211-extension-panel .e211-panel-role{margin:0;color:#8edfff;font-size:11px;font-weight:950;letter-spacing:.09em;text-transform:uppercase}'
      +'.e211-extension-panel h3{font-size:clamp(13px,.95vw,16px)!important;line-height:1.22!important;margin:0!important;color:#dbeafe!important}'
      +'.e211-extension-panel .e211-slide-name{font-size:clamp(15px,1.05vw,19px)!important;line-height:1.24!important;margin:0!important;color:#f8fbff!important;font-weight:950}'
      +'.e211-extension-panel .e211-summary-lead{margin:0;color:#e6f4ff;font-size:clamp(15px,1.04vw,18px);line-height:1.46}'
      +'.e211-extension-panel.is-light{justify-content:center;padding:18px}'
      +'.e211-extension-panel.is-light .e211-summary-lead{font-size:clamp(19px,1.55vw,25px);line-height:1.44;font-weight:750}'
      +'.e211-extension-panel.is-light .e211-slide-name{font-size:clamp(17px,1.25vw,22px)!important}'
      +'.e211-extension-panel.is-dense .e211-summary-lead{font-size:clamp(13px,.9vw,15px);line-height:1.34}'
      +'.e211-extension-panel.is-overflow .e211-summary-lead{font-size:clamp(12.5px,.84vw,14px);line-height:1.3}'
      +'.e211-reader-pro .e202-insight.is-light{font-size:clamp(18px,1.35vw,22px)!important;line-height:1.5!important;font-weight:730}'
      +'.e211-reader-pro .e202-insight.is-dense{font-size:clamp(13px,.92vw,15px)!important;line-height:1.34!important}'
      +'.e211-reader-pro .e202-insight.is-overflow{font-size:clamp(12px,.82vw,14px)!important;line-height:1.28!important}'
      +'.e211-reader-pro .e132-clean-card.is-light p.e132-full-body{font-size:clamp(15px,1.08vw,18px)!important;line-height:1.45!important}'
      +'.e211-reader-pro .e132-clean-card.is-light h3{font-size:clamp(19px,1.35vw,23px)!important}'
      +'.e211-reader-pro .e132-clean-card.is-dense p.e132-full-body{font-size:clamp(12px,.84vw,14px)!important;line-height:1.3!important}'
      +'.e211-reader-pro .e132-clean-card.is-overflow p.e132-full-body{font-size:clamp(11.5px,.78vw,13px)!important;line-height:1.25!important}'
      +'.e211-reader-pro .e202-formula-strip{max-width:920px!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:start!important}'
      +'.e211-reader-pro .e202-formula-strip code{white-space:pre-wrap!important;overflow-wrap:anywhere!important}'
      +'.e211-formula-full-btn{border:1px solid rgba(125,211,252,.35);border-radius:999px;background:rgba(8,47,73,.72);color:#e0f7ff;font-weight:850;font-size:12px;line-height:1;padding:8px 10px;cursor:pointer;white-space:nowrap}'
      +'.e211-formula-full-btn:hover{background:rgba(14,116,144,.82);border-color:rgba(165,243,252,.65)}'
      +'.e211-formula-modal{display:grid;gap:14px;color:#eaf6ff}'
      +'.e211-formula-modal h2{margin:0;color:#f8fbff;font-size:24px;line-height:1.15}'
      +'.e211-formula-modal section{border:1px solid rgba(148,163,184,.22);border-radius:14px;background:rgba(15,23,42,.72);padding:14px}'
      +'.e211-formula-modal h3{margin:0 0 8px;color:#93e8ff;font-size:13px;letter-spacing:.08em;text-transform:uppercase}'
      +'.e211-formula-modal p{margin:0;color:#d8ecff;line-height:1.55}'
      +'.e211-formula-modal pre{margin:0;white-space:pre-wrap;overflow:auto;color:#e8fff7;font-size:13px;line-height:1.45}';
    var st=document.createElement('style');
    st.id='e218-reader-pro-style';
    st.textContent=css;
    document.head.appendChild(st);
  }

  function isPanelExcludedBlock(b,mainBlock){
    var t=norm((b&&b.title)||'');
    if(/cau hoi|tu kiem|dien giai ky thuat/.test(t))return true;
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
  function selectExtensionBlock(slide,mainBlock,applicationBlock,qaBlock){
    var used=[mainBlock,applicationBlock,qaBlock].filter(Boolean), lower=used.map(blockBody).filter(Boolean);
    var blocks=(slide.blocks||[]).filter(function(b){return b&&/text|code/.test(b.type||'');});
    for(var i=0;i<blocks.length;i++){
      var b=blocks[i], body=blockBody(b);
      if(!body||used.indexOf(b)>=0||isPanelExcludedBlock(b,mainBlock))continue;
      if(lower.some(function(x){return tooSimilar(body,x);}))continue;
      return {title:b.title||'Mở rộng',body:short(body,260),synthetic:false};
    }
    var mainTitle=(mainBlock&&mainBlock.title)||slide.title||'ý chính';
    var appTitle=(applicationBlock&&applicationBlock.title)||'ngữ cảnh áp dụng';
    var seed=blockBody(applicationBlock)||blockBody(mainBlock)||slide.title||'';
    var lead='Đọc '+mainTitle+' như phần nối với '+appTitle+'. ';
    lead+=seed?('Gợi ý mở rộng: '+short(seed,150)):'Phần này giúp đặt ý chính vào mạch học của bài trước khi đọc các card bên dưới.';
    if(lower.some(function(x){return tooSimilar(lead,x);}))lead='Mở rộng: slide này nối khái niệm trung tâm với ngữ cảnh sử dụng trong bài, giúp phần diễn giải và tự kiểm bên dưới có điểm tựa rõ hơn.';
    return {title:'Mở rộng',body:short(lead,260),synthetic:true};
  }
  function summaryPanel(record,slide,mainBlock,applicationBlock,qaBlock){
    var ext=selectExtensionBlock(slide,mainBlock,applicationBlock,qaBlock);
    var density=densityClass((ext.title||'')+' '+(ext.body||''));
    return '<div class="e202-tag">Mở rộng</div><div class="e211-summary-panel e211-extension-panel '+density+'" data-e211-density="'+esc(density.replace('is-',''))+'"><p class="e211-panel-role">Nội dung mở rộng cho slide</p><h3>'+esc(record.lessonTitle||record.title||'Bài học')+'</h3><p class="e211-slide-name">'+esc(slide.title||'Nội dung chính')+'</p><p class="e211-summary-lead">'+esc(ext.body)+'</p></div><div class="e202-note">Không lặp diễn giải hoặc tự kiểm ở các card dưới</div>';
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
      lead='Góc nâng cao: xem công thức như một điều kiện kiểm chứng, không chỉ là biểu thức để thay số. Trước khi dùng, hãy xác định miền giá trị, đơn vị đo và giả thiết khiến phép biến đổi hợp lệ; sau đó đối chiếu kết quả với '+appTitle+' để tránh đúng đại số nhưng sai ngữ cảnh.';
    }else if(applicationBlock){
      lead='Góc nâng cao: phần này nên được đọc như lớp nối giữa '+mainTitle+' và '+appTitle+'. Khi chuyển sang bài toán kỹ thuật, hãy hỏi đại lượng nào đang được giữ bất biến, đại lượng nào bị xấp xỉ, và sai số sẽ lan sang quyết định cuối cùng như thế nào.';
    }else{
      lead='Góc nâng cao: thay vì học thuộc phát biểu, hãy kiểm tra điều kiện áp dụng, trường hợp biên và hệ quả nếu giả thiết bị phá vỡ. Cách đọc này giúp slide trở thành công cụ kiểm chứng khi giải bài hoặc viết mô hình tính toán.';
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
    if(best){
      return {title:best.block.title||'Tham khảo thêm',body:short(blockBody(best.block),330),synthetic:false};
    }
    return syntheticAdvancedNote(slide,mainBlock,applicationBlock);
  }
  function summaryPanelAdvanced(record,slide,mainBlock,applicationBlock,qaBlock){
    var ext=selectAdvancedExtensionBlock(slide,mainBlock,applicationBlock,qaBlock);
    var density=densityClass((ext.title||'')+' '+(ext.body||''));
    return '<div class="e202-tag">Tham khảo thêm</div><div class="e211-summary-panel e211-extension-panel '+density+'" data-e211-density="'+esc(density.replace('is-',''))+'"><p class="e211-panel-role">Mở rộng nâng cao</p><h3>'+esc(ext.title||'Tham khảo thêm')+'</h3><p class="e211-summary-lead">'+esc(ext.body)+'</p></div><div class="e202-note">Không lặp diễn giải hoặc tự kiểm ở các card dưới</div>';
  }
  function pythonUsageForFormula(f){
    var raw=String(f||''), n=norm(raw);
    if(/gradient|grad|nabla/.test(n)||raw.indexOf('∇')>=0){
      return 'import numpy as np\n\nx = np.array([...], dtype=float)\ngrad = np.array([...], dtype=float)\nlearning_rate = 0.05\nx_next = x - learning_rate * grad';
    }
    if(/norm|distance|metric/.test(n)||raw.indexOf('||')>=0){
      return 'import numpy as np\n\nx = np.array([...], dtype=float)\ny = np.array([...], dtype=float)\ndistance = np.linalg.norm(x - y)';
    }
    if(/dot|inner|projection/.test(n)||raw.indexOf('·')>=0){
      return 'import numpy as np\n\nu = np.array([...], dtype=float)\nv = np.array([...], dtype=float)\ndot_value = float(u @ v)\nprojection_on_v = (dot_value / float(v @ v)) * v';
    }
    if(/matrix|ma tran|ax|linear|tuyen tinh/.test(n)){
      return 'import numpy as np\n\nA = np.array([[...], [...]], dtype=float)\nx = np.array([...], dtype=float)\ny = A @ x';
    }
    return 'import sympy as sp\n\n# Khai báo biến theo công thức trong slide.\n# Sau đó nhập biểu thức gốc để kiểm tra rút gọn hoặc đạo hàm.\nx = sp.symbols("x")\nexpr = sp.sympify("...")\nsp.simplify(expr)';
  }
  function formulaModalHtml(ctx){
    var f=ctx.formula||'', slide=ctx.slide||{}, mainBody=blockBody(ctx.mainBlock), appBody=blockBody(ctx.applicationBlock);
    var analysis=mainBody?short(mainBody,360):'Phân tích công thức bằng cách xác định từng đại lượng, miền áp dụng và giả thiết đi kèm trước khi thay số.';
    var use=appBody?short(appBody,360):'Ứng dụng công thức như một phép kiểm tra giữa mô hình toán và dữ liệu: kết quả phải đúng về đơn vị, chiều dữ liệu và ý nghĩa kỹ thuật.';
    var code=pythonUsageForFormula(f);
    return '<div class="e211-formula-modal"><h2>Công thức đầy đủ</h2>'+
      '<section><h3>Công thức đầy đủ</h3><p><code>'+esc(f)+'</code></p></section>'+
      '<section><h3>Phân tích công thức</h3><p>'+esc(analysis)+'</p></section>'+
      '<section><h3>Ứng dụng</h3><p>'+esc(use)+'</p></section>'+
      '<section><h3>Cách dùng trong code Python</h3><pre>'+esc(code)+'</pre></section>'+
      '<p class="e211-formula-context">'+esc(slide.title||'')+'</p></div>';
  }
  function openFormulaModal(){
    if(!formulaPopupState||!formulaPopupState.formula)return false;
    var modal=document.getElementById('modal'), body=document.getElementById('modalBody');
    if(!modal||!body)return false;
    body.innerHTML=formulaModalHtml(formulaPopupState);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    var close=document.getElementById('modalClose');
    if(close&&close.focus)close.focus();
    return true;
  }
  function closeFormulaModal(){
    var modal=document.getElementById('modal'), body=document.getElementById('modalBody');
    if(!modal||!body||!body.querySelector('.e211-formula-modal'))return false;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    body.innerHTML='';
    return true;
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
    if(!strip.querySelector('code'))strip.innerHTML='<b>Công thức</b><code></code>';
    if(!strip.querySelector('[data-e211-formula-full]')){
      strip.insertAdjacentHTML('beforeend','<button type="button" class="e211-formula-full-btn" data-e211-formula-full>Xem công thức đầy đủ</button>');
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
    if(lessonLine)lessonLine.textContent='Bài đang được trình chiếu: '+lessonTitle;
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
        if(copy){strip=document.createElement('div');strip.className='e202-formula-strip';strip.innerHTML='<b>Công thức</b><code></code>';copy.appendChild(strip);}
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
      if(btn){e.preventDefault(); e.stopPropagation(); openFormulaModal(); return;}
      var closeBtn=e.target&&e.target.closest&&e.target.closest('#modalClose');
      if(closeBtn&&closeFormulaModal()){e.preventDefault(); e.stopPropagation(); return;}
      setTimeout(schedule,0);
    },true);
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&closeFormulaModal()){e.preventDefault(); e.stopPropagation(); return;}
      setTimeout(schedule,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E211_READER_CONTENT={release:RELEASE,apply:apply,selfCheck:function(){var r=findRecord();return {ok:true,release:RELEASE,ready:ready,record:r&&(r.lessonTitle||r.lessonId)||'',mode:mode(),slideIndex:currentIndex()};}};
})();
