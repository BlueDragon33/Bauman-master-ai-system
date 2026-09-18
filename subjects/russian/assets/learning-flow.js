'use strict';
(function(){
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const FLOW_KEY='bauman_russian_learning_flow_v1';
  const SCHEMA='RUSSIAN_LEARNING_FLOW_V2';
  const LEGACY_SCHEMA='RUSSIAN_LEARNING_FLOW_V1';
  const STEP_ORDER=['theory','speaking','vocab','grammar','exercises','check'];
  const CORE_STEPS=['theory','speaking','exercises','check'];
  const META={
    theory:{icon:'📘',label:'Bài học',scope:'lesson',detail:'Nội dung và ví dụ của đúng bài đang chọn.'},
    speaking:{icon:'🎧',label:'Nghe & nói',scope:'lesson',detail:'Speaking liên kết trực tiếp với lessonId của bài.'},
    vocab:{icon:'🗂️',label:'Từ vựng hỗ trợ',scope:'stage',detail:'Tài nguyên hỗ trợ theo giai đoạn; không phải cổng hoàn thành bài.'},
    grammar:{icon:'🧩',label:'Ngữ pháp hỗ trợ',scope:'stage',detail:'Tài nguyên hỗ trợ theo giai đoạn/chủ điểm; không tự nâng tiến độ bài.'},
    exercises:{icon:'📝',label:'Bài tập',scope:'lesson',detail:'Bài tập liên kết trực tiếp với lessonId.'},
    check:{icon:'✅',label:'Kiểm tra theo bài',scope:'lesson',detail:'Câu hỏi thật theo lessonId; sai vào Review Queue, sửa đúng tự gỡ.'}
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,lessons:{},updatedAt:null});
  function readFlow(){
    const x=parse(localStorage.getItem(FLOW_KEY),empty());
    return {...empty(),...x,schema:SCHEMA,lessons:x&&typeof x.lessons==='object'?x.lessons:{}};
  }
  let flow=readFlow(),knowledge=[];
  function write(){
    flow.schema=SCHEMA;flow.updatedAt=now();
    try{localStorage.setItem(FLOW_KEY,JSON.stringify(flow))}catch(e){console.warn('Russian learning flow save failed',e)}
    scheduleRender();
  }
  function activeLessonId(){
    const core=readCore();
    return clean(core.lessonId)||clean(window.RussianLearningState?.get?.()?.resume?.lessonId)||firstLessonForStage(clean(core.stage)||'vn')?.id||'';
  }
  function firstLessonForStage(stage){return knowledge.find(x=>stage==='all'||x.stage===stage)||knowledge[0]||null;}
  function lessonMeta(id){return knowledge.find(x=>x.id===id)||{id,title:id||'Bài hiện tại',stage:clean(readCore().stage)||'vn'};}
  function lessonState(id=activeLessonId()){
    if(!id)return null;
    const meta=lessonMeta(id),old=flow.lessons[id]||{};
    flow.lessons[id]={
      id,
      stage:meta.stage||old.stage||'',
      title:meta.title||old.title||id,
      steps:old.steps&&typeof old.steps==='object'?old.steps:{},
      updatedAt:old.updatedAt||null
    };
    return flow.lessons[id];
  }
  function touch(step,evidence={},lessonId=activeLessonId()){
    if(!STEP_ORDER.includes(step)||!lessonId)return;
    const ls=lessonState(lessonId),prev=ls.steps[step]||{},at=now();
    ls.steps[step]={
      ...prev,
      openedAt:prev.openedAt||at,
      lastAt:at,
      events:Number(prev.events||0)+1,
      ...evidence
    };
    ls.updatedAt=at;write();
  }
  function latestCheckNeedsReview(s){
    if(!s)return false;
    const wrongAt=Date.parse(s.lastWrongAt||0)||0;
    const correctAt=Date.parse(s.lastCorrectAt||0)||0;
    return wrongAt>correctAt;
  }
  function hasMeaningfulEvidence(step,s){
    if(!s)return false;
    if(step==='theory')return Number(s.slideMoves||0)>0;
    if(step==='speaking')return Number(s.ok||0)>0;
    if(step==='vocab'||step==='grammar')return Number(s.supportActions||0)>0;
    if(step==='exercises')return Number(s.moves||0)>0;
    if(step==='check')return Number(s.correct||0)>0&&!latestCheckNeedsReview(s);
    return false;
  }
  function statusFor(step,s){
    if(!s)return {key:'new',label:'Chưa bắt đầu'};
    if(step==='check'&&latestCheckNeedsReview(s))return {key:'review',label:'Cần sửa câu sai'};
    if(step==='check'&&Number(s.correct||0)>0)return {key:'evidence',label:`${s.correct} câu đúng`};
    if(step==='speaking'&&Number(s.ok||0)>0)return {key:'evidence',label:`${s.ok} câu nói ổn`};
    if(step==='speaking'&&Number(s.attempts||0)>0)return {key:'active',label:'Đã thử · chưa xác nhận ổn'};
    if((step==='vocab'||step==='grammar')&&Number(s.supportActions||0)>0)return {key:'support',label:'Đã dùng hỗ trợ'};
    if(step==='exercises'&&Number(s.moves||0)>0)return {key:'active',label:'Có thao tác bài tập'};
    if(step==='theory'&&Number(s.slideMoves||0)>0)return {key:'active',label:'Có hoạt động học'};
    return {key:'opened',label:'Đã mở · chưa có bằng chứng'};
  }
  function nextSuggested(ls){
    for(const step of CORE_STEPS){
      if(!hasMeaningfulEvidence(step,ls?.steps?.[step]))return step;
    }
    return null;
  }
  function reviewStep(item){
    const route=item?.route||{};
    if(route.view==='learning'){
      if(route.learnTab==='practice')return 'speaking';
      if(route.learnTab==='exercises')return 'exercises';
      if(route.learnTab==='theory')return 'theory';
      if(route.learnTab==='review'||route.learnTab==='exam')return 'check';
    }
    if(route.view==='vocab')return 'vocab';
    if(route.view==='grammar')return 'grammar';
    if(/^(pron:|stress:|speak-abandoned:)/.test(clean(item?.id)))return 'speaking';
    return 'check';
  }
  function dueReviewsForLesson(lessonId){
    const id=clean(lessonId);if(!id)return [];
    const api=window.RussianLearningState;
    if(!api||typeof api.dueReviews!=='function')return [];
    try{
      return api.dueReviews().filter(item=>clean(item?.lessonId||item?.route?.lessonId)===id);
    }catch(_){return [];}
  }
  function adaptiveNext(ls){
    const due=dueReviewsForLesson(ls?.id);
    if(due.length){
      const item=due[0],step=reviewStep(item);
      return {
        kind:'review',step,item,
        label:clean(item?.label)||'Mục cần sửa trước khi học mới',
        reason:clean(item?.reason)||'review_due',
        route:{...(item?.route||{view:'learning',learnTab:'review',lessonId:ls?.id})}
      };
    }
    const step=nextSuggested(ls);
    if(step)return {kind:'step',step,label:META[step]?.label||step};
    return {kind:'reinforce',step:'check',label:'Ôn củng cố / kiểm tra lại'};
  }
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function routeAttr(route){return JSON.stringify(route||{}).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/</g,'&lt;');}
  function scopeLabel(scope){return scope==='lesson'?'Gắn bài':'Hỗ trợ giai đoạn';}
  function panelHtml(ls){
    const adaptive=adaptiveNext(ls),next=adaptive?.step||null,active=readCore();
    const rows=STEP_ORDER.map((step,i)=>{
      const m=META[step],s=ls.steps[step],st=statusFor(step,s);
      return `<button class="ru-flow-step ${esc(st.key)} ${next===step?'recommended':''}" data-ru-flow-step="${step}">
        <i>${m.icon}</i><span><small>${String(i+1).padStart(2,'0')} · ${scopeLabel(m.scope)}</small><b>${esc(m.label)}</b><em>${esc(m.detail)}</em></span><strong>${esc(st.label)}</strong>
      </button>`;
    }).join('');
    const evidence=CORE_STEPS.filter(x=>hasMeaningfulEvidence(x,ls.steps[x])).length;
    const context=(active.view==='vocab'||active.view==='grammar')
      ?'Bạn đang dùng tài nguyên hỗ trợ theo giai đoạn. Việc mở phần này không tự nâng trạng thái bài học.'
      :'Tiến độ chỉ tăng khi có bằng chứng thao tác phù hợp; mở màn hình đơn thuần không được tính là đã học.';
    const foot=adaptive?.kind==='review'
      ?`<span><b>Ưu tiên sửa trước:</b> ${esc(adaptive.label)} · Review Queue đang đến hạn.</span><button type="button" data-route='${routeAttr(adaptive.route)}' data-ru-adaptive-review="${esc(adaptive.item?.id)}" class="btn primary">Mở đúng lỗi →</button>`
      :(adaptive?.kind==='step'
        ?`<span><b>Tiếp theo gợi ý:</b> ${esc(META[next].label)}</span><button type="button" data-ru-flow-step="${next}" class="btn primary">Mở bước tiếp theo →</button>`
        :`<span><b>Đã có bằng chứng ở 4 bước cốt lõi.</b> Không còn lỗi đến hạn của bài này; chuyển sang củng cố.</span><button type="button" data-ru-flow-step="check" class="btn primary">Luyện kiểm tra tiếp →</button>`);
    return `<header class="ru-flow-head"><div><span>LEARNING FLOW · ${esc(ls.id)}</span><h3>${esc(ls.title)}</h3><p>${esc(context)}</p></div><div class="ru-flow-evidence"><b>${evidence}/4</b><small>bước cốt lõi có bằng chứng</small></div></header><div class="ru-flow-steps">${rows}</div><footer class="ru-flow-foot">${foot}</footer>`;
  }
  let renderQueued=false,lastSig='';
  function scheduleRender(){
    if(renderQueued)return;renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;renderPanel();});
  }
  function renderPanel(){
    const view=document.getElementById('view');if(!view)return;
    const core=readCore();
    if(['overview','storage','mindmap'].includes(core.view||'overview')){
      document.getElementById('ruLessonFlow')?.remove();lastSig='';return;
    }
    const id=activeLessonId();if(!id)return;
    const ls=lessonState(id),learningState=window.RussianLearningState?.get?.()||{};
    const adaptive=adaptiveNext(ls),sig=JSON.stringify([core.view,core.learnTab,id,ls.steps,flow.updatedAt,learningState.updatedAt,adaptive?.kind,adaptive?.item?.id||'']);
    let panel=document.getElementById('ruLessonFlow');
    if(!panel){panel=document.createElement('section');panel.id='ruLessonFlow';panel.className='ru-lesson-flow';view.prepend(panel);}
    if(sig!==lastSig){panel.innerHTML=panelHtml(ls);lastSig=sig;}
  }
  function click(selector){const el=document.querySelector(selector);if(el){el.click();return true}return false;}
  function after(ms,fn){setTimeout(fn,ms);}
  function openLearningTab(tab,lessonId){
    click('[data-view="learning"]');
    after(35,()=>{
      const lesson=[...document.querySelectorAll('[data-lesson]')].find(x=>x.dataset.lesson===lessonId);if(lesson)lesson.click();
      after(35,()=>{const tabBtn=[...document.querySelectorAll('[data-learn]')].find(x=>x.dataset.learn===tab);if(tabBtn)tabBtn.click();});
    });
  }
  function configureReviewLesson(lessonId){
    after(130,()=>{
      const lesson=document.querySelector('[data-input="reviewLesson"]');
      if(lesson&&[...lesson.options].some(x=>x.value===lessonId)){
        lesson.value=lessonId;lesson.dispatchEvent(new Event('change',{bubbles:true}));
      }
      const filter=document.querySelector('[data-input="reviewFilter"]');
      if(filter){filter.value='all';filter.dispatchEvent(new Event('change',{bubbles:true}));}
    });
  }
  function navigate(step){
    const id=activeLessonId();if(!id||!STEP_ORDER.includes(step))return;
    touch(step,{lastNavigationAt:now()},id);
    if(step==='theory')openLearningTab('theory',id);
    else if(step==='speaking')openLearningTab('practice',id);
    else if(step==='exercises')openLearningTab('exercises',id);
    else if(step==='check'){openLearningTab('review',id);configureReviewLesson(id);}
    else if(step==='vocab')click('[data-view="vocab"]');
    else if(step==='grammar')click('[data-view="grammar"]');
  }
  function latestReview(core,lessonId){
    let best=null;
    for(const [kind,bucket] of [['correct',core.reviewProgress?.done],['wrong',core.reviewProgress?.wrong]]){
      for(const [id,item] of Object.entries(bucket||{})){
        if(clean(item?.lessonId)!==lessonId)continue;
        const at=Number(item?.at||0);
        if(!best||at>best.at)best={kind,id,at,item};
      }
    }
    return best;
  }
  function captureRealEvidence(target){
    const core=readCore(),id=activeLessonId();if(!id)return;
    const act=target.closest?.('[data-act]')?.dataset.act||'';
    if(core.view==='learning'&&core.learnTab==='theory'&&(act==='next-slide'||act==='prev-slide'||target.closest?.('[data-slide]'))){
      const old=lessonState(id)?.steps?.theory||{};
      touch('theory',{slideMoves:Number(old.slideMoves||0)+1},id);
    }
    const speakingSurface=(core.view==='learning'&&core.learnTab==='practice')||core.view==='dialogue';
    if(speakingSurface){
      if(['record-line','speak-line','speak-line-slow','speak-dialogue'].includes(act)){
        const old=lessonState(id)?.steps?.speaking||{};
        touch('speaking',{attempts:Number(old.attempts||0)+1,lastSurface:core.view==='dialogue'?'dialogue':'practice'},id);
      }
      if(act==='mark-line-ok'){
        const old=lessonState(id)?.steps?.speaking||{};
        touch('speaking',{attempts:Number(old.attempts||0)+1,ok:Number(old.ok||0)+1,lastOkAt:now(),lastSurface:core.view==='dialogue'?'dialogue':'practice'},id);
      }
    }
    if(core.view==='learning'&&core.learnTab==='exercises'&&(act==='next-exercise'||act==='prev-exercise'||target.closest?.('[data-exercise-focus]'))){
      const old=lessonState(id)?.steps?.exercises||{};
      touch('exercises',{moves:Number(old.moves||0)+1},id);
    }
    if(core.view==='vocab'&&(['speak-vocab','toggle-vocab-flip','next-vocab','prev-vocab'].includes(act)||target.closest?.('[data-vocab]'))){
      const old=lessonState(id)?.steps?.vocab||{};
      touch('vocab',{supportActions:Number(old.supportActions||0)+1,provenance:'stage_support'},id);
    }
    if(core.view==='grammar'&&(target.closest?.('[data-grammar-index]')||act)){
      const old=lessonState(id)?.steps?.grammar||{};
      touch('grammar',{supportActions:Number(old.supportActions||0)+1,provenance:'stage_support'},id);
    }
    if(core.view==='learning'&&core.learnTab==='review'&&act==='check-review'){
      after(90,()=>{
        const latest=latestReview(readCore(),id);if(!latest)return;
        const old=lessonState(id)?.steps?.check||{};
        const at=latest.at?new Date(latest.at).toISOString():now();
        if(latest.kind==='correct'){
          touch('check',{correct:Number(old.correct||0)+1,lastCorrectAt:at,lastQuestionId:latest.id},id);
          window.RussianLearningState?.recordReviewResult?.(latest.id,true,{lessonId:id,route:{view:'learning',learnTab:'review'}});
        }else{
          touch('check',{wrong:Number(old.wrong||0)+1,lastWrongAt:at,lastQuestionId:latest.id},id);
          window.RussianLearningState?.recordReviewResult?.(latest.id,false,{
            reason:'wrong_answer',
            label:`Câu sai · ${id}`,
            lessonId:id,
            route:{view:'learning',learnTab:'review'}
          });
        }
      });
    }
  }
  document.addEventListener('click',event=>{
    const flowButton=event.target.closest?.('[data-ru-flow-step]');
    if(flowButton){event.preventDefault();event.stopPropagation();navigate(flowButton.dataset.ruFlowStep);return;}
    captureRealEvidence(event.target);
  },true);
  document.addEventListener('change',event=>{if(event.target?.id==='stageSelect')after(40,scheduleRender);},true);
  window.addEventListener('russian:learning-state',scheduleRender);
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const data=await fetch('data/knowledge-index.json').then(r=>r.ok?r.json():[]);
      knowledge=Array.isArray(data)?data.map(x=>({id:clean(x.id),title:clean(x.title),stage:clean(x.stage)})).filter(x=>x.id):[];
    }catch(_){knowledge=[];}
    scheduleRender();
    const view=document.getElementById('view');
    if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});
  });
  window.RussianLearningFlow={
    schema:SCHEMA,
    legacySchema:LEGACY_SCHEMA,
    get:()=>JSON.parse(JSON.stringify(flow)),
    activeLessonId,touch,navigate,statusFor,hasMeaningfulEvidence,nextSuggested,
    reviewStep,dueReviewsForLesson,adaptiveNext
  };
})();