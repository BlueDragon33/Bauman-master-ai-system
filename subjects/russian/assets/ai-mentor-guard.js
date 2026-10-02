'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const SCHEMA='RUSSIAN_AI_MENTOR_CONTEXT_V2';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  function provider(){
    const p=window.BaumanAIProvider||window.BAUMAN_AI_PROVIDER||null;
    const available=Boolean(p&&(typeof p.generate==='function'||typeof p.chat==='function'));
    return {available,mode:available?'PROVIDER':'DETERMINISTIC_FALLBACK',label:available?'AI provider đã kết nối':'Fallback cục bộ · không gọi model'};
  }
  function buildContext(){
    const core=readCore(),learning=window.RussianLearningState?.get?.()||{},flow=window.RussianLearningFlow?.get?.()||{};
    const lessonId=clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.());
    const reviewQueue=Object.values(learning.reviewQueue||{});const reviewIds=Object.keys(learning.reviewQueue||{});
    const route={view:clean(core.view)||'overview',learnTab:clean(core.learnTab),stage:clean(core.stage)||'vn',lessonId,slide:Math.max(0,Number(core.slide)||0)};
    const resume=clone(learning.resume||null);
    const canonical=window.BaumanFoundationCanonicalContext?.current?.({subjectId:'russian',route,resume,reviewIds,lessonId,hostTask:window.BaumanSubjectHost?.getTask?.()||window.BAUMAN_HOST_TASK||null})||null;
    return {schema:SCHEMA,subjectId:'russian',generatedAt:new Date().toISOString(),route,resume,reviewDue:reviewQueue.filter(x=>!x?.dueAt||Date.parse(x.dueAt)<=Date.now()).length,lessonEvidence:lessonId?clone(flow.lessons?.[lessonId]||null):null,vocab:clone(window.RussianVocabSRS?.context?.()||null),speaking:clone(window.RussianSpeakingCoach?.context?.()||null),academic:clone(window.RussianAcademicLanguage?.context?.()||null),academicProduction:clone(window.RussianAcademicProduction?.get?.()||null),scenario:clone(window.RussianScenarioRuntime?.context?.()||null),canonical,provider:provider(),policy:{canonicalStateReadOnly:true,canonicalIdentityReadOnly:true,masteryReadOnly:true,aiMaySuggest:true,aiMayExplain:true,aiMayGeneratePractice:true,aiMayModifyMastery:false,aiMayCompleteTasks:false,generatedPracticeEphemeral:true,assessmentAnswerLeakForbidden:true}};
  }
  function injectGuard(){
    const mentor=document.querySelector('.ai-mentor');if(!mentor)return;
    mentor.querySelector('[data-ru-ai-guard]')?.remove();
    const ctx=buildContext(),note=document.createElement('section');note.dataset.ruAiGuard='1';note.className='ru-ai-guard';note.dataset.providerMode=ctx.provider.mode;
    note.innerHTML=`<b>${ctx.provider.label}</b><span>${ctx.route.lessonId?`Bài ${ctx.route.lessonId} · `:''}${ctx.route.view}${ctx.route.learnTab?` / ${ctx.route.learnTab}`:''} · ${ctx.reviewDue} mục ôn đến hạn</span><small>${ctx.provider.available?'AI chỉ được gợi ý trong ranh giới canonical context; không sửa mastery/state.':'Các câu trả lời hiện tại là mẫu deterministic cục bộ, không phải output từ model AI và không phải nguồn ngôn ngữ có thẩm quyền.'}</small>`;
    const head=mentor.querySelector('.ai-head');if(head)head.after(note);else mentor.prepend(note);
    const run=mentor.querySelector('[data-act="ai-run"]');if(run&&!ctx.provider.available){run.textContent='Nhận gợi ý cục bộ';run.dataset.fallback='deterministic';}
    mentor.querySelectorAll('[data-ai-quick]').forEach(b=>{if(!ctx.provider.available)b.title='Fallback deterministic cục bộ; không gọi model';});
  }
  function observe(){const modal=document.getElementById('modalBody');if(!modal)return;new MutationObserver(injectGuard).observe(modal,{childList:true,subtree:false});injectGuard();}
  document.addEventListener('DOMContentLoaded',observe);
  window.RussianAIMentorGuard={schema:SCHEMA,buildContext,provider,policy:()=>buildContext().policy,refresh:injectGuard};
})();