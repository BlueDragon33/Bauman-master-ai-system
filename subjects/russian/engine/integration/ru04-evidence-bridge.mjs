const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

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

export function buildRu04EvidenceBundle({
  observation,
  contentRevision='',
  mode='practice',
  stage='',
  timestamp='',
  rootAttemptId=''
}={}){
  if(!observation||typeof observation!=='object')throw new Error('observation required');
  if(observation.authoritative===true)throw new Error('Engine authoritative evidence cannot enter RU04 bridge');
  const attemptId=clean(observation.attemptId);
  const experienceId=clean(observation.experienceId);
  const evidenceId=clean(observation.evidenceId);
  if(!attemptId||!experienceId||!evidenceId)throw new Error('attemptId, experienceId and evidenceId required');
  const competencies=arr(observation.competencyIds).map(clean).filter(Boolean);
  if(!competencies.length)throw new Error('competencyIds required');

  const providerFailure=observation?.provider?.infrastructureFailure===true;
  const assessmentId='ENGINE::'+experienceId;
  const attemptCandidate={
    attemptId,
    assessmentId,
    contentRevision:clean(contentRevision),
    mode:clean(mode)||'practice',
    stage:clean(stage),
    timestamp:clean(timestamp),
    responses:[{
      itemId:experienceId,
      response:copy(observation?.result?.selectedObjectId??observation?.result?.transcript??observation?.result??null),
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
      rootAttemptId:clean(rootAttemptId)||attemptId,
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

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RU04_EVIDENCE_BUNDLE_V1',
    attemptCandidate,
    evidenceCandidates,
    masteryMutation:false
  });
}

export function applyRu04EvidenceBundle(owner,bundle){
  if(!owner?.recordAssessmentAttempt||!owner?.recordEvidence)throw new Error('RussianAssessmentMastery owner required');
  if(bundle?.masteryMutation!==false)throw new Error('bundle must forbid mastery mutation');
  const attemptResult=owner.recordAssessmentAttempt(copy(bundle.attemptCandidate));
  const evidenceResults=arr(bundle.evidenceCandidates).map(row=>{
    if(row.authoritative===true)throw new Error('authoritative RU04 bridge row forbidden');
    return owner.recordEvidence(copy(row));
  });
  return {attemptResult,evidenceResults};
}
