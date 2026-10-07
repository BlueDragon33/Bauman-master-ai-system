import {createBrowserLegacySpeechProvider} from '../speech/legacy-speech-provider.js';
import {createBrowserPlannerSource} from './browser-planner-source.js';
import {openOrResumeBrowserSession} from './browser-session.js';

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
    plannerSource:null,
    plannerSourceStatus:{attached:false,reason:'not-initialized'},
    session:null,
    betaRequested:false,
    grounded:{
      requested:false,
      state:'OFF',
      mounted:false,
      controller:null,
      error:null
    },
    error:null
  };

  if(inspection.ready){
    try{
      integration.speechProvider=createBrowserLegacySpeechProvider(windowLike);
      integration.plannerSource=createBrowserPlannerSource();
      integration.plannerSourceStatus=integration.plannerSource.attach(windowLike.RussianAdaptivePlanner);
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
    plannerSource:{
      attached:integration.plannerSourceStatus?.attached===true,
      reason:integration.plannerSourceStatus?.reason||null,
      candidateCount:integration.plannerSource?.getCandidates?.().length||0
    },
    session:integration.session?.snapshot?.()||null,
    betaRequested:integration.betaRequested,
    grounded:{
      requested:integration.grounded.requested,
      state:integration.grounded.state,
      mounted:integration.grounded.mounted,
      error:integration.grounded.error,
      status:integration.grounded.controller?.status?.()||null
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
    publishPlannerCandidates(rows){
      if(!integration.plannerSource)throw new Error('Russian Engine planner source is not ready');
      const result=integration.plannerSource.publish(rows);
      windowLike.dispatchEvent?.(new CustomEvent('russian-engine:planner-candidates',{detail:{count:result.length}}));
      return result;
    },
    clearPlannerCandidates(){
      return integration.plannerSource?.clear?.()||false;
    }
  });

  windowLike.RussianEngineIntegration=bridge;

  let shouldRequest=false;
  try{
    const url=new URL(windowLike.location?.href||'');
    const feature=url.searchParams.get('ruEngine');
    shouldRequest=['grounded-v1','beta-v1'].includes(feature);
    integration.betaRequested=feature==='beta-v1';
    integration.enabled=shouldRequest;
    integration.mode=integration.betaRequested?'BETA_LEARNING_LOOP':(shouldRequest?'GROUNDED_OPT_IN':'PASSIVE_BRIDGE');
  }catch(_){}

  if(integration.betaRequested){
    try{
      integration.session=openOrResumeBrowserSession({
        windowLike,
        storage:windowLike.localStorage,
        profileId:windowLike.RussianEngineProfileId||'default',
        experienceId:'RE-BETA-GROUNDED',
        contentRevision:'beta-v1',
        capabilities:integration.speechProvider?.capabilities?.()||{}
      });
      integration.session.retryPending().catch(()=>{});
    }catch(error){
      integration.error=String(error?.message||error);
    }
  }

  if(shouldRequest){
    integration.grounded.requested=true;
    integration.grounded.state='LOADING';
    import('./grounded-experience.js')
      .then(module=>module.mountGroundedExperience({
        windowLike,
        documentLike:windowLike.document,
        fetchFn:windowLike.fetch?.bind(windowLike)||globalThis.fetch,
        speechProvider:integration.speechProvider,
        onEvidence:integration.betaRequested?(evidence=>integration.session?.recordObservation?.(evidence)):null,
        onComplete:integration.betaRequested?(()=>integration.session?.complete?.()):null
      }))
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
        windowLike.dispatchEvent?.(new CustomEvent('russian-engine:grounded-error',{detail:publicView()}));
      });
  }

  return publicView();
}

if(typeof window!=='undefined'){
  bootstrapRussianEngine(window);
}
