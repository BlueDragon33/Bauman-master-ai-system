const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function createMemoryOutbox(){
  const rows=new Map();
  function enqueue(message){
    const id=clean(message?.messageId||message?.evidenceId);
    if(!id)throw new Error('messageId or evidenceId required');
    if(rows.has(id))return {created:false,row:copy(rows.get(id))};
    const row={messageId:id,state:'PENDING',attempts:0,payload:copy(message),lastError:null};
    rows.set(id,row);return {created:true,row:copy(row)};
  }
  function deliver(messageId,handler){
    const id=clean(messageId),row=rows.get(id);
    if(!row)throw new Error('unknown outbox message '+id);
    if(row.state==='DELIVERED')return {delivered:false,row:copy(row)};
    row.state='DELIVERING';row.attempts++;
    try{
      const result=handler(copy(row.payload));
      row.state='DELIVERED';row.lastError=null;row.result=copy(result);
      return {delivered:true,row:copy(row)};
    }catch(error){
      row.state='FAILED_RETRYABLE';row.lastError=String(error?.message||error);
      return {delivered:false,row:copy(row)};
    }
  }
  function recover(){
    for(const row of rows.values())if(row.state==='DELIVERING')row.state='FAILED_RETRYABLE';
    return [...rows.values()].map(copy);
  }
  return Object.freeze({schema:'RUSSIAN_ENGINE_OUTBOX_V1',enqueue,deliver,recover,get:id=>copy(rows.get(clean(id))||null),list:()=>[...rows.values()].map(copy)});
}
