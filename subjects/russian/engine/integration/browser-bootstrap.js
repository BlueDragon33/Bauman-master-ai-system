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
    grounded:{
      requested:false,
      state:'OFF',
      mounted:false,
      controller:null,
      error:null
    },
    liveOwner:{
      active:false,
      controller:null,
      error:null
    },
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
    grounded:{
      requested:integration.grounded.requested,
      state:integration.grounded.state,
      mounted:integration.grounded.mounted,
      error:integration.grounded.error,
      status:integration.grounded.controller?.status?.()||null
    },
    liveOwner:{
      active:integration.liveOwner.active,
      error:integration.liveOwner.error,
      status:integration.liveOwner.controller?.status?.()||null,
      planner:integration.liveOwner.controller?.plannerStatus?.()||null
    },
    error:integration.error
  });

  const bridge=Object.freeze({
    schema:integration.schema,
    status:publicView,
    getSpeechProvider(){
      if(!integration.ready)throw new Error('Russian Engine speech provider is not ready');
      return integration.speechProvider;
    },
    liveOwnerStatus(){
      return integration.liveOwner.controller?.status?.()||null;
    },
    plannerStatus(){
      return integration.liveOwner.controller?.plannerStatus?.()||{ok:false,errors:['live-owner-inactive']};
    },
    plannerCandidates(input={}){
      return integration.liveOwner.controller?.plannerCandidates?.(input)||{ok:false,candidates:[],errors:['live-owner-inactive']};
    }
  });

  windowLike.RussianEngineIntegration=bridge;

  let shouldRequest=false;
  try{
    const url=new URL(windowLike.location?.href||'');
    shouldRequest=url.searchParams.get('ruEngine')==='grounded-v1';
  }catch(_){}

  if(shouldRequest){
    integration.grounded.requested=true;
    integration.grounded.state='LOADING';
    Promise.all([
      import('./grounded-experience.js'),
      import('./live-owner-integration.js')
    ])
      .then(([groundedModule,liveModule])=>{
        integration.liveOwner.controller=liveModule.createLiveOwnerIntegration(windowLike);
        integration.liveOwner.active=true;
        return groundedModule.mountGroundedExperience({
          windowLike,
          documentLike:windowLike.document,
          fetchFn:windowLike.fetch?.bind(windowLike)||globalThis.fetch,
          speechProvider:integration.speechProvider,
          onEvidence:payload=>integration.liveOwner.controller.applyObservation({
            observation:payload?.evidence,
            contentRevision:payload?.scene?.contentRevision||'',
            mode:'practice'
          })
        });
      })
      .then(controller=>{
        integration.grounded.controller=controller?.mounted?controller:null;
        integration.grounded.mounted=controller?.mounted===true;
        integration.grounded.state=controller?.mounted===true?'READY':'SKIPPED';
        integration.grounded.error=controller?.mounted===true?null:String(controller?.reason||'not-mounted');
        windowLike.dispatchEvent?.(new CustomEvent('russian-engine:grounded-ready',{detail:publicView()}));
      })
      .catch(error=>{
        integration.grounded.state='ERROR';
        integration.grounded.error=String(error?.message||error);
        integration.liveOwner.error=String(error?.message||error);
        windowLike.dispatchEvent?.(new CustomEvent('russian-engine:grounded-error',{detail:publicView()}));
      });
  }

  return publicView();
}

if(typeof window!=='undefined'){
  bootstrapRussianEngine(window);
}
