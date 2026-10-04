(() => {
  'use strict';
  const adapter = window.SUBJECT_ADAPTER;
  if (!adapter || adapter.id !== 'programming') return;
  let generation = 0, current;
  const local = () => ['127.0.0.1','localhost'].includes(location.hostname);
  function invalidate() { generation++; current?.abort(); }
  async function run(input) {
    invalidate();
    const own = generation;
    if (!local()) return {status:'provider_unavailable',officialEvidence:false};
    const request = {...input,runId:crypto.randomUUID(),sessionId:'tab-' + own};
    const controller = new AbortController();
    current = controller;
    const timer = setTimeout(()=>controller.abort(),12000);
    try {
      const response = await fetch('http://127.0.0.1:4414/api/python/run', {
        method:'POST',headers:{'content-type':'application/json'},credentials:'omit',
        body:JSON.stringify(request),signal:controller.signal});
      if (!response.ok) throw new Error('provider_error');
      const result = await response.json();
      if (own !== generation) return {status:'stale_result',officialEvidence:false};
      if (result.runId !== request.runId || result.taskId !== (request.taskId || 'practice') || result.sessionId !== request.sessionId || result.officialEvidence !== false) return {status:'invalid_result',officialEvidence:false};
      return result;
    } catch {
      return {status:own !== generation?'stale_result':controller.signal.aborted?'cancelled':'provider_unavailable',officialEvidence:false};
    } finally { clearTimeout(timer); if (own === generation) current=null; }
  }
  function advice(result, policy='hint_only') {
    if (policy === 'ai_prohibited') return {status:'disabled',mode:'local_hint',masteryAuthority:false};
    const type = result?.exception?.type;
    const hints = {SyntaxError:'Kiểm tra cú pháp tại dòng báo lỗi.',NameError:'Kiểm tra tên biến và thứ tự khởi tạo.',TypeError:'Kiểm tra kiểu dữ liệu của các toán hạng.',FileNotFoundError:'Kiểm tra file đầu vào đã được khai báo cho lần chạy.'};
    return {status:'advisory',mode:'local_hint',masteryAuthority:false,
      message:hints[type] || (result?.tests?.failed?'Đối chiếu giá trị trả về với các ví dụ công khai; stdout không quyết định kết quả kiểm thử.':'Đối chiếu kết quả với yêu cầu bài; một lần chạy không chứng minh mastery.'),
      evidence:type || result?.status || 'no_runtime_evidence'};
  }
  adapter.pythonRuntime = Object.freeze({run,invalidate,cancel:invalidate,advice,
    provider:'local-docker-chroot-seccomp',offlineExecution:false,officialAssessment:false});
})();
