import {SCHEMAS,validateEvidence} from '../public/contracts.mjs';

const clean=value=>String(value??'').trim();
const num=value=>Number.isFinite(Number(value))?Number(value):null;

export function buildAsrObservation({
  evidenceId,attemptId,experienceId,competencyIds,
  transcript,target,rawConfidence,supportLevel=0,responseMs=null,
  providerState='SUPPORTED'
}={}){
  const transcriptText=clean(transcript),targetText=clean(target);
  const recognized=!!transcriptText;
  return validateEvidence({
    schemaVersion:SCHEMAS.evidence,
    evidenceId:clean(evidenceId),
    attemptId:clean(attemptId),
    experienceId:clean(experienceId),
    competencyIds:Array.isArray(competencyIds)?competencyIds:[],
    observationType:'speech-recognition-observation',
    result:{
      recognized,
      transcript:transcriptText,
      target:targetText,
      rawConfidence:num(rawConfidence),
      responseMs:num(responseMs),
      interpretation:'NO_PRONUNCIATION_MASTERY_CLAIM'
    },
    provider:{
      kind:'browser-speech-recognition',
      supportState:clean(providerState)||'UNKNOWN',
      confidenceMeaning:'PROVIDER_RECOGNITION_CONFIDENCE_ONLY',
      infrastructureFailure:providerState!=='SUPPORTED'
    },
    supportLevel:Number(supportLevel)||0,
    authoritative:false
  });
}

export function buildRecordingObservation({
  evidenceId,attemptId,experienceId,competencyIds,
  recordingMeta,supportLevel=0
}={}){
  const meta=recordingMeta&&typeof recordingMeta==='object'?recordingMeta:{};
  return validateEvidence({
    schemaVersion:SCHEMAS.evidence,
    evidenceId:clean(evidenceId),
    attemptId:clean(attemptId),
    experienceId:clean(experienceId),
    competencyIds:Array.isArray(competencyIds)?competencyIds:[],
    observationType:'speech-recording-captured',
    result:{
      captured:!!meta.sessionId,
      durationMs:num(meta.durationMs),
      mimeType:clean(meta.mimeType),
      size:num(meta.size),
      retention:clean(meta.retention)||'TRANSIENT_LOCAL'
    },
    provider:{
      kind:'browser-media-recorder',
      localOnly:true,
      infrastructureFailure:false
    },
    supportLevel:Number(supportLevel)||0,
    authoritative:false
  });
}
