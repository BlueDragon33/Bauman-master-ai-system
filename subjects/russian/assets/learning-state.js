'use strict';
(function(){
  const STORAGE_KEY='bauman_russian_learning_state_v1';
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const SCHEMA='RUSSIAN_LEARNING_STATE_V2';
  const LEGACY_SCHEMA='RUSSIAN_LEARNING_STATE_V1';
  const VALID_STATUS=new Set(['not_started','in_progress','review_due','mastered','completed']);
  const REVIEW_REASON_LABELS={
    wrong_answer:'Trả lời sai · cần sửa lại',
    user_flagged:'Đã đánh dấu để ôn',
    user_marked:'Đã đánh dấu để ôn',
    speaking_retry:'Phát âm / phản xạ cần luyện lại',
    pronunciation_error:'Phát âm cần luyện lại',
    stress_error:'Trọng âm cần luyện lại',
    abandoned:'Lượt luyện nói bỏ dở',
    legacy_review:'Mục ôn từ dữ liệu cũ'
  };
  const now=()=>new Date().toISOString();
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const clean=v=>String(v??'').trim();
  const stamp=v=>{const n=Number(v);if(Number.isFinite(n)&&n>0)return n;const d=Date.parse(v||'');return Number.isFinite(d)?d:0;};
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function empty(){return {schema:SCHEMA,resume:null,lastActivity:null,items:{},reviewQueue:{},reviewHistory:{},updatedAt:null};}
  function read(){
    const value=parse(localStorage.getItem(STORAGE_KEY),empty());
    return {
      ...empty(),...value,schema:SCHEMA,
      items:value&&typeof value.items==='object'?value.items:{},
      reviewQueue:value&&typeof value.reviewQueue==='object'?value.reviewQueue:{},
      reviewHistory:value&&typeof value.reviewHistory==='object'?value.reviewHistory:{}
    };
  }
  let state=read();
  let renderTimer=0,positionTimer=0;
  function publish(){
    const resume=state.resume; const core=readCore(); const task=window.BaumanSubjectHost?.getTask?.()||window.BAUMAN_HOST_TASK||{};
    const due=dueReviews();
    const transition=core.lastStageTransition?.schema==='RUSSIAN_STAGE_TRANSITION_V1'?core.lastStageTransition:null;
    const report={
      taskId:task.taskId||'',
      stage:core.stage||resume?.stage||'',
      status:resume?'in_progress':'not_started',
      lastActivity:state.lastActivity,
      resumeState:resume?{...resume.route,savedAt:resume.savedAt,position:resume.position||null}:null,
      progress:{
        reviewDue:due.length,
        reviewTotal:Object.keys(state.reviewQueue).length,
        reviewResolved:Object.keys(state.reviewHistory).length,
        stageTransition:transition,
        stageTransitionCount:Array.isArray(core.stageTransitions)?core.stageTransitions.length:0,
        canonicalState:SCHEMA
      }
    };
    window.BaumanSubjectHost?.progress?.(report);
    window.dispatchEvent(new CustomEvent('russian:learning-state',{detail:{state,report}}));
  }
  function write({render=true}={}){
    state.schema=SCHEMA;state.updatedAt=now();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian learning state save failed',e)}
    publish();
    if(render)scheduleRenderToday();
  }
  function routeFromCore(core=readCore()){
    const route={view:clean(core.view)||'overview'};
    ['learnTab','lessonId','slide','exerciseIndex','reviewIndex','reviewPage','examIndex','examPage','dialogueId','dialogueLineIndex','practiceDialogueId','practiceLineIndex','deepSpeakingId','deepSpeakingStep','mediaId','vocabIndex','vocabPage','grammarIndex','handwritingIndex','handwritingStep','writingIndex'].forEach(k=>{
      if(core[k]!==undefined&&core[k]!==null&&core[k]!=='')route[k]=core[k];
    });
    return route;
  }
  function routeKey(route){
    return [route?.view,route?.learnTab,route?.lessonId,route?.dialogueId,route?.deepSpeakingId,route?.mediaId,route?.vocabIndex,route?.grammarIndex,route?.handwritingIndex,route?.writingIndex]
      .filter(v=>v!==undefined&&v!=='').join(':')||'overview';
  }
  function humanActivity(route){
    const view={overview:'Hôm nay',learning:'Học tập',dialogue:'Đối thoại',writing:'Viết',media:'Nghe / Video',vocab:'Từ vựng',grammar:'Ngữ pháp',mindmap:'Mind map',storage:'Lưu trữ'}[route?.view]||'Học tập';
    const tab={theory:'Lý thuyết',exercises:'Bài tập',practice:'Nghe / Nói',review:'Ôn tập',exam:'Kiểm tra'}[route?.learnTab];
    return tab?`${view} · ${tab}`:view;
  }
  function capturePosition(){
    const main=document.querySelector('.ru-main');
    const view=document.getElementById('view');
    const media=[...document.querySelectorAll('audio,video')].find(x=>Number(x.currentTime)>0);
    const position={
      windowY:Math.max(0,Math.round(window.scrollY||document.documentElement?.scrollTop||0)),
      mainY:Math.max(0,Math.round(main?.scrollTop||0)),
      viewY:Math.max(0,Math.round(view?.scrollTop||0))
    };
    if(media){
      position.media={
        src:clean(media.currentSrc||media.getAttribute('src')),
        currentTime:Math.max(0,Number(media.currentTime)||0)
      };
    }
    return position;
  }
  function setResume(route,source='navigation'){
    if(!route||route.view==='overview'||route.view==='storage')return;
    const core=readCore(),savedAt=now();
    const next={
      route:{...route},
      activity:humanActivity(route),
      lessonId:clean(route.lessonId||core.lessonId),
      stage:clean(core.stage)||'vn',
      savedAt,source,status:'in_progress',
      position:capturePosition()
    };
    state.resume=next;
    state.lastActivity={at:savedAt,activity:next.activity,route:next.route};
    const key=routeKey(route),prev=state.items[key]||{};
    state.items[key]={
      ...prev,
      status:VALID_STATUS.has(prev.status)?prev.status:'in_progress',
      lastOpenedAt:savedAt,
      route:{...route}
    };
    write();
  }
  function refreshResumePosition(){
    if(!state.resume)return;
    const current=routeFromCore();
    if(routeKey(current)!==routeKey(state.resume.route))return;
    state.resume={...state.resume,route:{...current},lessonId:clean(current.lessonId||state.resume.lessonId),position:capturePosition(),savedAt:now(),source:'position'};
    state.lastActivity={at:state.resume.savedAt,activity:state.resume.activity,route:state.resume.route};
    write({render:false});
  }
  function schedulePositionSave(){
    clearTimeout(positionTimer);
    positionTimer=setTimeout(refreshResumePosition,450);
  }
  function restoreResumePosition(position=state.resume?.position){
    const pos=position;if(!pos)return;
    const apply=()=>{
      const main=document.querySelector('.ru-main'),view=document.getElementById('view');
      if(Number.isFinite(Number(pos.windowY)))window.scrollTo({top:Number(pos.windowY),behavior:'auto'});
      if(main&&Number.isFinite(Number(pos.mainY)))main.scrollTop=Number(pos.mainY);
      if(view&&Number.isFinite(Number(pos.viewY)))view.scrollTop=Number(pos.viewY);
      if(pos.media?.currentTime>0){
        const media=[...document.querySelectorAll('audio,video')].find(x=>{
          const src=clean(x.currentSrc||x.getAttribute('src'));
          return !pos.media.src||src===pos.media.src||src.endsWith(pos.media.src);
        });
        if(media){
          try{media.currentTime=Math.min(Number(pos.media.currentTime),Number.isFinite(media.duration)?media.duration:Number(pos.media.currentTime));}catch(_){}
        }
      }
    };
    setTimeout(apply,120);setTimeout(apply,420);
  }
  function reviewReason(reason){return REVIEW_REASON_LABELS[reason]||'Cần ôn lại';}
  function addReview(id,reason,route,label,dueAt){
    const evidence=(arguments[5]&&typeof arguments[5]==='object')?arguments[5]:{};
    const key=clean(id)||routeKey(route||routeFromCore());
    const previous=state.reviewQueue[key]||{};
    const scheduledAt=dueAt&&Number.isFinite(Date.parse(dueAt))?new Date(dueAt).toISOString():now();
    state.reviewQueue[key]={
      ...previous,...evidence,
      id:key,
      reason:reason||previous.reason||'user_marked',
      label:label||previous.label||humanActivity(route||routeFromCore()),
      route:{...(route||previous.route||routeFromCore())},
      dueAt:scheduledAt,
      addedAt:previous.addedAt||now(),
      scheduledAt:now(),
      attempts:Number(previous.attempts||0)
    };
    const item=state.items[key]||{};
    state.items[key]={...item,status:'review_due',route:{...(route||item.route||{})}};
    write();
    return state.reviewQueue[key];
  }
  function resolveReview(id,resolution='corrected',evidence={},shouldWrite=true){
    const key=clean(id),review=state.reviewQueue[key];
    if(!review)return false;
    const resolvedAt=now();
    state.reviewHistory[key]={
      ...review,...evidence,id:key,
      resolution,
      resolvedAt,
      lastResult:evidence.lastResult||'correct'
    };
    delete state.reviewQueue[key];
    const item=state.items[key]||{};
    state.items[key]={...item,status:item.status==='review_due'?'in_progress':(item.status||'in_progress'),reviewResolvedAt:resolvedAt,lastReviewResult:'correct'};
    if(shouldWrite)write();
    return true;
  }
  function removeReview(id){return resolveReview(id,'removed_by_user',{lastResult:'removed'});}
  function snoozeReview(id,delayMs=24*60*60*1000){
    const key=clean(id),review=state.reviewQueue[key];if(!review)return false;
    const delay=Math.max(60*1000,Number(delayMs)||0);
    review.dueAt=new Date(Date.now()+delay).toISOString();
    review.scheduledAt=now();
    review.snoozed=Number(review.snoozed||0)+1;
    write();return true;
  }
  function recordReviewResult(id,correct,evidence={}){
    const key=clean(id);if(!key)return;
    const at=now();
    if(correct){
      if(resolveReview(key,'corrected',{...evidence,lastResult:'correct',lastAttemptAt:at},false)){write();return;}
      const item=state.items[key]||{};
      state.items[key]={...item,lastReviewResult:'correct',lastReviewAt:at};
      write();return;
    }
    const review=state.reviewQueue[key]||{
      id:key,reason:evidence.reason||'wrong_answer',label:evidence.label||'Câu trả lời sai cần sửa',
      route:{...(evidence.route||{view:'learning',learnTab:'review'})},dueAt:at,addedAt:at,scheduledAt:at,attempts:0
    };
    Object.assign(review,evidence);
    review.reason=evidence.reason||review.reason||'wrong_answer';
    review.label=evidence.label||review.label||'Câu trả lời sai cần sửa';
    review.route={...(evidence.route||review.route||{view:'learning',learnTab:'review'})};
    if(evidence.lessonId&&!review.route.lessonId)review.route.lessonId=evidence.lessonId;
    review.attempts=Number(review.attempts||0)+1;
    review.lastResult='wrong';review.lastAttemptAt=at;review.dueAt=at;review.scheduledAt=at;
    state.reviewQueue[key]=review;
    const item=state.items[key]||{};
    state.items[key]={...item,status:'review_due',lastReviewResult:'wrong',lastReviewAt:at,route:{...review.route}};
    write();
  }
  function reconcileRealReviewSignals(){
    const core=readCore(),rp=core.reviewProgress||{},done=rp.done||{},wrong=rp.wrong||{},flagged=rp.flagged||{};
    const ids=new Set([...Object.keys(done),...Object.keys(wrong)]);
    let changed=false;
    ids.forEach(id=>{
      const w=wrong[id],d=done[id],wt=stamp(w?.at||w),dt=stamp(d?.at||d);
      if(d&&dt>=wt&&dt>0){
        if(state.reviewQueue[id]&&state.reviewQueue[id].reason==='wrong_answer'){
          resolveReview(id,'corrected_from_core',{lastResult:'correct',coreAt:dt},false);changed=true;
        }
        return;
      }
      if(w&&!state.reviewQueue[id]){
        state.reviewQueue[id]={
          id,reason:'wrong_answer',label:'Câu trả lời sai cần sửa',
          route:{view:'learning',learnTab:'review'},dueAt:wt?new Date(wt).toISOString():now(),
          addedAt:wt?new Date(wt).toISOString():now(),scheduledAt:now(),attempts:1,lastResult:'wrong'
        };
        const item=state.items[id]||{};state.items[id]={...item,status:'review_due',route:{view:'learning',learnTab:'review'}};
        changed=true;
      }
    });
    Object.entries(flagged).forEach(([id,value])=>{
      if(!value||state.reviewQueue[id])return;
      state.reviewQueue[id]={
        id,reason:'user_flagged',label:'Mục đã đánh dấu cần ôn',
        route:{view:'learning',learnTab:'review'},dueAt:now(),addedAt:now(),scheduledAt:now(),attempts:0
      };
      const item=state.items[id]||{};state.items[id]={...item,status:'review_due',route:{view:'learning',learnTab:'review'}};
      changed=true;
    });
    return changed;
  }
  function dueReviews(){
    const t=Date.now();
    return Object.values(state.reviewQueue)
      .filter(x=>!x.dueAt||stamp(x.dueAt)<=t)
      .sort((a,b)=>stamp(a.dueAt||a.addedAt)-stamp(b.dueAt||b.addedAt));
  }
  function routeAttr(route){return JSON.stringify(route||{}).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/</g,'&lt;');}
  function reviewRows(due){
    if(!due.length)return '<div class="ru-review-empty"><b>Không có mục ôn đến hạn.</b><span>Khi bạn trả lời sai hoặc tự đánh dấu, mục đó sẽ xuất hiện ở đây.</span></div>';
    return due.slice(0,3).map(item=>`<article class="ru-review-row">
      <div><b>${esc(item.label||'Mục cần ôn')}</b><span>${esc(reviewReason(item.reason))}${item.attempts?` · ${Number(item.attempts)} lần thử`:''}</span></div>
      <div class="ru-review-row-actions">
        <button type="button" data-route='${routeAttr(item.route||{view:'learning',learnTab:'review'})}' data-ru-review-open="${esc(item.id)}">Mở ôn</button>
        <button type="button" data-ru-review-snooze="${esc(item.id)}">Hoãn 1 ngày</button>
      </div>
    </article>`).join('');
  }
  function renderToday(){
    const view=document.getElementById('view');if(!view)return;
    const core=readCore();
    if((core.view||'overview')!=='overview'){document.getElementById('ruTodayResume')?.remove();return;}
    let panel=document.getElementById('ruTodayResume');
    if(!panel){panel=document.createElement('section');panel.id='ruTodayResume';panel.className='ru-today-resume';view.prepend(panel);}
    const resume=state.resume,due=dueReviews();
    const resumeRoute=resume?.route||{view:'learning',learnTab:'theory'};
    const resumeText=resume?`${resume.activity}${resume.lessonId?' · '+resume.lessonId:''}`:'Bắt đầu bài học nền tảng đầu tiên';
    panel.innerHTML=`<div class="ru-today-head"><div><span>HÔM NAY</span><h3>${resume?'Tiếp tục đúng nơi vừa học':'Bắt đầu theo lộ trình hiện tại'}</h3><p>${esc(resumeText)}</p></div><button class="btn primary ru-resume-primary" data-route='${routeAttr(resumeRoute)}'>${resume?'Tiếp tục':'Bắt đầu học'} →</button></div>
      <div class="ru-today-actions">
        <button class="ru-today-action" data-route='{"view":"learning","learnTab":"review"}'><b>${due.length}</b><span>Phần đến hạn ôn</span></button>
        <button class="ru-today-action" data-route='{"view":"dialogue"}'><b>Nghe · nói</b><span>Luyện phản xạ</span></button>
        <button class="ru-today-action" data-route='{"view":"vocab"}'><b>Từ vựng</b><span>Học trong ngữ cảnh</span></button>
        ${resume?'<button class="ru-today-action" data-ru-review-mark="current"><b>Đánh dấu</b><span>Cần ôn lại phần này</span></button>':''}
      </div>
      <section class="ru-review-queue-preview"><header><div><span>REVIEW QUEUE</span><b>${due.length?`${due.length} mục đến hạn`:'Đã xử lý hết mục đến hạn'}</b></div><small>Lý do ôn được lấy từ thao tác thật; sửa đúng sẽ tự rời hàng đợi.</small></header>${reviewRows(due)}</section>`;
  }
  function scheduleRenderToday(){clearTimeout(renderTimer);renderTimer=setTimeout(renderToday,0);}
  function explicitRoute(target){
    const node=target.closest?.('[data-route],[data-view],[data-tab]');if(!node)return null;
    if(node.dataset.route){try{return JSON.parse(node.dataset.route)}catch(_){}}
    const core=readCore(),route=routeFromCore(core);
    if(node.dataset.view)route.view=node.dataset.view;
    if(node.dataset.tab){route.view='learning';route.learnTab=node.dataset.tab;}
    return route;
  }
  document.addEventListener('click',event=>{
    const snooze=event.target.closest?.('[data-ru-review-snooze]');
    if(snooze){event.preventDefault();event.stopPropagation();snoozeReview(snooze.dataset.ruReviewSnooze);return;}
    const mark=event.target.closest?.('[data-ru-review-mark]');
    if(mark){event.preventDefault();const resume=state.resume;if(resume)addReview(routeKey(resume.route),'user_marked',resume.route,resume.activity);return;}
    const isResume=!!event.target.closest?.('.ru-resume-primary');
    const resumePosition=isResume?state.resume?.position:null;
    const route=explicitRoute(event.target);
    if(route)setTimeout(()=>{setResume({...routeFromCore(),...route},'navigation');if(isResume)restoreResumePosition(resumePosition);},0);
  },true);
  window.addEventListener('scroll',schedulePositionSave,{passive:true});
  window.addEventListener('pagehide',refreshResumePosition);
  window.addEventListener('bauman:host-task',publish);
  window.addEventListener('russian:stage-transition',publish);
  document.addEventListener('DOMContentLoaded',()=>{
    const changed=reconcileRealReviewSignals();
    const coreRoute=routeFromCore();
    if(!state.resume&&coreRoute.view!=='overview'&&coreRoute.view!=='storage')setResume(coreRoute,'legacy_state');
    else write({render:false});
    if(changed)write({render:false});
    renderToday();
    const main=document.querySelector('.ru-main'),view=document.getElementById('view');
    main?.addEventListener('scroll',schedulePositionSave,{passive:true});
    view?.addEventListener('scroll',schedulePositionSave,{passive:true});
    if(view)new MutationObserver(()=>renderToday()).observe(view,{childList:true});
  });
  window.RussianLearningState={
    schema:SCHEMA,
    legacySchema:LEGACY_SCHEMA,
    get:()=>JSON.parse(JSON.stringify(state)),
    setResume,addReview,removeReview,snoozeReview,resolveReview,recordReviewResult,
    dueReviews,routeFromCore,publish,refreshResumePosition,restoreResumePosition
  };
})();