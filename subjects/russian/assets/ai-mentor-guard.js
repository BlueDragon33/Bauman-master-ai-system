'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const SCHEMA='RUSSIAN_AI_MENTOR_CONTEXT_V1';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));

  function buildContext(){
    const core=readCore();
    const learning=window.RussianLearningState?.get?.()||{};
    const flow=window.RussianLearningFlow?.get?.()||{};
    const vocab=window.RussianVocabSRS?.context?.()||null;
    const speaking=window.RussianSpeakingCoach?.context?.()||null;
    const academic=window.RussianAcademicLanguage?.context?.()||null;
    const lessonId=clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.());
    const reviewEntries=Object.entries(learning.reviewQueue||{});
    const reviewQueue=reviewEntries.map(([,value])=>value);
    const reviewDue=reviewQueue.filter(x=>!x?.dueAt||Date.parse(x.dueAt)<=Date.now()).length;
    const route={view:clean(core.view)||'overview',learnTab:clean(core.learnTab),stage:clean(core.stage)||'vn',lessonId,slide:Math.max(0,Number(core.slide)||0)};
    const resume=clone(learning.resume||null);
    const canonical=window.BaumanFoundationCanonicalContext?.current?.({
      subjectId:'russian',
      route,
      resume,
      reviewIds:reviewEntries.map(([id])=>id),
      lessonId,
      hostTask:window.BaumanSubjectHost?.getTask?.()||window.BAUMAN_HOST_TASK||null
    })||null;
    return {
      schema:SCHEMA,
      subjectId:'russian',
      generatedAt:new Date().toISOString(),
      route,
      resume,
      reviewDue,
      lessonEvidence:lessonId?clone(flow.lessons?.[lessonId]||null):null,
      vocab:clone(vocab),
      speaking:clone(speaking),
      academic:clone(academic),
      canonical:clone(canonical),
      policy:{canonicalStateReadOnly:true,canonicalIdentityReadOnly:true,masteryReadOnly:true,aiMaySuggest:true,aiMayExplain:true,aiMayGeneratePractice:true,aiMayModifyMastery:false,aiMayCompleteTasks:false}
    };
  }

  function injectGuard(){
    const mentor=document.querySelector('.ai-mentor');
    if(!mentor||mentor.querySelector('[data-ru-ai-guard]'))return;
    const ctx=buildContext();
    const note=document.createElement('section');
    note.dataset.ruAiGuard='1';
    note.className='ru-ai-guard';
    note.innerHTML=`<b>AI dùng ngữ cảnh hiện tại, không sửa tiến độ</b><span>${ctx.route.lessonId?`Bài ${ctx.route.lessonId} · `:''}${ctx.route.view}${ctx.route.learnTab?` / ${ctx.route.learnTab}`:''} · ${ctx.reviewDue} mục ôn đến hạn</span><small>Gợi ý của AI tách khỏi canonical learning state. Chỉ thao tác học thật hoặc xác nhận của bạn mới được ghi vào tiến độ.</small>`;
    const head=mentor.querySelector('.ai-head');
    if(head)head.after(note);else mentor.prepend(note);
  }

  function observe(){
    const modal=document.getElementById('modalBody');
    if(!modal)return;
    new MutationObserver(injectGuard).observe(modal,{childList:true,subtree:false});
    injectGuard();
  }

  document.addEventListener('DOMContentLoaded',observe);
  window.RussianAIMentorGuard={schema:SCHEMA,buildContext,policy:()=>buildContext().policy};
})();
