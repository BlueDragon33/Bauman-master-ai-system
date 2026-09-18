'use strict';
(function(root){
  const SCHEMA='RUSSIAN_CYRILLIC_PRINT_RECOGNITION_V1';
  const STORAGE_KEY='bauman_russian_cyrillic_literacy_v1';
  const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const PRINT_MODES=['uppercase_to_lowercase','lowercase_to_uppercase','confusable_discrimination'];
  const CURSIVE_DIRECTIONS=['print_to_cursive','cursive_to_print'];
  const CONFUSABLE={
    'Е':['Ё','Э','З'],'Ё':['Е','Э','Ю'],'И':['Й','П','Н'],'Й':['И','П','Н'],
    'Ш':['Щ','И','Ц'],'Щ':['Ш','Ц','Ч'],'Ь':['Ъ','Ы','В'],'Ъ':['Ь','Ы','Б'],
    'З':['Э','Е','В'],'Э':['З','Е','С'],'Н':['П','И','К'],'П':['Н','Г','Л'],
    'Ц':['Ч','Щ','Ш'],'Ч':['Ц','У','Щ'],'Р':['В','Ь','Я'],'С':['О','Э','Е']
  };

  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({
    schema:SCHEMA,
    section:'print',
    mode:'uppercase_to_lowercase',
    cursiveDirection:'print_to_cursive',
    index:0,
    attempts:0,
    correct:0,
    lastResult:null,
    seen:{},
    cursiveAttempts:0,
    cursiveCorrect:0,
    cursiveSeen:{}
  });

  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let rows=[];

  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}

  function splitPrint(row){
    const chars=String(row?.print||row?.text||row?.letter||'').match(/[А-ЯЁа-яё]/g)||[];
    const upper=chars.find(x=>x===x.toUpperCase())||'';
    const lower=chars.find(x=>x===x.toLowerCase()&&x!==x.toUpperCase())||upper.toLowerCase();
    return {upper,lower};
  }

  function normalizedRows(data){
    const alphabet=(Array.isArray(data)?data:[])
      .filter(x=>(x?.mode||'')==='alphabet')
      .map((row,i)=>({...row,...splitPrint(row),_index:i}));
    const map=new Map(alphabet.map(x=>[x.upper,x]));
    return [...LETTERS].map(letter=>map.get(letter)).filter(Boolean);
  }

  function item(){
    if(!rows.length)return null;
    state.index=Math.max(0,Number(state.index)||0)%rows.length;
    return rows[state.index];
  }

  function rowFor(letter){return rows.find(r=>r.upper===letter)||{upper:letter,lower:String(letter||'').toLowerCase()}}
  function printPair(row){return [row?.upper||'',row?.lower||''].filter(Boolean).join(' ')}
  function cursivePair(row){return String(row?.cursive||row?.handwriting||row?.write||row?.print||printPair(row)).trim()}

  function distractorLetters(target){
    const explicit=CONFUSABLE[target]||[];
    const idx=LETTERS.indexOf(target);
    return [...new Set([
      ...explicit,
      LETTERS[(idx+1+LETTERS.length)%LETTERS.length],
      LETTERS[(idx+4+LETTERS.length)%LETTERS.length],
      LETTERS[(idx+9+LETTERS.length)%LETTERS.length]
    ])].filter(x=>x&&x!==target);
  }

  function choiceRows(row){
    return [row.upper,...distractorLetters(row.upper)].slice(0,4).map(rowFor);
  }

  function choices(row){
    const pool=choiceRows(row);
    if(state.section==='cursive'){
      return pool.map(candidate=>({
        key:candidate.upper,
        label:state.cursiveDirection==='print_to_cursive'?cursivePair(candidate):printPair(candidate),
        cursive:state.cursiveDirection==='print_to_cursive'
      }));
    }
    if(state.mode==='uppercase_to_lowercase'){
      return pool.map(candidate=>({key:candidate.upper,label:candidate.lower,cursive:false}));
    }
    return pool.map(candidate=>({key:candidate.upper,label:candidate.upper,cursive:false}));
  }

  function prompt(row){
    if(state.section==='cursive'){
      return state.cursiveDirection==='cursive_to_print'?cursivePair(row):printPair(row);
    }
    if(state.mode==='lowercase_to_uppercase')return row.lower;
    return row.upper;
  }

  function promptIsCursive(){
    return state.section==='cursive'&&state.cursiveDirection==='cursive_to_print';
  }

  function instruction(){
    if(state.section==='cursive'){
      return state.cursiveDirection==='print_to_cursive'
        ?'Chọn mẫu chữ viết tay tương ứng với chữ in'
        :'Nhìn mẫu viết tay và chọn đúng chữ in';
    }
    if(state.mode==='lowercase_to_uppercase')return 'Chọn chữ IN HOA tương ứng';
    if(state.mode==='confusable_discrimination')return 'Nhận đúng mặt chữ, tránh nhóm dễ nhầm';
    return 'Chọn chữ in thường tương ứng';
  }

  function answerKey(row){return row.upper}

  function answer(letter){
    const row=item();
    if(!row)return;
    const ok=String(letter)===answerKey(row);
    const at=Date.now();

    if(state.section==='cursive'){
      state.cursiveAttempts=Number(state.cursiveAttempts||0)+1;
      if(ok)state.cursiveCorrect=Number(state.cursiveCorrect||0)+1;
      const previous=state.cursiveSeen?.[row.upper]||{};
      state.cursiveSeen={
        ...(state.cursiveSeen||{}),
        [row.upper]:{
          attempts:Number(previous.attempts||0)+1,
          correct:Number(previous.correct||0)+(ok?1:0),
          lastAt:at
        }
      };
    }else{
      state.attempts=Number(state.attempts||0)+1;
      if(ok)state.correct=Number(state.correct||0)+1;
      const previous=state.seen?.[row.upper]||{};
      state.seen={
        ...(state.seen||{}),
        [row.upper]:{
          attempts:Number(previous.attempts||0)+1,
          correct:Number(previous.correct||0)+(ok?1:0),
          lastAt:at
        }
      };
    }

    state.lastResult={letter:row.upper,answer:String(letter),ok,section:state.section,at};
    if(ok)state.index=(state.index+1)%Math.max(1,rows.length);
    save();
    render();
  }

  function setMode(mode){
    if(!PRINT_MODES.includes(mode))return;
    state.mode=mode;
    state.section='print';
    state.lastResult=null;
    save();
    render();
  }

  function setSection(section){
    if(!['print','cursive'].includes(section))return;
    state.section=section;
    state.lastResult=null;
    save();
    render();
  }

  function setCursiveDirection(direction){
    if(!CURSIVE_DIRECTIONS.includes(direction))return;
    state.cursiveDirection=direction;
    state.section='cursive';
    state.lastResult=null;
    save();
    render();
  }

  function next(){
    state.index=(Number(state.index||0)+1)%Math.max(1,rows.length);
    state.lastResult=null;
    save();
    render();
  }

  function sectionStats(){
    if(state.section==='cursive'){
      const attempts=Number(state.cursiveAttempts||0);
      const correct=Number(state.cursiveCorrect||0);
      return {attempts,correct,seen:Object.keys(state.cursiveSeen||{}).length,score:attempts?Math.round(correct*100/attempts):0};
    }
    const attempts=Number(state.attempts||0);
    const correct=Number(state.correct||0);
    return {attempts,correct,seen:Object.keys(state.seen||{}).length,score:attempts?Math.round(correct*100/attempts):0};
  }

  function optionHtml(option){
    const cls=option.cursive?' class="ru-cyr-cursive-option"':'';
    return '<button data-cyr-answer="'+esc(option.key)+'"'+cls+'>'+esc(option.label)+'</button>';
  }

  function html(){
    const row=item();
    if(!row)return '<section class="ru-cyrillic-literacy"><b>Chưa đọc được 33 mẫu chữ Cyrillic.</b></section>';

    const options=choices(row);
    const result=state.lastResult;
    const stats=sectionStats();
    const promptClass=promptIsCursive()?'ru-cyrillic-prompt ru-cyr-cursive':'ru-cyrillic-prompt';
    const title=state.section==='cursive'?'Nhận diện chữ viết tay ↔ chữ in':'Nhận diện chữ in trước khi luyện chữ tay';

    const printModes=
      '<div class="ru-cyrillic-modes">'+
      '<button data-cyr-mode="uppercase_to_lowercase" class="'+(state.mode==='uppercase_to_lowercase'?'active':'')+'">HOA → thường</button>'+
      '<button data-cyr-mode="lowercase_to_uppercase" class="'+(state.mode==='lowercase_to_uppercase'?'active':'')+'">thường → HOA</button>'+
      '<button data-cyr-mode="confusable_discrimination" class="'+(state.mode==='confusable_discrimination'?'active':'')+'">Nhóm dễ nhầm</button>'+
      '</div>';

    const cursiveModes=
      '<div class="ru-cyrillic-modes">'+
      '<button data-cyr-cursive-direction="print_to_cursive" class="'+(state.cursiveDirection==='print_to_cursive'?'active':'')+'">In → viết tay</button>'+
      '<button data-cyr-cursive-direction="cursive_to_print" class="'+(state.cursiveDirection==='cursive_to_print'?'active':'')+'">Viết tay → in</button>'+
      '</div>';

    const resultText=result
      ?(result.ok?'✓ Đúng mặt chữ':'Chưa đúng · nhìn lại hình dáng chữ và thử tiếp')
      :'Nhìn hình dáng, chưa cần học nghĩa từ.';

    const footerNote=state.section==='cursive'
      ?'Mẫu viết tay dùng font stack chuyên biệt; browser QA sẽ xác minh glyph khác chữ in'
      :'Không tự nâng trạng thái bài học';

    return '<section class="ru-cyrillic-literacy" data-cyrillic-literacy="print">'+
      '<header><div><span>CYRILLIC LITERACY · 33 CHỮ</span><h3>'+esc(title)+'</h3><p>'+esc(instruction())+'. Không dùng nghĩa tiếng Việt; đây là bài nhận mặt chữ.</p></div>'+
      '<div class="ru-cyrillic-score"><b>'+stats.score+'%</b><small>'+stats.correct+'/'+stats.attempts+' đúng</small></div></header>'+
      '<div class="ru-cyrillic-sections">'+
      '<button data-cyr-section="print" class="'+(state.section==='print'?'active':'')+'">1 · Chữ in</button>'+
      '<button data-cyr-section="cursive" class="'+(state.section==='cursive'?'active':'')+'">2 · Chữ viết tay</button>'+
      '</div>'+
      (state.section==='print'?printModes:cursiveModes)+
      '<div class="ru-cyrillic-card">'+
      '<div class="'+promptClass+'" aria-label="Chữ cần nhận diện">'+esc(prompt(row))+'</div>'+
      '<div class="ru-cyrillic-options">'+options.map(optionHtml).join('')+'</div>'+
      '<div class="ru-cyrillic-result '+(result?(result.ok?'ok':'retry'):'')+'">'+esc(resultText)+'</div>'+
      '<button class="ru-cyrillic-next" data-cyr-next="1">Bỏ qua / chữ tiếp →</button>'+
      '</div>'+
      '<footer><span>Chữ '+(state.index+1)+'/'+rows.length+'</span><span>Đã chạm '+stats.seen+'/33 chữ</span><span>'+esc(footerNote)+'</span></footer>'+
      '</section>';
  }

  function mount(){
    const host=document.querySelector('#view .writing-studio');
    if(!host)return;
    if(document.querySelector('[data-cyrillic-literacy="print"]'))return;
    host.insertAdjacentHTML('afterbegin',html());
  }

  function render(){
    const existing=document.querySelector('[data-cyrillic-literacy="print"]');
    if(existing)existing.outerHTML=html();
    else mount();
  }

  document.addEventListener('click',event=>{
    const answerButton=event.target.closest?.('[data-cyr-answer]');
    if(answerButton){answer(answerButton.dataset.cyrAnswer);return;}

    const modeButton=event.target.closest?.('[data-cyr-mode]');
    if(modeButton){setMode(modeButton.dataset.cyrMode);return;}

    const sectionButton=event.target.closest?.('[data-cyr-section]');
    if(sectionButton){setSection(sectionButton.dataset.cyrSection);return;}

    const directionButton=event.target.closest?.('[data-cyr-cursive-direction]');
    if(directionButton){setCursiveDirection(directionButton.dataset.cyrCursiveDirection);return;}

    if(event.target.closest?.('[data-cyr-next]'))next();
  });

  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('data/handwriting.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      rows=normalizedRows(await response.json());
      if(rows.length!==33)throw new Error('CYRILLIC_ROWS_'+rows.length);
    }catch(error){
      console.warn('Cyrillic literacy unavailable:',error);
      rows=[];
    }

    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });

  root.RussianCyrillicLiteracy=Object.freeze({
    schema:SCHEMA,
    letterCount:()=>rows.length,
    get:()=>JSON.parse(JSON.stringify(state)),
    setMode,
    setSection,
    setCursiveDirection,
    next
  });
})(window);
