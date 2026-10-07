const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

export function validateConversationWorld(world){
  const errors=[];
  if(!clean(world?.worldId))errors.push('worldId required');
  if(!clean(world?.goal?.id))errors.push('goal.id required');
  if(!arr(world?.roles).length)errors.push('roles required');
  if(!clean(world?.startNode))errors.push('startNode required');
  const nodes=world?.nodes||{};
  if(!nodes[world?.startNode])errors.push('startNode missing');
  for(const [id,node] of Object.entries(nodes)){
    for(const next of arr(node?.next)){
      if(!nodes[next])errors.push(id+' points to missing '+next);
    }
    for(const repair of arr(node?.repairOptions)){
      if(!clean(repair))errors.push(id+' has invalid repair option');
    }
  }
  return {ok:errors.length===0,errors};
}

export function createConversationWorld(world,{clock=Date.now}={}){
  const valid=validateConversationWorld(world);
  if(!valid.ok)throw new Error('Conversation world invalid: '+valid.errors.join('; '));
  const def=copy(world);
  const canonicalFacts=JSON.stringify(def.facts||{});
  let state={
    worldId:def.worldId,
    currentNode:def.startNode,
    turn:0,
    completed:false,
    repairUsed:[],
    events:[]
  };

  function node(){return def.nodes[state.currentNode];}
  function emit(type,payload={}){state.events.push({type,at:Number(clock()),...copy(payload)});}
  function begin(){emit('conversation.started',{node:state.currentNode});return snapshot();}
  function advance({functionId='',repair='',nextNode=''}={}){
    if(state.completed)return snapshot();
    const current=node();
    if(repair){
      if(!arr(current.repairOptions).includes(repair))throw new Error('repair not allowed at current node');
      state.repairUsed.push(repair);
      emit('conversation.repair.used',{repair,node:state.currentNode});
    }
    if(functionId)emit('conversation.function.observed',{functionId,node:state.currentNode});
    const next=clean(nextNode)||arr(current.next)[0]||'';
    if(next){
      if(!def.nodes[next])throw new Error('unknown next node '+next);
      emit('conversation.turn.completed',{from:state.currentNode,to:next});
      state.currentNode=next;
      state.turn++;
    }
    if(node()?.completion===true){
      state.completed=true;
      emit('conversation.goal.completed',{goalId:def.goal.id});
    }
    return snapshot();
  }
  function snapshot(){return copy({...state,goal:def.goal,facts:def.facts||{}});}

  function validateAiVariation(candidate={}){
    const errors=[];
    if(JSON.stringify(candidate.facts??def.facts)!==canonicalFacts)errors.push('AI variation changed world facts');
    if(clean(candidate.goalId||def.goal.id)!==def.goal.id)errors.push('AI variation changed goal');
    if(candidate.masteryGranted===true)errors.push('AI variation cannot grant mastery');
    return {ok:errors.length===0,errors};
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_CONVERSATION_WORLD_V1',
    begin,advance,snapshot,validateAiVariation,
    currentNode:()=>copy(node())
  });
}
