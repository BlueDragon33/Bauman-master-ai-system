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
  const cyr=/[А-Яа-яЁё]/;
  const russian=v=>{const s=clean(v);return cyr.test(s)?s:'';};
  const now=()=>new Date().toISOString();
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,cards:{},sentences:{},updatedAt:null});
  function read(){const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,cards:x&&typeof x.cards==='object'?x.cards:{},sentences:x&&typeof x.sentences==='object'?x.sentences:{}};}
  let state=read();
  let renderQueued=false;
  let notice='';
  let vocabPromise=null;
  let speakingPromise=null;
  function write(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian vocab SRS save failed',e)};window.dispatchEvent(new CustomEvent('russian:vocab-srs',{detail:{state}}));scheduleRender();}
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  const indexNow=()=>Math.max(0,Number(readCore().vocabIndex)||0);
  const keyFor=index=>`vocab:${Math.max(0,Number(index)||0)}`;
  function termNow(){return clean(document.querySelector('.v1310-vocab-top h3,.vocab-card-panel .term')?.textContent)||`Thẻ ${indexNow()+1}`;}
  const routeFor=index=>({view:'vocab',vocabIndex:Number(index)||0,vocabPage:Math.floor((Number(index)||0)/20)});
  function plusDays(days){const d=new Date();d.setDate(d.getDate()+Number(days||0));return d.toISOString();}
  function dueCards(){const t=Date.now();return Object.values(state.cards).filter(x=>x?.dueAt&&Date.parse(x.dueAt)<=t).sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt));}
  function scheduledCards(){const t=Date.now();return Object.values(state.cards).filter(x=>x?.dueAt&&Date.parse(x.dueAt)>t).sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt));}
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
    const index=indexNow(), key=keyFor(index), prev=state.cards[key]||{}, at=now(), term=termNow();
    let successStreak=Number(prev.successStreak||0), lapses=Number(prev.lapses||0), dueAt=at, reason='srs_forgot', gapDays=0;
    if(kind==='forgot'){
      successStreak=0;lapses+=1;dueAt=at;reason='srs_forgot';
    }else if(kind==='unsure'){
      successStreak=0;gapDays=GAPS[0]||1;dueAt=plusDays(gapDays);reason='srs_unsure';
    }else{
      successStreak+=1;gapDays=GAPS[Math.min(Math.max(0,successStreak-1),GAPS.length-1)]||1;dueAt=plusDays(gapDays);reason='srs_scheduled_recall';
    }
    const ratings={forgot:Number(prev.ratings?.forgot||0),unsure:Number(prev.ratings?.unsure||0),recalled:Number(prev.ratings?.recalled||0)};ratings[kind]++;
    state.cards[key]={...prev,key,index,term,firstReviewedAt:prev.firstReviewedAt||at,lastReviewedAt:at,lastRating:kind,ratings,reviewCount:Number(prev.reviewCount||0)+1,successStreak,lapses,gapDays,dueAt,reason,stage:clean(readCore().stage)||prev.stage||''};
    write();
    window.RussianLearningState?.addReview?.(key,reason,routeFor(index),`Từ vựng · ${term}`,dueAt);
    if(sessionStorage.getItem(ACTIVE_DUE_KEY)===key)sessionStorage.removeItem(ACTIVE_DUE_KEY);
    markLearningEvidence(kind);
    const label=kind==='forgot'?'Đã giữ thẻ ở hàng ôn ngay':kind==='unsure'?`Đã hẹn ôn lại sau ${gapDays} ngày`:`Đã hẹn ôn lại sau ${gapDays} ngày`;
    setNotice(label+'. Đây là lịch ôn, không phải xác nhận đã thuộc.');
  }
  function abandonActiveDue(){
    const active=sessionStorage.getItem(ACTIVE_DUE_KEY);if(!active)return;
    const index=indexNow(), key=keyFor(index);if(active!==key){sessionStorage.removeItem(ACTIVE_DUE_KEY);return;}
    const prev=state.cards[key]||{};const at=now();
    state.cards[key]={...prev,key,index,term:prev.term||termNow(),abandoned:Number(prev.abandoned||0)+1,dueAt:at,reason:'abandoned',lastAbandonedAt:at};
    write();window.RussianLearningState?.addReview?.(key,'abandoned',routeFor(index),`Từ vựng bỏ dở · ${prev.term||termNow()}`,at);sessionStorage.removeItem(ACTIVE_DUE_KEY);
  }
  function openIndex(index,markDue=false){
    const target=Math.max(0,Number(index)||0), core=readCore();
    if((core.view||'')==='vocab'){
      const visible=document.querySelector(`[data-vocab="${target}"]`);
      if(visible){visible.click();if(markDue)sessionStorage.setItem(ACTIVE_DUE_KEY,keyFor(target));return;}
    }
    const next={...core,view:'vocab',vocabIndex:target,vocabPage:Math.floor(target/20),vocabFlipped:false};
    try{localStorage.setItem(CORE_KEY,JSON.stringify(next));if(markDue)sessionStorage.setItem(ACTIVE_DUE_KEY,keyFor(target));location.reload();}catch(e){console.warn('Cannot open vocab index',e)}
  }
  function openNextDue(){const item=dueCards()[0];if(!item){setNotice('Hiện không có thẻ nào đến hạn.');return;}openIndex(item.index,true);}
  async function loadVocabItem(index){
    if(!vocabPromise)vocabPromise=fetch('data/vocab.json',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('Không đọc được vocab.json')));
    try{const data=await vocabPromise;return Array.isArray(data)?data[index]||null:null;}finally{setTimeout(()=>{vocabPromise=null;},0);}
  }
  function normalized(item){
 const direct=window.RussianVisualVocabularyRuntime?.describe?.(item)||{};
 return {
  term:clean(direct.term_ru||item?.ru||item?.phrase_ru||item?.front),
  meaningRu:russian(direct.definition_ru||item?.meaning_ru||item?.definition_ru),
  contextRu:russian(direct.context_ru||item?.example_ru||item?.context_ru||item?.voice_text||item?.example),
  stage:clean(item?.stage),
  tags:Array.isArray(item?.tags)?item.tags:[]
 };
}
function saveSentence(entry){state.sentences[entry.id]=entry;write();markLearningEvidence('');}
  async function mineSource(){
    const index=indexNow(), key=keyFor(index);setNotice('Đang kiểm tra câu nguồn của thẻ…');
    try{
      const item=await loadVocabItem(index);if(!item){setNotice('Không tìm thấy dữ liệu nguồn của thẻ này.');return;}
      const n=normalized(item), sentence=clean(n.contextRu), term=clean(n.term||termNow());
      if(!sentence||lower(sentence)===lower(term)){setNotice('Nguồn của thẻ này chỉ lặp lại chính từ/cụm, nên không lưu như một câu ngữ cảnh.');return;}
      const id=`source:${key}`;saveSentence({id,vocabKey:key,index,term,sentence,meaning:clean(n.meaningRu),source:'vocab.example',stage:clean(n.stage),tags:Array.isArray(n.tags)?n.tags:[],savedAt:state.sentences[id]?.savedAt||now()});
      setNotice('Đã lưu câu ví dụ thật từ dữ liệu nguồn vào Sentence Mining.');
    }catch(e){setNotice('Không thể đọc câu nguồn: '+clean(e?.message||e));}
  }
  function mineUser(){
    const input=document.getElementById('ruVocabMineInput'), sentence=clean(input?.value);if(!sentence){setNotice('Nhập một câu tiếng Nga trước khi lưu.');return;}
    if(!/[А-Яа-яЁё]/.test(sentence)){setNotice('Câu tự lưu cần có chữ Cyrillic để tránh biến phiên tự Latin thành câu tiếng Nga.');return;}
    const index=indexNow(), key=keyFor(index), term=termNow(), id=`user:${key}:${Date.now()}`;
    saveSentence({id,vocabKey:key,index,term,sentence,source:'user_sentence',stage:clean(readCore().stage),savedAt:now()});if(input)input.value='';setNotice('Đã lưu câu của bạn. Câu tự viết được giữ tách biệt với dữ liệu nguồn.');
  }
  function deleteSentence(id){if(state.sentences[id]){delete state.sentences[id];write();setNotice('Đã bỏ câu khỏi Sentence Mining.');}}
  async function loadSpeaking(){
    if(!speakingPromise)speakingPromise=fetch('data/speaking.json',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('Không đọc được speaking.json')));
    try{return await speakingPromise;}finally{setTimeout(()=>{speakingPromise=null;},0);}
  }
  async function findSpeakingLinks(){
    const index=indexNow(), key=keyFor(index), card=state.cards[key]||{}, term=lower(termNow());if(!term)return;
    setNotice('Đang kiểm tra exact vocabulary seed trong kho Nghe/Nói…');
    try{
      const data=await loadSpeaking();const matches=(Array.isArray(data)?data:[]).filter(item=>Array.isArray(item?.vocabulary_seed_ru)&&item.vocabulary_seed_ru.some(x=>lower(x)===term)).slice(0,20).map(item=>({id:clean(item.id||item.source_id||''),lessonId:clean(item.lessonId||item.lesson_id||item.routeId||item.chapterId),title:russian(item.title_ru||item.context_title_ru)||clean(item.id||item.source_id||'')})).filter(x=>x.id&&x.lessonId);
      state.cards[key]={...card,key,index,term:termNow(),speakingCheckedAt:now(),speakingMatches:matches};write();
      setNotice(matches.length?`Tìm thấy ${matches.length} mục Nghe/Nói khai báo chính xác từ/cụm này trong vocabulary seed.`:'Không có exact seed match. Hệ thống không tự ghép hội thoại chỉ vì cùng tag/chủ đề.');
    }catch(e){setNotice('Không kiểm tra được kho Nghe/Nói: '+clean(e?.message||e));}
  }
  function openSpeaking(id){
    const key=keyFor(indexNow()), card=state.cards[key]||{}, match=(card.speakingMatches||[]).find(x=>x.id===id);if(!match)return;
    const core=readCore(), next={...core,view:'learning',learnTab:'practice',lessonId:match.lessonId,practiceDialogueId:match.id,practiceLineIndex:0,practiceGroup:'all',practiceDifficulty:'all'};
    try{localStorage.setItem(CORE_KEY,JSON.stringify(next));window.RussianLearningState?.setResume?.({view:'learning',learnTab:'practice',lessonId:match.lessonId,practiceDialogueId:match.id,practiceLineIndex:0},'vocab_exact_seed');location.reload();}catch(e){console.warn('Cannot open speaking match',e)}
  }
  function esc(v){return clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function cardStatus(card){if(!card?.reviewCount)return 'Chưa tự đánh giá';return `${card.reviewCount} lượt tự đánh giá · ${formatDue(card.dueAt)}`;}
  function sentenceList(key){const rows=sentencesFor(key).slice(0,4);if(!rows.length)return '<div class="ru-vocab-srs-empty">Chưa lưu câu nào cho thẻ này.</div>';return rows.map(x=>`<article><div><span>${x.source==='vocab.example'?'Câu nguồn':'Câu của tôi'}</span><b lang="ru">${esc(x.sentence)}</b></div><button type="button" data-ru-srs-delete="${esc(x.id)}" aria-label="Bỏ câu đã lưu">×</button></article>`).join('');}
  function speakingList(card){
    if(!card?.speakingCheckedAt)return '<p>Chỉ kiểm tra khi bạn bấm nút; không tải thêm kho speaking trong nền.</p>';
    const matches=Array.isArray(card.speakingMatches)?card.speakingMatches:[];
    if(!matches.length)return '<p>Không có exact vocabulary seed match. Không ghép mơ hồ theo tag.</p>';
    return matches.slice(0,5).map(x=>`<button type="button" class="ru-vocab-speaking-match" data-ru-srs-speaking="${esc(x.id)}"><b>${esc(x.title)}</b><small>${esc(x.lessonId)} · exact seed</small></button>`).join('');
  }
  function render(){
    const core=readCore(), host=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
    if((core.view||'')!=='vocab'||!host){document.getElementById('ruVocabSrs')?.remove();return;}
    const index=indexNow(), key=keyFor(index), card=state.cards[key]||{}, due=dueCards(), scheduled=scheduledCards(), mined=sentencesFor(key), activeDue=sessionStorage.getItem(ACTIVE_DUE_KEY)===key;
    let panel=document.getElementById('ruVocabSrs');if(!panel){panel=document.createElement('section');panel.id='ruVocabSrs';panel.className='ru-vocab-srs';const anchor=host.querySelector('.ru-language-contract')||host.querySelector('.flash,.v1310-flash');if(anchor?.parentNode)anchor.parentNode.insertBefore(panel,anchor.nextSibling);else host.appendChild(panel);}
    panel.innerHTML=`<header><div><span>ÔN THEO LỊCH · THẺ ${index+1}</span><h4>${esc(termNow())}</h4><p>${esc(cardStatus(card))}${activeDue?' · đang ôn thẻ đến hạn':''}</p></div><div class="ru-vocab-srs-summary"><button type="button" data-ru-srs-open-due><b>${due.length}</b><small>đến hạn</small></button><span><b>${scheduled.length}</b><small>đã hẹn</small></span><span><b>${Object.keys(state.sentences).length}</b><small>câu đã lưu</small></span></div></header><div class="ru-vocab-rating"><div><b>Tự nhớ lại qua hình, âm và ngữ cảnh Nga</b><small>Chọn theo kết quả thật của lần này. “Nhớ được” chỉ lên lịch ôn tiếp, không đánh dấu đã thuộc.</small></div><div><button type="button" class="forgot" data-ru-srs-rate="forgot">Quên</button><button type="button" class="unsure" data-ru-srs-rate="unsure">Chưa chắc</button><button type="button" class="recalled" data-ru-srs-rate="recalled">Nhớ được</button></div></div>${notice?`<div class="ru-vocab-srs-notice">${esc(notice)}</div>`:''}<details class="ru-vocab-mining"><summary><b>Sentence Mining</b><span>${mined.length} câu của thẻ này</span></summary><div class="ru-vocab-mining-body"><div class="ru-vocab-mining-actions"><button type="button" class="btn soft" data-ru-srs-mine-source>Lưu câu nguồn nếu có</button><div><input id="ruVocabMineInput" class="input" placeholder="Tự viết một câu tiếng Nga dùng từ này…"><button type="button" class="btn" data-ru-srs-mine-user>Lưu câu của tôi</button></div></div><div class="ru-vocab-sentence-list">${sentenceList(key)}</div></div></details><details class="ru-vocab-speaking-bridge"><summary><b>Cầu nối Nghe/Nói</b><span>chỉ exact vocabulary seed</span></summary><div class="ru-vocab-speaking-body"><button type="button" class="btn soft" data-ru-srs-find-speaking>Kiểm tra liên kết thật</button><div class="ru-vocab-speaking-list">${speakingList(card)}</div></div></details>`;
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
    const indexed=routeWithVocabIndex(target);if(indexed){event.preventDefault();event.stopImmediatePropagation();openIndex(Number(indexed.vocabIndex)||0,false);return;}
    const rateBtn=target.closest?.('[data-ru-srs-rate]');if(rateBtn){event.preventDefault();rate(rateBtn.dataset.ruSrsRate);return;}
    if(target.closest?.('[data-ru-srs-open-due]')){event.preventDefault();openNextDue();return;}
    if(target.closest?.('[data-ru-srs-mine-source]')){event.preventDefault();mineSource();return;}
    if(target.closest?.('[data-ru-srs-mine-user]')){event.preventDefault();mineUser();return;}
    const del=target.closest?.('[data-ru-srs-delete]');if(del){event.preventDefault();deleteSentence(del.dataset.ruSrsDelete);return;}
    if(target.closest?.('[data-ru-srs-find-speaking]')){event.preventDefault();findSpeakingLinks();return;}
    const sp=target.closest?.('[data-ru-srs-speaking]');if(sp){event.preventDefault();openSpeaking(sp.dataset.ruSrsSpeaking);return;}
    if(shouldAbandon(target))abandonActiveDue();
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target?.id==='ruVocabMineInput'){event.preventDefault();mineUser();}},true);
  document.addEventListener('DOMContentLoaded',()=>{
    const view=document.getElementById('view');if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});scheduleRender();
  });
  window.RussianVocabSrs={schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),dueCards,scheduledCards,rate,openIndex,mineSource,findSpeakingLinks,gaps:[...GAPS]};
})();