/* BAUMAN FUTURE INTERFACE SYSTEM · Runtime V1
   Lightweight cross-project behavior only: input modality, reduced-motion and
   semantic loading/error helpers. No route ownership and no subject-specific logic. */
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

  window.BAUMAN_UI={
    version:'future-v1',
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
    selfCheck(){
      return{
        version:'future-v1',
        ready:root.dataset.baumanUi==='future-v1',
        inputMode:root.dataset.inputMode||'pointer',
        reducedMotion:root.dataset.reducedMotion==='true',
        routeOwnership:false
      };
    }
  };
})();
