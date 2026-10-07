const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

const PLANNER_REASONS=Object.freeze({
  DUE_REVIEW:'due_review',
  WEAKNESS_REPAIR:'weakness_repair',
  SKILL_BALANCE:'skill_balance',
  CONTINUE_PATH:'continue_path'
});

const skillFromCompetency=id=>{
  const key=clean(id);
  if(key.includes('LISTEN'))return 'listening';
  if(key.includes('SPEAK'))return 'speaking';
  if(key.includes('READ'))return 'reading';
  if(key.includes('WRITE'))return 'writing';
  if(key.includes('INTERACT'))return 'interaction';
  if(key.includes('PHON'))return 'phonetics';
  if(key.includes('VOC'))return 'vocabulary';
  if(key.includes('GRAM'))return 'grammar';
  if(key.includes('ACADEMIC'))return 'academic';
  if(key.includes('TECH'))return 'technical';
  if(key.includes('RESEARCH'))return 'research';
  return 'integrated';
};

function buildEvidenceBundle({observation,contentRevision='',mode='practice',stage=''}={}){
  if(!observation||typeof observation!=='object')throw new Error('observation-required');
  if(observation.authoritative===true)throw new Error('engine-authoritative-evidence-forbidden');
  const attemptId=clean(observation.attemptId);
  const experienceId=clean(observation.experienceId);
  const evidenceId=clean(observation.evidenceId);
  const competencies=arr(observation.competencyIds).map(clean).filter(Boolean);
  if(!attemptId||!experienceId||!evidenceId||!competencies.length)throw new Error('observation-identity-incomplete');
  const providerFailure=observation?.provider?.infrastructureFailure===true;
  const assessmentId='ENGINE::'+experienceId;
  const attemptCandidate={
    attemptId,
    assessmentId,
    contentRevision:clean(contentRevision),
    mode:clean(mode)||'practice',
    stage:clean(stage),
    responses:[{
      itemId:experienceId,
      response:copy(observation?.result?.selectedObjectId??observation?.result??null),
      evaluation:{
        observationType:clean(observation.observationType),
        success:observation?.result?.success===true,
        supportLevel:Number(observation?.supportLevel)||0,
        learnerImpact:!providerFailure
      },
      skill:skillFromCompetency(competencies[0]),
      lessonId:'',
      topic:'russian-engine'
    }],
    evaluation:{
      source:'russian-engine',
      rootAttemptId:attemptId,
      providerFailure,
      authoritative:false
    },
    feedbackShown:Number(observation?.supportLevel)>0
  };
  const evidenceCandidates=competencies.map(competencyId=>({
    evidenceId:'RU04::'+evidenceId+'::'+competencyId,
    competencyId,
    skill:skillFromCompetency(competencyId),
    sourceAttemptId:attemptId,
    evidenceType:providerFailure?'infrastructure-observation':clean(observation.observationType)||'engine-observation',
    result:{
      ...copy(observation.result||{}),
      engineEvidenceId:evidenceId,
      supportLevel:Number(observation.supportLevel)||0,
      providerFailure,
      learnerImpact:!providerFailure,
      mode:attemptCandidate.mode
    },
    authoritative:false,
    delayed:observation?.delayed===true
  }));
  return {attemptCandidate,evidenceCandidates,masteryMutation:false};
}

function validatePlanner(owner){
  const errors=[];
  if(owner?.schema!=='RUSSIAN_ADAPTIVE_PLANNER_V1')errors.push('unexpected-planner-schema');
  if(typeof owner?.buildPlan!=='function')errors.push('planner-buildPlan-missing');
  if(typeof owner?.explain!=='function')errors.push('planner-explain-missing');
  const values=Object.values(owner?.reasons||{});
  for(const value of Object.values(PLANNER_REASONS)){
    if(!values.includes(value))errors.push('planner-reason-missing:'+value);
  }
  return {ok:errors.length===0,errors};
}

const routeForSkill=skill=>({
  listening:{view:'media'},
  speaking:{view:'dialogue'},
  writing:{view:'writing'},
  technical:{view:'learning',learnTab:'theory'},
  grammar:{view:'grammar'},
  vocabulary:{view:'vocab'},
  interaction:{view:'dialogue'}
}[clean(skill)]||{view:'learning',learnTab:'review'});

