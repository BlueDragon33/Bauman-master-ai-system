/* E243 · Presenter route lock bridge
 * Preserves the visible E129 lesson while opening E202 and prevents C01 decimal
 * content from being mistaken for C02/C03 lesson aliases. No new renderer.
 */
(function(){
  'use strict';

  var RELEASE='E243_PRESENTER_ROUTE_LOCK_R2';
  var handled=0;
  var lastLessonId='';
  var stabilizationRuns=0;

  function state(){
    try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||(window.__MATH_STATE={});}
    catch(_){return window.__MATH_STATE||(window.__MATH_STATE={});}
  }

  function visibleLesson(button){
    var shell=button&&button.closest&&button.closest('.e129-theory-shell');
    var node=(shell&&shell.querySelector('[data-current-lesson]'))||document.querySelector('[data-current-lesson]');
    return String(node&&node.getAttribute('data-current-lesson')||state().e129LessonId||state().e169Path&&state().e169Path.lessonId||'').trim();
  }

  function lockState(id,present){
    var st=state();
    st.e169Path=st.e169Path||{};
    if(id){st.e129LessonId=id;st.e169Path.lessonId=id;lastLessonId=id;}
    st.view='learning';
    st.learnTab='theory';
    st.e129Present=!!present;
    return st;
  }

  function sanitizeRoutingText(root){
    if(!root||!document.createTreeWalker)return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;
    while((node=walker.nextNode())){
      node.nodeValue=String(node.nodeValue||'').replace(/([23])\.([1-6])/g,'$1·$2');
    }
  }

  function openDeckFromLockedReader(){
    var api=window.BAUMAN_MATH_THEORY_E132;
    var real=document.querySelector('.e129-theory-shell.presenting');
    if(!api||typeof api.openDeck!=='function'||!real)return false;

    var ghost=real.cloneNode(true);
    ghost.setAttribute('data-e243-routing-ghost','1');
    ghost.style.display='none';
    sanitizeRoutingText(ghost);

    real.classList.remove('presenting');
    document.body.appendChild(ghost);
    try{return api.openDeck()!==false;}
    finally{
      if(ghost.parentNode)ghost.parentNode.removeChild(ghost);
      real.classList.add('presenting');
    }
  }

  function stabilizeReader(id,e129){
    [0,120,720].forEach(function(delay){
      setTimeout(function(){
        var deck=document.querySelector('.e132-overlay-deck.open');
        if(!deck||!id)return;
        lockState(id,true);
        e129.render();
        stabilizationRuns+=1;
      },delay);
    });
  }

  function handle(e){
    var button=e.target&&e.target.closest&&e.target.closest('[data-e129-present]');
    if(!button)return;
    var e129=window.BAUMAN_MATH_THEORY_E129;
    if(!e129||typeof e129.render!=='function')return;

    var st=state();
    var next=!st.e129Present;
    var id=visibleLesson(button);
    lockState(id,next);
    e129.render();

    if(next){
      openDeckFromLockedReader();
      stabilizeReader(id,e129);
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
    selfCheck:function(){
      return {
        ok:true,
        release:RELEASE,
        handled:handled,
        lastLessonId:lastLessonId,
        stabilizationRuns:stabilizationRuns,
        noNewRenderer:true,
        routingGhostPresent:!!document.querySelector('[data-e243-routing-ghost]')
      };
    }
  };
})();
