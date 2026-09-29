/* BAUMAN FUTURE INTERFACE SYSTEM · Runtime V2 · UI-E5 Navigation
   Cross-project progressive enhancement only.
   Navigation mirrors existing application routes; it never owns route state. */
(()=>{
  const root=document.documentElement;
  root.dataset.baumanUi='future-v1';

  const setMode=mode=>{root.dataset.inputMode=mode};
  window.addEventListener('keydown',e=>{
    if(e.key==='Tab'||e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='ArrowRight')setMode('keyboard');
  },{passive:true});
  window.addEventListener('pointerdown',()=>setMode('pointer'),{passive:true});

  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const syncMotion=()=>{root.dataset.reducedMotion=media?.matches?'true':'false'};
  syncMotion();
  media?.addEventListener?.('change',syncMotion);

  const PAGE_ICON={
    home:'⌂',
    roadmap:'⌘',
    subjects:'▦',
    schedule:'◷',
    research:'✦'
  };
  let navObserver=null;
  let appObserver=null;

  function primaryNav(){
    const app=document.getElementById('appRoot');
    const nav=document.getElementById('nav');
    return app&&nav?{app,nav}:null;
  }

  function navItems(nav){
    return Array.from(nav.querySelectorAll('[data-page]')).filter(el=>el instanceof HTMLElement);
  }

  function ensureSkipLink(){
    const main=document.querySelector('main');
    if(!main||document.querySelector('[data-bui-skip]'))return;
    if(!main.id)main.id='bui-main';
    const link=document.createElement('a');
    link.href='#'+main.id;
    link.className='bui-skip-link';
    link.dataset.buiSkip='1';
    link.textContent='Bỏ qua điều hướng';
    document.body.insertBefore(link,document.body.firstChild);
  }

  function mobileNav(){
    return document.querySelector('[data-bui-mobile-nav]');
  }

  function syncPrimaryNavigation(){
    const parts=primaryNav();
    if(!parts)return false;
    const {app,nav}=parts;
    const items=navItems(nav);
    const current=items.find(item=>item.classList.contains('active'))?.dataset.page||'home';

    nav.setAttribute('aria-label',nav.getAttribute('aria-label')||'Điều hướng chính');
    items.forEach(item=>{
      const active=item.dataset.page===current;
      if(active)item.setAttribute('aria-current','page');
      else item.removeAttribute('aria-current');
    });

    const mobile=mobileNav();
    if(mobile){
      mobile.hidden=app.classList.contains('hidden');
      mobile.querySelectorAll('[data-page]').forEach(item=>{
        const active=item.dataset.page===current;
        item.classList.toggle('active',active);
        if(active)item.setAttribute('aria-current','page');
        else item.removeAttribute('aria-current');
      });
    }
    root.dataset.baumanPrimaryPage=current;
    return true;
  }

  function installMobileNavigation(nav){
    if(mobileNav())return mobileNav();
    const mobile=document.createElement('nav');
    mobile.className='bui-mobile-nav';
    mobile.dataset.buiMobileNav='1';
    mobile.setAttribute('aria-label','Điều hướng chính trên di động');

    navItems(nav).slice(0,5).forEach(source=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.page=source.dataset.page||'';
      const label=(source.querySelector('span')?.textContent||source.textContent||source.dataset.page||'').trim();
      const icon=PAGE_ICON[source.dataset.page]||'•';
      button.innerHTML='<i aria-hidden="true">'+icon+'</i><span></span>';
      button.querySelector('span').textContent=label;
      button.setAttribute('aria-label',label);
      button.addEventListener('click',()=>source.click());
      mobile.appendChild(button);
    });

    document.body.appendChild(mobile);
    return mobile;
  }

  function installPrimaryNavigation(){
    const parts=primaryNav();
    if(!parts)return false;
    const {app,nav}=parts;
    const items=navItems(nav);
    if(!items.length)return false;

    nav.setAttribute('aria-label',nav.getAttribute('aria-label')||'Điều hướng chính');
    if(nav.dataset.buiKeyboardNav!=='1'){
      nav.dataset.buiKeyboardNav='1';
      nav.addEventListener('keydown',e=>{
        if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
        const controls=navItems(nav).filter(el=>!el.hasAttribute('disabled'));
        if(!controls.length)return;
        const current=controls.indexOf(document.activeElement);
        let next=current;
        if(e.key==='ArrowDown')next=current<0?0:(current+1)%controls.length;
        if(e.key==='ArrowUp')next=current<0?controls.length-1:(current-1+controls.length)%controls.length;
        if(e.key==='Home')next=0;
        if(e.key==='End')next=controls.length-1;
        e.preventDefault();
        controls[next]?.focus();
      });
    }

    installMobileNavigation(nav);
    navObserver?.disconnect();
    navObserver=new MutationObserver(syncPrimaryNavigation);
    navObserver.observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
    appObserver?.disconnect();
    appObserver=new MutationObserver(syncPrimaryNavigation);
    appObserver.observe(app,{attributes:true,attributeFilter:['class']});
    syncPrimaryNavigation();
    root.dataset.baumanNavigation='e5';
    return true;
  }

  function initNavigation(){
    ensureSkipLink();
    installPrimaryNavigation();
  }

  const boot=()=>{
    initNavigation();
    root.dataset.baumanUiReady='true';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.BAUMAN_UI={
    version:'future-v2-e5',
    setBusy(target,busy=true){
      const el=typeof target==='string'?document.querySelector(target):target;
      if(!el)return false;
      el.toggleAttribute('aria-busy',!!busy);
      el.dataset.uiBusy=busy?'true':'false';
      return true;
    },
    announce(message,kind='status'){
      let live=document.getElementById('baumanUiLive');
      if(!live){
        live=document.createElement('div');
        live.id='baumanUiLive';
        live.setAttribute('role',kind==='alert'?'alert':'status');
        live.setAttribute('aria-live',kind==='alert'?'assertive':'polite');
        Object.assign(live.style,{position:'fixed',width:'1px',height:'1px',overflow:'hidden',clip:'rect(0 0 0 0)',clipPath:'inset(50%)',whiteSpace:'nowrap'});
        document.body.appendChild(live);
      }
      live.textContent='';
      requestAnimationFrame(()=>{live.textContent=String(message||'')});
    },
    navigation:{
      install:installPrimaryNavigation,
      sync:syncPrimaryNavigation,
      current:()=>root.dataset.baumanPrimaryPage||null
    },
    selfCheck(){
      const parts=primaryNav();
      return{
        version:'future-v2-e5',
        ready:root.dataset.baumanUiReady==='true',
        inputMode:root.dataset.inputMode||'pointer',
        reducedMotion:root.dataset.reducedMotion==='true',
        navigationReady:root.dataset.baumanNavigation==='e5'||!parts,
        mobileNavReady:!parts||!!mobileNav(),
        dashboardReady:!document.getElementById('appRoot')||!!document.querySelector('[data-bui-dashboard="e6"]')||document.getElementById('appRoot')?.classList.contains('hidden'),
        primaryPage:root.dataset.baumanPrimaryPage||null,
        routeOwnership:false
      };
    }
  };
})();