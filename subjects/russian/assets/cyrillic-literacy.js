'use strict';
(function(root){
  const SCHEMA='RUSSIAN_CYRILLIC_PRINT_RECOGNITION_V1';
  const STORAGE_KEY='bauman_russian_cyrillic_literacy_v1';
  const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const PRINT_MODES=['uppercase_to_lowercase','lowercase_to_uppercase','confusable_discrimination'];
  const CURSIVE_DIRECTIONS=['print_to_cursive','cursive_to_print'];
  const SOUND_MODES=['sound_to_letter','letter_to_sound'];
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
    soundMode:'sound_to_letter',
    index:0,
    attempts:0,
    correct:0,
    lastResult:null,
    seen:{},
    cursiveAttempts:0,
    cursiveCorrect:0,
    cursiveSeen:{},
    soundAttempts:0,
    soundCorrect:0,
    soundSeen:{},
    soundHeard:{}
  });

  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let rows=[];
  let soundRows=[];
  let soundByLetter=new Map();

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

  function normalizedSoundRows(data){
    const entries=Array.isArray(data?.entries)?data.entries:[];
    const map=new Map(entries.map(x=>[x.letter,x]));
    return [...LETTERS].map(letter=>map.get(letter)).filter(Boolean);
  }

  function item(){
    if(!rows.length)return null;
    state.index=Math.max(0,Number(state.index)||0)%rows.length;
    return rows[state.index];
  }

  function soundItem(row=item()){
    return row?soundByLetter.get(row.upper)||null:null;
  }

  function rowFor(letter){
    return rows.find(r=>r.upper===letter)||{upper:letter,lower:String(letter||'').toLowerCase()};
  }

  function soundFor(letter){
    return soundByLetter.get(letter)||{letter,lower:String(letter||'').toLowerCase(),name_ru:String(letter||''),primary_ipa:'?',variants:['?'],anchor:{display:'',speech:''},category:'unknown',behavior:'unknown'};
  }

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

    if(state.section==='sound'){
      return pool.map(candidate=>{
        const sound=soundFor(candidate.upper);
        return {
          key:candidate.upper,
          label:state.soundMode==='letter_to_sound'?sound.primary_ipa:printPair(candidate),
          cursive:false
        };
      });
    }

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
    if(state.section==='sound'){
      if(state.soundMode==='sound_to_letter')return '🎧';
      return printPair(row);
    }
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
    if(state.section==='sound'){
      return state.soundMode==='sound_to_letter'
        ?'Nghe tên chữ hoặc từ neo trước, sau đó chọn đúng mặt chữ'
        :'Nhìn chữ và chọn âm IPA chính; có thể nghe tên chữ và từ neo để đối chiếu';
    }
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

  function soundWasHeard(row){
    return Number(state.soundHeard?.[row?.upper]||0)>0;
  }

  function markSoundHeard(row,kind){
    if(!row)return;
    const key=row.upper;
    const previous=state.soundHeard?.[key]||0;
    state.soundHeard={...(state.soundHeard||{}),[key]:Number(previous)+1};
    state.lastSoundAction={letter:key,kind,at:Date.now()};
    save();
  }

  function speakText(text,rate=.82){
    if(window.RussianBrowserCapabilities?.speak)return window.RussianBrowserCapabilities.speak(text,rate);
    if(!text||!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return false;
    const u=new SpeechSynthesisUtterance(String(text));
    u.lang='ru-RU';
    u.rate=rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  }

  function answer(letter){
    const row=item();
    if(!row)return;

    if(state.section==='sound'&&state.soundMode==='sound_to_letter'&&!soundWasHeard(row))return;

    const ok=String(letter)===answerKey(row);
    const at=Date.now();

    if(state.section==='sound'){
      state.soundAttempts=Number(state.soundAttempts||0)+1;
      if(ok)state.soundCorrect=Number(state.soundCorrect||0)+1;
      const previous=state.soundSeen?.[row.upper]||{};
      state.soundSeen={
        ...(state.soundSeen||{}),
        [row.upper]:{
          attempts:Number(previous.attempts||0)+1,
          correct:Number(previous.correct||0)+(ok?1:0),
          lastAt:at
        }
      };
    }else if(state.section==='cursive'){
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
    if(!['print','cursive','sound'].includes(section))return;
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

  function setSoundMode(mode){
    if(!SOUND_MODES.includes(mode))return;
    state.soundMode=mode;
    state.section='sound';
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
    if(state.section==='sound'){
      const attempts=Number(state.soundAttempts||0);
      const correct=Number(state.soundCorrect||0);
      return {attempts,correct,seen:Object.keys(state.soundSeen||{}).length,score:attempts?Math.round(correct*100/attempts):0};
    }
    if(state.section==='cursive'){
      const attempts=Number(state.cursiveAttempts||0);
      const correct=Number(state.cursiveCorrect||0);
      return {attempts,correct,seen:Object.keys(state.cursiveSeen||{}).length,score:attempts?Math.round(correct*100/attempts):0};
    }
    const attempts=Number(state.attempts||0);
    const correct=Number(state.correct||0);
    return {attempts,correct,seen:Object.keys(state.seen||{}).length,score:attempts?Math.round(correct*100/attempts):0};
  }

  function optionHtml(option,disabled){
    const cls=option.cursive?' class="ru-cyr-cursive-option"':'';
    return '<button data-cyr-answer="'+esc(option.key)+'"'+cls+(disabled?' disabled':'')+'>'+esc(option.label)+'</button>';
  }

  function soundPanel(row){
    const sound=soundItem(row);
    if(!sound)return '<div class="ru-cyr-sound-missing">Chưa có dữ liệu âm cho chữ này.</div>';

    const heard=soundWasHeard(row);
    const variants=(sound.variants||[]).map(x=>'<span>'+esc(x)+'</span>').join('');
    const anchorVisible=heard||state.soundMode==='letter_to_sound';

    return '<div class="ru-cyr-sound-panel">'+
      '<div class="ru-cyr-sound-actions">'+
      '<button data-cyr-sound-action="letter-name">🔊 Tên chữ: '+esc(sound.name_ru)+'</button>'+
      '<button data-cyr-sound-action="anchor">🔊 Từ neo</button>'+
      '</div>'+
      '<div class="ru-cyr-sound-facts">'+
      '<article><small>IPA chính</small><b>'+esc(heard||state.soundMode==='letter_to_sound'?sound.primary_ipa:'•••')+'</b></article>'+
      '<article><small>Biến thể</small><div>'+(heard||state.soundMode==='letter_to_sound'?variants:'<span>nghe trước</span>')+'</div></article>'+
      '<article><small>Từ neo Nga</small><b>'+(anchorVisible?esc(sound.anchor?.display||''):'••••')+'</b></article>'+
      '</div>'+
      '<p class="ru-cyr-sound-rule">Mã ngữ âm: '+esc(sound.behavior||'')+'. Dấu Ъ/Ь không mang một âm độc lập; chúng thay đổi quan hệ âm/chữ trong từ.</p>'+
      '</div>';
  }

  function html(){
    const row=item();
    if(!row)return '<section class="ru-cyrillic-literacy"><b>Chưa đọc được 33 mẫu chữ Cyrillic.</b></section>';

    const options=choices(row);
    const result=state.lastResult;
    const stats=sectionStats();
    const heard=state.section!=='sound'||state.soundMode==='letter_to_sound'||soundWasHeard(row);
    const promptClass=promptIsCursive()?'ru-cyrillic-prompt ru-cyr-cursive':'ru-cyrillic-prompt';
    const title=state.section==='sound'
      ?'Nối mặt chữ với âm tiếng Nga'
      :(state.section==='cursive'?'Nhận diện chữ viết tay ↔ chữ in':'Nhận diện chữ in trước khi luyện chữ tay');

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

    const soundModes=
      '<div class="ru-cyrillic-modes">'+
      '<button data-cyr-sound-mode="sound_to_letter" class="'+(state.soundMode==='sound_to_letter'?'active':'')+'">Nghe → chọn chữ</button>'+
      '<button data-cyr-sound-mode="letter_to_sound" class="'+(state.soundMode==='letter_to_sound'?'active':'')+'">Nhìn chữ → chọn âm</button>'+
      '</div>';

    const modes=state.section==='sound'?soundModes:(state.section==='cursive'?cursiveModes:printModes);
    const resultText=result&&result.section===state.section
      ?(result.ok?'✓ Đúng':'Chưa đúng · thử lại')
      :(state.section==='sound'&&state.soundMode==='sound_to_letter'&&!heard
        ?'Bấm nghe trước rồi mới chọn chữ.'
        :'Nhìn/nghe tín hiệu chính, chưa cần dịch nghĩa.');

    const footerNote=state.section==='cursive'
      ?'Browser QA ở Turn 23 sẽ xác minh glyph viết tay khác chữ in'
      :(state.section==='sound'?'Âm là bằng chứng luyện tập riêng; không tự nâng trạng thái học':'Không tự nâng trạng thái bài học');

    return '<section class="ru-cyrillic-literacy" data-cyrillic-literacy="print">'+
      '<header><div><span>CYRILLIC LITERACY · 33 CHỮ</span><h3>'+esc(title)+'</h3><p>'+esc(instruction())+'. Không dùng nghĩa tiếng Việt làm cầu nối.</p></div>'+
      '<div class="ru-cyrillic-score"><b>'+stats.score+'%</b><small>'+stats.correct+'/'+stats.attempts+' đúng</small></div></header>'+
      '<div class="ru-cyrillic-sections">'+
      '<button data-cyr-section="print" class="'+(state.section==='print'?'active':'')+'">1 · Chữ in</button>'+
      '<button data-cyr-section="cursive" class="'+(state.section==='cursive'?'active':'')+'">2 · Chữ viết tay</button>'+
      '<button data-cyr-section="sound" class="'+(state.section==='sound'?'active':'')+'">3 · Âm</button>'+
      '</div>'+
      modes+
      '<div class="ru-cyrillic-card">'+
      '<div class="'+promptClass+'" aria-label="Tín hiệu cần nhận diện">'+esc(prompt(row))+'</div>'+
      (state.section==='sound'?soundPanel(row):'')+
      '<div class="ru-cyrillic-options">'+options.map(x=>optionHtml(x,!heard)).join('')+'</div>'+
      '<div class="ru-cyrillic-result '+(result&&result.section===state.section?(result.ok?'ok':'retry'):'')+'">'+esc(resultText)+'</div>'+
      '<button class="ru-cyrillic-next" data-cyr-next="1">Bỏ qua / chữ tiếp →</button>'+
      '</div>'+
      '<footer><span>Chữ '+(state.index+1)+'/'+rows.length+'</span><span>Đã luyện '+stats.seen+'/33 chữ ở tầng này</span><span>'+esc(footerNote)+'</span></footer>'+
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

  function handleSoundAction(kind){
    const row=item();
    const sound=soundItem(row);
    if(!row||!sound)return;

    if(kind==='letter-name'){
      markSoundHeard(row,'letter-name');
      speakText(sound.name_ru,.78);
    }else if(kind==='anchor'){
      markSoundHeard(row,'anchor');
      speakText(sound.anchor?.speech||'',.76);
    }
    render();
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

    const soundModeButton=event.target.closest?.('[data-cyr-sound-mode]');
    if(soundModeButton){setSoundMode(soundModeButton.dataset.cyrSoundMode);return;}

    const soundAction=event.target.closest?.('[data-cyr-sound-action]');
    if(soundAction){handleSoundAction(soundAction.dataset.cyrSoundAction);return;}

    if(event.target.closest?.('[data-cyr-next]'))next();
  });

  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const [handwritingResponse,soundResponse]=await Promise.all([
        fetch('data/handwriting.json',{cache:'no-cache'}),
        fetch('data/cyrillic-sound-map.json',{cache:'no-cache'})
      ]);
      if(!handwritingResponse.ok)throw new Error('HANDWRITING_HTTP_'+handwritingResponse.status);
      if(!soundResponse.ok)throw new Error('SOUND_MAP_HTTP_'+soundResponse.status);

      rows=normalizedRows(await handwritingResponse.json());
      soundRows=normalizedSoundRows(await soundResponse.json());
      soundByLetter=new Map(soundRows.map(x=>[x.letter,x]));

      if(rows.length!==33)throw new Error('CYRILLIC_ROWS_'+rows.length);
      if(soundRows.length!==33)throw new Error('CYRILLIC_SOUND_ROWS_'+soundRows.length);
    }catch(error){
      console.warn('Cyrillic literacy unavailable:',error);
      rows=[];
      soundRows=[];
      soundByLetter=new Map();
    }

    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });

  function openRepair(section,letter){
    if(!['print','cursive','sound'].includes(section))return false;
    const key=String(letter||'').toUpperCase();
    const idx=rows.findIndex(row=>row.upper===key);
    if(idx<0)return false;
    state.section=section;
    state.index=idx;
    state.lastResult=null;
    if(section==='sound')state.soundMode='sound_to_letter';
    if(section==='cursive')state.cursiveDirection='cursive_to_print';
    save();render();return true;
  }

  root.RussianCyrillicLiteracy=Object.freeze({
    schema:SCHEMA,
    letterCount:()=>rows.length,
    soundLetterCount:()=>soundRows.length,
    get:()=>JSON.parse(JSON.stringify(state)),
    setMode,
    setSection,
    setCursiveDirection,
    setSoundMode,
    next,
    openRepair
  });
})(window);
