const clean=v=>String(v??'').trim();

export function inspectAppCompatibility(windowLike={}){
  const assessment=windowLike.RussianAssessmentMastery;
  const planner=windowLike.RussianAdaptivePlanner;
  const speechReady=!!(windowLike.RussianAudioEngine&&windowLike.RussianSpeechRecognitionAdapter&&windowLike.RussianRecordingEngine);
  const checks={
    assessmentOwner:!!(assessment&&typeof assessment.recordAssessmentAttempt==='function'&&typeof assessment.recordEvidence==='function'),
    plannerOwner:!!(planner&&planner.schema==='RUSSIAN_ADAPTIVE_PLANNER_V1'&&typeof planner.buildPlan==='function'&&typeof planner.explain==='function'),
    plannerCandidateSeam:!!(planner&&typeof planner.registerCandidateSource==='function'),
    speechOwners:speechReady,
    serviceWorker:!!windowLike.navigator?.serviceWorker,
    engineBootstrap:!!windowLike.RussianEngineIntegration
  };
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key);
  const state=!checks.assessmentOwner||!checks.plannerOwner?'BLOCKED':missing.length?'PARTIAL':'READY';
  return {schema:'RUSSIAN_ENGINE_APP_COMPATIBILITY_V1',state,checks,missing};
}

export function requiredCrossBoundaryWrites(report){
  const out=[];
  if(report?.checks?.assessmentOwner&&report?.checks?.plannerOwner&&!report?.checks?.plannerCandidateSeam){
    out.push({path:'subjects/russian/assets/adaptive-planner.js',reason:'add explicit Engine candidate-source seam without using manual override'});
  }
  if(report?.checks?.serviceWorker){
    out.push({path:'subjects/russian/sw.js',reason:'precache any newly browser-loaded Engine integration modules for true offline parity'});
  }
  return out;
}
