'use strict';
(function(root){
  const SCHEMA='RUSSIAN_CYRILLIC_PRINT_RECOGNITION_V1';
  const STORAGE_KEY='bauman_russian_cyrillic_literacy_v1';
  const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const CONFUSABLE={
    'Е':['Ё','Э','З'],'Ё':['Е','Э','Ю'],'И':['Й','П','Н'],'Й':['И','П','Н'],
    'Ш':['Щ','И','Ц'],'Щ':['Ш','Ц','Ч'],'Ь':['Ъ','Ы','В'],'Ъ':['Ь','Ы','Б'],
    'З':['Э','Е','В'],'Э':['З','Е','С'],'Н':['П','И','К'],'П':['Н','Г','Л'],
    'Ц':['Ч','Щ','Ш'],'Ч':['Ц','У','Щ'],'Р':['В','Ь','Я'],'С':['О','Э','Е']
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const initial=()=>({schema:SCHEMA,mode:'uppercase_to_lowercase',index:0,attempts:0,correct:0,lastResult:null,seen:{}});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})}, rows=[];
  const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function splitPrint(row){
    const chars=String(row?.print||row?.text||row?.letter||'').match(/[А-ЯЁа-яё]/g)||[];
    const upper=chars.find(x=>x===x.toUpperCase())||'';
    const lower=chars.find(x=>x===x.toLowerCase()&&x!==x.toUpperCase())||upper.toLowerCase();
    return {upper,lower};
  }
  function normalizedRows(data){
    const alphabet=(Array.isArray(data)?data:[]).filter(x=>(x?.mode||'')==='alphabet').map((row,i)=>({...row,...splitPrint(row),_index:i}));
    const map=new Map(alphabet.map(x=>[x.upper,x]));
    return [...LETTERS].map(letter=>map.get(letter)).filter(Boolean);
  }
  function distractorLetters(target){
    const explicit=CONFUSABLE[target]||[];
    const idx=LETTERS.indexOf(target);
    return [...new Set([...explicit,LETTERS[(idx+1)%33],LETTERS[(idx+4)%33],LETTERS[(idx+9)%33]])].filter(x=>x&&x!==target);
  }
  function item(){
    if(!rows.length)return null;
    state.index=Math.max(0,Number(state.index)||0)%rows.length;
    return rows[state.index];
  }
  function choices(row){
    const target=row.upper;
    const pool=[target,...distractorLetters(target)].slice(0,4);
    if(state.mode==='uppercase_to_lowercase')return pool.map(x=>({key:x,label:(rows.find(r=>r.upper===x)?.lower||x.toLowerCase())}));
    return pool.map(x=>({key:x,label:x}));
  }
  function prompt(row){
    if(state.mode==='lowercase_to_uppercase')return row.lower;
    if(state.mode==='confusable_discrimination')return row.upper;
    return row.upper;
  }
  function instruction(){
    if(state.mode==='lowercase_to_uppercase')return 'Chọn chữ IN HOA tương ứng';
    if(state.mode==='confusable_discrimination')return 'Nhận đúng mặt chữ, tránh nhóm dễ nhầm';
    return 'Chọn chữ in thường tương ứng';
  }
  function answerKey(row){return row.upper}
  function answer(letter){
    const row=item();if(!row)return;
    const ok=String(letter)===answerKey(row);
    state.attempts=Number(state.attempts||0)+1;
    if(ok)state.correct=Number(state.correct||0)+1;
    state.seen={...(state.seen||{}),[row.upper]:{attempts:Number(state.seen?.[row.upper]?.attempts||0)+1,correct:Number(state.seen?.[row.upper]?.correct||0)+(ok?1:0),lastAt:Date.now()}};
    state.lastResult={letter:row.upper,answer:String(letter),ok,at:Date.now()};
    if(ok)state.index=(state.index+1)%Math.max(1,rows.length);
    save();render();
  }
  function setMode(mode){
    if(!['uppercase_to_lowercase','lowercase_to_uppercase','confusable_discrimination'].includes(mode))return;
    state.mode=mode;state.lastResult=null;save();render();
  }
  function next(){state.index=(Number(state.index||0)+1)%Math.max(1,rows.length);state.lastResult=null;save();render();}
  function score(){return state.attempts?Math.round(Number(state.correct||0)*100/Number(state.attempts||1)):0}
  function html(){
    const row=item();
    if(!row)return '<section class="ru-cyrillic-literacy"><b>Chưa đọc được 33 mẫu chữ Cyrillic.</b></section>';
    const options=choices(row);
    const result=state.lastResult;
    return `<section class="ru-cyrillic-literacy" data-cyrillic-literacy="print">
      <header><div><span>CYRILLIC LITERACY · 33 CHỮ</span><h3>Nhận diện chữ in trước khi luyện chữ tay</h3><p>${instruction()}. Không dùng nghĩa tiếng Việt; đây là bài nhận mặt chữ.</p></div><div class="ru-cyrillic-score"><b>${score()}%</b><small>${Number(state.correct||0)}/${Number(state.attempts||0)} đúng</small></div></header>
      <div class="ru-cyrillic-modes">
        <button data-cyr-mode="uppercase_to_lowercase" class="${state.mode==='uppercase_to_lowercase'?'active':''}">HOA → thường</button>
        <button data-cyr-mode="lowercase_to_uppercase" class="${state.mode==='lowercase_to_uppercase'?'active':''}">thường → HOA</button>
        <button data-cyr-mode="confusable_discrimination" class="${state.mode==='confusable_discrimination'?'active':''}">Nhóm dễ nhầm</button>
      </div>
      <div class="ru-cyrillic-card">
        <div class="ru-cyrillic-prompt" aria-label="Chữ cần nhận diện">${esc(prompt(row))}</div>
        <div class="ru-cyrillic-options">${options.map(x=>`<button data-cyr-answer="${esc(x.key)}">${esc(x.label)}</button>`).join('')}</div>
        <div class="ru-cyrillic-result ${result?(result.ok?'ok':'retry'):''}">${result?(result.ok?'✓ Đúng mặt chữ':'Chưa đúng · nhìn lại hình dáng chữ và thử tiếp'):'Nhìn hình dáng, chưa cần học nghĩa từ.'}</div>
        <button class="ru-cyrillic-next" data-cyr-next="1">Bỏ qua / chữ tiếp →</button>
      </div>
      <footer><span>Chữ ${state.index+1}/${rows.length}</span><span>Đã chạm ${Object.keys(state.seen||{}).length}/33 chữ</span><span>Không tự nâng trạng thái bài học</span></footer>
    </section>`;
  }
  function mount(){
    const host=document.querySelector('#view .writing-studio');
    if(!host)return;
    if(document.querySelector('[data-cyrillic-literacy="print"]'))return;
    host.insertAdjacentHTML('afterbegin',html());
  }
  function render(){
    const existing=document.querySelector('[data-cyrillic-literacy="print"]');
    if(existing)existing.outerHTML=html();else mount();
  }
  document.addEventListener('click',event=>{
    const answerButton=event.target.closest?.('[data-cyr-answer]');
    if(answerButton){answer(answerButton.dataset.cyrAnswer);return;}
    const modeButton=event.target.closest?.('[data-cyr-mode]');
    if(modeButton){setMode(modeButton.dataset.cyrMode);return;}
    if(event.target.closest?.('[data-cyr-next]'))next();
  });
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('data/handwriting.json',{cache:'no-cache'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      rows=normalizedRows(await response.json());
      if(rows.length!==33)throw new Error(`CYRILLIC_PRINT_ROWS_${rows.length}`);
    }catch(error){console.warn('Cyrillic print recognition unavailable:',error);rows=[];}
    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });
  root.RussianCyrillicLiteracy=Object.freeze({schema:SCHEMA,letterCount:()=>rows.length,get:()=>JSON.parse(JSON.stringify(state)),setMode,next});
})(window);
