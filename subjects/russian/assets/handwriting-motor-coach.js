'use strict';
(function(root){
  const SCHEMA='RUSSIAN_HANDWRITING_MOTOR_PRACTICE_V1';
  const STORAGE_KEY='bauman_russian_handwriting_motor_v1';
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const STAGES=['trace','copy','connect','free'];
  const THRESHOLDS={trace:3,copy:3,connect:4,free:4};
  const STAGE_LABELS={
    trace:'1 · Tô theo nét',
    copy:'2 · Chép không mẫu mờ',
    connect:'3 · Nối chữ',
    free:'4 · Viết tự do'
  };
  const HELP={
    trace:'Theo mẫu mờ và hướng dẫn nét hiện có. Mục tiêu là nhớ hướng đi bút.',
    copy:'Tắt mẫu mờ, nhìn mẫu bên trái rồi chép lại trên canvas.',
    connect:'Luyện nối chữ thường liền mạch; ưu tiên điểm vào và điểm thoát.',
    free:'Không nhìn mẫu mờ. Viết lại chữ/cặp chữ từ trí nhớ rồi tự so với mẫu.'
  };

  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({schema:SCHEMA,stage:'trace',letters:{},updatedAt:null});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let rows=[];
  let pointerActive=false;

  function save(){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
  }

  function coreState(){
    return parse(localStorage.getItem(CORE_KEY),{});
  }

  function currentIndex(){
    if(!rows.length)return 0;
    return Math.max(0,Number(coreState().handwritingIndex)||0)%rows.length;
  }

  function currentRow(){
    return rows[currentIndex()]||null;
  }

  function nextRow(){
    if(!rows.length)return null;
    return rows[(currentIndex()+1)%rows.length]||null;
  }

  function letterOf(row){
    return (String(row?.print||row?.text||row?.letter||'').match(/[А-ЯЁ]/)||[])[0]||'?';
  }

  function lowerOf(row){
    const chars=String(row?.print||row?.text||row?.letter||'').match(/[а-яё]/g)||[];
    return chars[0]||letterOf(row).toLowerCase();
  }

  function keyFor(row=currentRow()){
    return letterOf(row);
  }

  function ensureLetter(letter){
    const previous=state.letters?.[letter]||{};
    const stages={};
    STAGES.forEach(stage=>{
      const old=previous[stage]||{};
      stages[stage]={
        attempts:Number(old.attempts||0),
        strokes:Number(old.strokes||0),
        lastAt:old.lastAt||null
      };
    });
    state.letters={...(state.letters||{}),[letter]:stages};
    return state.letters[letter];
  }

  function evidence(letter=keyFor(),stage=state.stage){
    return ensureLetter(letter)[stage];
  }

  function threshold(stage=state.stage){
    return Number(THRESHOLDS[stage]||1);
  }

  function completed(letter=keyFor(),stage=state.stage){
    return Number(evidence(letter,stage).strokes||0)>=threshold(stage);
  }

  function recordStroke(){
    const row=currentRow();
    if(!row)return;
    const letter=keyFor(row);
    const ev=evidence(letter,state.stage);
    ev.strokes=Number(ev.strokes||0)+1;
    ev.lastAt=new Date().toISOString();
    save();
    render();
  }

  function clickCore(selector){
    const button=document.querySelector(selector);
    if(button){button.click();return true}
    return false;
  }

  function syncGuide(wantGuide){
    const core=coreState();
    const hasGuide=core.handwritingShowGuide===true;
    if(hasGuide!==wantGuide)clickCore('[data-act="toggle-guide"]');
  }

  function syncCorePractice(stage){
    if(stage==='trace'){
      clickCore('[data-hand-practice="trace"]');
      setTimeout(()=>syncGuide(true),30);
    }else{
      clickCore('[data-hand-practice="free"]');
      setTimeout(()=>syncGuide(false),30);
    }
  }

  function setStage(stage){
    if(!STAGES.includes(stage))return;
    state.stage=stage;
    const row=currentRow();
    if(row){
      const ev=evidence(keyFor(row),stage);
      ev.attempts=Number(ev.attempts||0)+1;
      ev.lastAt=new Date().toISOString();
    }
    save();
    syncCorePractice(stage);
    setTimeout(render,80);
  }

  function connectionPair(){
    const a=currentRow(),b=nextRow();
    return (lowerOf(a)+lowerOf(b)).trim();
  }

  function stageSummary(letter){
    const stages=ensureLetter(letter);
    return STAGES.map(stage=>({
      stage,
      strokes:Number(stages[stage]?.strokes||0),
      threshold:threshold(stage),
      done:Number(stages[stage]?.strokes||0)>=threshold(stage)
    }));
  }

  function explicitSampleHtml(sample){
    const G=window.RussianCursiveGlyphs;
    if(!G?.render)return '<strong class="ru-hand-motor-script">'+esc(sample)+'</strong>';
    const chars=String(sample||'').match(/[А-ЯЁа-яё]/g)||[];
    if(!chars.length)return '<strong class="ru-hand-motor-script">'+esc(sample)+'</strong>';
    return '<strong class="ru-hand-motor-vector" aria-label="Mẫu vector viết tay">'+chars.map(ch=>G.render(ch,{variant:'lower',label:false})).join('<i aria-hidden="true">→</i>')+'</strong>';
  }

  function html(){
    const row=currentRow();
    if(!row)return '<section class="ru-hand-motor"><b>Chưa đọc được dữ liệu luyện chữ.</b></section>';
    const letter=keyFor(row);
    const ev=evidence(letter,state.stage);
    const done=completed(letter,state.stage);
    const progress=stageSummary(letter);
    const sample=state.stage==='connect'?connectionPair():lowerOf(row);

    return '<section class="ru-hand-motor" data-handwriting-motor="1">'+
      '<header><div><span>HANDWRITING MOTOR · '+esc(letter)+'</span><h3>Tô → chép → nối → viết tự do</h3><p>Dùng chung canvas hiện có. Evidence chỉ ghi thao tác luyện thật, không tự nâng trạng thái học.</p></div>'+
      '<div class="ru-hand-motor-score"><b>'+Number(ev.strokes||0)+'/'+threshold(state.stage)+'</b><small>nét bút ở bước này</small></div></header>'+
      '<div class="ru-hand-motor-stages">'+
      STAGES.map(stage=>'<button data-hand-motor-stage="'+stage+'" class="'+(state.stage===stage?'active ':'')+(completed(letter,stage)?'done':'')+'">'+esc(STAGE_LABELS[stage])+'</button>').join('')+
      '</div>'+
      '<div class="ru-hand-motor-task">'+
      '<div class="ru-hand-motor-sample"><small>Mẫu thao tác</small>'+explicitSampleHtml(sample)+'</div>'+
      '<div><b>'+esc(STAGE_LABELS[state.stage])+'</b><p>'+esc(HELP[state.stage])+'</p>'+
      '<div class="ru-hand-motor-progress">'+progress.map(x=>'<span class="'+(x.done?'done':'')+'">'+esc(STAGE_LABELS[x.stage])+' · '+x.strokes+'/'+x.threshold+'</span>').join('')+'</div></div>'+
      '</div>'+
      '<footer><span>'+(done?'✓ Đủ evidence vận động cho bước hiện tại':'Tiếp tục viết trên canvas để đủ evidence')+'</span><span>Attempts: '+Number(ev.attempts||0)+'</span><span>Chữ '+(currentIndex()+1)+'/'+rows.length+'</span></footer>'+
      '</section>';
  }

  function mount(){
    const studio=document.querySelector('#view .writing-studio');
    if(!studio)return;
    if(document.querySelector('[data-handwriting-motor="1"]'))return;
    const literacy=studio.querySelector('[data-cyrillic-literacy="print"]');
    if(literacy)literacy.insertAdjacentHTML('afterend',html());
    else studio.insertAdjacentHTML('afterbegin',html());
  }

  function render(){
    const existing=document.querySelector('[data-handwriting-motor="1"]');
    if(existing)existing.outerHTML=html();
    else mount();
  }

  document.addEventListener('click',event=>{
    const stageButton=event.target.closest?.('[data-hand-motor-stage]');
    if(stageButton){setStage(stageButton.dataset.handMotorStage);return;}

    if(event.target.closest?.('[data-act="prev-hand"],[data-act="next-hand"],[data-hand-index]')){
      setTimeout(render,80);
    }
  },true);

  document.addEventListener('pointerdown',event=>{
    if(event.target?.id==='writingCanvas')pointerActive=true;
  },true);

  document.addEventListener('pointerup',()=>{
    if(!pointerActive)return;
    pointerActive=false;
    recordStroke();
  },true);

  document.addEventListener('pointercancel',()=>{pointerActive=false},true);

  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('data/handwriting.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('HTTP_'+response.status);
      rows=(await response.json()).filter(x=>(x?.mode||'')==='alphabet');
      if(rows.length!==33)throw new Error('HANDWRITING_MOTOR_ROWS_'+rows.length);
    }catch(error){
      console.warn('Handwriting motor coach unavailable:',error);
      rows=[];
    }

    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });

  root.RussianHandwritingMotor=Object.freeze({
    schema:SCHEMA,
    stages:Object.freeze([...STAGES]),
    get:()=>JSON.parse(JSON.stringify(state)),
    setStage,
    completed:(letter,stage)=>completed(letter,stage)
  });
})(window);
