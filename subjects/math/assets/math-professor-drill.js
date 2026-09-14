/* Bauman Math Professor Drill V1
 * Read-only oral-practice surface.
 * Source priority: professor_qa_content/question_bank_content -> semantic theory slides.
 * Never generates questions or treats sampleRecord as content.
 */
(function mathProfessorDrill(global){
  'use strict';
  const RELEASE='MATH_PROFESSOR_DRILL_V1';
  const STORE='bauman_math_professor_drill_v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let sources=null,index=0,items=[];
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(state().e169Path?.lessonId||state().e129LessonId||'')}
  function chapterId(){return String(state().e169Path?.chapterId||state().e129ChapterId||'')}
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(_){return{}}}
  function setStore(v){try{localStorage.setItem(STORE,JSON.stringify(v))}catch(_){}}
  function readConfidence(key){return getStore()[key]||'ok'}
  function writeConfidence(key,value){const all=getStore();all[key]=value;setStore(all);render()}
  function recordsOf(raw){if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;return[]}
  async function fetchJson(path){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);const data=await r.json();return{ok:true,data,records:recordsOf(data)}}catch(error){return{ok:false,data:null,records:[],error:String(error?.message||error)}}}
  async function loadSources(){if(sources)return sources;const [professor,questions]=await Promise.all([fetchJson('data/professor_qa_content.json'),fetchJson('data/question_bank_content.json')]);sources={professor,questions};return sources}
  function theoryRecords(){const raw=global.DB?.theory_lecture_content;if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;return[]}
  function theoryRecord(){const id=lessonId();return theoryRecords().find(r=>(r.lessonId||r.id)===id)||null}
  function text(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function blockValue(block,keys){for(const k of keys){const v=text(block?.[k]);if(v)return v}return''}
  function semanticItems(){
    const rec=theoryRecord();if(!rec)return[];
    return (rec.slides||[]).map((slide,slideIndex)=>{
      const role=String(slide?.role||'').toLowerCase();if(!['professor_qa','retrieval','retrieval_check','assessment'].includes(role))return null;
      const blocks=Array.isArray(slide.blocks)?slide.blocks:[];
      let question=text(slide.question||slide.prompt),answer=text(slide.answer||slide.expectedAnswer||slide.solution);
      if(!question)question=blocks.map(b=>blockValue(b,['question','prompt','title'])).find(Boolean)||text(slide.title);
      if(!answer)answer=blocks.map(b=>blockValue(b,['answer','expectedAnswer','solution','explanation','hint'])).find(Boolean)||'';
      if(!question)return null;
      return{key:`theory:${lessonId()}:${slide.id||slide.slideId||slideIndex}`,source:'theory semantic',title:text(slide.title)||'Vấn đáp',question,answer,slideIndex,role};
    }).filter(Boolean);
  }
  function companionItems(){
    const id=lessonId(),ch=chapterId(),out=[];
    const push=(kind,record,i)=>{const question=text(record.question||record.prompt||record.title);if(!question)return;out.push({key:`${kind}:${record.qaId||record.questionId||record.id||i}`,source:kind,title:text(record.title)||kind,question,answer:text(record.answer||record.expectedAnswer||record.solution||record.explanation),slideIndex:null,role:kind})};
    for(const [kind,src] of [['professor_qa',sources?.professor],['question_bank',sources?.questions]]){
      (src?.records||[]).filter(r=>String(r.lessonId||'')===id||(!id&&ch&&String(r.chapterId||'')===ch)).forEach((r,i)=>push(kind,r,i));
    }
    return out;
  }
  function build(){const companion=companionItems();items=companion.length?companion:semanticItems();if(index>=items.length)index=Math.max(0,items.length-1);return items}
  function ensure(){
    if(!$('#mathProfessorDrill')){const layer=document.createElement('section');layer.id='mathProfessorDrill';layer.className='math-professor-drill';layer.innerHTML='<div class="math-pd-shell"><header class="math-pd-head"><div><small>Professor Drill</small><h2>Vấn đáp Toán Bauman</h2><p>Câu hỏi lấy từ nguồn hiện có; không sinh thêm và không chấm thay giảng viên.</p></div><button data-pd="close">Đóng ×</button></header><main id="mathPdBody" class="math-pd-body"></main><footer class="math-pd-foot"><div id="mathPdProgress" class="math-pd-progress"></div><div class="math-pd-nav"><button data-pd="prev">← Trước</button><button data-pd="next">Sau →</button></div></footer></div>';document.body.appendChild(layer);layer.addEventListener('click',e=>{if(e.target===layer)close()})}ensureInlineButton()}
  function ensureInlineButton(){const right=$('#mathLearningFlow .math-lf-context-right');if(!right||right.querySelector('[data-pd="open"]'))return;const b=document.createElement('button');b.type='button';b.className='math-lf-mini-btn math-pd-inline';b.dataset.pd='open';b.textContent='🎓 Vấn đáp';right.appendChild(b)}
  function render(){
    ensure();build();const body=$('#mathPdBody'),progress=$('#mathPdProgress');if(!body)return;
    if(!items.length){body.innerHTML='<div class="math-pd-empty">Bài hiện tại chưa có professor/question record và cũng không có slide semantic `professor_qa/retrieval` đủ để tạo phiên vấn đáp. Hệ thống không tự sinh câu hỏi thay thế.</div>';if(progress)progress.textContent='0 câu hỏi';return}
    const item=items[index],conf=readConfidence(item.key),hasAnswer=!!item.answer;
    body.innerHTML=`<article class="math-pd-card"><div class="math-pd-meta"><span>${esc(item.source)}</span><span>${esc(item.role)}</span><span>${esc(lessonId()||'no lesson')}</span></div><section class="math-pd-question"><small>Câu ${index+1}/${items.length}</small><h3>${esc(item.question)}</h3></section><div id="mathPdAnswer" class="math-pd-answer">${hasAnswer?esc(item.answer):'Nguồn hiện tại không tách đáp án/gợi ý riêng cho câu này.'}</div><div class="math-pd-actions"><button class="primary" data-pd="reveal">${hasAnswer?'Hiện đáp án / gợi ý':'Kiểm tra nguồn đáp án'}</button>${Number.isInteger(item.slideIndex)?`<button data-pd-slide="${item.slideIndex}">Mở slide nguồn</button>`:''}</div><div class="math-pd-confidence"><button class="${conf==='need'?'active need':''}" data-pd-confidence="need" data-pd-key="${esc(item.key)}">Cần ôn lại</button><button class="${conf==='ok'?'active ok':''}" data-pd-confidence="ok" data-pd-key="${esc(item.key)}">Trả lời được</button><button class="${conf==='strong'?'active strong':''}" data-pd-confidence="strong" data-pd-key="${esc(item.key)}">Nắm chắc</button></div></article>`;
    if(progress){const all=getStore(),strong=items.filter(x=>all[x.key]==='strong').length,need=items.filter(x=>all[x.key]==='need').length;progress.innerHTML=`<b>${index+1}/${items.length}</b> · ${strong} nắm chắc · ${need} cần ôn`}
  }
  async function open(){ensure();await loadSources();index=0;render();$('#mathProfessorDrill')?.classList.add('open')}
  function close(){$('#mathProfessorDrill')?.classList.remove('open')}
  function openSlide(i){close();global.BAUMAN_MATH_NAVIGATION?.route?.('theory');setTimeout(()=>{const slides=$$('.e129-slide').filter(x=>x.offsetParent!==null),hit=slides[i];if(hit){hit.classList.add('math-lf-highlight');hit.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>hit.classList.remove('math-lf-highlight'),2600)}},260)}
  function bind(){document.addEventListener('click',e=>{const action=e.target.closest('[data-pd]')?.dataset.pd;if(action){e.preventDefault();if(action==='open')open();if(action==='close')close();if(action==='prev'){index=Math.max(0,index-1);render()}if(action==='next'){index=Math.min(Math.max(0,items.length-1),index+1);render()}if(action==='reveal')$('#mathPdAnswer')?.classList.toggle('open');return}const conf=e.target.closest('[data-pd-confidence]')?.dataset.pdConfidence,key=e.target.closest('[data-pd-key]')?.dataset.pdKey;if(conf&&key){e.preventDefault();writeConfidence(key,conf);return}const slide=e.target.closest('[data-pd-slide]')?.dataset.pdSlide;if(slide!=null){e.preventDefault();openSlide(Number(slide)||0);return}if(e.target.closest('[data-e129-lesson],[data-lf-step],[data-math-nav]'))setTimeout(ensureInlineButton,180)},true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if($('#mathProfessorDrill')?.classList.contains('open')&&e.altKey&&e.key==='ArrowRight'){e.preventDefault();index=Math.min(Math.max(0,items.length-1),index+1);render()}if($('#mathProfessorDrill')?.classList.contains('open')&&e.altKey&&e.key==='ArrowLeft'){e.preventDefault();index=Math.max(0,index-1);render()}})}
  function selfCheck(){build();return{release:RELEASE,ready:!!$('#mathProfessorDrill'),lessonId:lessonId()||null,items:items.length,source:companionItems().length?'companion':'theory-semantic-fallback',sampleRecordsRendered:false,generatedQuestions:false,gradingAuthority:false,localConfidenceOnly:true,academicWrites:false,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathProfessorDrill==='1')return;document.body.dataset.mathProfessorDrill='1';ensure();bind();loadSources().then(()=>{[700,1600,3000].forEach(ms=>setTimeout(()=>{ensureInlineButton();build()},ms))});global.BAUMAN_MATH_PROFESSOR_DRILL={release:RELEASE,open,close,refresh:()=>{ensureInlineButton();build()},selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
