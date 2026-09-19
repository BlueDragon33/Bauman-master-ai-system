'use strict';
(function(root){
  const SCHEMA='RUSSIAN_BROWSER_CAPABILITY_V1';
  const speechReady=()=>Boolean(root.speechSynthesis&&root.SpeechSynthesisUtterance);
  const online=()=>root.navigator?.onLine!==false;

  function ensureStatus(){
    const host=document.querySelector('.top-actions');
    if(!host)return null;
    let el=document.getElementById('ruBrowserCapability');
    if(!el){
      el=document.createElement('span');
      el.id='ruBrowserCapability';
      el.className='ru-browser-capability';
      el.setAttribute('role','status');
      el.setAttribute('aria-live','polite');
      host.insertBefore(el,document.getElementById('saveState')||null);
    }
    return el;
  }

  function paint(){
    const el=ensureStatus();if(!el)return;
    const speech=speechReady();
    el.dataset.speech=speech?'ready':'unavailable';
    el.dataset.network=online()?'online':'offline';
    el.textContent=speech?'Âm Nga: sẵn sàng':'Âm Nga: trình duyệt không hỗ trợ';
    el.title=speech
      ?'Speech Synthesis khả dụng cho phát âm tiếng Nga.'
      :'Trình duyệt này không có Speech Synthesis. Vẫn có thể học bằng chữ/scene và media đã đóng gói; hãy dùng trình duyệt hỗ trợ âm để nghe mẫu.';
  }

  function speak(text,rate=.82){
    const value=String(text??'').trim();
    if(!value)return false;
    if(!speechReady()){paint();return false;}
    try{
      const u=new root.SpeechSynthesisUtterance(value);
      u.lang='ru-RU';
      u.rate=Number(rate)||.82;
      root.speechSynthesis.cancel();
      root.speechSynthesis.speak(u);
      return true;
    }catch(error){
      console.warn('Russian speech unavailable',error);
      paint();
      return false;
    }
  }

  function snapshot(){
    return Object.freeze({schema:SCHEMA,speechSynthesis:speechReady(),online:online()});
  }

  document.addEventListener('DOMContentLoaded',paint);
  root.addEventListener?.('online',paint);
  root.addEventListener?.('offline',paint);
  root.RussianBrowserCapabilities=Object.freeze({schema:SCHEMA,speechReady,speak,snapshot,paint});
})(window);
