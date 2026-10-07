import {createBrowserDurableOutbox} from './browser-durable-outbox.js';

const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

function skillFromCompetency(id){
  const key=clean(id);
  if(key.includes('LISTEN'))return 'listening';
  if(key.includes('SPEAK'))return 'speaking';
  if(key.includes('INTERACT'))return 'interaction';
  if(key.includes('GRAM'))return 'grammar';
  if(key.includes('VOC'))return 'vocabulary';
  return 'integrated';
}

export function mapBrowserObservationToRu04(observation,{contentRevision='browser-v1',mode='practice'}={}){
  if(!observation||observation.authoritative===true)throw new Error('non-authoritative Engine observation required');
  const evidenceId=clean(observation.evidenceId),attemptId=clean(observation.attemptId),experienceId=clean(observation.experienceId);
  if(!evidenceId||!attemptId||!experienceId)throw new Error('evidenceId, attemptId and experienceId required');
  const competencies=arr(observation.competencyIds).map(clean).filter(Boolean);
  if(!competencies.length)throw new Error('competencyIds required');
  const providerFailure=observation?.provider?.infrastructureFailure===true;
  return {
    messageId:'OUTBOX::'+evidenceId,
    engineEvidenceId:evidenceId,
    observation:copy(observation),
    attemptCandidate:{
      attemptId,
      assessmentId:'ENGINE::'+experienceId,
      contentRevision:clean(contentRevision),
      mode:clean(mode)||'practice',
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
        topic:'russian-engine'
      }],
      evaluation:{source:'russian-engine-browser',providerFailure,authoritative:false},
      feedbackShown:Number(observation?.supportLevel)>0
    },
    evidenceCandidates:competencies.map(competencyId=>({
      evidenceId:'RU04::'+evidenceId+'::'+competencyId,
      competencyId,
      skill:skillFromCompetency(competencyId),
      sourceAttemptId:attemptId,
      evidenceType:providerFailure?'infrastructure-observation':clean(observation.observationType)||'engine-observation',
      result:{...copy(observation.result||{}),engineEvidenceId:evidenceId,supportLevel:Number(observation.supportLevel)||0,providerFailure,learnerImpact:!providerFailure,mode:clean(mode)||'practice'},
      authoritative:false,
      delayed:observation?.delayed===true
    }))
  };
}

export function createBrowserEvidencePipeline({windowLike=globalThis.window,storage=globalThis.localStorage,profileId='default',contentRevision='browser-v1'}={}){
  const outbox=createBrowserDurableOutbox({storage,profileId});
  function submit(observation,{mode='practice'}={}){
    const payload=mapBrowserObservationToRu04(observation,{contentRevision,mode});
    return outbox.enqueue(payload);
  }
  async function deliverPayload(payload){
    const owner=windowLike?.RussianAssessmentMastery;
    if(!owner?.recordAssessmentAttempt||!owner?.recordEvidence)throw new Error('RussianAssessmentMastery unavailable');
    const attempt=owner.recordAssessmentAttempt(copy(payload.attemptCandidate));
    const evidence=payload.evidenceCandidates.map(row=>{
      if(row.authoritative===true)throw new Error('authoritative browser evidence forbidden');
      return owner.recordEvidence(copy(row));
    });
    return {attempt,evidence,masteryMutation:false};
  }
  async function flush(){
    const results=[];
    for(const row of outbox.pending())results.push(await outbox.deliver(row.messageId,deliverPayload));
    return results;
  }
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_BROWSER_EVIDENCE_PIPELINE_V1',
    submit,flush,
    pending:()=>outbox.pending(),
    exportOutbox:()=>outbox.exportState(),
    reload:()=>outbox.reload(),
    clearDelivered:()=>outbox.clearDelivered()
  });
}
