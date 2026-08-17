'use strict';
(function(){
  const VERSION='Adaptive Learning Orchestrator 1.0.0';
  const CONFIG_URL='assets/data/adaptive-roadmap.json';
  const STORAGE_KEY='baumanAdaptiveLearningV1';
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const iso=d=>{const x=new Date(d);if(Number.isNaN(x.getTime()))return '';return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const parseDate=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):null};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

  let config=null;
  let local={};

  function readLocal(){
    try{local=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(_){local={}}
    local.dates=local.dates||{};
    local.competencies=local.competencies||{};
    local.language=local.language||{};
    local.diagnostics=local.diagnostics||{};
    local.retention=local.retention||{};
    local.errorNotebook=local.errorNotebook||[];
    local.weeklyBoards=local.weeklyBoards||[];
    return local;
  }
  function persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(local))}catch(_){ }
    if(window.state){window.state.adaptiveLearning=JSON.parse(JSON.stringify(local));try{window.save?.()}catch(_){}}
  }
  function hydrateFromMain(){
    if(window.state?.adaptiveLearning && Object.keys(local).length===0){local=JSON.parse(JSON.stringify(window.state.adaptiveLearning));}
    readLocal();
  }
  async function loadConfig(){
    try{const r=await fetch(CONFIG_URL,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);config=await r.json();return config}catch(err){console.warn('[AdaptiveLearning] config load failed',err);return null}
  }
  function effectiveDates(){
    const d=config?.dates||{};
    return {
      selfStudyStart:local.dates.selfStudyStart||d.selfStudyStart||'2026-09-01',
      preparatoryStart:local.dates.preparatoryStart||d.preparatoryStart||'2026-11-01',
      baumanStart:local.dates.baumanStart||d.baumanStart||''
    };
  }
  function setDate(key,value){
    if(!['selfStudyStart','preparatoryStart','baumanStart'].includes(key))return;
    if(value && !parseDate(value))return;
    local.dates[key]=value;persist();renderRoadmapPanel();emit('dates-changed',{...effectiveDates()});
  }
  function emit(name,detail){try{window.dispatchEvent(new CustomEvent(`bauman-adaptive:${name}`,{detail}))}catch(_){}}

  function competencyDefaults(){
    const out={};
    const c=config?.competencies||{};
    (c.active||[]).forEach(id=>out[id]={state:'FUNCTIONAL',source:'baseline-active'});
    (c.dormant||[]).forEach(id=>out[id]={state:'DORMANT',source:'baseline-dormant'});
    (c.gap||[]).forEach(id=>out[id]={state:'ZERO',source:'baseline-gap'});
    (c.archiveOnDemand||[]).forEach(id=>out[id]={state:'ARCHIVE_ON_DEMAND',source:'baseline-archive'});
    return out;
  }
  function ensureCompetencies(){
    const defs=competencyDefaults();
    Object.entries(defs).forEach(([id,v])=>{if(!local.competencies[id])local.competencies[id]={...v,score:null,lastEvidenceAt:null,retention:null};});
    if(local.competencies['russian-general'])local.competencies['russian-general'].state='ZERO';
    if(local.competencies['russian-academic-engineering'])local.competencies['russian-academic-engineering'].state='ZERO';
    persist();
  }
  function diagnosticAction(score){
    const bands=config?.diagnosticPolicy?.bands||[];
    return [...bands].sort((a,b)=>b.min-a.min).find(b=>Number(score)>=Number(b.min))?.action||'relearn-module';
  }
  function recordDiagnostic(id,score,meta={}){
    score=clamp(score,0,100);
    const action=diagnosticAction(score);
    const prev=local.competencies[id]||{state:'ZERO'};
    let state=prev.state;
    if(id.startsWith('russian-')) state='ZERO';
    else if(score>=80) state='FUNCTIONAL';
    else if(score>=40) state='REACTIVATING';
    else state='ZERO';
    local.diagnostics[id]=local.diagnostics[id]||[];
    local.diagnostics[id].push({score,action,date:new Date().toISOString(),...meta});
    local.competencies[id]={...prev,state,score,lastEvidenceAt:new Date().toISOString()};
    persist();emit('diagnostic',{id,score,action,state});renderRoadmapPanel();return {id,score,action,state};
  }
  function recordMasteryEvidence(id,evidence={}){
    const c=local.competencies[id]||{state:'ZERO'};
    const independence=clamp(evidence.independent??0,0,100);
    const problem=clamp(evidence.problemSolving??0,0,100);
    const application=clamp(evidence.application??0,0,100);
    const explanation=clamp(evidence.explanation??0,0,100);
    const retention=clamp(evidence.retention??0,0,100);
    const hintPenalty=clamp(evidence.hintsUsed??0,0,10)*2;
    const score=clamp((independence+problem+application+explanation+retention)/5-hintPenalty,0,100);
    let state=score>=90?'BAUMAN_READY':score>=80?'MASTERED':score>=65?'FUNCTIONAL':score>=40?'REACTIVATING':'ZERO';
    if(id.startsWith('russian-') && c.state==='ZERO')state=score>=65?'FUNCTIONAL':'REACTIVATING';
    local.competencies[id]={...c,state,score,lastEvidenceAt:new Date().toISOString(),lastEvidence:{independence,problem,application,explanation,retention,hintsUsed:evidence.hintsUsed||0}};
    local.retention[id]={lastReviewedAt:new Date().toISOString(),estimated:retention||score};
    persist();emit('mastery',{id,state,score});renderRoadmapPanel();return {id,state,score};
  }
  function decayRetention(id,now=new Date()){
    const c=local.competencies[id];if(!c)return null;
    const last=local.retention[id]?.lastReviewedAt||c.lastEvidenceAt;if(!last)return c.retention??c.score??null;
    const days=Math.max(0,(now-new Date(last))/86400000);
    const start=Number(local.retention[id]?.estimated??c.score??70);
    const halfLife=c.state==='BAUMAN_READY'?90:c.state==='MASTERED'?60:c.state==='FUNCTIONAL'?35:18;
    const est=clamp(start*Math.pow(0.5,days/halfLife),0,100);
    c.retention=Math.round(est);return c.retention;
  }
  function refreshRetention(){Object.keys(local.competencies).forEach(id=>decayRetention(id));persist();}

  function addError(entry){
    const types=['concept','calculation','prerequisite','language','careless','programming','reasoning'];
    const type=types.includes(entry?.type)?entry.type:'reasoning';
    local.errorNotebook.push({id:`err-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,date:new Date().toISOString(),type,subjectId:entry?.subjectId||'',competencyId:entry?.competencyId||'',message:entry?.message||'',resolved:false});
    if(local.errorNotebook.length>500)local.errorNotebook=local.errorNotebook.slice(-500);
    persist();emit('error-added',{type});return local.errorNotebook.at(-1);
  }
  function errorStats(){
    const stats={};local.errorNotebook.filter(x=>!x.resolved).forEach(x=>stats[x.type]=(stats[x.type]||0)+1);return stats;
  }

  function phaseByDate(date=new Date()){
    const d=effectiveDates();const t=new Date(date);const prep=parseDate(d.preparatoryStart);const bauman=parseDate(d.baumanStart);
    if(bauman&&t>=bauman)return 'P5';
    if(prep&&t>=prep)return 'P3';
    const start=parseDate(d.selfStudyStart);if(start&&t<start)return 'PRE_START';
    return 'P0_P2';
  }
  function languageSkill(){
    const l=local.language.skills||{};
    return {general:Number(l.general||0),technicalReading:Number(l.technicalReading||0),lectureListening:Number(l.lectureListening||0),technicalWriting:Number(l.technicalWriting||0),technicalSpeaking:Number(l.technicalSpeaking||0)};
  }
  function recommendedLanguageStage(date=new Date()){
    const manual=local.language.manualMode;if(manual&&manual!=='AUTO')return manual;
    const p=phaseByDate(date),s=languageSkill();
    const avg=(s.general+s.technicalReading+s.lectureListening+s.technicalWriting+s.technicalSpeaking)/5;
    if(p==='PRE_START'||p==='P0_P2')return 'L0';
    if(p==='P3'){
      if(avg<35)return 'L1';
      if(avg<60)return 'L2';
      return 'L3';
    }
    if(p==='P5')return avg<65?'L3':'L4';
    return 'L0';
  }
  function supportLevelForTerm(termId){
    const mem=local.language.terms?.[termId]||{stage:0,correct:0,total:0};
    return clamp(mem.stage,0,4);
  }
  function recordTerm(termId,correct,activeUse=false){
    local.language.terms=local.language.terms||{};
    const t=local.language.terms[termId]||{stage:0,correct:0,total:0,activeUse:0};
    t.total++;if(correct)t.correct++;if(activeUse)t.activeUse++;
    const acc=t.total?100*t.correct/t.total:0;
    if(t.total>=3&&acc>=85&&t.stage<3)t.stage++;
    if(t.activeUse>=2&&acc>=85)t.stage=4;
    local.language.terms[termId]=t;persist();return t;
  }
  function setLanguageSkills(skills){
    local.language.skills={...languageSkill(),...Object.fromEntries(Object.entries(skills||{}).map(([k,v])=>[k,clamp(v,0,100)]))};persist();renderRoadmapPanel();
  }

  function masteryCounts(){
    const counts={};Object.values(local.competencies).forEach(c=>counts[c.state]=(counts[c.state]||0)+1);return counts;
  }
  function nextPriorities(){
    refreshRetention();
    const list=Object.entries(local.competencies).map(([id,c])=>({id,...c,retention:c.retention??100}));
    const order={ZERO:0,REACTIVATING:1,DORMANT:2,FUNCTIONAL:3,MASTERED:4,BAUMAN_READY:5,ARCHIVE_ON_DEMAND:9};
    return list.filter(x=>x.state!=='ARCHIVE_ON_DEMAND').sort((a,b)=>(order[a.state]-order[b.state])+(a.retention-b.retention)/100).slice(0,8);
  }
  function academicBoard(){
    const counts=masteryCounts();const errors=errorStats();const priorities=nextPriorities();const lang=recommendedLanguageStage();
    const board={date:new Date().toISOString(),counts,errors,languageStage:lang,priorities:priorities.map(x=>({id:x.id,state:x.state,score:x.score,retention:x.retention})),recommendations:[]};
    if((errors.language||0)>=(errors.concept||0)+2)board.recommendations.push('Ưu tiên Russian comprehension: lỗi ngôn ngữ đang vượt lỗi khái niệm.');
    if(priorities.some(x=>x.state==='DORMANT'))board.recommendations.push('Kích hoạt lại kiến thức ngủ bằng diagnostic ngắn trước khi học mới.');
    if(priorities.some(x=>x.id==='sql-databases'||x.id==='algorithms-data-structures'))board.recommendations.push('Giữ CS bridge ở ưu tiên cao trước ML nâng cao.');
    board.recommendations.push('Không đánh dấu hoàn thành chỉ vì đã xem bài; yêu cầu retrieval + independent problem + application.');
    local.weeklyBoards.push(board);if(local.weeklyBoards.length>52)local.weeklyBoards=local.weeklyBoards.slice(-52);persist();return board;
  }

  function timelineHTML(){
    const d=effectiveDates();const stage=recommendedLanguageStage();
    return `<div class="adaptive-timeline">
      <div><b>🚀 Bắt đầu tự học</b><input type="date" data-adaptive-date="selfStudyStart" value="${h(d.selfStudyStart)}"></div>
      <div><b>🇷🇺 Dự bị Nga</b><input type="date" data-adaptive-date="preparatoryStart" value="${h(d.preparatoryStart)}"><small>Mốc dự kiến, có thể đổi.</small></div>
      <div><b>🎓 Bauman chính thức</b><input type="date" data-adaptive-date="baumanStart" value="${h(d.baumanStart)}"><small>Để trống đến khi có lịch thật.</small></div>
      <div class="adaptive-stage"><b>Ngôn ngữ hiện tại</b><span>${h(stage)}</span><small>Lịch chỉ gợi ý; năng lực thực tế quyết định mức hỗ trợ.</small></div>
    </div>`;
  }
  function competenciesHTML(){
    const p=nextPriorities();return `<div class="adaptive-priority-list">${p.map(x=>`<div class="adaptive-priority"><b>${h(x.id)}</b><span>${h(x.state)}</span><small>${x.score==null?'chưa diagnostic':`score ${Math.round(x.score)}%`} · retention ${x.retention==null?'--':Math.round(x.retention)+'%'}</small></div>`).join('')}</div>`;
  }
  function renderRoadmapPanel(){
    const root=document.getElementById('page-roadmap');if(!root||!config)return;
    let panel=document.getElementById('adaptiveRoadmapPanel');
    if(!panel){panel=document.createElement('section');panel.id='adaptiveRoadmapPanel';panel.className='panel adaptive-roadmap-panel';root.prepend(panel);}
    const board=local.weeklyBoards.at(-1)||academicBoard();
    panel.innerHTML=`<div class="adaptive-head"><div><small>Adaptive Bauman Roadmap · ${h(VERSION)}</small><h2>Lộ trình cá nhân hóa theo năng lực thật</h2><p>Tiếng Nga bắt đầu từ ZERO. Kiến thức HUTECH cũ được xem là Dormant và chỉ phục hồi theo diagnostic. LabVIEW/IoT/xử lý ảnh được dùng làm cầu nối sang Python, Data và AI.</p></div><button class="btn" id="adaptiveBoardBtn">🧠 Hội đồng học tập</button></div>
      ${timelineHTML()}
      <div class="adaptive-grid"><div><h3>Ưu tiên hiện tại</h3>${competenciesHTML()}</div><div><h3>Khuyến nghị hội đồng</h3><ul>${(board.recommendations||[]).map(x=>`<li>${h(x)}</li>`).join('')}</ul><p><b>Russian stage:</b> ${h(recommendedLanguageStage())}</p></div></div>
      <details><summary>Quy tắc Mastery</summary><p>Biết → Hiểu → Giải thích → Làm độc lập → Ứng dụng → Bảo vệ → Ôn giãn cách. Xem hết nội dung không được tính là Mastered.</p></details>`;
    panel.querySelectorAll('[data-adaptive-date]').forEach(el=>el.addEventListener('change',()=>setDate(el.dataset.adaptiveDate,el.value)));
    panel.querySelector('#adaptiveBoardBtn')?.addEventListener('click',()=>{academicBoard();renderRoadmapPanel();});
  }

  function installTooltipDelegation(){
    if(document.documentElement.dataset.adaptiveTooltip==='1')return;document.documentElement.dataset.adaptiveTooltip='1';
    let tip=null;
    function hide(){tip?.remove();tip=null}
    document.addEventListener('mouseover',e=>{
      const el=e.target.closest?.('.ru-term,[data-ru]');if(!el)return;
      const ru=el.dataset.ru||'';if(!ru)return;const id=el.dataset.termId||ru.toLowerCase().replace(/\s+/g,'-');const stage=supportLevelForTerm(id);
      const ipa=el.dataset.ipa||'';const phonetic=el.dataset.phonetic||'';const vi=el.dataset.vi||el.textContent||'';
      hide();tip=document.createElement('div');tip.className='adaptive-ru-tooltip';
      const rows=[`<b>${h(ru)}</b>`];if(stage<=1&&vi)rows.push(`<span>🇻🇳 ${h(vi)}</span>`);if(stage===0&&ipa)rows.push(`<span>IPA: ${h(ipa)}</span>`);if(stage===0&&phonetic)rows.push(`<span>Gợi đọc: ${h(phonetic)}</span>`);if(stage<=2)rows.push('<small>Rê chuột chỉ là hỗ trợ tạm thời; hệ thống sẽ rút dần khi bạn nhớ từ.</small>');
      tip.innerHTML=rows.join('');document.body.appendChild(tip);const r=el.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-tip.offsetWidth-12,Math.max(8,r.left))}px`;tip.style.top=`${Math.min(innerHeight-tip.offsetHeight-8,r.bottom+8)}px`;
    });
    document.addEventListener('mouseout',e=>{if(e.target.closest?.('.ru-term,[data-ru]'))hide()});
  }

  function injectStyle(){
    if(document.getElementById('adaptiveLearningStyle'))return;const s=document.createElement('style');s.id='adaptiveLearningStyle';s.textContent=`
      .adaptive-roadmap-panel{border:1px solid rgba(52,87,153,.22);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(244,248,255,.92));margin-bottom:18px}
      .adaptive-head{display:flex;gap:16px;justify-content:space-between;align-items:flex-start}.adaptive-head h2{margin:.2rem 0}.adaptive-head p{max-width:900px;margin:.35rem 0}
      .adaptive-timeline{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.adaptive-timeline>div{padding:12px;border-radius:14px;background:rgba(255,255,255,.8);border:1px solid rgba(0,0,0,.08);display:grid;gap:5px}.adaptive-timeline input{max-width:165px}.adaptive-timeline small{opacity:.72}
      .adaptive-stage span,.adaptive-priority span{display:inline-flex;padding:3px 8px;border-radius:999px;background:rgba(35,92,170,.1);font-size:.78rem}
      .adaptive-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px}.adaptive-priority-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.adaptive-priority{display:grid;grid-template-columns:1fr auto;gap:4px 8px;padding:10px;border-radius:12px;background:rgba(255,255,255,.72);border:1px solid rgba(0,0,0,.07)}.adaptive-priority small{grid-column:1/-1;opacity:.72}
      .adaptive-ru-tooltip{position:fixed;z-index:99999;display:grid;gap:4px;max-width:360px;padding:10px 12px;border-radius:12px;background:#101827;color:white;box-shadow:0 12px 34px rgba(0,0,0,.28);font-size:14px}.adaptive-ru-tooltip span,.adaptive-ru-tooltip small{display:block}.adaptive-ru-tooltip small{opacity:.75}
      .ru-term,[data-ru]{text-decoration:underline dotted rgba(53,91,150,.55);text-underline-offset:3px;cursor:help}
      @media(max-width:900px){.adaptive-timeline{grid-template-columns:1fr 1fr}.adaptive-grid{grid-template-columns:1fr}.adaptive-priority-list{grid-template-columns:1fr}}
      @media(max-width:560px){.adaptive-timeline{grid-template-columns:1fr}.adaptive-head{display:block}.adaptive-head button{margin-top:8px}}
    `;document.head.appendChild(s);
  }
  function watchRoadmap(){
    const obs=new MutationObserver(()=>{if(document.getElementById('page-roadmap')?.classList.contains('active'))renderRoadmapPanel()});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    document.querySelector('[data-page="roadmap"]')?.addEventListener('click',()=>setTimeout(renderRoadmapPanel,0));
  }
  function patchStudyTasks(){
    window.addEventListener('bauman-adaptive:mastery',()=>{});
    window.addEventListener('message',e=>{
      const m=e.data||{};
      if(m.type==='BAUMAN_DIAGNOSTIC_RESULT'&&m.competencyId)recordDiagnostic(m.competencyId,m.score,m.meta||{});
      if(m.type==='BAUMAN_MASTERY_EVIDENCE'&&m.competencyId)recordMasteryEvidence(m.competencyId,m.evidence||{});
      if(m.type==='BAUMAN_ERROR_RECORD')addError(m);
      if(m.type==='BAUMAN_RUSSIAN_TERM_RESULT'&&m.termId)recordTerm(m.termId,!!m.correct,!!m.activeUse);
    });
  }
  async function init(){
    readLocal();await loadConfig();if(!config)return;hydrateFromMain();ensureCompetencies();refreshRetention();injectStyle();installTooltipDelegation();watchRoadmap();patchStudyTasks();setTimeout(renderRoadmapPanel,100);
    window.BaumanAdaptiveLearning={VERSION,get config(){return config},get state(){return local},effectiveDates,setDate,recordDiagnostic,recordMasteryEvidence,addError,errorStats,phaseByDate,recommendedLanguageStage,setLanguageSkills,recordTerm,supportLevelForTerm,academicBoard,nextPriorities,renderRoadmapPanel};
    emit('ready',{version:VERSION});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