function buildCandidates({snapshot,recommendation,experiences=[],capabilities={},revision='r1'}={}){
  const out=[];
  const available=new Map(arr(experiences).map(x=>[clean(x.experienceId||x.id),x]));
  const add=row=>{if(row?.id&&!out.some(x=>x.id===row.id))out.push(row);};
  const stable=(kind,target)=>['engine',kind,clean(target),clean(revision)].join(':');

  for(const review of arr(snapshot?.reviewDue)){
    const ref=clean(review?.experienceId||review?.id);
    const exp=available.get(ref);
    if(ref&&exp)add({
      id:stable('review',ref),
      label:clean(exp.label)||'Ôn lại Russian Engine',
      skill:clean(review?.skill)||'review',
      reason:PLANNER_REASONS.DUE_REVIEW,
      route:copy(exp.route||{view:'learning',learnTab:'review'}),
      priority:880,source:'russian-engine',engineExperienceId:ref,revision:clean(revision)
    });
  }

  if(recommendation?.kind==='remediate'){
    const dimension=clean(recommendation.dimension);
    add({
      id:stable('remediate',dimension),
      label:'Sửa điểm yếu · '+dimension,
      skill:dimension,reason:PLANNER_REASONS.WEAKNESS_REPAIR,
      route:routeForSkill(dimension),
      priority:860,source:'russian-engine',revision:clean(revision)
    });
  }

  if(recommendation?.kind==='transfer'){
    const ref=clean(recommendation.experienceId);
    const exp=available.get(ref)||arr(experiences).find(x=>x?.transfer===true);
    const id=clean(exp?.experienceId||exp?.id);
    if(id)add({
      id:stable('transfer',id),
      label:clean(exp.label)||'Luyện chuyển giao',
      skill:clean(exp.skill)||'interaction',
      reason:PLANNER_REASONS.SKILL_BALANCE,
      route:copy(exp.route||routeForSkill(exp.skill||'interaction')),
      priority:720,source:'russian-engine',engineExperienceId:id,revision:clean(revision)
    });
  }

  if(recommendation?.kind==='introduce'){
    const ref=clean(recommendation.experienceId);
    const exp=available.get(ref);
    if(exp){
      const missing=arr(exp.requiredCapabilities).filter(cap=>capabilities?.[cap]!==true);
      if(!missing.length)add({
        id:stable('continue',ref),
        label:clean(exp.label)||'Tiếp tục Russian Engine',
        skill:clean(exp.skill)||'path',
        reason:PLANNER_REASONS.CONTINUE_PATH,
        route:copy(exp.route||{view:'learning'}),
        priority:520,source:'russian-engine',engineExperienceId:ref,revision:clean(revision)
      });
    }
  }
  return out.map(copy);
}

export function createLiveOwnerIntegration(windowLike=globalThis?.window){
  const diagnostics={
    schema:'RUSSIAN_ENGINE_LIVE_OWNER_DIAGNOSTICS_V1',
    evidenceObserved:0,
    ru04BundlesApplied:0,
    duplicateBundles:0,
    ownerUnavailable:0,
    bridgeErrors:0,
    plannerCompatible:null,
    plannerChecks:0,
    lastErrorCode:null
  };
  const appliedEvidenceIds=new Set();

  const status=()=>copy({
    ...diagnostics,
    appliedEvidenceIdCount:appliedEvidenceIds.size,
    assessmentOwnerPresent:!!windowLike?.RussianAssessmentMastery,
    plannerOwnerPresent:!!windowLike?.RussianAdaptivePlanner
  });

  function applyObservation({observation,contentRevision='',mode='practice',stage=''}={}){
    diagnostics.evidenceObserved++;
    const evidenceId=clean(observation?.evidenceId);
    if(evidenceId&&appliedEvidenceIds.has(evidenceId)){
      diagnostics.duplicateBundles++;
      return {ok:true,duplicate:true,applied:false};
    }
    const owner=windowLike?.RussianAssessmentMastery;
    if(!owner?.recordAssessmentAttempt||!owner?.recordEvidence){
      diagnostics.ownerUnavailable++;
      diagnostics.lastErrorCode='RU04_OWNER_UNAVAILABLE';
      return {ok:false,reason:'ru04-owner-unavailable',applied:false};
    }
    try{
      const bundle=buildEvidenceBundle({observation,contentRevision,mode,stage});
      const attemptResult=owner.recordAssessmentAttempt(copy(bundle.attemptCandidate));
      const evidenceResults=bundle.evidenceCandidates.map(row=>{
        if(row.authoritative===true)throw new Error('authoritative-row-forbidden');
        return owner.recordEvidence(copy(row));
      });
      if(evidenceId)appliedEvidenceIds.add(evidenceId);
      diagnostics.ru04BundlesApplied++;
      diagnostics.lastErrorCode=null;
      return {
        ok:true,applied:true,duplicate:false,
        attemptCreated:attemptResult?.created===true,
        evidenceCreated:evidenceResults.filter(x=>x?.created===true).length,
        evidenceCount:evidenceResults.length
      };
    }catch(error){
      diagnostics.bridgeErrors++;
      diagnostics.lastErrorCode=clean(error?.message)||'RU04_BRIDGE_ERROR';
      return {ok:false,reason:'ru04-bridge-error',applied:false};
    }
  }

  function plannerStatus(){
    diagnostics.plannerChecks++;
    const result=validatePlanner(windowLike?.RussianAdaptivePlanner);
    diagnostics.plannerCompatible=result.ok;
    if(!result.ok)diagnostics.lastErrorCode=result.errors[0]||'PLANNER_INCOMPATIBLE';
    return copy(result);
  }

  function plannerCandidates(input={}){
    const compatibility=plannerStatus();
    if(!compatibility.ok)return {ok:false,candidates:[],errors:compatibility.errors};
    return {ok:true,candidates:buildCandidates(input),errors:[]};
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_LIVE_OWNER_INTEGRATION_V1',
    status,
    applyObservation,
    plannerStatus,
    plannerCandidates
  });
}
