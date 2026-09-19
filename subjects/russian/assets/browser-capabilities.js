'use strict';
(function(root){
  const SCHEMA='RUSSIAN_BROWSER_CAPABILITY_V1';
  const RU_LANG='ru-RU';
  const speechReady=()=>Boolean(root.speechSynthesis&&root.SpeechSynthesisUtterance);
  const online=()=>root.navigator?.onLine!==false;
  const voiceList=()=>{try{return Array.from(root.speechSynthesis?.getVoices?.()||[])}catch(_){return []}};
  const isRussianVoice=v=>/^ru(?:-|$)/i.test(String(v?.lang||''));
  let activeSpeechToken=0;

  function russianVoices(){
    return voiceList().filter(isRussianVoice).sort((a,b)=>{
      const rank=v=>{
        const lang=String(v?.lang||'').toLowerCase();
        return (lang==='ru-ru'?8:lang.startsWith('ru-')?6:4)+(v?.localService?1:0)+(v?.default?.5:0);
      };
      return rank(b)-rank(a)||String(a?.name||'').localeCompare(String(b?.name||''),'ru');
    });
  }

  function preferredRussianVoice(){
    return russianVoices()[0]||null;
  }

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
    const voice=preferredRussianVoice();
    el.dataset.speech=speech?'ready':'unavailable';
    el.dataset.network=online()?'online':'offline';
    el.dataset.russianVoice=voice?'verified':'lang-fallback';
    if(!speech){
      el.textContent='Âm Nga: trình duyệt không hỗ trợ';
      el.title='Trình duyệt này không có Speech Synthesis. Vẫn có thể học bằng chữ/scene và media đã đóng gói; hãy dùng trình duyệt hỗ trợ âm để nghe mẫu.';
      return;
    }
    el.textContent=voice?'Âm Nga: '+String(voice.name||RU_LANG):'Âm Nga: ru-RU dự phòng';
    el.title=voice
      ?'Đang ưu tiên voice tiếng Nga '+String(voice.name||'')+' ('+String(voice.lang||RU_LANG)+').'
      :'Speech Synthesis khả dụng nhưng danh sách voice Nga chưa sẵn sàng; utterance vẫn yêu cầu ru-RU và bằng chứng nghe chỉ được ghi khi playback thực sự bắt đầu.';
  }

  function speak(text,rate=.82,hooks={}){
    const value=String(text??'').trim();
    if(!value)return false;
    if(!speechReady()){paint();return false;}
    try{
      const u=new root.SpeechSynthesisUtterance(value);
      const voice=preferredRussianVoice();
      const token=++activeSpeechToken;
      if(voice)u.voice=voice;
      u.lang=voice?.lang||RU_LANG;
      u.rate=Math.max(.45,Math.min(1.15,Number(rate)||.82));
      u.onstart=event=>{
        if(token!==activeSpeechToken)return;
        hooks?.onStart?.({
          event,
          lang:u.lang,
          voiceName:String(voice?.name||''),
          verifiedRussianVoice:Boolean(voice)
        });
      };
      u.onend=event=>{
        if(token!==activeSpeechToken)return;
        hooks?.onEnd?.({event,lang:u.lang,voiceName:String(voice?.name||''),verifiedRussianVoice:Boolean(voice)});
      };
      u.onerror=event=>{
        if(token!==activeSpeechToken)return;
        hooks?.onError?.({event,lang:u.lang,voiceName:String(voice?.name||'')});
        paint();
      };
      root.speechSynthesis.cancel();
      root.speechSynthesis.speak(u);
      return true;
    }catch(error){
      console.warn('Russian speech unavailable',error);
      hooks?.onError?.({error,lang:RU_LANG,voiceName:''});
      paint();
      return false;
    }
  }

  function snapshot(){
    const voice=preferredRussianVoice();
    return Object.freeze({
      schema:SCHEMA,
      speechSynthesis:speechReady(),
      online:online(),
      requestedLanguage:RU_LANG,
      russianVoiceAvailable:Boolean(voice),
      russianVoiceName:String(voice?.name||''),
      russianVoiceLang:String(voice?.lang||'')
    });
  }

  document.addEventListener('DOMContentLoaded',paint);
  root.addEventListener?.('online',paint);
  root.addEventListener?.('offline',paint);
  root.speechSynthesis?.addEventListener?.('voiceschanged',paint);
  root.RussianBrowserCapabilities=Object.freeze({
    schema:SCHEMA,
    speechReady,
    russianVoices,
    preferredRussianVoice,
    speak,
    snapshot,
    paint
  });
})(window);
