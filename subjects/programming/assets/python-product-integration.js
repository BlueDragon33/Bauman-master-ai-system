(function(global){
  const unavailable=code=>({ok:false,status:'UNAVAILABLE',code,officialEvidence:false,officialAttemptWrite:false,masteryWrite:false,academicWrite:false});
  const facade=()=>global.SUBJECT_ADAPTER?.id==='programming'?global.SUBJECT_ADAPTER.pythonRuntime:null;
  async function invoke(kind,payload={}){
    const api=facade();
    if(!api)return unavailable('PYTHON_PROVIDER_UNAVAILABLE');
    if(kind==='cancel'){api.cancel();return {...unavailable('CANCELLATION_REQUESTED'),status:'cancelled'};}
    if(!navigator.onLine)return unavailable('OFFLINE_EXECUTION_UNAVAILABLE');
    if(kind==='runtime'){
      const identity=api.getRuntimeIdentity();
      return identity?{ok:true,status:'IDENTITY_REPORTED',implementation:'CPython',version:identity.python,...identity,officialEvidence:false,masteryWrite:false}:unavailable('PYTHON_EXECUTION_PENDING');
    }
    if(kind==='submit')return unavailable('OFFICIAL_ASSESSMENT_UNAVAILABLE');
    if(!['run','test'].includes(kind))return unavailable('UNKNOWN_CAPABILITY');
    const allowed=new Set(['taskId','code','stdin','attemptId']);
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!allowed.has(k)))return unavailable('INVALID_PRACTICE_REQUEST');
    if(kind==='test'&&payload.taskId!=='sum-integers')return unavailable('TASK_TEST_CONTRACT_PENDING');
    // This adapter does not own execution transport, official attempts or task
    // grading. Author preview forwards only declared public practice inputs.
    const request={taskId:payload.taskId||'practice',code:payload.code,stdin:payload.stdin||''};
    const result=await (kind==='test'?api.runTests(request):api.runCode(request));
    const enriched={...result,ok:result.status==='completed',runtimeProfileId:result.runtime?.runtimeProfileId,
      officialEvidence:false,officialAttemptWrite:false,masteryWrite:false,academicWrite:false};
    if(kind==='test'&&result.tests){enriched.publicTestSummary=result.tests;enriched.tests=result.tests.cases;enriched.passed=result.tests.passed;enriched.total=result.tests.cases.length;}
    return enriched;
  }
  const api={invoke,selfCheck(){return{
    subjectId:'programming',platformFork:false,sharedDesignSystem:true,capabilityFacade:true,providerSpecificCalls:false,
    masteryAuthority:false,academicAuthority:false,runTestSubmitDistinct:true,hiddenTestsInBrowser:false,
    autosave:true,multiTabConflict:true,offlineHonest:true,keyboardCriticalInputs:true,
    surfaces:['lesson','code-lab','review','assessment-preview','authoring','error-notebook'],
    runtimeProfileId:'cpython-3.14.8-stdlib-v1',officialAssessment:false
  };}};
  global.BAUMAN_PYTHON_PRODUCT=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
