const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];

const INFRA_FAILURES=new Set([
  'microphone-unavailable','microphone-denied','recording-corrupt',
  'stt-unavailable','stt-runtime-error','tts-failed','media-missing',
  'ai-unavailable','network-failed','storage-full','sync-conflict',
  'unsupported-capability'
]);

export function classifyFailure(code){
  const key=clean(code);
  if(INFRA_FAILURES.has(key))return {kind:'infrastructure',affectsLearnerJudgment:false};
  if(['learner-response-invalid','learner-did-not-understand'].includes(key))return {kind:'learner',affectsLearnerJudgment:true};
  return {kind:'unknown',affectsLearnerJudgment:false};
}

export function validateVoicePrivacyCapabilities(capabilities){
  const errors=[];
  if(capabilities?.privacy?.voiceUploadByAdapter!==false)errors.push('voiceUploadByAdapter must be false');
  if(capabilities?.privacy?.recordingRetention!=='TRANSIENT_LOCAL')errors.push('recordingRetention must be TRANSIENT_LOCAL');
  if(!arr(capabilities?.limitations).some(x=>String(x).includes('not pronunciation mastery evidence')))errors.push('ASR limitation must state no pronunciation mastery authority');
  return {ok:errors.length===0,errors};
}

export function validateEvidenceAuthority(evidence){
  const errors=[];
  for(const item of arr(evidence)){
    if(item?.authoritative===true)errors.push(`${item?.evidenceId||'evidence'} authoritative=true forbidden`);
    for(const field of ['masteryGranted','officialScore','stageUnlocked','levelGranted','credentialGranted']){
      if(Object.prototype.hasOwnProperty.call(item||{},field))errors.push(`${item?.evidenceId||'evidence'} contains forbidden ${field}`);
    }
  }
  return {ok:errors.length===0,errors};
}

export function validateLevelScale(levelCatalog){
  const levels=arr(levelCatalog?.levels),errors=[];
  if(levels.length!==100)errors.push(`expected 100 levels, got ${levels.length}`);
  if(new Set(levels.map(x=>x.id)).size!==levels.length)errors.push('duplicate level IDs');
  if(levels.some(x=>x?.promotion?.authority!=='RU04/C4'))errors.push('promotion authority drift');
  if(levels.some(x=>x?.officialMapping?.certified!==false))errors.push('official certification claim found');
  return {ok:errors.length===0,errors};
}

export function validateReferenceGraphSafety(graph){
  const errors=[];
  const ids=new Set(arr(graph?.nodes).map(x=>x.id));
  for(const node of arr(graph?.nodes)){
    if(node?.kind==='canonical-ref'){
      if(Object.hasOwn(node,'text')||Object.hasOwn(node,'russian'))errors.push(`${node.id} copied canonical text`);
      if(!clean(node?.canonicalRef?.ownerPath)||!clean(node?.canonicalRef?.id))errors.push(`${node.id} incomplete canonical ref`);
    }
  }
  for(const edge of arr(graph?.edges)){
    if(!ids.has(edge?.from)||!ids.has(edge?.to))errors.push('dangling graph edge');
  }
  return {ok:errors.length===0,errors};
}
