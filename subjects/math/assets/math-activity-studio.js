/* Bauman Math Activity Studio V1
 * Enhances E169 non-theory activity placeholders from canonical content sources.
 * Read-only: never creates academic records and never treats sampleRecord as content.
 */
(function mathActivityStudio(global){
  'use strict';
  const RELEASE='MATH_ACTIVITY_STUDIO_V1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const clip=(s,n=420)=>{s=String(s??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
  let timer=0,loading=null;
  const cache={};

  const SOURCES={
    exercises:[['exercise','data/exercise_content.json'],['question','data/question_bank_content.json']],
    practice:[['simulation','data/simulation_content.json']],
    application:[['application','data/application_content.json']],
    review:[['review','data/review_pack_content.json']],
    exam:[['question','data/question_bank_content.json'],['blueprint','data/test_blueprint_content.json'],['professor','data/professor_qa_content.json']]
  };
  const FALLBACK_ROLES={
    exercises:['practice','professor_qa','mini_case'],
    practice:['simulation','practice','mini_case'],
    application:['application','real_bridge'],
    review:['takeaway','bridge','core_formula','notation','mastery_close','troubleshooting','code_contract_audit','preprocessing_distinction'],
    exam:['professor_qa','practice','retrieval','assessment']
  };
  const META={
    exercises:{title:'Bài tập · Củng cố tư duy',kicker:'Exercise Studio',desc:'Ưu tiên bài tập/câu hỏi canonical theo lessonId; nếu nguồn companion chưa có record, dùng đúng slide practice/vấn đáp đã có trong bài lý thuyết.'},
    practice:{title:'Thực hành · Hiện thực hóa',kicker:'Practice Studio',desc:'Kết nối bài đang học với mô phỏng và phần thực hành đã có. Không tự sinh code hay test case khi nguồn chưa cung cấp.'},
    application:{title:'Ứng dụng · Kỹ thuật',kicker:'Application Studio',desc:'Đọc tình huống ứng dụng canonical hoặc các slide application/real bridge của chính bài đang học.'},
    review:{title:'Ôn tập · Hệ thống hóa',kicker:'Review Studio',desc:'Gom takeaway, bridge và công thức của bài hiện tại; ưu tiên review pack canonical khi có dữ liệu.'},
    exam:{title:'Kiểm tra · Đánh giá',kicker:'Assessment Studio',desc:'Chỉ hiển thị câu hỏi/blueprint/vấn đáp đã tồn tại trong nguồn. Không tự gọi đây là đề thi đầy đủ khi companion source chưa có record.'}
  };

  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function activity(){return String(state().e186Path?.activityId||state().e169Path?.activityId||state().learnTab||'theory')}
  function lessonId(){return String(state().e186Path?.lessonId||state().e169Path?.lessonId||state().e129LessonId||'')}
  function chapterId(){
    const id=lessonId(),records=theoryRecords();
    return String(records.find(r=>(r.lessonId||r.id)===id)?.chapterId||state().e129ChapterId||'');
  }
  function theoryRecords(){const x=global.DB?.theory_lecture_content;if(Array.isArray(x))return x;if(Array.isArray(x?.records))return x.records;if(Array.isArray(x?.lessons))return x.lessons;if(Array.isArray(x?.items))return x.items;return[]}
  function currentTheory(){const id=lessonId();return theoryRecords().find(r=>(r.lessonId||r.id)===id)||null}
  function recordsOf(raw){if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;if(Array.isArray(raw?.lessons))return raw.lessons;return[]}

  async function fetchJson(path){
    if(Object.prototype.hasOwnProperty.call(cache,path))return cache[path];
    try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);const data=await r.json();cache[path]={ok:true,data,records:recordsOf(data),error:null};}
    catch(error){cache[path]={ok:false,data:null,records:[],error:String(error?.message||error)}}
    return cache[path];
  }
  function load(){
    if(loading)return loading;
    const all=[...new Set(Object.values(SOURCES).flat().map(x=>x[1]))];
    loading=Promise.all(all.map(fetchJson)).then(()=>cache);return loading;
  }

  function matched(sourceKind,raw){
    const id=lessonId(),ch=chapterId();
    return recordsOf(raw).filter(r=>{
      const rid=String(r.lessonId||'');const rch=String(r.chapterId||'');
      if(sourceKind==='blueprint')return (!!ch&&rch===ch)||(!ch&&!rch);
      return (!!id&&rid===id)||(!id&&!!ch&&rch===ch);
    });
  }
  function roleSlides(){
    const rec=currentTheory(),wanted=FALLBACK_ROLES[activity()]||[];
    return (rec?.slides||[]).filter(s=>wanted.includes(String(s?.role||'').toLowerCase())).slice(0,6);
  }
  function textFromBlock(b){
    if(!b||typeof b!=='object')return String(b||'');
    return [b.body,b.content,b.text,b.formula,b.meaning,b.description].filter(Boolean).join(' · ');
  }
  function slideCard(sl){
    const role=String(sl?.role||'embedded').replace(/_/g,' '),title=sl?.title||role;
    const blocks=Array.isArray(sl?.blocks)?sl.blocks:[];
    const body=blocks.map(textFromBlock).filter(Boolean).join(' ').trim()||sl?.body||sl?.content||sl?.text||'';
    const formula=blocks.map(b=>b?.formula||((String(b?.type||'').toLowerCase()==='formula')?b?.body:'')).filter(Boolean)[0]||'';
    return `<article class="math-activity-card"><span class="role">Embedded · ${esc(role)}</span><h4>${esc(title)}</h4><p>${esc(clip(body||'Nội dung semantic đã có trong theory_lecture_content.',520))}</p>${formula?`<pre>${esc(clip(formula,260))}</pre>`:''}</article>`;
  }
  function companionCard(kind,r){
    if(kind==='exercise')return `<article class="math-activity-card"><span class="role">exercise_content</span><h4>${esc(r.title||r.exerciseId||'Bài tập')}</h4><p>${esc(clip(r.prompt||'',500))}</p>${r.solution?`<details><summary style="margin-top:8px;color:#6fcfff;font-size:8px;cursor:pointer">Xem lời giải canonical</summary><p style="margin-top:7px">${esc(clip(r.solution,700))}</p></details>`:''}</article>`;
    if(kind==='question')return `<article class="math-activity-card"><span class="role">question_bank</span><h4>${esc(r.title||r.questionId||'Câu hỏi')}</h4><p>${esc(clip(r.question||'',500))}</p>${Array.isArray(r.options)?`<p>${r.options.map((x,i)=>`${String.fromCharCode(65+i)}. ${esc(x)}`).join(' · ')}</p>`:''}${r.answer?`<details><summary style="margin-top:8px;color:#6fcfff;font-size:8px;cursor:pointer">Đáp án canonical</summary><p style="margin-top:7px">${esc(clip(r.answer,500))}</p></details>`:''}</article>`;
    if(kind==='application')return `<article class="math-activity-card"><span class="role">application_content</span><h4>${esc(r.title||r.applicationId||'Ứng dụng')}</h4><p>${esc(clip(r.scenario||'',430))}</p>${r.method?`<pre>${esc(clip(r.method,420))}</pre>`:''}</article>`;
    if(kind==='simulation')return `<article class="math-activity-card"><span class="role">simulation_content</span><h4>${esc(r.title||r.simulationId||'Mô phỏng')}</h4><p>${esc(clip(r.purpose||'',500))}</p></article>`;
    if(kind==='review'){const items=Array.isArray(r.items)?r.items:[];return `<article class="math-activity-card"><span class="role">review_pack</span><h4>${esc(r.title||r.reviewPackId||'Gói ôn tập')}</h4><p>${esc(clip(items.map(x=>x.prompt||x.text||x.title).filter(Boolean).join(' · '),650))}</p></article>`}
    if(kind==='blueprint')return `<article class="math-activity-card"><span class="role">test_blueprint</span><h4>${esc(r.title||r.blueprintId||'Blueprint kiểm tra')}</h4><p>${esc(r.distribution?Object.entries(r.distribution).map(([k,v])=>`${k}: ${v}`).join(' · '):'Blueprint canonical')}</p></article>`;
    if(kind==='professor')return `<article class="math-activity-card"><span class="role">professor_qa</span><h4>${esc(r.title||r.qaId||'Vấn đáp')}</h4><p>${esc(clip(r.question||'',500))}</p>${r.answer?`<details><summary style="margin-top:8px;color:#6fcfff;font-size:8px;cursor:pointer">Gợi ý trả lời</summary><p style="margin-top:7px">${esc(clip(r.answer,600))}</p></details>`:''}</article>`;
    return '';
  }

  function sourceStatuses(){
    const cfg=SOURCES[activity()]||[];
    return cfg.map(([kind,path])=>{const c=cache[path];const count=c?.records?.length||0;const match=c?.data?matched(kind,c.data).length:0;return{kind,path,ok:c?.ok!==false,count,match,error:c?.error||''}});
  }
  function render(){
    const act=activity(),meta=META[act],view=$('#view');
    const active=!!meta&&state().view==='learning'&&act!=='theory'&&!!view;
    document.body.classList.toggle('math-activity-studio-active',active);
    if(!active)return false;
    let host=$('#mathActivityStudio');
    if(!host){host=document.createElement('section');host.id='mathActivityStudio';host.className='math-activity-studio';const old=$('.e169-activity-card',view);if(old)old.parentNode.insertBefore(host,old);else view.prepend(host)}
    const statuses=sourceStatuses();
    const companion=[];
    (SOURCES[act]||[]).forEach(([kind,path])=>{const c=cache[path];if(c?.data)matched(kind,c.data).slice(0,6).forEach(r=>companion.push(companionCard(kind,r)))});
    const fallback=roleSlides().map(slideCard);
    const cards=companion.length?companion:fallback;
    const id=lessonId(),ch=chapterId();
    const sourceHtml=statuses.map(x=>`<span class="math-activity-source ${x.match?'live':'fallback'}"><i></i>${esc(x.path.replace('data/',''))}: ${x.count} records · ${x.match} match</span>`).join('')+`<span class="math-activity-source ${fallback.length?'live':'fallback'}"><i></i>theory embedded: ${fallback.length} semantic slide</span>`;
    const sourceMode=companion.length?'COMPANION_CANONICAL':'EMBEDDED_THEORY_FALLBACK';
    host.innerHTML=`<header class="math-activity-hero"><div><span class="math-activity-kicker">${esc(meta.kicker)}</span><h2>${esc(meta.title)}</h2><p>${esc(meta.desc)}</p></div><div class="math-activity-hero-actions"><button class="math-activity-btn primary" data-activity-action="theory">← Bài lý thuyết</button><button class="math-activity-btn" data-activity-action="lab">∿ Math Lab</button><button class="math-activity-btn" data-activity-action="control">☷ Nội dung</button></div></header><div class="math-activity-source-strip">${sourceHtml}</div><div class="math-activity-grid"><section class="math-activity-panel"><div class="math-activity-panel-head"><h3>Nội dung khả dụng</h3><span>${cards.length} mục · ${sourceMode}</span></div><div class="math-activity-cards">${cards.length?cards.join(''):`<div class="math-activity-empty">Chưa có companion record và bài hiện tại cũng chưa có slide semantic phù hợp. Studio không tự sinh nội dung thay thế.</div>`}</div></section><aside class="math-activity-panel"><div class="math-activity-panel-head"><h3>Ngữ cảnh</h3><span>read-only</span></div><div class="math-activity-side"><div class="math-activity-status"><b>${esc(id||'Chưa gắn lessonId')}</b><span>${esc(ch||'Chưa xác định chapterId')}</span><strong>${sourceMode}</strong></div><div class="math-activity-status"><b>Chính sách nguồn</b><span>sampleRecord trong các *_content.json chỉ là schema example/DRAFT và không được render như dữ liệu học thật.</span></div><div class="math-activity-next"><button data-activity-action="formula"><span>∑ Công thức bài hiện tại</span><b>→</b></button><button data-activity-action="library"><span>★ Study Library</span><b>→</b></button><button data-activity-action="vault"><span>▣ DataVault E129</span><b>→</b></button></div></div></aside></div>`;
    return true;
  }
  function backTheory(){
    const st=state(),id=lessonId();st.view='learning';st.learnTab='theory';st.e129LessonId=id;
    if(st.e186Path){st.e186Path.activityId='theory';st.e186Path.lessonId=id}
    if(st.e169Path){st.e169Path.activityId='theory';st.e169Path.lessonId=id}
    try{global.__BAUMAN_CORE_API?.save?.()}catch(_){ }try{global.BAUMAN_MATH_THEORY_E129?.render?.()}catch(_){ }setTimeout(()=>{global.BAUMAN_MATH_READER_ROLE_MAP?.map?.();global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.();$('#view')?.scrollIntoView({behavior:'smooth',block:'start'})},180);
  }
  function action(a){if(a==='theory')backTheory();if(a==='lab')global.BAUMAN_MATH_SIMULATION_SOURCE?.openForCurrent?.()||global.BAUMAN_MATH_WORKSPACE?.openLab?.();if(a==='control')global.BAUMAN_MATH_WORKSPACE?.openControl?.();if(a==='formula')global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.();if(a==='library')global.BAUMAN_MATH_STUDY_LIBRARY?.open?.();if(a==='vault')global.BAUMAN_MATH_THEORY_E129?.openTheoryVault?.()}
  function schedule(ms=150){clearTimeout(timer);timer=setTimeout(()=>load().then(render),ms)}
  function bind(){document.addEventListener('click',e=>{const a=e.target.closest('[data-activity-action]')?.dataset.activityAction;if(a){e.preventDefault();action(a);return}if(e.target.closest('[data-e186-pick="activity"],[data-e169-pick-activity],[data-math-nav],[data-e129-back-theory],[data-e129-nav]'))schedule(180)},true)}
  function selfCheck(){const act=activity();return{release:RELEASE,ready:!!$('#mathActivityStudio'),activity:act,lessonId:lessonId()||null,canonicalSources:(SOURCES[act]||[]).length,companionMatches:sourceStatuses().reduce((s,x)=>s+x.match,0),embeddedFallbackSlides:roleSlides().length,sampleRecordsRendered:false,academicWrites:false,mutationObserver:false,newRouteEngine:false}}
  function init(){if(!document.body||document.body.dataset.mathActivityStudio==='1')return;document.body.dataset.mathActivityStudio='1';bind();load().then(()=>{render();[500,1200,2400].forEach(ms=>setTimeout(render,ms))});global.BAUMAN_MATH_ACTIVITY_STUDIO={release:RELEASE,refresh:()=>schedule(0),render,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
