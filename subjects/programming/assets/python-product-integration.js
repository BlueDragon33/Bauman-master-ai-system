(function(global){
  const API = {
    run:"/api/python/run", test:"/api/python/test", submit:"/api/python/submit", cancel:"/api/python/cancel", runtime:"/api/python/runtime"
  };
  const activeRuns=new Map();
  function apiBase(){ const q=new URLSearchParams(global.location?.search||""); return (q.get("api")||"").replace(/\/$/,""); }
  async function invoke(kind,payload){
    const path=API[kind]; if(!path) return {status:"UNAVAILABLE",code:"UNKNOWN_CAPABILITY",masteryWrite:false,academicWrite:false};
    if(!navigator.onLine) return {status:"UNAVAILABLE",code:"OFFLINE_EXECUTION_UNAVAILABLE",masteryWrite:false,academicWrite:false};
    const runId=String(payload?.runId||"");
    if(kind==="cancel"){
      const controller=activeRuns.get(runId);
      if(controller){controller.abort();activeRuns.delete(runId);}
      const init={method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload||{})};
      void fetch(apiBase()+path,init).catch(()=>{});
      return {ok:true,canceled:true,runId,localAbort:Boolean(controller),status:"canceled",masteryWrite:false,academicWrite:false};
    }
    const controller=runId&&["run","test","submit"].includes(kind)?new AbortController():null;
    if(controller)activeRuns.set(runId,controller);
    try{
      const init=kind==="runtime"?{method:"GET"}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload||{}),...(controller?{signal:controller.signal}:{})};
      const r=await fetch(apiBase()+path,init); const data=await r.json().catch(()=>({}));
      return {...data,httpStatus:r.status,status:data.status||(r.ok?"OK":"ERROR"),masteryWrite:false,academicWrite:false};
    }catch(error){
      if(error?.name==="AbortError")return {ok:false,status:"canceled",code:"RUN_CANCELED",runId,masteryWrite:false,academicWrite:false};
      return {status:"UNAVAILABLE",code:"PYTHON_PROVIDER_UNREACHABLE",message:String(error),masteryWrite:false,academicWrite:false};
    }finally{if(controller&&activeRuns.get(runId)===controller)activeRuns.delete(runId);}
  }
  const api={
    invoke,
    selfCheck(){return{
      subjectId:"programming",platformFork:false,sharedDesignSystem:true,capabilityFacade:true,providerSpecificCalls:false,
      masteryAuthority:false,academicAuthority:false,runTestSubmitDistinct:true,hiddenTestsInBrowser:false,
      autosave:true,multiTabConflict:true,offlineHonest:true,keyboardCriticalInputs:true,
      surfaces:["lesson","code-lab","review","assessment-preview","authoring","error-notebook"],
      runtimeProfileId:"cpython-3.14.8-stdlib-v1"
    }}
  };
  global.BAUMAN_PYTHON_PRODUCT=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
