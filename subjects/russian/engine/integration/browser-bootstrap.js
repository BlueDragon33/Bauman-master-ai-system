import {createBrowserLegacySpeechProvider} from '../speech/legacy-speech-provider.js';

const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const RUSSIAN_ENGINE_BROWSER_BOOTSTRAP='RUSSIAN_ENGINE_BROWSER_BOOTSTRAP_V1';

export function inspectLegacyOwners(windowLike=globalThis?.window){
  if(!windowLike)return {
    ready:false,
    missing:['window'],
    owners:{}
  };
  const owners={
    audio:!!windowLike.RussianAudioEngine,
    speechRecognition:!!windowLike.RussianSpeechRecognitionAdapter,
    recording:!!windowLike.RussianRecordingEngine,
    assessmentMastery:!!windowLike.RussianAssessmentMastery,
    adaptivePlanner:!!windowLike.RussianAdaptivePlanner,
    learningState:!!windowLike.RussianLearningState
  };
  return {
    ready:owners.audio&&owners.speechRecognition&&owners.recording,
    missing:Object.entries(owners).filter(([,ok])=>!ok).map(([name])=>name),
    owners
  };
}

export function bootstrapRussianEngine(windowLike=globalThis?.window){
  const inspection=inspectLegacyOwners(windowLike);
  if(!windowLike)return {schema:RUSSIAN_ENGINE_BROWSER_BOOTSTRAP,ready:false,inspection};

  const integration={
    schema:RUSSIAN_ENGINE_BROWSER_BOOTSTRAP,
    ready:false,
    enabled:false,
    mode:'PASSIVE_BRIDGE',
    inspection:copy(inspection),
    speechProvider:null,
    error:null
  };

  if(inspection.ready){
    try{
      integration.speechProvider=createBrowserLegacySpeechProvider(windowLike);
      integration.ready=true;
    }catch(error){
      integration.error=String(error?.message||error);
    }
  }

  const publicView=()=>({
    schema:integration.schema,
    ready:integration.ready,
    enabled:integration.enabled,
    mode:integration.mode,
    inspection:copy(integration.inspection),
    capabilities:integration.speechProvider?.capabilities?.()||null,
    error:integration.error
  });

  const bridge=Object.freeze({
    schema:integration.schema,
    status:publicView,
    getSpeechProvider(){
      if(!integration.ready)throw new Error('Russian Engine speech provider is not ready');
      return integration.speechProvider;
    }
  });

  windowLike.RussianEngineIntegration=bridge;
  return publicView();
}

if(typeof window!=='undefined'){
  bootstrapRussianEngine(window);
}
