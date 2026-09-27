/* UI-E20 · subject bridge to the shared Bauman interface system. */
(function(){
  'use strict';
  const subject=document.documentElement.dataset.subject||document.body?.dataset.subject||location.pathname.split('/').filter(Boolean).at(-2)||'subject';
  function boot(){
    document.body?.setAttribute('data-bui','1');
    document.body?.setAttribute('data-bui-subject',subject);
    if(window.BaumanUI?.commands){
      window.BaumanUI.commands.register({id:'subject.focus',label:'Focus Mode',group:'Học tập',keywords:'focus tập trung',icon:'◉',run:()=>window.BaumanUI.focus.toggle()});
      window.BaumanUI.commands.register({id:'subject.home',label:'Về Bauman Master Hub',group:'Điều hướng',keywords:'home hub',icon:'⌂',run:()=>{location.href='../../index.html#subjects'}});
    }
    document.dispatchEvent(new CustomEvent('bauman-subject-ui-ready',{detail:{subject}}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
