'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_speaking_coach_v1';
  const ACTIVE_KEY='ru_speaking_coach_active_v1';
  const SCHEMA='RUSSIAN_SPEAKING_COACH_V2';
  const LEGACY_SCHEMA='RUSSIAN_SPEAKING_COACH_V1';
  const STRESS_LEXICON=Object.freeze({
    'здравствуйте':'здра́вствуйте','здравствуй':'здра́вствуй','привет':'приве́т','доброе':'до́брое','утро':'у́тро','добрый':'до́брый','вечер':'ве́чер','свидания':'свида́ния','пока':'пока́','спасибо':'спаси́бо','большое':'большо́е','помощь':'по́мощь','пожалуйста':'пожа́луйста','извините':'извини́те','простите':'прости́те','ничего':'ничего́','страшного':'стра́шного',
    'зовут':'зову́т','меня':'меня́','очень':'о́чень','приятно':'прия́тно','новый':'но́вый','студент':'студе́нт','впервые':'впервы́е','москве':'москве́','приехал':'прие́хал','вчера':'вчера́','нравится':'нра́вится','город':'го́род','плохо':'пло́хо','знаю':'зна́ю','дорогу':'доро́гу','тогда':'тогда́','могу':'могу́','помочь':'помо́чь',
    'хочу':'хочу́','познакомиться':'познако́миться','немного':'немно́го','говорю':'говорю́','по-русски':'по-ру́сски','откуда':'отку́да','повторите':'повтори́те','медленнее':'ме́дленнее','приехали':'прие́хали','вьетнама':'вьетна́ма','учиться':'учи́ться','магистратуре':'магистрату́ре','отлично':'отли́чно','тоже':'то́же','учусь':'учу́сь','университете':'университе́те','можно':'мо́жно','записать':'записа́ть','номер':'но́мер','телефона':'телефо́на','конечно':'коне́чно','давайте':'дава́йте','обменяемся':'обменя́емся','контактами':'конта́ктами',
    'это':'э́то','почему':'почему́','какой':'како́й','какая':'кака́я','какие':'каки́е','сколько':'ско́лько','стоит':'сто́ит','рублей':'рубле́й','понимаю':'понима́ю','понял':'по́нял','поняла':'поняла́','скажите':'скажи́те','говорите':'говори́те','медленно':'ме́дленно','быстрее':'быстре́е','русски':'ру́сски','русскому':'ру́сскому','русский':'ру́сский',
    'университет':'университе́т','общежитие':'общежи́тие','комната':'ко́мната','этаж':'эта́ж','паспорт':'па́спорт','виза':'ви́за','документы':'докуме́нты','регистрация':'регистра́ция','метро':'метро́','автобус':'авто́бус','такси':'такси́','остановка':'остано́вка','улица':'у́лица','магазин':'магази́н','цена':'цена́','деньги':'де́ньги','кофе':'ко́фе','столовая':'столо́вая','аптека':'апте́ка','болит':'боли́т','температура':'температу́ра',
    'телефон':'телефо́н','интернет':'интерне́т','почта':'по́чта','сообщение':'сообще́ние','компьютер':'компью́тер','данные':'да́нные','программа':'програ́мма','алгоритм':'алгори́тм','лаборатория':'лаборато́рия','проект':'прое́кт','работа':'рабо́та','исследование':'иссле́дование','магистратура':'магистрату́ра','преподаватель':'преподава́тель','лекция':'ле́кция','семинар':'семина́р','задание':'зада́ние','домашнее':'дома́шнее','сегодня':'сего́дня','завтра':'за́втра','сейчас':'сейча́с','хорошо':'хорошо́','правильно':'пра́вильно','неправильно':'непра́вильно'
  });
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,lines:{},updatedAt:null});
  function read(){const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,schema:SCHEMA,lines:x&&typeof x.lines==='object'?x.lines:{}};}
  let state=read();
  let renderQueued=false;
  let notice='';
  let lastContextKey='';
  function write(){state.schema=SCHEMA;state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian speaking coach save failed',e)};scheduleRender();}
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  function context(){
    const core=readCore();
    return {
      active:core.view==='learning'&&core.learnTab==='practice',
      lessonId:clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.()),
      dialogueId:clean(core.practiceDialogueId),
      lineIndex:Math.max(0,Number(core.practiceLineIndex)||0)
    };
  }
  function keyOf(c=context()){return c.lessonId&&c.dialogueId?`${c.lessonId}:${c.dialogueId}:${c.lineIndex}`:'';}
  function speechResultKey(c=context()){return c.dialogueId?`${c.dialogueId}__${c.lineIndex}`:'';}
  function routeOf(c=context()){return {view:'learning',learnTab:'practice',lessonId:c.lessonId,practiceDialogueId:c.dialogueId,practiceLineIndex:c.lineIndex};}
  function lineState(c=context()){
    const key=keyOf(c);if(!key)return null;
    const old=state.lines[key]||{};
    state.lines[key]={...old,key,lessonId:c.lessonId,dialogueId:c.dialogueId,lineIndex:c.lineIndex,listens:Number(old.listens||0),slowListens:Number(old.slowListens||0),shadowAttempts:Number(old.shadowAttempts||0),memoryAttempts:Number(old.memoryAttempts||0),freeAttempts:Number(old.freeAttempts||0),roleplays:Number(old.roleplays||0),selfOk:Number(old.selfOk||0),pronunciationFlags:Number(old.pronunciationFlags||0),stressFlags:Number(old.stressFlags||0),asrAttempts:Number(old.asrAttempts||0),abandoned:Number(old.abandoned||0),lastAt:old.lastAt||null,lastMode:old.lastMode||''};
    return state.lines[key];
  }
  function setNotice(v){notice=clean(v);scheduleRender();}
  function activeSession(){return parse(sessionStorage.getItem(ACTIVE_KEY),null);}
  function setActive(mode,c=context()){
    if(!keyOf(c))return;
    sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({key:keyOf(c),mode,startedAt:now(),attempted:false,route:routeOf(c)}));
  }
  function markSessionAttempt(){const s=activeSession();if(!s)return;sessionStorage.setItem(ACTIVE_KEY,JSON.stringify({...s,attempted:true,lastAttemptAt:now()}));}
  function clearSession(){sessionStorage.removeItem(ACTIVE_KEY);}
  function bump(field,extra={}){
    const c=context(), row=lineState(c);if(!row)return;
    row[field]=Number(row[field]||0)+1;row.lastAt=now();Object.assign(row,extra);write();
    const old=window.RussianLearningFlow?.get?.()?.lessons?.[c.lessonId]?.steps?.speaking||{};
    window.RussianLearningFlow?.touch?.('speaking',{coachEvents:Number(old.coachEvents||0)+1,lastCoachAt:row.lastAt},c.lessonId);
  }
  function clickCore(action){const el=document.querySelector(`[data-act="${action}"]`);if(!el){setNotice('Điều khiển luyện nói của câu hiện tại chưa sẵn sàng.');return false;}el.click();return true;}
  function startListening(slow=false){setActive(slow?'listen_slow':'listen',context());if(clickCore(slow?'speak-line-slow':'speak-line'))setNotice(slow?'Đang nghe chậm. Tập bắt nhịp, trọng âm và cụm âm.':'Đang nghe mẫu ở tốc độ thường. Chưa cần nói ngay.');}
  function startShadow(){setActive('shadow',context());if(clickCore('speak-line-slow')||clickCore('speak-line'))setNotice('Shadowing đã bắt đầu: nghe xong hãy dùng nút ghi/nói của câu hiện tại và nhại sát nhịp mẫu.');}
  function startMemory(){setActive('memory',context());document.getElementById('view')?.classList.add('ru-speaking-memory-mode');setNotice('Chế độ nói không nhìn đang bật. Nói bằng nút ghi/nói hiện có; bấm “Hiện câu mẫu” khi cần.');}
  function revealSource(){document.getElementById('view')?.classList.remove('ru-speaking-memory-mode');const s=activeSession();if(s?.mode==='memory')clearSession();setNotice('Đã hiện lại câu mẫu.');}
  function startRoleplay(){setActive('roleplay',context());if(clickCore('speak-dialogue'))setNotice('Đã mở lượt role-play của hội thoại hiện tại.');}
  function flagPronunciation(){
    const c=context(), key=keyOf(c);if(!key)return;
    bump('pronunciationFlags',{lastFlagAt:now(),lastMode:activeSession()?.mode||''});
    window.RussianLearningState?.addReview?.(`pron:${key}`,'pronunciation_error',routeOf(c),`Phát âm cần ôn · ${c.lessonId} · câu ${c.lineIndex+1}`);
    setNotice('Đã đưa đúng câu này vào Review Queue để luyện phát âm lại. Không thay đổi mastery.');
  }
  function flagStress(){
    const c=context(), key=keyOf(c);if(!key)return;
    bump('stressFlags',{lastStressFlagAt:now(),lastMode:activeSession()?.mode||''});
    window.RussianLearningState?.addReview?.(`stress:${key}`,'stress_error',routeOf(c),`Trọng âm cần ôn · ${c.lessonId} · câu ${c.lineIndex+1}`);
    setNotice('Đã đánh dấu riêng lỗi trọng âm. ASR không được dùng để tự quyết định lỗi này.');
  }
  function clearPronunciationReview(){
    const c=context(), key=keyOf(c);if(!key)return;
    window.RussianLearningState?.removeReview?.(`pron:${key}`);
    window.RussianLearningState?.removeReview?.(`stress:${key}`);
    window.RussianLearningState?.removeReview?.(`speak-abandoned:${key}`);
  }
  function confirmRepaired(){
    if(clickCore('mark-line-ok'))setNotice('Đã ghi nhận xác nhận của bạn và gỡ các mục phát âm/trọng âm của câu này khỏi Review Queue.');
  }
  function abandonIfNeeded(nextKey=''){
    const s=activeSession();if(!s||s.attempted||!['shadow','memory','roleplay'].includes(s.mode))return;
    if(nextKey&&s.key===nextKey)return;
    const parts=String(s.key).split(':');const lineIndex=Number(parts.pop()||0), dialogueId=parts.pop()||'', lessonId=parts.join(':');
    const key=s.key, old=state.lines[key]||{key,lessonId,dialogueId,lineIndex};
    state.lines[key]={...old,abandoned:Number(old.abandoned||0)+1,lastAbandonedAt:now(),lastMode:s.mode};write();
    window.RussianLearningState?.addReview?.(`speak-abandoned:${key}`,'abandoned',{view:'learning',learnTab:'practice',lessonId,practiceDialogueId:dialogueId,practiceLineIndex:lineIndex},`Lượt luyện nói bỏ dở · ${lessonId} · câu ${lineIndex+1}`);
    clearSession();
  }
  function normalizeWords(v){return clean(v).toLowerCase().replace(/ё/g,'е').match(/[а-я-]+/gi)||[];}
  function missingRecognizedWords(target,transcript){
    const heard=new Set(normalizeWords(transcript));
    return [...new Set(normalizeWords(target).filter(word=>!heard.has(word)))].slice(0,8);
  }
  function currentSpeechResult(c=context()){
    const core=readCore(), key=speechResultKey(c);if(!key)return null;
    return core.practiceSpeechResults?.[key]||null;
  }
  function syncSpeechEvidence(c=context()){
    const result=currentSpeechResult(c), row=lineState(c);if(!result||!row)return row;
    const resultAt=Number(result.at||0), seenAt=Number(row.lastAsrSourceAt||0);
    if(!resultAt||resultAt===seenAt)return row;
    row.asrAttempts=Number(row.asrAttempts||0)+1;
    row.lastAsrSourceAt=resultAt;
    row.lastAsrAt=now();
    row.lastAsrScore=Number.isFinite(Number(result.score))?Number(result.score):null;
    row.lastTranscript=clean(result.transcript);
    row.lastTarget=clean(result.target);
    row.lastMissingWords=missingRecognizedWords(result.target,result.transcript);
    row.lastAt=row.lastAsrAt;
    state.updatedAt=row.lastAsrAt;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian speaking coach ASR sync failed',e)}
    const old=window.RussianLearningFlow?.get?.()?.lessons?.[c.lessonId]?.steps?.speaking||{};
    window.RussianLearningFlow?.touch?.('speaking',{asrAttempts:Number(old.asrAttempts||0)+1,lastAsrAt:row.lastAsrAt},c.lessonId);
    notice='Đã nhận transcript thật từ SpeechRecognition. Hãy dùng nó để tự sửa câu; ASR không phải điểm phát âm.';
    return row;
  }
  function vowelCount(word){return (clean(word).match(/[аеёиоуыэюя]/gi)||[]).length;}
  function applyInitialCase(source,stressed){return /^[А-ЯЁ]/.test(source)?stressed.charAt(0).toUpperCase()+stressed.slice(1):stressed;}
  function stressTokenHtml(token){
    const key=token.toLowerCase(), known=STRESS_LEXICON[key];
    if(known)return `<span class="ru-stress-known">${esc(applyInitialCase(token,known))}</span>`;
    if(vowelCount(token)<=1||/[ёЁ]/.test(token))return `<span class="ru-stress-natural">${esc(token)}</span>`;
    return `<span class="ru-stress-unknown" title="Chưa có dữ liệu trọng âm đã xác minh cho dạng từ này">${esc(token)}<sup>?</sup></span>`;
  }
  function stressMarkup(text){
    const input=clean(text);if(!input)return '<span class="ru-stress-empty">Chưa có câu mẫu.</span>';
    const parts=input.split(/([А-Яа-яЁё-]+)/g);
    return parts.map(part=>/^[А-Яа-яЁё-]+$/.test(part)?stressTokenHtml(part):esc(part)).join('');
  }
  function stressCoverage(text){
    const words=clean(text).match(/[А-Яа-яЁё-]+/g)||[];
    const multi=words.filter(w=>vowelCount(w)>1&&!/[ёЁ]/.test(w));
    const covered=multi.filter(w=>!!STRESS_LEXICON[w.toLowerCase()]).length;
    return {covered,total:multi.length};
  }
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function stepCard(n,title,detail,actions){return `<article class="ru-speaking-step"><span>${n}</span><div><b>${esc(title)}</b><p>${esc(detail)}</p><div class="ru-speaking-actions">${actions}</div></div></article>`;}
  function stats(row){return `<div class="ru-speaking-stats"><span><b>${row.listens+row.slowListens}</b><small>lượt nghe</small></span><span><b>${row.shadowAttempts}</b><small>shadow</small></span><span><b>${row.memoryAttempts+row.freeAttempts}</b><small>lượt nói</small></span><span><b>${row.asrAttempts}</b><small>ASR thật</small></span></div>`;}
  function diagnosticHtml(row){
    const target=clean(row.lastTarget)||clean(currentSpeechResult()?.target), transcript=clean(row.lastTranscript);
    const coverage=stressCoverage(target);
    const score=row.lastAsrScore;
    const scoreText=score===null||score===undefined?'Chưa có lượt nhận diện':`${Math.round(Number(score)||0)}% độ khớp transcript`;
    const missing=Array.isArray(row.lastMissingWords)?row.lastMissingWords:[];
    return `<section class="ru-pronunciation-evidence">
      <header><div><span>PHÁT ÂM · TRỌNG ÂM · BẰNG CHỨNG</span><b>ASR không phải điểm phát âm</b></div><small>${esc(scoreText)}</small></header>
      <div class="ru-stress-line"><label>Câu mẫu có trọng âm đã biết</label><p lang="ru">${stressMarkup(target)}</p><small>Lexicon hiện phủ ${coverage.covered}/${coverage.total} từ nhiều âm tiết trong câu. Dấu <b>?</b> nghĩa là chưa có dữ liệu; hệ thống không đoán.</small></div>
      <div class="ru-asr-grid">
        <article><label>Máy nghe bạn nói</label><p lang="ru">${transcript?esc(transcript):'Chưa có transcript. Hãy dùng nút ghi/nói của câu.'}</p></article>
        <article><label>Từ máy chưa bắt được</label><p>${missing.length?missing.map(esc).join(' · '):(transcript?'Không phát hiện từ bị thiếu theo transcript. Điều này không chứng minh phát âm/trọng âm đã đúng.':'—')}</p></article>
      </div>
      <div class="ru-pronunciation-actions"><button type="button" data-ru-speaking="flag">Âm chưa rõ · cần ôn</button><button type="button" data-ru-speaking="flag-stress">Trọng âm chưa ổn</button><button type="button" class="ok" data-ru-speaking="resolved">Tôi đã sửa ổn</button></div>
    </section>`;
  }
  function render(){
    const c=context(), view=document.getElementById('view');if(!view)return;
    if(!c.active||!c.lessonId||!c.dialogueId){document.getElementById('ruSpeakingCoach')?.remove();view.classList.remove('ru-speaking-memory-mode');lastContextKey='';return;}
    const currentKey=keyOf(c);if(lastContextKey&&lastContextKey!==currentKey){abandonIfNeeded(currentKey);view.classList.remove('ru-speaking-memory-mode');}
    lastContextKey=currentKey;
    const row=syncSpeechEvidence(c)||lineState(c), active=activeSession(), memory=active?.key===currentKey&&active.mode==='memory';
    let panel=document.getElementById('ruSpeakingCoach');if(!panel){panel=document.createElement('section');panel.id='ruSpeakingCoach';panel.className='ru-speaking-coach';const flow=document.getElementById('ruLessonFlow');if(flow)flow.after(panel);else view.prepend(panel);}
    const listening=stepCard('01','Listening ladder','Nghe tốc độ thường trước, sau đó nghe chậm khi cần bắt âm và nhịp.',`<button type="button" data-ru-speaking="listen">Nghe thường</button><button type="button" data-ru-speaking="listen-slow">Nghe chậm</button>`);
    const shadow=stepCard('02','Shadowing','Nghe rồi nhại sát câu mẫu. Lượt shadow chỉ được ghi khi bạn thực sự dùng nút ghi/nói của runtime.',`<button type="button" data-ru-speaking="shadow">Bắt đầu shadowing</button>`);
    const memoryStep=stepCard('03','Nói không nhìn','Ẩn chữ Nga trong vùng luyện tập, sau đó nói lại bằng trí nhớ. Không dùng độ khớp transcript để tự xác nhận đúng.',`<button type="button" data-ru-speaking="memory">${memory?'Đang ẩn câu mẫu':'Nói không nhìn'}</button>${memory?'<button type="button" data-ru-speaking="reveal">Hiện câu mẫu</button>':''}`);
    const role=stepCard('04','Role-play','Chuyển từ câu đơn sang hội thoại. Runtime chỉ ghi nhận việc đã luyện, không tự nâng mastery.',`<button type="button" data-ru-speaking="roleplay">Luyện cả hội thoại</button>`);
    panel.innerHTML=`<header><div><span>NGHE · NHẠI · NÓI · HỘI THOẠI</span><h3>${esc(c.lessonId)} · ${esc(c.dialogueId)} · câu ${c.lineIndex+1}</h3><p>Coach dùng đúng câu runtime đang mở. SpeechRecognition chỉ cho biết máy nhận ra gì; đánh giá trọng âm/phát âm vẫn cần dữ liệu lexicon và xác nhận của bạn.</p></div>${stats(row)}</header>${diagnosticHtml(row)}<div class="ru-speaking-grid">${listening}${shadow}${memoryStep}${role}</div>${notice?`<div class="ru-speaking-notice">${esc(notice)}</div>`:''}`;
  }
  document.addEventListener('click',event=>{
    const coach=event.target.closest?.('[data-ru-speaking]');
    if(coach){event.preventDefault();event.stopPropagation();const a=coach.dataset.ruSpeaking;if(a==='listen')startListening(false);else if(a==='listen-slow')startListening(true);else if(a==='shadow')startShadow();else if(a==='memory')startMemory();else if(a==='reveal')revealSource();else if(a==='roleplay')startRoleplay();else if(a==='flag')flagPronunciation();else if(a==='flag-stress')flagStress();else if(a==='resolved')confirmRepaired();return;}
    const act=event.target.closest?.('[data-act]')?.dataset.act||'';const c=context();if(!c.active)return;
    if(act==='speak-line'){bump('listens',{lastListenAt:now()});}
    else if(act==='speak-line-slow'){bump('slowListens',{lastListenAt:now()});}
    else if(act==='record-line'){
      const mode=activeSession()?.mode||'free';markSessionAttempt();
      if(mode==='shadow')bump('shadowAttempts',{lastMode:mode,lastAttemptAt:now()});
      else if(mode==='memory')bump('memoryAttempts',{lastMode:mode,lastAttemptAt:now()});
      else bump('freeAttempts',{lastMode:mode,lastAttemptAt:now()});
      setNotice('Đang chờ SpeechRecognition trả transcript thật. Kết quả sẽ xuất hiện ở bảng bằng chứng.');
    }
    else if(act==='mark-line-ok'){bump('selfOk',{lastSelfOkAt:now()});clearPronunciationReview();markSessionAttempt();}
    else if(act==='speak-dialogue'){bump('roleplays',{lastRoleplayAt:now()});markSessionAttempt();}
    scheduleRender();
  },true);
  window.addEventListener('beforeunload',()=>abandonIfNeeded(''));
  document.addEventListener('DOMContentLoaded',()=>{scheduleRender();const view=document.getElementById('view');if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});});
  window.addEventListener('russian:learning-state',scheduleRender);
  window.RussianSpeakingCoach={schema:SCHEMA,legacySchema:LEGACY_SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),context,flagPronunciation,flagStress,startListening,startShadow,startMemory,startRoleplay,syncSpeechEvidence,stressMarkup};
})();
