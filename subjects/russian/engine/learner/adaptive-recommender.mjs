const clean=value=>String(value??'').trim();
const arr=value=>Array.isArray(value)?value:[];
const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const ADAPTIVE_ACTIONS=Object.freeze([
  'diagnostic-probe',
  'introduce',
  'reinforce',
  'remediate',
  'review',
  'transfer-probe',
  'advance-probe'
]);

export function buildAdaptiveRecommendation({
  learner,
  level=null,
  reviewCandidates=[],
  availableExperienceRefs=[]
}={}) {
  if(!learner?.profileId)throw new Error('learner projection is required');

  const reviews=arr(reviewCandidates).slice().sort((a,b)=>Number(b.priority)-Number(a.priority));
  if(reviews.length){
    return {
      schemaVersion:'RUSSIAN_ENGINE_ADAPTIVE_RECOMMENDATION_V1',
      profileId:learner.profileId,
      action:reviews[0].reason==='observed-failure'?'remediate':'review',
      reason:reviews[0].reason,
      competencyIds:[...arr(reviews[0].competencyIds)],
      sourceEvidenceId:clean(reviews[0].sourceEvidenceId),
      experienceRefs:arr(availableExperienceRefs).map(copy),
      masteryMutation:false
    };
  }

  if(!level){
    return {
      schemaVersion:'RUSSIAN_ENGINE_ADAPTIVE_RECOMMENDATION_V1',
      profileId:learner.profileId,
      action:'diagnostic-probe',
      reason:'level-context-missing',
      competencyIds:[],
      experienceRefs:arr(availableExperienceRefs).map(copy),
      masteryMutation:false
    };
  }

  const targets=arr(level.targetCompetencies);
  const missing=targets.filter(id=>!learner.capabilities?.[id] || Number(learner.capabilities[id].observations)<2);
  if(missing.length){
    return {
      schemaVersion:'RUSSIAN_ENGINE_ADAPTIVE_RECOMMENDATION_V1',
      profileId:learner.profileId,
      action:'introduce',
      reason:'insufficient-observation',
      competencyIds:missing,
      experienceRefs:arr(availableExperienceRefs).map(copy),
      masteryMutation:false
    };
  }

  const supportHeavy=targets.filter(id=>Number(learner.capabilities?.[id]?.averageSupportLevel)>=4);
  if(supportHeavy.length){
    return {
      schemaVersion:'RUSSIAN_ENGINE_ADAPTIVE_RECOMMENDATION_V1',
      profileId:learner.profileId,
      action:'reinforce',
      reason:'support-dependency',
      competencyIds:supportHeavy,
      experienceRefs:arr(availableExperienceRefs).map(copy),
      masteryMutation:false
    };
  }

  const needsTransfer=level.progression?.transferGate===true;
  return {
    schemaVersion:'RUSSIAN_ENGINE_ADAPTIVE_RECOMMENDATION_V1',
    profileId:learner.profileId,
    action:needsTransfer?'transfer-probe':'advance-probe',
    reason:needsTransfer?'milestone-transfer-evidence-needed':'sufficient-observation-for-next-probe',
    competencyIds:targets,
    experienceRefs:arr(availableExperienceRefs).map(copy),
    masteryMutation:false
  };
}
