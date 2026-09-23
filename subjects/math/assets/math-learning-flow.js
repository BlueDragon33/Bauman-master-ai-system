/* Bauman Math Learning Flow V1
 * Orchestrates existing E129/Workspace/Navigation surfaces.
 * Local-only notes/bookmarks/progress. No academic JSON writes. No MutationObserver.
 */
(function mathLearningFlow(global){
  'use strict';
  const RELEASE='MATH_LEARNING_FLOW_V1_1';
  const STATE_KEY='bauman_math_learning_flow_v1';
  const NOTES_KEY='bauman_math_learning_notes_v1';
  const BOOKMARK_KEY='bauman_math_learning_bookmarks_v1';
  let timer=0,lastLesson='';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STEPS=[
    {id:'theory',label:'Lý thuyết',sub:'Đọc hiểu',kind:'reader',roles:['problem_framing','deep_essence','notation','core_formula','assumption_gate','interpretation','bridge','takeaway']},
    {id:'formula',label:'Công thức',sub:'Ký hiệu & điều kiện',kind:'formula',roles:['notation','core_formula','assumption_gate']},
    {id:'example',label:'Ví dụ',sub:'Derivation',kind:'slide',roles:['mini_case','worked_example','example','derivation']},
    {id:'practice',label:'Bài tập',sub:'Tự giải',kind:'route',route:'exercises',roles:['practice']},
    {id:'lab',label:'Mô phỏng',sub:'Quan sát',kind:'lab',roles:['simulation']},
    {id:'application',label:'Ứng dụng',sub:'Kỹ thuật',kind:'route',route:'application',roles:['application','real_bridge']},
    {id:'professor',label:'Vấn đáp',sub:'Professor Q&A',kind:'slide',roles:['professor_qa','retrieval']},
    {id:'review',label:'Ôn tập',sub:'Hệ thống hóa',kind:'route',route:'review',roles:['summary','takeaway']},
    {id:'exam',label:'Kiểm tra',sub:'Đánh giá',kind:'route',route:'exam',roles:['assessment','exam']}
  ];

  function jsonGet(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
  function jsonSet(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}}
  function allState(){return jsonGet(STATE_KEY,{})}
  function saveState(value){jsonSet(STATE_KEY,value)}
  function notes(){return jsonGet(NOTES_KEY,{})}
  function saveNotes(value){jsonSet(NOTES_KEY,value)}
  function bookmarks(){return jsonGet(BOOKMARK_KEY,[])}
  function saveBookmarks(value){jsonSet(BOOKMARK_KEY,value.slice(0,100))}

  function currentLesson(){
    const host=$('[data-current-lesson]');
    const id=host?.getAttribute('data-current-lesson')||global.__MATH_STATE?.e129LessonId||'';
    const title=(host?.querySelector('.e169-reader-title h2,h2')||$('.e169-reader-title h2')||$('.e129-placeholder h2'))?.textContent?.trim()||'Lý thuyết Toán Bauman';
    return {id,title,host};
  }
  function records(){
    const raw=global.DB?.theory_lecture_content;
    if(Array.isArray(raw)) return raw;
    if(Array.isArray(raw?.records)) return raw.records;
    if(Array.isArray(raw?.lessons)) return raw.lessons;
    if(Array.isArray(raw?.items)) return raw.items;
    return [];
  }
  function currentRecord(){const cur=currentLesson();return records().find(r=>(r.lessonId||r.id)===cur.id)||null}
  function slides(){return $$('.e129-slide').filter(x=>x.offsetParent!==null)}
  function roleIndexMap(){
    const rec=currentRecord(), map={};
    (rec?.slides||[]).forEach((s,i)=>{const role=String(s?.role||'').toLowerCase(); if(role&&map[role]==null)map[role]=i;});
    return map;
  }
  function findSlideByRoles(roles){
    const map=roleIndexMap(), dom=slides();
    for(const role of roles){if(Number.isInteger(map[role])&&dom[map[role]])return dom[map[role]];}
    const words=roles.map(x=>x.replace(/_/g,' '));
    return dom.find(el=>{const t=(el.textContent||'').toLowerCase();return words.some(w=>t.includes(w));})||null;
  }
  function available(step){
    if(['reader','route','lab','formula'].includes(step.kind)) return true;
    return !!findSlideByRoles(step.roles||[]);
  }
  function lessonState(id){const all=allState();return all[id]||{active:'theory',visited:{theory:true},lastAt:0}}
  function writeLessonState(id,patch){
    if(!id)return;const all=allState(),current=lessonState(id);all[id]={...current,...patch,visited:{...(current.visited||{}),...(patch.visited||{})},lastAt:Date.now()};saveState(all);
  }
  function isBookmarked(id){return bookmarks().some(x=>x.id===id)}
  function toggleBookmark(){
    const cur=currentLesson();if(!cur.id)return;let list=bookmarks().filter(x=>x.id!==cur.id);const existed=isBookmarked(cur.id);if(!existed)list.unshift({id:cur.id,title:cur.title,at:Date.now()});saveBookmarks(list);refresh();global.BAUMAN_MATH_STUDY_LIBRARY?.refresh?.();toast(existed?'Đã bỏ đánh dấu bài học':'Đã đánh dấu bài học');
  }
  function toast(message){const el=$('#mathWsToast');if(el){el.textContent=message;el.style.opacity='1';clearTimeout(el._timer);el._timer=setTimeout(()=>el.style.opacity='0',1600)}else console.info('[Math Learning Flow]',message)}

  function suggestLabMode(){
    const rec=currentRecord(), cur=currentLesson();
    const text=[cur.title,rec?.title,rec?.lessonTitle,rec?.chapterId,(rec?.tags||[]).join(' ')].filter(Boolean).join(' ').toLocaleLowerCase('vi');
    if(/ma trận|matrix|pca|svd|eigen|hiệp phương sai|covariance|linear map|ánh xạ tuyến tính/.test(text))return'matrix';
    if(/vector|vectơ|projection|cosine|dot product|tích vô hướng/.test(text))return'vector';
    return'function';
  }
  function openContextLab(){
    const mode=suggestLabMode();global.BAUMAN_MATH_WORKSPACE?.openLab?.();setTimeout(()=>document.querySelector(`[data-lab-mode="${mode}"]`)?.click(),55);return mode;
  }

  function ensure(){
    const main=$('.main'),view=$('#view');if(!main||!view)return;
    let host=$('#mathLearningFlow');
    if(!host){host=document.createElement('section');host.id='mathLearningFlow';main.insertBefore(host,view);}
    let bar=$('#mathLearningStudybar');
    if(!bar){bar=document.createElement('section');bar.id='mathLearningStudybar';bar.className='math-lf-studybar';document.body.appendChild(bar);}
  }

  function render(){
    ensure();const host=$('#mathLearningFlow'),bar=$('#mathLearningStudybar'),cur=currentLesson();
    const activeLesson=!!cur.id&&!!cur.host&&!document.body.classList.contains('e129-theory-storage');
    document.body.classList.toggle('math-learning-flow-active',activeLesson);
    if(!activeLesson){if(host)host.innerHTML='';if(bar)bar.innerHTML='';return;}
    const st=lessonState(cur.id),visited=st.visited||{},active=STEPS.some(x=>x.id===st.active)?st.active:'theory',visitedCount=STEPS.filter(x=>visited[x.id]).length,pct=Math.round(visitedCount/STEPS.length*100),noteMap=notes();
    const note=noteMap[cur.id]||'',labMode=suggestLabMode();
    host.innerHTML=`<section class="math-lf-shell">
      <header class="math-lf-head"><div class="math-lf-title"><span class="math-lf-badge">∑</span><div class="math-lf-title-copy"><small>Learning Flow · ${visitedCount}/${STEPS.length} bước đã mở</small><h3>${esc(cur.title)}</h3></div></div><div class="math-lf-head-actions"><button type="button" data-lf="bookmark" class="${isBookmarked(cur.id)?'active':''}">${isBookmarked(cur.id)?'★ Đã lưu':'☆ Đánh dấu'}</button><button type="button" data-lf="notes">✎ Ghi chú</button><button type="button" data-lf="focus">⛶ Tập trung</button><button type="button" data-lf="control">☷ Nội dung</button></div></header>
      <div class="math-lf-progress"><i style="width:${pct}%"></i></div>
      <div class="math-lf-steps">${STEPS.map((x,i)=>`<button type="button" class="math-lf-step ${x.id===active?'active':''} ${visited[x.id]?'visited':''} ${available(x)?'':'unavailable'}" data-lf-step="${x.id}"><span class="math-lf-no">${String(i+1).padStart(2,'0')}</span><span><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span></button>`).join('')}</div>
      <div class="math-lf-context"><div class="math-lf-context-left"><b>${esc(cur.id)}</b><span>${currentRecord()?.chapterId?`chapterId: ${esc(currentRecord().chapterId)}`:'Reader E129 · local study state only'}</span></div><div class="math-lf-context-right"><button class="math-lf-mini-btn" data-lf="formula">∑ Công thức</button><button class="math-lf-mini-btn" data-lf="lab">∿ Lab · ${esc(labMode)}</button><button class="math-lf-mini-btn" data-lf="command">⌘K Lệnh nhanh</button></div></div>
      <div class="math-lf-notes ${st.notesOpen?'open':''}"><div class="math-lf-note-box"><label>Ghi chú cá nhân của bài này</label><textarea id="mathLfNote" placeholder="Ghi lại câu hỏi, cách hiểu, công thức cần nhớ…">${esc(note)}</textarea></div><aside class="math-lf-note-side"><b>Ghi chú chỉ lưu trên thiết bị</b><p>Không chèn vào theory_lecture_content, không làm thay đổi bài giảng và không đồng bộ thành dữ liệu học thuật.</p><p class="math-lf-note-status">Tự lưu khi nhập.</p></aside></div>
    </section>`;
    const idx=Math.max(0,STEPS.findIndex(x=>x.id===active)),prev=STEPS[Math.max(0,idx-1)],next=STEPS[Math.min(STEPS.length-1,idx+1)];
    bar.innerHTML=`<div class="math-lf-study-buttons"><button type="button" data-lf-step="${prev.id}" ${idx===0?'disabled':''}>← <span>${esc(prev.label)}</span></button></div><div class="math-lf-study-current"><small>Bước ${idx+1}/${STEPS.length} · ${pct}% đã mở</small><b>${esc(STEPS[idx].label)} · ${esc(cur.title)}</b></div><div class="math-lf-study-buttons"><button type="button" class="primary" data-lf-step="${next.id}" ${idx===STEPS.length-1?'disabled':''}><span>${esc(next.label)}</span> →</button></div>`;
    $('#mathLfNote')?.addEventListener('input',e=>{const map=notes();map[cur.id]=e.target.value;saveNotes(map);global.BAUMAN_MATH_STUDY_LIBRARY?.refresh?.()});
  }

  function clearHighlights(){slides().forEach(x=>x.classList.remove('math-lf-highlight'))}
  function highlight(el){if(!el)return false;clearHighlights();el.classList.add('math-lf-highlight');el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el.classList.remove('math-lf-highlight'),2600);return true}
  function mark(stepId){const cur=currentLesson();if(!cur.id)return;writeLessonState(cur.id,{active:stepId,visited:{[stepId]:true}})}
  function activate(stepId){
    const step=STEPS.find(x=>x.id===stepId);if(!step)return;mark(stepId);render();
    if(step.kind==='reader'){currentLesson().host?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(step.kind==='formula'){global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.();return;}
    if(step.kind==='lab'){openContextLab();return;}
    if(step.kind==='route'){global.BAUMAN_MATH_NAVIGATION?.route?.(step.route);schedule(260);return;}
    const hit=findSlideByRoles(step.roles||[]);if(!highlight(hit)){toast(`Chưa có slide ${step.label} riêng trong bài này`);global.BAUMAN_MATH_WORKSPACE?.openControl?.();}
  }
  function toggleNotes(){const cur=currentLesson();if(!cur.id)return;const st=lessonState(cur.id);writeLessonState(cur.id,{notesOpen:!st.notesOpen});render();setTimeout(()=>$('#mathLfNote')?.focus(),30)}
  function toggleFocus(){const btn=$('[data-math-ws="focus"]');if(btn){btn.click();toast(document.body.classList.contains('math-ws-focus')?'Đã bật chế độ tập trung':'Đã đổi chế độ tập trung')}else document.body.classList.toggle('math-ws-focus')}

  function bind(){
    document.addEventListener('click',e=>{
      const step=e.target.closest('[data-lf-step]');if(step){e.preventDefault();activate(step.dataset.lfStep);return;}
      const action=e.target.closest('[data-lf]')?.dataset.lf;if(action){e.preventDefault();if(action==='bookmark')toggleBookmark();if(action==='notes')toggleNotes();if(action==='focus')toggleFocus();if(action==='control')global.BAUMAN_MATH_WORKSPACE?.openControl?.();if(action==='formula')global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.();if(action==='lab')openContextLab();if(action==='command')global.BAUMAN_MATH_NAVIGATION?.openCommand?.();return;}
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e129-nav],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-refresh]'))schedule(220);
    },true);
    document.addEventListener('keydown',e=>{
      if(e.target&&/input|textarea|select/i.test(e.target.tagName))return;
      if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();const st=lessonState(currentLesson().id),i=Math.max(0,STEPS.findIndex(x=>x.id===st.active));activate(STEPS[Math.min(STEPS.length-1,i+1)].id)}
      if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();const st=lessonState(currentLesson().id),i=Math.max(0,STEPS.findIndex(x=>x.id===st.active));activate(STEPS[Math.max(0,i-1)].id)}
      if(e.key.toLowerCase()==='b'&&e.shiftKey){e.preventDefault();toggleBookmark()}
      if(e.key.toLowerCase()==='n'&&e.shiftKey){e.preventDefault();toggleNotes()}
    });
  }
  function schedule(ms=140){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function refresh(){ensure();const cur=currentLesson();if(cur.id!==lastLesson){lastLesson=cur.id;if(cur.id)writeLessonState(cur.id,{visited:{theory:true}})}render()}
  function snapshot(){
    const cur=currentLesson(),rec=currentRecord(),st=cur.id?lessonState(cur.id):{active:'theory',visited:{}};
    const visited=st.visited||{},visitedCount=STEPS.filter(x=>visited[x.id]).length;
    const activeIndex=Math.max(0,STEPS.findIndex(x=>x.id===st.active));
    return {
      lessonId:cur.id||null,
      lessonTitle:cur.title,
      chapterId:rec?.chapterId||null,
      activeStep:STEPS[activeIndex]?.id||'theory',
      activeStepLabel:STEPS[activeIndex]?.label||'Lý thuyết',
      activeStepIndex:activeIndex+1,
      visitedCount,
      totalSteps:STEPS.length,
      percent:Math.round(visitedCount/STEPS.length*100),
      lastAt:Number(st.lastAt||0)
    };
  }
  function chapterSnapshot(lessonIds){
    const ids=Array.isArray(lessonIds)?lessonIds.filter(Boolean):[];
    if(!ids.length) return {lessonCount:0,startedLessons:0,visitedSteps:0,totalSteps:0,percent:0,status:'empty'};
    const all=allState();
    let startedLessons=0,visitedSteps=0;
    ids.forEach(id=>{
      const st=all[id];
      if(!st) return;
      const count=STEPS.filter(x=>st.visited?.[x.id]).length;
      if(count>0) startedLessons++;
      visitedSteps+=count;
    });
    const totalSteps=ids.length*STEPS.length;
    return {
      lessonCount:ids.length,
      startedLessons,
      visitedSteps,
      totalSteps,
      percent:totalSteps?Math.round(visitedSteps/totalSteps*100):0,
      status:startedLessons>0?'started':'not_started'
    };
  }
  function selfCheck(){const cur=currentLesson();return{release:RELEASE,ready:!!$('#mathLearningFlow'),active:document.body.classList.contains('math-learning-flow-active'),lessonId:cur.id||null,steps:STEPS.length,recommendedLabMode:suggestLabMode(),notesLocalOnly:true,bookmarksLocalOnly:true,academicWrites:false,mutationObserver:false,routeEngineReplacement:false}}
  function init(){if(!document.body||document.body.dataset.mathLearningFlow==='1')return;document.body.dataset.mathLearningFlow='1';bind();refresh();[350,850,1600,2800].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_LEARNING_FLOW={release:RELEASE,refresh,activate,toggleBookmark,toggleNotes,openContextLab,snapshot,chapterSnapshot,selfCheck};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
