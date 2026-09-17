'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_speaking_coach_v1';
  const ACTIVE_KEY='ru_speaking_coach_active_v1';
  const SCHEMA='RUSSIAN_SPEAKING_COACH_V1';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,lines:{},updatedAt:null});
  function read(){const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,lines:x&&typeof x.lines==='object'?x.lines:{}};}
  let state=read();
  let renderQueued=false;
  let notice='';
  let lastContextKey='';
  function write(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian speaking coach save failed',e)};scheduleRender();}
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  function context(){
    const core=readCore();
    return {
      active:core.view==='learning'&&core.learnTab==='practice',
      lessonId:clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.()),
      dialogueId:clean(core.practiceDialogueId),
      lineIndex:Math.max(0,Number(core.practiceLineIndex)||0)
    };
  }
  function keyOf(c=context()){return c.lessonId&&c.dialogueId?`${c.lessonId}:${c.dialogueId}:${c.lineIndex}`:'';}
  function routeOf(c=context()){return {view:'learning',learnTab:'practice',lessonId:c.lessonId,practiceDialogueId:c.dialogueId,practiceLineIndex:c.lineIndex};}
  function lineState(c=context()){
    const key=keyOf(c);if(!key)return null;
    const old=state.lines[key]||{};
    state.lines[key]={key,lessonId:c.lessonId,dialogueId:c.dialogueId,lineIndex:c.lineIndex,listens:Number(old.listens||0),slowListens:Number(old.slowListens||0),shadowAttempts:Number(old.shadowAttempts||0),memoryAttempts:Number(old.memoryAttempts||0),freeAttempts:Number(old.freeAttempts||0),roleplays:Number(old.roleplays||0),selfOk:Number(old.selfOk||0),pronunciationFlags:Number(old.pronunciationFlags||0),abandoned:Number(old.abandoned||0),lastAt:old.lastAt||null,lastMode:old.lastMode||''};
    return state.lines[key];
  }
  function setNotice(v){notice=clean(v);scheduleRender();}
  function activeSession(){return parse(sessionStorage.getItem(ACTIVE_KEY),null);}
  function setActive(mode,c=context()){
    if(!keyOf(c))return;
    sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({key:keyOf(c),mode,startedAt:now(),attempted:false,route:routeOf(c)}));
  }
  function markSessionAttempt(){const s=activeSession();if(!s)return;sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({...s,attempted:true,lastAttemptAt:now()}));}
  function clearSession(){sessionStorage.removeItem(ACTIVE_KEY);}
  function bump(field,extra={}){
    const c=context(), row=lineState(c);if(!row)return;
    row[field]=Number(row[field]||0)+1;row.lastAt=now();Object.assign(row,extra);write();
    const old=window.RussianLearningFlow?.get?.()?.lessons?.[c.lessonId]?.steps?.speaking||{};
    window.RussianLearningFlow?.touch?.('speaking',{coachEvents:Number(old.coachEvents||0)+1,lastCoachAt:row.lastAt},c.lessonId);
  }
  function clickCore(action){const el=document.querySelector(`[data-act="${action}"]`);if(!el){setNotice('Điều khiển luyện nói của câu hiện tại chưa sẵn sàng.');return false;}el.click();return true;}
  function startListening(slow=false){setActive(slow?'listen_slow':'listen',context());if(clickCore(slow?'speak-line-slow':'speak-line'))setNotice(slow?'Đang nghe chậm. Tập bắt nhịp, trọng âm và cụm âm.':'Đang nghe mẫu ở tốc độ thường. Chưa cần nói ngay.');}
  function startShadow(){setActive('shadow',context());if(clickCore('speak-line-slow')||clickCore('speak-line'))setNotice('Shadowing đã bắt đầu: nghe xong hãy dùng nút ghi/nói của câu hiện tại và nhại sát nhịp mẫu.');}
  function startMemory(){setActive('memory',context());document.getElementById('view')?.classList.add('ru-speaking-memory-mode');setNotice('Chế độ nói không nhìn đang bật. Nói bằng nút ghi/nói hiện có; bấm “Hiện câu mẫu” khi cần.');}
  function revealSource(){document.getElementById('view')?.classList.remove('ru-speaking-memory-mode');const s=activeSession();if(s?.mode==='memory')clearSession();setNotice('Đã hiện lại câu mẫu.');}
  function startRoleplay(){setActive('roleplay',context());if(clickCore('speak-dialogue'))setNotice('Đã mở lượt role-play của hội thoại hiện tại.');}
  function flagPronunciation(){
    const c=context(), key=keyOf(c);if(!key)return;
    bump('pronunciationFlags',{lastFlagAt:now(),lastMode:activeSession()?.mode||''});
    window.RussianLearningState?.addReview?.(`pron:${key}`,'pronunciation_error',routeOf(c),`Phát âm cần ôn · ${c.lessonId} · câu ${c.lineIndex+1}`);
    setNotice('Đã đưa đúng câu này vào Review Queue để luyện phát âm lại. Không thay đổi mastery.');
  }
  function clearPronunciationReview(){
    const c=context(), key=keyOf(c);if(!key)return;
    window.RussianLearningState?.removeReview?.(`pron:${key}`);
  }
  function abandonIfNeeded(nextKey=''){
    const s=activeSession();if(!s||s.attempted||!['shadow','memory','roleplay'].includes(s.mode))return;
    if(nextKey&&s.key===nextKey)return;
    const parts=String(s.key).split(':');const lineIndex=Number(parts.pop()||0), dialogueId=parts.pop()||'', lessonId=parts.join(':');
    const key=s.key, old=state.lines[key]||{key,lessonId,dialogueId,lineIndex};
    state.lines[key]={...old,abandoned:Number(old.abandoned||0)+1,lastAbandonedAt:now(),lastMode:s.mode};write();
    window.RussianLearningState?.addReview?.(`speak-abandoned:${key}`,'abandoned',{view:'learning',learnTab:'practice',lessonId,practiceDialogueId:dialogueId,practiceLineIndex:lineIndex},`Lượt luyện nói bỏ dở · ${lessonId} · câu ${lineIndex+1}`);
    clearSession();
  }
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function stepCard(n,title,detail,actions){return `<article class="ru-speaking-step"><span>${n}</span><div><b>${esc(title)}</b><p>${esc(detail)}</p><div class="ru-speaking-actions">${actions}</div></div></article>`;}
  function stats(row){return `<div class="ru-speaking-stats"><span><b>${row.listens+row.slowListens}</b><small>lượt nghe</small></span><span><b>${row.shadowAttempts}</b><small>shadow</small></span><span><b>${row.memoryAttempts+row.freeAttempts}</b><small>lượt nói</small></span><span><b>${row.roleplays}</b><small>role-play</small></span></div>`;}
  function render(){
    const c=context(), view=document.getElementById('view');if(!view)return;
    if(!c.active||!c.lessonId||!c.dialogueId){document.getElementById('ruSpeakingCoach')?.remove();view.classList.remove('ru-speaking-memory-mode');lastContextKey='';return;}
    const currentKey=keyOf(c);if(lastContextKey&&lastContextKey!==currentKey){abandonIfNeeded(currentKey);view.classList.remove('ru-speaking-memory-mode');}
    lastContextKey=currentKey;
    const row=lineState(c), active=activeSession(), memory=active?.key===currentKey&&active.mode==='memory';
    let panel=document.getElementById('ruSpeakingCoach');if(!panel){panel=document.createElement('section');panel.id='ruSpeakingCoach';panel.className='ru-speaking-coach';const flow=document.getElementById('ruLessonFlow');if(flow)flow.after(panel);else view.prepend(panel);}
    const listening=stepCard('01','Listening ladder','Nghe tốc độ thường trước, sau đó nghe chậm khi cần bắt âm và nhịp.',`<button type="button" data-ru-speaking="listen">Nghe thường</button><button type="button" data-ru-speaking="listen-slow">Nghe chậm</button>`);
    const shadow=stepCard('02','Shadowing','Nghe rồi nhại sát câu mẫu. Lượt shadow chỉ được ghi khi bạn thực sự dùng nút ghi/nói của runtime.',`<button type="button" data-ru-speaking="shadow">Bắt đầu shadowing</button>`);
    const memoryStep=stepCard('03','Nói không nhìn','Ẩn chữ Nga trong vùng luyện tập, sau đó nói lại bằng trí nhớ. Không dùng điểm similarity để tự xác nhận đúng.',`<button type="button" data-ru-speaking="memory">${memory?'Đang ẩn câu mẫu':'Nói không nhìn'}</button>${memory?'<button type="button" data-ru-speaking="reveal">Hiện câu mẫu</button>':''}`);
    const role=stepCard('04','Role-play','Chuyển từ câu đơn sang hội thoại. Runtime chỉ ghi nhận việc đã luyện, không tự nâng mastery.',`<button type="button" data-ru-speaking="roleplay">Luyện cả hội thoại</button><button type="button" class="danger" data-ru-speaking="flag">Câu này phát âm chưa ổn</button>`);
    panel.innerHTML=`<header><div><span>NGHE · NHẠI · NÓI · HỘI THOẠI</span><h3>${esc(c.lessonId)} · ${esc(c.dialogueId)} · câu ${c.lineIndex+1}</h3><p>Coach dùng đúng câu runtime đang mở. Kết quả chỉ là bằng chứng luyện tập; không có điểm mastery tự sinh.</p></div>${stats(row)}</header><div class="ru-speaking-grid">${listening}${shadow}${memoryStep}${role}</div>${notice?`<div class="ru-speaking-notice">${esc(notice)}</div>`:''}`;
  }
  document.addEventListener('click',event=>{
    const coach=event.target.closest?.('[data-ru-speaking]');
    if(coach){event.preventDefault();event.stopPropagation();const a=coach.dataset.ruSpeaking;if(a==='listen')startListening(false);else if(a==='listen-slow')startListening(true);else if(a==='shadow')startShadow();else if(a==='memory')startMemory();else if(a==='reveal')revealSource();else if(a==='roleplay')startRoleplay();else if(a==='flag')flagPronunciation();return;}
    const act=event.target.closest?.('[data-act]')?.dataset.act||'';const c=context();if(!c.active)return;
    if(act==='speak-line'){bump('listens',{lastListenAt:now()});}
    else if(act==='speak-line-slow'){bump('slowListens',{lastListenAt:now()});}
    else if(act==='record-line'){
      const mode=activeSession()?.mode||'free';markSessionAttempt();
      if(mode==='shadow')bump('shadowAttempts',{lastMode:mode,lastAttemptAt:now()});
      else if(mode==='memory')bump('memoryAttempts',{lastMode:mode,lastAttemptAt:now()});
      else bump('freeAttempts',{lastMode:mode,lastAttemptAt:now()});
    }
    else if(act==='mark-line-ok'){bump('selfOk',{lastSelfOkAt:now()});clearPronunciationReview();markSessionAttempt();}
    else if(act==='speak-dialogue'){bump('roleplays',{lastRoleplayAt:now()});markSessionAttempt();}
    scheduleRender();
  },true);
  window.addEventListener('beforeunload',()=>abandonIfNeeded(''));
  document.addEventListener('DOMContentLoaded',()=>{scheduleRender();const view=document.getElementById('view');if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});});
  window.addEventListener('russian:learning-state',scheduleRender);
  window.RussianSpeakingCoach={schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),context,flagPronunciation,startListening,startShadow,startMemory,startRoleplay};
})();
