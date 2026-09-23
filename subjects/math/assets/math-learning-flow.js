/* Bauman Math Lesson Player
 * Lesson-first orchestration over the accepted E129 Reader.
 * One local learner-state owner. No academic JSON writes. No MutationObserver.
 */
(function mathLessonPlayer(global){
  'use strict';
  const RELEASE='MATH_LESSON_PLAYER_V1';
  const STATE_KEY='bauman_math_learning_flow_v1';
  const STATE_SCHEMA_VERSION=2;
  const NOTES_KEY='bauman_math_learning_notes_v1';
  const BOOKMARK_KEY='bauman_math_learning_bookmarks_v1';
  const ASSESSMENT_SOURCES={
    'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140':'data/theory_assessment/theory_assessment_c01_l05.json',
    'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140':'data/theory_assessment/theory_assessment_c01_l06.json'
  };
  const assessmentCache={};
  let timer=0,lastLesson='';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const STEPS=[
    {id:'understand',label:'Hiểu',sub:'Bản chất',roles:['problem_framing','deep_essence','notation','interpretation','compatibility_gate','matrix_semantics','convention_translation']},
    {id:'visualize',label:'Trực quan',sub:'Quan sát',roles:['simulation','counter_intuition','canonical_assembly','slicing_metadata','centering']},
    {id:'example',label:'Ví dụ',sub:'Từng bước',roles:['mini_case','worked_example','example','derivation','locked_case','api_trap','api_assembly']},
    {id:'formula',label:'Công thức',sub:'Điều kiện dùng',roles:['core_formula','assumption_gate','notation'],kind:'formula'},
    {id:'application',label:'Ứng dụng',sub:'Kỹ thuật',roles:['application','real_bridge','linear_interface','deployment_preprocessing','feature_gram','observation_gram']},
    {id:'practice',label:'Luyện tập',sub:'Tự giải',roles:['practice','troubleshooting','code_contract_audit']},
    {id:'selfcheck',label:'Tự kiểm',sub:'Vấn đáp',roles:['professor_qa','retrieval','covariance_gate','rank_boundary','svd_pca_boundary']},
    {id:'summary',label:'Tóm tắt',sub:'Chốt bài',roles:['takeaway','summary','bridge','mastery_close']}
  ];
  const LEGACY_STEP_MAP={theory:'understand',lab:'visualize',professor:'selfcheck',review:'summary',exam:'selfcheck'};

  function jsonGet(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
  function jsonSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
  function normalizeStore(raw){
    const out=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const meta=out._meta&&typeof out._meta==='object'&&!Array.isArray(out._meta)?out._meta:{};
    return {...out,_meta:{
      schemaVersion:STATE_SCHEMA_VERSION,
      currentLessonId:String(meta.currentLessonId||''),
      currentStepId:String(meta.currentStepId||''),
      lastActivityAt:Number(meta.lastActivityAt||0)
    }};
  }
  function allState(){return normalizeStore(jsonGet(STATE_KEY,{}))}
  function saveState(value){return jsonSet(STATE_KEY,normalizeStore(value))}
  function notes(){return jsonGet(NOTES_KEY,{})}
  function saveNotes(value){jsonSet(NOTES_KEY,value)}
  function bookmarks(){return jsonGet(BOOKMARK_KEY,[])}
  function saveBookmarks(value){jsonSet(BOOKMARK_KEY,value.slice(0,100))}

  function records(){
    const raw=global.DB?.theory_lecture_content;
    if(Array.isArray(raw))return raw;
    if(Array.isArray(raw?.records))return raw.records;
    if(Array.isArray(raw?.lessons))return raw.lessons;
    if(Array.isArray(raw?.items))return raw.items;
    return [];
  }
  function currentLesson(){
    const host=$('[data-current-lesson]');
    const id=host?.getAttribute('data-current-lesson')||global.__MATH_STATE?.e129LessonId||'';
    const title=(host?.querySelector('.e169-reader-title h2,h2')||$('.e169-reader-title h2')||$('.e129-placeholder h2'))?.textContent?.trim()||'Lý thuyết Toán Bauman';
    return {id,title,host};
  }
  function recordById(id){return records().find(r=>(r.lessonId||r.id)===id)||null}
  function currentRecord(){return recordById(currentLesson().id)}
  function assessmentFor(id){return assessmentCache[id]?.data||null}
  function loadAssessment(id){
    const path=ASSESSMENT_SOURCES[id];
    if(!path||assessmentCache[id]?.loading||assessmentCache[id]?.loaded)return;
    assessmentCache[id]={loading:true,loaded:false,data:null,error:null};
    fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()}).then(data=>{
      assessmentCache[id]={loading:false,loaded:true,data,error:null};
      schedule(0);
    }).catch(error=>{
      assessmentCache[id]={loading:false,loaded:true,data:null,error:String(error?.message||error)};
      schedule(0);
    });
  }
  function slides(){return $$('.e129-slide').filter(x=>x.offsetParent!==null)}
  function rolesForRecord(rec){return new Set((rec?.slides||[]).map(s=>String(s?.role||'').toLowerCase()).filter(Boolean))}
  function stepsForRecord(rec){
    const roles=rolesForRecord(rec);
    const out=STEPS.filter(step=>step.roles.some(role=>roles.has(role)));
    return out.length?out:[STEPS[0]];
  }
  function roleIndexMap(rec=currentRecord()){
    const map={};
    (rec?.slides||[]).forEach((slide,index)=>{
      const role=String(slide?.role||'').toLowerCase();
      if(role&&map[role]==null)map[role]=index;
    });
    return map;
  }
  function findSlideByRoles(roles,rec=currentRecord()){
    const map=roleIndexMap(rec),dom=slides();
    for(const role of roles){if(Number.isInteger(map[role])&&dom[map[role]])return dom[map[role]];}
    return dom.find(el=>{
      const t=(el.textContent||'').toLocaleLowerCase('vi');
      return roles.some(role=>t.includes(role.replace(/_/g,' ')));
    })||null;
  }

  function normalizeActive(id,steps){
    const mapped=LEGACY_STEP_MAP[id]||id;
    return steps.some(x=>x.id===mapped)?mapped:steps[0]?.id||'understand';
  }
  function normalizeVisited(raw,steps){
    const out={};
    Object.entries(raw||{}).forEach(([id,value])=>{
      const mapped=LEGACY_STEP_MAP[id]||id;
      if(value&&steps.some(x=>x.id===mapped))out[mapped]=true;
    });
    return out;
  }
  function lessonState(id,rec=recordById(id)){
    const all=allState(),raw=all[id]||{};
    const steps=stepsForRecord(rec);
    const visited=normalizeVisited(raw.visited,steps);
    const check=raw.check&&typeof raw.check==='object'?raw.check:{};
    const questionResults=raw.questionResults&&typeof raw.questionResults==='object'?raw.questionResults:{};
    return {...raw,active:normalizeActive(raw.active,steps),visited,check,questionResults,completedAt:Number(raw.completedAt||0),lastAt:Number(raw.lastAt||0)};
  }
  function splitCheckBody(body){
    const text=String(body||'').trim();
    const match=text.match(/^([\s\S]*?)(?:\s+(?:Trả lời|Đáp án)\s*:\s*)([\s\S]+)$/i);
    return match?{prompt:match[1].trim(),reference:match[2].trim()}:{prompt:text,reference:''};
  }
  function checkItemsForRecord(rec){
    const preferred=['professor_qa','practice','takeaway','mastery_close'];
    const slides=Array.isArray(rec?.slides)?rec.slides:[];
    const items=[];
    preferred.forEach(role=>{
      slides.forEach((slide,si)=>{
        if(String(slide?.role||'').toLowerCase()!==role)return;
        (slide?.blocks||[]).forEach((block,bi)=>{
          if(String(block?.type||'').toLowerCase()!=='qa')return;
          if(String(block?.title||'').trim().toLowerCase()==='trace')return;
          const parsed=splitCheckBody(block?.body||block?.content||block?.text||'');
          if(!parsed.prompt||/^LO\d+(?:\s*;|$)/i.test(parsed.prompt))return;
          items.push({
            id:`${slide?.id||role+'-'+si}::${bi}`,
            role,
            title:String(block?.title||slide?.title||'Tự kiểm'),
            prompt:parsed.prompt,
            reference:parsed.reference,
            reviewStepId:role==='practice'?'practice':role==='takeaway'||role==='mastery_close'?'summary':'selfcheck'
          });
        });
      });
    });
    const lessonId=String(rec?.lessonId||rec?.id||'');
    const assessment=assessmentFor(lessonId);
    if(assessment&&items.length<6){
      const pool=[
        ...(Array.isArray(assessment.retrievalChecks)?assessment.retrievalChecks:[]),
        ...(Array.isArray(assessment.professorQuestions)?assessment.professorQuestions:[]),
        ...(Array.isArray(assessment.professorQA)?assessment.professorQA:[])
      ];
      pool.forEach((item,index)=>{
        if(items.length>=6)return;
        const prompt=String(item?.prompt||item?.question||'').trim();
        if(!prompt)return;
        const id=`assessment::${item?.id||index}`;
        if(items.some(x=>x.id===id))return;
        items.push({
          id,
          role:'assessment',
          title:String(item?.cluster||item?.level||'Assessment'),
          prompt,
          reference:String(item?.answer||item?.expectedAnswer||'').trim(),
          reviewStepId:'selfcheck',
          learningOutcomeRefs:Array.isArray(item?.learningOutcomeRefs)?item.learningOutcomeRefs:[]
        });
      });
    }
    return items.slice(0,6);
  }
  function checkSummary(id,rec=recordById(id)){
    const items=checkItemsForRecord(rec),st=lessonState(id,rec),answers=st.check||{};
    let answered=0,review=0,understood=0;
    items.forEach(item=>{
      const value=answers[item.id];
      if(value==='review'||value==='understood')answered++;
      if(value==='review')review++;
      if(value==='understood')understood++;
    });
    return{items:items.map(item=>({...item,state:answers[item.id]||''})),total:items.length,answered,review,understood,complete:items.length>0&&answered===items.length};
  }
  function completionState(id,rec=recordById(id)){
    const steps=stepsForRecord(rec),st=lessonState(id,rec);
    const visitedCount=steps.filter(x=>st.visited?.[x.id]).length;
    const check=checkSummary(id,rec);
    return{
      stepsVisited:visitedCount,
      totalSteps:steps.length,
      allStepsVisited:steps.length>0&&visitedCount===steps.length,
      check,
      eligible:steps.length>0&&visitedCount===steps.length&&check.complete,
      completedAt:Number(st.completedAt||0)
    };
  }
  function writeLessonState(id,patch){
    if(!id)return false;
    const rec=recordById(id),steps=stepsForRecord(rec),all=allState(),current=lessonState(id,rec);
    const patchVisited=normalizeVisited(patch.visited||{},steps);
    const patchCheck=patch.check&&typeof patch.check==='object'?patch.check:{};
    const patchQuestions=patch.questionResults&&typeof patch.questionResults==='object'?patch.questionResults:{};
    const now=Date.now();
    const next={...current,...patch,active:normalizeActive(patch.active||current.active,steps),visited:{...(current.visited||{}),...patchVisited},check:{...(current.check||{}),...patchCheck},questionResults:{...(current.questionResults||{}),...patchQuestions},lastAt:now};
    all[id]=next;
    all._meta={...(all._meta||{}),schemaVersion:STATE_SCHEMA_VERSION,currentLessonId:id,currentStepId:next.active,lastActivityAt:now};
    return saveState(all);
  }

  function lessonSnapshot(id){
    const rec=recordById(id),steps=stepsForRecord(rec),st=lessonState(id,rec);
    const visitedCount=steps.filter(x=>st.visited?.[x.id]).length;
    const activeId=normalizeActive(st.active,steps);
    const activeIndex=Math.max(0,steps.findIndex(x=>x.id===activeId));
    const check=checkSummary(id,rec);
    const completed=Number(st.completedAt||0)>0;
    return {
      lessonId:id||null,
      visitedCount,
      totalSteps:steps.length,
      percent:steps.length?Math.round(visitedCount/steps.length*100):0,
      activeStep:steps[activeIndex]?.id||steps[0]?.id||'understand',
      activeStepLabel:steps[activeIndex]?.label||steps[0]?.label||'Hiểu',
      activeStepIndex:activeIndex+1,
      checkTotal:check.total,
      checkAnswered:check.answered,
      reviewNeeded:check.review,
      completedAt:Number(st.completedAt||0),
      status:completed?'completed':visitedCount>0?'started':'not_started',
      lastAt:Number(st.lastAt||0)
    };
  }
  function resumePointer(){
    const all=allState(),meta=all._meta||{};
    let id=String(meta.currentLessonId||'');
    if(!id||!recordById(id)){
      const candidates=Object.entries(all)
        .filter(([key,value])=>key!=='_meta'&&recordById(key)&&value&&typeof value==='object')
        .sort((a,b)=>Number(b[1]?.lastAt||0)-Number(a[1]?.lastAt||0));
      id=candidates[0]?.[0]||'';
    }
    if(!id)return null;
    const rec=recordById(id),st=lessonState(id,rec);
    return{lessonId:id,stepId:st.active||String(meta.currentStepId||''),chapterId:rec?.chapterId||null,stageId:rec?.sourceAnchors?.stageId||null,lastActivityAt:Number(st.lastAt||meta.lastActivityAt||0)};
  }
  function reviewQueue(id){
    const rec=recordById(id),summary=checkSummary(id,rec);
    return summary.items.filter(x=>x.state==='review').map(x=>({id:x.id,title:x.title,prompt:x.prompt,reviewStepId:x.reviewStepId||'selfcheck',learningOutcomeRefs:x.learningOutcomeRefs||[]}));
  }
  function resumeSnapshot(){
    const ptr=resumePointer();
    if(!ptr)return null;
    const rec=recordById(ptr.lessonId),base=lessonSnapshot(ptr.lessonId);
    return{...base,...ptr,lessonTitle:rec?.title||rec?.lessonTitle||ptr.lessonId,reviewQueue:reviewQueue(ptr.lessonId)};
  }
  function snapshot(){
    const cur=currentLesson(),id=cur.id||resumePointer()?.lessonId||'',rec=recordById(id),base=lessonSnapshot(id);
    const st=lessonState(id,rec);
    return {...base,lessonTitle:cur.id?cur.title:(rec?.title||rec?.lessonTitle||'Chưa chọn bài học'),chapterId:rec?.chapterId||null,questionResults:st.questionResults||{},reviewQueue:reviewQueue(id)};
  }
  function resume(){
    const ptr=resumePointer();if(!ptr)return false;
    const rec=recordById(ptr.lessonId),st=global.__BAUMAN_CORE_API?.state||global.__MATH_STATE;
    if(!rec||!st)return false;
    st.view='learning';st.learnTab='theory';st.e129LessonId=ptr.lessonId;
    if(ptr.chapterId)st.e129ChapterId=ptr.chapterId;
    if(ptr.stageId){st.stage=ptr.stageId;st.e129StageId=ptr.stageId;}
    if(st.e169Path&&typeof st.e169Path==='object'){st.e169Path.activityId='theory';st.e169Path.lessonId=ptr.lessonId;}
    if(st.e186Path&&typeof st.e186Path==='object'){st.e186Path.activityId='theory';st.e186Path.lessonId=ptr.lessonId;}
    try{global.__BAUMAN_CORE_API?.save?.()}catch(_){}
    try{global.BAUMAN_MATH_THEORY_E129?.render?.()}catch(_){}
    setTimeout(()=>{
      global.BAUMAN_MATH_READER_ROLE_MAP?.map?.();
      refresh();
      if(ptr.stepId)activate(ptr.stepId);
      $('[data-current-lesson]')?.scrollIntoView({behavior:'smooth',block:'start'});
    },220);
    return true;
  }
  function chapterSnapshot(lessonIds){
    const ids=Array.isArray(lessonIds)?lessonIds.filter(Boolean):[];
    if(!ids.length)return{lessonCount:0,startedLessons:0,completedLessons:0,visitedSteps:0,totalSteps:0,percent:0,completionPercent:0,status:'empty'};
    const snaps=ids.map(lessonSnapshot);
    const startedLessons=snaps.filter(x=>x.visitedCount>0).length;
    const completedLessons=snaps.filter(x=>x.completedAt>0).length;
    const visitedSteps=snaps.reduce((n,x)=>n+x.visitedCount,0);
    const totalSteps=snaps.reduce((n,x)=>n+x.totalSteps,0);
    const complete=completedLessons===ids.length;
    return {
      lessonCount:ids.length,
      startedLessons,
      completedLessons,
      visitedSteps,
      totalSteps,
      percent:totalSteps?Math.round(visitedSteps/totalSteps*100):0,
      completionPercent:ids.length?Math.round(completedLessons/ids.length*100):0,
      status:complete?'completed':startedLessons?'started':'not_started'
    };
  }

  function isBookmarked(id){return bookmarks().some(x=>x.id===id)}
  function toggleBookmark(){
    const cur=currentLesson();if(!cur.id)return;
    let list=bookmarks().filter(x=>x.id!==cur.id);
    const existed=isBookmarked(cur.id);
    if(!existed)list.unshift({id:cur.id,title:cur.title,at:Date.now()});
    saveBookmarks(list);refresh();global.BAUMAN_MATH_STUDY_LIBRARY?.refresh?.();
    toast(existed?'Đã bỏ đánh dấu bài học':'Đã đánh dấu bài học');
  }
  function toast(message){
    const el=$('#mathWsToast');
    if(el){el.textContent=message;el.style.opacity='1';clearTimeout(el._timer);el._timer=setTimeout(()=>el.style.opacity='0',1600)}
    else console.info('[Math Lesson Player]',message);
  }
  function stageLabel(){return $('#stageSelect')?.selectedOptions?.[0]?.textContent?.trim()||'Giai đoạn hiện tại'}
  function chapterLabel(rec){
    const active=$$('[data-e129-chapter]').find(x=>x.classList.contains('active')||x.getAttribute('aria-current')==='page');
    const text=active?.textContent?.trim();
    return text||rec?.chapterId||'Chương hiện tại';
  }
  function suggestLabMode(rec=currentRecord()){
    const cur=currentLesson();
    const text=[cur.title,rec?.title,rec?.lessonTitle,rec?.chapterId,(rec?.tags||[]).join(' ')].filter(Boolean).join(' ').toLocaleLowerCase('vi');
    if(/ma trận|matrix|pca|svd|eigen|hiệp phương sai|covariance|linear map|ánh xạ tuyến tính/.test(text))return'matrix';
    if(/vector|vectơ|projection|cosine|dot product|tích vô hướng/.test(text))return'vector';
    return'function';
  }
  function openContextLab(){
    const rec=currentRecord();
    const steps=stepsForRecord(rec);
    const visual=steps.find(x=>x.id==='visualize');
    const hasSimulation=rolesForRecord(rec).has('simulation');
    if(hasSimulation&&visual){
      activate('visualize');
      toast('Đã mở mô phỏng/trực quan gắn với bài hiện tại.');
      return 'lesson';
    }
    toast('Bài hiện tại chưa có mô phỏng được ánh xạ. Math Lab tổng quát chỉ nằm trong Tài nguyên nâng cao.');
    return null;
  }

  function ensure(){
    const main=$('.main'),view=$('#view');if(!main||!view)return;
    let host=$('#mathLearningFlow');
    if(!host){host=document.createElement('section');host.id='mathLearningFlow';main.insertBefore(host,view);}
    let bar=$('#mathLearningStudybar');
    if(!bar){bar=document.createElement('section');bar.id='mathLearningStudybar';bar.className='math-lf-studybar';document.body.appendChild(bar);}
  }
  function checkPanelHtml(cur,rec,st){
    const summary=checkSummary(cur.id,rec);
    if(!summary.total){
      return '<section class="math-lf-check math-lf-check-empty"><div><span>LESSON CHECK</span><b>Chưa có câu kiểm tra nguồn đủ chuẩn</b><p>Bài này chưa thể hoàn thành chính thức cho đến khi có ít nhất một check item hợp lệ. Hệ thống không tự bịa câu hỏi để lấp chỗ trống.</p></div></section>';
    }
    const cards=summary.items.map((item,index)=>{
      const status=st.check?.[item.id]||'';
      return `<article class="math-lf-check-item ${status?'assessed':''}" data-check-status="${esc(status)}">
        <header><span>Câu ${index+1}/${summary.total}</span><b>${esc(item.title)}</b></header>
        <p>${esc(item.prompt)}</p>
        ${item.reference?`<details><summary>Xem đáp án/giải thích nguồn</summary><p>${esc(item.reference)}</p></details>`:'<div class="math-lf-check-source-note">Nguồn chưa tách đáp án riêng. Hãy tự đánh giá sau khi đối chiếu nội dung bài.</div>'}
        <div class="math-lf-check-actions">
          <button type="button" class="${status==='understood'?'active':''}" data-lf-check-id="${esc(item.id)}" data-lf-check-state="understood">Đã hiểu</button>
          <button type="button" class="${status==='review'?'active review':''}" data-lf-check-id="${esc(item.id)}" data-lf-check-state="review">Cần ôn</button>
        </div>
      </article>`;
    }).join('');
    const label=summary.review===0&&summary.complete?'Đã đạt':summary.review===1&&summary.complete?'Cần ôn nhẹ':summary.review>1&&summary.complete?`Cần học lại ${summary.review} mục`:'Chưa hoàn tất';
    return `<section class="math-lf-check">
      <header class="math-lf-check-head"><div><span>LESSON CHECK</span><h4>Kiểm tra nhanh trước khi hoàn thành bài</h4><p>Không chấm điểm giả. Trả lời trước, đối chiếu nguồn rồi tự đánh dấu mức hiểu.</p></div><aside><b>${summary.answered}/${summary.total}</b><span>${esc(label)}</span></aside></header>
      <div class="math-lf-check-grid">${cards}</div>
    </section>`;
  }
  function render(){
    ensure();
    const host=$('#mathLearningFlow'),bar=$('#mathLearningStudybar'),cur=currentLesson(),rec=currentRecord();
    const activeLesson=!!cur.id&&!!cur.host&&!document.body.classList.contains('e129-theory-storage');
    document.body.classList.toggle('math-learning-flow-active',activeLesson);
    if(!activeLesson){if(host)host.innerHTML='';if(bar)bar.innerHTML='';return;}
    const steps=stepsForRecord(rec),st=lessonState(cur.id,rec),active=normalizeActive(st.active,steps),visited=st.visited||{};
    const visitedCount=steps.filter(x=>visited[x.id]).length,pct=steps.length?Math.round(visitedCount/steps.length*100):0;
    const note=notes()[cur.id]||'',objective=rec?.baumanFocus||rec?.programAnchorTitle||'Hiểu bài và kết nối với mục tiêu kỹ thuật.';
    const sourceRoles=rolesForRecord(rec),hasFormula=steps.some(x=>x.id==='formula'),hasSimulation=sourceRoles.has('simulation');
    const activeIndex=Math.max(0,steps.findIndex(x=>x.id===active));
    const completion=completionState(cur.id,rec);
    const completionLabel=completion.completedAt?(completion.check.review===0?'Đã đạt':completion.check.review===1?'Cần ôn nhẹ':`Cần học lại ${completion.check.review} mục`):'';
    host.innerHTML=`<section class="math-lf-shell">
      <header class="math-lf-head">
        <div class="math-lf-title">
          <span class="math-lf-badge">∑</span>
          <div class="math-lf-title-copy">
            <div class="math-lf-breadcrumb"><span>${esc(stageLabel())}</span><i>›</i><span>${esc(chapterLabel(rec))}</span><i>›</i><b>${esc(cur.title)}</b></div>
            <h3>${esc(cur.title)}</h3>
            <p class="math-lf-objective">${esc(objective)}</p>
            <small>${steps.length} bước có nội dung · thời lượng chưa được khai báo trong nguồn</small>
            ${completion.completedAt?`<span class="math-lf-complete-badge">✓ Hoàn thành · ${esc(completionLabel)}</span>`:''}
          </div>
        </div>
        <div class="math-lf-head-actions">
          ${visitedCount>1?`<button type="button" class="primary" data-lf-step="${esc(active)}">Tiếp tục · ${esc(steps[activeIndex]?.label||'Học')}</button>`:''}
          <button type="button" data-lf="bookmark" class="${isBookmarked(cur.id)?'active':''}">${isBookmarked(cur.id)?'★ Đã lưu':'☆ Đánh dấu'}</button>
          <button type="button" data-lf="notes">✎ Ghi chú</button>
        </div>
      </header>
      <div class="math-lf-progress" role="progressbar" aria-label="Các bước bài học đã mở" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
      <nav class="math-lf-steps" aria-label="Các bước trong bài">${steps.map((x,i)=>`<button type="button" class="math-lf-step ${x.id===active?'active':''} ${visited[x.id]?'visited':''}" data-lf-step="${x.id}" aria-current="${x.id===active?'step':'false'}"><span class="math-lf-no">${String(i+1).padStart(2,'0')}</span><span><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span></button>`).join('')}</nav>
      <div class="math-lf-context">
        <div class="math-lf-context-left"><b>Bước ${activeIndex+1}/${steps.length}</b><span>${esc(steps[activeIndex]?.label||'Học')} · ${pct}% bước đã mở</span></div>
        <div class="math-lf-context-right">
          ${hasFormula?'<button class="math-lf-mini-btn" data-lf="formula">∑ Công thức</button>':''}
          ${hasSimulation?'<button class="math-lf-mini-btn" data-lf="lab">∿ Mô phỏng trong bài</button>':''}
          <button class="math-lf-mini-btn" data-lf="focus">⛶ Tập trung</button>
          <button class="math-lf-mini-btn" data-lf="command">⌘K Tài nguyên</button>
        </div>
      </div>
      ${(active==='selfcheck'||active==='summary'||completion.check.answered>0)?checkPanelHtml(cur,rec,st):''}
      <div class="math-lf-notes ${st.notesOpen?'open':''}">
        <div class="math-lf-note-box"><label>Ghi chú cá nhân của bài này</label><textarea id="mathLfNote" placeholder="Ghi lại câu hỏi, cách hiểu, công thức cần nhớ…">${esc(note)}</textarea></div>
        <aside class="math-lf-note-side"><b>Ghi chú chỉ lưu trên thiết bị</b><p>Không chèn vào dữ liệu học thuật và không thay đổi nội dung bài.</p><p class="math-lf-note-status">Tự lưu khi nhập.</p></aside>
      </div>
    </section>`;
    const prev=steps[Math.max(0,activeIndex-1)],next=steps[Math.min(steps.length-1,activeIndex+1)];
    const finalAction=completion.completedAt
      ?'<button type="button" disabled>✓ <span>Đã hoàn thành</span></button>'
      :completion.eligible
        ?'<button type="button" class="primary" data-lf="complete"><span>Hoàn thành bài</span> ✓</button>'
        :completion.check.total&&!completion.check.complete
          ?'<button type="button" class="primary" data-lf="check"><span>Lesson Check</span> →</button>'
          :'<button type="button" disabled><span>Chưa đủ điều kiện</span></button>';
    bar.innerHTML=`<div class="math-lf-study-buttons"><button type="button" data-lf-step="${prev.id}" ${activeIndex===0?'disabled':''}>← <span>${esc(prev.label)}</span></button></div><div class="math-lf-study-current"><small>Bước ${activeIndex+1}/${steps.length} · ${pct}% đã mở</small><b>${esc(steps[activeIndex].label)} · ${esc(cur.title)}</b></div><div class="math-lf-study-buttons">${activeIndex===steps.length-1?finalAction:`<button type="button" class="primary" data-lf-step="${next.id}"><span>${esc(next.label)}</span> →</button>`}</div>`;
    $('#mathLfNote')?.addEventListener('input',e=>{const map=notes();map[cur.id]=e.target.value;saveNotes(map);global.BAUMAN_MATH_STUDY_LIBRARY?.refresh?.()});
  }

  function clearHighlights(){slides().forEach(x=>x.classList.remove('math-lf-highlight'))}
  function clearReveals(){
    $$('.math-lf-reveal').forEach(x=>x.remove());
    $$('[data-e129-block-index][hidden]').forEach(x=>x.hidden=false);
    $$('.e129-slide[data-lf-reveal-level]').forEach(x=>x.removeAttribute('data-lf-reveal-level'));
  }
  function applyReveal(slide,level){
    if(!slide)return;
    const nodes=$$('[data-e129-block-index]',slide);
    nodes.forEach(node=>{
      const index=Number(node.dataset.e129BlockIndex||0);
      node.hidden=level==='all'?false:index>=Number(level);
    });
    slide.dataset.lfRevealLevel=String(level);
    $$('.math-lf-reveal button',slide).forEach(btn=>btn.classList.toggle('active',btn.dataset.lfReveal===String(level)));
  }
  function prepareExampleReveal(slide){
    if(!slide)return false;
    const indices=[...new Set($$('[data-e129-block-index]',slide).map(x=>Number(x.dataset.e129BlockIndex||0)))].sort((a,b)=>a-b);
    if(indices.length<=1)return false;
    $('.math-lf-reveal',slide)?.remove();
    const bar=document.createElement('div');
    bar.className='math-lf-reveal';
    bar.innerHTML=`<span>Tự giải trước khi mở toàn bộ</span><div><button type="button" data-lf-reveal="1">Chỉ phần mở đầu</button>${indices.length>2?'<button type="button" data-lf-reveal="2">Mở thêm 1 phần</button>':''}<button type="button" data-lf-reveal="all">Xem đầy đủ</button></div>`;
    const firstHeading=Array.from(slide.children).find(x=>x.tagName==='H3');
    if(firstHeading)firstHeading.after(bar);else slide.prepend(bar);
    applyReveal(slide,1);
    return true;
  }
  function highlight(el){
    if(!el)return false;
    clearHighlights();el.classList.add('math-lf-highlight');el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>el.classList.remove('math-lf-highlight'),2600);return true;
  }
  function activate(stepId){
    const cur=currentLesson(),rec=currentRecord(),steps=stepsForRecord(rec);
    const step=steps.find(x=>x.id===stepId);if(!step)return;
    const persisted=writeLessonState(cur.id,{active:stepId,visited:{[stepId]:true}});
    if(!persisted){toast('Không lưu được tiến độ trên thiết bị. Trạng thái hoàn thành sẽ không được giả lập.');return;}
    clearReveals();
    render();
    const hit=findSlideByRoles(step.roles||[],rec);
    if(!highlight(hit)){toast(`Bước ${step.label} chưa có nội dung riêng trong bài này.`);return;}
    if(step.id==='example')prepareExampleReveal(hit);
  }
  function markCheck(itemId,value){
    const cur=currentLesson(),rec=currentRecord();
    if(!cur.id||!checkItemsForRecord(rec).some(x=>x.id===itemId))return false;
    const ok=writeLessonState(cur.id,{check:{[itemId]:value}});
    if(!ok){toast('Không lưu được Lesson Check. Trạng thái này sẽ không được giả lập.');return false;}
    render();return true;
  }
  function openLessonCheck(){
    const rec=currentRecord(),steps=stepsForRecord(rec);
    const self=steps.find(x=>x.id==='selfcheck');
    if(self)activate(self.id);
    else render();
    setTimeout(()=>$('.math-lf-check')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
  }
  function completeLesson(){
    const cur=currentLesson(),rec=currentRecord(),gate=completionState(cur.id,rec);
    if(!gate.check.total){toast('Bài này chưa có Lesson Check nguồn đủ chuẩn nên chưa thể đánh dấu hoàn thành.');return false;}
    if(!gate.allStepsVisited){toast('Hãy đi qua các bước có nội dung trước khi hoàn thành bài.');return false;}
    if(!gate.check.complete){toast('Hãy hoàn tất Lesson Check trước khi kết thúc bài.');openLessonCheck();return false;}
    const completedAt=Date.now();
    const ok=writeLessonState(cur.id,{completedAt});
    if(!ok){toast('Không lưu được trạng thái hoàn thành. Bài sẽ không bị đánh dấu hoàn thành giả.');return false;}
    render();
    global.BAUMAN_MATH_DASHBOARD_V2?.refresh?.();
    toast(gate.check.review?'Đã hoàn thành. Các mục cần ôn đã được giữ lại.':'Đã hoàn thành bài.');
    document.dispatchEvent(new CustomEvent('bauman:math:lesson-completed',{detail:{lessonId:cur.id,chapterId:rec?.chapterId||null,completedAt,reviewNeeded:gate.check.review}}));
    return true;
  }
  function toggleNotes(){const cur=currentLesson();if(!cur.id)return;const st=lessonState(cur.id);writeLessonState(cur.id,{notesOpen:!st.notesOpen});render();setTimeout(()=>$('#mathLfNote')?.focus(),30)}
  function toggleFocus(){document.body.classList.toggle('math-ws-focus');toast(document.body.classList.contains('math-ws-focus')?'Đã bật chế độ tập trung':'Đã tắt chế độ tập trung')}

  function bind(){
    document.addEventListener('click',e=>{
      const checkState=e.target.closest('[data-lf-check-state]');
      if(checkState){e.preventDefault();markCheck(checkState.dataset.lfCheckId,checkState.dataset.lfCheckState);return;}
      const reveal=e.target.closest('[data-lf-reveal]');
      if(reveal){e.preventDefault();applyReveal(reveal.closest('.e129-slide'),reveal.dataset.lfReveal);return;}
      const step=e.target.closest('[data-lf-step]');if(step){e.preventDefault();activate(step.dataset.lfStep);return;}
      const action=e.target.closest('[data-lf]')?.dataset.lf;
      if(action){
        e.preventDefault();
        if(action==='bookmark')toggleBookmark();
        if(action==='notes')toggleNotes();
        if(action==='focus')toggleFocus();
        if(action==='formula')global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.();
        if(action==='lab')openContextLab();
        if(action==='command')global.BAUMAN_MATH_NAVIGATION?.openCommand?.();
        if(action==='check')openLessonCheck();
        if(action==='complete')completeLesson();
        return;
      }
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-refresh]'))schedule(220);
    },true);
    document.addEventListener('bauman:math:exercise-result',e=>{
      const d=e.detail||{},id=String(d.lessonId||'');
      if(!id||!recordById(id)||!d.exerciseId)return;
      const saved=writeLessonState(id,{questionResults:{[String(d.exerciseId)]:{
        exerciseId:String(d.exerciseId),chapterId:d.chapterId||null,correct:!!d.correct,answer:String(d.answer??''),reviewStepId:String(d.reviewStepId||''),at:Number(d.at||Date.now())
      }}});
      if(!saved)toast('Không lưu được kết quả bài tập. Hệ thống sẽ không giả lập tiến độ câu hỏi.');
    });
    document.addEventListener('keydown',e=>{
      if(e.target&&/input|textarea|select/i.test(e.target.tagName))return;
      const cur=currentLesson(),steps=stepsForRecord(currentRecord()),st=lessonState(cur.id),idx=Math.max(0,steps.findIndex(x=>x.id===normalizeActive(st.active,steps)));
      if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();activate(steps[Math.min(steps.length-1,idx+1)].id)}
      if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();activate(steps[Math.max(0,idx-1)].id)}
      if(e.key.toLowerCase()==='b'&&e.shiftKey){e.preventDefault();toggleBookmark()}
      if(e.key.toLowerCase()==='n'&&e.shiftKey){e.preventDefault();toggleNotes()}
    });
  }
  function schedule(ms=140){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function refresh(){
    ensure();
    const cur=currentLesson(),rec=currentRecord(),steps=stepsForRecord(rec);
    if(cur.id&&ASSESSMENT_SOURCES[cur.id])loadAssessment(cur.id);
    if(cur.id!==lastLesson){
      lastLesson=cur.id;
      if(cur.id){
        const st=lessonState(cur.id,rec);
        if(!Object.keys(st.visited||{}).length)writeLessonState(cur.id,{active:steps[0].id,visited:{[steps[0].id]:true}});
      }
    }
    render();
  }
  function selfCheck(){
    const cur=currentLesson(),rec=currentRecord(),steps=stepsForRecord(rec);
    return {
      release:RELEASE,
      ready:!!$('#mathLearningFlow'),
      active:document.body.classList.contains('math-learning-flow-active'),
      lessonId:cur.id||null,
      sourceDrivenSteps:steps.map(x=>x.id),
      stepCount:steps.length,
      duplicateProgressEngine:false,
      stateSchemaVersion:STATE_SCHEMA_VERSION,
      resumePointer:resumePointer(),
      questionResults:Object.keys(lessonState(cur.id,rec).questionResults||{}).length,
      assessmentSource:cur.id&&ASSESSMENT_SOURCES[cur.id]?ASSESSMENT_SOURCES[cur.id]:null,
      assessmentLoaded:!!assessmentCache[cur.id]?.loaded,
      notesLocalOnly:true,
      academicWrites:false,
      mutationObserver:false
    };
  }
  function init(){
    if(!document.body||document.body.dataset.mathLearningFlow==='1')return;
    document.body.dataset.mathLearningFlow='1';bind();refresh();
    [350,850,1600,2800].forEach(ms=>setTimeout(refresh,ms));
    global.BAUMAN_MATH_LEARNING_FLOW={release:RELEASE,refresh,activate,toggleBookmark,toggleNotes,openContextLab,openLessonCheck,completeLesson,resume,resumePointer,resumeSnapshot,reviewQueue,snapshot,lessonSnapshot,chapterSnapshot,completionState,checkSummary,selfCheck};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
