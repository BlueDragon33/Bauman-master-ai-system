const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export const PRONUNCIATION_CAPABILITIES=Object.freeze([
  'TRANSCRIPT_RECOGNITION',
  'TIMING',
  'PAUSE_STRUCTURE',
  'WORD_STRESS_SIGNAL',
  'PHONEME_SIGNAL',
  'RHYTHM_SIGNAL',
  'INTONATION_SIGNAL'
]);

export function validatePronunciationTarget(target){
  const errors=[];
  if(!clean(target?.targetId))errors.push('targetId required');
  if(!clean(target?.canonicalRef))errors.push('canonicalRef required');
  if(!clean(target?.displayText))errors.push('displayText required');
  if(!arr(target?.focus).length)errors.push('focus required');
  if(!['VERIFIED','CURATED','FIXTURE_NONCANONICAL'].includes(target?.authorityStatus))errors.push('authorityStatus invalid');
  return {ok:errors.length===0,errors};
}

export function evaluatePronunciationSignals({target,signals=[],provider={}}={}){
  const valid=validatePronunciationTarget(target);
  if(!valid.ok)throw new Error('Pronunciation target invalid: '+valid.errors.join('; '));
  const declared=new Set(arr(provider.capabilities));
  const accepted=[];
  const rejected=[];
  for(const signal of arr(signals)){
    const capability=clean(signal?.capability);
    if(!declared.has(capability)){
      rejected.push({signal:copy(signal),reason:'provider-capability-not-declared'});
      continue;
    }
    accepted.push(copy(signal));
  }
  const hasPhoneme=accepted.some(x=>x.capability==='PHONEME_SIGNAL');
  const hasStress=accepted.some(x=>x.capability==='WORD_STRESS_SIGNAL');
  const hasRhythm=accepted.some(x=>x.capability==='RHYTHM_SIGNAL');
  const hasIntonation=accepted.some(x=>x.capability==='INTONATION_SIGNAL');
  return {
    schemaVersion:'RUSSIAN_ENGINE_PRONUNCIATION_OBSERVATION_V1',
    targetId:target.targetId,
    canonicalRef:target.canonicalRef,
    authorityStatus:target.authorityStatus,
    provider:{
      id:clean(provider.id)||'unknown',
      capabilities:[...declared],
      confidenceMeaning:clean(provider.confidenceMeaning)||'PROVIDER_DEFINED'
    },
    acceptedSignals:accepted,
    rejectedSignals:rejected,
    claims:{
      transcriptOnly:accepted.some(x=>x.capability==='TRANSCRIPT_RECOGNITION')&&!hasPhoneme&&!hasStress&&!hasRhythm&&!hasIntonation,
      phonemeEvidenceAvailable:hasPhoneme,
      stressEvidenceAvailable:hasStress,
      rhythmEvidenceAvailable:hasRhythm,
      intonationEvidenceAvailable:hasIntonation
    },
    authoritative:false,
    masteryMutation:false
  };
}

export function compareSelfRecording({modelDurationMs,learnerDurationMs,modelPauses=[],learnerPauses=[]}={}){
  const model=Number(modelDurationMs)||0,learner=Number(learnerDurationMs)||0;
  return {
    schemaVersion:'RUSSIAN_ENGINE_SELF_COMPARISON_V1',
    durationRatio:model>0?learner/model:null,
    pauseCountDifference:arr(learnerPauses).length-arr(modelPauses).length,
    interpretation:'SELF_COMPARISON_COACHING_ONLY',
    authoritative:false
  };
}
