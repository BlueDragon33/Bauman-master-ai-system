'use strict';
(function(){
  const SCHEMA='RUSSIAN_ADAPTIVE_PLANNER_V1';
  const STORAGE_KEY='bauman_russian_personalization_v1';
  const CORE_KEY=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const clean=v=>String(v??'').trim();
  const copy=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null}};
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const defaultState=()=>({schema:SCHEMA,algorithmVersion:'p5-v1',mode:'normal',manualOverrides:[],updatedAt:null});
  function read(){
    const x=parse(localStorage.getItem(STORAGE_KEY),defaultState());
    return {...defaultState(),...x,schema:SCHEMA,manualOverrides:Array.isArray(x?.manualOverrides)?x.manualOverrides:[]};
  }
  let state=read();
  const candidateSources=new Map();
  function write(){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch(e){console.warn('Russian personalization save failed',e);return false}
  }
  const REASONS=Object.freeze({
    DUE_REVIEW:'due_review',
    VOCAB_DUE:'vocabulary_due',
    WEAKNESS_REPAIR:'weakness_repair',
    SKILL_BALANCE:'skill_balance',
    CONTINUE_PATH:'continue_path',
    MANUAL_OVERRIDE:'manual_override'
  });
  const reasonLabels={
    due_review:'Đến hạn ôn theo bằng chứng học trước đó',
    vocabulary_due:'Thẻ từ vựng đến hạn SRS',
    weakness_repair:'Điểm yếu cần sửa từ evidence đánh giá',
    skill_balance:'Cân bằng kỹ năng để tránh chỉ học nhận diện',
    continue_path:'Tiếp tục đúng lộ trình đang học',
    manual_override:'Nhiệm vụ được giáo viên/người học ưu tiên thủ công'
  };
  const skillRoute={
    listening:{view:'media'}, speaking:{view:'dialogue'}, writing:{view:'writing'},
    technical:{view:'learning',learnTab:'theory'}, grammar:{view:'grammar'}, vocabulary:{view:'vocab'}
  };
  function normalizeTask(task={}){
    const route=task.route&&typeof task.route==='object'?task.route:{view:'overview'};
    const id=clean(task.id)||['plan',task.reason||'task',route.view||'',route.learnTab||'',route.lessonId||'',route.vocabKey||''].join(':');
    return {id,label:clean(task.label)||'Nhiệm vụ học',skill:clean(task.skill)||'general',reason:clean(task.reason)||REASONS.CONTINUE_PATH,route,priority:Number(task.priority)||0,source:clean(task.source)||'planner'};
  }
  function assessmentSnapshot(){return window.RussianAssessmentMastery?.exportState?.()||{}}
  function learningSnapshot(){return window.RussianLearningState?.get?.()||{}}
  function vocabSnapshot(){return window.RussianVocabSrs?.get?.()||{}}
  function dueLearning(){
    const rows=window.RussianLearningState?.dueReviews?.()||[];
    return rows.slice(0,40).map((x,i)=>normalizeTask({
      id:'review:'+clean(x.id||i),label:x.label||'Ôn lại nội dung đến hạn',
      skill:clean(x.skill)||'review',reason:REASONS.DUE_REVIEW,route:x.route||{view:'learning',learnTab:'review'},
      priority:1000-i,source:'learning-state'
    }));
  }
  function dueVocab(){
    const rows=window.RussianVocabSrs?.dueCards?.()||[];
    return rows.slice(0,40).map((x,i)=>normalizeTask({
      id:'vocab:'+clean(x.key||x.sourceId||x.index||i),label:'Ôn từ · '+clean(x.term||x.sourceId||'đến hạn'),
      skill:'vocabulary',reason:REASONS.VOCAB_DUE,
      route:{view:'vocab',vocabStage:clean(x.stage),vocabKey:clean(x.sourceId),vocabIndex:Number(x.stageIndex??x.index??0)||0},
      priority:950-i,source:'vocab-srs'
    }));
  }
  function weaknessTasks(){
    const w=assessmentSnapshot().weaknesses||{};
    return Object.entries(w).slice(0,30).map(([id,x],i)=>{
      const skill=clean(x?.skill||x?.dimension||x?.type)||'general';
      return normalizeTask({
        id:'weak:'+id,label:clean(x?.label||x?.title)||('Sửa điểm yếu · '+id),
        skill,reason:REASONS.WEAKNESS_REPAIR,route:x?.route||skillRoute[skill]||{view:'learning',learnTab:'review'},
        priority:900-i,source:'assessment-mastery'
      });
    });
  }
  function continueTask(){
    const resume=learningSnapshot().resume;
    if(!resume?.route)return [];
    return [normalizeTask({id:'continue:'+clean(resume.lessonId||resume.route.view),label:resume.activity||'Tiếp tục phần đang học',skill:'path',reason:REASONS.CONTINUE_PATH,route:resume.route,priority:500,source:'learning-state'})];
  }
  function balanceTasks(existing){
    const present=new Set(existing.map(x=>x.skill));
    const wanted=['listening','speaking','writing','technical'];
    return wanted.filter(s=>!present.has(s)).map((skill,i)=>normalizeTask({
      id:'balance:'+skill,label:{listening:'Luyện nghe chủ động',speaking:'Luyện nói / phản xạ',writing:'Luyện viết sản sinh',technical:'Tiếng Nga kỹ thuật'}[skill],
      skill,reason:REASONS.SKILL_BALANCE,route:skillRoute[skill],priority:300-i,source:'skill-balance'
    }));
  }
  function registerCandidateSource(sourceId,producer){
    const id=clean(sourceId);
    if(!id||typeof producer!=='function')return false;
    candidateSources.set(id,producer);
    return true;
  }
  function unregisterCandidateSource(sourceId){return candidateSources.delete(clean(sourceId))}
  function listCandidateSources(){return [...candidateSources.keys()].sort()}
  function externalCandidates(options={}){
    const out=[];
    const context={
      mode:clean(options.mode||state.mode)||'normal',
      stage:clean(readCore().stage)||'vn',
      assessment:copy(assessmentSnapshot()),
      learning:copy(learningSnapshot()),
      vocab:copy(vocabSnapshot())
    };
    for(const [sourceId,producer] of [...candidateSources.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
      let rows=[];
      try{rows=producer(copy(context))}catch(e){console.warn('Russian planner candidate source failed',sourceId,e);continue}
      if(!Array.isArray(rows))continue;
      for(const raw of rows.slice(0,20)){
        const t=normalizeTask({...raw,source:clean(raw?.source)||sourceId});
        if(t.reason===REASONS.MANUAL_OVERRIDE)continue;
        t.priority=Math.max(0,Math.min(899,Number(t.priority)||0));
        out.push(t);
      }
    }
    return dedupe(out);
  }
  function activeOverrides(){
    const now=Date.now();
    return state.manualOverrides.filter(x=>!x.expiresAt||Date.parse(x.expiresAt)>now).map((x,i)=>normalizeTask({...x,reason:REASONS.MANUAL_OVERRIDE,priority:1100-i,source:'manual-override'}));
  }
  function dedupe(tasks){
    const out=[],seen=new Set();
    for(const t of tasks){
      const key=t.id||JSON.stringify(t.route);
      if(seen.has(key))continue;
      seen.add(key);out.push(t);
    }
    return out;
  }
  function buildPlan(options={}){
    const mode=clean(options.mode||state.mode)||'normal';
    const maxItems=Math.max(4,Math.min(20,Number(options.maxItems)||(mode==='intensive'?12:8)));
    // Category caps prevent one large backlog from crowding out remediation,
    // current-path continuity, or productive-skill balance.
    const overrides=activeOverrides().slice(0,2);
    const due=dueLearning().slice(0,3);
    const vocab=dueVocab().slice(0,2);
    const weaknesses=weaknessTasks().slice(0,2);
    const continuing=continueTask().slice(0,1);
    const external=externalCandidates(options).slice(0,3);
    const base=dedupe([...overrides,...due,...vocab,...weaknesses,...continuing,...external]);
    const balanced=balanceTasks(base);
    const tasks=dedupe([...base,...balanced]).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
    return {
      schema:SCHEMA,algorithmVersion:state.algorithmVersion,mode,maxItems,
      stage:clean(readCore().stage)||'vn',
      generatedFrom:{assessment:window.RussianAssessmentMastery?.schema||null,learning:window.RussianLearningState?.schema||null,vocab:window.RussianVocabSrs?.schema||null,candidateSources:listCandidateSources()},
      tasks:tasks.slice(0,maxItems).map(x=>({...x,reasonLabel:reasonLabels[x.reason]||x.reason}))
    };
  }
  function explain(task){const t=normalizeTask(task);return {reason:t.reason,label:reasonLabels[t.reason]||t.reason,source:t.source,skill:t.skill}}
  function setMode(mode){if(!['normal','intensive'].includes(mode))return false;state.mode=mode;return write()}
  function setManualOverride(task,meta={}){
    const t=normalizeTask(task);const row={...t,id:t.id||'override:'+Date.now(),reason:REASONS.MANUAL_OVERRIDE,reasonText:clean(meta.reason),expiresAt:clean(meta.expiresAt),createdAt:new Date().toISOString()};
    state.manualOverrides=[...state.manualOverrides.filter(x=>x.id!==row.id),row].slice(-50);write();return copy(row);
  }
  function clearExpiredOverrides(){const now=Date.now(),before=state.manualOverrides.length;state.manualOverrides=state.manualOverrides.filter(x=>!x.expiresAt||Date.parse(x.expiresAt)>now);if(state.manualOverrides.length!==before)write();return before-state.manualOverrides.length}
  window.RussianAdaptivePlanner={schema:SCHEMA,storageKey:STORAGE_KEY,reasons:REASONS,buildPlan,explain,setMode,setManualOverride,clearExpiredOverrides,registerCandidateSource,unregisterCandidateSource,listCandidateSources,getState:()=>copy(state),refresh(){state=read();return copy(state)}};
})();