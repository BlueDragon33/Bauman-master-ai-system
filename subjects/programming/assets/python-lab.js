(() => {
  'use strict';
  const api=window.SUBJECT_ADAPTER.pythonRuntime;
  const el=id=>document.getElementById(id);
  let epoch=0,result;
  const messages={idle:'Sẵn sàng. Mỗi lần chạy bắt đầu từ workspace mới.',running:'Đang chạy trong workspace riêng…',
    completed:'Hoàn tất thực hành; chưa phải evidence chính thức.',runtime_error:'Mã gặp lỗi. Xem evidence bên dưới.',
    timeout:'Đã dừng vì giới hạn thời gian.',memory_limit:'Đã dừng vì giới hạn bộ nhớ.',output_limit:'Output vượt giới hạn và đã bị cắt.',
    cancelled:'Đã hủy; provider đang dọn workspace.',provider_unavailable:'Không thể thực thi: provider cục bộ chưa sẵn sàng hoặc bạn đang offline.',
    busy:'Provider đang chạy hoặc dọn một yêu cầu khác. Hãy thử lại sau.',invalid_request:'Mã hoặc file đầu vào không hợp lệ.',
    invalid_result:'Kết quả không đúng contract; không được dùng làm evidence.',cleanup_failed:'Provider chưa dọn được workspace; dừng chạy và kiểm tra dịch vụ.'};
  function status(value) {el('pythonStatus').dataset.status=value;el('pythonStatus').textContent=messages[value] || messages.invalid_result;}
  function controls(running){el('pythonRun').disabled=running;el('pythonCancel').disabled=!running;}
  function reset(value='idle'){epoch++;api.invalidate();result=null;controls(false);status(value);for(const id of ['pythonOutput','pythonException','pythonIdentity','pythonTests','pythonAdvice'])el(id).textContent='';}
  for(const id of ['pythonCode','pythonMode','pythonFiles','pythonStdin'])el(id).addEventListener('input',()=>reset());
  el('pythonCancel').addEventListener('click',()=>reset('cancelled'));
  el('pythonRestart').addEventListener('click',()=>reset());
  el('pythonRun').addEventListener('click',async()=>{
    reset();const own=epoch;controls(true);status('running');
    try {
      const mode=el('pythonMode').value,code=el('pythonCode').value;
      const nextResult=await api.run({mode,taskId:mode==='test'?'sum-integers':'practice',
        ...(mode==='notebook'?{cells:code.split(/^# %%\s*$/m)}:{code}),
        files:JSON.parse(el('pythonFiles').value),stdin:el('pythonStdin').value});
      if(own!==epoch || nextResult.status==='stale_result')return;
      result=nextResult;
      status(result.status);
      el('pythonOutput').textContent=(result.stdout || '') + (result.stderr || '') + (result.truncated?'\n[Output đã cắt]':'');
      el('pythonException').textContent=result.exception?JSON.stringify(result.exception,null,2):result.trace?.length?JSON.stringify(result.trace,null,2):'';
      el('pythonIdentity').textContent=result.runtime?`CPython ${result.runtime.python} · ${result.runtime.environment} · ${result.durationMs} ms · cleanup: ${result.cleanup}`:'';
      el('pythonTests').textContent=result.tests?`${result.tests.passed} passed · ${result.tests.failed} failed · public practice only`:'';
    } catch {status('invalid_request');}
    finally {if(own===epoch)controls(false);}
  });
  el('pythonHint').addEventListener('click',()=>{const hint=api.advice(result);el('pythonAdvice').textContent=`Gợi ý cục bộ (không phải mô hình AI): ${hint.message}`;});
  el('pythonDownload').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([el('pythonCode').value],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='practice.py';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
