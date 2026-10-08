// RE42 engineering candidate only. Never grant linguistic or learner mastery authority.
const clean=value=>String(value??'').trim();
const arr=value=>Array.isArray(value)?value:[];
export function validateSpatialCandidate(pack){
  const errors=[];
  const worlds=new Map();
  if(pack?.schema!=='RUSSIAN_ENGINE_SPATIAL_CANDIDATE_V1')errors.push('wrong schema');
  if(pack?.status!=='AI_DRAFT_NONCANONICAL'||pack?.humanApproval!==false)errors.push('canonical authority forbidden');
  if(!clean(pack?.revision))errors.push('candidate revision required');
  for(const world of arr(pack?.worlds)){
    const id=clean(world?.worldId);
    if(!id||worlds.has(id))errors.push('missing or duplicate world '+id);
    const ids=new Set();
    if(arr(world?.nodes).length<4)errors.push(id+': insufficient physical nodes');
    for(const node of arr(world?.nodes)){
      const key=clean(node?.nodeId);
      if(!key||ids.has(key))errors.push(id+': duplicate/empty node '+key);
      ids.add(key);
      if(!clean(node?.visualType)||!clean(node?.labelVi))errors.push(id+': node requires semantic visual and Vietnamese accessibility text');
      if(!Number.isFinite(node?.x)||!Number.isFinite(node?.y)||node.x<0||node.x>100||node.y<0||node.y>100)errors.push(id+': invalid spatial coordinates '+key);
    }
    for(const edge of arr(world?.edges)){
      if(!ids.has(edge.from)||!ids.has(edge.to))errors.push(id+': dangling route');
      if(edge.from===edge.to)errors.push(id+': route loops to itself');
    }
    worlds.set(id,{world,ids});
  }
  const sceneIds=new Set();
  for(const scene of arr(pack?.scenes)){
    const id=clean(scene?.sceneId);
    if(!id||sceneIds.has(id))errors.push('duplicate or absent scene '+id);
    sceneIds.add(id);
    if(scene?.status!=='AI_DRAFT_PENDING_RU03'||scene?.humanApproval!==false||scene?.textAuthority!=='NONE'||scene?.audioAuthority!=='NONE')errors.push(id+': unreviewed authority must remain NONE');
    if(!/[А-Яа-яЁё]/.test(scene?.russianDraft||''))errors.push(id+': Russian editorial draft required');
    const context=worlds.get(clean(scene?.worldId));
    if(!context)errors.push(id+': missing world');
    if(!clean(scene?.speakerRole)||!['familiar','polite-stranger'].includes(scene?.register))errors.push(id+': speaker/register missing');
    if(scene?.register==='polite-stranger'&&!/пожалуйста[,.?]?/i.test(scene?.russianDraft||''))errors.push(id+': polite placeholder missing (structural check only)');
    const action=scene?.expectedAction||{};
    if(!['point-to-location','handover-object','dialogue-intent'].includes(action.kind))errors.push(id+': wrong action kind');
    if(!clean(action.targetId))errors.push(id+': target missing');
    if(action.kind==='point-to-location'&&!context?.ids.has(action.targetId))errors.push(id+': location target absent from world');
    if(action.kind==='handover-object'&&(!context?.ids.has(action.fromNodeId)||!context?.ids.has(action.toNodeId)||action.fromNodeId===action.toNodeId))errors.push(id+': invalid handover endpoints');
    if(action.kind==='dialogue-intent'&&(!clean(scene?.speakerRole)||scene?.speakerRole!=='learner-customer'))errors.push(id+': dialogue learner role missing');
  }
  if(arr(pack?.scenes).length!==15)errors.push('expected 15 editorial scenes');
  if(arr(pack?.worlds).length!==5)errors.push('expected five physical worlds');
  return {ok:errors.length===0,errors,sceneCount:arr(pack?.scenes).length,worldCount:worlds.size,canonicalPublicationReady:false};
}
export function evaluateSpatialCandidateAction({scene,kind,targetId,fromNodeId,toNodeId}={}){
  if(!scene||scene.status!=='AI_DRAFT_PENDING_RU03'||scene.humanApproval!==false)throw new Error('noncanonical candidate required');
  const expected=scene.expectedAction||{};
  const matches=clean(kind)===clean(expected.kind)&&clean(targetId)===clean(expected.targetId)
    &&(expected.kind!=='handover-object'||(clean(fromNodeId)===clean(expected.fromNodeId)&&clean(toNodeId)===clean(expected.toNodeId)));
  return Object.freeze({
    success:matches,
    previewOnly:true,
    observationType:'draft-'+clean(expected.kind)+'-practice',
    linguisticAuthority:false,
    pronunciationVerified:false,
    masteryMutation:false,
    canonicalPublicationReady:false
  });
}
