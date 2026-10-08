const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();
const RU=/[А-Яа-яЁё]/;

export function validateRepairDialogueCandidate(catalog,worldCatalog){
  const errors=[];
  if(catalog?.schema!=='RUSSIAN_ENGINE_REPAIR_DIALOGUES_AI_DRAFT_V1')errors.push('wrong dialogue candidate schema');
  if(catalog?.status!=='AI_DRAFT_PENDING_RU03'||catalog?.humanApproval!==false||catalog?.languageAuthority!=='NONE'||catalog?.audioAuthority!=='NONE')errors.push('linguistic authority forbidden');
  if(!txt(catalog?.revision))errors.push('revision required');
  for(const key of ['repeat','slower'])if(!RU.test(catalog?.repair?.[key]||''))errors.push('Russian repair phrase required '+key);
  const worlds=new Map(arr(worldCatalog?.worlds).map(w=>[w.worldId,new Set(arr(w.nodes).map(n=>n.nodeId))]));
  const ids=new Set();
  for(const scene of arr(catalog?.scenes)){
    const id=txt(scene?.sceneId);
    if(!id||ids.has(id))errors.push('duplicate/absent dialogue id '+id);
    ids.add(id);
    if(!worlds.get(scene.worldId)?.has(scene.targetNodeId))errors.push(id+': spatial destination missing');
    if(!['shop-staff','passerby','dorm-administrator','university-staff'].includes(scene.speakerRole))errors.push(id+': speaker role invalid');
    if(scene.register!=='polite-stranger')errors.push(id+': register mismatch');
    for(const field of ['greet','request','reply','thanks','closing']){
      if(!RU.test(scene.surface?.[field]||''))errors.push(id+': Russian editorial line missing '+field);
    }
    for(const field of ['setting','purpose','replyHint','greeting','request','reply','thank']){
      if(!txt(scene.vn?.[field]))errors.push(id+': VN beginner orientation missing '+field);
    }
    if(scene?.humanApproval===true||scene?.status==='RU03_APPROVED')errors.push(id+': fake human approval');
  }
  if(arr(catalog?.scenes).length!==4)errors.push('four bounded scenarios expected');
  return {ok:errors.length===0,errors,sceneCount:arr(catalog?.scenes).length,canonicalPublicationReady:false};
}

export function advanceRepairDialogueDraft({state,scene,action,nodeId}={}){
  if(!scene?.sceneId)throw new Error('scene required');
  const existing=state||{phase:'greet',repairCount:0,repairMode:null};
  const phase=txt(existing.phase)||'greet',kind=txt(action);
  const beforeCount=Math.max(0,Math.floor(Number(existing.repairCount)||0));
  let next=phase,repairCount=beforeCount,repairMode=existing.repairMode||null;
  let accepted=false,wrongTarget=false,selfReported=false;
  if(phase==='greet'&&kind==='shadow'){next='request';accepted=true;selfReported=true}
  else if(phase==='request'&&kind==='shadow'){next='listen';accepted=true;selfReported=true}
  else if(phase==='listen'&&kind==='advance'){next='locate';accepted=true}
  else if(phase==='listen'&&['repair-repeat','repair-slower'].includes(kind)){
    next='repair';repairMode=kind==='repair-repeat'?'repeat':'slower';accepted=true;
  }
  else if(phase==='repair'&&kind==='shadow'){
    next='listen';repairCount++;accepted=true;selfReported=true;
  }
  else if(phase==='locate'&&kind==='locate'){
    if(txt(nodeId)===txt(scene.targetNodeId)){next='thank';accepted=true}
    else wrongTarget=true;
  }
  else if(phase==='thank'&&kind==='shadow'){next='done';accepted=true;selfReported=true}
  return Object.freeze({
    state:Object.freeze({phase:next,repairCount,repairMode}),
    accepted,wrongTarget,selfReported,
    previewOnly:true,authoritative:false,masteryMutation:false,
    canonicalPublicationReady:false
  });
}
