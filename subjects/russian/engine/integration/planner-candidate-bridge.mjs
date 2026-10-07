const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export const EXISTING_PLANNER_REASONS=Object.freeze({
  DUE_REVIEW:'due_review',
  WEAKNESS_REPAIR:'weakness_repair',
  SKILL_BALANCE:'skill_balance',
  CONTINUE_PATH:'continue_path'
});

const routeForSkill=skill=>({
  listening:{view:'media'},
  speaking:{view:'dialogue'},
  writing:{view:'writing'},
  technical:{view:'learning',learnTab:'theory'},
  grammar:{view:'grammar'},
  vocabulary:{view:'vocab'},
  interaction:{view:'dialogue'}
}[clean(skill)]||{view:'learning',learnTab:'review'});

function stableId(parts){
  return ['engine',...parts.map(clean).filter(Boolean)].join(':');
}

export function validatePlannerCompatibility(owner){
  const errors=[];
  if(owner?.schema!=='RUSSIAN_ADAPTIVE_PLANNER_V1')errors.push('unexpected planner schema');
  if(typeof owner?.buildPlan!=='function')errors.push('buildPlan missing');
  if(typeof owner?.explain!=='function')errors.push('explain missing');
  const reasons=owner?.reasons||{};
  for(const value of Object.values(EXISTING_PLANNER_REASONS)){
    if(!Object.values(reasons).includes(value))errors.push('planner reason missing '+value);
  }
  return {ok:errors.length===0,errors};
}

export function buildPlannerCandidates({
  snapshot,
  recommendation,
  experiences=[],
  capabilities={},
  revision='r1'
}={}){
  const out=[];
  const available=new Map(arr(experiences).map(x=>[clean(x.experienceId||x.id),x]));
  const add=row=>{
    if(!row?.id)return;
    if(out.some(x=>x.id===row.id))return;
    out.push(Object.freeze(row));
  };

  for(const review of arr(snapshot?.reviewDue)){
    const ref=clean(review?.experienceId||review?.id);
    const exp=available.get(ref);
    if(ref&&exp){
      add({
        id:stableId(['review',ref,revision]),
        label:clean(exp.label)||'Ôn lại Russian Engine',
        skill:clean(review?.skill)||'review',
        reason:EXISTING_PLANNER_REASONS.DUE_REVIEW,
        route:copy(exp.route||{view:'learning',learnTab:'review'}),
        priority:880,
        source:'russian-engine',
        engineExperienceId:ref,
        revision:clean(revision)
      });
    }
  }

  if(recommendation?.kind==='remediate'){
    const dimension=clean(recommendation.dimension);
    add({
      id:stableId(['remediate',dimension,revision]),
      label:'Sửa điểm yếu · '+dimension,
      skill:dimension,
      reason:EXISTING_PLANNER_REASONS.WEAKNESS_REPAIR,
      route:routeForSkill(dimension),
      priority:860,
      source:'russian-engine',
      revision:clean(revision)
    });
  }

  if(recommendation?.kind==='transfer'){
    const ref=clean(recommendation.experienceId);
    const exp=available.get(ref)||arr(experiences).find(x=>x?.transfer===true);
    const id=clean(exp?.experienceId||exp?.id);
    if(id){
      add({
        id:stableId(['transfer',id,revision]),
        label:clean(exp.label)||'Luyện chuyển giao',
        skill:clean(exp.skill)||'interaction',
        reason:EXISTING_PLANNER_REASONS.SKILL_BALANCE,
        route:copy(exp.route||routeForSkill(exp.skill||'interaction')),
        priority:720,
        source:'russian-engine',
        engineExperienceId:id,
        revision:clean(revision)
      });
    }
  }

  if(recommendation?.kind==='introduce'){
    const ref=clean(recommendation.experienceId);
    const exp=available.get(ref);
    if(exp){
      const required=arr(exp.requiredCapabilities);
      const missing=required.filter(cap=>capabilities?.[cap]!==true);
      if(!missing.length){
        add({
          id:stableId(['continue',ref,revision]),
          label:clean(exp.label)||'Tiếp tục Russian Engine',
          skill:clean(exp.skill)||'path',
          reason:EXISTING_PLANNER_REASONS.CONTINUE_PATH,
          route:copy(exp.route||{view:'learning'}),
          priority:520,
          source:'russian-engine',
          engineExperienceId:ref,
          revision:clean(revision)
        });
      }
    }
  }

  return out.map(copy);
}
