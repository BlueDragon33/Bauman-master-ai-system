const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

export const BROWSER_LISTENING_TIERS=Object.freeze([
 {id:'L0',rate:.7,label:'0.7×',providerClaim:'careful-rate'},
 {id:'L1',rate:.85,label:'0.85×',providerClaim:'clear-rate'},
 {id:'L2',rate:1,label:'1.0×',providerClaim:'normal-rate'}
]);

export function listeningVariantsForText(audioText){
 const text=clean(audioText);
 if(!text)throw new Error('audioText required');
 return BROWSER_LISTENING_TIERS.map((tier,index)=>({
  ...tier,tier:index,audioText:text,language:'ru',
  transcriptPolicy:'hidden',
  speakerVariationClaim:false,
  noiseClaim:false
 }));
}

export function validateBrowserConversationWorld(world){
 const errors=[];
 if(!clean(world?.worldId))errors.push('worldId required');
 if(!clean(world?.setting))errors.push('setting required');
 if(!clean(world?.goal?.id))errors.push('goal required');
 if(!clean(world?.startNode))errors.push('startNode required');
 const nodes=world?.nodes||{};
 if(!nodes[world?.startNode])errors.push('startNode missing');
 for(const [id,node] of Object.entries(nodes)){
  for(const next of arr(node?.next))if(!nodes[next])errors.push(id+' missing next '+next);
  if(node?.completion!==true&&!clean(node?.partnerText))errors.push(id+' partnerText required');
  for(const choice of arr(node?.functions)){
   if(!clean(choice?.id)||!clean(choice?.learnerText))errors.push(id+' invalid function choice');
  }
 }
 return {ok:errors.length===0,errors};
}

export function createBrowserConversationRuntime(world,{clock=Date.now}={}){
 const valid=validateBrowserConversationWorld(world);
 if(!valid.ok)throw new Error('conversation world invalid: '+valid.errors.join('; '));
 const def=copy(world);
 let state={worldId:def.worldId,currentNode:def.startNode,turn:0,completed:false,repairUsed:[],events:[]};

 function node(){return def.nodes[state.currentNode];}
 function emit(type,payload={}){state.events.push({type,at:Number(clock()),...copy(payload)});}
 function checkComplete(){if(node()?.completion===true){state.completed=true;emit('conversation.goal.completed',{goalId:def.goal.id});}}
 function advance(){
  const next=arr(node()?.next)[0]||'';
  if(next){state.currentNode=next;state.turn++;emit('conversation.turn.advanced',{to:next});checkComplete();}
 }
 function snapshot(){return copy({...state,setting:def.setting,goal:def.goal,facts:def.facts,current:node()});}

 return Object.freeze({
  schema:'RUSSIAN_ENGINE_BROWSER_CONVERSATION_RUNTIME_V1',
  begin(){emit('conversation.started',{node:state.currentNode});checkComplete();return snapshot()},
  current:()=>copy(node()),
  snapshot,
  listeningVariants(){return node()?.partnerText?listeningVariantsForText(node().partnerText):[]},
  respond(functionId){
   if(state.completed)return {accepted:false,reason:'completed',state:snapshot()};
   const choice=arr(node()?.functions).find(x=>clean(x.id)===clean(functionId));
   if(!choice){emit('conversation.function.rejected',{functionId:clean(functionId)});return {accepted:false,reason:'function-not-valid',state:snapshot()};}
   emit('conversation.function.accepted',{functionId:choice.id});
   advance();
   return {accepted:true,choice:copy(choice),state:snapshot()};
  },
  repair(repairId){
   if(state.completed)return {accepted:false,reason:'completed',state:snapshot()};
   const id=clean(repairId);
   if(!arr(node()?.repairOptions).includes(id))return {accepted:false,reason:'repair-not-valid',state:snapshot()};
   state.repairUsed.push(id);emit('conversation.repair.used',{repair:id});
   return {accepted:true,repair:id,playbackRate:id==='ask-slower'?.7:1,state:snapshot()};
  }
 });
}

export function buildSpeakingReflexSignal({worldId,turn,transcript='',startedAt=0,endedAt=0,providerFailure=false}={}){
 return {
  schemaVersion:'RUSSIAN_ENGINE_SPEAKING_REFLEX_SIGNAL_V1',
  observationType:'speaking-reflex-signal',
  worldId:clean(worldId),
  turn:Number(turn)||0,
  transcript:clean(transcript),
  latencyMs:Math.max(0,(Number(endedAt)||0)-(Number(startedAt)||0)),
  providerFailure:providerFailure===true,
  pronunciationAuthority:false,
  stressAuthority:false,
  authoritative:false,
  masteryMutation:false
 };
}
