'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_speaking_coach_v1';
  const ACTIVE_KEY='ru_speaking_coach_active_v1';
  const SCHEMA='RUSSIAN_SPEAKING_COACH_V1';
  const STAGES=['imitation','shadowing','memory','roleplay','repair'];

  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,lines:{},updatedAt:null});

  function read(){
    const x=parse(localStorage.getItem(STORAGE_KEY),empty());
    return {...empty(),...x,lines:x&&typeof x.lines==='object'?x.lines:{}};
  }

  let state=read();
  let renderQueued=false;
  let notice='';
  let lastContextKey='';

  function write(){
    state.updatedAt=now();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian speaking coach save failed',e)}
    scheduleRender();
  }

  function scheduleRender(){
    if(renderQueued)return;
    renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;render();});
  }

  function context(){
    const core=readCore();
    const room=document.querySelector('.v1294-speech-room');
    const dialogueId=clean(room?.dataset?.listeningDialogue)||clean(core.practiceDialogueId);
    const lineIndex=Math.max(0,Number(room?.dataset?.listeningLine??core.practiceLineIndex)||0);
    return {
      active:core.view==='learning'&&core.learnTab==='practice',
      lessonId:clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.()),
      dialogueId,
      lineIndex
    };
  }

  function keyOf(c=context()){
    return c.lessonId&&c.dialogueId?`${c.lessonId}:${c.dialogueId}:${c.lineIndex}`:'';
  }

  function routeOf(c=context()){
    return {view:'learning',learnTab:'practice',lessonId:c.lessonId,practiceDialogueId:c.dialogueId,practiceLineIndex:c.lineIndex};
  }

  function heardCount(c=context()){
    if(!c?.dialogueId)return 0;
    const core=readCore();
    return Number(core.practiceHeard?.[`${c.dialogueId}__${c.lineIndex}`]||0);
  }

  function lineState(c=context()){
    const key=keyOf(c);if(!key)return null;
    const old=state.lines[key]||{};
    state.lines[key]={
      key,
      lessonId:c.lessonId,
      dialogueId:c.dialogueId,
      lineIndex:c.lineIndex,
      imitationAttempts:Number(old.imitationAttempts||0),
      shadowAttempts:Number(old.shadowAttempts||0),
      memoryAttempts:Number(old.memoryAttempts||0),
      roleplayAttempts:Number(old.roleplayAttempts||0),
      repairAttempts:Number(old.repairAttempts||0),
      selfOk:Number(old.selfOk||0),
      pronunciationFlags:Number(old.pronunciationFlags||0),
      abandoned:Number(old.abandoned||0),
      lastAt:old.lastAt||null,
      lastMode:old.lastMode||''
    };
    return state.lines[key];
  }

  function setNotice(v){notice=clean(v);scheduleRender();}
  function activeSession(){return parse(sessionStorage.getItem(ACTIVE_KEY),null)}

  function setActive(mode,c=context(),scope='line'){
    if(!keyOf(c))return;
    sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({
      key:keyOf(c),
      dialogueId:c.dialogueId,
      mode,
      scope,
      startedAt:now(),
      attempted:false,
      route:routeOf(c)
    }));
  }

  function sessionModeFor(c=context()){
    const s=activeSession();
    if(!s)return '';
    if(s.scope==='dialogue'&&s.dialogueId===c.dialogueId)return s.mode||'';
    return s.key===keyOf(c)?(s.mode||''):'';
  }

  function markSessionAttempt(){
    const s=activeSession();if(!s)return;
    sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({...s,attempted:true,lastAttemptAt:now()}));
  }

  function clearSession(){sessionStorage.removeItem(ACTIVE_KEY)}

  function bump(field,extra={}){
    const c=context(),row=lineState(c);if(!row)return;
    row[field]=Number(row[field]||0)+1;
    row.lastAt=now();
    Object.assign(row,extra);
    write();
    const old=window.RussianLearningFlow?.get?.()?.lessons?.[c.lessonId]?.steps?.speaking||{};
    window.RussianLearningFlow?.touch?.('speaking',{coachEvents:Number(old.coachEvents||0)+1,lastCoachAt:row.lastAt},c.lessonId);
  }

  function clickCore(action){
    const el=document.querySelector(`[data-act="${action}"]`);
    if(!el||el.disabled){
      setNotice('Điều khiển nói của câu hiện tại chưa sẵn sàng.');
      return false;
    }
    el.click();
    return true;
  }

  function canImitate(c=context()){
    return heardCount(c)>=1;
  }

  function canShadow(c=context(),row=lineState(c)){
    return heardCount(c)>=2&&Number(row?.imitationAttempts||0)>0;
  }

  function canMemory(c=context(),row=lineState(c)){
    return Number(row?.shadowAttempts||0)>0;
  }

  function canRoleplay(c=context(),row=lineState(c)){
    return Number(row?.memoryAttempts||0)>0;
  }

  function canRepair(c=context(),row=lineState(c)){
    return heardCount(c)>=2&&Number(row?.pronunciationFlags||0)>0;
  }

  function startImitation(){
    const c=context();
    if(!canImitate(c)){setNotice('Hãy hoàn thành ít nhất 1 lượt nghe thường ở Listening Ladder trước.');return;}
    setActive('imitation',c);
    setNotice('Nhại: nghe đã đủ điều kiện. Recorder đang mở cho câu hiện tại.');
    clickCore('record-line');
  }

  function startShadow(){
    const c=context(),row=lineState(c);
    if(!canShadow(c,row)){setNotice('Shadowing mở sau 2 lượt nghe thường và ít nhất 1 lượt nhại.');return;}
    setActive('shadowing',c);
    clickCore('speak-line');
    setNotice('Shadowing: bám nhịp mẫu ở tốc độ thường, sau đó bấm Ghi/Nói câu hiện tại.');
  }

  function startMemory(){
    const c=context(),row=lineState(c);
    if(!canMemory(c,row)){setNotice('Nói không nhìn mở sau ít nhất 1 lượt shadowing thật.');return;}
    setActive('memory',c);
    document.getElementById('view')?.classList.add('ru-speaking-memory-mode');
    setNotice('Câu mẫu đã được che. Bấm Ghi/Nói và nói lại từ trí nhớ.');
  }

  function revealSource(){
    document.getElementById('view')?.classList.remove('ru-speaking-memory-mode');
    const s=activeSession();
    if(s?.mode==='memory')clearSession();
    setNotice('Đã hiện lại câu mẫu.');
  }

  function startRoleplay(role){
    const c=context(),row=lineState(c);
    if(!canRoleplay(c,row)){setNotice('Role-play mở sau ít nhất 1 lượt nói không nhìn.');return;}
    setActive('roleplay',c,'dialogue');
    clickCore(role==='B'?'role-b':'role-a');
    setNotice(`Role-play vai ${role==='B'?'B':'A'}: chỉ các lần Ghi/Nói mới được tính là evidence.`);
  }

  function flagPronunciation(){
    const c=context(),key=keyOf(c);if(!key)return;
    bump('pronunciationFlags',{lastFlagAt:now(),lastMode:sessionModeFor(c)});
    window.RussianLearningState?.addReview?.(`pron:${key}`,'pronunciation_error',routeOf(c),`Phát âm cần ôn · ${c.lessonId} · câu ${c.lineIndex+1}`);
    setNotice('Đã đưa câu này vào Review Queue để sửa phát âm. Không thay đổi mastery.');
  }

  function startRepair(){
    const c=context(),row=lineState(c);
    if(!canRepair(c,row)){setNotice('Repair chỉ mở khi câu đã được đánh dấu phát âm cần sửa và đã nghe thường ít nhất 2 lượt.');return;}
    setActive('repair',c);
    clickCore('speak-line-slow');
    setNotice('Repair: nghe chậm để tách âm, sau đó bấm Ghi/Nói và nói lại câu.');
  }

  function clearPronunciationReview(){
    const c=context(),key=keyOf(c);if(!key)return;
    window.RussianLearningState?.removeReview?.(`pron:${key}`);
  }

  function abandonIfNeeded(nextContext=null){
    const s=activeSession();if(!s||s.attempted||!STAGES.includes(s.mode))return;
    const current=context();
    if(nextContext){
      if(s.scope==='dialogue'&&s.dialogueId===nextContext.dialogueId)return;
      if(s.scope!=='dialogue'&&s.key===keyOf(nextContext))return;
    }
    const c=s.route||current;
    const key=s.key||keyOf(current);
    const old=state.lines[key]||{key,lessonId:c.lessonId,dialogueId:c.practiceDialogueId||c.dialogueId,lineIndex:Number(c.practiceLineIndex??c.lineIndex??0)};
    state.lines[key]={...old,abandoned:Number(old.abandoned||0)+1,lastAbandonedAt:now(),lastMode:s.mode};
    write();
    window.RussianLearningState?.addReview?.(`speak-abandoned:${key}`,'abandoned',
      {view:'learning',learnTab:'practice',lessonId:old.lessonId,practiceDialogueId:old.dialogueId,practiceLineIndex:old.lineIndex},
      `Lượt luyện nói bỏ dở · ${old.lessonId||''} · câu ${Number(old.lineIndex||0)+1}`);
    clearSession();
  }

  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function stepCard(n,title,detail,actions,enabled=true,done=false){
    return `<article class="ru-speaking-step ${done?'done':''} ${enabled?'':'locked'}"><span>${n}</span><div><b>${esc(title)}</b><p>${esc(detail)}</p><div class="ru-speaking-actions">${actions}</div></div></article>`;
  }

  function stats(row){
    return `<div class="ru-speaking-stats">
      <span><b>${row.imitationAttempts}</b><small>nhại</small></span>
      <span><b>${row.shadowAttempts}</b><small>shadow</small></span>
      <span><b>${row.memoryAttempts}</b><small>không nhìn</small></span>
      <span><b>${row.roleplayAttempts}</b><small>role-play</small></span>
      <span><b>${row.repairAttempts}</b><small>repair</small></span>
    </div>`;
  }

  function render(){
    const c=context(),view=document.getElementById('view');if(!view)return;
    if(!c.active||!c.lessonId||!c.dialogueId){
      document.getElementById('ruSpeakingCoach')?.remove();
      view.classList.remove('ru-speaking-memory-mode');
      lastContextKey='';
      return;
    }

    const currentKey=keyOf(c);
    if(lastContextKey&&lastContextKey!==currentKey){
      abandonIfNeeded(c);
      const active=activeSession();
      if(!(active?.scope==='dialogue'&&active.dialogueId===c.dialogueId))view.classList.remove('ru-speaking-memory-mode');
    }
    lastContextKey=currentKey;

    const row=lineState(c);
    const active=activeSession();
    const memory=sessionModeFor(c)==='memory';
    const heard=heardCount(c);
    const imitateReady=canImitate(c);
    const shadowReady=canShadow(c,row);
    const memoryReady=canMemory(c,row);
    const roleReady=canRoleplay(c,row);
    const repairReady=canRepair(c,row);

    let panel=document.getElementById('ruSpeakingCoach');
    if(!panel){
      panel=document.createElement('section');
      panel.id='ruSpeakingCoach';
      panel.className='ru-speaking-coach';
      const ladder=document.querySelector('[data-listening-ladder="1"]');
      const flow=document.getElementById('ruLessonFlow');
      if(ladder)ladder.after(panel);else if(flow)flow.after(panel);else view.prepend(panel);
    }

    const imitation=stepCard('01','Nhại câu','Sau khi đã nghe thường, dùng recorder để lặp đúng âm và nhịp câu.',
      `<button type="button" data-ru-speaking="imitate" ${imitateReady?'':'disabled'}>Ghi & nhại câu</button>`,
      imitateReady,row.imitationAttempts>0);

    const shadow=stepCard('02','Shadowing','Bám tốc độ thường của câu mẫu; không dùng nghe chậm làm chế độ shadow mặc định.',
      `<button type="button" data-ru-speaking="shadow" ${shadowReady?'':'disabled'}>Bắt đầu shadowing</button>`,
      shadowReady,row.shadowAttempts>0);

    const memoryStep=stepCard('03','Nói không nhìn','Ẩn câu Nga và gợi ý, sau đó nói lại từ trí nhớ bằng recorder hiện có.',
      `<button type="button" data-ru-speaking="memory" ${memoryReady?'':'disabled'}>${memory?'Đang ẩn câu mẫu':'Nói không nhìn'}</button>${memory?'<button type="button" data-ru-speaking="reveal">Hiện câu mẫu</button>':''}`,
      memoryReady,row.memoryAttempts>0);

    const role=stepCard('04','Role-play','Chọn vai A/B. Chỉ lần Ghi/Nói của bạn mới được tính là role-play evidence.',
      `<button type="button" data-ru-speaking="role-a" ${roleReady?'':'disabled'}>Vai A</button><button type="button" data-ru-speaking="role-b" ${roleReady?'':'disabled'}>Vai B</button>`,
      roleReady,row.roleplayAttempts>0);

    const repair=stepCard('05','Pronunciation repair','Đánh dấu câu phát âm chưa ổn, nghe chậm để tách âm rồi ghi/nói lại.',
      `<button type="button" class="danger" data-ru-speaking="flag">Đánh dấu cần sửa</button><button type="button" data-ru-speaking="repair" ${repairReady?'':'disabled'}>Repair bằng nghe chậm</button>`,
      true,row.repairAttempts>0);

    panel.innerHTML=`<header><div><span>NHẠI · SHADOW · TRÍ NHỚ · ROLE-PLAY · REPAIR</span>
      <h3>${esc(c.lessonId)} · ${esc(c.dialogueId)} · câu ${c.lineIndex+1}</h3>
      <p>Listening Ladder chịu trách nhiệm phần nghe. Speaking Coach chỉ ghi bằng chứng nói thật qua recorder; không tự sinh mastery.</p>
      </div>${stats(row)}</header>
      <div class="ru-speaking-prereq">Đã nghe thường: <b>${heard}</b> lượt · Shadow cần 2 lượt nghe + 1 lượt nhại.</div>
      <div class="ru-speaking-grid">${imitation}${shadow}${memoryStep}${role}${repair}</div>
      ${notice?`<div class="ru-speaking-notice">${esc(notice)}</div>`:''}`;
  }

  document.addEventListener('click',event=>{
    const coach=event.target.closest?.('[data-ru-speaking]');
    if(coach){
      event.preventDefault();event.stopPropagation();
      const a=coach.dataset.ruSpeaking;
      if(a==='imitate')startImitation();
      else if(a==='shadow')startShadow();
      else if(a==='memory')startMemory();
      else if(a==='reveal')revealSource();
      else if(a==='role-a')startRoleplay('A');
      else if(a==='role-b')startRoleplay('B');
      else if(a==='flag')flagPronunciation();
      else if(a==='repair')startRepair();
      return;
    }

    const act=event.target.closest?.('[data-act]')?.dataset.act||'';
    const c=context();if(!c.active)return;

    if(act==='record-line'){
      setNotice('Đang chờ micro bắt đầu; attempt chỉ được tính khi recorder xác nhận onstart.');
    }else if(act==='mark-line-ok'){
      bump('selfOk',{lastSelfOkAt:now()});
      clearPronunciationReview();
      markSessionAttempt();
    }

    scheduleRender();
  },true);

  window.addEventListener('russian:speaking-recording-started',event=>{
    const c=context(),detail=event?.detail||{};
    if(!c.active||detail.dialogueId!==c.dialogueId||Number(detail.lineIndex)!==Number(c.lineIndex))return;
    if(STAGES.includes(sessionModeFor(c)||''))setNotice('Micro đã bắt đầu · đang chờ câu nói được nhận diện trước khi tính attempt.');
  });

  window.addEventListener('russian:speaking-recording-result',event=>{
    const c=context(),detail=event?.detail||{};
    if(!c.active||detail.dialogueId!==c.dialogueId||Number(detail.lineIndex)!==Number(c.lineIndex)||!clean(detail.transcript))return;
    const mode=sessionModeFor(c)||'free';
    if(!STAGES.includes(mode))return;
    markSessionAttempt();
    const evidence={lastMode:mode,lastAttemptAt:now(),recorderConfirmed:true,recognitionConfirmed:true,lastRecognitionScore:Number(detail.score)||0};
    if(mode==='imitation')bump('imitationAttempts',evidence);
    else if(mode==='shadowing')bump('shadowAttempts',evidence);
    else if(mode==='memory')bump('memoryAttempts',evidence);
    else if(mode==='roleplay')bump('roleplayAttempts',evidence);
    else if(mode==='repair')bump('repairAttempts',evidence);
    setNotice('Câu nói đã được nhận diện · attempt được ghi nhận.');
  });

  window.addEventListener('beforeunload',()=>abandonIfNeeded(null));
  document.addEventListener('DOMContentLoaded',()=>{
    scheduleRender();
    const view=document.getElementById('view');
    if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});
  });
  window.addEventListener('russian:learning-state',scheduleRender);

  window.RussianSpeakingCoach={
    schema:SCHEMA,
    stages:Object.freeze([...STAGES]),
    get:()=>JSON.parse(JSON.stringify(state)),
    context,
    flagPronunciation,
    startImitation,
    startShadow,
    startMemory,
    startRoleplay,
    startRepair
  };
})();
