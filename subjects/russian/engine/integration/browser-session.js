import {createBrowserEvidencePipeline} from './browser-evidence-pipeline.js';
import {deriveLearnerMetrics} from '../learner/learner-metrics.js';

const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function openOrResumeBrowserSession({
  windowLike=globalThis.window,
  storage=globalThis.localStorage,
  profileId='default',
  experienceId='RE-BETA-GROUNDED',
  contentRevision='beta-v1',
  capabilities={}
}={}){
  const pid=clean(profileId||'default');
  const key='russian_engine_active_session_v1:'+pid;
  let state=null;
  try{state=JSON.parse(storage?.getItem?.(key)||'null')}catch(_){}
  if(!state||state.status!=='ACTIVE'||state.experienceId!==experienceId){
    state={
      schema:'RUSSIAN_ENGINE_BROWSER_SESSION_V1',
      sessionId:'SES::'+pid+'::'+clean(experienceId)+'::'+Date.now(),
      profileId:pid,
      experienceId:clean(experienceId),
      contentRevision:clean(contentRevision),
      status:'ACTIVE',
      createdAt:Date.now(),
      updatedAt:Date.now(),
      capabilities:copy(capabilities),
      evidence:[]
    };
  }
  const pipeline=createBrowserEvidencePipeline({windowLike,storage,profileId:pid,contentRevision});

  function persist(){
    state.updatedAt=Date.now();
    storage?.setItem?.(key,JSON.stringify(state));
  }
  persist();

  async function recordObservation(observation,{mode='practice'}={}){
    state.evidence.push(copy(observation));persist();
    const queued=pipeline.submit(observation,{mode});
    const delivery=queued?.ok?await pipeline.flush():[];
    return {queued,delivery,metrics:deriveLearnerMetrics(state.evidence)};
  }
  async function retryPending(){return pipeline.flush()}
  function metrics(){return deriveLearnerMetrics(state.evidence)}
  function complete(){
    state.status='COMPLETED';persist();
    try{
      windowLike?.RussianEngineIntegration?.publishPlannerCandidates?.([{
        id:'engine:beta-followup:'+state.experienceId,
        label:'Tiếp tục lộ trình Russian Engine',
        skill:'listening',
        reason:'continue_path',
        route:{view:'media'},
        priority:560
      }]);
    }catch(_){}
    return snapshot();
  }
  function abort(){state.status='ABORTED';persist();return snapshot()}
  function snapshot(){return copy({...state,metrics:metrics(),pendingOutbox:pipeline.pending().length})}

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_BROWSER_SESSION_V1',
    recordObservation,retryPending,metrics,complete,abort,snapshot,
    sessionId:state.sessionId
  });
}
