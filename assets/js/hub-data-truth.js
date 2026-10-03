/* Bauman Master Hub · Data Truth Adapter V1
 * Cross-page read-model helper only. It does not own subject mastery, assessment,
 * schedule semantics or research content. */
(()=>{
  'use strict';
  const RELEASE='HUB_DATA_TRUTH_V1_2026_10_03';
  const STATES=Object.freeze({CURRENT:'CURRENT',STALE:'STALE',UNAVAILABLE:'UNAVAILABLE',LOCAL_HUB:'LOCAL_HUB'});
  const own=(obj,key)=>Boolean(obj&&Object.prototype.hasOwnProperty.call(obj,key));
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v))));

  function field(value,{status,source='hub',asOf=null,reason=''}={}){
    const resolved=status||((value===undefined||value===null)?STATES.UNAVAILABLE:STATES.CURRENT);
    return {status:resolved,value:(resolved===STATES.UNAVAILABLE?null:value),source,asOf,reason};
  }
  function progress(map,id,{source='hub.state.progress',status=STATES.CURRENT,asOf=null}={}){
    if(!id||!own(map,id)||map[id]===undefined||map[id]===null||!Number.isFinite(Number(map[id]))){
      return field(null,{status:STATES.UNAVAILABLE,source,asOf,reason:'progress_missing'});
    }
    return field(clamp(map[id]),{status,source,asOf});
  }
  function averageProgress(map,ids,{source='hub.state.progress'}={}){
    const rows=(ids||[]).map(id=>progress(map,id,{source}));
    const known=rows.filter(x=>finite(x.value));
    if(!known.length)return field(null,{status:STATES.UNAVAILABLE,source,reason:'progress_missing'});
    const value=Math.round(known.reduce((a,b)=>a+b.value,0)/known.length);
    return field(value,{status:known.length===rows.length?STATES.CURRENT:STATES.STALE,source,reason:known.length===rows.length?'':'partial_progress'});
  }
  function local(value,{source='hub.local',reason=''}={}){return field(value,{status:STATES.LOCAL_HUB,source,reason})}
  function label(x,{suffix='',unavailable='Chưa có dữ liệu',stalePrefix='Dữ liệu chưa đầy đủ · '}={}){
    if(!x||x.status===STATES.UNAVAILABLE)return unavailable;
    const value=String(x.value??'');
    if(x.status===STATES.STALE)return stalePrefix+value+suffix;
    return value+suffix;
  }
  function numericLabel(x,suffix='%'){return x&&finite(x.value)?String(x.value)+suffix:'—'}
  function cssPercent(x){return x&&finite(x.value)?clamp(x.value):0}

  function mark(host,status,source){
    if(!host)return;
    host.dataset.hubTruthStatus=status||STATES.CURRENT;
    if(source)host.dataset.hubTruthSource=source;
  }

  function restoreTruthSafePrimaryRenderers(){
    const a=typeof app!=='undefined'?app:null;
    if(!a||a.__hubDataTruthV1)return false;
    a.__hubDataTruthV1={
      release:RELEASE,
      subjectReferenceTruthSafe:Boolean(a.__subjectsReferenceV1),
      researchReferenceTruthSafe:Boolean(a.__thesisReferenceV1)
    };
    document.documentElement.dataset.hubDataTruth=RELEASE;
    const current=window.state?.page;
    if(current==='subjects'&&typeof a.subjects==='function')a.subjects();
    if(current==='research'&&typeof a.research==='function')a.research();
    const host=current==='subjects'?document.getElementById('page-subjects'):current==='research'?document.getElementById('page-research'):null;
    if(host)mark(host,current==='research'?STATES.LOCAL_HUB:STATES.CURRENT,current==='research'?'hub.canonical.research+hub.local':'hub.canonical.subjects+hub.local');
    return true;
  }

  function selfCheck(){
    const a=typeof app!=='undefined'?app:null;
    return {
      release:RELEASE,
      patched:Boolean(a?.__hubDataTruthV1),
      states:Object.values(STATES),
      subjectReferenceTruthSafe:Boolean(a?.__hubDataTruthV1?.subjectReferenceTruthSafe),
      researchReferenceTruthSafe:Boolean(a?.__hubDataTruthV1?.researchReferenceTruthSafe),
      realZero:progress({x:0},'x').value===0,
      missingIsUnavailable:progress({},'x').status===STATES.UNAVAILABLE
    };
  }

  window.BAUMAN_HUB_TRUTH={release:RELEASE,STATES,field,progress,averageProgress,local,label,numericLabel,cssPercent,restoreTruthSafePrimaryRenderers,selfCheck};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreTruthSafePrimaryRenderers,{once:true});
  else restoreTruthSafePrimaryRenderers();
})();