/* E242 · Approved slideshow richness bridge for §1.4
 * Restores semantic diagram specs, misconception intercepts and retrieval checks
 * into the existing E202/E211 layout without changing slide count or mathematics.
 */
(function(){
  'use strict';

  var RELEASE='E242_APPROVED_SLIDESHOW_RICHNESS';
  var LESSON_ID='MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140';
  var LESSON_TITLE='§1.4 · Cơ sở, span và tọa độ';
  var SOURCE={path:'data/theory_slideshow/theory_slideshow_c01_l04.json',version:'SLIDESHOW_C01_L04_V1_APPROVED'};
  var EXPECTED={slides:22,diagrams:8,retrievalChecks:9,misconceptions:16};
  var artifact=null,loading=null,error=null,scheduled=false,lastKey='';

  function arr(v){return Array.isArray(v)?v:[];}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return String(n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
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

  function countFeatures(slides){
    return {
      slides:slides.length,
      diagrams:slides.filter(function(s){return !!s.diagramSpec;}).length,
      retrievalChecks:slides.filter(function(s){return !!s.retrievalCheck;}).length,
      misconceptions:slides.filter(function(s){return !!s.misconceptionIntercept;}).length
    };
  }

  function validate(j){
    if(!j||j.lessonId!==LESSON_ID)throw new Error('E242 lessonId mismatch');
    if(j.version!==SOURCE.version)throw new Error('E242 version mismatch: '+String(j.version||''));
    var counts=countFeatures(arr(j.slides));
    Object.keys(EXPECTED).forEach(function(k){if(counts[k]!==EXPECTED[k])throw new Error('E242 '+k+' expected '+EXPECTED[k]+' but found '+counts[k]);});
    var ids=arr(j.slides).map(function(s){return s.id;});
    for(var i=1;i<=22;i++)if(ids[i-1]!=='SL'+String(i).padStart(2,'0'))throw new Error('E242 slide order mismatch at '+i);
    return j;
  }

  function load(){
    if(artifact)return Promise.resolve(artifact);
    if(loading)return loading;
    loading=fetch(SOURCE.path,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(SOURCE.path+' HTTP '+r.status);return r.json();}).then(function(j){artifact=validate(j);error=null;return artifact;}).catch(function(e){error=String(e&&e.message||e);throw e;}).finally(function(){loading=null;});
    return loading;
  }

  function currentIndex(d){
    var match=text(d&&d.querySelector('[data-e202-count]')).match(/(\d+)\s*\//);
    return match?Math.max(0,parseInt(match[1],10)-1):0;
  }

  function ensureStyle(){
    if(document.getElementById('e242-style'))return;
    var st=document.createElement('style');st.id='e242-style';st.textContent=''
      +'.e242-diagram{height:100%;display:flex;flex-direction:column;justify-content:center;gap:9px}'
      +'.e242-diagram-head{display:flex;flex-wrap:wrap;gap:7px;align-items:center}'
      +'.e242-diagram-type{border:1px solid rgba(45,212,191,.4);border-radius:999px;padding:5px 8px;color:#a7f3d0;font:900 10px/1 system-ui;letter-spacing:.06em;text-transform:uppercase}'
      +'.e242-diagram-purpose{font-size:12px;line-height:1.35;color:#cce7f3}'
      +'.e242-flow{display:flex;flex-wrap:wrap;gap:7px;align-items:center;justify-content:center}'
      +'.e242-node{min-width:72px;max-width:145px;padding:8px 9px;border:1px solid rgba(125,211,252,.3);border-radius:12px;background:rgba(7,29,46,.78);color:#f4fbff;font:800 11px/1.28 system-ui;text-align:center;overflow-wrap:anywhere}'
      +'.e242-arrow{color:#67e8f9;font-weight:900}'
      +'.e242-constraints{margin:0;padding-left:18px;display:grid;gap:3px;color:#c8dbe7;font-size:10px;line-height:1.32}'
      +'.e242-wrong{color:#fecaca!important}'
      +'.e242-correction{color:#d1fae5!important}'
      +'.e242-evidence{margin-top:7px;padding-top:7px;border-top:1px solid rgba(125,211,252,.18);font-size:11px;color:#cce7f3}'
      +'.e242-evidence summary{cursor:pointer;font-weight:900;color:#a7f3d0}'
      +'.e242-evidence ul{margin:6px 0 0;padding-left:18px}'
      +'@media(max-width:720px){.e242-node{min-width:58px;max-width:110px;padding:6px;font-size:10px}.e242-constraints{font-size:9px}}';
    document.head.appendChild(st);
  }

  function labelFor(spec,index){
    var labels=arr(spec.labels), entities=arr(spec.entities), label=labels[index];
    if(label)return label;
    return entities[index]||('node '+String(index+1));
  }

  function diagramHtml(spec){
    var entities=arr(spec.entities), labels=arr(spec.labels), count=Math.max(entities.length,labels.length), nodes=[];
    for(var i=0;i<count;i++){
      if(i)nodes.push('<span class="e242-arrow">→</span>');
      nodes.push('<span class="e242-node">'+esc(labelFor(spec,i))+'</span>');
    }
    return '<div class="e242-diagram">'
      +'<div class="e242-diagram-head"><span class="e242-diagram-type">'+esc(String(spec.type||'semantic diagram').replace(/_/g,' '))+'</span><span class="e242-diagram-purpose">'+esc(spec.purpose||'')+'</span></div>'
      +'<div class="e242-flow">'+nodes.join('')+'</div>'
      +(arr(spec.mathematicalConstraints).length?'<ul class="e242-constraints">'+arr(spec.mathematicalConstraints).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'')
      +'</div>';
  }

  function applyDiagram(d,slide){
    var host=d.querySelector('.e202-visual');
    if(!host||!slide.diagramSpec)return false;
    host.innerHTML=diagramHtml(slide.diagramSpec);
    host.setAttribute('data-e242-diagram',slide.id);
    return true;
  }

  function cardParts(card){return {kicker:card&&card.querySelector('.e132-card-kicker'),headline:card&&card.querySelector('h3'),body:card&&card.querySelector('.e132-full-body')};}

  function applyMisconception(d,slide){
    if(!slide.misconceptionIntercept)return false;
    var card=d.querySelector('.e202-card-grid .e132-clean-card.application');
    if(!card)return false;
    var p=cardParts(card), m=slide.misconceptionIntercept;
    if(p.kicker)p.kicker.textContent='Chặn nhầm lẫn';
    if(p.headline){p.headline.textContent=m.wrong||'Nhầm lẫn thường gặp';p.headline.classList.add('e242-wrong');}
    if(p.body){p.body.textContent=m.correction||'';p.body.classList.add('e242-correction');}
    card.setAttribute('data-e242-misconception',slide.id);
    return true;
  }

  function applyRetrieval(d,slide){
    if(!slide.retrievalCheck)return false;
    var card=d.querySelector('.e202-card-grid .e132-clean-card.check');
    if(!card)return false;
    var p=cardParts(card), r=slide.retrievalCheck;
    if(p.kicker)p.kicker.textContent='Retrieval check · '+String(r.id||'');
    if(p.headline)p.headline.textContent=r.prompt||'Tự kiểm';
    if(p.body){
      p.body.textContent=r.misconceptionTarget?('Mục tiêu phát hiện: '+r.misconceptionTarget):'Tự trả lời trước khi xem bằng chứng.';
      var old=card.querySelector('.e242-evidence');if(old)old.remove();
      var details=document.createElement('details');details.className='e242-evidence';
      details.innerHTML='<summary>Bằng chứng mong đợi</summary><ul>'+arr(r.expectedEvidence).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
      card.appendChild(details);
    }
    card.setAttribute('data-e242-retrieval',slide.id);
    return true;
  }

  function clearStale(d){
    var visual=d.querySelector('[data-e242-diagram]');
    var mis=d.querySelector('[data-e242-misconception]');
    var ret=d.querySelector('[data-e242-retrieval]');
    if(visual)visual.removeAttribute('data-e242-diagram');
    if(mis)mis.removeAttribute('data-e242-misconception');
    if(ret)ret.removeAttribute('data-e242-retrieval');
  }

  function apply(){
    var d=deck();
    if(!d||!d.classList.contains('open')||!currentLessonMatches())return false;
    if(!artifact){load().then(schedule).catch(function(){});return false;}
    var index=currentIndex(d), slide=arr(artifact.slides)[index];
    if(!slide)return false;
    var key=slide.id+'|'+text(d.querySelector('.e132-clean-main h1'));
    if(lastKey===key&&d.querySelector('[data-e242-slide="'+slide.id+'"]'))return true;
    lastKey=key;
    clearStale(d);
    var main=d.querySelector('.e132-clean-main');if(main)main.setAttribute('data-e242-slide',slide.id);
    applyDiagram(d,slide);
    applyMisconception(d,slide);
    applyRetrieval(d,slide);
    d.setAttribute('data-e242-richness',RELEASE);
    return true;
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}

  function registerOptionalSource(){
    var A=window.SUBJECT_ADAPTER;if(!A)return false;
    A.dataSourceMeta=A.dataSourceMeta||{};
    A.dataSourceMeta.theory_slideshow_c01_l04={label:'Slideshow approved richness · §1.4',path:SOURCE.path,group:'Bài giảng lý thuyết · Artifact phụ',required:false,lazy:true,lessonId:LESSON_ID,version:SOURCE.version};
    return true;
  }

  function boot(){
    ensureStyle();registerOptionalSource();load().then(schedule).catch(function(){});
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});}catch(_){ }
  }

  window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS={
    release:RELEASE,
    source:SOURCE,
    expected:EXPECTED,
    load:load,
    apply:apply,
    selfCheck:function(){
      var counts=artifact?countFeatures(arr(artifact.slides)):null;
      return {ok:!error,release:RELEASE,lessonId:LESSON_ID,loaded:!!artifact,counts:counts,expected:EXPECTED,currentSlide:deck()&&deck().querySelector('.e132-clean-main')&&deck().querySelector('.e132-clean-main').getAttribute('data-e242-slide'),error:error};
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
