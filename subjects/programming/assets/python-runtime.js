(() => {
  'use strict';
  const adapter=window.SUBJECT_ADAPTER;
  if(!adapter||adapter.id!=='programming')return;
  let generation=0,current,identity=null;
  const tabId='tab-'+crypto.randomUUID();
  const failure=status=>({status,officialEvidence:false});
  const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value);
  async function post(operation,body,options={}) {
    const response=await fetch('/api/python/'+operation,{method:'POST',credentials:'same-origin',
      headers:{'content-type':'application/json'},body:JSON.stringify(body),...options});
    const result=await response.json();
    return {ok:response.ok,result};
  }
  function cancelReservation(runId) {
    // Cancellation is separate from the aborted run transport. The provider's
    // persisted recovery alarms remain authoritative if this request is lost.
    if(runId)void post('cancel',{runId},{keepalive:true}).catch(()=>{});
  }
  function invalidate() {
    generation++;
    if(current){current.controller.abort();cancelReservation(current.runId);current=null;}
  }
  async function run(input) {
    invalidate();
    const own=generation,active={controller:new AbortController(),runId:null};
    current=active;
    const timer=setTimeout(()=>active.controller.abort(),40000);
    try {
      const reserved=await post('reserve',{}, {signal:active.controller.signal});
      if(own!==generation){cancelReservation(reserved.result.runId);return failure('stale_result');}
      if(!reserved.ok)return failure(reserved.result.status||'provider_unavailable');
      if(reserved.result.status!=='reserved'||!uuid(reserved.result.runId))return failure('invalid_result');
      active.runId=reserved.result.runId;
      const request={...input,taskId:input.taskId||'practice',runId:active.runId,sessionId:tabId+'.'+own};
      const response=await post('run',request,{signal:active.controller.signal});
      if(own!==generation)return failure('stale_result');
      if(!response.ok)return failure(response.result.status||'provider_unavailable');
      const result=response.result;
      if(result.runId!==request.runId||result.taskId!==request.taskId||result.sessionId!==request.sessionId||result.officialEvidence!==false)return failure('invalid_result');
      identity=result.runtime||null;
      return result;
    } catch {
      return failure(own!==generation?'stale_result':active.controller.signal.aborted?'cancelled':'provider_unavailable');
    } finally {
      clearTimeout(timer);
      cancelReservation(active.runId);
      if(own===generation)current=null;
    }
  }
  function advice(result,policy='hint_only') {
    if(policy==='ai_prohibited')return {status:'disabled',mode:'local_hint',masteryAuthority:false};
    const type=result?.exception?.type;
    const hints={SyntaxError:'Kiểm tra cú pháp tại dòng báo lỗi.',NameError:'Kiểm tra tên biến và thứ tự khởi tạo.',TypeError:'Kiểm tra kiểu dữ liệu của các toán hạng.',FileNotFoundError:'Kiểm tra file đầu vào đã được khai báo cho lần chạy.'};
    return {status:'advisory',mode:'local_hint',masteryAuthority:false,
      message:hints[type]||(result?.tests?.failed?'Đối chiếu giá trị trả về với các ví dụ công khai; stdout không quyết định kết quả kiểm thử.':'Đối chiếu kết quả với yêu cầu bài; một lần chạy không chứng minh mastery.'),
      evidence:type||result?.status||'no_runtime_evidence'};
  }
  adapter.pythonRuntime=Object.freeze({run,runCode:run,runTests:input=>run({...input,mode:'test'}),
    invalidate,cancel:invalidate,cancelRun:invalidate,getRuntimeIdentity:()=>identity,advice,
    provider:'cloudflare-container-durable-object-v1',offlineExecution:false,officialAssessment:false});
})();
