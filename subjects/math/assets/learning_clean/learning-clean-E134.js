/* E134 · Clean Learning Runtime
 * Learner-facing cleanup: one global stage selector, compact learning tabs, no technical notes.
 */
(function(){
  'use strict';
  var RELEASE='E134_CLEAN_LEARNING_RUNTIME';
  var TABS=[['theory','Lý thuyết'],['exercises','Bài tập'],['simulation','Mô phỏng'],['exam','Kiểm tra']];
  function api(){return window.__BAUMAN_CORE_API||{};}
  function st(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function save(){try{api().save&&api().save();}catch(_){} }
  function db(){return window.DB||{};}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function currentStage(){var x=(document.getElementById('stageSelect')||{}).value||st().e129Stage||st().stage||'vn';return x==='all'?'vn':x;}
  function itemStage(x){return String(x&&x.stage||x&&x.stageId||x&&x.phase||'vn').trim()||'vn';}
  function title(x,fallback){return x&& (x.title||x.lessonTitle||x.name||x.id||x.question||x.prompt) || fallback;}
  function body(x){return x&&(x.summary||x.description||x.prompt||x.task||x.purpose||x.explanation||x.answer||x.body)||'';}
  function pick(arr){var stage=currentStage();return (Array.isArray(arr)?arr:[]).filter(function(x){var s=itemStage(x);return !s||s===stage||s==='all';}).slice(0,48);}
  function dataFor(tab){var D=db(); if(tab==='exercises') return pick(D.exercises); if(tab==='simulation') return pick(D.simulations||D.simulation_content); if(tab==='exam') return pick((D.tests&&D.tests.questions)||D.question_bank||[]); return [];}
  function ensureTabs(){
    var main=document.querySelector('.main'); if(!main) return;
    var bar=document.querySelector('.e134-learning-tabs');
    if(!bar){bar=document.createElement('div');bar.className='e134-learning-tabs';var top=document.querySelector('.topbar'); if(top&&top.nextSibling) main.insertBefore(bar,top.nextSibling); else main.insertBefore(bar,main.firstChild);} 
    var active=st().learnTab||'theory';
    bar.innerHTML=TABS.map(function(t){return '<button type="button" class="'+(active===t[0]?'active':'')+'" data-e134-tab="'+t[0]+'">'+t[1]+'</button>';}).join('');
  }
  function cleanChrome(){
    var sub=document.getElementById('subjectSubtitle'); if(sub) sub.textContent='';
    var pageSub=document.getElementById('pageSub'); if(pageSub) pageSub.textContent='';
    var core=document.getElementById('coreLabel'); if(core) core.textContent='';
    var saveState=document.getElementById('saveState'); if(saveState) saveState.textContent='';
    document.querySelectorAll('.e129-stage-tabs').forEach(function(n){n.remove();});
  }
  function renderDataTab(tab){
    var view=document.getElementById('view'); if(!view) return false;
    var map={exercises:'Bài tập',simulation:'Mô phỏng',exam:'Kiểm tra'};
    var arr=dataFor(tab);
    var stage=currentStage();
    var cards=arr.map(function(x,i){return '<article class="e134-study-card"><code>'+esc(x.id||x.lessonId||x.chapterId||('item-'+(i+1)))+'</code><b>'+esc(title(x,map[tab]))+'</b><p>'+esc(body(x)).slice(0,420)+'</p></article>';}).join('');
    view.innerHTML='<section class="e134-tab-shell"><header class="e134-tab-head"><div><h1>'+esc(map[tab])+'</h1></div><span>Giai đoạn hiện tại: '+esc(stage)+' · '+arr.length+' mục</span></header>'+(cards?'<div class="e134-tab-grid">'+cards+'</div>':'<div class="e134-empty">Chưa có dữ liệu phù hợp với giai đoạn hiện tại.</div>')+'</section>';
    return true;
  }
  function activate(tab){
    var S=st(); S.view='learning'; S.learnTab=tab; S.stage=currentStage(); S.e129Stage=S.stage; save();
    if(tab==='theory'){
      if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render){window.BAUMAN_MATH_THEORY_E129.render();}
    }else renderDataTab(tab);
    ensureTabs(); cleanChrome();
  }
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-e134-tab]'); if(!b)return; e.preventDefault(); e.stopPropagation(); activate(b.getAttribute('data-e134-tab'));},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='stageSelect'){setTimeout(function(){if((st().learnTab||'theory')!=='theory') activate(st().learnTab); cleanChrome();},0);}},true);
  var mo=new MutationObserver(function(){setTimeout(function(){ensureTabs();cleanChrome();},0);});
  function boot(){ensureTabs();cleanChrome();try{mo.observe(document.body,{childList:true,subtree:true});}catch(_){}}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E134_CLEAN_LEARNING={release:RELEASE,activate:activate,selfCheck:function(){return {ok:!!document.querySelector('.e134-learning-tabs'),release:RELEASE,tabBar:!!document.querySelector('.e134-learning-tabs'),stage:currentStage(),activeTab:st().learnTab||'theory',internalStageTabs:document.querySelectorAll('.e129-stage-tabs').length};}};
})();
