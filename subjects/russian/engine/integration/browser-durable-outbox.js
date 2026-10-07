const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

function containsRawVoice(value){
  if(!value||typeof value!=='object')return false;
  if(typeof Blob!=='undefined'&&value instanceof Blob)return true;
  for(const [key,v] of Object.entries(value)){
    if(['rawAudio','audioBlob','voiceBlob','recordingBlob'].includes(key)&&v!=null)return true;
    if(v&&typeof v==='object'&&containsRawVoice(v))return true;
  }
  return false;
}

export function createBrowserDurableOutbox({storage=globalThis.localStorage,profileId='default',maxDelivered=200}={}){
  const key='russian_engine_outbox_v1:'+clean(profileId||'default');
  const max=Math.max(20,Math.min(1000,Number(maxDelivered)||200));
  const empty=()=>({schema:'RUSSIAN_ENGINE_BROWSER_OUTBOX_V1',profileId:clean(profileId||'default'),messages:[]});

  function read(){
    try{
      const raw=storage?.getItem?.(key);
      const state=raw?JSON.parse(raw):empty();
      if(!Array.isArray(state.messages))state.messages=[];
      for(const row of state.messages){
        if(row.state==='DELIVERING')row.state='FAILED_RETRYABLE';
      }
      return state;
    }catch(error){
      return {...empty(),storageError:String(error?.message||error)};
    }
  }
  function write(state){
    try{
      storage?.setItem?.(key,JSON.stringify(state));
      return {ok:true};
    }catch(error){
      return {ok:false,infrastructureFailure:true,error:String(error?.message||error)};
    }
  }
  let state=read();
  write(state);

  function prune(){
    const active=state.messages.filter(x=>x.state!=='DELIVERED');
    const delivered=state.messages.filter(x=>x.state==='DELIVERED').slice(-max);
    state.messages=[...active,...delivered];
  }

  function enqueue(payload){
    const messageId=clean(payload?.messageId||payload?.evidenceId);
    if(!messageId)return {ok:false,error:'messageId required'};
    if(containsRawVoice(payload))return {ok:false,error:'raw voice payload forbidden'};
    const existing=state.messages.find(x=>x.messageId===messageId);
    if(existing)return {ok:true,created:false,row:copy(existing)};
    const row={messageId,state:'PENDING',attempts:0,payload:copy(payload),lastError:null,createdAt:Date.now(),updatedAt:Date.now()};
    state.messages.push(row);prune();
    const saved=write(state);
    if(!saved.ok)return saved;
    return {ok:true,created:true,row:copy(row)};
  }

  async function deliver(messageId,handler){
    const row=state.messages.find(x=>x.messageId===clean(messageId));
    if(!row)return {ok:false,error:'unknown outbox message'};
    if(row.state==='DELIVERED')return {ok:true,delivered:false,row:copy(row)};
    row.state='DELIVERING';row.attempts++;row.updatedAt=Date.now();write(state);
    try{
      const result=await handler(copy(row.payload));
      row.state='DELIVERED';row.result=copy(result);row.lastError=null;row.updatedAt=Date.now();prune();
      const saved=write(state);if(!saved.ok)return saved;
      return {ok:true,delivered:true,row:copy(row)};
    }catch(error){
      row.state='FAILED_RETRYABLE';row.lastError=String(error?.message||error);row.updatedAt=Date.now();
      const saved=write(state);
      return {ok:false,delivered:false,infrastructureFailure:true,error:row.lastError,row:copy(row),storageOk:saved.ok};
    }
  }

  function pending(){
    return state.messages.filter(x=>['PENDING','FAILED_RETRYABLE'].includes(x.state)).map(copy);
  }
  function exportState(){return copy(state)}
  function clearDelivered(){state.messages=state.messages.filter(x=>x.state!=='DELIVERED');return write(state)}
  function reload(){state=read();write(state);return exportState()}

  return Object.freeze({schema:'RUSSIAN_ENGINE_BROWSER_OUTBOX_V1',storageKey:key,enqueue,deliver,pending,exportState,clearDelivered,reload});
}
