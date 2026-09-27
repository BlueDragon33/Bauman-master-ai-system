/* UI-E20 · subject bridge to the shared Bauman interface system. */
(function(){
  'use strict';
  const subject=document.documentElement.dataset.subject||document.body?.dataset.subject||location.pathname.split('/').filter(Boolean).at(-2)||'subject';
  const pageIcon={dashboard:'home',roadmap:'roadmap',lessons:'lessons',formulas:'formulas',exercises:'exercises',tests:'tests',simulations:'simulations',simulationPractice:'simulations',assistant:'assistant',data:'data'};
  function normalizeNav(){
    const nav=document.getElementById('nav');if(!nav||!window.BaumanUI?.icons)return;
    nav.querySelectorAll('[data-page]').forEach(btn=>{
      if(btn.dataset.buiIconized==='1')return;
      const page=btn.dataset.page,name=pageIcon[page]||'lessons';
      const label=(btn.textContent||'').replace(/^[^\p{L}\p{N}]+/u,'').trim()||page;
      btn.innerHTML=window.BaumanUI.icons.svg(name)+'<span>'+label+'</span>';
      btn.dataset.buiIconized='1';btn.setAttribute('aria-label',label);
    });
  }
  function installMobileNav(){
    if(document.querySelector('[data-bui-subject-mobile]'))return;
    const nav=document.getElementById('nav');if(!nav)return;
    const preferred=['dashboard','lessons','exercises','tests','assistant'];
    const items=preferred.map(id=>nav.querySelector('[data-page="'+id+'"]')).filter(Boolean);
    if(!items.length)return;
    const mobile=document.createElement('nav');mobile.className='bui-mobile-nav';mobile.dataset.buiSubjectMobile='1';mobile.setAttribute('aria-label','Điều hướng môn học trên di động');
    items.forEach(source=>{
      const b=document.createElement('button');b.type='button';b.dataset.page=source.dataset.page;
      b.innerHTML=window.BaumanUI.icons.svg(pageIcon[source.dataset.page]||'lessons')+'<span>'+((source.textContent||'').trim()||source.dataset.page)+'</span>';
      b.addEventListener('click',()=>source.click());mobile.appendChild(b);
    });
    document.body.appendChild(mobile);
    const sync=()=>mobile.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('is-active',nav.querySelector('[data-page="'+b.dataset.page+'"]')?.classList.contains('active')));
    new MutationObserver(()=>{normalizeNav();sync()}).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});sync();
  }
  function boot(){
    document.body?.setAttribute('data-bui','1');
    document.body?.setAttribute('data-bui-subject',subject);
    normalizeNav();installMobileNav();
    if(window.BaumanUI?.commands){
      window.BaumanUI.commands.register({id:'subject.focus',label:'Focus Mode',group:'Học tập',keywords:'focus tập trung',icon:'◉',run:()=>window.BaumanUI.focus.toggle()});
      window.BaumanUI.commands.register({id:'subject.home',label:'Về Bauman Master Hub',group:'Điều hướng',keywords:'home hub',icon:'⌂',run:()=>{location.href='../../index.html#subjects'}});
    }
    document.dispatchEvent(new CustomEvent('bauman-subject-ui-ready',{detail:{subject}}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
