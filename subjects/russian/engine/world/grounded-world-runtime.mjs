const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

export function validateGroundedWorld(world){
  const errors=[];
  if(!clean(world?.worldId))errors.push('worldId required');
  const ids=new Set();
  for(const e of arr(world?.entities)){
    if(!clean(e?.id))errors.push('entity id required');
    if(ids.has(e?.id))errors.push('duplicate entity id '+e.id);
    ids.add(e?.id);
  }
  for(const rel of arr(world?.relations)){
    if(!ids.has(rel?.subject)||!ids.has(rel?.object))errors.push('relation references missing entity');
  }
  for(const exp of arr(world?.experiences)){
    if(!clean(exp?.experienceId))errors.push('experienceId required');
    if(!clean(exp?.stimulus?.audioText))errors.push(exp?.experienceId+' missing audioText');
    if(exp?.stimulus?.language!=='ru')errors.push(exp?.experienceId+' language must be ru');
    const goal=exp?.goal||{};
    if(goal.kind==='transfer-object'){
      if(!ids.has(goal.objectId)||!ids.has(goal.toEntityId))errors.push(exp.experienceId+' invalid transfer goal');
    }else if(goal.kind==='place-object'){
      if(!ids.has(goal.objectId)||!ids.has(goal.locationId))errors.push(exp.experienceId+' invalid placement goal');
    }else{
      errors.push(exp?.experienceId+' unsupported goal kind');
    }
  }
  return {ok:errors.length===0,errors};
}

function initialState(world){
  const locations={};
  for(const rel of arr(world.relations)){
    if(rel.relation==='AT')locations[rel.subject]=rel.object;
  }
  return {locations,holders:{},events:[]};
}

export function createGroundedWorldRuntime(world,{clock=Date.now}={}){
  const validation=validateGroundedWorld(world);
  if(!validation.ok)throw new Error('Grounded world invalid: '+validation.errors.join('; '));
  const def=copy(world);
  let state=initialState(def);
  let currentExperienceId=null;

  function experience(id){
    const row=def.experiences.find(x=>x.experienceId===clean(id));
    return row?copy(row):null;
  }

  function start(id){
    const exp=experience(id);
    if(!exp)throw new Error('Unknown experience '+id);
    currentExperienceId=exp.experienceId;
    state.events.push({type:'experience.started',experienceId:exp.experienceId,at:Number(clock())});
    return {experience:exp,state:snapshot()};
  }

  function act(action={}){
    if(!currentExperienceId)throw new Error('No active experience');
    const exp=def.experiences.find(x=>x.experienceId===currentExperienceId);
    const goal=exp.goal;
    let success=false;

    if(goal.kind==='transfer-object'&&action.kind==='transfer-object'){
      success=clean(action.objectId)===goal.objectId&&clean(action.toEntityId)===goal.toEntityId;
      if(success){
        state.holders[goal.objectId]=goal.toEntityId;
        delete state.locations[goal.objectId];
      }
    }
    if(goal.kind==='place-object'&&action.kind==='place-object'){
      success=clean(action.objectId)===goal.objectId&&clean(action.locationId)===goal.locationId;
      if(success){
        state.locations[goal.objectId]=goal.locationId;
        delete state.holders[goal.objectId];
      }
    }

    state.events.push({
      type:success?'world.action.succeeded':'world.action.failed',
      experienceId:currentExperienceId,
      action:copy(action),
      at:Number(clock())
    });

    return {
      success,
      consequence:success?{kind:'world-state-change'}:{kind:'no-success-mutation'},
      evidence:{
        schemaVersion:'RUSSIAN_ENGINE_WORLD_OBSERVATION_V1',
        experienceId:currentExperienceId,
        observationType:'grounded-world-action',
        result:{success,goalKind:goal.kind},
        authoritative:false,
        masteryMutation:false
      },
      state:snapshot()
    };
  }

  function nextTransferExperience(){
    const current=def.experiences.find(x=>x.experienceId===currentExperienceId);
    if(!current)return null;
    return copy(def.experiences.find(x=>x.experienceId!==current.experienceId&&x.goal?.kind===current.goal?.kind)||null);
  }

  function reset(){
    state=initialState(def);
    currentExperienceId=null;
    return snapshot();
  }

  function snapshot(){return copy({worldId:def.worldId,currentExperienceId,...state});}

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_GROUNDED_WORLD_RUNTIME_V1',
    worldId:def.worldId,
    experiences:()=>def.experiences.map(copy),
    experience,
    start,
    act,
    nextTransferExperience,
    snapshot,
    reset
  });
}
