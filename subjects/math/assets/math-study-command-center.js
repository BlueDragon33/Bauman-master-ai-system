/* Bauman Math Study Command Center V1
 * Local learning-state cockpit built only from user activity/mastery state + canonical lesson metadata.
 * No grades, no inferred correctness, no generated academic content, no canonical data writes.
 */
(function mathStudyCommandCenter(global){
  'use strict';
  const RELEASE='MATH_STUDY_COMMAND_CENTER_V1';
  const MASTERY_KEY='bauman_math_activity_mastery_v1';
  const HISTORY_KEY='bauman_math_mastery_history_v1';
  const NOTES_KEY='bauman_math_activity_notes_v1';
  const SESSION_KEY='bauman_math_activity_session_v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=88)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
  let timer=0,noteTimer=0;

  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??fallback}catch(_){return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function currentLessonId(){return String(state().e186Path?.lessonId||state().e169Path?.lessonId||state().e129LessonId||'')}
  function currentActivity(){return String(state().e186Path?.activityId||state().e169Path?.activityId||state().learnTab||'theory')}
  function recordsOf(raw){if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.lessons))return raw.lessons;if(Array.isArray(raw?.items))return raw.items;return[]}
  function theoryRecords(){const db=recordsOf(global.DB?.theory_lecture_content);if(db.length)return db;return recordsOf(global.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.getPayload?.())}
  function lessonMeta(id){const r=theoryRecords().find(x=>String(x.lessonId||x.id||'')===String(id||''));return r?{id:String(r.lessonId||r.id||''),title:String(r.title||r.lessonTitle||r.name||id||''),chapterId:String(r.chapterId||'unassigned'),chapterTitle:String(r.chapterTitle||r.chapterName||r.chapterId||'Chưa gắn chương')}:{id:String(id||''),title:String(id||'Bài chưa xác định'),chapterId:'unassigned',chapterTitle:'Chưa gắn chương'}}
  function parseKey(key){const [lessonId='',activity='',item='']=String(key||'').split('::');return{key:String(key||''),lessonId,activity,item}}
  function mastery(){return readJson(MASTERY_KEY,{})||{}}
  function notes(){return readJson(NOTES_KEY,{})||{}}
  function history(){const h=readJson(HISTORY_KEY,[]);return Array.isArray(h)?h:[]}
  function session(){return readJson(SESSION_KEY,null)}
  function labelState(v){return v==='mastered'?'Đã nắm':v==='review'?'Cần ôn':'Đang học'}
  function timeAgo(at){const d=Math.max(0,Date.now()-Number(at||0)),m=Math.floor(d/60000);if(m<1)return'vừa xong';if(m<60)return`${m} phút trước`;const h=Math.floor(m/60);if(h<24)return`${h} giờ trước`;return`${Math.floor(h/24)} ngày trước`}

  function summarize(){
    const all=mastery(),counts={review:0,learning:0,mastered:0},byChapter={};
    Object.entries(all).forEach(([key,value])=>{
      const p=parseKey(key),st=value?.state||'learning',meta=lessonMeta(p.lessonId);if(counts[st]!=null)counts[st]++;
      const g=byChapter[meta.chapterId]||(byChapter[meta.chapterId]={chapterId:meta.chapterId,title:meta.chapterTitle,total:0,review:0,learning:0,mastered:0,lessons:new Set()});
      g.total++;if(g[st]!=null)g[st]++;if(p.lessonId)g.lessons.add(p.lessonId);
    });
    const total=Object.keys(all).length,pct=total?Math.round(counts.mastered/total*100):0;
    return{total,pct,...counts,chapters:Object.values(byChapter).map(x=>({...x,lessonCount:x.lessons.size,lessons:undefined})).sort((a,b)=>String(a.chapterId).localeCompare(String(b.chapterId),'vi'))};
  }
  function reviewItems(){
    return Object.entries(mastery()).filter(([,v])=>v?.state==='review').map(([key,v])=>{const p=parseKey(key),meta=lessonMeta(p.lessonId);return{...p,...meta,updatedAt:Number(v?.updatedAt||0)}}).sort((a,b)=>b.updatedAt-a.updatedAt);
  }
  function recordMasteryEvent(key,newState){
    if(!key||!['review','learning','mastered'].includes(newState))return;
    const p=parseKey(key),meta=lessonMeta(p.lessonId),list=history(),last=list[0];
    if(last&&last.key===key&&last.state===newState&&Date.now()-Number(last.at||0)<500)return;
    list.unshift({key,state:newState,lessonId:p.lessonId,activity:p.activity,chapterId:meta.chapterId,chapterTitle:meta.chapterTitle,lessonTitle:meta.title,at:Date.now()});
    writeJson(HISTORY_KEY,list.slice(0,300));schedule(80);
  }

  function saveNote(key,value){const all=notes();if(String(value||'').trim())all[key]={text:String(value),updatedAt:Date.now()};else delete all[key];writeJson(NOTES_KEY,all)}
  function startSession(key){const p=parseKey(key),meta=lessonMeta(p.lessonId),old=session();writeJson(SESSION_KEY,{key,lessonId:p.lessonId,activity:p.activity,chapterId:meta.chapterId,startedAt:old?.key===key?old.startedAt||Date.now():Date.now(),updatedAt:Date.now()});decorateWorkbench();renderDashboard()}
  function clearSession(){try{localStorage.removeItem(SESSION_KEY)}catch(_){ }decorateWorkbench();renderDashboard()}

  function decorateWorkbench(){
    const host=$('#mathActivityStudio');if(!host||!document.body.classList.contains('math-activity-studio-active'))return;
    const saved=notes(),active=session();
    $$('.math-activity-card',host).forEach(card=>{
      const key=card.dataset.mathMasteryKey;if(!key)return;
      let box=$('.math-workbench',card);
      if(!box){box=document.createElement('section');box.className='math-workbench';box.innerHTML=`<div class="math-workbench-head"><b>Workspace cá nhân</b><span>local only</span></div><textarea class="math-workbench-note" rows="3" placeholder="Ghi chú cách làm, chỗ vướng hoặc điều cần hỏi…" data-scc-note></textarea><div class="math-workbench-actions"><button type="button" data-scc="session-start">Bắt đầu / tiếp tục mục này</button><button type="button" data-scc="note-clear">Xóa ghi chú</button></div>`;card.appendChild(box)}
      box.dataset.sccKey=key;const area=$('[data-scc-note]',box);if(area&&document.activeElement!==area)area.value=saved[key]?.text||'';
      const isActive=active?.key===key;box.classList.toggle('active',isActive);const btn=$('[data-scc="session-start"]',box);if(btn)btn.textContent=isActive?'Đang làm mục này':'Bắt đầu / tiếp tục mục này';
    });
  }

  function chapterHtml(chapters){
    if(!chapters.length)return'<div class="math-scc-empty">Chưa có trạng thái mastery local để tổng hợp theo chương.</div>';
    return chapters.slice(0,8).map(c=>{const pct=c.total?Math.round(c.mastered/c.total*100):0;return `<article class="math-scc-chapter"><div><b>${esc(c.title||c.chapterId)}</b><span>${c.lessonCount} bài có hoạt động · ${c.total} mục</span></div><div class="math-scc-bar"><i style="width:${pct}%"></i></div><small>${c.mastered} đã nắm · ${c.learning} đang học · ${c.review} cần ôn</small></article>`}).join('')
  }
  function reviewHtml(items){
    if(!items.length)return'<div class="math-scc-empty">Chưa có mục nào được bạn đánh dấu “Cần ôn”.</div>';
    return items.slice(0,10).map(x=>`<article class="math-scc-review"><div><b>${esc(clip(x.title,70))}</b><span>${esc(x.activity||'activity')} · ${esc(x.chapterTitle||x.chapterId)} · ${x.updatedAt?timeAgo(x.updatedAt):'chưa có thời gian'}</span></div><button type="button" data-scc="open-review" data-scc-key="${esc(x.key)}">Mở mục</button></article>`).join('')
  }
  function historyHtml(list){
    if(!list.length)return'<div class="math-scc-empty">Lịch sử sẽ bắt đầu khi bạn đổi trạng thái mastery từ phiên bản này.</div>';
    return list.slice(0,8).map(x=>`<article class="math-scc-history"><i class="${esc(x.state)}"></i><div><b>${esc(labelState(x.state))} · ${esc(clip(x.lessonTitle||x.lessonId,58))}</b><span>${esc(x.activity||'activity')} · ${esc(x.chapterTitle||x.chapterId||'')} · ${timeAgo(x.at)}</span></div></article>`).join('')
  }
  function ensureDashboard(){
    const base=$('#mathV2Dashboard');if(!base)return null;
    let host=$('#mathStudyCommandCenter');if(!host){host=document.createElement('section');host.id='mathStudyCommandCenter';host.className='math-study-command-center';base.insertAdjacentElement('afterend',host)}return host;
  }
  function renderDashboard(){
    const host=ensureDashboard();if(!host)return;const s=summarize(),reviews=reviewItems(),log=history(),active=session();
    host.innerHTML=`<header class="math-scc-head"><div><small>Study Command Center</small><h2>Tiến độ tự học & hàng đợi ôn tập</h2><p>Chỉ tổng hợp thao tác local của bạn. ${s.pct}% dưới đây là tỷ lệ mục bạn tự đánh dấu “Đã nắm”, không phải điểm thi.</p></div><div class="math-scc-tools"><button type="button" data-scc="formula">∑ Công thức</button><button type="button" data-scc="simulation">∿ Mô phỏng</button><button type="button" data-scc="professor">🎓 Vấn đáp</button></div></header><div class="math-scc-metrics"><article><span>Mục có trạng thái</span><b>${s.total}</b></article><article><span>Đã nắm</span><b>${s.mastered}</b></article><article><span>Đang học</span><b>${s.learning}</b></article><article class="review"><span>Cần ôn</span><b>${s.review}</b></article><article><span>Tự đánh dấu đã nắm</span><b>${s.pct}%</b></article></div>${active?`<div class="math-scc-session"><div><small>Phiên đang làm</small><b>${esc(clip(lessonMeta(active.lessonId).title,82))}</b><span>${esc(active.activity||'activity')} · bắt đầu ${timeAgo(active.startedAt)}</span></div><button type="button" data-scc="session-resume" data-scc-key="${esc(active.key)}">Tiếp tục</button><button type="button" data-scc="session-clear">Kết thúc phiên</button></div>`:''}<div class="math-scc-grid"><section><div class="math-scc-title"><h3>Mastery theo chương</h3><span>latest local state</span></div>${chapterHtml(s.chapters)}</section><section><div class="math-scc-title"><h3>Hàng đợi “Cần ôn”</h3><span>${reviews.length} mục</span></div>${reviewHtml(reviews)}</section><section><div class="math-scc-title"><h3>Lịch sử mastery</h3><span>${log.length} sự kiện lưu gần nhất</span></div>${historyHtml(log)}</section></div>`;
  }

  function selectCanonicalLesson(lessonId){
    const rec=theoryRecords().find(x=>String(x.lessonId||x.id||'')===String(lessonId||''));if(!rec)return false;
    const id=String(rec.lessonId||rec.id),st=state();st.view='learning';st.learnTab='theory';st.e129LessonId=id;if(rec.chapterId)st.e129ChapterId=rec.chapterId;
    st.e186Path=st.e186Path||{};st.e186Path.lessonId=id;if(rec.chapterId)st.e186Path.chapterId=rec.chapterId;st.e186Path.activityId='theory';
    st.e169Path=st.e169Path||{};st.e169Path.lessonId=id;if(rec.chapterId)st.e169Path.chapterId=rec.chapterId;st.e169Path.activityId='theory';
    try{global.__BAUMAN_CORE_API?.save?.()}catch(_){ }
    try{global.BAUMAN_MATH_THEORY_E129?.render?.()}catch(_){ }
    return true;
  }
  function openItem(key){
    const p=parseKey(key);if(!p.lessonId||!selectCanonicalLesson(p.lessonId))return;
    const activity=['exercises','practice','application','review','exam'].includes(p.activity)?p.activity:'theory';
    setTimeout(()=>global.BAUMAN_MATH_NAVIGATION?.route?.(activity),160);
    setTimeout(()=>{const card=$$('.math-activity-card').find(x=>x.dataset.mathMasteryKey===key);if(card){card.classList.add('math-scc-focus');card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>card.classList.remove('math-scc-focus'),2600)}},620);
  }
  function openProfessor(){global.BAUMAN_MATH_PROFESSOR_DRILL?.open?.()}
  function openFormula(){global.BAUMAN_MATH_FORMULA_LIBRARY?.open?.()||global.BAUMAN_MATH_NAVIGATION?.route?.('formula')}
  function openSimulation(){global.BAUMAN_MATH_SIMULATION_SOURCE?.openForCurrent?.()||global.BAUMAN_MATH_NAVIGATION?.route?.('lab')}

  function schedule(ms=120){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function refresh(){decorateWorkbench();renderDashboard()}
  function bind(){
    document.addEventListener('click',e=>{
      const masteryBtn=e.target.closest('[data-am-state][data-am-key]');if(masteryBtn)setTimeout(()=>recordMasteryEvent(masteryBtn.dataset.amKey,masteryBtn.dataset.amState),0);
      const action=e.target.closest('[data-scc]')?.dataset.scc;if(!action)return;
      e.preventDefault();const box=e.target.closest('.math-workbench'),key=e.target.closest('[data-scc-key]')?.dataset.sccKey||box?.dataset.sccKey||'';
      if(action==='session-start'){startSession(key);return}if(action==='session-resume'||action==='open-review'){startSession(key);openItem(key);return}if(action==='session-clear'){clearSession();return}
      if(action==='note-clear'&&box){const area=$('[data-scc-note]',box);if(area){area.value='';saveNote(key,'')}return}
      if(action==='formula'){openFormula();return}if(action==='simulation'){openSimulation();return}if(action==='professor'){openProfessor();return}
    },true);
    document.addEventListener('input',e=>{const area=e.target.closest('[data-scc-note]');if(!area)return;const key=area.closest('.math-workbench')?.dataset.sccKey;if(!key)return;clearTimeout(noteTimer);noteTimer=setTimeout(()=>saveNote(key,area.value),220)},true);
    document.addEventListener('change',e=>{if(e.target?.id==='stageSelect')schedule(220)},true);
    global.addEventListener('hashchange',()=>schedule(180));
  }
  function selfCheck(){const s=summarize();return{release:RELEASE,ready:!!$('#mathStudyCommandCenter'),masteryItems:s.total,reviewQueue:s.review,chapters:s.chapters.length,historyEvents:history().length,notes:Object.keys(notes()).length,currentLessonId:currentLessonId()||null,currentActivity:currentActivity(),routeOwner:'E186-first',localOnly:true,academicWrites:false,gradingAuthority:false,generatedQuestions:false,correctnessInference:false,mutationObserver:false,newRouteEngine:false}}
  function init(){if(!document.body||document.body.dataset.mathStudyCommandCenter==='1')return;document.body.dataset.mathStudyCommandCenter='1';bind();[650,1500,2900].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_STUDY_COMMAND_CENTER={release:RELEASE,refresh,openItem,reviewItems,summarize,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);