'use strict';
(function(){
  const VERSION='Academic Phase2 Current-Main · A4 Transcript / Honors Evidence Registry';
  const POLICY_URL='assets/data/diploma-supplement-honors-policy-rf-2021.json';
  const CURRICULUM_URL='assets/data/official-curriculum-iu5-2026.json';
  const STORE_KEY='bauman_academic_2026_transcript_evidence_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  let policy=null,curriculum=null;
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const dateLabel=v=>{if(!v)return '';const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleDateString('vi-VN'):''};
  const gradeRuntime=()=>window.BAUMAN_GRADE_CONTROL_2026||null;

  function currentUserScope(){
    try{return String(JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null')?.email||'anonymous').toLowerCase()}
    catch{return 'anonymous'}
  }
  function blankStore(){return {schema:'bauman_academic_transcript_evidence_store_v1',version:'A4',users:{}}}
  function readStore(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY)||'null');return x&&typeof x==='object'?x:blankStore()}catch{return blankStore()}}
  function userState(store=readStore()){
    store.version='A4';store.users=store.users&&typeof store.users==='object'?store.users:{};
    const scope=currentUserScope();store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{entries:{}};
    store.users[scope].entries=store.users[scope].entries&&typeof store.users[scope].entries==='object'?store.users[scope].entries:{};
    return {store,scope,user:store.users[scope]};
  }
  function persist(store){localStorage.setItem(STORE_KEY,JSON.stringify(store));return true}
  function isCreditOnly(assessment=[]){return assessment.length>0&&assessment.every(x=>x==='Зчт')}
  function rowNature(assessment=[]){return isCreditOnly(assessment)?'credit':'graded'}

  function candidateRows(){
    if(!curriculum)return [];
    const rows=[];
    for(const d of curriculum.disciplines||[])rows.push({rowId:d.id,kind:'discipline',nameRu:d.nameRu,credits:d.credits,assessment:d.assessment||[],expectedNature:rowNature(d.assessment||[]),requiredForBaseline:true});
    for(const g of curriculum.electiveGroups||[])rows.push({rowId:g.id,kind:'elective_group',nameRu:`Элективная группа ${g.id}`,credits:g.credits,assessment:g.assessment||[],expectedNature:rowNature(g.assessment||[]),requiredForBaseline:true,options:clone(g.options||[]),choose:g.choose||1});
    for(const p of curriculum.practices||[])rows.push({rowId:p.id,kind:'practice',nameRu:p.nameRu,credits:p.credits,assessment:p.assessment||[],expectedNature:rowNature(p.assessment||[]),requiredForBaseline:true});
    for(const g of curriculum.gia||[])rows.push({rowId:g.id,kind:'gia',nameRu:g.nameRu,credits:g.credits,assessment:g.assessment||[],expectedNature:'graded',requiredForBaseline:true});
    return rows;
  }
  function facultativeRows(){
    return (curriculum?.facultatives||[]).map(f=>({rowId:f.id,kind:'facultative',nameRu:f.nameRu,credits:f.credits,assessment:f.assessment||[],expectedNature:rowNature(f.assessment||[]),requiredForBaseline:false,organizationPolicyRequired:true}));
  }
  function rowById(id){return candidateRows().find(x=>x.rowId===id)||facultativeRows().find(x=>x.rowId===id)||null}
  function rawEntry(rowId){const {user}=userState();return clone(user.entries[rowId]||null)}
  function entryState(rowId){
    const row=rowById(rowId);if(!row)return {id:'ENTRY_UNKNOWN',label:'Không có dòng dự kiến',verified:false,row:null,evidence:null};
    const evidence=rawEntry(rowId);if(!evidence)return {id:'ENTRY_UNVERIFIED',label:'Chưa xác minh dòng phụ lục',verified:false,row,evidence:null};
    if(row.expectedNature==='credit'){
      const pass=evidence.transcriptValue==='зачтено';
      return {id:pass?'ENTRY_CREDIT':'ENTRY_CREDIT_FAIL',label:pass?'зачтено · không vào %':'незачтено · đang chặn',verified:true,row,evidence};
    }
    const grade=Number(evidence.transcriptValue);
    const label=grade===5?'отлично':grade===4?'хорошо':grade===3?'удовлетворительно':'неудовлетворительно';
    return {id:grade===5?'ENTRY_GRADE_5':grade===4?'ENTRY_GRADE_4':grade===3?'ENTRY_GRADE_3':'ENTRY_GRADE_2',label:`${grade} · ${label}`,verified:true,row,evidence};
  }
  function recordEntry(rowId,payload={}){
    const row=rowById(rowId);if(!row)throw new Error('Dòng phụ lục dự kiến không tồn tại.');
    if(payload.entryVerified!==true)throw new Error('Phải xác nhận đây là dòng/điểm phụ lục hoặc nguồn học vụ tương đương đã được kiểm chứng.');
    const source=String(payload.source||'').trim();if(source.length<3)throw new Error('Phải ghi nguồn xác minh dòng phụ lục.');
    let selectedOptionId=null,entryName=String(payload.entryName||row.nameRu).trim();
    if(row.kind==='elective_group'){
      selectedOptionId=String(payload.selectedOptionId||'').trim();
      const option=(row.options||[]).find(x=>x.id===selectedOptionId);if(!option)throw new Error('Phải chọn đúng học phần tự chọn đã học trước khi xác minh dòng phụ lục.');entryName=option.nameRu;
    }
    let transcriptValue;
    if(row.expectedNature==='credit'){
      transcriptValue=String(payload.transcriptValue||'').trim();if(!['зачтено','незачтено'].includes(transcriptValue))throw new Error('Dòng Зчт phải là зачтено hoặc незачтено.');
    }else{
      transcriptValue=Number(payload.transcriptValue);if(![2,3,4,5].includes(transcriptValue))throw new Error('Điểm dòng phụ lục có chấm điểm phải là 2, 3, 4 hoặc 5.');
    }
    const evidence={entryVerified:true,source,entryName,selectedOptionId,transcriptValue,notes:String(payload.notes||'').trim(),verifiedAt:new Date().toISOString(),sourceClass:'explicit_verified_diploma_supplement_entry',autoPromotedFromAssessmentEvent:false};
    const {store,user}=userState();user.entries[rowId]=evidence;persist(store);refreshUi();return entryState(rowId);
  }
  function clearEntry(rowId){const {store,user}=userState();delete user.entries[rowId];persist(store);refreshUi();return entryState(rowId)}

  function projection(){
    const rows=candidateRows(),graded=rows.filter(x=>x.expectedNature==='graded'),credits=rows.filter(x=>x.expectedNature==='credit');
    const requiredFive=Math.ceil((policy?.honorsRules?.minimumExcellentShare||0.75)*graded.length);
    return {baselineRows:rows.length,projectedGradeBearingRows:graded.length,projectedCreditRows:credits.length,requiredFiveIfProjectionConfirmed:requiredFive,maximumFoursIfProjectionConfirmed:graded.length-requiredFive,facultativesExcludedPendingPolicy:facultativeRows().length,courseWorkRowsKnown:0,projectionOnly:true};
  }
  function honorsEvaluation(){
    const rows=candidateRows(),states=rows.map(r=>entryState(r.rowId));
    const graded=states.filter(x=>x.row.expectedNature==='graded'),credits=states.filter(x=>x.row.expectedNature==='credit'),verified=states.filter(x=>x.verified),missing=states.filter(x=>!x.verified);
    const five=graded.filter(x=>x.evidence?.transcriptValue===5),four=graded.filter(x=>x.evidence?.transcriptValue===4),low=graded.filter(x=>[2,3].includes(Number(x.evidence?.transcriptValue)));
    const giaBad=graded.filter(x=>x.row.kind==='gia'&&x.verified&&Number(x.evidence?.transcriptValue)!==5),creditFail=credits.filter(x=>x.verified&&x.evidence?.transcriptValue==='незачтено'),p=projection();
    const complete=missing.length===0;let id='EVIDENCE_INCOMPLETE',label='Chưa đủ dữ liệu đã xác minh để đánh giá mục tiêu bằng đỏ';
    if(low.length||giaBad.length||creditFail.length){id='CURRENT_EVIDENCE_BLOCKS_HONORS';label='Dữ liệu đã xác minh hiện tại đang vi phạm điều kiện bằng đỏ'}
    else if(complete&&five.length>=p.requiredFiveIfProjectionConfirmed){id='HONORS_RULES_MET_ON_VERIFIED_LEDGER';label='Đủ điều kiện theo sổ dữ liệu đã xác minh'}
    else if(complete){id='EXCELLENT_SHARE_BELOW_75';label='Tỷ lệ điểm 5 dưới 75%'}
    const projectionCaveatActive=p.projectionOnly===true||String(policy?.hubInterpretation?.bmstuIU5LocalSupplementMapping||'').startsWith('not_yet_verified');
    return {id,label,complete,verifiedRows:verified.length,totalRows:states.length,missingRows:missing.map(x=>x.row.rowId),gradeBearingVerified:graded.filter(x=>x.verified).length,projectedGradeBearingRows:p.projectedGradeBearingRows,fiveCount:five.length,fourCount:four.length,lowGradeRows:low.map(x=>x.row.rowId),giaNonExcellentRows:giaBad.map(x=>x.row.rowId),creditFailRows:creditFail.map(x=>x.row.rowId),excellentShare:complete&&graded.length?five.length/graded.length:null,requiredFive:p.requiredFiveIfProjectionConfirmed,projection:p,projectionCaveatActive,finalEligibilityClaimed:complete&&id==='HONORS_RULES_MET_ON_VERIFIED_LEDGER'&&!projectionCaveatActive};
  }

  function badge(state){
    const cls=state.id==='ENTRY_GRADE_5'||state.id==='ENTRY_CREDIT'?'safe':state.id==='ENTRY_UNVERIFIED'?'empty':state.id==='ENTRY_GRADE_4'?'warn':'fail';
    return `<span class="transcript14e-badge ${cls}">${h(state.label)}</span>`;
  }
  function renderPanel(){
    const e=honorsEvaluation(),p=e.projection;
    const rows=candidateRows().map(r=>{
      const s=entryState(r.rowId),evidence=s.evidence;
      const meta=evidence
        ?[r.expectedNature==='graded'?'Dòng có điểm':'Зчт · không vào % nếu зачтено','Đã xác minh',dateLabel(evidence.verifiedAt),evidence.source].filter(Boolean).join(' · ')
        :[r.kind,r.expectedNature==='graded'?'Dòng có điểm':'Зчт · không vào % nếu зачтено','Chưa xác minh'].join(' · ');
      return `<button class="transcript14e-row" onclick="openAcademicTranscriptEntry2026('${h(r.rowId)}')"><span><b>${h(r.rowId)} · ${h(r.nameRu)}</b><small>${h(meta)}</small></span>${badge(s)}</button>`;
    }).join('');
    return `<section class="transcript14e-shell" data-transcript14e="ledger" data-academic-report data-academic-report-title="Báo cáo phụ lục văn bằng và mục tiêu bằng đỏ"><article class="academic2026-panel"><div class="academic2026-report-tools"><button class="btn" onclick="printAcademicReport2026('Báo cáo phụ lục văn bằng và mục tiêu bằng đỏ')">In / lưu PDF</button></div><div class="academic2026-report-meta"><span><b>Phạm vi:</b> phụ lục văn bằng dự kiến</span><span><b>Dữ liệu:</b> từng dòng đã xác minh</span><span><b>Giới hạn:</b> không thay kết luận học vụ chính thức</span></div><div class="academic2026-head"><div><span class="academic2026-badge">HỌC VỤ · PHỤ LỤC VĂN BẰNG</span><h3>Báo cáo phụ lục văn bằng & mục tiêu bằng đỏ</h3><p>Chỉ tính trên từng dòng phụ lục đã được xác minh, không suy diễn từ số assessment event. Mỗi môn, practice và GIA giữ nguyên cấu trúc theo nguồn học vụ hiện có.</p></div><span class="academic2026-lock">Không tự suy diễn từ assessment</span></div><div class="transcript14e-kpis"><span><b>${e.verifiedRows}/${e.totalRows}</b><small>DÒNG ĐÃ XÁC MINH</small></span><span><b>${p.projectedGradeBearingRows}</b><small>DÒNG CÓ ĐIỂM DỰ KIẾN</small></span><span><b>${p.requiredFiveIfProjectionConfirmed}</b><small>ĐIỂM 5 CẦN THIẾT*</small></span><span><b>${e.fiveCount}</b><small>ĐIỂM 5 ĐÃ XÁC MINH</small></span></div><div class="transcript14e-status"><b>${h(e.label)}</b><small>* ${p.projectedGradeBearingRows} dòng có điểm và ${p.requiredFiveIfProjectionConfirmed} điểm 5 vẫn là phép chiếu từ curriculum hiện tại. Nếu xuất hiện course work/project hoặc quy tắc cục bộ bổ sung, mẫu số phải được cập nhật. Hệ thống không tuyên bố đủ điều kiện bằng đỏ cuối cùng trước khi mapping phụ lục IU5 và mẫu số được xác minh.</small></div><div class="transcript14e-list">${rows}</div></article></section>`;
  }
  function form(rowId){
    const row=rowById(rowId);if(!row)return '<p>Không có dòng.</p>';const s=entryState(rowId),e=s.evidence||{};
    const opts=row.kind==='elective_group'?`<label>Học phần tự chọn đã học<select class="field" id="transcript14eOption"><option value="">Chọn</option>${(row.options||[]).map(o=>`<option value="${h(o.id)}" ${e.selectedOptionId===o.id?'selected':''}>${h(o.id)} · ${h(o.nameRu)}</option>`).join('')}</select></label>`:'';
    const val=row.expectedNature==='credit'
      ? `<label>Giá trị trên phụ lục<select class="field" id="transcript14eValue"><option value="">Chọn</option><option value="зачтено" ${e.transcriptValue==='зачтено'?'selected':''}>зачтено</option><option value="незачтено" ${e.transcriptValue==='незачтено'?'selected':''}>незачтено</option></select></label>`
      : `<label>Điểm trên phụ lục<select class="field" id="transcript14eValue"><option value="">Chọn</option>${[5,4,3,2].map(g=>`<option value="${g}" ${Number(e.transcriptValue)===g?'selected':''}>${g}</option>`).join('')}</select></label>`;
    return `<div class="transcript14e-form"><div>${badge(s)}</div><label class="transcript14e-check"><input id="transcript14eVerified" type="checkbox" ${e.entryVerified?'checked':''}> Tôi đã kiểm chứng dòng/điểm này từ phụ lục, bản nháp học vụ, ведомость hoặc nguồn tương đương có thẩm quyền.</label><label>Nguồn xác minh<input class="field" id="transcript14eSource" value="${h(e.source||'')}" placeholder="Nguồn học vụ / phụ lục / ведомость..."></label>${opts}${val}<label>Ghi chú<textarea class="field" id="transcript14eNotes" rows="3">${h(e.notes||'')}</textarea></label><div class="transcript14e-actions"><button class="btn primary" onclick="saveAcademicTranscriptEntry2026('${h(rowId)}')">Lưu dữ liệu đã xác minh</button>${e.entryVerified?`<button class="btn" onclick="clearAcademicTranscriptEntry2026('${h(rowId)}')">Xóa dữ liệu đã xác minh</button>`:''}</div><p class="academic2026-note">Kết quả đánh giá không tự trở thành dòng phụ lục văn bằng. Với môn có nhiều assessment event, Hub vẫn chỉ tính theo dòng phụ lục đã xác minh.</p></div>`;
  }
  function openEntry(rowId){
    const row=rowById(rowId);if(!row)return;
    const body=`<div class="transcript14e-modal"><h4>${h(row.nameRu)}</h4><p>${row.expectedNature==='graded'?'Dòng có điểm · có thể vào mẫu số bằng đỏ':'Зчт · bị loại khỏi tỷ lệ nếu là зачтено'}</p>${form(rowId)}</div>`;
    if(typeof window.openModal==='function')return window.openModal(`${rowId} · Dữ liệu phụ lục văn bằng`,body,true);
  }
  function saveFromUi(rowId){
    try{const v=id=>document.getElementById(id),state=recordEntry(rowId,{entryVerified:v('transcript14eVerified')?.checked===true,source:v('transcript14eSource')?.value||'',selectedOptionId:v('transcript14eOption')?.value||'',transcriptValue:v('transcript14eValue')?.value,notes:v('transcript14eNotes')?.value||''});openEntry(rowId);if(typeof window.toast==='function')window.toast(`${rowId}: ${state.label}`)}
    catch(err){alert(err.message||String(err))}
  }
  function clearFromUi(rowId){if(!window.confirm('Xóa dữ liệu đã xác minh phụ lục đã xác minh cho '+rowId+'? Thao tác này không thể hoàn tác.'))return;clearEntry(rowId);openEntry(rowId)}
  function refreshUi(){return true}
  function openOverview(){
    const body=renderPanel();
    if(typeof window.openModal==='function')return window.openModal('Báo cáo phụ lục văn bằng & mục tiêu bằng đỏ',body,true);
    return null;
  }
  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function waitBase(timeout=15000){const start=Date.now();while(Date.now()-start<timeout){if(gradeRuntime())return true;await new Promise(r=>setTimeout(r,50))}return false}
  async function load(){
    try{if(!(await waitBase()))throw new Error('A3 Grade runtime did not become ready');[policy,curriculum]=await Promise.all([fetchJson(POLICY_URL),fetchJson(CURRICULUM_URL)]);window.BAUMAN_DIPLOMA_HONORS_POLICY_2026=policy;console.info(VERSION,{policy:policy.version,baselineRows:candidateRows().length,projection:projection(),eventAutoPromotion:false,surface:'progress-modal',homeSurfaceAdded:false,a5Bootstrap:false})}
    catch(err){console.warn('A4 transcript runtime disabled safely:',err)}
  }

  let commandCenterLoadPromise=null;
  function ensureCommandCenterRuntime(){
    if(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026)return Promise.resolve(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026);
    if(commandCenterLoadPromise)return commandCenterLoadPromise;
    commandCenterLoadPromise=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-phase2-command-a5-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='assets/css/academic-command-center-2026.css';link.dataset.phase2CommandA5Style='1';document.head.appendChild(link)}
      const waitReady=()=>{const started=Date.now();(function poll(){if(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026)return resolve(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026);if(Date.now()-started>15000)return reject(new Error('A5 Command Center runtime did not become ready'));setTimeout(poll,50)})()};
      let script=document.querySelector('script[data-phase2-command-a5-runtime]');
      if(script){waitReady();return}
      script=document.createElement('script');script.src='assets/js/academic-command-center-runtime.js';script.dataset.phase2CommandA5Runtime='1';script.async=false;script.addEventListener('load',waitReady,{once:true});script.addEventListener('error',()=>reject(new Error('A5 Command Center runtime failed to load')),{once:true});document.body.appendChild(script);
    }).catch(err=>{commandCenterLoadPromise=null;throw err});
    return commandCenterLoadPromise;
  }

  window.openAcademicTranscriptEntry2026=openEntry;window.saveAcademicTranscriptEntry2026=saveFromUi;window.clearAcademicTranscriptEntry2026=clearFromUi;window.openAcademicTranscriptOverviewA4=openOverview;
  window.BAUMAN_TRANSCRIPT_HONORS_2026=Object.freeze({version:VERSION,load,candidateRows,facultativeRows,rowById,entryState,recordEntry,clearEntry,rawEntry,projection,honorsEvaluation,renderPanel,openOverview,ensureCommandCenterRuntime,storageKey:STORE_KEY,userScoped:true,eventAutoPromotion:false,schedulerMutation:false,courseCompletionMutation:false,policyUrl:POLICY_URL,curriculumUrl:CURRICULUM_URL,surface:'progress-modal',homeSurfaceAdded:false,a5Bootstrap:false,lazyCommandCenterLoad:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});else setTimeout(load,0)
})();