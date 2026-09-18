'use strict';
(function(root){
  const SCHEMA='RUSSIAN_GRAMMAR_PATTERN_COACH_V1';
  const STORAGE_KEY='bauman_russian_grammar_pattern_v1';
  const STAGES=['hear_pattern','speak_pattern','notice_contrast','tiny_rule','immediate_reuse'];
  const LABELS={hear_pattern:'1 · Nghe mẫu',speak_pattern:'2 · Nói theo mẫu',notice_contrast:'3 · Nhận tương phản',tiny_rule:'4 · Quy tắc cực ngắn',immediate_reuse:'5 · Dùng lại ngay'};
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({schema:SCHEMA,items:{},updatedAt:null});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let bridge=[];

  function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
  function host(){return document.querySelector('.grammar-main-card[data-grammar-pattern-id]')}
  function grammarId(){return host()?.dataset?.grammarPatternId||''}
  function entry(){const id=grammarId();return bridge.find(x=>x.grammar_id===id)||null}
  function ev(e=entry()){
    if(!e)return null;
    const old=state.items?.[e.grammar_id]||{};
    const row={heard:Number(old.heard||0),spoken:Number(old.spoken||0),contrast:Number(old.contrast||0),ruleOpened:Number(old.ruleOpened||0),reuseAttempts:Number(old.reuseAttempts||0),reuseDraft:String(old.reuseDraft||''),lastAt:old.lastAt||null};
    state.items={...(state.items||{}),[e.grammar_id]:row};
    return row;
  }
  function stageIndex(row=ev()){
    if(!row||row.heard<1)return 0;
    if(row.spoken<1)return 1;
    if(row.contrast<1)return 2;
    if(row.ruleOpened<1)return 3;
    return 4;
  }
  function speak(text){
    if(!text||!('speechSynthesis' in window))return false;
    const u=new SpeechSynthesisUtterance(String(text));u.lang='ru-RU';u.rate=.78;
    speechSynthesis.cancel();speechSynthesis.speak(u);return true;
  }
  function touch(field){
    const e=entry(),row=ev(e);if(!e||!row)return;
    row[field]=Number(row[field]||0)+1;row.lastAt=new Date().toISOString();save();render();
  }
  function hear(){const e=entry();if(e&&speak(e.heard_pattern))touch('heard')}
  function spoken(){const row=ev();if(row?.heard<1)return;touch('spoken')}
  function contrast(){const row=ev();if(row?.spoken<1)return;touch('contrast')}
  function rule(){const row=ev();if(row?.contrast<1)return;touch('ruleOpened')}
  function reuse(){
    const row=ev();if(!row||row.ruleOpened<1)return;
    if(!/[А-Яа-яЁё]/.test(row.reuseDraft||''))return;
    touch('reuseAttempts');
  }
  function updateDraft(value){const row=ev();if(!row)return;row.reuseDraft=String(value||'');save()}
  function syncLock(){
    const h=host();if(!h)return;
    const e=entry(),row=ev(e);
    h.classList.toggle('ru-grammar-pattern-locked',Boolean(e&&row&&row.ruleOpened<1));
  }
  function stepHtml(e,row,idx){
    const contrastText=(e.contrast||[]).map(x=>'<span lang="ru">'+esc(x)+'</span>').join('<i>↔</i>');
    if(idx===0)return '<button class="ru-grammar-main-action" data-grammar-pattern-action="hear">🔊 Nghe mẫu Nga</button><div class="ru-grammar-pattern-text" lang="ru">'+esc(e.heard_pattern)+'</div>';
    if(idx===1)return '<div class="ru-grammar-pattern-text" lang="ru">'+esc(e.heard_pattern)+'</div><button class="ru-grammar-main-action" data-grammar-pattern-action="spoken">Tôi đã nói theo mẫu</button>';
    if(idx===2)return '<div class="ru-grammar-contrast">'+contrastText+'</div><button class="ru-grammar-main-action" data-grammar-pattern-action="contrast">Tôi nhận ra điểm khác</button>';
    if(idx===3)return '<div class="ru-grammar-tiny-rule" lang="ru">'+esc(e.tiny_rule_ru)+'</div><button class="ru-grammar-main-action" data-grammar-pattern-action="rule">Mở phần luyện chi tiết</button>';
    return '<div class="ru-grammar-reuse-prompt" lang="ru">'+esc(e.reuse_prompt_ru)+'</div><input class="ru-grammar-reuse-input" lang="ru" data-grammar-pattern-input value="'+esc(row.reuseDraft)+'" placeholder="Напишите свой пример…"><button class="ru-grammar-main-action" data-grammar-pattern-action="reuse">Tôi đã tạo câu Nga</button>';
  }
  function html(){
    const e=entry();
    if(!e)return '<section class="ru-grammar-pattern" data-grammar-pattern="1"><b>Chưa có pattern bridge cho mục ngữ pháp này.</b><p>Giữ phần lý thuyết hiện có; không tự tạo pattern giả.</p></section>';
    const row=ev(e),idx=stageIndex(row);
    return '<section class="ru-grammar-pattern" data-grammar-pattern="1">'+
      '<header><div><span>GRAMMAR FROM PATTERNS · '+esc(e.grammar_id)+'</span><h3 lang="ru">'+esc(e.title_ru)+'</h3><p>Nghe → nói → nhận tương phản → quy tắc ngắn → dùng lại. Không dịch đáp án.</p></div><b>'+(idx+1)+'/5</b></header>'+
      '<div class="ru-grammar-pattern-stages">'+STAGES.map((s,i)=>'<span class="'+(i===idx?'active ':i<idx?'done ':'')+'">'+esc(LABELS[s])+'</span>').join('')+'</div>'+
      '<div class="ru-grammar-pattern-body">'+stepHtml(e,row,idx)+'</div>'+
      '<footer><span>Nghe '+row.heard+'</span><span>Nói '+row.spoken+'</span><span>Tương phản '+row.contrast+'</span><span>Dùng lại '+row.reuseAttempts+'</span><span>Không tự nâng mastery</span></footer>'+
      '</section>';
  }
  function mount(){
    const h=host();if(!h)return;
    const existing=h.querySelector('[data-grammar-pattern="1"]');
    if(!existing){
      const anchor=h.querySelector('.grammar-core-grid');
      if(anchor)anchor.insertAdjacentHTML('beforebegin',html());
      else h.insertAdjacentHTML('afterbegin',html());
    }
    syncLock();
  }
  function render(){
    const h=host();if(!h)return;
    const existing=h.querySelector('[data-grammar-pattern="1"]');
    if(existing)existing.outerHTML=html();else mount();
    syncLock();
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-grammar-pattern-action]')?.dataset.grammarPatternAction;
    if(action==='hear'){hear();return}
    if(action==='spoken'){spoken();return}
    if(action==='contrast'){contrast();return}
    if(action==='rule'){rule();return}
    if(action==='reuse'){reuse();return}
    if(event.target.closest?.('[data-grammar-index],[data-input="grammarLevel"],[data-input="grammarTrack"]'))setTimeout(render,60);
  },true);
  document.addEventListener('input',event=>{if(event.target.matches?.('[data-grammar-pattern-input]'))updateDraft(event.target.value)},true);
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('data/grammar-pattern-bridge.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('GRAMMAR_PATTERN_HTTP_'+response.status);
      const data=await response.json();bridge=Array.isArray(data?.entries)?data.entries:[];
    }catch(error){console.warn('Grammar pattern bridge unavailable:',error);bridge=[]}
    mount();
    const view=document.getElementById('view');if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });
  root.RussianGrammarPatternCoach=Object.freeze({schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),render});
})(window);
