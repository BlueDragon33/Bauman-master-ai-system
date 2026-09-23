/* Bauman Math Study Library V1
 * Local learner state only. Opens existing E129 lessons through existing state/render APIs.
 */
(function mathStudyLibrary(global){
  'use strict';
  const RELEASE='MATH_STUDY_LIBRARY_V1';
  const BOOKMARK_KEY='bauman_math_learning_bookmarks_v1';
  const NOTES_KEY='bauman_math_learning_notes_v1';
  const VISIT_KEY='bauman_math_dashboard_visits_v1';
  let timer=0,lastFocus=null;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=120)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;};
  function get(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
  function set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}}
  function bookmarks(){return get(BOOKMARK_KEY,[])} function notes(){return get(NOTES_KEY,{})} function visits(){return get(VISIT_KEY,[])}
  function recordsOf(raw){if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;if(Array.isArray(raw?.lessons))return raw.lessons;return[]}
  function records(){return recordsOf(global.DB?.theory_lecture_content)}
  function findRecord(id){return records().find(r=>(r.lessonId||r.id)===id)||null}
  function contextForRecord(rec){
    const anchor=rec?.sourceAnchors||{};
    const chapterId=String(rec?.chapterId||anchor.chapterId||'');
    const stageId=String(anchor.stageId||'');
    const disciplineId=String(anchor.disciplineId||'');
    const chapters=recordsOf(global.DB?.chapter_spine);
    const disciplines=recordsOf(global.DB?.discipline_spine?.disciplines||global.DB?.discipline_spine);
    const curriculum=global.DB?.curriculum;
    const stages=Array.isArray(curriculum?.stages)?curriculum.stages:[];
    const chapter=chapters.find(x=>String(x.chapterId||x.id||'')===chapterId);
    const discipline=disciplines.find(x=>String(x.id||x.disciplineId||'')===(disciplineId||String(chapter?.disciplineId||'')));
    const stage=stages.find(x=>String(x.id||'')===(stageId||String(chapter?.stageId||'')));
    return{
      stageId:stageId||String(chapter?.stageId||''),
      stageTitle:String(stage?.title||chapter?.stageTitle||stageId||'Giai đoạn'),
      disciplineId:disciplineId||String(chapter?.disciplineId||''),
      disciplineTitle:String(discipline?.title||chapter?.disciplineTitle||disciplineId||'Phân môn'),
      chapterId,
      chapterTitle:String(chapter?.chapterTitle||chapter?.chapterName||chapterId||'Chương')
    };
  }
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||null}
  function saveState(){try{global.__BAUMAN_CORE_API?.save?.()}catch(_){}}

  function ensure(){
    if(!$('#mathStudyLibrary')){
      const layer=document.createElement('section');layer.id='mathStudyLibrary';layer.className='math-study-library';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','mathStudyTitle');layer.setAttribute('aria-hidden','true');
      layer.innerHTML='<div class="math-study-shell"><header class="math-study-head"><div><small>Resource Drawer</small><h2 id="mathStudyTitle">Tài nguyên học tập</h2><p>Tìm toàn môn, mở tài nguyên theo bài, bookmark, ghi chú và lịch sử học.</p></div><div class="math-study-head-actions"><button type="button" data-study-action="export">Export JSON</button><button type="button" data-study-action="close">Đóng ×</button></div></header><div class="math-study-toolbar"><input id="mathStudySearch" class="math-study-search" type="search" aria-label="Tìm kiếm tài nguyên toàn môn" placeholder="Tìm PCA, ma trận nghịch đảo, công thức covariance, bài tập…"><div class="math-study-stats"><div class="math-study-stat"><b id="mathStudyBookmarkCount">0</b><span>Đã lưu</span></div><div class="math-study-stat"><b id="mathStudyNoteCount">0</b><span>Ghi chú</span></div><div class="math-study-stat"><b id="mathStudyRecentCount">0</b><span>Gần đây</span></div></div></div><div id="mathStudyBody" class="math-study-body"></div></div>';
      document.body.appendChild(layer);
      layer.addEventListener('click',e=>{if(e.target===layer)close()});
      $('#mathStudySearch')?.addEventListener('input',render);
    }
    ensureNavButton();
  }

  function ensureNavButton(){
    // L17: Resource Drawer is contextual/advanced, never a sixth primary navigation item.
    $('#mathStudyNav')?.remove();
  }

  function itemHtml(item,kind,note){
    const id=item.id||item.lessonId||'',title=item.title||findRecord(id)?.title||id||'Bài học';
    return `<div class="math-study-item" data-study-row="${esc(id)}"><div class="math-study-item-copy"><b>${esc(clip(title,100))}</b><span>${esc(id)}${item.at?` · ${timeAgo(item.at)}`:''}</span>${note?`<span class="math-study-note-preview">${esc(clip(note,180))}</span>`:''}</div><div class="math-study-item-actions"><button type="button" class="primary" data-study-open="${esc(id)}">Mở</button>${kind==='bookmark'?`<button type="button" class="danger" data-study-remove-bookmark="${esc(id)}">Bỏ lưu</button>`:''}${kind==='note'?`<button type="button" class="danger" data-study-clear-note="${esc(id)}">Xóa note</button>`:''}</div></div>`;
  }
  function currentRecord(){
    const id=String(state()?.e169Path?.lessonId||state()?.e129LessonId||'');
    return findRecord(id);
  }
  function textFromBlock(block){
    return [block?.title,block?.body,block?.content,block?.text,block?.formula].filter(Boolean).join(' ');
  }
  function searchIndex(query){
    const q=String(query||'').toLocaleLowerCase('vi').trim();
    const groups={lesson:[],concept:[],formula:[],exercise:[],simulation:[]};
    if(!q)return groups;
    records().forEach(rec=>{
      const lessonId=String(rec.lessonId||rec.id||''),lessonTitle=String(rec.title||rec.lessonTitle||lessonId),ctx=contextForRecord(rec),chapterId=ctx.chapterId;
      const lessonText=[lessonId,lessonTitle,ctx.stageTitle,ctx.disciplineTitle,ctx.chapterTitle,chapterId,(rec.tags||[]).join(' ')].join(' ').toLocaleLowerCase('vi');
      const context={...ctx,lessonId,lessonTitle};
      if(lessonText.includes(q))groups.lesson.push({...context,title:lessonTitle,snippet:'Bài học'});
      (rec.slides||[]).forEach((slide,si)=>{
        const role=String(slide?.role||'').toLowerCase();
        const slideText=[slide?.title,(slide?.blocks||[]).map(textFromBlock).join(' ')].filter(Boolean).join(' ');
        if(!slideText.toLocaleLowerCase('vi').includes(q))return;
        const base={...context,title:String(slide?.title||lessonTitle),snippet:clip(slideText,150),slideIndex:si};
        if(role==='simulation')groups.simulation.push(base);
        else if(role==='practice')groups.exercise.push(base);
        else groups.concept.push(base);
        (slide?.blocks||[]).forEach((block,bi)=>{
          const type=String(block?.type||'').toLowerCase();
          const blockText=textFromBlock(block);
          if((type==='formula'||role==='core_formula'||role==='assumption_gate')&&blockText.toLocaleLowerCase('vi').includes(q)){
            groups.formula.push({...base,title:String(block?.title||slide?.title||'Công thức'),snippet:clip(blockText,150),blockIndex:bi});
          }
        });
      });
    });
    Object.keys(groups).forEach(k=>groups[k]=groups[k].slice(0,8));
    return groups;
  }
  function searchGroupHtml(title,items,kind){
    if(!items.length)return'';
    return `<section class="math-study-section wide"><div class="math-study-section-head"><h3>${esc(title)}</h3><span>${items.length}</span></div><div class="math-study-list">${items.map(item=>`<div class="math-study-item"><div class="math-study-item-copy"><b>${esc(item.title)}</b><span>${esc(item.stageTitle||item.stageId||'Giai đoạn')} → ${esc(item.disciplineTitle||item.disciplineId||'Phân môn')} → ${esc(item.chapterTitle||item.chapterId||'Chương')} → ${esc(item.lessonTitle||item.title)}</span><span class="math-study-note-preview">${esc(item.snippet||kind)}</span></div><div class="math-study-item-actions"><button type="button" class="primary" data-study-open="${esc(item.lessonId)}">Mở bài</button></div></div>`).join('')}</div></section>`;
  }
  function searchResultsHtml(query){
    const groups=searchIndex(query);
    const total=Object.values(groups).reduce((n,list)=>n+list.length,0);
    if(!total)return '<section class="math-study-section wide"><div class="math-study-empty">Không tìm thấy kết quả trong nguồn học liệu hiện đang được nạp.</div></section>';
    return searchGroupHtml('Bài học',groups.lesson,'lesson')+
      searchGroupHtml('Khái niệm',groups.concept,'concept')+
      searchGroupHtml('Công thức',groups.formula,'formula')+
      searchGroupHtml('Bài tập',groups.exercise,'exercise')+
      searchGroupHtml('Mô phỏng',groups.simulation,'simulation');
  }
  function contextualResourcesHtml(){
    const rec=currentRecord();
    if(!rec)return '<section class="math-study-section wide"><div class="math-study-empty">Mở một bài học để xem tài nguyên theo ngữ cảnh.</div></section>';
    const roles=new Set((rec.slides||[]).map(x=>String(x?.role||'').toLowerCase()));
    const hasFormula=(rec.slides||[]).some(s=>String(s?.role||'').toLowerCase()==='core_formula'||(s.blocks||[]).some(b=>String(b?.type||'').toLowerCase()==='formula'));
    return `<section class="math-study-section wide math-study-context"><div class="math-study-section-head"><h3>Tài nguyên bài hiện tại</h3><span>${esc(rec.title||rec.lessonTitle||rec.lessonId)}</span></div><div class="math-study-resource-actions">
      ${hasFormula?'<button type="button" data-study-resource="formula">∑ Công thức</button>':''}
      ${roles.has('simulation')?'<button type="button" data-study-resource="simulation">∿ Mô phỏng trong bài</button>':''}
      <button type="button" data-study-resource="notes">✎ Ghi chú</button>
      <button type="button" data-study-resource="review">↺ Ôn điểm yếu</button>
    </div></section>`;
  }

  function render(){
    ensure();const query=($('#mathStudySearch')?.value||'').toLocaleLowerCase('vi').trim();let bm=bookmarks(),nt=notes(),rc=visits();
    const match=(id,title,note='')=>!query||`${id} ${title} ${note}`.toLocaleLowerCase('vi').includes(query);
    bm=bm.filter(x=>match(x.id,x.title));
    const noteEntries=Object.entries(nt).filter(([id,note])=>String(note||'').trim()&&match(id,findRecord(id)?.title||id,note));
    rc=rc.filter(x=>match(x.id,x.title)).slice(0,12);
    if($('#mathStudyBookmarkCount'))$('#mathStudyBookmarkCount').textContent=String(bookmarks().length);
    if($('#mathStudyNoteCount'))$('#mathStudyNoteCount').textContent=String(Object.values(nt).filter(x=>String(x||'').trim()).length);
    if($('#mathStudyRecentCount'))$('#mathStudyRecentCount').textContent=String(visits().length);
    const body=$('#mathStudyBody');if(!body)return;
    body.innerHTML=query?searchResultsHtml(query):`
      ${contextualResourcesHtml()}
      <section class="math-study-section"><div class="math-study-section-head"><h3>★ Bài đã đánh dấu</h3><span>${bm.length}</span></div><div class="math-study-list">${bm.length?bm.map(x=>itemHtml(x,'bookmark','')).join(''):'<div class="math-study-empty">Chưa có bài nào được đánh dấu.</div>'}</div></section>
      <section class="math-study-section"><div class="math-study-section-head"><h3>✎ Ghi chú theo bài</h3><span>${noteEntries.length}</span></div><div class="math-study-list">${noteEntries.length?noteEntries.map(([id,note])=>itemHtml({id,title:findRecord(id)?.title||id},'note',note)).join(''):'<div class="math-study-empty">Chưa có ghi chú cá nhân.</div>'}</div></section>
      <section class="math-study-section wide"><div class="math-study-section-head"><h3>↺ Học gần đây</h3><span>${rc.length}</span></div><div class="math-study-list">${rc.length?rc.map(x=>itemHtml(x,'recent','')).join(''):'<div class="math-study-empty">Lịch sử sẽ xuất hiện khi bạn mở bài học.</div>'}</div></section>`;
  }
  function timeAgo(at){const d=Math.max(0,Date.now()-Number(at||0)),m=Math.floor(d/60000);if(m<1)return'vừa xong';if(m<60)return`${m} phút trước`;const h=Math.floor(m/60);if(h<24)return`${h} giờ trước`;return`${Math.floor(h/24)} ngày trước`;}
  function open(){
    ensure();render();lastFocus=document.activeElement;
    const layer=$('#mathStudyLibrary');layer?.classList.add('open');layer?.setAttribute('aria-hidden','false');
    setTimeout(()=>$('#mathStudySearch')?.focus(),30);
  }
  function openSearch(query=''){
    ensure();lastFocus=document.activeElement;
    const input=$('#mathStudySearch');
    if(input)input.value=String(query||'');
    render();
    const layer=$('#mathStudyLibrary');layer?.classList.add('open');layer?.setAttribute('aria-hidden','false');
    setTimeout(()=>$('#mathStudySearch')?.focus(),30);
  }
  function close(){
    const layer=$('#mathStudyLibrary');layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');
    if(lastFocus&&typeof lastFocus.focus==='function')setTimeout(()=>lastFocus.focus(),0);
    lastFocus=null;
  }
  function trapFocus(e){
    const layer=$('#mathStudyLibrary');
    if(e.key!=='Tab'||!layer?.classList.contains('open'))return false;
    const focusable=$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',layer).filter(x=>x.offsetParent!==null);
    if(!focusable.length)return false;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();return true}
    if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();return true}
    return false;
  }
  function openLesson(id){
    const rec=findRecord(id),st=state();if(!rec||!st){toast('Không tìm thấy lesson trong runtime hiện tại');return false;}
    st.view='learning';st.learnTab='theory';st.e129LessonId=id;if(rec.chapterId)st.e129ChapterId=rec.chapterId;
    if(st.e169Path&&typeof st.e169Path==='object'){st.e169Path.activityId='theory';st.e169Path.lessonId=id;}
    saveState();close();
    try{global.BAUMAN_MATH_THEORY_E129?.render?.();}catch(_){ }
    setTimeout(()=>{global.BAUMAN_MATH_READER_ROLE_MAP?.map?.();global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.();global.BAUMAN_MATH_PREMIUM?.refresh?.();$('[data-current-lesson]')?.scrollIntoView({behavior:'smooth',block:'start'});},220);
    return true;
  }
  function removeBookmark(id){set(BOOKMARK_KEY,bookmarks().filter(x=>x.id!==id));render();global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.()}
  function clearNote(id){const all=notes();delete all[id];set(NOTES_KEY,all);render();global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.()}
  function exportJson(){
    const payload={schema:'bauman_math_local_study_library_v1',exportedAt:new Date().toISOString(),bookmarks:bookmarks(),notes:notes(),recent:visits()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bauman_math_study_library_${Date.now()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},300);
  }
  function toast(message){const el=$('#mathWsToast');if(el){el.textContent=message;el.style.opacity='1';clearTimeout(el._timer);el._timer=setTimeout(()=>el.style.opacity='0',1600)}else console.info('[Study Library]',message)}
  function bind(){
    document.addEventListener('click',e=>{
      const resource=e.target.closest('[data-study-resource]')?.dataset.studyResource;
      if(resource){
        e.preventDefault();
        if(resource==='formula'){close();global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.();}
        if(resource==='simulation'){close();global.BAUMAN_MATH_SIMULATION_SOURCE?.openForCurrent?.();}
        if(resource==='notes'){close();global.BAUMAN_MATH_LEARNING_FLOW?.toggleNotes?.();}
        if(resource==='review'){close();global.BAUMAN_MATH_NAVIGATION?.route?.('review');}
        return;
      }
      const action=e.target.closest('[data-study-action]')?.dataset.studyAction;if(action){e.preventDefault();if(action==='open')open();if(action==='close')close();if(action==='export')exportJson();return;}
      const openId=e.target.closest('[data-study-open]')?.dataset.studyOpen;if(openId){e.preventDefault();openLesson(openId);return;}
      const remove=e.target.closest('[data-study-remove-bookmark]')?.dataset.studyRemoveBookmark;if(remove){e.preventDefault();removeBookmark(remove);return;}
      const note=e.target.closest('[data-study-clear-note]')?.dataset.studyClearNote;if(note){e.preventDefault();clearNote(note);return;}
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-math-nav]'))schedule(200);
    },true);
    document.addEventListener('keydown',e=>{if(trapFocus(e))return;if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='s'){e.preventDefault();open()}if(e.key==='Escape')close()});
  }
  function schedule(ms=150){clearTimeout(timer);timer=setTimeout(()=>{ensure();render()},ms)}
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathStudyLibrary'),primaryNavInjection:!!$('#mathStudyNav'),globalSearch:true,resourceDrawer:true,searchableLessons:records().length,bookmarks:bookmarks().length,notes:Object.values(notes()).filter(x=>String(x||'').trim()).length,localOnly:true,academicWrites:false,routeEngineReplacement:false}}
  function init(){if(!document.body||document.body.dataset.mathStudyLibrary==='1')return;document.body.dataset.mathStudyLibrary='1';bind();ensure();[300,750,1500,2600].forEach(ms=>setTimeout(ensure,ms));global.BAUMAN_MATH_STUDY_LIBRARY={release:RELEASE,open,openSearch,close,openLesson,searchIndex,refresh:render,selfCheck};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
