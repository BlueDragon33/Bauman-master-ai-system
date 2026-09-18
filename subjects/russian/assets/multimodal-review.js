'use strict';
(function(root){
  const SCHEMA='RUSSIAN_MULTIMODAL_REVIEW_V1';
  const STORAGE_KEY='bauman_russian_multimodal_review_v1';
  const CORE_KEY=(root.SUBJECT_ADAPTER&&root.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const MODALITIES=['audio','visual','recognition','speaking','writing'];
  const RATINGS=['forgot','unsure','recalled'];
  const LABELS={
    audio:'Âm thanh',
    visual:'Hình ảnh',
    recognition:'Nhận diện',
    speaking:'Nói',
    writing:'Viết'
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const now=()=>new Date().toISOString();
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const empty=()=>({schema:SCHEMA,cards:{},updatedAt:null});
  let state={...empty(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  if(!state.cards||typeof state.cards!=='object')state.cards={};
  let selected='recognition';

  function readCore(){return parse(localStorage.getItem(CORE_KEY),{})}
  function indexNow(){return Math.max(0,Number(readCore().vocabIndex)||0)}
  function keyFor(index=indexNow()){return 'vocab:'+Math.max(0,Number(index)||0)}
  function save(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}

  function evidence(cardKey=keyFor(),modality=selected){
    const card=state.cards[cardKey]||{};
    const all=card.modalities||{};
    const old=all[modality]||{};
    return {
      attempts:Number(old.attempts||0),
      ratings:{
        forgot:Number(old.ratings?.forgot||0),
        unsure:Number(old.ratings?.unsure||0),
        recalled:Number(old.ratings?.recalled||0)
      },
      lastRating:old.lastRating||'',
      lastAt:old.lastAt||null
    };
  }

  function record(modality,rating,index=indexNow()){
    if(!MODALITIES.includes(modality)||!RATINGS.includes(rating))return false;
    const cardKey=keyFor(index),card=state.cards[cardKey]||{key:cardKey,index:Number(index)||0,modalities:{}};
    const ev=evidence(cardKey,modality);
    ev.attempts++;
    ev.ratings[rating]++;
    ev.lastRating=rating;
    ev.lastAt=now();
    state.cards[cardKey]={...card,modalities:{...(card.modalities||{}),[modality]:ev}};
    save();
    render();
    root.dispatchEvent(new CustomEvent('russian:multimodal-review',{detail:{cardKey,modality,rating,evidence:ev}}));
    return true;
  }

  function modalitySummary(modality){
    const ev=evidence(keyFor(),modality);
    return ev.attempts?ev.lastRating:'chưa có';
  }

  function html(){
    const cardKey=keyFor();
    return '<section class="ru-multimodal-review" data-multimodal-review="1">'+
      '<header><div><span>MULTIMODAL REVIEW · '+esc(cardKey)+'</span><h4>Ôn theo từng kỹ năng riêng</h4><p>Kết quả ở một kỹ năng không tự chứng minh kỹ năng khác và không đổi lịch SRS.</p></div></header>'+
      '<div class="ru-mm-tabs">'+MODALITIES.map(m=>'<button data-mm-modality="'+m+'" class="'+(selected===m?'active':'')+'"><b>'+esc(LABELS[m])+'</b><small>'+esc(modalitySummary(m))+'</small></button>').join('')+'</div>'+
      '<div class="ru-mm-rate"><span>Đánh giá lần '+esc(LABELS[selected])+':</span>'+
      '<button data-mm-rate="forgot">Quên</button><button data-mm-rate="unsure">Chưa chắc</button><button data-mm-rate="recalled">Nhớ được</button></div>'+
      '<footer><span>Evidence riêng</span><span>Không đổi dueAt</span><span>Không đổi mastery</span></footer>'+
      '</section>';
  }

  function mount(){
    const host=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
    if(!host){document.querySelector('[data-multimodal-review="1"]')?.remove();return;}
    if(document.querySelector('[data-multimodal-review="1"]'))return;
    const srs=document.getElementById('ruVocabSrs');
    if(srs)srs.insertAdjacentHTML('afterend',html());
    else host.insertAdjacentHTML('beforeend',html());
  }
  function render(){
    const existing=document.querySelector('[data-multimodal-review="1"]');
    if(existing)existing.outerHTML=html();else mount();
  }

  document.addEventListener('click',event=>{
    const mod=event.target.closest?.('[data-mm-modality]');
    if(mod){selected=mod.dataset.mmModality;render();return;}
    const rate=event.target.closest?.('[data-mm-rate]');
    if(rate){record(selected,rate.dataset.mmRate);return;}
  },true);

  document.addEventListener('DOMContentLoaded',()=>{
    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(mount).observe(view,{childList:true,subtree:true});
  });

  root.RussianMultimodalReview=Object.freeze({
    schema:SCHEMA,
    modalities:Object.freeze([...MODALITIES]),
    ratings:Object.freeze([...RATINGS]),
    get:()=>JSON.parse(JSON.stringify(state)),
    evidence,
    record
  });
})(window);
