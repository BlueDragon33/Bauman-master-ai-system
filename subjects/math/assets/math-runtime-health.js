/* Bauman Math Runtime Health V5
 * Aggregates existing selfCheck APIs. UI/diagnostic only.
 */
(function mathRuntimeHealth(global){
  'use strict';
  const RELEASE='MATH_RUNTIME_HEALTH_V5';
  let lastReport=null;
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const MODULES=[
    ['E129 Theory',()=>global.BAUMAN_MATH_THEORY_E129?.selfCheck?.()],
    ['Program Frame E130',()=>global.BAUMAN_MATH_E130_PROGRAM_FRAME?.selfCheck?.()],
    ['Math Workspace',()=>global.BAUMAN_MATH_WORKSPACE?.selfCheck?.()],
    ['Premium UI',()=>global.BAUMAN_MATH_PREMIUM?.selfCheck?.()],
    ['Dashboard V2',()=>global.BAUMAN_MATH_DASHBOARD_V2?.selfCheck?.()],
    ['Unified Navigation',()=>global.BAUMAN_MATH_NAVIGATION?.selfCheck?.()],
    ['Reader Role Map',()=>global.BAUMAN_MATH_READER_ROLE_MAP?.selfCheck?.()],
    ['Learning Flow',()=>global.BAUMAN_MATH_LEARNING_FLOW?.selfCheck?.()],
    ['Study Library',()=>global.BAUMAN_MATH_STUDY_LIBRARY?.selfCheck?.()],
    ['System Bridge',()=>global.BAUMAN_MATH_SYSTEM_BRIDGE?.selfCheck?.()],
    ['Simulation Source',()=>global.BAUMAN_MATH_SIMULATION_SOURCE?.selfCheck?.()],
    ['Formula Library',()=>global.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.()],
    ['Formula Context',()=>global.BAUMAN_MATH_FORMULA_CONTEXT?.selfCheck?.()],
    ['Activity Studio',()=>global.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.()],
    ['Activity Mastery',()=>global.BAUMAN_MATH_ACTIVITY_MASTERY?.selfCheck?.()],
    ['Study Command Center',()=>global.BAUMAN_MATH_STUDY_COMMAND_CENTER?.selfCheck?.()],
    ['Professor Drill',()=>global.BAUMAN_MATH_PROFESSOR_DRILL?.selfCheck?.()],
    ['Integration Sync',()=>global.BAUMAN_MATH_INTEGRATION_SYNC?.selfCheck?.()],
    ['Regression Gate',()=>global.BAUMAN_MATH_REGRESSION_GATE?.selfCheck?.()]
  ];
  function ensure(){
    if(!$('#mathRuntimeHealth')){
      const layer=document.createElement('section');layer.id='mathRuntimeHealth';layer.className='math-runtime-health';
      layer.innerHTML='<div class="math-health-shell"><header class="math-health-head"><div><small>Runtime Health</small><h2>Kiểm tra hệ thống môn Toán</h2><p>Self-check tại trình duyệt; không thay thế browser QA/CI chính thức.</p></div><div class="math-health-actions"><button type="button" data-health="refresh">Kiểm tra lại</button><button type="button" data-health="close">Đóng ×</button></div></header><div id="mathHealthList" class="math-health-list"></div><footer class="math-health-foot"><div id="mathHealthSummary" class="math-health-summary">Chưa kiểm tra.</div><button type="button" data-health="export">Export report</button></footer></div>';
      document.body.appendChild(layer);layer.addEventListener('click',e=>{if(e.target===layer)close()});
    }
    ensureSystemButton();
  }
  function ensureSystemButton(){
    const grid=$('#mathUnifiedSystem .math-unified-system-grid');if(!grid||$('#mathHealthButton',grid))return;
    const b=document.createElement('button');b.id='mathHealthButton';b.type='button';b.dataset.health='open';b.textContent='Health';b.className='math-health-nav';grid.appendChild(b);
  }
  function summarize(name,value,error){
    if(error)return{name,state:'fail',detail:String(error?.message||error),raw:null};
    if(!value)return{name,state:'warn',detail:'API/selfCheck chưa sẵn sàng ở thời điểm kiểm tra.',raw:null};
    const explicitFail=value.ok===false||value.ready===false&&('ready'in value);
    const unsafe=value.academicWrites===true||value.mutationObserver===true||value.newRouteEngine===true||value.routeEngineReplacement===true||value.generatedQuestions===true||value.gradingAuthority===true||value.correctnessInference===true;
    const state=unsafe?'fail':explicitFail?'warn':'pass';
    const facts=[];
    Object.entries(value).forEach(([k,v])=>{if(['release','ok','ready'].includes(k))return;if(typeof v==='boolean')facts.push(`${k}=${v}`);else if(typeof v==='number'||typeof v==='string')facts.push(`${k}=${String(v).slice(0,80)}`)});
    return{name,state,detail:facts.slice(0,7).join(' · ')||'Self-check trả về trạng thái hợp lệ.',raw:value};
  }
  function check(){
    const rows=MODULES.map(([name,fn])=>{try{return summarize(name,fn(),null)}catch(e){return summarize(name,null,e)}});
    const pass=rows.filter(x=>x.state==='pass').length,warn=rows.filter(x=>x.state==='warn').length,fail=rows.filter(x=>x.state==='fail').length;
    lastReport={release:RELEASE,checkedAt:new Date().toISOString(),summary:{total:rows.length,pass,warn,fail},rows,browserQA:false,ci:false};
    render();updateSidebar();return lastReport;
  }
  function render(){
    ensure();const report=lastReport||check(),list=$('#mathHealthList'),sum=$('#mathHealthSummary');
    if(list)list.innerHTML=report.rows.map(x=>`<article class="math-health-row ${x.state}"><i class="math-health-dot"></i><div class="math-health-copy"><b>${esc(x.name)}</b><span>${esc(x.detail)}</span></div><strong class="math-health-state">${x.state.toUpperCase()}</strong></article>`).join('');
    if(sum)sum.innerHTML=`<b>${report.summary.pass}/${report.summary.total}</b> lớp PASS · ${report.summary.warn} WARN · ${report.summary.fail} FAIL · browser QA chưa chạy`;
  }
  function updateSidebar(){
    ensureSystemButton();const head=$('#mathUnifiedSystem .math-unified-system-head span'),btn=$('#mathHealthButton');if(!lastReport)return;
    if(head)head.textContent=`Math runtime · ${lastReport.summary.pass}/${lastReport.summary.total}`;
    if(btn){btn.classList.toggle('warn',lastReport.summary.warn>0||lastReport.summary.fail>0);btn.textContent=lastReport.summary.fail?'Health !':lastReport.summary.warn?'Health ·':'Health ✓';}
  }
  function open(){ensure();check();$('#mathRuntimeHealth')?.classList.add('open')}
  function close(){$('#mathRuntimeHealth')?.classList.remove('open')}
  function exportReport(){const report=lastReport||check(),blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bauman_math_runtime_health_${Date.now()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},300)}
  function bind(){
    document.addEventListener('click',e=>{const a=e.target.closest('[data-health]')?.dataset.health;if(!a)return;e.preventDefault();if(a==='open')open();if(a==='close')close();if(a==='refresh')check();if(a==='export')exportReport()},true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
  function init(){if(!document.body||document.body.dataset.mathRuntimeHealth==='1')return;document.body.dataset.mathRuntimeHealth='1';ensure();bind();[950,2050,3500].forEach(ms=>setTimeout(check,ms));global.BAUMAN_MATH_RUNTIME_HEALTH={release:RELEASE,check,open,close,getReport:()=>lastReport,selfCheck:()=>({release:RELEASE,ready:!!$('#mathRuntimeHealth'),modules:MODULES.length,diagnosticOnly:true,academicWrites:false})}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
