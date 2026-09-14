/* Bauman Math Formula Context V1
 * Adds read-only backlinks from Formula Library to semantic slides in current lesson.
 */
(function mathFormulaContext(global){
  'use strict';
  const RELEASE='MATH_FORMULA_CONTEXT_V1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=0;
  function state(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(state().e169Path?.lessonId||state().e129LessonId||'')}
  function records(){const raw=global.DB?.theory_lecture_content;if(Array.isArray(raw))return raw;if(Array.isArray(raw?.records))return raw.records;if(Array.isArray(raw?.items))return raw.items;return[]}
  function record(){const id=lessonId();return records().find(r=>(r.lessonId||r.id)===id)||null}
  function flattenSlide(s){return [s?.title,s?.role,(s?.blocks||[]).map(b=>[b?.body,b?.content,b?.text,b?.formula,b?.meaning,b?.description].filter(Boolean).join(' ')).join(' ')].filter(Boolean).join(' ')}
  function tokens(text){return [...new Set(String(text||'').toLocaleLowerCase('vi').replace(/\\[a-z]+/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/).filter(x=>x.length>=3))].slice(0,24)}
  function currentFormula(){return{title:$('#mathFlStage .math-fl-card h3')?.textContent||'',latex:$('#mathFlStage .math-fl-formula')?.textContent||''}}
  function scoreSlide(slide,formula){const hay=flattenSlide(slide).toLocaleLowerCase('vi'),ts=tokens(`${formula.title} ${formula.latex}`);let score=0;ts.forEach(t=>{if(hay.includes(t))score+=1});const latex=String(formula.latex||'').replace(/\s+/g,'').slice(0,80);if(latex&&flattenSlide(slide).replace(/\s+/g,'').includes(latex))score+=8;return score}
  function matches(){const rec=record(),formula=currentFormula();return (rec?.slides||[]).map((s,i)=>({slide:s,index:i,score:scoreSlide(s,formula)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,4)}
  function render(){
    clearTimeout(timer);timer=setTimeout(()=>{
      const card=$('#mathFlStage .math-fl-card');if(!card)return;
      let host=$('#mathFormulaContext',card);if(!host){host=document.createElement('section');host.id='mathFormulaContext';host.className='math-fl-context';const formula=$('.math-fl-formula',card);formula?.insertAdjacentElement('afterend',host)}
      if(!host)return;const hits=matches(),id=lessonId();
      host.innerHTML=`<div class="math-fl-context-head"><b>Liên hệ với bài đang học</b><span>${esc(id||'chưa chọn lesson')}</span></div>${hits.length?`<div class="math-fl-context-list">${hits.map(x=>`<button class="math-fl-context-hit" data-fl-context-slide="${x.index}"><i>${String(x.index+1).padStart(2,'0')}</i><span><b>${esc(x.slide?.title||`Slide ${x.index+1}`)}</b><small>${esc(String(x.slide?.role||'semantic').replace(/_/g,' '))}</small></span><em>score ${x.score}</em></button>`).join('')}</div>`:`<div class="math-fl-context-empty">Chưa tìm thấy liên hệ đủ rõ với slide semantic của bài hiện tại. Không tự gán liên hệ khi nguồn không hỗ trợ.</div>`}`;
    },35)
  }
  function openSlide(index){
    global.BAUMAN_MATH_FORMULA_LIBRARY?.close?.();global.BAUMAN_MATH_NAVIGATION?.route?.('theory');
    setTimeout(()=>{const slides=$$('.e129-slide').filter(x=>x.offsetParent!==null),hit=slides[index];if(hit){hit.classList.add('math-lf-highlight');hit.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>hit.classList.remove('math-lf-highlight'),2500)}},260)
  }
  function bind(){document.addEventListener('click',e=>{const idx=e.target.closest('[data-fl-context-slide]')?.dataset.flContextSlide;if(idx!=null){e.preventDefault();openSlide(Number(idx)||0);return}if(e.target.closest('[data-fl],[data-fl-index],[data-fl-group]'))render()},true)}
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathFormulaContext'),lessonId:lessonId()||null,matches:matches().length,academicWrites:false,semanticLinkInferenceOnly:true,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathFormulaContext==='1')return;document.body.dataset.mathFormulaContext='1';bind();[900,1800,3200].forEach(ms=>setTimeout(render,ms));global.BAUMAN_MATH_FORMULA_CONTEXT={release:RELEASE,render,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
