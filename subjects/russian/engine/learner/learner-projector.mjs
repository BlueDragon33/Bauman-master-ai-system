const clean=value=>String(value??'').trim();
const arr=value=>Array.isArray(value)?value:[];
const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

function profileMatch(evidence,profileId){
  const own=clean(evidence?.profileId);
  return !own || own===profileId;
}

function competencyRows(evidence){
  const out=[];
  for(const row of evidence){
    for(const competencyId of arr(row?.competencyIds)){
      out.push({competencyId,...row});
    }
  }
  return out;
}

export function projectLearnerModel({
  profileId,
  evidence=[],
  reviewItems=[],
  currentLevelId=null
}={}) {
  const id=clean(profileId);
  if(!id)throw new Error('profileId is required');
  const filtered=arr(evidence).filter(row=>profileMatch(row,id));
  const rows=competencyRows(filtered);
  const byCompetency=new Map();

  for(const row of rows){
    const key=clean(row.competencyId);
    if(!key)continue;
    const current=byCompetency.get(key)||{
      competencyId:key,
      observations:0,
      successes:0,
      failures:0,
      independentSuccesses:0,
      supportedSuccesses:0,
      supportTotal:0,
      responseMsTotal:0,
      responseMsCount:0,
      evidenceTypes:new Set(),
      lastObservedAtMs:0
    };
    current.observations+=1;
    const success=row?.result?.success===true || row?.result?.completed===true;
    const supportLevel=Math.max(0,Math.min(10,Number(row?.supportLevel)||0));
    if(success){
      current.successes+=1;
      if(supportLevel===0)current.independentSuccesses+=1;
      else current.supportedSuccesses+=1;
    }else if(row?.result?.success===false){
      current.failures+=1;
    }
    current.supportTotal+=supportLevel;
    const responseMs=Number(row?.result?.responseMs ?? row?.timing?.responseMs);
    if(Number.isFinite(responseMs)&&responseMs>=0){
      current.responseMsTotal+=responseMs;
      current.responseMsCount+=1;
    }
    current.evidenceTypes.add(clean(row?.observationType)||'unknown');
    current.lastObservedAtMs=Math.max(current.lastObservedAtMs,Number(row?.observedAtMs)||0);
    byCompetency.set(key,current);
  }

  const capabilities={};
  for(const [key,row] of byCompetency){
    capabilities[key]={
      observations:row.observations,
      successes:row.successes,
      failures:row.failures,
      independentSuccesses:row.independentSuccesses,
      supportedSuccesses:row.supportedSuccesses,
      independentSuccessRate:row.observations?row.independentSuccesses/row.observations:0,
      averageSupportLevel:row.observations?row.supportTotal/row.observations:0,
      averageResponseMs:row.responseMsCount?row.responseMsTotal/row.responseMsCount:null,
      evidenceTypes:[...row.evidenceTypes].sort(),
      lastObservedAtMs:row.lastObservedAtMs
    };
  }

  const reviewDue=arr(reviewItems)
    .filter(item=>!clean(item?.profileId)||clean(item.profileId)===id)
    .map(copy);

  const supportDependency={
    evidenceCount:filtered.length,
    translatedEvidence:filtered.filter(x=>x?.translationUsed===true || Number(x?.supportLevel)===10).length,
    highSupportEvidence:filtered.filter(x=>Number(x?.supportLevel)>=6).length,
    independentEvidence:filtered.filter(x=>Number(x?.supportLevel)===0).length
  };

  return Object.freeze({
    schemaVersion:'RUSSIAN_ENGINE_LEARNER_PROJECTION_V1',
    profileId:id,
    currentLevelId:clean(currentLevelId)||null,
    evidenceCount:filtered.length,
    capabilities,
    reviewDue,
    supportDependency
  });
}

export function deriveReviewCandidates({profileId,evidence=[]}={}) {
  const id=clean(profileId);
  if(!id)throw new Error('profileId is required');
  const filtered=arr(evidence).filter(row=>profileMatch(row,id));
  const out=[];
  for(const row of filtered){
    const failed=row?.result?.success===false;
    const highSupport=Number(row?.supportLevel)>=6;
    const noSignal=row?.result?.providerSignalAvailable===false && row?.provider?.infrastructureFailure===true;
    if(noSignal)continue;
    if(!failed && !highSupport)continue;
    out.push({
      id:`REVIEW:${clean(row?.evidenceId)||out.length+1}`,
      profileId:id,
      competencyIds:[...arr(row?.competencyIds)],
      sourceEvidenceId:clean(row?.evidenceId),
      reason:failed?'observed-failure':'high-support-dependency',
      priority:failed?100:70,
      supportLevel:Math.max(0,Math.min(10,Number(row?.supportLevel)||0)),
      experienceId:clean(row?.experienceId)
    });
  }
  return out;
}
