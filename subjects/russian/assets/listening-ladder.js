'use strict';
(function(root){
  const SCHEMA='RUSSIAN_LISTENING_LADDER_V1';
  const STORAGE_KEY='bauman_russian_listening_ladder_v1';
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const DISTRACTORS=['это','сейчас','можно','пожалуйста','спасибо','сегодня','здесь','хорошо','потом','вместе'];

  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=()=>({schema:SCHEMA,lines:{},updatedAt:null});
  let state={...initial(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  let pendingFocused=null;

  function save(){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
  }

  function coreState(){return parse(localStorage.getItem(CORE_KEY),{})}

  function context(){
    const card=document.querySelector('.v1294-current-line');
    const room=document.querySelector('.v1294-speech-room');
    if(!card||!room)return null;
    const core=coreState();
    const dialogue=String(room.dataset.listeningDialogue||core.practiceDialogueId||'practice');
    const line=Number(room.dataset.listeningLine??core.practiceLineIndex??0)||0;
    const text=String(card.querySelector('.russian-line')?.textContent||'').trim();
    const heardCount=Number(core.practiceHeard?.[dialogue+'__'+line]||0);
    return {dialogue,line,text,heardCount,key:dialogue+'__'+line};
  }

  function lineEvidence(ctx=context()){
    if(!ctx)return null;
    const old=state.lines?.[ctx.key]||{};
    const next={
      normalPlays:Number(old.normalPlays||0),
      focusedPlays:Number(old.focusedPlays||0),
      slowRepairs:Number(old.slowRepairs||0),
      gistChecks:Number(old.gistChecks||0),
      detailAttempts:Number(old.detailAttempts||0),
      detailCorrect:Number(old.detailCorrect||0),
      lastAt:old.lastAt||null
    };
    state.lines={...(state.lines||{}),[ctx.key]:next};
    return next;
  }

  function record(kind){
    const ctx=context();if(!ctx)return;
    const ev=lineEvidence(ctx);if(!ev)return;
    if(kind==='normal')ev.normalPlays++;
    if(kind==='focused')ev.focusedPlays++;
    if(kind==='slow')ev.slowRepairs++;
    if(kind==='gist')ev.gistChecks++;
    ev.lastAt=new Date().toISOString();
    save();render();
  }

  function normalizedTokens(text){
    return String(text||'').toLowerCase().replace(/ё/g,'е').replace(/[.,!?;:()"«»„“”—–-]/g,' ').split(/\s+/).filter(x=>/^[а-я]+$/i.test(x)&&x.length>=3);
  }

  function detailTarget(ctx=context()){
    const tokens=normalizedTokens(ctx?.text||'');
    return tokens.find(x=>!DISTRACTORS.includes(x))||tokens[0]||'';
  }

  function detailChoices(ctx=context()){
    const target=detailTarget(ctx);if(!target)return [];
    const distractors=DISTRACTORS.filter(x=>x!==target).slice(0,2);
    return [target,...distractors];
  }

  function answerDetail(value){
    const ctx=context();if(!ctx||ctx.heardCount<1)return;
    const target=detailTarget(ctx);if(!target)return;
    const ev=lineEvidence(ctx);
    ev.detailAttempts++;
    const ok=String(value)===target;
    if(ok)ev.detailCorrect++;
    ev.lastDetail={answer:String(value),target,ok,at:Date.now()};
    ev.lastAt=new Date().toISOString();
    save();render();
  }

  function clickCore(action){
    const button=document.querySelector('[data-act="'+action+'"]');
    if(button&&!button.disabled){button.click();return true}
    return false;
  }

  function stage(ctx,ev){
    if(!ctx||ctx.heardCount<1)return 'normal_gist';
    if(Number(ev?.focusedPlays||0)<1)return 'focused_replay';
    if(Number(ev?.gistChecks||0)<1)return 'normal_gist';
    if(Number(ev?.detailAttempts||0)<1)return 'detail_check';
    return 'repair_slow';
  }

  function html(){
    const ctx=context();
    if(!ctx)return '<section class="ru-listening-ladder"><b>Chưa có câu nghe đang hoạt động.</b></section>';
    const ev=lineEvidence(ctx);
    const slowReady=ctx.heardCount>=2;
    const detailReady=ctx.heardCount>=1&&Boolean(detailTarget(ctx));
    const choices=detailReady?detailChoices(ctx):[];
    const currentStage=stage(ctx,ev);
    const last=ev.lastDetail;

    return '<section class="ru-listening-ladder" data-listening-ladder="1">'+
      '<header><div><span>LISTENING LADDER · '+esc(ctx.dialogue)+' · '+(ctx.line+1)+'</span><h3>Nghe thường → tập trung → sửa chậm → kiểm chi tiết</h3><p>Nghe chậm là công cụ sửa lỗi, không phải tốc độ mặc định.</p></div><div class="ru-listen-stage"><b>'+esc(currentStage)+'</b><small>'+ctx.heardCount+' lượt nghe thường</small></div></header>'+
      '<div class="ru-listen-actions">'+
      '<button data-listen-ladder="normal">1 · Nghe thường</button>'+
      '<button data-listen-ladder="gist" '+(ctx.heardCount<1?'disabled':'')+'>✓ Tôi bắt được ý chính</button>'+
      '<button data-listen-ladder="focused" '+(ctx.heardCount<1?'disabled':'')+'>2 · Nghe tập trung</button>'+
      '<button data-listen-ladder="slow" '+(!slowReady?'disabled':'')+'>3 · Nghe chậm để sửa</button>'+
      '</div>'+
      '<div class="ru-listen-evidence">'+
      '<span>Normal '+ctx.heardCount+'</span><span>Focused '+ev.focusedPlays+'</span><span>Slow repair '+ev.slowRepairs+'</span><span>Gist '+ev.gistChecks+'</span>'+
      '</div>'+
      '<div class="ru-listen-detail">'+
      '<b>4 · Chi tiết: từ nào có trong câu vừa nghe?</b>'+
      (choices.length?'<div>'+choices.map(x=>'<button data-listen-detail="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div>':'<p>Nghe câu trước để mở kiểm tra chi tiết.</p>')+
      (last?'<small class="'+(last.ok?'ok':'retry')+'">'+(last.ok?'✓ Đúng chi tiết':'Chưa đúng · nghe tập trung lại')+'</small>':'')+
      '</div>'+
      '<footer><span>Không dùng đáp án dịch nghĩa.</span><span>Không tự nâng mastery.</span><span>Slow mở sau 2 lượt nghe thường.</span></footer>'+
      '</section>';
  }

  function mount(){
    const room=document.querySelector('.v1294-speech-room');
    if(!room)return;
    if(document.querySelector('[data-listening-ladder="1"]'))return;
    const progress=room.querySelector('.v1294-speech-progress');
    if(progress)progress.insertAdjacentHTML('afterend',html());
    else room.insertAdjacentHTML('afterbegin',html());
  }

  function render(){
    const existing=document.querySelector('[data-listening-ladder="1"]');
    if(existing)existing.outerHTML=html();else mount();
  }

  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-listen-ladder]')?.dataset.listenLadder;
    if(action==='normal'){
      clickCore('speak-line');
      return;
    }
    if(action==='gist'){record('gist');return;}
    if(action==='focused'){
      const ctx=context();
      if(ctx){
        pendingFocused={key:ctx.key,at:Date.now()};
        setTimeout(()=>{if(pendingFocused?.key===ctx.key)pendingFocused=null},5000);
      }
      if(!clickCore('speak-line'))pendingFocused=null;
      return;
    }
    if(action==='slow'){
      const ctx=context();
      if(ctx&&ctx.heardCount>=2)clickCore('speak-line-slow');
      return;
    }

    const detail=event.target.closest?.('[data-listen-detail]');
    if(detail){answerDetail(detail.dataset.listenDetail);return;}

    if(event.target.closest?.('[data-act="next-line"],[data-act="prev-line"],[data-line]'))setTimeout(render,50);
  },true);

  root.addEventListener('russian:listening-playback-completed',event=>{
    const ctx=context();
    const detail=event?.detail||{};
    if(!ctx||detail.key!==ctx.key)return;
    if(detail.kind==='slow'){record('slow');return;}
    const focused=Boolean(pendingFocused&&pendingFocused.key===ctx.key&&Date.now()-Number(pendingFocused.at||0)<5000);
    if(focused)pendingFocused=null;
    record(focused?'focused':'normal');
  });

  document.addEventListener('DOMContentLoaded',()=>{
    mount();
    const view=document.getElementById('view');
    if(view)new MutationObserver(()=>mount()).observe(view,{childList:true,subtree:true});
  });

  root.RussianListeningLadder=Object.freeze({
    schema:SCHEMA,
    get:()=>JSON.parse(JSON.stringify(state)),
    context,
    render
  });
})(window);
