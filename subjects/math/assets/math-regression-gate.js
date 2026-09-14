/* Bauman Math Regression Gate V2
 * Runtime/static-DOM gate only. It does NOT claim browser/Chromium QA or CI.
 */
(function mathRegressionGate(global){
  'use strict';
  const RELEASE='MATH_REGRESSION_GATE_V2';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let report=null;
  function row(id,label,state,detail){return{id,label,state,detail}}
  function duplicateIds(){const map=new Map(),dupes=[];$$('[id]').forEach(el=>{const id=el.id;if(!id)return;map.set(id,(map.get(id)||0)+1)});map.forEach((n,id)=>{if(n>1)dupes.push(`${id}×${n}`)});return dupes}
  function scriptSources(){return $$('script[src]').map(x=>x.getAttribute('src')||'')}
  function moduleCheck(name,api){
    if(!api)return row(`module-${name}`,name,'fail','Global API chưa được nạp.');
    try{
      const r=api.selfCheck?.();
      const bad=r&&((r.academicWrites===true)||(r.newRouteEngine===true)||(r.routeEngineReplacement===true)||(r.mutationObserver===true)||(r.generatedQuestions===true)||(r.gradingAuthority===true));
      return row(`module-${name}`,name,bad?'fail':'pass',r?Object.entries(r).filter(([k,v])=>['release','ready','loaded','academicWrites','mutationObserver','newRouteEngine','routeEngineReplacement','generatedQuestions','gradingAuthority','localOnly','localConfidenceOnly'].includes(k)).map(([k,v])=>`${k}=${v}`).join(' · '):'API có mặt');
    }catch(e){return row(`module-${name}`,name,'warn',String(e?.message||e))}
  }
  function currentSlideGate(){const slides=$$('.e129-slide').filter(x=>x.offsetParent!==null);if(!slides.length)return row('slides','Reader slide contract','warn','Không ở màn theory hoặc chưa có slide hiển thị.');const ids=slides.map(x=>x.dataset.slideId).filter(Boolean),unique=new Set(ids);if(ids.length&&unique.size!==ids.length)return row('slides','Reader slide contract','fail',`Có slideId trùng: ${ids.length} id / ${unique.size} unique.`);return row('slides','Reader slide contract',slides.length>=16?'pass':'warn',`${slides.length} slide đang hiển thị${slides.length<16?' · dưới policy 16 của lesson đầy đủ':''}.`)}
  function run(){
    const rows=[],scripts=scriptSources(),dupes=duplicateIds();
    rows.push(row('e235','E235 protected formula align',scripts.some(x=>x.includes('theory-formula-fraction-align-E235.js'))?'pass':'fail',scripts.some(x=>x.includes('theory-formula-fraction-align-E235.js'))?'E235 vẫn được nạp.':'Không tìm thấy E235 trong boot.'));
    const forbidden=['E236','E237','E238'].filter(x=>scripts.some(s=>s.includes(x)));rows.push(row('disabled','E236/E237/E238 disabled',forbidden.length?'fail':'pass',forbidden.length?`Đang được nạp ngoài policy: ${forbidden.join(', ')}`:'Không có E236/E237/E238 trong script boot.'));
    rows.push(row('ids','DOM ID uniqueness',dupes.length?'fail':'pass',dupes.length?`ID trùng: ${dupes.slice(0,10).join(', ')}`:'Không phát hiện ID trùng trong DOM hiện tại.'));
    rows.push(currentSlideGate());
    rows.push(moduleCheck('E129 Theory',global.BAUMAN_MATH_THEORY_E129));
    rows.push(moduleCheck('Workspace',global.BAUMAN_MATH_WORKSPACE));
    rows.push(moduleCheck('Premium UI',global.BAUMAN_MATH_PREMIUM));
    rows.push(moduleCheck('Dashboard V2',global.BAUMAN_MATH_DASHBOARD_V2));
    rows.push(moduleCheck('Navigation',global.BAUMAN_MATH_NAVIGATION));
    rows.push(moduleCheck('Role Map',global.BAUMAN_MATH_READER_ROLE_MAP));
    rows.push(moduleCheck('Learning Flow',global.BAUMAN_MATH_LEARNING_FLOW));
    rows.push(moduleCheck('Study Library',global.BAUMAN_MATH_STUDY_LIBRARY));
    rows.push(moduleCheck('Activity Studio',global.BAUMAN_MATH_ACTIVITY_STUDIO));
    rows.push(moduleCheck('Activity Mastery',global.BAUMAN_MATH_ACTIVITY_MASTERY));
    rows.push(moduleCheck('Formula Library',global.BAUMAN_MATH_FORMULA_LIBRARY));
    rows.push(moduleCheck('Formula Context',global.BAUMAN_MATH_FORMULA_CONTEXT));
    rows.push(moduleCheck('Simulation Source',global.BAUMAN_MATH_SIMULATION_SOURCE));
    rows.push(moduleCheck('Professor Drill',global.BAUMAN_MATH_PROFESSOR_DRILL));
    rows.push(moduleCheck('Integration Sync',global.BAUMAN_MATH_INTEGRATION_SYNC));
    const sim=global.BAUMAN_MATH_SIMULATION_SOURCE?.selfCheck?.();if(sim)rows.push(row('sim-source','Simulation canonical-source policy',sim.sampleRecordUsed?'fail':'pass',`canonical=${sim.canonicalRecords} · currentMatch=${sim.currentMatches} · embedded=${sim.embeddedSimulationSlides} · sampleRecordUsed=${sim.sampleRecordUsed}`));
    const fl=global.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.();if(fl)rows.push(row('formula-source','Formula Library source policy',fl.formulaContentSampleRecordUsed?'fail':fl.total?'pass':'warn',`source=${fl.source} · total=${fl.total} · sampleRecordUsed=${fl.formulaContentSampleRecordUsed}`));
    const pd=global.BAUMAN_MATH_PROFESSOR_DRILL?.selfCheck?.();if(pd)rows.push(row('professor-source','Professor Drill source policy',(pd.sampleRecordsRendered||pd.generatedQuestions||pd.gradingAuthority)?'fail':'pass',`source=${pd.source} · items=${pd.items} · generatedQuestions=${pd.generatedQuestions} · gradingAuthority=${pd.gradingAuthority}`));
    const am=global.BAUMAN_MATH_ACTIVITY_MASTERY?.selfCheck?.();if(am)rows.push(row('mastery-policy','Activity mastery local-state policy',(am.academicWrites||am.gradingAuthority)?'fail':'pass',`cards=${am.cards} · mastered=${am.mastered} · localOnly=${am.localOnly} · gradingAuthority=${am.gradingAuthority}`));
    rows.push(row('browser','Browser/Chromium QA','warn','Chưa chạy trong gate này; phải kiểm bằng browser/Work trước publish.'));
    const summary={total:rows.length,pass:rows.filter(x=>x.state==='pass').length,warn:rows.filter(x=>x.state==='warn').length,fail:rows.filter(x=>x.state==='fail').length};
    report={release:RELEASE,checkedAt:new Date().toISOString(),summary,rows,browserQA:false,ci:false,publishAllowed:false};render();return report;
  }
  function ensure(){
    if(!$('#mathRegressionGate')){const layer=document.createElement('section');layer.id='mathRegressionGate';layer.className='math-regression-gate';layer.innerHTML='<div class="math-rg-shell"><header class="math-rg-head"><div><small>Regression Gate</small><h2>Gate an toàn UI/Runtime môn Toán</h2><p>Kiểm boot, module, ID, slide contract, nguồn nội dung và protected scripts; browser QA vẫn là gate riêng.</p></div><div class="math-rg-actions"><button data-rg="run">Chạy lại</button><button data-rg="close">Đóng ×</button></div></header><div id="mathRgList" class="math-rg-list"></div><footer class="math-rg-foot"><div id="mathRgSummary" class="math-rg-summary">Chưa chạy.</div><button data-rg="export">Export report</button></footer></div>';document.body.appendChild(layer);layer.addEventListener('click',e=>{if(e.target===layer)close()})}ensureButton()}
  function ensureButton(){const grid=$('#mathUnifiedSystem .math-unified-system-grid');if(!grid||$('#mathRegressionButton',grid))return;const b=document.createElement('button');b.id='mathRegressionButton';b.type='button';b.dataset.rg='open';b.className='math-rg-nav';b.textContent='Gate';grid.appendChild(b)}
  function render(){ensure();if(!report)return;const list=$('#mathRgList'),sum=$('#mathRgSummary');if(list)list.innerHTML=report.rows.map(x=>`<article class="math-rg-row ${x.state}"><i></i><div><b>${esc(x.label)}</b><span>${esc(x.detail)}</span></div><strong>${x.state.toUpperCase()}</strong></article>`).join('');if(sum)sum.innerHTML=`<b>${report.summary.pass}/${report.summary.total}</b> PASS · ${report.summary.warn} WARN · ${report.summary.fail} FAIL · publishAllowed=false`;const btn=$('#mathRegressionButton');if(btn){btn.textContent=report.summary.fail?'Gate !':report.summary.warn?'Gate ·':'Gate ✓';btn.style.color=report.summary.fail?'#ef8a8a':report.summary.warn?'#e3be66':'#69dbac'}}
  function open(){ensure();run();$('#mathRegressionGate')?.classList.add('open')}
  function close(){$('#mathRegressionGate')?.classList.remove('open')}
  function exportReport(){const r=report||run(),blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bauman_math_regression_gate_${Date.now()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},300)}
  function bind(){document.addEventListener('click',e=>{const a=e.target.closest('[data-rg]')?.dataset.rg;if(!a)return;e.preventDefault();if(a==='open')open();if(a==='close')close();if(a==='run')run();if(a==='export')exportReport()},true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathRegressionGate'),lastSummary:report?.summary||null,browserQA:false,publishAllowed:false,academicWrites:false,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathRegressionGate==='1')return;document.body.dataset.mathRegressionGate='1';ensure();bind();[1200,3000].forEach(ms=>setTimeout(run,ms));global.BAUMAN_MATH_REGRESSION_GATE={release:RELEASE,run,open,close,getReport:()=>report,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
