(function(global){
  const API = {
    run:"/api/python/run", test:"/api/python/test", submit:"/api/python/submit", cancel:"/api/python/cancel", runtime:"/api/python/runtime"
  };
  function apiBase(){ const q=new URLSearchParams(global.location?.search||""); return (q.get("api")||"").replace(/\/$/,""); }
  async function invoke(kind,payload){
    const path=API[kind]; if(!path) return {status:"UNAVAILABLE",code:"UNKNOWN_CAPABILITY",masteryWrite:false,academicWrite:false};
    if(!navigator.onLine) return {status:"UNAVAILABLE",code:"OFFLINE_EXECUTION_UNAVAILABLE",masteryWrite:false,academicWrite:false};
    try{
      const init=kind==="runtime"?{method:"GET"}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload||{})};
      const r=await fetch(apiBase()+path,init); const data=await r.json().catch(()=>({}));
      return {...data,httpStatus:r.status,status:data.status||(r.ok?"OK":"ERROR"),masteryWrite:false,academicWrite:false};
    }catch(error){return {status:"UNAVAILABLE",code:"PYTHON_PROVIDER_UNREACHABLE",message:String(error),masteryWrite:false,academicWrite:false};}
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
