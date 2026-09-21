/* Bauman Deep Study Journal v1
   Learner reflection only. Never writes Roadmap V2 mastery, diagnostic, prerequisite, priority or scheduler state. */
(()=>{
  'use strict';

  const RELEASE='DEEP_STUDY_JOURNAL_V1_2026_09';
  const BOUNDARY=Object.freeze({
    learnerReflectionOnly:true,
    authoritativeMasteryWrites:false,
    diagnosticWrites:false,
    prerequisiteWrites:false,
    priorityWrites:false,
    schedulerWrites:false,
    subjectProgressWrites:false
  });
  const LIMITS={feynman:200,errors:500,closedAi:100,oralDefense:200};
  const ERROR_TYPES=['concept','calculation','prerequisite','language','careless','programming','reasoning'];
  const DEFENSE_QUESTIONS=[
    'Почему вы выбрали этот метод?',
    'Какие исходные данные используются?',
    'Как вы проверили правильность результата?',
    'Какие ограничения есть у вашей модели?',
    'Почему не был выбран другой алгоритм?',
    'Какова практическая ценность этой системы?'
  ];
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const now=()=>new Date().toISOString();
  const id=prefix=>prefix+'-'+(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(16).slice(2));
  const hubState=()=>typeof state!=='undefined'&&state&&typeof state==='object'?state:null;
  const notify=message=>{try{if(typeof toast==='function')toast(message)}catch{}};
  const persist=()=>{try{if(typeof save==='function')save()}catch{}};

  function normalizeJournal(input){
    const source=input&&typeof input==='object'?input:{};
    return {
      version:1,
      feynman:Array.isArray(source.feynman)?source.feynman.slice(-LIMITS.feynman):[],
      errors:Array.isArray(source.errors)?source.errors.slice(-LIMITS.errors):[],
      closedAi:Array.isArray(source.closedAi)?source.closedAi.slice(-LIMITS.closedAi):[],
      oralDefense:Array.isArray(source.oralDefense)?source.oralDefense.slice(-LIMITS.oralDefense):[]
    };
  }

  function journal(){
    const s=hubState();
    if(!s)return normalizeJournal(null);
    const normalized=normalizeJournal(s.deepStudyJournal);
    if(!s.deepStudyJournal||s.deepStudyJournal.version!==1){
      s.deepStudyJournal=normalized;
      persist();
    }
    return s.deepStudyJournal;
  }

  function subjectOptions(selected){
    const subjects=Object.values(hubState()?.subjects||{});
    return subjects.map(item=>`<option value="${safe(item.id)}" ${item.id===selected?'selected':''}>${safe(item.name||item.id)}</option>`).join('');
  }

  function selectedSubject(){
    const s=hubState();
    return s?.subject||s?.lastStudy?.subjectId||Object.keys(s?.subjects||{})[0]||'russian';
  }

  function dateText(value){
    try{return new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}catch{return String(value||'')}
  }

  function latestErrors(data){
    const rows=[...data.errors].slice(-8).reverse();
    if(!rows.length)return '<div class="dsj-empty">Chưa có lỗi nào được ghi. Hãy ghi lỗi ngay khi phát hiện để lần ôn sau sửa đúng chỗ.</div>';
    return rows.map(item=>`<article class="dsj-log-row ${item.resolvedAt?'resolved':''}">
      <div><b>${safe(item.summary)}</b><small>${safe(item.subjectId)} · ${safe(item.type)} · ${safe(dateText(item.createdAt))}</small>${item.fix?'<p>'+safe(item.fix)+'</p>':''}</div>
      <button class="btn sm" data-dsj-resolve="${safe(item.id)}">${item.resolvedAt?'Mở lại':'Đã sửa'}</button>
    </article>`).join('');
  }

  function recentFeynman(data){
    const rows=[...data.feynman].slice(-4).reverse();
    if(!rows.length)return '<div class="dsj-empty">Chưa có Feynman checkpoint.</div>';
    return rows.map(item=>`<article class="dsj-note"><b>${safe(item.topic)}</b><small>${safe(item.subjectId)} · ${safe(dateText(item.createdAt))}</small><p>${safe(item.explanation)}</p></article>`).join('');
  }

  function recentDefense(data){
    const rows=[...data.oralDefense].slice(-4).reverse();
    if(!rows.length)return '<div class="dsj-empty">Chưa lưu câu trả lời oral defense.</div>';
    return rows.map(item=>`<article class="dsj-note"><b>${safe(item.question)}</b><small>${safe(item.subjectId)} · ${safe(dateText(item.createdAt))}</small><p>${safe(item.answer)}</p></article>`).join('');
  }

  function activeClosedAi(data){
    return [...data.closedAi].reverse().find(item=>item.status==='active')||null;
  }

  function stats(data){
    return {
      feynman:data.feynman.length,
      openErrors:data.errors.filter(item=>!item.resolvedAt).length,
      closedAi:data.closedAi.filter(item=>item.status==='completed').length,
      oralDefense:data.oralDefense.length
    };
  }

  function html(){
    const data=journal(),sub=selectedSubject(),summary=stats(data),session=activeClosedAi(data);
    return `<div class="dsj-shell" data-dsj-release="${RELEASE}">
      <section class="dsj-boundary">
        <div><span class="dsj-kicker">Learner reflection · local Hub state</span><h2>Deep Study Journal</h2><p>Ghi lại cách bạn hiểu, lỗi bạn mắc và phần bạn tự làm không dùng AI. Nhật ký này <b>không tự tăng mastery, prerequisite, progress hay thay đổi lịch học</b>.</p></div>
        <span class="dsj-boundary-pill">Non-authoritative</span>
      </section>

      <section class="dsj-stats">
        <span><b>${summary.feynman}</b><small>Feynman</small></span>
        <span><b>${summary.openErrors}</b><small>Lỗi đang mở</small></span>
        <span><b>${summary.closedAi}</b><small>Closed-AI hoàn tất</small></span>
        <span><b>${summary.oralDefense}</b><small>Oral defense</small></span>
      </section>

      <div class="dsj-grid">
        <section class="dsj-card">
          <div class="dsj-card-head"><div><span>01</span><h3>Feynman checkpoint</h3></div><small>Tự giải thích bằng lời của mình</small></div>
          <label>Môn<select class="field" id="dsjFeynmanSubject">${subjectOptions(sub)}</select></label>
          <label>Chủ đề<input class="field" id="dsjFeynmanTopic" maxlength="160" placeholder="Ví dụ: PCA, PID, SQL JOIN..."></label>
          <label>Giải thích không nhìn tài liệu<textarea class="field" id="dsjFeynmanText" rows="6" maxlength="4000" placeholder="Viết điều bạn thực sự hiểu, phần nào chưa giải thích được thì ghi rõ."></textarea></label>
          <button class="btn primary" data-dsj-action="save-feynman">Lưu checkpoint</button>
          <div class="dsj-history">${recentFeynman(data)}</div>
        </section>

        <section class="dsj-card">
          <div class="dsj-card-head"><div><span>02</span><h3>Error Notebook</h3></div><small>Sửa đúng lỗi, không chỉ làm lại bài</small></div>
          <div class="dsj-two">
            <label>Môn<select class="field" id="dsjErrorSubject">${subjectOptions(sub)}</select></label>
            <label>Loại lỗi<select class="field" id="dsjErrorType">${ERROR_TYPES.map(type=>'<option value="'+type+'">'+type+'</option>').join('')}</select></label>
          </div>
          <label>Lỗi / hiểu sai<input class="field" id="dsjErrorSummary" maxlength="240" placeholder="Mô tả ngắn lỗi vừa gặp"></label>
          <label>Cách sửa / quy tắc tránh lặp<textarea class="field" id="dsjErrorFix" rows="3" maxlength="1200" placeholder="Sau khi hiểu lại, ghi cách sửa hoặc dấu hiệu nhận biết."></textarea></label>
          <button class="btn primary" data-dsj-action="save-error">Ghi lỗi</button>
          <div class="dsj-history" id="dsjErrorHistory">${latestErrors(data)}</div>
        </section>

        <section class="dsj-card">
          <div class="dsj-card-head"><div><span>03</span><h3>Closed-AI checkpoint</h3></div><small>Phiên tự làm có ghi nhận thời gian</small></div>
          <p class="dsj-help">Đây là cam kết tự học, không phải cơ chế khóa kỹ thuật. Làm bài bằng trí nhớ/tài liệu được phép của bạn trước, sau đó mới dùng AI để phân tích.</p>
          <label>Môn<select class="field" id="dsjClosedSubject" ${session?'disabled':''}>${subjectOptions(session?.subjectId||sub)}</select></label>
          <div class="dsj-timer" id="dsjTimer" data-active="${session?'1':'0'}">00:00</div>
          <div class="dsj-actions">
            <button class="btn primary" data-dsj-action="start-closed" ${session?'disabled':''}>Bắt đầu 25 phút</button>
            <button class="btn" data-dsj-action="finish-closed" ${session?'':'disabled'}>Kết thúc & ghi nhận</button>
          </div>
          <label>Ghi chú sau phiên<textarea class="field" id="dsjClosedNote" rows="3" maxlength="1000" placeholder="Bạn làm được gì khi chưa dùng AI?"></textarea></label>
        </section>

        <section class="dsj-card">
          <div class="dsj-card-head"><div><span>04</span><h3>Oral defense</h3></div><small>Luyện giải thích và bảo vệ lựa chọn</small></div>
          <label>Môn<select class="field" id="dsjDefenseSubject">${subjectOptions(sub)}</select></label>
          <div class="dsj-question"><span>Вопрос</span><b id="dsjDefenseQuestion">${safe(DEFENSE_QUESTIONS[0])}</b></div>
          <button class="btn" data-dsj-action="next-defense">Câu hỏi khác</button>
          <label>Trả lời<textarea class="field" id="dsjDefenseAnswer" rows="5" maxlength="3000" placeholder="Ưu tiên trả lời bằng tiếng Nga khi đã đủ năng lực; giai đoạn đầu có thể dùng tiếng Việt để luyện logic."></textarea></label>
          <button class="btn primary" data-dsj-action="save-defense">Lưu câu trả lời</button>
          <div class="dsj-history">${recentDefense(data)}</div>
        </section>
      </div>
    </div>`;
  }

  function addFeynman(){
    const topic=q('#dsjFeynmanTopic')?.value.trim(),explanation=q('#dsjFeynmanText')?.value.trim();
    if(!topic||explanation?.length<20)return notify('Cần chủ đề và phần giải thích ít nhất 20 ký tự.');
    const data=journal();
    data.feynman.push({id:id('fy'),subjectId:q('#dsjFeynmanSubject')?.value||selectedSubject(),topic,explanation,createdAt:now()});
    data.feynman=data.feynman.slice(-LIMITS.feynman);persist();notify('Đã lưu Feynman checkpoint.');open();
  }

  function addError(){
    const summary=q('#dsjErrorSummary')?.value.trim();
    if(!summary)return notify('Cần mô tả lỗi.');
    const data=journal(),type=q('#dsjErrorType')?.value;
    data.errors.push({
      id:id('err'),
      subjectId:q('#dsjErrorSubject')?.value||selectedSubject(),
      type:ERROR_TYPES.includes(type)?type:'reasoning',
      summary,
      fix:q('#dsjErrorFix')?.value.trim()||'',
      createdAt:now(),
      resolvedAt:null
    });
    data.errors=data.errors.slice(-LIMITS.errors);persist();notify('Đã ghi Error Notebook.');open();
  }

  function toggleError(errorId){
    const item=journal().errors.find(entry=>entry.id===errorId);if(!item)return;
    item.resolvedAt=item.resolvedAt?null:now();persist();open();
  }

  function startClosed(){
    const data=journal();
    if(activeClosedAi(data))return notify('Đang có một phiên Closed-AI hoạt động.');
    const startedAt=Date.now();
    data.closedAi.push({
      id:id('closed'),
      subjectId:q('#dsjClosedSubject')?.value||selectedSubject(),
      plannedMinutes:25,
      startedAt:new Date(startedAt).toISOString(),
      targetEndAt:new Date(startedAt+25*60000).toISOString(),
      endedAt:null,
      status:'active',
      note:''
    });
    data.closedAi=data.closedAi.slice(-LIMITS.closedAi);persist();notify('Đã bắt đầu phiên Closed-AI 25 phút.');open();
  }

  function finishClosed(){
    const data=journal(),session=activeClosedAi(data);if(!session)return;
    session.endedAt=now();session.status='completed';session.note=q('#dsjClosedNote')?.value.trim()||'';
    const duration=Math.max(0,(new Date(session.endedAt)-new Date(session.startedAt))/60000);
    session.actualMinutes=Math.round(duration*10)/10;
    persist();notify('Đã ghi nhận phiên Closed-AI.');open();
  }

  function nextDefense(){
    const current=q('#dsjDefenseQuestion')?.textContent||'';
    const candidates=DEFENSE_QUESTIONS.filter(item=>item!==current);
    const next=candidates[Math.floor(Math.random()*candidates.length)]||DEFENSE_QUESTIONS[0];
    const node=q('#dsjDefenseQuestion');if(node)node.textContent=next;
  }

  function saveDefense(){
    const answer=q('#dsjDefenseAnswer')?.value.trim(),question=q('#dsjDefenseQuestion')?.textContent.trim();
    if(!answer||answer.length<10)return notify('Cần câu trả lời ít nhất 10 ký tự.');
    const data=journal();
    data.oralDefense.push({id:id('def'),subjectId:q('#dsjDefenseSubject')?.value||selectedSubject(),question,answer,createdAt:now()});
    data.oralDefense=data.oralDefense.slice(-LIMITS.oralDefense);persist();notify('Đã lưu oral defense.');open();
  }

  let timerHandle=0;
  function tick(){
    clearTimeout(timerHandle);
    const data=journal(),session=activeClosedAi(data),node=q('#dsjTimer');
    if(!node||!session)return;
    const left=Math.max(0,new Date(session.targetEndAt).getTime()-Date.now());
    const total=Math.ceil(left/1000),minutes=Math.floor(total/60),seconds=total%60;
    node.textContent=String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
    node.classList.toggle('expired',left<=0);
    if(left<=0)node.title='Đã đủ 25 phút; bạn có thể kết thúc và ghi nhận.';
    timerHandle=setTimeout(tick,1000);
  }

  function bind(){
    qa('[data-dsj-action]').forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.dsjAction;
      if(action==='save-feynman')addFeynman();
      else if(action==='save-error')addError();
      else if(action==='start-closed')startClosed();
      else if(action==='finish-closed')finishClosed();
      else if(action==='next-defense')nextDefense();
      else if(action==='save-defense')saveDefense();
    }));
    qa('[data-dsj-resolve]').forEach(button=>button.addEventListener('click',()=>toggleError(button.dataset.dsjResolve)));
    tick();
  }

  function open(){
    if(typeof openModal!=='function')return false;
    openModal('Nhật ký học sâu',html(),true);
    requestAnimationFrame(bind);
    return true;
  }

  function selfCheck(){
    const data=journal();
    return {
      release:RELEASE,
      boundary:BOUNDARY,
      stateReady:Boolean(hubState()?.deepStudyJournal),
      counts:stats(data),
      activeClosedAi:Boolean(activeClosedAi(data)),
      sidebarRouteAdded:false,
      authoritativeWrites:false
    };
  }

  document.documentElement.dataset.deepStudyJournal=RELEASE;
  window.BAUMAN_DEEP_STUDY_JOURNAL={release:RELEASE,boundary:BOUNDARY,open,selfCheck};
})();
