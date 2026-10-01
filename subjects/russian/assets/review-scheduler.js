'use strict';
(function(){
  const SCHEMA='RUSSIAN_REVIEW_SCHEDULER_V1';
  const DAY=86400000;
  const PROFILES=Object.freeze({
    'vocabulary-active':[1,3,7,14],
    'vocabulary-passive':[3,7,14,30],
    'grammar-concept':[1,3,7,14,28],
    'listening-contrast':[1,2,5,10,21],
    'speaking-function':[1,2,4,7,14],
    'integrated-performance':[2,7,14,28]
  });
  const iso=(ms)=>new Date(ms).toISOString();
  function profile(kind='vocabulary-active',override=[]){
    const custom=Array.isArray(override)?override.map(Number).filter(x=>Number.isFinite(x)&&x>0):[];
    return custom.length?custom:(PROFILES[kind]||PROFILES['vocabulary-active']);
  }
  function schedule(input={}){
    const kind=String(input.kind||'vocabulary-active');
    const result=String(input.result||'recalled');
    const streak=Math.max(0,Number(input.successStreak)||0);
    const lapses=Math.max(0,Number(input.lapses)||0);
    const base=Number.isFinite(Number(input.nowMs))?Number(input.nowMs):Date.now();
    const gaps=profile(kind,input.gaps);
    if(result==='forgot')return {schema:SCHEMA,kind,result,gapDays:0,dueAt:iso(base),nextSuccessStreak:0,nextLapses:lapses+1,reason:'srs_forgot'};
    if(result==='unsure')return {schema:SCHEMA,kind,result,gapDays:gaps[0]||1,dueAt:iso(base+(gaps[0]||1)*DAY),nextSuccessStreak:0,nextLapses:lapses,reason:'srs_unsure'};
    const nextStreak=streak+1;
    const gap=gaps[Math.min(Math.max(0,nextStreak-1),gaps.length-1)]||1;
    return {schema:SCHEMA,kind,result,gapDays:gap,dueAt:iso(base+gap*DAY),nextSuccessStreak:nextStreak,nextLapses:lapses,reason:'srs_scheduled_recall'};
  }
  function immediate(input={}){return schedule({...input,result:'forgot'});}
  window.RussianReviewScheduler={schema:SCHEMA,profiles:PROFILES,schedule,immediate};
})();
