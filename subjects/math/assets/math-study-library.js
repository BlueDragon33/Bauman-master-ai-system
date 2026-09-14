/* Bauman Math Study Library V1
 * Local learner state only. Opens existing E129 lessons through existing state/render APIs.
 */
(function mathStudyLibrary(global){
  'use strict';
  const RELEASE='MATH_STUDY_LIBRARY_V1';
  const BOOKMARK_KEY='bauman_math_learning_bookmarks_v1';
  const NOTES_KEY='bauman_math_learning_notes_v1';
  const VISIT_KEY='bauman_math_dashboard_visits_v1';
  let timer=0;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=120)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;};
  function get(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
  function set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}}
  function bookmarks(){return get(BOOKMARK_KEY,[])} function notes(){return get(NOTES_KEY,{})} function visits(){return get(VISIT_KEY,[])}
  function records(){const x=global.DB?.theory_lecture_content;if(Array.isArray(x))return x;if(Array.isArray(x?.records))return x.records;if(Array.isArray(x?.lessons))return x.lessons;if(Array.isArray(x?.items))return x.items;return[]}
  function findRecord(id){return records().find(r=>(r.lessonId||r.id)===id)||null}
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||null}
  function saveState(){try{global.__BAUMAN_CORE_API?.save?.()}catch(_){}}

  function ensure(){
    if(!$('#mathStudyLibrary')){
      const layer=document.createElement('section');layer.id='mathStudyLibrary';layer.className='math-study-library';
      layer.innerHTML='<div class="math-study-shell"><header class="math-study-head"><div><small>Study Library</small><h2>Thư viện học tập cá nhân</h2><p>Bookmark, ghi chú và lịch sử học lưu cục bộ trên thiết bị.</p></div><div class="math-study-head-actions"><button type="button" data-study-action="export">Export JSON</button><button type="button" data-study-action="close">Đóng ×</button></div></header><div class="math-study-toolbar"><input id="mathStudySearch" class="math-study-search" type="search" placeholder="Tìm bài đã lưu, ghi chú, lessonId…"><div class="math-study-stats"><div class="math-study-stat"><b id="mathStudyBookmarkCount">0</b><span>Đã lưu</span></div><div class="math-study-stat"><b id="mathStudyNoteCount">0</b><span>Ghi chú</span></div><div class="math-study-stat"><b id="mathStudyRecentCount">0</b><span>Gần đây</span></div></div></div><div id="mathStudyBody" class="math-study-body"></div></div>';
      document.body.appendChild(layer);
      layer.addEventListener('click',e=>{if(e.target===layer)close()});
      $('#mathStudySearch')?.addEventListener('input',render);
    }
    ensureNavButton();
  }

  function ensureNavButton(){
    const root=$('#mathUnifiedNav');if(!root||$('#mathStudyNav',root))return;
    const section=document.createElement('section');section.className='math-unified-group';section.id='mathStudyNav';
    section.innerHTML='<div class="math-unified-label"><span>Cá nhân</span><span>1</span></div><button type="button" class="math-unified-nav-button math-study-nav-button" data-study-action="open"><i class="math-unified-icon">★</i><span class="math-unified-copy"><b>Đã lưu</b><small>Bookmark & ghi chú</small></span><span class="math-unified-tail">S</span></button>';
    root.appendChild(section);
  }

  function itemHtml(item,kind,note){
    const id=item.id||item.lessonId||'',title=item.title||findRecord(id)?.title||id||'Bài học';
    return `<div class="math-study-item" data-study-row="${esc(id)}"><div class="math-study-item-copy"><b>${esc(clip(title,100))}</b><span>${esc(id)}${item.at?` · ${timeAgo(item.at)}`:''}</span>${note?`<span class="math-study-note-preview">${esc(clip(note,180))}</span>`:''}</div><div class="math-study-item-actions"><button type="button" class="primary" data-study-open="${esc(id)}">Mở</button>${kind==='bookmark'?`<button type="button" class="danger" data-study-remove-bookmark="${esc(id)}">Bỏ lưu</button>`:''}${kind==='note'?`<button type="button" class="danger" data-study-clear-note="${esc(id)}">Xóa note</button>`:''}</div></div>`;
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
    body.innerHTML=`
      <section class="math-study-section"><div class="math-study-section-head"><h3>★ Bài đã đánh dấu</h3><span>${bm.length}</span></div><div class="math-study-list">${bm.length?bm.map(x=>itemHtml(x,'bookmark','')).join(''):'<div class="math-study-empty">Chưa có bài nào được đánh dấu.</div>'}</div></section>
      <section class="math-study-section"><div class="math-study-section-head"><h3>✎ Ghi chú theo bài</h3><span>${noteEntries.length}</span></div><div class="math-study-list">${noteEntries.length?noteEntries.map(([id,note])=>itemHtml({id,title:findRecord(id)?.title||id},'note',note)).join(''):'<div class="math-study-empty">Chưa có ghi chú cá nhân.</div>'}</div></section>
      <section class="math-study-section wide"><div class="math-study-section-head"><h3>↺ Học gần đây</h3><span>${rc.length}</span></div><div class="math-study-list">${rc.length?rc.map(x=>itemHtml(x,'recent','')).join(''):'<div class="math-study-empty">Lịch sử sẽ xuất hiện khi bạn mở bài học.</div>'}</div></section>`;
  }
  function timeAgo(at){const d=Math.max(0,Date.now()-Number(at||0)),m=Math.floor(d/60000);if(m<1)return'vừa xong';if(m<60)return`${m} phút trước`;const h=Math.floor(m/60);if(h<24)return`${h} giờ trước`;return`${Math.floor(h/24)} ngày trước`;}
  function open(){ensure();render();$('#mathStudyLibrary')?.classList.add('open');setTimeout(()=>$('#mathStudySearch')?.focus(),30)}
  function close(){$('#mathStudyLibrary')?.classList.remove('open')}
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
      const action=e.target.closest('[data-study-action]')?.dataset.studyAction;if(action){e.preventDefault();if(action==='open')open();if(action==='close')close();if(action==='export')exportJson();return;}
      const openId=e.target.closest('[data-study-open]')?.dataset.studyOpen;if(openId){e.preventDefault();openLesson(openId);return;}
      const remove=e.target.closest('[data-study-remove-bookmark]')?.dataset.studyRemoveBookmark;if(remove){e.preventDefault();removeBookmark(remove);return;}
      const note=e.target.closest('[data-study-clear-note]')?.dataset.studyClearNote;if(note){e.preventDefault();clearNote(note);return;}
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-math-nav]'))schedule(200);
    },true);
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='s'){e.preventDefault();open()}if(e.key==='Escape')close()});
  }
  function schedule(ms=150){clearTimeout(timer);timer=setTimeout(()=>{ensure();render()},ms)}
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathStudyLibrary'),navButton:!!$('#mathStudyNav'),bookmarks:bookmarks().length,notes:Object.values(notes()).filter(x=>String(x||'').trim()).length,localOnly:true,academicWrites:false,routeEngineReplacement:false}}
  function init(){if(!document.body||document.body.dataset.mathStudyLibrary==='1')return;document.body.dataset.mathStudyLibrary='1';bind();ensure();[300,750,1500,2600].forEach(ms=>setTimeout(ensure,ms));global.BAUMAN_MATH_STUDY_LIBRARY={release:RELEASE,open,close,openLesson,refresh:render,selfCheck};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
