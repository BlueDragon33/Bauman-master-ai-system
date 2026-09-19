'use strict';
(function(){
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const FLOW_KEY='bauman_russian_learning_flow_v1';
  const SCHEMA='RUSSIAN_LEARNING_FLOW_V1';
  const STEP_ORDER=['speaking','alphabet','theory','vocab','grammar','exercises','check'];
  const META={
    speaking:{icon:'🎧',label:'Nghe & nói',scope:'lesson',detail:'Bước vào chính: nghe mẫu, nhại, shadowing và đóng vai trước khi phân tích.'},
    alphabet:{icon:'✍️',label:'Chữ cái & viết tay',scope:'stage',detail:'Nhận mặt chữ in → đối chiếu chữ viết tay → luyện nét và viết lại.'},
    theory:{icon:'📘',label:'Bài học',scope:'lesson',detail:'Phân tích nội dung sau khi đã nghe/nói và nhận mặt chữ.'},
    vocab:{icon:'🗂️',label:'Từ vựng hỗ trợ',scope:'stage',detail:'Kho hiện liên kết theo giai đoạn, chưa gắn lessonId.'},
    grammar:{icon:'🧩',label:'Ngữ pháp hỗ trợ',scope:'stage',detail:'Kho hiện liên kết theo giai đoạn/chủ điểm, chưa gắn lessonId.'},
    exercises:{icon:'📝',label:'Bài tập',scope:'lesson',detail:'Bài tập liên kết trực tiếp với lessonId.'},
    check:{icon:'✅',label:'Kiểm tra theo bài',scope:'lesson',detail:'Câu hỏi thật được lọc theo lessonId; sai sẽ quay lại Ôn tập.'}
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,lessons:{},updatedAt:null});
  function readFlow(){const x=parse(localStorage.getItem(FLOW_KEY),empty());return {...empty(),...x,lessons:x&&typeof x.lessons==='object'?x.lessons:{}};}
  let flow=readFlow(), knowledge=[];
  function write(){flow.updatedAt=now();try{localStorage.setItem(FLOW_KEY,JSON.stringify(flow))}catch(e){console.warn('Russian learning flow save failed',e)};scheduleRender();}
  function activeLessonId(){const core=readCore();return clean(core.lessonId)||clean(window.RussianLearningState?.get?.()?.resume?.lessonId)||firstLessonForStage(clean(core.stage)||'vn')?.id||'';}
  function firstLessonForStage(stage){return knowledge.find(x=>stage==='all'||x.stage===stage)||knowledge[0]||null;}
  function lessonMeta(id){return knowledge.find(x=>x.id===id)||{id,title:id||'Bài hiện tại',stage:clean(readCore().stage)||'vn'};}
  function lessonState(id=activeLessonId()){
    if(!id)return null;
    const meta=lessonMeta(id), old=flow.lessons[id]||{};
    flow.lessons[id]={id,stage:meta.stage||old.stage||'',title:meta.title||old.title||id,steps:old.steps&&typeof old.steps==='object'?old.steps:{},updatedAt:old.updatedAt||null};
    return flow.lessons[id];
  }
  function touch(step,evidence={},lessonId=activeLessonId()){
    if(!STEP_ORDER.includes(step)||!lessonId)return;
    const ls=lessonState(lessonId);const prev=ls.steps[step]||{};const at=now();
    ls.steps[step]={...prev,openedAt:prev.openedAt||at,lastAt:at,events:Number(prev.events||0)+1,...evidence};
    ls.updatedAt=at;write();
  }
  function statusFor(step,s){
    if(!s)return {key:'new',label:'Chưa bắt đầu'};
    if(step==='check'&&Number(s.wrong||0)>0&&(!s.lastCorrectAt||Date.parse(s.lastWrongAt||0)>Date.parse(s.lastCorrectAt||0)))return {key:'review',label:'Cần ôn'};
    if(step==='check'&&Number(s.correct||0)>0)return {key:'evidence',label:`${s.correct} câu đúng`};
    if(step==='speaking'&&Number(s.ok||0)>0)return {key:'evidence',label:`${s.ok} câu nói ổn`};
    if(step==='alphabet'&&Number(s.practiceActions||0)>0)return {key:'active',label:'Đã luyện chữ'};
    if(step==='speaking'&&Number(s.attempts||0)>0)return {key:'active',label:'Đã luyện nói'};
    if(step==='vocab'||step==='grammar')return {key:'support',label:'Đã dùng hỗ trợ'};
    if(step==='exercises'&&Number(s.moves||0)>0)return {key:'active',label:'Đang làm bài'};
    if(step==='theory'&&Number(s.slideMoves||0)>0)return {key:'active',label:'Đang học'};
    return {key:'opened',label:'Đã mở'};
  }
  function nextSuggested(ls){for(const step of STEP_ORDER){if(!ls?.steps?.[step])return step;}return 'check';}
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function scopeLabel(scope){return scope==='lesson'?'Gắn bài':'Theo giai đoạn';}
  function panelHtml(ls){
    const next=nextSuggested(ls);const active=readCore();
    const rows=STEP_ORDER.map((step,i)=>{const m=META[step], s=ls.steps[step], st=statusFor(step,s);return `<button class="ru-flow-step ${esc(st.key)} ${next===step?'recommended':''}" data-ru-flow-step="${step}"><i>${m.icon}</i><span><small>${String(i+1).padStart(2,'0')} · ${scopeLabel(m.scope)}</small><b>${esc(m.label)}</b><em>${esc(m.detail)}</em></span><strong>${esc(st.label)}</strong></button>`;}).join('');
    const evidence=STEP_ORDER.filter(x=>!!ls.steps[x]).length;
    const context=(active.view==='vocab'||active.view==='grammar')?'Bạn đang dùng tài nguyên hỗ trợ theo giai đoạn; việc mở phần này không tự nâng trạng thái bài học.':'Các nút chỉ điều hướng và ghi bằng chứng thao tác thật; không tự đánh dấu mastered/completed.';
    return `<header class="ru-flow-head"><div><span>LEARNING FLOW · ${esc(ls.id)}</span><h3>${esc(ls.title)}</h3><p>${esc(context)}</p></div><div class="ru-flow-evidence"><b>${evidence}/6</b><small>bước đã có hoạt động</small></div></header><div class="ru-flow-steps">${rows}</div><footer class="ru-flow-foot"><span><b>Tiếp theo gợi ý:</b> ${esc(META[next].label)}</span><button type="button" data-ru-flow-step="${next}" class="btn primary">Mở bước tiếp theo →</button></footer>`;
  }
  let renderQueued=false,lastSig='';
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;renderPanel();});}
  function renderPanel(){
    const view=document.getElementById('view');if(!view)return;
    const core=readCore();
    if(['overview','storage','mindmap'].includes(core.view||'overview')){document.getElementById('ruLessonFlow')?.remove();lastSig='';return;}
    const id=activeLessonId();if(!id)return;
    const ls=lessonState(id);const sig=JSON.stringify([core.view,core.learnTab,id,ls.steps,flow.updatedAt]);
    let panel=document.getElementById('ruLessonFlow');if(!panel){panel=document.createElement('section');panel.id='ruLessonFlow';panel.className='ru-lesson-flow';view.prepend(panel);}
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
      if(lesson&&[...lesson.options].some(x=>x.value===lessonId)){lesson.value=lessonId;lesson.dispatchEvent(new Event('change',{bubbles:true}));}
      const filter=document.querySelector('[data-input="reviewFilter"]');if(filter){filter.value='all';filter.dispatchEvent(new Event('change',{bubbles:true}));}
    });
  }
  function navigate(step){
    const id=activeLessonId();if(!id)return;
    touch(step,{lastNavigationAt:now()},id);
    if(step==='theory')openLearningTab('theory',id);
    else if(step==='speaking')openLearningTab('practice',id);
    else if(step==='alphabet')click('[data-view="writing"]');
    else if(step==='exercises')openLearningTab('exercises',id);
    else if(step==='check'){openLearningTab('review',id);configureReviewLesson(id);}
    else if(step==='vocab')click('[data-view="vocab"]');
    else if(step==='grammar')click('[data-view="grammar"]');
  }
  function latestReview(core,lessonId){
    let best=null;
    for(const [kind,bucket] of [['correct',core.reviewProgress?.done],['wrong',core.reviewProgress?.wrong]])for(const [id,item] of Object.entries(bucket||{})){
      if(clean(item?.lessonId)!==lessonId)continue;const at=Number(item?.at||0);if(!best||at>best.at)best={kind,id,at,item};
    }
    return best;
  }
  function captureRealEvidence(target){
    const core=readCore(), id=activeLessonId();if(!id)return;
    const act=target.closest?.('[data-act]')?.dataset.act||'';
    if(core.view==='learning'&&core.learnTab==='theory'&&(act==='next-slide'||act==='prev-slide'||target.closest?.('[data-slide]'))){const old=lessonState(id)?.steps?.theory||{};touch('theory',{slideMoves:Number(old.slideMoves||0)+1},id);}
    if(core.view==='learning'&&core.learnTab==='practice'){
      if(['record-line','speak-line','speak-line-slow','speak-dialogue'].includes(act)){const old=lessonState(id)?.steps?.speaking||{};touch('speaking',{attempts:Number(old.attempts||0)+1},id);}
      if(act==='mark-line-ok'){const old=lessonState(id)?.steps?.speaking||{};touch('speaking',{attempts:Number(old.attempts||0)+1,ok:Number(old.ok||0)+1,lastOkAt:now()},id);}
    }
    if(core.view==='writing'){const old=lessonState(id)?.steps?.alphabet||{};touch('alphabet',{practiceActions:Number(old.practiceActions||0)+1,provenance:'print_to_cursive_practice'},id);}
    if(core.view==='learning'&&core.learnTab==='exercises'&&(act==='next-exercise'||act==='prev-exercise'||target.closest?.('[data-exercise-focus]'))){const old=lessonState(id)?.steps?.exercises||{};touch('exercises',{moves:Number(old.moves||0)+1},id);}
    if(core.view==='vocab'&&(['speak-vocab','toggle-vocab-flip','next-vocab','prev-vocab'].includes(act)||target.closest?.('[data-vocab]'))){const old=lessonState(id)?.steps?.vocab||{};touch('vocab',{supportActions:Number(old.supportActions||0)+1,provenance:'stage_support'},id);}
    if(core.view==='grammar'&&(target.closest?.('[data-grammar-index]')||act)){const old=lessonState(id)?.steps?.grammar||{};touch('grammar',{supportActions:Number(old.supportActions||0)+1,provenance:'stage_support'},id);}
    if(core.view==='learning'&&core.learnTab==='review'&&act==='check-review'){
      after(90,()=>{const latest=latestReview(readCore(),id);if(!latest)return;const old=lessonState(id)?.steps?.check||{};
        if(latest.kind==='correct')touch('check',{correct:Number(old.correct||0)+1,lastCorrectAt:new Date(latest.at).toISOString(),lastQuestionId:latest.id},id);
        else {touch('check',{wrong:Number(old.wrong||0)+1,lastWrongAt:new Date(latest.at).toISOString(),lastQuestionId:latest.id},id);window.RussianLearningState?.addReview?.(latest.id,'wrong_answer',{view:'learning',learnTab:'review'},`Câu sai · ${id}`);}
      });
    }
  }
  document.addEventListener('click',event=>{
    const flowButton=event.target.closest?.('[data-ru-flow-step]');if(flowButton){event.preventDefault();event.stopPropagation();navigate(flowButton.dataset.ruFlowStep);return;}
    captureRealEvidence(event.target);
  },true);
  document.addEventListener('change',event=>{if(event.target?.id==='stageSelect')after(40,scheduleRender);},true);
  window.addEventListener('russian:learning-state',scheduleRender);
  document.addEventListener('DOMContentLoaded',async()=>{
    try{const data=await fetch('data/knowledge-index.json').then(r=>r.ok?r.json():[]);knowledge=Array.isArray(data)?data.map(x=>({id:clean(x.id),title:clean(x.title),stage:clean(x.stage)})).filter(x=>x.id):[];}catch(_){knowledge=[];}
    scheduleRender();const view=document.getElementById('view');if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});
  });
  window.RussianLearningFlow={schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(flow)),activeLessonId,touch,navigate,statusFor};
})();
