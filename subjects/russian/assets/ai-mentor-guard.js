'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const SCHEMA='RUSSIAN_AI_MENTOR_CONTEXT_V2';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));

  function activePolicy(){return window.RussianRuntimeData?.get?.('ai-mentor-policy')||null}
  function provenance(){return window.RussianRuntimeData?.get?.('provenance')||null}
  function datasetIdsForRoute(route){
    const ids=[];
    if(route.view==='vocab')ids.push('vocab');
    if(route.view==='grammar')ids.push('grammar');
    if(route.view==='dialogue'||route.learnTab==='practice')ids.push('speaking','scenario-registry');
    if(route.view==='writing')ids.push('writing','performance-tasks','academic-functions','technical-concepts');
    if(route.view==='learning'&&route.learnTab==='theory')ids.push('lessons','reading','academic-functions','technical-concepts');
    if(route.view==='learning'&&['review','exam','exercises'].includes(route.learnTab))ids.push('assessment-bank');
    return [...new Set(ids)];
  }
  function trustSummary(route){
    const p=provenance();
    const wanted=new Set(datasetIdsForRoute(route));
    const rows=Array.isArray(p?.datasets)?p.datasets:[];
    return rows.filter(x=>wanted.has(x.id)).map(x=>({
      id:x.id,
      trust:x.ru03?.trust||x.trust||x.status||'UNKNOWN',
      validation:x.ru03?.validation||x.validation||'UNVERIFIED',
      confidence:x.ru03?.confidence||x.confidence||null,
      sourceRefs:Array.isArray(x.sourceRefs)?x.sourceRefs.slice(0,4):[]
    }));
  }
  function scenarioSummary(){
    const run=window.RussianScenarioEngine?.get?.()?.run;
    if(!run)return null;
    return {runId:clean(run.runId),scenarioId:clean(run.scenarioId),nodeId:clean(run.nodeId),status:clean(run.status),turn:Number(run.turn)||0,supportLevel:Number(run.supportLevel)||0};
  }
  function productionSummary(){
    const c=window.RussianAcademicProduction?.context?.();
    if(!c)return null;
    return {taskId:clean(c.taskId),mode:clean(c.mode),targets:clone(c.targets||[]),sourceRefs:clone((c.sourceRefs||[]).slice(-8)),claimCount:Number(c.claimCount)||0,generatedClaimCount:Number(c.generatedClaimCount)||0,authoritative:false};
  }
  function policySummary(){
    const p=activePolicy();
    const perm=p?.permissions||{};
    return {
      schema:p?.schema||'MISSING_POLICY',
      phase:p?.phase||'UNKNOWN',
      canonicalTruthOwner:p?.authority?.canonicalTruthOwner||'RU03',
      assessmentMasteryOwner:p?.authority?.assessmentMasteryOwner||'RU04',
      speechScenarioOwner:p?.authority?.speechAudioScenarioOwner||'RU05',
      academicProductionOwner:p?.authority?.academicResearchProductionOwner||'RU06',
      authoringPromotionOwner:p?.authority?.authoringPromotionOwner||'RU08',
      canonicalStateReadOnly:true,
      masteryReadOnly:true,
      aiMaySuggest:perm.suggest===true,
      aiMayExplain:perm.explain===true,
      aiMayGeneratePractice:perm.generateTemporaryPractice===true,
      aiMayModifyMastery:perm.writeMastery===true,
      aiMayWritePlanner:perm.writePlanner===true,
      aiMayUnlockStage:perm.unlockStage===true,
      aiMayGenerateCanonicalContent:perm.generateCanonicalContent===true
    };
  }

  function buildContext(){
    const c=readCore();
    const learning=window.RussianLearningState?.get?.()||{};
    const flow=window.RussianLearningFlow?.get?.()||{};
    const vocab=window.RussianVocabSRS?.context?.()||null;
    const speaking=window.RussianSpeakingCoach?.context?.()||null;
    const academic=window.RussianAcademicLanguage?.context?.()||null;
    const lessonId=clean(c.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.());
    const reviewQueue=Object.values(learning.reviewQueue||{});
    const reviewIds=Object.keys(learning.reviewQueue||{});
    const reviewDue=reviewQueue.filter(x=>!x?.dueAt||Date.parse(x.dueAt)<=Date.now()).length;
    const route={view:clean(c.view)||'overview',learnTab:clean(c.learnTab),stage:clean(c.stage)||'vn',lessonId,slide:Math.max(0,Number(c.slide)||0)};
    const resume=clone(learning.resume||null);
    const canonical=window.BaumanFoundationCanonicalContext?.current?.({
      subjectId:'russian',
      route,
      resume,
      reviewIds:reviewIds.slice(0,20),
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
      scenario:scenarioSummary(),
      production:productionSummary(),
      grounding:{datasets:trustSummary(route),sourceRefs:productionSummary()?.sourceRefs||[],conversationSummaryCanonical:false,wholeDatasetDump:false},
      canonical:clone(canonical),
      policy:policySummary()
    };
  }

  function injectGuard(){
    const mentor=document.querySelector('.ai-mentor');
    if(!mentor||mentor.querySelector('[data-ru-ai-guard]'))return;
    const ctx=buildContext();
    const note=document.createElement('section');
    note.dataset.ruAiGuard='1';
    note.className='ru-ai-guard';
    const trust=ctx.grounding.datasets.map(x=>x.id+': '+x.validation).slice(0,3).join(' · ')||'không có claim authoritative mới';
    note.innerHTML=`<b>AI dùng ngữ cảnh tối thiểu, không sửa tiến độ</b><span>${ctx.route.lessonId?`Bài ${ctx.route.lessonId} · `:''}${ctx.route.view}${ctx.route.learnTab?` / ${ctx.route.learnTab}`:''} · ${ctx.reviewDue} mục ôn đến hạn</span><small>RU03 grounding: ${trust}. Gợi ý AI là non-canonical; RU04 giữ quyền mastery, RU05 giữ scenario state, RU06 giữ production lineage.</small>`;
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
  window.addEventListener('russian:runtime-data-ready',injectGuard);
  window.addEventListener('russian:oral-evidence',injectGuard);
  window.addEventListener('russian:academic-production-evidence',injectGuard);
  window.RussianAIMentorGuard={schema:SCHEMA,buildContext,policy:policySummary,trustSummary};
})();
