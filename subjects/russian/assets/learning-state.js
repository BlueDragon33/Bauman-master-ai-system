'use strict';
(function(){
  const STORAGE_KEY='bauman_russian_learning_state_v1';
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const VALID_STATUS=new Set(['not_started','in_progress','review_due','mastered','completed']);
  const now=()=>new Date().toISOString();
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  function empty(){return {schema:'RUSSIAN_LEARNING_STATE_V1',resume:null,lastActivity:null,items:{},reviewQueue:{},updatedAt:null};}
  function read(){const value=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...value,items:value&&typeof value.items==='object'?value.items:{},reviewQueue:value&&typeof value.reviewQueue==='object'?value.reviewQueue:{}};}
  let state=read();
  function write(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian learning state save failed',e)};publish();}
  const clean=v=>String(v??'').trim();
  function routeFromCore(core=readCore()){
    const route={view:clean(core.view)||'overview'};
    ['learnTab','lessonId','slide','exerciseIndex','reviewIndex','reviewPage','examIndex','examPage','dialogueId','dialogueLineIndex','practiceDialogueId','practiceLineIndex','deepSpeakingId','deepSpeakingStep','mediaId','vocabIndex','vocabPage','grammarIndex','handwritingIndex','handwritingStep','writingIndex'].forEach(k=>{if(core[k]!==undefined&&core[k]!==null&&core[k]!=='' )route[k]=core[k]});
    return route;
  }
  function routeKey(route){return [route.view,route.learnTab,route.lessonId,route.dialogueId,route.deepSpeakingId,route.mediaId,route.vocabIndex,route.grammarIndex,route.handwritingIndex,route.writingIndex].filter(v=>v!==undefined&&v!=='').join(':')||'overview';}
  function humanActivity(route){
    const view={overview:'Hôm nay',learning:'Học tập',dialogue:'Đối thoại',writing:'Viết',media:'Nghe / Video',vocab:'Từ vựng',grammar:'Ngữ pháp',mindmap:'Mind map',storage:'Lưu trữ'}[route.view]||'Học tập';
    const tab={theory:'Lý thuyết',exercises:'Bài tập',practice:'Nghe / Nói',review:'Ôn tập',exam:'Kiểm tra'}[route.learnTab];
    return tab?`${view} · ${tab}`:view;
  }
  function setResume(route,source='navigation'){
    if(!route||route.view==='overview'||route.view==='storage')return;
    const core=readCore();
    const next={route:{...route},activity:humanActivity(route),lessonId:clean(route.lessonId||core.lessonId),stage:clean(core.stage)||'vn',savedAt:now(),source,status:'in_progress'};
    state.resume=next; state.lastActivity={at:next.savedAt,activity:next.activity,route:next.route};
    const key=routeKey(route), prev=state.items[key]||{};
    state.items[key]={...prev,status:VALID_STATUS.has(prev.status)?prev.status:'in_progress',lastOpenedAt:next.savedAt,route:{...route}};
    write();
  }
  function addReview(id,reason,route,label){
    const key=clean(id)||routeKey(route||routeFromCore());
    state.reviewQueue[key]={id:key,reason:reason||'user_marked',label:label||humanActivity(route||routeFromCore()),route:{...(route||routeFromCore())},dueAt:now(),addedAt:state.reviewQueue[key]?.addedAt||now()};
    const item=state.items[key]||{};state.items[key]={...item,status:'review_due',route:{...(route||item.route||{})}};write();renderToday();
  }
  function removeReview(id){if(state.reviewQueue[id]){delete state.reviewQueue[id];const item=state.items[id];if(item&&item.status==='review_due')item.status='in_progress';write();renderToday();}}
  function importRealReviewSignals(){
    const core=readCore(), rp=core.reviewProgress||{};
    [['wrong','wrong_answer'],['flagged','user_flagged']].forEach(([bucket,reason])=>{
      Object.keys(rp[bucket]||{}).forEach(id=>{if(!rp[bucket][id])return;if(!state.reviewQueue[id])state.reviewQueue[id]={id,reason,label:reason==='wrong_answer'?'Câu trả lời sai cần sửa':'Mục đã đánh dấu cần ôn',route:{view:'learning',learnTab:'review'},dueAt:now(),addedAt:now()};});
    });
  }
  function dueReviews(){const t=Date.now();return Object.values(state.reviewQueue).filter(x=>!x.dueAt||Date.parse(x.dueAt)<=t);}
  function publish(){
    const resume=state.resume; const core=readCore(); const task=window.BaumanSubjectHost?.getTask?.()||window.BAUMAN_HOST_TASK||{};
    const report={taskId:task.taskId||'',stage:core.stage||resume?.stage||'',status:resume?'in_progress':'not_started',lastActivity:state.lastActivity,resumeState:resume?{...resume.route,savedAt:resume.savedAt}:null,progress:{reviewDue:dueReviews().length,canonicalState:'RUSSIAN_LEARNING_STATE_V1'}};
    window.BaumanSubjectHost?.progress?.(report);
    window.dispatchEvent(new CustomEvent('russian:learning-state',{detail:{state,report}}));
  }
  function routeAttr(route){return JSON.stringify(route).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/</g,'&lt;');}
  function renderToday(){
    const view=document.getElementById('view');if(!view)return;
    const core=readCore();if((core.view||'overview')!=='overview'){document.getElementById('ruTodayResume')?.remove();return;}
    let panel=document.getElementById('ruTodayResume');if(!panel){panel=document.createElement('section');panel.id='ruTodayResume';panel.className='ru-today-resume';view.prepend(panel);}
    const resume=state.resume, due=dueReviews();
    const resumeRoute=resume?.route||{view:'learning',learnTab:'theory'};
    const resumeText=resume?`${resume.activity}${resume.lessonId?' · '+resume.lessonId:''}`:'Bắt đầu bài học nền tảng đầu tiên';
    panel.innerHTML=`<div class="ru-today-head"><div><span>HÔM NAY</span><h3>${resume?'Tiếp tục đúng nơi vừa học':'Bắt đầu theo lộ trình hiện tại'}</h3><p>${resumeText}</p></div><button class="btn primary ru-resume-primary" data-route='${routeAttr(resumeRoute)}'>${resume?'Tiếp tục':'Bắt đầu học'} →</button></div><div class="ru-today-actions"><button class="ru-today-action" data-route='{"view":"learning","learnTab":"review"}'><b>${due.length}</b><span>Phần đến hạn ôn</span></button><button class="ru-today-action" data-route='{"view":"dialogue"}'><b>Nghe · nói</b><span>Luyện phản xạ</span></button><button class="ru-today-action" data-route='{"view":"vocab"}'><b>Từ vựng</b><span>Học trong ngữ cảnh</span></button>${resume?'<button class="ru-today-action" data-ru-review-mark="current"><b>Đánh dấu</b><span>Cần ôn lại phần này</span></button>':''}</div>`;
  }
  function explicitRoute(target){
    const node=target.closest?.('[data-route],[data-view],[data-tab]');if(!node)return null;
    if(node.dataset.route){try{return JSON.parse(node.dataset.route)}catch(_){}}
    const core=readCore();const route=routeFromCore(core);if(node.dataset.view)route.view=node.dataset.view;if(node.dataset.tab){route.view='learning';route.learnTab=node.dataset.tab}return route;
  }
  document.addEventListener('click',event=>{
    const mark=event.target.closest?.('[data-ru-review-mark]');if(mark){const resume=state.resume;if(resume)addReview(routeKey(resume.route),'user_marked',resume.route,resume.activity);return;}
    const route=explicitRoute(event.target);if(route)setTimeout(()=>setResume({...routeFromCore(),...route},'navigation'),0);
  },true);
  window.addEventListener('bauman:host-task',()=>publish());
  document.addEventListener('DOMContentLoaded',()=>{
    importRealReviewSignals();
    const coreRoute=routeFromCore();if(!state.resume&&coreRoute.view!=='overview'&&coreRoute.view!=='storage')setResume(coreRoute,'legacy_state');else write();
    renderToday();
    const view=document.getElementById('view');if(view)new MutationObserver(()=>renderToday()).observe(view,{childList:true});
  });
  window.RussianLearningState={get:()=>JSON.parse(JSON.stringify(state)),setResume,addReview,removeReview,dueReviews,routeFromCore,publish};
})();
