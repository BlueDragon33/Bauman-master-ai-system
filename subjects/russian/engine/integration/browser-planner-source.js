const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export const RUSSIAN_ENGINE_BROWSER_PLANNER_SOURCE='RUSSIAN_ENGINE_BROWSER_PLANNER_SOURCE_V1';

export function createBrowserPlannerSource(){
  let candidates=[];
  function sanitize(rows){
    const out=[];
    const seen=new Set();
    for(const raw of Array.isArray(rows)?rows:[]){
      const id=clean(raw?.id);
      if(!id||seen.has(id))continue;
      const reason=clean(raw?.reason);
      if(reason==='manual_override')continue;
      seen.add(id);
      out.push({
        id,
        label:clean(raw?.label)||'Russian Engine',
        skill:clean(raw?.skill)||'general',
        reason:reason||'continue_path',
        route:raw?.route&&typeof raw.route==='object'?copy(raw.route):{view:'learning'},
        priority:Math.max(0,Math.min(899,Number(raw?.priority)||0)),
        source:'russian-engine'
      });
    }
    return out;
  }
  return Object.freeze({
    schema:RUSSIAN_ENGINE_BROWSER_PLANNER_SOURCE,
    publish(rows){candidates=sanitize(rows);return copy(candidates)},
    clear(){candidates=[];return true},
    getCandidates(){return copy(candidates)},
    attach(planner){
      if(!planner||typeof planner.registerCandidateSource!=='function')return {attached:false,reason:'planner-candidate-seam-unavailable'};
      const attached=planner.registerCandidateSource('russian-engine',()=>copy(candidates));
      return {attached:attached===true,reason:attached===true?'attached':'registration-rejected'};
    },
    detach(planner){
      if(!planner||typeof planner.unregisterCandidateSource!=='function')return false;
      return planner.unregisterCandidateSource('russian-engine');
    }
  });
}
