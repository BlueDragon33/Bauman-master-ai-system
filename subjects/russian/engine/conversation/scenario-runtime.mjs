const clean=value=>String(value??'').trim();
const copy=value=>{if(typeof structuredClone==='function')return structuredClone(value);return JSON.parse(JSON.stringify(value));};

export function validateScenarioDefinition(scenario){
  const errors=[];
  if(!clean(scenario?.id))errors.push('id required');
  if(!clean(scenario?.goal))errors.push('goal required');
  if(!Array.isArray(scenario?.roles)||scenario.roles.length<2)errors.push('roles require at least 2 entries');
  if(!clean(scenario?.startNode))errors.push('startNode required');
  const nodes=scenario?.nodes&&typeof scenario.nodes==='object'?scenario.nodes:{};
  if(!nodes[scenario?.startNode])errors.push('startNode missing from nodes');
  for(const [id,node] of Object.entries(nodes)){
    for(const next of Array.isArray(node?.next)?node.next:[]){
      if(!nodes[next])errors.push(`node ${id} points to missing node ${next}`);
    }
    if(node?.repairPath&&!Array.isArray(node.repairPath))errors.push(`node ${id} repairPath must be array`);
  }
  return {ok:errors.length===0,errors};
}

export function createScenarioRuntime(scenario,{clock=Date.now}={}){
  const check=validateScenarioDefinition(scenario);
  if(!check.ok)throw new Error('Scenario invalid: '+check.errors.join('; '));
  let state={
    schema:'RUSSIAN_ENGINE_SCENARIO_SESSION_V1',
    scenarioId:scenario.id,
    goal:scenario.goal,
    currentNode:scenario.startNode,
    turn:0,
    completed:false,
    repairUsed:[],
    events:[]
  };

  function current(){return scenario.nodes[state.currentNode];}
  function emit(type,payload={}){
    state.events.push({type,at:Number(clock()),...copy(payload)});
  }
  function begin(){
    emit('scenario.started',{node:state.currentNode});
    return snapshot();
  }
  function advance({action='',repairStrategy='',toNode=''}={}){
    if(state.completed)return snapshot();
    const node=current();
    if(repairStrategy){
      const allowed=Array.isArray(node.repairPath)?node.repairPath:[];
      if(!allowed.includes(repairStrategy))throw new Error('Repair strategy not allowed at current node');
      state.repairUsed.push(repairStrategy);
      emit('scenario.repair.used',{strategy:repairStrategy,node:state.currentNode});
    }
    const next=clean(toNode)||(Array.isArray(node.next)?node.next[0]:'');
    if(next){
      if(!scenario.nodes[next])throw new Error('Unknown next node: '+next);
      emit('scenario.turn.completed',{node:state.currentNode,action:clean(action),next});
      state.currentNode=next;
      state.turn+=1;
    }
    if(current()?.completion){
      state.completed=true;
      emit('scenario.goal.completed',{completion:current().completion});
    }
    return snapshot();
  }
  function snapshot(){return copy(state);}
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_SCENARIO_RUNTIME_V1',
    scenarioId:scenario.id,
    begin,advance,snapshot,
    currentNode:()=>copy(current())
  });
}
