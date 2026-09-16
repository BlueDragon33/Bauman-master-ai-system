/* E243 · Presenter route and canonical identity lock
 * Preserves the visible E129 lesson while opening E202, prevents C01 decimal
 * content from being mistaken for C02/C03 aliases, and stamps the canonical
 * lesson identity onto the existing deck. No new renderer.
 */
(function(){
  'use strict';

  var RELEASE='E243_PRESENTER_ROUTE_IDENTITY_LOCK_R10_GUARD_REINSTALL';
  var handled=0;
  var lastLessonId='';
  var lastLessonTitle='';
  var stabilizationRuns=0;
  var presenterRawOpen=null;
  var presenterGuardInstalled=false;
  var presenterGuardAttempts=0;
  var presenterGuardReinstalls=0;
  var minimalGhostBuilds=0;
  var canonicalGhostBuilds=0;
  var lastGhostSlides=0;
  var lastGhostSource='';
  var lastSuppressedShells=0;
  var presenterSelfCheckWrapped=false;

  function state(){
    try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||(window.__MATH_STATE={});}
    catch(_){return window.__MATH_STATE||(window.__MATH_STATE={});}
  }
  function registry(){return window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244||null;}
  function contentPayload(){
    try{
      var bridge=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE;
      if(bridge&&typeof bridge.getPayload==='function')return bridge.getPayload();
      return window.DB&&window.DB.theory_lecture_content||null;
    }catch(_){return null;}
  }
  function canonicalRecord(identity){
    if(!identity||!identity.lessonId)return null;
    var payload=contentPayload(),records=payload&&Array.isArray(payload.records)?payload.records:[];
    return records.find(function(record){return record&&record.lessonId===identity.lessonId;})||null;
  }
  function canonicalIdentity(id){
    id=String(id||'').trim();
    if(!id)return {lessonId:'',lessonTitle:'',source:'none'};
    var reg=registry(),entry=reg&&typeof reg.get==='function'?reg.get(id):null;
    if(entry)return {lessonId:entry.lessonId,lessonTitle:entry.lessonTitle,source:'E244'};
    var payload=contentPayload(),records=payload&&Array.isArray(payload.records)?payload.records:[];
    var record=records.find(function(r){return r&&r.lessonId===id;});
    if(record)return {lessonId:record.lessonId,lessonTitle:record.lessonTitle||record.title||record.lessonId,source:'E240'};
    return {lessonId:id,lessonTitle:id,source:'raw-id'};
  }
  function visibleLesson(button){
    var st=state();
    var stateId=String(st.e129LessonId||(st.e169Path&&st.e169Path.lessonId)||st.lessonId||'').trim();
    if(stateId&&registeredPresenterLesson(stateId))return stateId;
    var shell=button&&button.closest&&button.closest('.e129-theory-shell');
    var node=(shell&&shell.querySelector('[data-current-lesson]'))||document.querySelector('.e129-theory-shell.presenting [data-current-lesson]')||document.querySelector('[data-current-lesson]');
    return String(node&&node.getAttribute('data-current-lesson')||stateId||'').trim();
  }
  function registeredPresenterLesson(id){
    var reg=registry(),entry=reg&&typeof reg.get==='function'?reg.get(String(id||'').trim()):null;
    return !!(entry&&entry.slideshow&&entry.slideshow.expected);
  }
  function expectedSlides(identity){
    var reg=registry(),entry=reg&&identity&&reg&&typeof reg.get==='function'?reg.get(identity.lessonId):null;
    return Number(entry&&entry.slideshow&&entry.slideshow.expected&&entry.slideshow.expected.slides)||0;
  }
  function lockState(id,present){
    var st=state(),identity=canonicalIdentity(id);
    st.e169Path=st.e169Path||{};
    if(identity.lessonId){
      st.e129LessonId=identity.lessonId;
      st.e169Path.lessonId=identity.lessonId;
      lastLessonId=identity.lessonId;
      lastLessonTitle=identity.lessonTitle;
    }
    st.view='learning';
    st.learnTab='theory';
    st.e129Present=!!present;
    return identity;
  }
  function stampDeck(identity){
    var deck=document.querySelector('.e132-overlay-deck.open');
    if(!deck||!identity||!identity.lessonId)return false;
    deck.setAttribute('data-e243-route-lock',RELEASE);
    deck.setAttribute('data-e243-lesson-id',identity.lessonId);
    deck.setAttribute('data-e243-lesson-title',identity.lessonTitle||identity.lessonId);
    deck.setAttribute('data-lesson-id',identity.lessonId);
    try{
      var e210=window.BAUMAN_MATH_E210_LESSON_IDENTITY;
      if(e210&&typeof e210.apply==='function')e210.apply();
      var e241=window.BAUMAN_MATH_E241_ARTIFACT_READER;
      if(e241&&typeof e241.apply==='function')e241.apply();
      var e242=window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS;
      if(e242&&typeof e242.apply==='function')e242.apply();
    }catch(_){}
    return true;
  }
  function lessonNode(identity){
    if(!identity||!identity.lessonId)return null;
    var nodes=Array.prototype.slice.call(document.querySelectorAll('[data-current-lesson]'));
    return nodes.find(function(node){return node.getAttribute('data-current-lesson')===identity.lessonId;})||null;
  }
  function lessonOwner(identity){
    var node=lessonNode(identity);
    return node&&node.closest&&node.closest('.e129-theory-shell')||document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
  }
  function appendCanonicalSlides(holder,identity){
    var record=canonicalRecord(identity),slides=record&&Array.isArray(record.slides)?record.slides:[];
    var expected=expectedSlides(identity);
    if(!slides.length||(expected&&slides.length!==expected))return false;
    var list=document.createElement('div');
    list.className='e129-slide-list';
    slides.forEach(function(slide,index){
      var article=document.createElement('article');
      article.className='e129-slide';
      article.setAttribute('data-e243-canonical-slide',String(index+1));
      article.setAttribute('data-slide-id',slide&&slide.id||('SL'+String(index+1).padStart(2,'0')));
      var title=document.createElement('h2');
      title.textContent=slide&&slide.title||('Slide '+(index+1));
      article.appendChild(title);
      var blocks=slide&&Array.isArray(slide.blocks)?slide.blocks:[];
      blocks.forEach(function(block){
        if(!block)return;
        var type=String(block.type||'text').toLowerCase();
        var node=document.createElement(type==='formula'||type==='code'?'pre':'p');
        if(type==='formula')node.className='formula';
        if(type==='code')node.className='code';
        var parts=[];
        if(block.title)parts.push(String(block.title));
        if(block.body)parts.push(String(block.body));
        node.textContent=parts.join('\n');
        article.appendChild(node);
      });
      list.appendChild(article);
    });
    holder.appendChild(list);
    canonicalGhostBuilds+=1;
    lastGhostSlides=slides.length;
    lastGhostSource='E240';
    return true;
  }
  function appendDomSlides(holder,real,identity){
    var current=lessonNode(identity);
    if(!current&&real)current=real.querySelector('[data-current-lesson]');
    var list=current&&current.querySelector('.e129-slide-list');
    if(!current||!list)return false;
    var title=current.querySelector('.e169-reader-title,.e129-reader-title');
    if(title)holder.appendChild(title.cloneNode(true));
    var copy=list.cloneNode(true);
    holder.appendChild(copy);
    lastGhostSlides=copy.querySelectorAll('.e129-slide').length;
    lastGhostSource='DOM';
    return true;
  }
  function buildRoutingGhost(real,identity){
    if(!identity||!identity.lessonId)return null;
    var ghost=document.createElement('main');
    ghost.className='e129-theory-shell presenting';
    ghost.setAttribute('data-e243-routing-ghost','1');
    ghost.setAttribute('data-e243-routing-mode','canonical-reader-source');
    ghost.style.display='none';
    var holder=document.createElement('section');
    holder.className='e129-placeholder';
    holder.setAttribute('data-current-lesson',identity.lessonId);
    holder.setAttribute('data-e243-minimal-reader','1');
    var ok=appendCanonicalSlides(holder,identity)||appendDomSlides(holder,real,identity);
    if(!ok)return null;
    ghost.appendChild(holder);
    minimalGhostBuilds+=1;
    return ghost;
  }
  function guardCurrent(api){
    api=api||window.BAUMAN_MATH_THEORY_E132;
    return !!(api&&api.openDeck&&api.openDeck.__e243GuardRelease===RELEASE);
  }
  function presenterDiagnostics(){
    return {
      e243Release:RELEASE,
      e243GuardCurrent:guardCurrent(),
      e243GhostSource:lastGhostSource,
      e243GhostSlides:lastGhostSlides,
      e243CanonicalGhostBuilds:canonicalGhostBuilds,
      e243SuppressedShells:lastSuppressedShells,
      e243GuardReinstalls:presenterGuardReinstalls
    };
  }
  function wrapPresenterSelfCheck(api){
    if(!api||typeof api.selfCheck!=='function'||api.selfCheck.__e243DiagnosticRelease===RELEASE)return;
    var raw=api.selfCheck;
    var wrapped=function(){
      var base=raw.call(api)||{};
      var extra=presenterDiagnostics();
      Object.keys(extra).forEach(function(k){base[k]=extra[k];});
      return base;
    };
    wrapped.__e243DiagnosticRelease=RELEASE;
    api.selfCheck=wrapped;
    presenterSelfCheckWrapped=true;
  }
  function openDeckFromLockedReader(identity){
    var api=window.BAUMAN_MATH_THEORY_E132;
    var real=lessonOwner(identity);
    var opener=presenterRawOpen||(api&&api.openDeck);
    if(!api||typeof opener!=='function'||!real)return false;
    var ghost=buildRoutingGhost(real,identity);
    if(!ghost)return false;
    var presentingShells=Array.prototype.slice.call(document.querySelectorAll('.e129-theory-shell.presenting'));
    lastSuppressedShells=presentingShells.length;
    presentingShells.forEach(function(shell){shell.classList.remove('presenting');});
    document.body.appendChild(ghost);
    try{
      var result=opener.call(api)!==false;
      stampDeck(identity);
      return result;
    }finally{
      if(ghost.parentNode)ghost.parentNode.removeChild(ghost);
      if(state().e129Present){
        presentingShells.forEach(function(shell){shell.classList.add('presenting');});
      }
    }
  }
  function installPresenterGuard(){
    var api=window.BAUMAN_MATH_THEORY_E132;
    if(!api||typeof api.openDeck!=='function')return false;
    wrapPresenterSelfCheck(api);
    if(guardCurrent(api)){presenterGuardInstalled=true;return true;}
    var original=api.openDeck;
    if(presenterGuardInstalled)presenterGuardReinstalls+=1;
    presenterRawOpen=original;
    var guarded=function(){
      var id=visibleLesson(null);
      if(!registeredPresenterLesson(id))return original.apply(api,arguments);
      var identity=lockState(id,true);
      var real=lessonOwner(identity);
      if(!real)return original.apply(api,arguments);
      return openDeckFromLockedReader(identity);
    };
    guarded.__e243GuardRelease=RELEASE;
    api.openDeck=guarded;
    api.__e243PresenterGuard=RELEASE;
    presenterGuardInstalled=true;
    return true;
  }
  function stabilizeReader(identity,e129){
    [0,120,720].forEach(function(delay){
      setTimeout(function(){
        var deck=document.querySelector('.e132-overlay-deck.open');
        if(!deck||!identity||!identity.lessonId)return;
        identity=lockState(identity.lessonId,true);
        stampDeck(identity);
        e129.render();
        stampDeck(identity);
        stabilizationRuns+=1;
      },delay);
    });
  }
  function handle(e){
    var button=e.target&&e.target.closest&&e.target.closest('[data-e129-present]');
    if(!button)return;
    var e129=window.BAUMAN_MATH_THEORY_E129;
    if(!e129||typeof e129.render!=='function')return;
    var st=state(),next=!st.e129Present,id=visibleLesson(button),identity=lockState(id,next);
    e129.render();
    if(next){
      installPresenterGuard();
      openDeckFromLockedReader(identity);
      stabilizeReader(identity,e129);
    }else{
      var deckApi=window.BAUMAN_MATH_THEORY_E132;
      if(deckApi&&typeof deckApi.closeDeck==='function')deckApi.closeDeck();
    }
    handled+=1;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }

  window.addEventListener('click',handle,true);

  window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK={
    release:RELEASE,
    canonicalIdentity:canonicalIdentity,
    stampDeck:stampDeck,
    installPresenterGuard:installPresenterGuard,
    selfCheck:function(){
      var deck=document.querySelector('.e132-overlay-deck.open');
      var api=window.BAUMAN_MATH_THEORY_E132;
      return {
        ok:true,
        release:RELEASE,
        handled:handled,
        lastLessonId:lastLessonId,
        lastLessonTitle:lastLessonTitle,
        stabilizationRuns:stabilizationRuns,
        deckLessonId:deck&&deck.getAttribute('data-e243-lesson-id')||'',
        deckLessonTitle:deck&&deck.getAttribute('data-e243-lesson-title')||'',
        canonicalIdentityLocked:true,
        publicOpenGuardInstalled:presenterGuardInstalled,
        publicOpenGuardCurrent:guardCurrent(api),
        publicOpenGuardAttempts:presenterGuardAttempts,
        publicOpenGuardReinstalls:presenterGuardReinstalls,
        presenterSelfCheckWrapped:presenterSelfCheckWrapped,
        routingGhostMinimal:true,
        routingGhostCanonicalOwner:true,
        routingGhostCanonicalSource:true,
        canonicalGhostBuilds:canonicalGhostBuilds,
        lastGhostSlides:lastGhostSlides,
        lastGhostSource:lastGhostSource,
        lastSuppressedShells:lastSuppressedShells,
        minimalGhostBuilds:minimalGhostBuilds,
        noNewRenderer:true,
        routingGhostPresent:!!document.querySelector('[data-e243-routing-ghost]')
      };
    }
  };

  (function keepPresenterGuardCurrent(){
    installPresenterGuard();
    setInterval(function(){
      presenterGuardAttempts+=1;
      installPresenterGuard();
    },100);
  })();
})();
