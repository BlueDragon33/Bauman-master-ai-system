'use strict';
(function(){
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const FLOW_KEY='bauman_russian_learning_flow_v1';
  const SCHEMA='RUSSIAN_LEARNING_FLOW_V2';
  const LEGACY_SCHEMA='RUSSIAN_LEARNING_FLOW_V1';
  const STEP_ORDER=['speaking','alphabet','theory','vocab','grammar','exercises','check'];
  const CORE_STEPS=['speaking','alphabet','theory','exercises','check'];
  const LESSON_STEPPER=[
    {step:'speaking',icon:'🎧',label:'Nghe'},
    {step:'theory',icon:'👁️',label:'Nhận diện'},
    {step:'alphabet',icon:'✍️',label:'Viết'},
    {step:'exercises',icon:'📝',label:'Thực hành'},
    {step:'check',icon:'✅',label:'Kiểm tra'}
  ];
  const META={
    speaking:{icon:'🎧',label:'Nghe & nói',scope:'lesson',detail:'Bước vào chính: nghe mẫu, nhại, shadowing và đóng vai trước khi phân tích.'},
    alphabet:{icon:'✍️',label:'Chữ cái & viết tay',scope:'stage',detail:'Nhận mặt chữ in → đối chiếu chữ viết tay → luyện nét và viết lại.'},
    theory:{icon:'📘',label:'Bài học',scope:'lesson',detail:'Phân tích nội dung sau khi đã nghe/nói và nhận mặt chữ.'},
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
    if(step==='speaking')return Number(s.ok||0)>0;
    if(step==='alphabet')return Number(s.strokeActions||0)>0;
    if(step==='theory')return Number(s.slideMoves||0)>0;
    if(step==='vocab'||step==='grammar')return Number(s.supportActions||0)>0;
    if(step==='exercises')return Number(s.moves||0)>0;
    if(step==='check')return Number(s.correct||0)>0&&!latestCheckNeedsReview(s);
    return false;
  }
  function statusFor(step,s){
    if(!s)return {key:'new',label:'Chưa bắt đầu'};
    if(step==='check'&&latestCheckNeedsReview(s))return {key:'review',label:'Cần sửa câu sai'};
    if(step==='check'&&Number(s.correct||0)>0)return {key:'evidence',label:`${s.correct} câu đúng`};
    if(step==='speaking'&&Number(s.ok||0)>0)return {key:'evidence',label:`${s.ok} lần tự xác nhận luyện nói · chưa chấm phát âm`};
    if(step==='alphabet'&&Number(s.strokeActions||0)>0)return {key:'evidence',label:`${s.strokeActions} lượt luyện nét`};
    if(step==='alphabet'&&Number(s.practiceActions||0)>0)return {key:'opened',label:'Đã thao tác · chưa có nét viết thật'};
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
    if(route.view==='writing')return 'alphabet';
    if(/^handwriting:/.test(clean(item?.id)))return 'alphabet';
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
  function panelHtml(ls){
    const adaptive=adaptiveNext(ls),next=adaptive?.kind==='step'?adaptive.step:null;
    const rows=LESSON_STEPPER.map(item=>{
      const step=item.step,s=ls.steps[step],st=statusFor(step,s);
      const current=next===step;
      return `<button type="button" class="ru-flow-step ${esc(st.key)} ${current?'recommended':''}" data-ru-flow-step="${step}" aria-current="${current?'step':'false'}" title="${esc(item.label)} · ${esc(st.label)}">
        <i aria-hidden="true">${item.icon}</i><span><b>${esc(item.label)}</b><small>${esc(st.label)}</small></span>
      </button>`;
    }).join('');
    const evidence=CORE_STEPS.filter(x=>hasMeaningfulEvidence(x,ls.steps[x])).length;
    const reviewAction=adaptive?.kind==='review'
      ?`<button type="button" data-route='${routeAttr(adaptive.route)}' data-ru-adaptive-review="${esc(adaptive.item?.id)}" class="ru-flow-review" title="Ôn mục đến hạn: ${esc(adaptive.label)}">↺ Ôn</button>`
      :'';
    return `<header class="ru-flow-head"><span>LESSON · ${esc(ls.id)}</span><b title="${esc(ls.title)}">${esc(ls.title)}</b><div class="ru-flow-meta"><small>${evidence}/${CORE_STEPS.length} bằng chứng</small>${reviewAction}</div></header><nav class="ru-flow-steps" aria-label="Tiến trình bài ${esc(ls.id)}">${rows}</nav>`;
  }
  let renderQueued=false,lastSig='',writingStrokeActive=false,writingStrokeMoved=false;
  function scheduleRender(){
    if(renderQueued)return;renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;renderPanel();});
  }
  function renderPanel(){
    const view=document.getElementById('view');if(!view)return;
    const core=readCore();
    if((core.view||'overview')!=='learning'){
      document.getElementById('ruLessonFlow')?.remove();lastSig='';return;
    }
    const id=activeLessonId();if(!id)return;
    const ls=lessonState(id),learningState=window.RussianLearningState?.get?.()||{};
    const adaptive=adaptiveNext(ls),sig=JSON.stringify([core.view,core.learnTab,id,ls.steps,flow.updatedAt,learningState.updatedAt,adaptive?.kind,adaptive?.item?.id||'']);
    let panel=document.getElementById('ruLessonFlow');
    const isNew=!panel;
    if(isNew){panel=document.createElement('section');panel.id='ruLessonFlow';panel.className='ru-lesson-flow';panel.setAttribute('aria-label','Tiến trình bài học');view.prepend(panel);}
    // A full core render can replace #view while the lesson signature stays
    // unchanged. The new panel must still get its controls and step labels.
    if(isNew||sig!==lastSig){const html=panelHtml(ls);if(panel.innerHTML!==html)panel.innerHTML=html;lastSig=sig;}
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
      window.dispatchEvent(new CustomEvent('russian:mini-check',{detail:{lessonId}}));
    });
  }
  function navigate(step){
    const id=activeLessonId();if(!id||!STEP_ORDER.includes(step))return;
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
    if(core.view==='writing'&&(['next-hand','prev-hand','open-hand-grid','clear-line','clear-canvas','undo-canvas','download-canvas'].includes(act)||target.closest?.('[data-hand-index]')||target.closest?.('[data-hand-practice]')||target.closest?.('[data-write-index]'))){
      const old=lessonState(id)?.steps?.alphabet||{};
      touch('alphabet',{practiceActions:Number(old.practiceActions||0)+1,provenance:'print_to_cursive_practice'},id);
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
  document.addEventListener('pointerdown',event=>{if(readCore().view==='writing'&&event.target?.closest?.('#writingCanvas')){writingStrokeActive=true;writingStrokeMoved=false;}},true);
  document.addEventListener('pointermove',event=>{if(writingStrokeActive&&event.target?.closest?.('#writingCanvas'))writingStrokeMoved=true;},true);
  document.addEventListener('pointerup',event=>{
    if(!writingStrokeActive)return;
    const moved=writingStrokeMoved&&event.target?.closest?.('#writingCanvas');
    writingStrokeActive=false;writingStrokeMoved=false;
    if(!moved)return;
    const id=activeLessonId();if(!id)return;
    const old=lessonState(id)?.steps?.alphabet||{};
    touch('alphabet',{practiceActions:Number(old.practiceActions||0)+1,strokeActions:Number(old.strokeActions||0)+1,provenance:'print_to_cursive_stroke'},id);
  },true);
  document.addEventListener('change',event=>{if(event.target?.id==='stageSelect')after(40,scheduleRender);},true);
  window.addEventListener('russian:learning-state',scheduleRender);
  document.addEventListener('DOMContentLoaded',()=>{
    scheduleRender();
    // The core has already loaded the required knowledge index. Consume its
    // canonical snapshot rather than racing an independent fetch with navigation.
    window.addEventListener('russian:core-render',event=>{
      const data=event?.detail?.knowledgeIndex;
      if(Array.isArray(data))knowledge=data.map(x=>({id:clean(x.id),title:clean(x.title),stage:clean(x.stage)})).filter(x=>x.id);
      renderPanel();
    });
  });
  window.RussianLearningFlow={
    schema:SCHEMA,
    legacySchema:LEGACY_SCHEMA,
    get:()=>JSON.parse(JSON.stringify(flow)),
    activeLessonId,touch,navigate,statusFor,hasMeaningfulEvidence,nextSuggested,
    reviewStep,dueReviewsForLesson,adaptiveNext
  };

  // Pre-A0 first action: reuse R02/RHW canonical source paths; no mastery or RU03 writes.
  const preA0={step:0,open:true,source:null,pending:false,error:'',heard:false,recorded:false,
    seen:false,letter:false,typed:'',matched:false,status:''};
  const preA0Steps=['Nghe','Nhại','Nhận diện hình','Nhận mặt chữ','Phản xạ','Tự đối chiếu'];
  const preA0Esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const preA0Enabled=()=>{const c=readCore();return c.stage==='vn'&&c.view==='learning'&&['R01','R02'].includes(activeLessonId())};
  async function preA0Load(){
    if(preA0.source||preA0.pending||!preA0Enabled())return;
    preA0.pending=true;
    try{
      const responses=await Promise.all(['data/listen-write-lessons.json','data/handwriting-listen-write.json'].map(p=>fetch(p)));
      if(responses.some(r=>!r.ok))throw Error('Dữ liệu nguồn chưa có trong bộ offline');
      const [rows,letters]=await Promise.all(responses.map(r=>r.json()));
      const lesson=rows.find(r=>r.id==='LW_R02'&&r.lessonId==='R02');
      const intro=lesson?.items?.find(i=>i.id==='LW_ITEM_R02_INTRO')?.printSample||'';
      const name=lesson?.items?.find(i=>i.id==='LW_ITEM_R02_NAME')?.printSample||'';
      const hello=intro.split('.')[0]?.trim();
      const a=letters.find(r=>r.id==='RHW_AZ_01'&&r.letter==='А');
      if(!hello||!intro.startsWith(hello+'.')||!name||!a?.drills?.some(d=>d.kind==='hear_select'))
        throw Error('Nguồn R02/RHW_AZ_01 sai hợp đồng; không được tự sinh đáp án');
      preA0.source={hello:hello+'.',name,letter:a.letter,choices:a.drills.find(d=>d.kind==='hear_select').choices};
      preA0.error='';
    }catch(e){preA0.error=String(e.message||e)}
    finally{preA0.pending=false;preA0Render()}
  }
  function preA0Voice(){
    try{return !!window.speechSynthesis?.getVoices?.().some(v=>/^ru[-_]/i.test(v.lang||''))}
    catch(_){return false}
  }
  const preA0Button=(act,label)=>'<button type="button" class="btn" data-prea0="'+act+'">'+label+'</button>';
  function preA0Body(){
    const p=preA0,s=p.source;
    if(!s)return '<p role="status">'+preA0Esc(p.error||'Đang đọc nguồn R02 và 33 chữ Cyrillic…')+'</p>';
    if(p.step===0)return '<p>Nghe trước khi đọc; TTS máy chưa được RU03 kiểm định.</p>'+
      (preA0Voice()?preA0Button('speak','▶ Nghe mẫu ru-RU'):'<p>BLOCKED_AUDIO: chưa có giọng ru-RU trên thiết bị. Không giả phát âm chuẩn.</p>')+
      ' '+preA0Button('reveal','Mở chữ sau lượt nghe')+
      (p.revealed?'<p lang="ru"><strong>'+preA0Esc(s.hello)+'</strong></p>':'')+
      '<p role="status">'+preA0Esc(p.status)+'</p>';
    if(p.step===1)return '<p>Nhại câu chào. Có thể ghi âm rồi nghe lại trên thiết bị; không chấm phát âm.</p>'+
      '<p lang="ru"><strong>'+preA0Esc(s.hello)+'</strong></p>'+
      preA0Button('record','● Bắt đầu ghi âm')+' '+preA0Button('stop','■ Dừng ghi âm')+
      (p.recorded?' '+preA0Button('replay','▶ Nghe lại giọng mình'):'')+
      '<p role="status">'+preA0Esc(p.status)+'</p>';
    if(p.step===2)return '<p>Nhìn tình huống 👋 🏫, chọn câu tiếng Nga phù hợp (gợi ý bằng biểu tượng).</p>'+
      '<button type="button" class="btn" data-prea0="visual" data-answer="hello" lang="ru">'+preA0Esc(s.hello)+'</button> '+
      '<button type="button" class="btn" data-prea0="visual" data-answer="name" lang="ru">'+preA0Esc(s.name)+'</button>'+
      '<p role="status">'+preA0Esc(p.status)+'</p>';
    if(p.step===3)return '<p>Nhận mặt chữ in theo RHW_AZ_01. Mẫu viết tay chuẩn đang BLOCKED.</p>'+
      '<p lang="ru" style="font-size:1.5em">А а</p>'+
      s.choices.map(v=>'<button type="button" class="btn" data-prea0="letter" data-answer="'+preA0Esc(v)+'" lang="ru">'+preA0Esc(v)+'</button>').join(' ')+
      '<p role="status">'+preA0Esc(p.status)+'</p>'+preA0Button('write','Mở luyện viết chữ cái hiện có');
    if(p.step===4)return '<p>Bạn gặp giáo viên ở trường 🏫: hãy tự viết một lời chào ngắn bằng Cyrillic.</p>'+
      '<label for="ruPreA0Reply">Câu tiếng Nga</label><input id="ruPreA0Reply" class="input" lang="ru" autocomplete="off" value="'+preA0Esc(p.typed)+'">'+
      preA0Button('check','Đối chiếu nguyên văn')+'<p role="status">'+preA0Esc(p.status)+'</p>';
    return '<p>Nhật ký thực hành chỉ trong phiên, không ghi điểm/SRS/mastery.</p>'+
      '<p>Nghe TTS: '+(p.heard?'đã thử':'chưa có bằng chứng')+' · Thu giọng: '+(p.recorded?'có':'chưa')+
      ' · Ghép hình: '+(p.seen?'đúng':'chưa')+' · Chữ in: '+(p.letter?'đúng':'chưa')+
      ' · Câu phản xạ: '+(p.matched?'khớp':'chưa')+'</p>'+
      '<p>Trọng âm, giọng mẫu, chữ viết tay chuẩn: <b>UNVERIFIED — HUMAN_RU03_REQUIRED</b>.</p>'+
      preA0Button('restart','Luyện lại');
  }
  function preA0Render(){
    const host=document.getElementById('view');
    if(!host||!preA0Enabled()){document.getElementById('ruPreA0')?.remove();return}
    let panel=document.getElementById('ruPreA0');
    if(!panel){panel=document.createElement('section');panel.id='ruPreA0';panel.className='panel';
      panel.setAttribute('aria-label','Bài thực hành khởi động Pre-A0');host.prepend(panel)}
    panel.innerHTML='<details '+(preA0.open?'open':'')+'><summary><strong>PRE-A0 · Nghe–nói trước</strong> · '+(preA0.step+1)+'/6 · nguồn R02 (chưa duyệt RU03)</summary>'+
      '<p>Đây là hoạt động thực hành bổ trợ, không mở khóa hay cấp điểm.</p>'+
      '<h3>'+preA0Steps[preA0.step]+'</h3>'+preA0Body()+
      '<p>'+(preA0.step?preA0Button('prev','← Trước')+' ':'')+
      (preA0.step<5?preA0Button('next','Tiếp →'):'')+'</p></details>';
  }
  document.addEventListener('click',async event=>{
    const btn=event.target?.closest?.('#ruPreA0 [data-prea0]');
    if(!btn)return;
    event.preventDefault();event.stopPropagation();
    const a=btn.dataset.prea0,s=preA0.source;
    if(a==='next')preA0.step=Math.min(5,preA0.step+1);
    else if(a==='prev')preA0.step=Math.max(0,preA0.step-1);
    else if(a==='restart'){preA0.step=0;preA0.status=''}
    else if(a==='reveal')preA0.revealed=true;
    else if(a==='speak'&&s){
      if(!preA0Voice())preA0.status='BLOCKED_AUDIO: không có giọng ru-RU';
      else{
        const result=window.RussianAudioEngine?.speak?.(s.hello,{lang:'ru-RU',rate:.85,
          onStart:()=>{preA0.heard=true;preA0.status='Đã phát thử TTS máy, không xác nhận âm chuẩn';preA0Render()},
          onError:()=>{preA0.status='TTS lỗi; không ghi nhận đã nghe';preA0Render()}});
        if(!result?.started)preA0.status='TTS không khả dụng';
      }
    }else if(a==='record'){
      const result=await window.RussianRecordingEngine?.start?.({maxDurationMs:20000,
        onStop:take=>{preA0.recorded=!!take?.size;preA0.status=preA0.recorded?'Đã thu bản ghi tạm trong máy':'Không có dữ liệu âm thanh';preA0Render()},
        onError:()=>{preA0.status='Micro lỗi hoặc bị từ chối';preA0Render()}});
      preA0.status=result?.started?'Đang ghi âm…':'Micro không sẵn sàng, có thể nhại trực tiếp';
    }else if(a==='stop')window.RussianRecordingEngine?.stop?.();
    else if(a==='replay'){
      const take=window.RussianRecordingEngine?.getLastRecording?.();
      if(take?.url)window.RussianAudioEngine?.playSource?.(take.url,{sourceType:'LOCAL_RECORDING'});
      else preA0.status='Chưa có bản ghi để nghe';
    }else if(a==='visual'){
      preA0.seen=btn.dataset.answer==='hello';
      preA0.status=preA0.seen?'Đúng tình huống chào hỏi':'Thử lại: 👋 là hành động chào';
    }else if(a==='letter'){
      preA0.letter=btn.dataset.answer===s?.letter;
      preA0.status=preA0.letter?'Đúng chữ А in':'Chưa đúng; so sánh với А а';
    }else if(a==='write'){document.querySelector('#nav [data-view="writing"]')?.click();return}
    else if(a==='check'){
      preA0.matched=preA0.typed.trim()===s?.hello;
      preA0.status=preA0.matched?'Khớp câu mẫu nguồn R02; không chấm phát âm':'Đáp án trong nguồn R02: '+(s?.hello||'');
    }
    preA0Render();
  },true);
  document.addEventListener('input',event=>{if(event.target?.id==='ruPreA0Reply')preA0.typed=event.target.value},true);
  document.addEventListener('toggle',event=>{if(event.target?.closest?.('#ruPreA0')&&event.target.matches?.('details'))preA0.open=event.target.open},true);
  window.addEventListener('russian:core-render',()=>{preA0Render();void preA0Load()});
  window.RussianPreA0Candidate={status:()=>({schema:'RUSSIAN_PREA0_FIRST_ACTION_V1',
    source:'LW_R02 / RHW_AZ_01',loaded:!!preA0.source,step:preA0.step,
    audioAuthority:'UNVERIFIED',masteryWrites:false})};

  // R03–R04 CONTENT-FIRST · derived practice projection, NOT a new content/audio/mastery owner.
  // Exact Russian stimuli and answers come only from existing ListenWrite canonical rows.
  const survivalCues=Object.freeze({
    R03:[
      {id:'LW_ITEM_R03_REG',glyph:'🏠 🪪',situation:'Tại quầy ký túc xá: bạn cần đăng ký'},
      {id:'LW_ITEM_R03_DOCS',glyph:'🏠 📄',situation:'Tại quầy ký túc xá: bạn hỏi cần giấy tờ gì'}
    ],
    R04:[
      {id:'LW_ITEM_R04_METRO',glyph:'🚇 🗺️',situation:'Ở phố: bạn cần hỏi đường tới metro'},
      {id:'LW_ITEM_R04_DOCTOR',glyph:'🏥 🩺',situation:'Khi cần hỗ trợ y tế: bạn muốn gặp bác sĩ'}
    ]
  });
  const survivalSteps=['Nghe trước','Nhại và nghe lại','Nhận diện tình huống','Nhận diện chữ in','Phản xạ','Tự đối chiếu'];
  const survival={lessonId:'',items:[],rows:null,loading:false,error:'',itemId:'',step:0,
    open:true,revealed:false,heard:false,recorded:false,visual:false,typed:'',matched:false,
    note:'',attemptedRecording:false,attemptedListening:false};
  function survivalActiveLesson(){
    const core=readCore(),lessonId=activeLessonId();
    return core.stage==='vn'&&core.view==='learning'&&survivalCues[lessonId]?lessonId:'';
  }
  function survivalResetItem(itemId){
    survival.itemId=itemId;survival.step=0;survival.revealed=false;survival.heard=false;
    survival.recorded=false;survival.visual=false;survival.typed='';survival.matched=false;
    survival.note='';survival.attemptedRecording=false;survival.attemptedListening=false;
  }
  function survivalSync(){
    const lessonId=survivalActiveLesson();
    if(!lessonId)return false;
    if(survival.lessonId!==lessonId){
      survival.lessonId=lessonId;survival.error='';survival.items=[];
      survivalResetItem(survivalCues[lessonId][0].id);
    }
    if(!survival.rows)return true;
    const row=survival.rows.find(x=>x.id==='LW_'+lessonId&&x.lessonId===lessonId);
    const expected=survivalCues[lessonId];
    if(!row||row.items?.length!==expected.length){
      survival.items=[];survival.error='SOURCE_BLOCKED: thiếu cấu trúc học liệu của '+lessonId;return true;
    }
    const mapped=expected.map(scene=>{
      const item=row.items.find(x=>x.id===scene.id),drill=item?.drills?.[0];
      if(!item?.printSample||!drill?.audioText||drill.audioText!==item.printSample||
        drill.answer!==item.printSample)return null;
      return {...scene,text:item.printSample,source:row.id,drillKind:drill.kind};
    });
    if(mapped.some(x=>!x)){survival.items=[];survival.error='SOURCE_BLOCKED: câu nguồn âm/chữ không khớp';return true}
    survival.items=mapped;survival.error='';return true;
  }
  async function survivalLoad(){
    if(!survivalActiveLesson()||survival.loading||survival.rows)return;
    survival.loading=true;
    try{
      const response=await fetch('data/listen-write-lessons.json');
      if(!response.ok)throw Error('HTTP '+response.status);
      const rows=await response.json();
      if(!Array.isArray(rows))throw Error('Invalid ListenWrite source format');
      survival.rows=rows;survival.error='';
    }catch(e){survival.error='SOURCE_BLOCKED: '+String(e?.message||e)}
    finally{survival.loading=false;survivalRender()}
  }
  const survivalButton=(act,label,extra='')=>'<button type="button" class="btn" data-survival="'+act+'" '+extra+'>'+label+'</button>';
  function survivalBody(){
    const s=survival,item=s.items.find(x=>x.id===s.itemId);
    if(!item)return '<p role="status">'+preA0Esc(s.error||'Đang lấy các câu mẫu R03–R04 từ dữ liệu học offline…')+'</p>';
    const phrase='<strong lang="ru">'+preA0Esc(item.text)+'</strong>';
    if(s.step===0)return '<p>Nghe trước khi mở chữ; giọng TTS máy <b>UNVERIFIED</b>, không phải bản ghi đã duyệt RU03.</p>'+
      (preA0Voice()?survivalButton('listen','▶ Nghe thử (ru-RU)'):
        '<p role="status">BLOCKED_AUDIO: thiết bị không có giọng ru-RU; không dùng giọng khác thay thế.</p>')+
      ' '+survivalButton('reveal','Mở câu gốc sau lượt nghe')+
      (s.revealed?'<p>'+phrase+'</p>':'')+
      '<p role="status">'+preA0Esc(s.note)+'</p>';
    if(s.step===1)return '<p>Nhại câu mẫu, ghi âm trên thiết bị rồi tự nghe lại; không có điểm phát âm.</p>'+
      '<p>'+phrase+'</p>'+
      survivalButton('record','● Ghi âm')+' '+survivalButton('stop','■ Dừng ghi âm')+
      (s.recorded?' '+survivalButton('replay','▶ Nghe lại giọng mình'):'')+
      '<p role="status">'+preA0Esc(s.note)+'</p>';
    if(s.step===2)return '<p>Nhìn ngữ cảnh '+preA0Esc(item.glyph)+
      ' rồi chọn câu ứng với tình huống; biểu tượng chỉ là gợi ý, chưa phải tranh đã duyệt.</p>'+
      '<p>'+preA0Esc(item.situation)+'</p>'+
      s.items.map(candidate=>survivalButton('visual',preA0Esc(candidate.text),
        'data-id="'+preA0Esc(candidate.id)+'" lang="ru"')).join(' ')+
      '<p role="status">'+preA0Esc(s.note)+'</p>';
    if(s.step===3)return '<p>Nhận diện cách viết Cyrillic của câu; không đánh giá nét chữ viết tay bằng font máy.</p>'+
      '<p>'+phrase+'</p><p>'+preA0Esc(item.glyph)+'</p>'+
      survivalButton('writing','Mở module chữ in → chữ viết tay đang có')+
      '<p><small>Glyph viết tay chuẩn vẫn BLOCKED (thiếu nguồn/giấy phép/kiểm duyệt).</small></p>';
    if(s.step===4)return '<p>'+preA0Esc(item.situation)+'</p>'+
      '<p>Không nhìn đáp án: thử nói câu trả lời, sau đó tự gõ bằng Cyrillic để đối chiếu.</p>'+
      '<label for="ruSurvivalReply">Phản xạ tiếng Nga</label>'+
      '<input id="ruSurvivalReply" class="input" lang="ru" autocomplete="off" value="'+preA0Esc(s.typed)+'">'+
      survivalButton('check','Đối chiếu văn bản')+
      '<p role="status">'+preA0Esc(s.note)+'</p>';
    return '<p>Tổng kết buổi luyện <b>chỉ trong phiên</b>, không cập nhật mastery/SRS/gate.</p>'+
      '<p>Nghe TTS: '+(s.heard?'đã bắt đầu phát thử':s.attemptedListening?'không khả dụng':'chưa thử')+
      ' · Tự ghi âm: '+(s.recorded?'có bản ghi tạm':'chưa có')+
      ' · Ghép câu với tình huống: '+(s.visual?'đã khớp':'chưa')+
      ' · Phản xạ chữ viết: '+(s.matched?'khớp nguyên văn':'chưa khớp')+'</p>'+
      '<p>Nội dung ngôn ngữ, giọng chuẩn, trọng âm, hình ảnh và chữ viết tay: <b>UNVERIFIED · HUMAN_RU03_REQUIRED</b>.</p>'+
      survivalButton('restart','Luyện lại tình huống này');
  }
  function survivalRender(){
    const view=document.getElementById('view');
    if(!view||!survivalSync()){document.getElementById('ruSurvivalPractice')?.remove();return}
    let panel=document.getElementById('ruSurvivalPractice');
    if(!panel){panel=document.createElement('section');panel.id='ruSurvivalPractice';
      panel.className='panel';panel.setAttribute('aria-label','Luyện giao tiếp sinh tồn R03 R04');view.prepend(panel)}
    const sourceReady=survival.items.length===2;
    const selection=survivalCues[survival.lessonId].map(scene=>{
      const active=scene.id===survival.itemId;
      return survivalButton('scenario',preA0Esc(scene.glyph)+' · '+preA0Esc(scene.situation),
        'data-id="'+preA0Esc(scene.id)+'" aria-pressed="'+active+'"');
    }).join(' ');
    panel.innerHTML='<details '+(survival.open?'open':'')+'><summary><strong>'+
      (survival.lessonId==='R03'?'R03 · Ký túc xá / giấy tờ':'R04 · Metro / sức khỏe')+
      '</strong> · '+(survival.step+1)+'/6 · <small>candidate · RU03 chưa duyệt</small></summary>'+
      '<p>Thực hành với nguồn ListenWrite hiện có. Không phải bài kiểm tra phát âm.</p>'+
      '<div class="lesson-tools" role="group" aria-label="Chọn tình huống">'+selection+'</div>'+
      '<h3>'+survivalSteps[survival.step]+'</h3>'+survivalBody()+
      '<p>'+(survival.step>0?survivalButton('prev','← Trước')+' ':'')+
      (survival.step<5?survivalButton('next','Tiếp →',sourceReady?'':'disabled'):'')+'</p>'+
      '</details>';
  }
  document.addEventListener('click',async event=>{
    const btn=event.target?.closest?.('#ruSurvivalPractice [data-survival]');
    if(!btn)return;
    event.preventDefault();event.stopPropagation();
    if(!survivalActiveLesson())return;
    const action=btn.dataset.survival,item=survival.items.find(x=>x.id===survival.itemId);
    if(action==='scenario'){
      if(!survivalCues[survival.lessonId].some(x=>x.id===btn.dataset.id))return;
      survivalResetItem(btn.dataset.id);
    }else if(!item)return;
    else if(action==='next')survival.step=Math.min(5,survival.step+1);
    else if(action==='prev')survival.step=Math.max(0,survival.step-1);
    else if(action==='restart')survivalResetItem(item.id);
    else if(action==='reveal')survival.revealed=true;
    else if(action==='listen'){
      survival.attemptedListening=true;
      if(!preA0Voice())survival.note='BLOCKED_AUDIO: thiếu giọng ru-RU';
      else{
        const expectedId=item.id;
        const result=window.RussianAudioEngine?.speak?.(item.text,{
          lang:'ru-RU',rate:.85,
          onStart:()=>{if(survival.itemId!==expectedId)return;
            survival.heard=true;survival.note='Đã bắt đầu TTS máy, chưa chứng thực âm chuẩn';survivalRender()},
          onError:()=>{if(survival.itemId!==expectedId)return;
            survival.heard=false;survival.note='TTS không phát được';survivalRender()}
        });
        if(!result?.started)survival.note='TTS chưa khả dụng trên thiết bị';
      }
    }else if(action==='record'){
      survival.attemptedRecording=true;
      const expectedId=item.id;
      const result=await window.RussianRecordingEngine?.start?.({maxDurationMs:20000,
        onStop:take=>{if(survival.itemId!==expectedId)return;
          survival.recorded=!!take?.size;survival.note=survival.recorded?
          'Bản ghi tạm thời đã có; không có chấm phát âm':'Không có âm thanh thu được';survivalRender()},
        onError:()=>{if(survival.itemId!==expectedId)return;survival.note='Micro lỗi/từ chối';survivalRender()}
      });
      if(survival.itemId!==expectedId)return;
      survival.note=result?.started?'Đang ghi âm cục bộ':'Micro chưa sẵn sàng; vẫn có thể nhại trực tiếp';
    }else if(action==='stop')window.RussianRecordingEngine?.stop?.();
    else if(action==='replay'){
      if(!survival.recorded){survival.note='Chưa có bản ghi cho tình huống này'}
      else{
        const take=window.RussianRecordingEngine?.getLastRecording?.();
        if(take?.url)window.RussianAudioEngine?.playSource?.(take.url,{sourceType:'LOCAL_RECORDING'});
        else survival.note='Bản ghi tạm đã hết hạn';
      }
    }else if(action==='visual'){
      survival.visual=btn.dataset.id===item.id;
      survival.note=survival.visual?'Đã ghép đúng câu với ngữ cảnh (văn bản chưa kiểm định RU03)':
        'Thử lại, xem biểu tượng và tình huống';
    }else if(action==='writing'){
      document.querySelector('[data-view="writing"]')?.click();return;
    }else if(action==='check'){
      survival.matched=survival.typed.trim()===item.text;
      survival.note=survival.matched?'Khớp đúng văn bản nguồn, không chấm nói':
        'Đối chiếu nguyên văn với nguồn: '+item.text;
    }
    survivalRender();
  },true);
  document.addEventListener('input',event=>{
    if(event.target?.id==='ruSurvivalReply')survival.typed=event.target.value;
  },true);
  document.addEventListener('toggle',event=>{
    if(event.target?.closest?.('#ruSurvivalPractice')&&event.target.matches?.('details'))
      survival.open=event.target.open;
  },true);
  window.addEventListener('russian:core-render',()=>{survivalRender();void survivalLoad()});
  window.RussianSurvivalPracticeCandidate={status:()=>({
    schema:'RUSSIAN_SURVIVAL_R03_R04_PRACTICE_V1',lessonId:survival.lessonId,
    selectedItem:survival.itemId,step:survival.step,sourceReady:survival.items.length===2,
    audioAuthority:'UNVERIFIED',illustrationAuthority:'SYMBOL_ONLY_UNVERIFIED',
    transcriptionScoring:'TEXT_MATCH_ONLY',masteryWrites:false
  })};
})();