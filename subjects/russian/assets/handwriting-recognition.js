'use strict';
(function(){
  const SCHEMA='RUSSIAN_HANDWRITING_RECOGNITION_V1';
  const PROBE='ДдЖжФфЯяШш';
  const CANDIDATES=['Segoe Script','Segoe Print','Comic Sans MS'];
  const FALLBACKS=['monospace','serif','sans-serif'];
  const clean=v=>String(v??'').trim();

  function measure(ctx,font){
    ctx.font='64px '+font;
    return ctx.measureText(PROBE).width;
  }

  function supportsCyrillicScriptFont(family){
    try{
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      if(!ctx)return false;
      return FALLBACKS.every(fallback=>{
        const baseline=measure(ctx,fallback);
        const candidate=measure(ctx,'"'+family+'",'+fallback);
        return Math.abs(candidate-baseline)>0.5;
      });
    }catch(_){return false;}
  }

  function detect(){
    const font=CANDIDATES.find(supportsCyrillicScriptFont)||'';
    const available=!!font;
    return {
      schema:SCHEMA,
      available,
      canScore:available,
      font:font||null,
      mode:available?'local-script-font':'reference-only',
      reason:available
        ?'Thiết bị có font chữ tay Cyrillic đủ khác fallback để dùng cho bài nhận diện.'
        :'Không xác nhận được font chữ tay Cyrillic tin cậy. Chỉ dùng khung nét tham khảo; không chấm nhận diện.'
    };
  }

  let capability=null,renderQueued=false;
  function getCapability(){
    if(!capability)capability=detect();
    return {...capability};
  }
  function bannerHtml(cap){
    const state=cap.canScore?'Sẵn sàng nhận diện':'Chế độ tham khảo';
    const cls=cap.canScore?'ready':'reference';
    const small=cap.font?('Font cục bộ: '+clean(cap.font)):'Không chấm đúng/sai theo hình chữ tay trên thiết bị này.';
    return '<section class="ru-handwriting-capability '+cls+'" data-ru-handwriting-capability="'+clean(cap.mode)+'"><div><span>HANDWRITING AUTHORITY</span><b>'+state+'</b><p>'+clean(cap.reason)+'</p></div><small>'+small+'</small></section>';
  }
  function render(){
    const host=document.querySelector('.writing-studio');
    const old=document.querySelector('.ru-handwriting-capability');
    if(!host){old?.remove();return;}
    const cap=getCapability();
    document.documentElement.dataset.ruHandwritingRecognition=cap.mode;
    if(old){old.outerHTML=bannerHtml(cap);return;}
    const hero=host.querySelector('.writing-hero');
    if(hero)hero.insertAdjacentHTML('afterend',bannerHtml(cap));
    else host.insertAdjacentHTML('afterbegin',bannerHtml(cap));
  }
  function schedule(){
    if(renderQueued)return;
    renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;render();});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    capability=detect();
    schedule();
    const view=document.getElementById('view');
    if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:true});
  });
  window.addEventListener('russian:learning-state',schedule);
  window.RussianHandwritingRecognition={
    schema:SCHEMA,
    detect,
    getCapability,
    canScore:()=>getCapability().canScore===true,
    refresh:()=>{capability=detect();schedule();return getCapability();}
  };
})();