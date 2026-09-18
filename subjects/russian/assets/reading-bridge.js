'use strict';
(function(root){
  const SCHEMA='RUSSIAN_READING_BRIDGE_V1';
  const STORAGE_KEY='bauman_russian_reading_bridge_v1';
  const STAGES=['letter_to_chunk','chunk_to_word','word_to_short_text'];
  const DATA_KEYS={letter_to_chunk:'chunks',chunk_to_word:'words',word_to_short_text:'short_texts'};
  const LABELS={letter_to_chunk:'1 · Cụm chữ',chunk_to_word:'2 · Từ thật',word_to_short_text:'3 · Câu ngắn'};
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({schema:SCHEMA,stage:'letter_to_chunk',index:0,items:{},updatedAt:null});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let data=null;

  function save(){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
  }
  function rows(stage=state.stage){return Array.isArray(data?.[DATA_KEYS[stage]])?data[DATA_KEYS[stage]]:[]}
  function current(){
    const list=rows();
    state.index=Math.max(0,Number(state.index)||0)%Math.max(1,list.length);
    return list[state.index]||null;
  }
  function itemEvidence(id){
    const old=state.items?.[id]||{};
    const row={
      attempts:Number(old.attempts||0),
      audioChecks:Number(old.audioChecks||0),
      segmentationReveals:Number(old.segmentationReveals||0),
      lastAt:old.lastAt||null
    };
    state.items={...(state.items||{}),[id]:row};
    return row;
  }
  function setStage(stage){
    if(!STAGES.includes(stage))return;
    state.stage=stage;state.index=0;save();render();
  }
  function markAttempt(){
    const item=current();if(!item)return;
    const ev=itemEvidence(item.id);ev.attempts++;ev.lastAt=new Date().toISOString();save();render();
  }
  function speak(text){
    if(!text||!('speechSynthesis' in window))return false;
    const u=new SpeechSynthesisUtterance(String(text));u.lang='ru-RU';u.rate=.78;
    speechSynthesis.cancel();speechSynthesis.speak(u);return true;
  }
  function audioCheck(){
    const item=current();if(!item)return;
    const ev=itemEvidence(item.id);
    if(ev.attempts<1)return;
    if(speak(item.text)){ev.audioChecks++;ev.lastAt=new Date().toISOString();save();render();}
  }
  function revealSegments(){
    const item=current();if(!item)return;
    const ev=itemEvidence(item.id);ev.segmentationReveals++;ev.lastAt=new Date().toISOString();save();render();
  }
  function next(){
    const list=rows();if(!list.length)return;
    state.index=(state.index+1)%list.length;save();render();
  }
  function previous(){
    const list=rows();if(!list.length)return;
    state.index=(state.index-1+list.length)%list.length;save();render();
  }
  function segmentText(item){
    const parts=Array.isArray(item?.segments)?item.segments:[];
    if(!parts.length)return '';
    return parts.map(x=>'<span lang="ru">'+esc(x)+'</span>').join('<i>·</i>');
  }
  function html(){
    const item=current();
    if(!item)return '<section class="ru-reading-bridge"><b>Chưa đọc được dữ liệu Reading Bridge.</b></section>';
    const ev=itemEvidence(item.id);
    const canListen=ev.attempts>0;
    const showSegments=ev.segmentationReveals>0;
    const visual=item.visual?'<div class="ru-reading-visual">'+esc(item.visual)+'</div>':'';
    return '<section class="ru-reading-bridge" data-reading-bridge="1">'+
      '<header><div><span>READING BRIDGE · '+esc(item.id)+'</span><h3>Chữ → cụm → từ thật → câu ngắn</h3><p>Đọc bằng Cyrillic trước; audio chỉ dùng để đối chiếu sau khi đã tự đọc thử.</p></div><div class="ru-reading-count"><b>'+(state.index+1)+'/'+rows().length+'</b><small>'+esc(LABELS[state.stage])+'</small></div></header>'+
      '<div class="ru-reading-stages">'+STAGES.map(x=>'<button data-reading-stage="'+x+'" class="'+(state.stage===x?'active':'')+'">'+esc(LABELS[x])+'</button>').join('')+'</div>'+
      '<div class="ru-reading-card">'+visual+'<div class="ru-reading-text" lang="ru">'+esc(item.text)+'</div>'+
      (showSegments?'<div class="ru-reading-segments">'+segmentText(item)+'</div>':'')+
      '<div class="ru-reading-actions"><button data-reading-action="attempt">Tôi đã đọc thử</button><button data-reading-action="listen" '+(canListen?'':'disabled')+'>🔊 Đối chiếu âm</button><button data-reading-action="segments">Phân đoạn chữ</button></div>'+
      '<div class="ru-reading-evidence"><span>Đọc thử '+ev.attempts+'</span><span>Đối chiếu âm '+ev.audioChecks+'</span><span>Phân đoạn '+ev.segmentationReveals+'</span></div>'+
      '</div>'+
      '<footer><button data-reading-nav="prev">← Trước</button><span>Không dùng đáp án dịch Việt/Anh · không tự nâng mastery</span><button data-reading-nav="next">Sau →</button></footer>'+
      '</section>';
  }
  function mount(){
    const studio=document.querySelector('#view .writing-studio');if(!studio)return;
    if(document.querySelector('[data-reading-bridge="1"]'))return;
    const motor=studio.querySelector('[data-handwriting-motor="1"]');
    const literacy=studio.querySelector('[data-cyrillic-literacy="print"]');
    if(motor)motor.insertAdjacentHTML('beforebegin',html());
    else if(literacy)literacy.insertAdjacentHTML('afterend',html());
    else studio.insertAdjacentHTML('afterbegin',html());
  }
  function render(){
    const existing=document.querySelector('[data-reading-bridge="1"]');
    if(existing)existing.outerHTML=html();else mount();
  }

  document.addEventListener('click',event=>{
    const stage=event.target.closest?.('[data-reading-stage]');
    if(stage){setStage(stage.dataset.readingStage);return;}
    const action=event.target.closest?.('[data-reading-action]')?.dataset.readingAction;
    if(action==='attempt'){markAttempt();return;}
    if(action==='listen'){audioCheck();return;}
    if(action==='segments'){revealSegments();return;}
    const nav=event.target.closest?.('[data-reading-nav]')?.dataset.readingNav;
    if(nav==='next'){next();return;}
    if(nav==='prev'){previous();return;}
  });

  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('data/reading-bridge.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('HTTP_'+response.status);
      data=await response.json();
      if(data?.schema!=='RUSSIAN_READING_BRIDGE_DATA_V1')throw new Error('READING_SCHEMA');
    }catch(error){
      console.warn('Reading bridge unavailable:',error);data=null;
    }
    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });

  root.RussianReadingBridge=Object.freeze({
    schema:SCHEMA,
    stages:Object.freeze([...STAGES]),
    get:()=>JSON.parse(JSON.stringify(state)),
    setStage,
    next,
    previous
  });
})(window);
