'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_vocab_srs_v1';
  const ACTIVE_DUE_KEY='ru_vocab_srs_active_due_v1';
  const SCHEMA='RUSSIAN_VOCAB_SRS_V1';
  const configured=Array.isArray(A.planningPolicy?.reviewGaps)?A.planningPolicy.reviewGaps:[];
  const GAPS=(configured.map(Number).filter(x=>Number.isFinite(x)&&x>0).length?configured:[1,3,7,14]).map(Number).filter(x=>x>0);
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const lower=v=>clean(v).toLocaleLowerCase('ru-RU');
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,cards:{},sentences:{},flowMode:'discover',drill:{},updatedAt:null});
  function read(){const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,cards:x&&typeof x.cards==='object'?x.cards:{},sentences:x&&typeof x.sentences==='object'?x.sentences:{}};}
  let state=read();
  let renderQueued=false;
  let notice='';
  let vocabPromise=null;
  let speakingPromise=null;
  function write(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian vocab SRS save failed',e)};window.dispatchEvent(new CustomEvent('russian:vocab-srs',{detail:{state}}));scheduleRender();}
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  const cardHost=()=>document.querySelector('.vocab-card-panel,.v1310-vocab-main');
  const filteredIndexNow=()=>Math.max(0,Number(readCore().vocabIndex)||0);
  const sourceIndexNow=()=>Math.max(0,Number(cardHost()?.dataset.vocabSourceIndex??filteredIndexNow())||0);
  const stageIndexNow=()=>Math.max(0,Number(cardHost()?.dataset.vocabStageIndex??filteredIndexNow())||0);
  const sourceIdNow=()=>clean(cardHost()?.dataset.vocabKey);
  const stageNow=()=>clean(readCore().stage)||'vn';
  const indexNow=stageIndexNow;
  const legacyKeyFor=index=>`vocab:${Math.max(0,Number(index)||0)}`;
  const keyFor=()=>sourceIdNow()?`vocab-id:${sourceIdNow()}`:`vocab-stage:${stageNow()}:${stageIndexNow()}`;
  function currentMeta(){return {key:keyFor(),sourceId:sourceIdNow(),sourceIndex:sourceIndexNow(),stageIndex:stageIndexNow(),stage:stageNow(),term:termNow()};}
  function termNow(){const host=cardHost();return clean(host?.dataset.vocabTerm)||clean(document.querySelector('.v1310-vocab-top h3,.vocab-card-panel .term')?.textContent)||`Thẻ ${stageIndexNow()+1}`;}
  const routeFor=(index,card={})=>({view:'vocab',vocabStage:clean(card.stage)||stageNow(),vocabKey:clean(card.sourceId)||'',vocabQuery:'',vocabIndex:clean(card.sourceId)?0:(Number(index)||0),vocabPage:clean(card.sourceId)?0:Math.floor((Number(index)||0)/20)});
  function plusDays(days){const d=new Date();d.setDate(d.getDate()+Number(days||0));return d.toISOString();}
  function dueCards(){const t=Date.now();return Object.values(state.cards).filter(x=>!x?.migratedTo&&x?.dueAt&&Date.parse(x.dueAt)<=t).sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt));}
  function scheduledCards(){const t=Date.now();return Object.values(state.cards).filter(x=>!x?.migratedTo&&x?.dueAt&&Date.parse(x.dueAt)>t).sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt));}
  function sourceKeyForItem(item,index=0){const id=clean(item?.id||item?.source_id);return id?`vocab-id:${id}`:`vocab-source:${Math.max(0,Number(index)||0)}`;}
  function statusForItem(item,index=0){
    const card=state.cards[sourceKeyForItem(item,index)]||null;
    if(!card?.exposedAt)return 'new';
    const due=card.dueAt&&Date.parse(card.dueAt)<=Date.now();
    const difficult=Number(card.lapses||0)>0||['forgot','unsure'].includes(card.lastRating);
    if(due)return 'due';
    if(difficult)return 'difficult';
    if(Number(card.reviewCount||0)>0&&card.lastRating==='recalled')return 'learned';
    return 'learning';
  }
  function filterItems(items,status='all'){
    const list=Array.isArray(items)?items:[];
    if(status==='all')return list;
    return list.filter((item,i)=>statusForItem(item,i)===status);
  }
  function stableCard(meta=currentMeta()){
    if(state.cards[meta.key])return state.cards[meta.key];
    const core=readCore(),legacyKey=legacyKeyFor(meta.stageIndex),legacy=state.cards[legacyKey];
    if(!core.vocabQuery&&!core.vocabFocusKey&&legacy&&!legacy.migratedTo&&clean(legacy.stage)===meta.stage){
      const migrated={...legacy,key:meta.key,index:meta.stageIndex,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,stage:meta.stage,migratedFrom:legacyKey};
      state.cards[meta.key]=migrated;
      state.cards[legacyKey]={...legacy,migratedTo:meta.key};
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,updatedAt:now()}))}catch(_){}
      return migrated;
    }
    return {};
  }
  function sentencesFor(key){return Object.values(state.sentences).filter(x=>x?.vocabKey===key).sort((a,b)=>Date.parse(b.savedAt||0)-Date.parse(a.savedAt||0));}
  function formatDue(iso){
    if(!iso)return 'Chưa lên lịch';
    const t=Date.parse(iso), diff=t-Date.now();
    if(diff<=0)return 'Đến hạn';
    const days=Math.ceil(diff/86400000);
    if(days===1)return 'Ngày mai';
    if(days<7)return `Sau ${days} ngày`;
    return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(t));
  }
  function setNotice(text){notice=clean(text);scheduleRender();}
  const FLOW=['discover','recognize','listen','speak','recall','write','review'];
  const FLOW_LABELS={discover:'Khám phá',recognize:'Nhận diện',listen:'Nghe',speak:'Nhắc lại',recall:'Nhớ lại',write:'Viết',review:'Ôn SRS'};
  const normalizeAnswer=v=>lower(v).normalize('NFD').replace(/\u0301/g,'').replace(/[.,!?;:«»"'()]/g,'').replace(/\s+/g,' ').trim();
  function flowMode(){return FLOW.includes(state.flowMode)?state.flowMode:'discover';}
  function setFlowMode(mode){
    if(!FLOW.includes(mode))return;
    state.flowMode=mode;state.drill={key:keyFor(),mode,answer:'',result:null};
    notice='';write();
  }
  function visibleCandidateTerms(){
    const current=termNow();
    const terms=Array.from(document.querySelectorAll('[data-vocab-term]')).map(x=>clean(x.dataset.vocabTerm)).filter(Boolean);
    const unique=Array.from(new Set([current,...terms])).filter(Boolean);
    if(unique.length<=1)return unique;
    const seed=indexNow()+1;
    const hash=v=>{let h=seed*131;for(const ch of v)h=(h*33+ch.codePointAt(0))>>>0;return h};
    const others=unique.filter(x=>normalizeAnswer(x)!==normalizeAnswer(current)).sort((a,b)=>hash(a)-hash(b)).slice(0,3);
    return [current,...others].sort((a,b)=>hash(a+'x')-hash(b+'x'));
  }
  function ensureExposure(key,index,term,meta=currentMeta()){
    const prev=stableCard(meta);
    if(prev.exposedAt)return prev;
    const next={...prev,key,index,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,stage:meta.stage,term,exposedAt:now(),exposure:'visual_audio_context'};
    state.cards[key]=next;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,updatedAt:now()}))}catch(_){}
    return next;
  }
  function drillResult(){
    const d=state.drill||{};
    if(d.key!==keyFor()||d.mode!==flowMode())return null;
    return d.result||null;
  }
  function setDrillResult(answer,ok){
    state.drill={key:keyFor(),mode:flowMode(),answer:clean(answer),result:ok?'correct':'wrong'};
    notice=ok?'Đúng. Chuyển sang bước kế tiếp khi bạn sẵn sàng.':'Chưa đúng. Nghe/nhìn lại rồi thử thêm một lượt.';
    write();
  }
  function checkChoice(answer){setDrillResult(answer,normalizeAnswer(answer)===normalizeAnswer(termNow()));}
  function checkTyped(){
    const input=document.getElementById('ruVocabFlowInput'),answer=clean(input?.value);
    if(!answer){setNotice('Hãy gõ câu trả lời bằng Cyrillic trước khi kiểm tra.');return;}
    if(!/[А-Яа-яЁё]/.test(answer)){setNotice('Hãy dùng chữ Cyrillic cho bước nhớ lại/viết.');return;}
    setDrillResult(answer,normalizeAnswer(answer)===normalizeAnswer(termNow()));
  }
  function nextFlow(){
    const i=FLOW.indexOf(flowMode());
    if(i>=0&&i<FLOW.length-1)setFlowMode(FLOW[i+1]);
  }
  function playCoreVocab(slow=false){document.querySelector(`[data-act="${slow?'speak-vocab-slow':'speak-vocab'}"]`)?.click();}
  function flipCoreVocab(){document.querySelector('[data-act="toggle-vocab-flip"]')?.click();}
  function resultHtml(){
    const result=drillResult();
    if(!result)return '';
    return `<div class="ru-vocab-flow-result ${result}">${result==='correct'?'✓ Đúng':'↻ Chưa đúng'} · ${esc(notice)}</div>`;
  }
  function flowTaskHtml(mode){
    const choices=visibleCandidateTerms();
    const choiceButtons=choices.map(x=>`<button type="button" data-ru-vocab-choice="${esc(x)}">${esc(x)}</button>`).join('');
    const next=`<button type="button" class="btn primary" data-ru-vocab-next>Bước tiếp →</button>`;
    if(mode==='discover')return `<div class="ru-vocab-flow-task"><div><b>Nhìn → nghe → hiểu bằng ngữ cảnh Nga</b><p>Quan sát hình trước. Nghe phát âm, rồi chỉ mở gợi ý khi hình và âm chưa đủ.</p></div><div class="ru-vocab-flow-actions"><button type="button" class="btn green" data-ru-vocab-play>🔊 Nghe</button><button type="button" class="btn" data-ru-vocab-play-slow>🐢 Chậm</button><button type="button" class="btn" data-ru-vocab-flip>Mở gợi ý</button>${next}</div></div>`;
    if(mode==='recognize')return `<div class="ru-vocab-flow-task"><div><b>Nhìn hình → chọn từ</b><p>Từ trên thẻ và danh sách đang được che để bạn nhận diện thật, không liếc đáp án.</p></div><div class="ru-vocab-choice-grid">${choiceButtons||'<span>Hãy xóa bộ lọc để có thêm phương án nhận diện.</span>'}</div>${resultHtml()}<div class="ru-vocab-flow-actions">${drillResult()==='correct'?next:''}</div></div>`;
    if(mode==='listen')return `<div class="ru-vocab-flow-task"><div><b>Nghe → chọn từ</b><p>Không nhìn chữ trước. Nghe một hoặc hai lượt rồi chọn từ bạn vừa nghe.</p></div><div class="ru-vocab-flow-actions"><button type="button" class="btn green" data-ru-vocab-play>🔊 Nghe từ</button><button type="button" class="btn" data-ru-vocab-play-slow>🐢 Chậm</button></div><div class="ru-vocab-choice-grid">${choiceButtons||'<span>Hãy xóa bộ lọc để có thêm phương án.</span>'}</div>${resultHtml()}<div class="ru-vocab-flow-actions">${drillResult()==='correct'?next:''}</div></div>`;
    if(mode==='speak')return `<div class="ru-vocab-flow-task"><div><b>Nghe → nhắc lại</b><p>Nghe tốc độ thường, nhắc lại thành tiếng rồi tự xác nhận đã thực hiện. Đây không phải điểm phát âm tự động.</p></div><div class="ru-vocab-flow-actions"><button type="button" class="btn green" data-ru-vocab-play>🔊 Nghe mẫu</button><button type="button" class="btn" data-ru-vocab-play-slow>🐢 Chậm</button><button type="button" class="btn" data-ru-vocab-spoken>🎙️ Tôi đã nhắc lại</button>${drillResult()==='correct'?next:''}</div>${resultHtml()}</div>`;
    if(mode==='recall')return `<div class="ru-vocab-flow-task"><div><b>Hình → nhớ lại từ</b><p>Không mở gợi ý. Gõ từ tiếng Nga bạn nhớ được từ hình/ngữ cảnh.</p></div><div class="ru-vocab-flow-input"><input id="ruVocabFlowInput" class="input" lang="ru" autocomplete="off" placeholder="Введите слово…"><button type="button" class="btn primary" data-ru-vocab-check>Kiểm tra</button></div>${resultHtml()}<div class="ru-vocab-flow-actions">${drillResult()==='correct'?next:''}</div></div>`;
    if(mode==='write')return `<div class="ru-vocab-flow-task"><div><b>Nghe → viết</b><p>Nghe lại, sau đó viết/gõ chính xác bằng Cyrillic. Trọng âm hiển thị để học phát âm, không bắt buộc nhập dấu trọng âm.</p></div><div class="ru-vocab-flow-actions"><button type="button" class="btn green" data-ru-vocab-play>🔊 Nghe</button><button type="button" class="btn" data-ru-vocab-play-slow>🐢 Chậm</button></div><div class="ru-vocab-flow-input"><input id="ruVocabFlowInput" class="input" lang="ru" autocomplete="off" placeholder="Напишите слово…"><button type="button" class="btn primary" data-ru-vocab-check>Kiểm tra</button></div>${resultHtml()}<div class="ru-vocab-flow-actions">${drillResult()==='correct'?next:''}</div></div>`;
    return '';
  }
  function flowNavHtml(mode){return `<nav class="ru-vocab-flow-nav" aria-label="Quy trình học từ vựng">${FLOW.map((x,i)=>`<button type="button" data-ru-vocab-mode="${x}" aria-current="${mode===x?'step':'false'}" class="${mode===x?'active':''}"><span>${i+1}</span><b>${FLOW_LABELS[x]}</b></button>`).join('')}</nav>`;}

  function markLearningEvidence(kind){
    const old=window.RussianLearningFlow?.get?.();
    const lessonId=window.RussianLearningFlow?.activeLessonId?.();
    if(!lessonId)return;
    const prev=old?.lessons?.[lessonId]?.steps?.vocab||{};
    const srsRatings=Number(prev.srsRatings||0)+(kind?1:0);
    window.RussianLearningFlow?.touch?.('vocab',{supportActions:Number(prev.supportActions||0)+1,srsRatings,lastSrsRating:kind||'',provenance:'stage_support'},lessonId);
  }
  function rate(kind){
    if(!['forgot','unsure','recalled'].includes(kind))return;
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key,prev=stableCard(meta),at=now(),term=meta.term;
    if(!prev.exposedAt){setNotice('Thẻ này chưa được học. Hãy bắt đầu từ Khám phá trước khi đưa vào SRS.');return;}
    let successStreak=Number(prev.successStreak||0), lapses=Number(prev.lapses||0), dueAt=at, reason='srs_forgot', gapDays=0;
    if(kind==='forgot'){
      successStreak=0;lapses+=1;dueAt=at;reason='srs_forgot';
    }else if(kind==='unsure'){
      successStreak=0;gapDays=GAPS[0]||1;dueAt=plusDays(gapDays);reason='srs_unsure';
    }else{
      successStreak+=1;gapDays=GAPS[Math.min(Math.max(0,successStreak-1),GAPS.length-1)]||1;dueAt=plusDays(gapDays);reason='srs_scheduled_recall';
    }
    const ratings={forgot:Number(prev.ratings?.forgot||0),unsure:Number(prev.ratings?.unsure||0),recalled:Number(prev.ratings?.recalled||0)};ratings[kind]++;
    state.cards[key]={...prev,key,index,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,term,firstReviewedAt:prev.firstReviewedAt||at,lastReviewedAt:at,lastRating:kind,ratings,reviewCount:Number(prev.reviewCount||0)+1,successStreak,lapses,gapDays,dueAt,reason,stage:meta.stage};
    write();
    window.RussianLearningState?.addReview?.(key,reason,routeFor(index,state.cards[key]),`Từ vựng · ${term}`,dueAt);
    if(sessionStorage.getItem(ACTIVE_DUE_KEY)===key)sessionStorage.removeItem(ACTIVE_DUE_KEY);
    markLearningEvidence(kind);
    const label=kind==='forgot'?'Đã giữ thẻ ở hàng ôn ngay':kind==='unsure'?`Đã hẹn ôn lại sau ${gapDays} ngày`:`Đã hẹn ôn lại sau ${gapDays} ngày`;
    setNotice(label+'. Đây là lịch ôn, không phải xác nhận đã thuộc.');
  }
  function abandonActiveDue(){
    const active=sessionStorage.getItem(ACTIVE_DUE_KEY);if(!active)return;
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key;if(active!==key){sessionStorage.removeItem(ACTIVE_DUE_KEY);return;}
    const prev=stableCard(meta);const at=now();
    state.cards[key]={...prev,key,index,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,stage:meta.stage,term:prev.term||meta.term,abandoned:Number(prev.abandoned||0)+1,dueAt:at,reason:'abandoned',lastAbandonedAt:at};
    write();window.RussianLearningState?.addReview?.(key,'abandoned',routeFor(index,state.cards[key]),`Từ vựng bỏ dở · ${prev.term||meta.term}`,at);sessionStorage.removeItem(ACTIVE_DUE_KEY);
  }
  function openIndex(index,markDue=false,card=null){
    const target=Math.max(0,Number(index)||0),core=readCore(),item=card||{};
    const activeKey=clean(item.key)||legacyKeyFor(target);
    if((core.view||'')==='vocab'&&!core.vocabQuery&&!core.vocabFocusKey){
      const visible=document.querySelector(`[data-vocab-stage-index="${target}"]`);
      if(visible){visible.click();if(markDue)sessionStorage.setItem(ACTIVE_DUE_KEY,activeKey);return;}
    }
    const next={...core,view:'vocab',stage:clean(item.stage)||core.stage||'vn',vocabFocusKey:clean(item.sourceId),vocabQuery:'',vocabIndex:clean(item.sourceId)?0:target,vocabPage:clean(item.sourceId)?0:Math.floor(target/20),vocabFlipped:false};
    try{localStorage.setItem(CORE_KEY,JSON.stringify(next));if(markDue)sessionStorage.setItem(ACTIVE_DUE_KEY,activeKey);location.reload();}catch(e){console.warn('Cannot open vocab index',e)}
  }
  function openNextDue(){const item=dueCards()[0];if(!item){setNotice('Hiện không có thẻ nào đến hạn.');return;}openIndex(item.stageIndex??item.index,true,item);}
  async function loadVocabItem(index){
    if(!vocabPromise)vocabPromise=fetch('data/vocab.json',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('Không đọc được vocab.json')));
    try{const data=await vocabPromise;return Array.isArray(data)?data[index]||null:null;}finally{setTimeout(()=>{vocabPromise=null;},0);}
  }
  function normalized(item){return A.normalizeVocab?A.normalizeVocab(item):{term:clean(item?.ru||item?.phrase_ru||item?.front),meaningVi:clean(item?.meaning_vi||item?.vi),english:clean(item?.clue_en),meaningRu:clean(item?.meaning_ru||item?.meaning),stage:clean(item?.stage),tags:Array.isArray(item?.tags)?item.tags:[]};}
  function saveSentence(entry){state.sentences[entry.id]=entry;write();markLearningEvidence('');}
  async function mineSource(){
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key;setNotice('Đang kiểm tra câu nguồn của thẻ…');
    try{
      const item=await loadVocabItem(meta.sourceIndex);if(!item){setNotice('Không tìm thấy dữ liệu nguồn của thẻ này.');return;}
      const n=normalized(item), sentence=clean(item.example||item.example_ru||''), term=clean(n.term||termNow());
      if(!sentence||lower(sentence)===lower(term)){setNotice('Nguồn của thẻ này chỉ lặp lại chính từ/cụm, nên không lưu như một câu ngữ cảnh.');return;}
      const id=`source:${key}`;saveSentence({id,vocabKey:key,index,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,term,sentence,meaning:clean(n.meaningRu||''),source:'vocab.example',stage:clean(n.stage)||meta.stage,tags:Array.isArray(n.tags)?n.tags:[],savedAt:state.sentences[id]?.savedAt||now()});
      setNotice('Đã lưu câu ví dụ thật từ dữ liệu nguồn vào Sentence Mining.');
    }catch(e){setNotice('Không thể đọc câu nguồn: '+clean(e?.message||e));}
  }
  function mineUser(){
    const input=document.getElementById('ruVocabMineInput'), sentence=clean(input?.value);if(!sentence){setNotice('Nhập một câu tiếng Nga trước khi lưu.');return;}
    if(!/[А-Яа-яЁё]/.test(sentence)){setNotice('Câu tự lưu cần có chữ Cyrillic để tránh biến phiên tự Latin thành câu tiếng Nga.');return;}
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key,term=meta.term,id=`user:${key}:${Date.now()}`;
    saveSentence({id,vocabKey:key,index,stageIndex:meta.stageIndex,sourceIndex:meta.sourceIndex,sourceId:meta.sourceId,term,sentence,source:'user_sentence',stage:meta.stage,savedAt:now()});if(input)input.value='';setNotice('Đã lưu câu của bạn. Câu tự viết được giữ tách biệt với dữ liệu nguồn.');
  }
  function deleteSentence(id){if(state.sentences[id]){delete state.sentences[id];write();setNotice('Đã bỏ câu khỏi Sentence Mining.');}}
  async function loadSpeaking(){
    if(!speakingPromise)speakingPromise=fetch('data/speaking.json',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('Không đọc được speaking.json')));
    try{return await speakingPromise;}finally{setTimeout(()=>{speakingPromise=null;},0);}
  }
  async function findSpeakingLinks(){
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key,card=stableCard(meta),term=lower(meta.term);if(!term)return;
    setNotice('Đang kiểm tra exact vocabulary seed trong kho Nghe/Nói…');
    try{
      const data=await loadSpeaking();const matches=(Array.isArray(data)?data:[]).filter(item=>Array.isArray(item?.vocabulary_seed_ru)&&item.vocabulary_seed_ru.some(x=>lower(x)===term)).slice(0,20).map(item=>({id:clean(item.id||item.title),lessonId:clean(item.lessonId||item.lesson_id||item.routeId||item.chapterId),title:clean(item.title||item.context_title_vi||item.title_ru||item.id)})).filter(x=>x.id&&x.lessonId);
      state.cards[key]={...card,key,index,term:termNow(),speakingCheckedAt:now(),speakingMatches:matches};write();
      setNotice(matches.length?`Tìm thấy ${matches.length} mục Nghe/Nói khai báo chính xác từ/cụm này trong vocabulary seed.`:'Không có exact seed match. Hệ thống không tự ghép hội thoại chỉ vì cùng tag/chủ đề.');
    }catch(e){setNotice('Không kiểm tra được kho Nghe/Nói: '+clean(e?.message||e));}
  }
  function openSpeaking(id){
    const meta=currentMeta(),key=meta.key,card=stableCard(meta),match=(card.speakingMatches||[]).find(x=>x.id===id);if(!match)return;
    const core=readCore(), next={...core,view:'learning',learnTab:'practice',lessonId:match.lessonId,practiceDialogueId:match.id,practiceLineIndex:0,practiceGroup:'all',practiceDifficulty:'all'};
    try{localStorage.setItem(CORE_KEY,JSON.stringify(next));window.RussianLearningState?.setResume?.({view:'learning',learnTab:'practice',lessonId:match.lessonId,practiceDialogueId:match.id,practiceLineIndex:0},'vocab_exact_seed');location.reload();}catch(e){console.warn('Cannot open speaking match',e)}
  }
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function cardStatus(card){if(!card?.reviewCount)return 'Chưa tự đánh giá';return `${card.reviewCount} lượt tự đánh giá · ${formatDue(card.dueAt)}`;}
  function sentenceList(key){const rows=sentencesFor(key).slice(0,4);if(!rows.length)return '<div class="ru-vocab-srs-empty">Chưa lưu câu nào cho thẻ này.</div>';return rows.map(x=>`<article><div><span>${x.source==='vocab.example'?'Câu nguồn':'Câu của tôi'}</span><b lang="ru">${esc(x.sentence)}</b>${x.meaning?`<small>${esc(x.meaning)}</small>`:''}</div><button type="button" data-ru-srs-delete="${esc(x.id)}" aria-label="Bỏ câu đã lưu">×</button></article>`).join('');}
  function speakingList(card){
    if(!card?.speakingCheckedAt)return '<p>Chỉ kiểm tra khi bạn bấm nút; không tải thêm kho speaking trong nền.</p>';
    const matches=Array.isArray(card.speakingMatches)?card.speakingMatches:[];
    if(!matches.length)return '<p>Không có exact vocabulary seed match. Không ghép mơ hồ theo tag.</p>';
    return matches.slice(0,5).map(x=>`<button type="button" class="ru-vocab-speaking-match" data-ru-srs-speaking="${esc(x.id)}"><b>${esc(x.title)}</b><small>${esc(x.lessonId)} · exact seed</small></button>`).join('');
  }
  function render(){
    const core=readCore(), host=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
    if((core.view||'')!=='vocab'||!host){document.getElementById('ruVocabSrs')?.remove();return;}
    const meta=currentMeta(),index=meta.stageIndex,key=meta.key,mode=flowMode(),term=meta.term;
    let card=stableCard(meta);
    if(mode==='discover')card=ensureExposure(key,index,term,meta);
    const due=dueCards(), scheduled=scheduledCards(), mined=sentencesFor(key), activeDue=sessionStorage.getItem(ACTIVE_DUE_KEY)===key;
    const shell=host.closest('.vocab-studio');host.dataset.vocabFlow=mode;if(shell)shell.dataset.vocabFlow=mode;
    let panel=document.getElementById('ruVocabSrs');
    if(!panel){panel=document.createElement('section');panel.id='ruVocabSrs';panel.className='ru-vocab-srs';const anchor=host.querySelector('.ru-language-contract')||host.querySelector('.flash,.v1310-flash');if(anchor?.parentNode)anchor.parentNode.insertBefore(panel,anchor.nextSibling);else host.appendChild(panel);}
    const reviewPanel=mode==='review'?`<div class="ru-vocab-rating"><div><b>Tự đánh giá lần ôn này</b><small>Chọn theo kết quả nhớ lại/viết vừa thực hiện. “Nhớ được” chỉ lên lịch ôn tiếp, không đánh dấu đã thuộc.</small></div><div><button type="button" class="forgot" data-ru-srs-rate="forgot">Quên</button><button type="button" class="unsure" data-ru-srs-rate="unsure">Chưa chắc</button><button type="button" class="recalled" data-ru-srs-rate="recalled">Nhớ được</button></div></div>
      ${notice?`<div class="ru-vocab-srs-notice">${esc(notice)}</div>`:''}
      <details class="ru-vocab-mining"><summary><b>Sentence Mining</b><span>${mined.length} câu của thẻ này</span></summary><div class="ru-vocab-mining-body"><div class="ru-vocab-mining-actions"><button type="button" class="btn soft" data-ru-srs-mine-source>Lưu câu nguồn nếu có</button><div><input id="ruVocabMineInput" class="input" placeholder="Tự viết một câu tiếng Nga dùng từ này…"><button type="button" class="btn" data-ru-srs-mine-user>Lưu câu của tôi</button></div></div><div class="ru-vocab-sentence-list">${sentenceList(key)}</div></div></details>
      <details class="ru-vocab-speaking-bridge"><summary><b>Cầu nối Nghe/Nói</b><span>chỉ exact vocabulary seed</span></summary><div class="ru-vocab-speaking-body"><button type="button" class="btn soft" data-ru-srs-find-speaking>Kiểm tra liên kết thật</button><div class="ru-vocab-speaking-list">${speakingList(card)}</div></div></details>`:
      `${flowTaskHtml(mode)}${notice&&!drillResult()?`<div class="ru-vocab-srs-notice">${esc(notice)}</div>`:''}`;
    const html=`<header><div><span>LEARNING FLOW · THẺ ${index+1}</span><h4>${mode==='review'?esc(term):esc(FLOW_LABELS[mode])}</h4><p>${mode==='review'?esc(cardStatus(card)):'Khám phá → nhận diện → nghe → nói → nhớ lại → viết → ôn.'}${activeDue?' · đang ôn thẻ đến hạn':''}</p></div><div class="ru-vocab-srs-summary"><button type="button" data-ru-srs-open-due><b>${due.length}</b><small>đến hạn</small></button><span><b>${scheduled.length}</b><small>đã hẹn</small></span><span><b>${Object.keys(state.sentences).length}</b><small>câu đã lưu</small></span></div></header>${flowNavHtml(mode)}${reviewPanel}`;
    if(panel.innerHTML!==html)panel.innerHTML=html;
  }
  function routeWithVocabIndex(target){const node=target.closest?.('[data-route]');if(!node)return null;try{const r=JSON.parse(node.dataset.route||'{}');return r?.view==='vocab'&&r.vocabIndex!==undefined?r:null}catch(_){return null}}
  function shouldAbandon(target){
    if(!sessionStorage.getItem(ACTIVE_DUE_KEY))return false;
    if(target.closest?.('[data-ru-srs-rate],[data-ru-srs-open-due],[data-ru-srs-mine-source],[data-ru-srs-mine-user],[data-ru-srs-delete],[data-ru-srs-find-speaking],[data-ru-srs-speaking]'))return false;
    const act=target.closest?.('[data-act]')?.dataset.act||'';
    if(['next-vocab','prev-vocab'].includes(act)||target.closest?.('[data-vocab]'))return true;
    const view=target.closest?.('[data-view]')?.dataset.view;if(view&&view!=='vocab')return true;
    const r=target.closest?.('[data-route]');if(r){try{return JSON.parse(r.dataset.route||'{}').view!=='vocab'}catch(_){return false}}
    return false;
  }
  document.addEventListener('click',event=>{
    const target=event.target;
    const cardMove=target.closest?.('[data-vocab],[data-act="next-vocab"],[data-act="prev-vocab"]');
    if(cardMove){state.flowMode='discover';state.drill={};try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,updatedAt:now()}))}catch(_){}}
        const indexed=routeWithVocabIndex(target);if(indexed){event.preventDefault();event.stopImmediatePropagation();openIndex(Number(indexed.vocabIndex)||0,false,null);return;}
    const modeBtn=target.closest?.('[data-ru-vocab-mode]');if(modeBtn){event.preventDefault();setFlowMode(modeBtn.dataset.ruVocabMode);return;}
    const choice=target.closest?.('[data-ru-vocab-choice]');if(choice){event.preventDefault();checkChoice(choice.dataset.ruVocabChoice);return;}
    if(target.closest?.('[data-ru-vocab-play]')){event.preventDefault();playCoreVocab();return;}
    if(target.closest?.('[data-ru-vocab-play-slow]')){event.preventDefault();playCoreVocab(true);return;}
    if(target.closest?.('[data-ru-vocab-flip]')){event.preventDefault();flipCoreVocab();return;}
    if(target.closest?.('[data-ru-vocab-spoken]')){event.preventDefault();setDrillResult(termNow(),true);return;}
    if(target.closest?.('[data-ru-vocab-check]')){event.preventDefault();checkTyped();return;}
    if(target.closest?.('[data-ru-vocab-next]')){event.preventDefault();nextFlow();return;}
        const rateBtn=target.closest?.('[data-ru-srs-rate]');if(rateBtn){event.preventDefault();rate(rateBtn.dataset.ruSrsRate);return;}
    if(target.closest?.('[data-ru-srs-open-due]')){event.preventDefault();openNextDue();return;}
    if(target.closest?.('[data-ru-srs-mine-source]')){event.preventDefault();mineSource();return;}
    if(target.closest?.('[data-ru-srs-mine-user]')){event.preventDefault();mineUser();return;}
    const del=target.closest?.('[data-ru-srs-delete]');if(del){event.preventDefault();deleteSentence(del.dataset.ruSrsDelete);return;}
    if(target.closest?.('[data-ru-srs-find-speaking]')){event.preventDefault();findSpeakingLinks();return;}
    const sp=target.closest?.('[data-ru-srs-speaking]');if(sp){event.preventDefault();openSpeaking(sp.dataset.ruSrsSpeaking);return;}
    if(shouldAbandon(target))abandonActiveDue();
  },true);
  document.addEventListener('keydown',event=>{if(event.key!=='Enter')return;if(event.target?.id==='ruVocabMineInput'){event.preventDefault();mineUser();return;}if(event.target?.id==='ruVocabFlowInput'){event.preventDefault();checkTyped();}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRender,{once:true});else scheduleRender();
  window.RussianVocabSrs={schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),dueCards,scheduledCards,statusForItem,filterItems,rate,openIndex,mineSource,findSpeakingLinks,setFlowMode,refresh:scheduleRender,flow:[...FLOW],gaps:[...GAPS]};
})();