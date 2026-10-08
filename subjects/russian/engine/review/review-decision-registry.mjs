const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

const DECISIONS=new Set(['APPROVE','CHANGES_REQUESTED','REJECT']);

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}

export function validateHumanReviewDecision(input){
  const errors=[];
  if(!clean(input?.decisionId))errors.push('decisionId required');
  if(!clean(input?.sceneId))errors.push('sceneId required');
  if(!clean(input?.revision))errors.push('revision required');
  if(!clean(input?.fingerprint))errors.push('fingerprint required');
  if(input?.authority!=='RU03')errors.push('authority must be RU03');
  if(input?.reviewerType!=='HUMAN')errors.push('reviewerType must be HUMAN');
  if(!clean(input?.reviewerId))errors.push('reviewerId required');
  if(!DECISIONS.has(input?.decision))errors.push('invalid decision');
  if(!clean(input?.decidedAt))errors.push('decidedAt required');
  return {ok:errors.length===0,errors};
}

export function createHumanReviewDecisionRegistry(){
  const byId=new Map();
  const latestByScene=new Map();

  function record(input){
    const validation=validateHumanReviewDecision(input);
    if(!validation.ok)throw new Error('Human review decision invalid: '+validation.errors.join('; '));
    const row=copy(input);
    const serialized=stable(row);
    const existing=byId.get(row.decisionId);
    if(existing){
      if(existing.serialized!==serialized)throw new Error('immutable decision conflict '+row.decisionId);
      return {created:false,decision:copy(existing.row)};
    }
    byId.set(row.decisionId,{serialized,row});
    latestByScene.set(row.sceneId,row.decisionId);
    return {created:true,decision:copy(row)};
  }

  function get(decisionId){
    const found=byId.get(clean(decisionId));
    return found?copy(found.row):null;
  }

  function latest(sceneId){
    const id=latestByScene.get(clean(sceneId));
    return id?get(id):null;
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_HUMAN_REVIEW_DECISION_REGISTRY_V1',
    record,get,latest,
    list:()=>[...byId.values()].map(x=>copy(x.row))
  });
}
