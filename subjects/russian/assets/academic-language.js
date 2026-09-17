'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const STORAGE_KEY='bauman_russian_academic_language_v1';
  const SCHEMA='RUSSIAN_ACADEMIC_LANGUAGE_V1';
  const CYR=/[А-Яа-яЁё]/;
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const now=()=>new Date().toISOString();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const readCore=()=>parse(localStorage.getItem(CORE_KEY),{});
  const empty=()=>({schema:SCHEMA,grammar:{},reading:{},writing:{},updatedAt:null});
  function read(){const x=parse(localStorage.getItem(STORAGE_KEY),empty());return {...empty(),...x,grammar:x?.grammar||{},reading:x?.reading||{},writing:x?.writing||{}};}
  let state=read(), grammar=[], grammarPath=[], writing=[], knowledge=[];
  let ready=false, renderQueued=false, notice='';
  const levelOrder=v=>({A0:0,A1:1,A2:2,B1:3,B2:4,C1:5,'Chuyên sâu':6}[clean(v)]??99);
  function write(){state.updatedAt=now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Russian academic language save failed',e)}scheduleRender();}
  function setNotice(v){notice=clean(v);scheduleRender();}
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  function allGrammar(){
    const path=grammarPath.map((x,i)=>({...x,_source:'grammar-path',_idx:i}));
    const legacy=grammar.map((g,i)=>({id:g.id||('GR_LEGACY_'+i),level:g.level||'A1',track:g.track||'Trong bài học',title:g.title||'Mẫu ngữ pháp',why:g.focus||g.rule||'',core:g.rule||g.focus||'',pattern:g.pattern||'',examples:Array.isArray(g.examples)?g.examples.map(e=>typeof e==='string'?{ru:e,vi:'',note:''}:e):[],practice:Array.isArray(g.practice)?g.practice:[],mistakes:Array.isArray(g.mistakes)?g.mistakes:[],bauman:g.professor_note||'',mastery:g.focus||'',mapLinks:g.tags||[],stage:g.stage||'',_source:'grammar',_idx:i}));
    return [...path,...legacy].sort((a,b)=>levelOrder(a.level)-levelOrder(b.level)||clean(a.track).localeCompare(clean(b.track),'vi')||clean(a.id).localeCompare(clean(b.id),'vi'));
  }
  function filteredGrammar(core=readCore()){
    let xs=allGrammar();const q=clean(core.grammarQuery).toLowerCase();
    if(core.grammarLevel&&core.grammarLevel!=='all')xs=xs.filter(x=>clean(x.level)===clean(core.grammarLevel));
    if(core.grammarTrack&&core.grammarTrack!=='all')xs=xs.filter(x=>clean(x.track)===clean(core.grammarTrack));
    if(q)xs=xs.filter(x=>[x.id,x.level,x.track,x.title,x.why,x.core,x.pattern,JSON.stringify(x.examples||[]),JSON.stringify(x.practice||[]),JSON.stringify(x.mistakes||[]),x.bauman].join(' ').toLowerCase().includes(q));
    return xs;
  }
  function activeGrammar(core=readCore()){
    const xs=filteredGrammar(core), index=Math.min(Math.max(0,Number(core.grammarIndex)||0),Math.max(0,xs.length-1));
    return {item:xs[index]||null,index};
  }
  function stageWriting(core=readCore()){return writing.filter(x=>core.stage==='all'||!clean(x.stage)||clean(x.stage)===clean(core.stage));}
  function activeWriting(core=readCore()){
    const xs=stageWriting(core), index=Math.min(Math.max(0,Number(core.writingIndex)||0),Math.max(0,xs.length-1));
    return {item:xs[index]||null,index};
  }
  function lessonId(core=readCore()){return clean(core.lessonId)||clean(window.RussianLearningFlow?.activeLessonId?.());}
  function readingMeta(core=readCore()){const id=lessonId(core);return knowledge.find(x=>clean(x.id)===id)||null;}
  function grammarRoute(core=readCore(),index=Number(core.grammarIndex)||0){return {view:'grammar',grammarLevel:core.grammarLevel||'all',grammarTrack:core.grammarTrack||'all',grammarQuery:core.grammarQuery||'',grammarIndex:index};}
  function readingRoute(core=readCore()){return {view:'learning',learnTab:'theory',lessonId:lessonId(core),slide:Math.max(0,Number(core.slide)||0)};}
  function writingRoute(core=readCore(),index=Number(core.writingIndex)||0){return {view:'writing',writingMode:'academic',writingIndex:index};}
  function touchResume(route,reason){window.RussianLearningState?.setResume?.(route,reason||'academic_language');}
  function grammarRow(id){state.grammar[id]=state.grammar[id]||{ruleReads:0,exampleReviews:0,ownSentences:0,flagged:0,lastSentence:'',updatedAt:null};return state.grammar[id];}
  function readingRow(key){state.reading[key]=state.reading[key]||{reads:0,checkedKeywords:[],flagged:0,updatedAt:null};return state.reading[key];}
  function writingRow(id){state.writing[id]=state.writing[id]||{snapshots:[],selfReviews:0,rubricChecked:[],flagged:0,updatedAt:null};return state.writing[id];}
  function bumpGrammar(field){
    const core=readCore(), {item}=activeGrammar(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=grammarRow(id);row[field]=Number(row[field]||0)+1;row.updatedAt=now();write();touchResume(grammarRoute(core),'grammar_activity');
    const lesson=lessonId(core);if(lesson){const old=window.RussianLearningFlow?.get?.()?.lessons?.[lesson]?.steps?.grammar||{};window.RussianLearningFlow?.touch?.('grammar',{supportActions:Number(old.supportActions||0)+1,provenance:'stage_support',lastAcademicAt:row.updatedAt},lesson);}
  }
  function saveGrammarSentence(){
    const input=document.getElementById('ruAcademicGrammarSentence'), text=clean(input?.value);if(!text){setNotice('Nhập một câu tiếng Nga trước khi lưu.');return;}if(!CYR.test(text)){setNotice('Câu tự tạo cần có chữ Cyrillic; không lưu phiên tự Latin như câu tiếng Nga.');return;}
    const core=readCore(), {item}=activeGrammar(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=grammarRow(id);row.ownSentences=Number(row.ownSentences||0)+1;row.lastSentence=text;row.lastSentenceAt=now();row.updatedAt=row.lastSentenceAt;write();touchResume(grammarRoute(core),'grammar_own_sentence');setNotice('Đã lưu câu tự tạo như bằng chứng luyện ngữ pháp. Không thay đổi mastery.');if(input)input.value='';
  }
  function flagGrammar(){
    const core=readCore(), {item}=activeGrammar(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=grammarRow(id);row.flagged=Number(row.flagged||0)+1;row.updatedAt=now();write();window.RussianLearningState?.addReview?.(`grammar:${id}`,'grammar_review',grammarRoute(core),`Ngữ pháp cần ôn · ${clean(item.title)||id}`);setNotice('Đã đưa đúng mục ngữ pháp này vào Review Queue.');
  }
  function markReading(){
    const core=readCore(), id=lessonId(core);if(!id)return;const slide=Math.max(0,Number(core.slide)||0), key=`${id}:slide:${slide}`, row=readingRow(key);row.reads=Number(row.reads||0)+1;row.updatedAt=now();write();touchResume(readingRoute(core),'reading_mark');const old=window.RussianLearningFlow?.get?.()?.lessons?.[id]?.steps?.theory||{};window.RussianLearningFlow?.touch?.('theory',{readingMarks:Number(old.readingMarks||0)+1,lastReadingAt:row.updatedAt},id);setNotice('Đã ghi nhận bạn tự đánh dấu đã đọc kỹ slide hiện tại; đây không phải điểm hiểu bài.');
  }
  function toggleKeyword(word){
    const core=readCore(), id=lessonId(core);if(!id)return;const key=`${id}:slide:${Math.max(0,Number(core.slide)||0)}`, row=readingRow(key);const list=new Set(Array.isArray(row.checkedKeywords)?row.checkedKeywords:[]);if(list.has(word))list.delete(word);else list.add(word);row.checkedKeywords=[...list];row.updatedAt=now();write();
  }
  function flagReading(){
    const core=readCore(), id=lessonId(core);if(!id)return;const slide=Math.max(0,Number(core.slide)||0), key=`${id}:slide:${slide}`, row=readingRow(key);row.flagged=Number(row.flagged||0)+1;row.updatedAt=now();write();window.RussianLearningState?.addReview?.(`reading:${key}`,'reading_review',readingRoute(core),`Đọc hiểu cần ôn · ${id} · slide ${slide+1}`);setNotice('Đã đưa đúng bài/slide này vào Review Queue để đọc lại.');
  }
  function openStageWriting(){
    const nav=document.querySelector('[data-view="writing"]');if(nav)nav.click();setTimeout(()=>document.querySelector('[data-writing="academic"]')?.click(),45);setNotice('Đã mở nhiệm vụ viết theo cùng giai đoạn. Đây là hỗ trợ theo stage, không phải liên kết lessonId.');
  }
  function currentDraft(){return clean(document.querySelector('[data-input="writingDraft"]')?.value||readCore().writingDraft||'');}
  function wordCount(text){return clean(text)?clean(text).split(/\s+/).filter(Boolean).length:0;}
  function snapshotWriting(kind){
    const core=readCore(), {item}=activeWriting(core);if(!item)return;const text=currentDraft();if(!text){setNotice('Bản nháp đang trống.');return;}if(!CYR.test(text)){setNotice('Bản viết cần có chữ Cyrillic trước khi ghi nhận.');return;}
    const id=clean(item.id)||clean(item.title), row=writingRow(id);row.snapshots=Array.isArray(row.snapshots)?row.snapshots:[];row.snapshots.push({kind,at:now(),words:wordCount(text),text});row.snapshots=row.snapshots.slice(-8);row.updatedAt=now();write();touchResume(writingRoute(core),'writing_snapshot');setNotice(kind==='rewrite'?'Đã lưu bản viết lại. Không tự chấm chất lượng.':'Đã lưu bản nháp đầu tiên. Không tự chấm chất lượng.');
  }
  function selfReviewWriting(){const core=readCore(), {item}=activeWriting(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=writingRow(id);row.selfReviews=Number(row.selfReviews||0)+1;row.updatedAt=now();write();touchResume(writingRoute(core),'writing_self_review');setNotice('Đã ghi nhận một lượt tự soát. Hệ thống không suy ra đã đạt yêu cầu.');}
  function toggleRubric(index){const core=readCore(), {item}=activeWriting(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=writingRow(id);const set=new Set(Array.isArray(row.rubricChecked)?row.rubricChecked:[]);if(set.has(index))set.delete(index);else set.add(index);row.rubricChecked=[...set].sort((a,b)=>a-b);row.updatedAt=now();write();}
  function flagWriting(){const core=readCore(), {item}=activeWriting(core);if(!item)return;const id=clean(item.id)||clean(item.title), row=writingRow(id);row.flagged=Number(row.flagged||0)+1;row.updatedAt=now();write();window.RussianLearningState?.addReview?.(`writing:${id}`,'writing_review',writingRoute(core),`Bài viết cần ôn · ${clean(item.title)||id}`);setNotice('Đã đưa đúng nhiệm vụ viết này vào Review Queue.');}
  function metaChips(values){return values.filter(Boolean).map(v=>`<span>${esc(v)}</span>`).join('');}
  function renderGrammar(core){
    const {item}=activeGrammar(core);if(!item)return '';
    const id=clean(item.id)||clean(item.title), row=grammarRow(id), exampleCount=Array.isArray(item.examples)?item.examples.length:0, practiceCount=Array.isArray(item.practice)?item.practice.length:0;
    return `<header><div><span>GRAMMAR LAB · NGUỒN NỘI BỘ</span><h3>${esc(item.title||id)}</h3><p>Ghi bằng chứng học quy tắc, ví dụ và câu tự tạo. Không dùng số lượt thao tác để suy ra mastery.</p></div><div class="ru-academic-source">${esc(item._source)} · ${esc(item.level||item.stage||'')}</div></header><div class="ru-academic-grid"><section class="ru-academic-card"><h4>Quy tắc đang mở</h4><p>${esc(item.core||item.why||item.rule||item.focus||'Nội dung lấy từ module ngữ pháp hiện tại.')}</p><div class="ru-academic-meta">${metaChips([`${exampleCount} ví dụ`,`${practiceCount} bài luyện`,item.track||item.stage])}</div><div class="ru-academic-actions"><button data-ru-academic="grammar-rule">Đã đọc quy tắc</button><button data-ru-academic="grammar-examples">Đã xem ví dụ</button><button class="danger" data-ru-academic="grammar-flag">Cần ôn mục này</button></div></section><section class="ru-academic-card"><h4>Tự tạo câu</h4><p>Viết một câu của chính bạn có dùng cấu trúc đang học. Chỉ ghi nhận câu có Cyrillic.</p><div class="ru-academic-input"><input id="ruAcademicGrammarSentence" type="text" placeholder="Напишите своё предложение..."><button data-ru-academic="grammar-sentence">Lưu câu</button></div><div class="ru-academic-stats"><span><b>${row.ruleReads}</b><small>đọc quy tắc</small></span><span><b>${row.exampleReviews}</b><small>xem ví dụ</small></span><span><b>${row.ownSentences}</b><small>câu tự tạo</small></span><span><b>${row.flagged}</b><small>lần cần ôn</small></span></div></section></div>`;
  }
  function renderReading(core){
    const meta=readingMeta(core), id=lessonId(core);if(!id)return '';
    const slide=Math.max(0,Number(core.slide)||0), key=`${id}:slide:${slide}`, row=readingRow(key), russianKeywords=(Array.isArray(meta?.keywords)?meta.keywords:[]).map(clean).filter(x=>CYR.test(x)).slice(0,12), checked=new Set(row.checkedKeywords||[]);
    const words=russianKeywords.length?russianKeywords.map(w=>`<button class="ru-academic-keyword ${checked.has(w)?'checked':''}" data-ru-academic-keyword="${esc(w)}">${esc(w)}</button>`).join(''):'<span class="ru-academic-source">Chỉ mục hiện không có từ khóa Cyrillic riêng cho bài này.</span>';
    return `<header><div><span>READING BRIDGE · ${esc(id)}</span><h3>${esc(meta?.title||'Đọc nội dung bài hiện tại')}</h3><p>Đọc trực tiếp nội dung của lesson/slide đang mở. Từ khóa bên dưới lấy từ knowledge-index của repo; không phải danh sách chính thức bên ngoài repo.</p></div><div class="ru-academic-source">Slide ${slide+1} · lesson-linked</div></header><div class="ru-academic-grid"><section class="ru-academic-card"><h4>Đọc kỹ, không tự chấm hiểu</h4><p>${esc(meta?.summary||'Đọc nội dung trên slide, xác định ý chính và thuật ngữ cần tra.')}</p><div class="ru-academic-actions"><button data-ru-academic="reading-mark">Đã đọc kỹ slide này</button><button class="danger" data-ru-academic="reading-flag">Cần đọc lại</button><button data-ru-academic="open-writing">Mở bài viết cùng giai đoạn</button></div></section><section class="ru-academic-card"><h4>Từ khóa học thuật/kỹ thuật trong chỉ mục</h4><p>Bấm vào từ sau khi bạn đã tự tra hoặc xác định được vai trò của nó trong ngữ cảnh.</p><div class="ru-academic-keywords">${words}</div><div class="ru-academic-stats"><span><b>${row.reads}</b><small>lượt tự đánh dấu đọc</small></span><span><b>${checked.size}</b><small>từ khóa đã tra</small></span><span><b>${row.flagged}</b><small>lần cần đọc lại</small></span><span><b>${russianKeywords.length}</b><small>từ khóa nguồn</small></span></div></section></div>`;
  }
  function renderWriting(core){
    const {item}=activeWriting(core);if(!item)return '';
    const id=clean(item.id)||clean(item.title), row=writingRow(id), draft=currentDraft(), words=wordCount(draft), target=Number(item.target_words)||0, rub=Array.isArray(item.rubric)?item.rubric:[], checked=new Set(row.rubricChecked||[]), rewrites=(row.snapshots||[]).filter(x=>x.kind==='rewrite').length;
    const rubric=rub.slice(0,8).map((x,i)=>`<button class="${checked.has(i)?'checked':''}" data-ru-academic-rubric="${i}">${checked.has(i)?'✓ ':''}${esc(x)}</button>`).join('');
    return `<header><div><span>WRITING LAB · STAGE SUPPORT</span><h3>${esc(item.title||id)}</h3><p>Nhiệm vụ lấy trực tiếp từ writing.json theo giai đoạn. Snapshot và checklist là bằng chứng thao tác; không phải điểm hay xác nhận đạt chuẩn.</p></div><div class="ru-academic-source">${esc(item.mode||'writing')} · ${esc(item.stage||core.stage||'')}</div></header><div class="ru-academic-grid"><section class="ru-academic-card"><h4>Nhiệm vụ & cấu trúc</h4><p>${esc(item.purpose||item.prompt_vi||'Viết theo nhiệm vụ hiện tại.')}</p><div class="ru-academic-meta">${metaChips([target?`Mục tiêu ${target} từ`:'',Number(item.time_minutes)?`${item.time_minutes} phút`:'',Array.isArray(item.required_patterns)?`${item.required_patterns.length} mẫu bắt buộc`:''])}</div><div class="ru-academic-actions"><button data-ru-academic="writing-draft">Ghi nhận bản 1</button><button data-ru-academic="writing-review">Đã tự soát</button><button data-ru-academic="writing-rewrite">Ghi nhận bản viết lại</button><button class="danger" data-ru-academic="writing-flag">Cần ôn bài này</button></div></section><section class="ru-academic-card"><h4>Checklist rubric do người học tự đánh dấu</h4><p>Không cộng thành điểm. Dùng checklist để biết phần nào bạn đã tự kiểm tra.</p><div class="ru-academic-rubric">${rubric||'<span class="ru-academic-source">Nhiệm vụ này chưa có rubric.</span>'}</div><div class="ru-academic-stats"><span><b>${words}${target?`/${target}`:''}</b><small>từ hiện tại/mục tiêu</small></span><span><b>${(row.snapshots||[]).length}</b><small>snapshot</small></span><span><b>${rewrites}</b><small>bản viết lại</small></span><span><b>${checked.size}</b><small>mục tự kiểm</small></span></div></section></div>`;
  }
  function render(){
    const view=document.getElementById('view');if(!view||!ready)return;const core=readCore();let html='';
    if(core.view==='grammar')html=renderGrammar(core);
    else if(core.view==='learning'&&core.learnTab==='theory')html=renderReading(core);
    else if(core.view==='writing'&&core.writingMode==='academic')html=renderWriting(core);
    let panel=document.getElementById('ruAcademicBridge');if(!html){panel?.remove();return;}
    if(!panel){panel=document.createElement('section');panel.id='ruAcademicBridge';panel.className='ru-academic-bridge';const flow=document.getElementById('ruLessonFlow');if(flow)flow.after(panel);else view.prepend(panel);}
    panel.innerHTML=html+(notice?`<div class="ru-academic-note">${esc(notice)}</div>`:'');
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-ru-academic]')?.dataset.ruAcademic;
    if(action){event.preventDefault();event.stopPropagation();if(action==='grammar-rule')bumpGrammar('ruleReads');else if(action==='grammar-examples')bumpGrammar('exampleReviews');else if(action==='grammar-sentence')saveGrammarSentence();else if(action==='grammar-flag')flagGrammar();else if(action==='reading-mark')markReading();else if(action==='reading-flag')flagReading();else if(action==='open-writing')openStageWriting();else if(action==='writing-draft')snapshotWriting('draft');else if(action==='writing-review')selfReviewWriting();else if(action==='writing-rewrite')snapshotWriting('rewrite');else if(action==='writing-flag')flagWriting();return;}
    const keyword=event.target.closest?.('[data-ru-academic-keyword]')?.dataset.ruAcademicKeyword;if(keyword){event.preventDefault();toggleKeyword(keyword);return;}
    const rub=event.target.closest?.('[data-ru-academic-rubric]')?.dataset.ruAcademicRubric;if(rub!==undefined){event.preventDefault();toggleRubric(Number(rub));return;}
    setTimeout(scheduleRender,0);
  },true);
  document.addEventListener('input',event=>{if(event.target?.dataset?.input==='writingDraft')setTimeout(scheduleRender,0);},true);
  document.addEventListener('change',()=>setTimeout(scheduleRender,20),true);
  document.addEventListener('DOMContentLoaded',async()=>{
    try{const [g,gp,w,k]=await Promise.all(['grammar','grammar-path','writing','knowledge-index'].map(name=>fetch(`data/${name}.json`,{cache:'force-cache'}).then(r=>r.ok?r.json():[])));grammar=Array.isArray(g)?g:[];grammarPath=Array.isArray(gp)?gp:[];writing=Array.isArray(w)?w:[];knowledge=Array.isArray(k)?k:[];}catch(e){console.warn('Russian academic language data load failed',e);}
    ready=true;scheduleRender();const view=document.getElementById('view');if(view)new MutationObserver(scheduleRender).observe(view,{childList:true,subtree:true});
  });
  window.addEventListener('russian:learning-state',scheduleRender);
  window.RussianAcademicLanguage={schema:SCHEMA,get:()=>JSON.parse(JSON.stringify(state)),activeGrammar,activeWriting,readingMeta};
})();
