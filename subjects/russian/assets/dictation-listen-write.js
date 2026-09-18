'use strict';
(function(root){
  const SCHEMA='RUSSIAN_DICTATION_LISTEN_WRITE_V1';
  const STORAGE_KEY='bauman_russian_dictation_v1';
  const STAGES=['sound_to_letter','sound_to_word','short_dictation'];
  const LABELS={sound_to_letter:'1 · Nghe → chữ',sound_to_word:'2 · Nghe → từ',short_dictation:'3 · Nghe → câu ngắn'};
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({schema:SCHEMA,stage:'sound_to_letter',index:0,items:{},draft:'',feedback:null,updatedAt:null});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let letters=[],words=[],texts=[];

  function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
  function rows(){
    if(state.stage==='sound_to_letter')return letters;
    if(state.stage==='sound_to_word')return words;
    return texts;
  }
  function current(){
    const list=rows();state.index=Math.max(0,Number(state.index)||0)%Math.max(1,list.length);return list[state.index]||null;
  }
  function itemKey(item=current()){return item?state.stage+':'+(item.id||item.letter||state.index):''}
  function evidence(item=current()){
    const key=itemKey(item),old=state.items?.[key]||{};
    const ev={listenCount:Number(old.listenCount||0),attempts:Number(old.attempts||0),correct:Number(old.correct||0),reveals:Number(old.reveals||0),lastAt:old.lastAt||null};
    state.items={...(state.items||{}),[key]:ev};return ev;
  }
  function expected(item=current()){
    if(!item)return '';
    if(state.stage==='sound_to_letter')return String(item.lower||item.letter||'').trim();
    return String(item.text||'').trim();
  }
  function audioText(item=current()){
    if(!item)return '';
    if(state.stage==='sound_to_letter')return String(item.name_ru||item.letter||'').trim();
    return String(item.text||'').trim();
  }
  function normalize(v){
    let s=String(v??'').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,' ');
    if(state.stage==='short_dictation')s=s.replace(/[.,!?;:«»„“”"()—–-]/g,'').replace(/\s+/g,' ').trim();
    return s;
  }
  function speak(text){
    if(!text||!('speechSynthesis' in window))return false;
    const u=new SpeechSynthesisUtterance(String(text));u.lang='ru-RU';u.rate=.76;speechSynthesis.cancel();speechSynthesis.speak(u);return true;
  }
  function listen(){
    const item=current();if(!item)return;
    if(speak(audioText(item))){const ev=evidence(item);ev.listenCount++;ev.lastAt=new Date().toISOString();save();render();}
  }
  function submit(){
    const item=current();if(!item)return;
    const answer=normalize(state.draft),target=normalize(expected(item));
    if(!answer)return;
    const ev=evidence(item);ev.attempts++;
    const ok=answer===target;if(ok)ev.correct++;
    ev.lastAt=new Date().toISOString();
    state.feedback={ok,answer,targetHidden:!ok&&ev.attempts<2,at:Date.now()};save();render();
  }
  function reveal(){
    const item=current();if(!item)return;
    const ev=evidence(item);if(ev.attempts<2)return;
    ev.reveals++;ev.lastAt=new Date().toISOString();state.feedback={ok:false,revealed:true,target:expected(item),at:Date.now()};save();render();
  }
  function setStage(stage){if(!STAGES.includes(stage))return;state.stage=stage;state.index=0;state.draft='';state.feedback=null;save();render();}
  function move(dir){const list=rows();if(!list.length)return;state.index=(state.index+dir+list.length)%list.length;state.draft='';state.feedback=null;save();render();}
  function promptLabel(){
    if(state.stage==='sound_to_letter')return 'Nghe tên chữ Nga rồi nhập đúng chữ Cyrillic.';
    if(state.stage==='sound_to_word')return 'Nghe từ Nga rồi viết lại bằng Cyrillic.';
    return 'Nghe câu ngắn rồi viết lại. Dấu câu không bắt buộc.';
  }
  function html(){
    const item=current();if(!item)return '<section class="ru-dictation"><b>Chưa đọc được dữ liệu dictation.</b></section>';
    const ev=evidence(item),canReveal=ev.attempts>=2,feedback=state.feedback;
    const status=feedback?(feedback.ok?'✓ Chính xác':feedback.revealed?'Đã mở đáp án để tự sửa':'Chưa đúng · nghe và thử lại'):'Chưa nộp lượt viết.';
    const answer=feedback?.revealed?'<div class="ru-dictation-answer" lang="ru">'+esc(feedback.target)+'</div>':'';
    return '<section class="ru-dictation" data-dictation="1">'+
      '<header><div><span>LISTEN → WRITE · '+esc(itemKey(item))+'</span><h3>Nghe trước, viết lại bằng Cyrillic</h3><p>'+esc(promptLabel())+'</p></div><div class="ru-dictation-count"><b>'+(state.index+1)+'/'+rows().length+'</b><small>'+esc(LABELS[state.stage])+'</small></div></header>'+
      '<div class="ru-dictation-stages">'+STAGES.map(x=>'<button data-dictation-stage="'+x+'" class="'+(state.stage===x?'active':'')+'">'+esc(LABELS[x])+'</button>').join('')+'</div>'+
      '<div class="ru-dictation-card">'+
        '<button class="ru-dictation-listen" data-dictation-action="listen">🔊 Nghe mẫu Nga</button>'+
        '<input class="ru-dictation-input" data-dictation-input="1" lang="ru" autocomplete="off" spellcheck="false" value="'+esc(state.draft||'')+'" placeholder="Viết Cyrillic tại đây…">'+
        '<div class="ru-dictation-actions"><button data-dictation-action="submit">Kiểm tra</button><button data-dictation-action="reveal" '+(canReveal?'':'disabled')+'>Hiện đáp án sau 2 lần thử</button></div>'+
        '<div class="ru-dictation-feedback '+(feedback?.ok?'ok':'')+'">'+esc(status)+'</div>'+answer+
        '<div class="ru-dictation-evidence"><span>Nghe '+ev.listenCount+'</span><span>Thử '+ev.attempts+'</span><span>Đúng '+ev.correct+'</span><span>Mở đáp án '+ev.reveals+'</span></div>'+
      '</div>'+
      '<footer><button data-dictation-nav="prev">← Trước</button><span>Không dịch Việt/Anh · không tự nâng mastery</span><button data-dictation-nav="next">Sau →</button></footer>'+
    '</section>';
  }
  function mount(){
    const studio=document.querySelector('#view .writing-studio');if(!studio)return;
    if(document.querySelector('[data-dictation="1"]'))return;
    const motor=studio.querySelector('[data-handwriting-motor="1"]');
    const reading=studio.querySelector('[data-reading-bridge="1"]');
    if(motor)motor.insertAdjacentHTML('beforebegin',html());
    else if(reading)reading.insertAdjacentHTML('afterend',html());
    else studio.insertAdjacentHTML('afterbegin',html());
  }
  function render(){const existing=document.querySelector('[data-dictation="1"]');if(existing)existing.outerHTML=html();else mount();}
  document.addEventListener('input',event=>{if(event.target.matches?.('[data-dictation-input]')){state.draft=event.target.value;save();}});
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches?.('[data-dictation-input]')){event.preventDefault();submit();}});
  document.addEventListener('click',event=>{
    const stage=event.target.closest?.('[data-dictation-stage]');if(stage){setStage(stage.dataset.dictationStage);return;}
    const action=event.target.closest?.('[data-dictation-action]')?.dataset.dictationAction;
    if(action==='listen'){listen();return;}if(action==='submit'){submit();return;}if(action==='reveal'){reveal();return;}
    const nav=event.target.closest?.('[data-dictation-nav]')?.dataset.dictationNav;if(nav==='next'){move(1);return;}if(nav==='prev'){move(-1);return;}
  });
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const [soundRes,readRes]=await Promise.all([fetch('data/cyrillic-sound-map.json',{cache:'no-cache'}),fetch('data/reading-bridge.json',{cache:'no-cache'})]);
      if(!soundRes.ok||!readRes.ok)throw new Error('DICTATION_SOURCE_HTTP');
      const sound=await soundRes.json(),reading=await readRes.json();
      letters=Array.isArray(sound?.entries)?sound.entries:[];
      words=Array.isArray(reading?.words)?reading.words:[];
      texts=Array.isArray(reading?.short_texts)?reading.short_texts:[];
      if(letters.length!==33||words.length!==16||texts.length!==8)throw new Error('DICTATION_SOURCE_COUNTS');
    }catch(error){console.warn('Dictation unavailable:',error);letters=[];words=[];texts=[];}
    mount();const view=document.getElementById('view');if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });
  root.RussianDictation=Object.freeze({schema:SCHEMA,stages:Object.freeze([...STAGES]),get:()=>JSON.parse(JSON.stringify(state)),setStage});
})(window);
