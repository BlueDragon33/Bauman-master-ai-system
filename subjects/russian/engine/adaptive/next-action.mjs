const arr=v=>Array.isArray(v)?v:[];
const clean=v=>String(v??'').trim();

export function recommendNextAction({snapshot,availableExperiences=[],milestone=false}={}){
  const reviews=arr(snapshot?.reviewDue);
  if(reviews.length){
    return {kind:'review',reason:'review-due',target:reviews[0],explain:'Previously observed evidence is due for review.'};
  }

  const caps=snapshot?.capabilities||{};
  const weak=Object.entries(caps)
    .filter(([,v])=>Number(v?.evidenceCount)>0)
    .sort((a,b)=>Number(a[1]?.estimate)-Number(b[1]?.estimate))[0];

  if(weak&&Number(weak[1]?.estimate)<.45){
    return {kind:'remediate',reason:'weak-dimension',dimension:weak[0],explain:`${weak[0]} has the weakest current evidence estimate.`};
  }

  if(weak&&Number(weak[1]?.supportDependency)>.4){
    return {kind:'vary',reason:'support-dependency',dimension:weak[0],explain:`${weak[0]} is succeeding with substantial support; vary the task with less support.`};
  }

  if(milestone){
    return {kind:'transfer',reason:'milestone-transfer-gate',explain:'Milestone progression requires unseen transfer evidence.'};
  }

  const first=arr(availableExperiences)[0];
  if(first){
    return {kind:'introduce',reason:'ready-for-next-experience',experienceId:clean(first.experienceId||first.id),explain:'No higher-priority review or remediation signal is active.'};
  }

  return {kind:'pause',reason:'no-safe-content',explain:'No validated next experience is currently available.'};
}
