/* E241 · Approved Reference / Full View artifact reader
 * Lesson-scoped optional integration for §1.4.
 * Keeps Reader Pro, formula modal, E234 and E235 intact.
 */
(function(){
  'use strict';

  var RELEASE='E241_APPROVED_REFERENCE_FULL_VIEW_READER';
  var LESSON_ID='MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140';
  var LESSON_TITLE='§1.4 · Cơ sở, span và tọa độ';
  var REGISTRY={
    lessonId:LESSON_ID,
    lessonTitle:LESSON_TITLE,
    reference:{path:'data/theory_reference/theory_reference_c01_l04.json',version:'REFERENCE_C01_L04_V1_APPROVED'},
    fullView:{path:'data/theory_full_view/theory_full_view_c01_l04.json',version:'FULL_VIEW_C01_L04_V1_APPROVED'},
    normalization:{path:'data/theory_normalization/theory_normalization_c01_l04.json',version:'NORMALIZATION_C01_L04_V1_APPROVED'}
  };
  var cache={reference:null,fullView:null,normalization:null,promise:null,error:null};
  var modal=null,scheduled=false;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return String(n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function arr(v){return Array.isArray(v)?v:[];}
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function deck(){return document.querySelector('.e132-overlay-deck.open');}

  function currentLessonMatches(){
    var s=state(), values=[];
    ['lessonId','currentLessonId','selectedLessonId','e129LessonId','theoryLessonId'].forEach(function(k){if(s&&s[k])values.push(String(s[k]));});
    if(values.indexOf(LESSON_ID)>=0)return true;
    ['lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])values.push(String(s[k]));});
    var d=deck();
    if(d){
      ['[data-e210-lesson-id]','.e132-clean-side small','.e132-clean-main h1'].forEach(function(sel){var n=d.querySelector(sel);if(n)values.push(text(n));});
    }
    var wanted=norm(LESSON_TITLE);
    return values.some(function(v){var n=norm(v);return !!n&&(n===norm(LESSON_ID)||n.indexOf(wanted)>=0||wanted.indexOf(n)>=0);});
  }

  function registerOptionalSources(){
    var A=window.SUBJECT_ADAPTER;
    if(!A)return false;
    A.dataSourceMeta=A.dataSourceMeta||{};
    A.dataSourceMeta.theory_reference_c01_l04={label:'Tham khảo thêm · §1.4',path:REGISTRY.reference.path,group:'Bài giảng lý thuyết · Artifact phụ',required:false,lazy:true,lessonId:LESSON_ID,version:REGISTRY.reference.version};
    A.dataSourceMeta.theory_full_view_c01_l04={label:'Xem đầy đủ · §1.4',path:REGISTRY.fullView.path,group:'Bài giảng lý thuyết · Artifact phụ',required:false,lazy:true,lessonId:LESSON_ID,version:REGISTRY.fullView.version};
    A.dataSourceMeta.theory_normalization_c01_l04={label:'Chuẩn hóa ký hiệu · §1.4',path:REGISTRY.normalization.path,group:'Bài giảng lý thuyết · Artifact phụ',required:false,lazy:true,lessonId:LESSON_ID,version:REGISTRY.normalization.version};
    return true;
  }

  function fetchJson(spec){
    return fetch(spec.path,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(spec.path+' HTTP '+r.status);return r.json();}).then(function(j){
      if(!j||j.lessonId!==LESSON_ID)throw new Error(spec.path+' lessonId mismatch');
      if(j.version!==spec.version)throw new Error(spec.path+' version mismatch: '+String(j.version||''));
      return j;
    });
  }

  function loadArtifacts(){
    if(cache.reference&&cache.fullView&&cache.normalization)return Promise.resolve(cache);
    if(cache.promise)return cache.promise;
    cache.promise=Promise.all([fetchJson(REGISTRY.reference),fetchJson(REGISTRY.fullView),fetchJson(REGISTRY.normalization)]).then(function(items){
      cache.reference=items[0];cache.fullView=items[1];cache.normalization=items[2];cache.error=null;return cache;
    }).catch(function(e){cache.error=String(e&&e.message||e);throw e;}).finally(function(){cache.promise=null;});
    return cache.promise;
  }

  function canonicalFormula(raw){
    var value=String(raw||'').trim(), n=cache.normalization;
    if(!value||!n)return value;
    var list=arr(n.canonicalFormulaRegistry), hit=null;
    list.some(function(item){
      var aliases=arr(item.sourceAliases).concat([item.canonicalText]);
      if(aliases.some(function(alias){return String(alias||'').trim()===value;})){hit=item;return true;}
      return false;
    });
    return hit&&hit.canonicalText?hit.canonicalText:value;
  }

  function ensureStyle(){
    if(document.getElementById('e241-artifact-style'))return;
    var st=document.createElement('style');st.id='e241-artifact-style';st.textContent=''
      +'.e241-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}'
      +'.e241-btn{border:1px solid rgba(125,211,252,.38);border-radius:999px;background:rgba(8,47,73,.76);color:#eaf8ff;padding:8px 12px;font:800 12px/1 system-ui;cursor:pointer}'
      +'.e241-btn:hover{background:rgba(14,116,144,.9)}'
      +'.e241-btn.reference{border-color:rgba(167,139,250,.46);background:rgba(55,30,96,.8)}'
      +'.e241-btn.full{border-color:rgba(45,212,191,.48);background:rgba(6,78,78,.82)}'
      +'.e241-reference-summary{cursor:pointer}'
      +'.e241-reference-summary .e241-open-inline{margin-top:10px}'
      +'.e241-modal{position:fixed;inset:0;z-index:2147483620;display:grid;place-items:center;padding:22px;background:rgba(1,6,14,.91);backdrop-filter:blur(12px)}'
      +'.e241-modal.hidden{display:none}'
      +'.e241-shell{width:min(1180px,95vw);height:min(820px,92vh);display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;border:1px solid rgba(125,211,252,.36);border-radius:24px;background:linear-gradient(145deg,#081522,#0b2431 48%,#111a2d);box-shadow:0 30px 100px rgba(0,0,0,.72);color:#eaf7ff}'
      +'.e241-head{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(125,211,252,.2)}'
      +'.e241-head h2{margin:0;font-size:clamp(22px,2.3vw,32px)}'
      +'.e241-head p{margin:6px 0 0;color:#b8d7e8}'
      +'.e241-close{border:1px solid rgba(255,255,255,.25);border-radius:999px;background:#07101b;color:#fff;padding:8px 12px;cursor:pointer}'
      +'.e241-body{overflow:auto;padding:20px;scrollbar-width:thin}'
      +'.e241-section{margin:0 0 18px;padding:17px;border:1px solid rgba(125,211,252,.2);border-radius:18px;background:rgba(4,15,27,.56)}'
      +'.e241-section h3{margin:0 0 9px;font-size:20px;color:#f8fcff}'
      +'.e241-section h4{margin:14px 0 7px;color:#a7f3d0}'
      +'.e241-section p,.e241-section li{line-height:1.58;color:#d9edf7}'
      +'.e241-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}'
      +'.e241-card{padding:13px;border:1px solid rgba(125,211,252,.18);border-radius:14px;background:rgba(8,32,50,.68)}'
      +'.e241-card h4{margin:0 0 7px}'
      +'.e241-formula{white-space:pre-wrap;overflow-wrap:anywhere;padding:11px;border-radius:12px;background:rgba(3,9,17,.85);color:#fff4c7}'
      +'.e241-warning{border-left:4px solid #f59e0b;padding-left:12px}'
      +'.e241-condition{border-left:4px solid #22d3ee;padding-left:12px}'
      +'.e241-table{width:100%;border-collapse:collapse}'
      +'.e241-table th,.e241-table td{border-bottom:1px solid rgba(125,211,252,.16);padding:9px;text-align:left;vertical-align:top}'
      +'@media(max-width:720px){.e241-modal{padding:8px}.e241-shell{width:98vw;height:96vh;border-radius:16px}.e241-body{padding:12px}.e241-head{padding:14px}.e241-table{display:block;overflow:auto}}';
    document.head.appendChild(st);
  }

  function ensureModal(){
    ensureStyle();
    if(modal)return modal;
    modal=document.createElement('div');modal.className='e241-modal hidden';modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="e241-shell" role="dialog" aria-modal="true"><header class="e241-head"><div><h2 data-e241-title></h2><p data-e241-sub></p></div><button class="e241-close" type="button" data-e241-close>Đóng</button></header><main class="e241-body" data-e241-body></main></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('[data-e241-close]'))closeModal();});
    return modal;
  }

  function openModal(title,sub,html){
    var m=ensureModal();m.querySelector('[data-e241-title]').textContent=title||'';m.querySelector('[data-e241-sub]').textContent=sub||'';m.querySelector('[data-e241-body]').innerHTML=html;m.classList.remove('hidden');m.setAttribute('aria-hidden','false');
  }
  function closeModal(){if(!modal)return;modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');modal.querySelector('[data-e241-body]').innerHTML='';}

  function tableHtml(headers,rows){
    return '<table class="e241-table"><thead><tr>'+headers.map(function(h){return '<th>'+esc(h.label)+'</th>';}).join('')+'</tr></thead><tbody>'+arr(rows).map(function(row){return '<tr>'+headers.map(function(h){return '<td>'+esc(row&&row[h.key])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';
  }

  function workedCaseHtml(c){
    c=c||{};var velocity=c.worldVelocity||{}, basis=c.routeBasis||{}, transform=c.transform||{}, route=c.routeCoordinates||{}, checks=c.checks||{};
    return '<div class="e241-grid"><article class="e241-card"><h4>World velocity</h4><pre class="e241-formula">'+esc((velocity.symbol||'[v]_W')+' = ('+arr(velocity.value).join(', ')+') '+(velocity.units||''))+'</pre></article>'
      +'<article class="e241-card"><h4>Route basis</h4><p>t = ('+esc(arr(basis.t).join(', '))+')</p><p>n_left = ('+esc(arr(basis.nLeft).join(', '))+')</p><p>Order: '+esc(arr(basis.order).join(' → '))+'</p></article>'
      +'<article class="e241-card"><h4>Transform</h4><pre class="e241-formula">'+esc((transform.symbol||'P')+' = '+JSON.stringify(transform.matrix||[]))+'</pre></article>'
      +'<article class="e241-card"><h4>Route coordinates</h4><pre class="e241-formula">'+esc((route.symbol||'[v]_R')+' = ('+arr(route.value).join(', ')+')')+'</pre><p>'+esc(route.interpretation)+'</p></article>'
      +'<article class="e241-card"><h4>Checks</h4><p>Reconstruction: ('+esc(arr(checks.reconstructedWorld).join(', '))+')</p><p>Residual norm: '+esc(checks.residualNorm)+'</p><p>Norm² world/route: '+esc(checks.worldNormSquared)+' / '+esc(checks.routeNormSquared)+'</p></article></div>'
      +(arr(c.doNotForget).length?'<div class="e241-warning"><b>Không được quên</b>'+listHtml(c.doNotForget)+'</div>':'');
  }

  function referenceHtml(r){
    var concepts=arr(r.conceptMap&&r.conceptMap.entries), formulas=arr(r.formulaTable), notation=arr(r.notationLookup);
    return '<section class="e241-section"><h3>Luận đề tra cứu</h3><p>'+esc(r.conceptMap&&r.conceptMap.thesis||r.purpose||'')+'</p></section>'
      +'<section class="e241-section"><h3>R01 · Bản đồ khái niệm</h3><div class="e241-grid">'+concepts.map(function(x){return '<article class="e241-card"><h4>'+esc(x.term)+'</h4><p>'+esc(x.compactDefinition)+'</p><p><b>Câu hỏi:</b> '+esc(x.keyQuestion)+'</p><p><b>Ý nghĩa kỹ thuật:</b> '+esc(x.engineeringMeaning)+'</p></article>';}).join('')+'</div></section>'
      +'<section class="e241-section"><h3>R02 · Bảng công thức</h3>'+formulas.map(function(x){return '<article class="e241-card"><h4>'+esc(x.name)+'</h4><pre class="e241-formula">'+esc(canonicalFormula(x.formula))+'</pre><p>'+esc(x.answers)+'</p><p class="e241-condition"><b>Điều kiện:</b> '+esc(x.conditions)+'</p><p class="e241-warning"><b>Cảnh báo:</b> '+esc(x.warning)+'</p></article>';}).join('')+'</section>'
      +'<section class="e241-section"><h3>R03 · Phân loại họ biểu diễn</h3>'+tableHtml([{key:'family',label:'Họ biểu diễn'},{key:'spansTarget',label:'Sinh target'},{key:'independent',label:'Độc lập'},{key:'existence',label:'Tồn tại'},{key:'uniqueness',label:'Duy nhất'},{key:'safeLabel',label:'Tên gọi an toàn'}],r.familyComparison)+'</section>'
      +'<section class="e241-section"><h3>R04 · Chọn phương pháp</h3>'+tableHtml([{key:'situation',label:'Tình huống'},{key:'use',label:'Nên dùng'},{key:'avoid',label:'Tránh'}],r.methodDecisionTable)+'</section>'
      +'<section class="e241-section"><h3>R05 · Cổng kiểm tra kỹ thuật</h3>'+tableHtml([{key:'gate',label:'Cổng'},{key:'question',label:'Câu hỏi kiểm'},{key:'failAction',label:'Khi không đạt'}],r.assumptionChecklist)+'</section>'
      +'<section class="e241-section"><h3>R06 · Lỗi và chẩn đoán nhanh</h3>'+tableHtml([{key:'failure',label:'Lỗi'},{key:'symptom',label:'Triệu chứng'},{key:'diagnosis',label:'Chẩn đoán'},{key:'repair',label:'Cách sửa'}],r.failureQuickGuide)+'</section>'
      +'<section class="e241-section"><h3>R07 · Case UGV world–route</h3>'+workedCaseHtml(r.workedCaseSnapshot)+'</section>'
      +'<section class="e241-section"><h3>Ký hiệu nhanh</h3><table class="e241-table"><thead><tr><th>Ký hiệu</th><th>Ý nghĩa</th></tr></thead><tbody>'+notation.map(function(x){return '<tr><td><code>'+esc(x.symbol)+'</code></td><td>'+esc(x.meaning)+'</td></tr>';}).join('')+'</tbody></table></section>'
      +'<section class="e241-section"><h3>Chuyển giao kỹ thuật</h3>'+tableHtml([{key:'domain',label:'Miền'},{key:'safeUse',label:'Dùng an toàn'},{key:'unsafeShortcut',label:'Lối tắt nguy hiểm'}],r.engineeringTransfer)+'</section>';
  }

  function listHtml(items){return '<ul>'+arr(items).map(function(x){return '<li>'+esc(typeof x==='string'?x:(x.label||x.text||x.meaning||JSON.stringify(x)))+'</li>';}).join('')+'</ul>';}
  function fullBlockHtml(b){
    if(!b||typeof b!=='object')return '<p>'+esc(b)+'</p>';
    var type=String(b.type||'').toLowerCase();
    if(type==='formula')return '<article class="e241-card"><pre class="e241-formula">'+esc(canonicalFormula(b.formula||b.text))+'</pre>'+(b.meaning?'<p>'+esc(b.meaning)+'</p>':'')+(b.conditions?'<div class="e241-condition"><b>Điều kiện</b>'+listHtml(b.conditions)+'</div>':'')+(b.warning?'<p class="e241-warning"><b>Cảnh báo:</b> '+esc(b.warning)+'</p>':'')+'</article>';
    if(type==='definition')return '<article class="e241-card"><h4>'+esc(b.term||'Định nghĩa')+'</h4><p>'+esc(b.text)+'</p></article>';
    if(type==='comparison')return '<div class="e241-grid">'+arr(b.items).map(function(x){return '<article class="e241-card"><h4>'+esc(x.label)+'</h4><p>'+esc(x.meaning||x.text)+'</p></article>';}).join('')+'</div>';
    if(type==='derivation')return '<article class="e241-card"><h4>Suy luận</h4>'+listHtml(b.steps)+(b.conclusion?'<p><b>Kết luận:</b> '+esc(b.conclusion)+'</p>':'')+'</article>';
    if(type==='example')return '<article class="e241-card"><h4>'+esc(b.title||'Ví dụ')+'</h4>'+(b.setup?'<p><b>Thiết lập:</b> '+esc(b.setup)+'</p>':'')+(b.text?'<p>'+esc(b.text)+'</p>':'')+(b.steps?listHtml(b.steps):'')+(b.reconstruction?'<p><b>Reconstruction:</b> '+esc(b.reconstruction)+'</p>':'')+'</article>';
    if(type==='check')return '<article class="e241-card"><h4>Tự kiểm</h4>'+listHtml(b.items||b.steps)+'</article>';
    if(type==='warning')return '<p class="e241-warning"><b>Cảnh báo:</b> '+esc(b.text)+'</p>';
    if(type==='condition')return '<p class="e241-condition"><b>Điều kiện:</b> '+esc(b.text)+'</p>';
    if(b.items)return '<article class="e241-card">'+(b.title?'<h4>'+esc(b.title)+'</h4>':'')+listHtml(b.items)+'</article>';
    return '<p>'+esc(b.text||b.lead||b.summary||b.meaning||'')+'</p>';
  }

  function fullViewHtml(f){
    return arr(f.readingFlow).map(function(section,index){return '<section class="e241-section" id="e241-'+esc(section.id||String(index+1))+'"><h3>'+(index+1)+'. '+esc(section.title)+'</h3>'+(section.lead?'<p><b>'+esc(section.lead)+'</b></p>':'')+arr(section.blocks).map(fullBlockHtml).join('')+'</section>';}).join('');
  }

  function showReference(){loadArtifacts().then(function(c){openModal(c.reference.displayTitle||'Tham khảo thêm',c.reference.version+' · 7 khu tra cứu đã duyệt',referenceHtml(c.reference));}).catch(function(e){openModal('Không tải được Tham khảo thêm',RELEASE,'<section class="e241-section"><p>'+esc(e&&e.message||e)+'</p></section>');});}
  function showFullView(){loadArtifacts().then(function(c){openModal(c.fullView.displayTitle||'Xem đầy đủ',c.fullView.version+' · '+arr(c.fullView.readingFlow).length+' phần',fullViewHtml(c.fullView));}).catch(function(e){openModal('Không tải được Xem đầy đủ',RELEASE,'<section class="e241-section"><p>'+esc(e&&e.message||e)+'</p></section>');});}

  function ensureControls(){
    registerOptionalSources();
    var d=deck();if(!d||!d.classList.contains('e211-reader-pro'))return false;
    var formulaBtn=d.querySelector('[data-e211-formula-full]');if(formulaBtn&&formulaBtn.textContent!=='Công thức đầy đủ')formulaBtn.textContent='Công thức đầy đủ';
    var existing=d.querySelector('.e241-actions');
    if(!currentLessonMatches()){if(existing)existing.remove();return false;}
    var host=d.querySelector('.e202-hero-copy')||d.querySelector('.e132-clean-main');if(!host)return false;
    if(!existing){
      existing=document.createElement('div');existing.className='e241-actions';existing.innerHTML='<button type="button" class="e241-btn reference" data-e241-reference>Tham khảo thêm</button><button type="button" class="e241-btn full" data-e241-full>Xem đầy đủ</button>';host.appendChild(existing);
    }
    loadArtifacts().then(function(c){
      var panel=d.querySelector('.e211-summary-panel');
      if(panel&&!panel.classList.contains('e241-reference-summary')){
        panel.classList.add('e241-reference-summary');panel.setAttribute('data-e241-reference','');
        panel.innerHTML='<h3 class="e211-panel-title">Tham khảo thêm</h3><p class="e211-summary-lead">'+esc(c.reference.conceptMap&&c.reference.conceptMap.thesis||c.reference.purpose)+'</p><button type="button" class="e241-btn reference e241-open-inline">Mở 7 khu tra cứu đã duyệt</button>';
      }
    }).catch(function(){});
    return true;
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;ensureControls();});}
  function boot(){ensureStyle();registerOptionalSources();schedule();try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){};document.addEventListener('click',function(e){if(e.target&&e.target.closest('[data-e241-reference]')){e.preventDefault();e.stopPropagation();showReference();return;}if(e.target&&e.target.closest('[data-e241-full]')){e.preventDefault();e.stopPropagation();showFullView();}},true);document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.classList.contains('hidden')){e.preventDefault();closeModal();}},true);}

  window.BAUMAN_MATH_E241_ARTIFACT_READER={release:RELEASE,registry:REGISTRY,load:loadArtifacts,showReference:showReference,showFullView:showFullView,selfCheck:function(){return {ok:true,release:RELEASE,lessonId:LESSON_ID,referenceRegistered:true,fullViewRegistered:true,normalizationRegistered:true,referenceSections:7,referenceLoaded:!!cache.reference,fullViewLoaded:!!cache.fullView,normalizationLoaded:!!cache.normalization,fullViewSections:cache.fullView?arr(cache.fullView.readingFlow).length:null,formulaRegistryCount:cache.normalization?arr(cache.normalization.canonicalFormulaRegistry).length:null,formulaPopupSeparate:true,error:cache.error};}};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
