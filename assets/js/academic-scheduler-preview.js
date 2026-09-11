'use strict';
(function(){
  const VERSION='Academic Scheduler Preview · Pass 13D';
  const PREVIEW_STORAGE_KEY='bauman_academic_2026_schedule_preview_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  const APPLY_ENABLED=false;
  const MAX_PREVIEW_CHANGES=6;
  const PREVIEW_DAYS=7;
  const ALLOWED_ACTIONS=new Set(['DIAGNOSE','LOCATE_FAILED_NODES','REPAIR_MATCHED','BRIDGE_TO_READY','REPAIR','REVIEW_DIAGNOSTIC']);
  const MUTABLE_EXISTING_SOURCES=new Set(['auto','review']);
  const SLOT_PREF={
    russian:['morning1','morning2','reviewMorning'],
    research:['morning1','morning2','reviewMorning'],
    math:['afternoon','morning2','reviewAfternoon'],
    programming:['afternoon','morning2','reviewAfternoon'],
    systems:['afternoon','morning2','reviewAfternoon'],
    ai:['afternoon','morning2','reviewAfternoon'],
    foundation:['morning1','morning2','reviewMorning']
  };

  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const pad=n=>String(n).padStart(2,'0');
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  function parseDate(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date()}
  function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)}
  function mondayOf(s){const d=parseDate(s),off=(d.getDay()+6)%7;d.setDate(d.getDate()-off);return iso(d)}
  function currentUserScope(){try{const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');return String(u?.email||'anonymous').toLowerCase()}catch{return 'anonymous'}}
  function stableEntries(entries){return Object.fromEntries(Object.entries(entries||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v]))}
  function fnv1a(text){let hash=0x811c9dc5;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193)}return (hash>>>0).toString(16).padStart(8,'0')}
  function scheduleFingerprint(){const s=window.state?.schedule||{};return fnv1a(JSON.stringify({autoStage:s.autoStage||'',autoFrom:s.autoFrom||'',autoTo:s.autoTo||'',targetScore:Number(s.targetScore)||null,entries:stableEntries(s.entries||{})}))}

  function readPreviewStore(){try{const x=JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY)||'null');return x&&typeof x==='object'?x:{schema:'bauman_academic_schedule_preview_store_v1',version:'PASS13D',users:{}}}catch{return {schema:'bauman_academic_schedule_preview_store_v1',version:'PASS13D',users:{}}}}
  function writeStoredPreview(preview){const store=readPreviewStore();store.version='PASS13D';store.users=store.users&&typeof store.users==='object'?store.users:{};store.users[currentUserScope()]={preview:clone(preview)};localStorage.setItem(PREVIEW_STORAGE_KEY,JSON.stringify(store));return preview}
  function readStoredPreview(){const store=readPreviewStore();return store.users?.[currentUserScope()]?.preview||null}
  function discardStoredPreview(){const store=readPreviewStore();if(store.users?.[currentUserScope()])delete store.users[currentUserScope()];localStorage.setItem(PREVIEW_STORAGE_KEY,JSON.stringify(store));return true}

  function academicRuntime(){return window.BAUMAN_ACADEMIC_2026_RUNTIME||null}
  function stageId(){return academicRuntime()?.currentStageId?.()||'before_stankin'}
  function previewStart(){const s=window.state?.schedule||{};return mondayOf(s.weekStart||iso(new Date()))}
  function daySlots(date){const dow=parseDate(date).getDay();if(dow>=1&&dow<=5)return ['morning1','morning2','afternoon'];if(dow===6)return ['reviewMorning','reviewAfternoon'];return ['reviewMorning']}
  function slotEligible(date){if(typeof window.app?.isNoStudyDate==='function'&&window.app.isNoStudyDate(date))return false;if(typeof window.app?.isEligibleStudyDate==='function'&&!window.app.isEligibleStudyDate(date))return false;return true}
  function previewSlotPool(start){const entries=window.state?.schedule?.entries||{},slots=[];for(let d=0;d<PREVIEW_DAYS;d++){const date=addDays(start,d);if(!slotEligible(date))continue;for(const slotId of daySlots(date)){const key=`${date}|${slotId}`,current=entries[key]||null,source=current?.source||'empty';const protectedEntry=Boolean(current&&!MUTABLE_EXISTING_SOURCES.has(source));slots.push({key,date,slotId,current:clone(current),source,protected:protectedEntry})}}return slots}
  function courseRiskRank(intervention,stage){const rt=academicRuntime();const risks=(intervention.threatCourses||[]).map(c=>rt?.courseRisk?.(c.id,stage)?.priorityScore||0);return risks.length?Math.max(...risks):0}
  function eligibleInterventions(stage){const rt=academicRuntime();if(!rt)return [];return (rt.activeRepairPlan?.(stage)||[]).filter(x=>ALLOWED_ACTIONS.has(x.action)&&!x.broadStop&&x.action!=='STOP_BROAD'&&x.action!=='JIT_ONLY'&&x.activation?.id!=='stopped'&&x.state?.id!=='mastered').map(x=>({...x,courseRiskPriority:courseRiskRank(x,stage)})).sort((a,b)=>(b.courseRiskPriority-a.courseRiskPriority)||(b.priorityScore-a.priorityScore))}
  function proposalFor(intervention){const routeIds=(intervention.repairRoutes||[]).map(r=>r.id),failedNodeIds=intervention.state?.diag?.failedNodeIds||[],subjectId=intervention.gate?.homeSubject||'';let task='Prerequisite action';if(intervention.action==='DIAGNOSE')task='Chẩn đoán prerequisite trước khi học lại';else if(intervention.action==='LOCATE_FAILED_NODES')task='Khoanh chính xác node sai từ diagnostic';else if(intervention.action==='REPAIR_MATCHED')task='Sửa đúng node đã sai theo route có bằng chứng';else if(intervention.action==='BRIDGE_TO_READY')task='Bridge hẹp lên READY';else if(intervention.action==='REVIEW_DIAGNOSTIC')task='Rà lại diagnostic và route';else if(intervention.action==='REPAIR')task='Repair theo diagnostic';
    return {subjectId,itemId:'',learningItem:`${intervention.gateId} · ${task}${routeIds.length?` · ${routeIds.join(', ')}`:''}`,label:`Academic 2026 · ${intervention.action}`,source:'academic_preview',academic2026:{gateId:intervention.gateId,action:intervention.action,routeIds,failedNodeIds,affectedCourseIds:(intervention.threatCourses||[]).map(c=>c.id),evidenceRequired:intervention.action==='REPAIR_MATCHED'}};
  }
  function slotScore(slot,proposal){const pref=SLOT_PREF[proposal.subjectId]||['afternoon','morning2','morning1','reviewMorning','reviewAfternoon'];let score=0;if(slot.source==='empty')score+=30;if(slot.source==='auto')score+=20;if(slot.source==='review')score+=12;if(slot.current?.subjectId===proposal.subjectId)score+=8;const i=pref.indexOf(slot.slotId);if(i>=0)score+=10-i;return score}
  function diffType(slot){if(slot.source==='empty')return 'ADD_EMPTY';if(slot.source==='auto')return 'REPLACE_AUTO';if(slot.source==='review')return 'REPLACE_REVIEW';return 'PROTECTED'}

  function generateSchedulePreview(){
    const rt=academicRuntime();if(!rt||!window.state?.schedule)throw new Error('Academic runtime hoặc Main schedule chưa sẵn sàng.');
    const stage=stageId(),start=previewStart(),end=addDays(start,PREVIEW_DAYS-1),baselineFingerprint=scheduleFingerprint(),slots=previewSlotPool(start),protectedSlots=slots.filter(s=>s.protected),available=slots.filter(s=>!s.protected),interventions=eligibleInterventions(stage),changes=[],used=new Set();
    for(const intervention of interventions){if(changes.length>=MAX_PREVIEW_CHANGES)break;const proposed=proposalFor(intervention);if(intervention.action==='REPAIR_MATCHED'&&!proposed.academic2026.routeIds.length)continue;const candidates=available.filter(s=>!used.has(s.key)).sort((a,b)=>slotScore(b,proposed)-slotScore(a,proposed)||a.key.localeCompare(b.key));const slot=candidates[0];if(!slot)break;used.add(slot.key);changes.push({key:slot.key,date:slot.date,slotId:slot.slotId,diffType:diffType(slot),current:clone(slot.current),proposed,gateId:intervention.gateId,action:intervention.action,courseRiskPriority:intervention.courseRiskPriority,repairEvidence:clone(proposed.academic2026)});}
    const rollbackBaseline=Object.fromEntries(changes.map(c=>[c.key,clone(c.current)]));
    const preview={schema:'bauman_academic_schedule_preview_v1',version:'PASS13D',generatedAt:new Date().toISOString(),stageId:stage,range:{start,end,days:PREVIEW_DAYS},mode:'preview_only',applyEnabled:APPLY_ENABLED,applyGate:'browser_e2e_regression_required',baselineFingerprint,currentFingerprint:baselineFingerprint,maxChanges:MAX_PREVIEW_CHANGES,changes,protectedManualAndExternal:protectedSlots.map(s=>({key:s.key,source:s.source,entry:clone(s.current)})),rollbackBaseline,summary:{proposedChanges:changes.length,manualOrExternalPreserved:protectedSlots.length,matchedRepairSessions:changes.filter(c=>c.action==='REPAIR_MATCHED').length,diagnosticSessions:changes.filter(c=>c.action==='DIAGNOSE'||c.action==='LOCATE_FAILED_NODES'||c.action==='REVIEW_DIAGNOSTIC').length,stopGatesExcluded:(rt.activeRepairPlan?.(stage)||[]).filter(x=>x.broadStop||x.action==='STOP_BROAD'||x.action==='JIT_ONLY'||x.state?.id==='mastered').map(x=>x.gateId)}};
    return writeStoredPreview(preview);
  }
  function previewIsStale(preview=readStoredPreview()){return !preview||preview.baselineFingerprint!==scheduleFingerprint()}
  function rollbackPackage(preview=readStoredPreview()){if(!preview)return null;return {schema:'bauman_academic_schedule_rollback_v1',previewGeneratedAt:preview.generatedAt,baselineFingerprint:preview.baselineFingerprint,entries:clone(preview.rollbackBaseline||{}),requiresFingerprintMatch:true}}
  function applySchedulePreview(){if(!APPLY_ENABLED)throw new Error('Apply đang khóa cho tới khi Browser/E2E regression gate PASS. Pass13D chỉ tạo preview/diff.');throw new Error('Apply implementation chưa được bật.')}

  function currentLabel(entry){if(!entry)return 'Trống';return `${entry.subjectId||'—'} · ${entry.learningItem||entry.label||entry.source||'Lịch hiện tại'}`}
  function proposedLabel(entry){return `${entry.subjectId||'—'} · ${entry.learningItem||entry.label||'Academic preview'}`}
  function previewModal(preview){const stale=previewIsStale(preview),rows=(preview.changes||[]).map(c=>`<div class="academic2026-preview-row"><div><b>${h(c.date)} · ${h(c.slotId)}</b><small>${h(c.diffType)}</small></div><div><span>Hiện tại</span><p>${h(currentLabel(c.current))}</p></div><div><span>Đề xuất</span><p>${h(proposedLabel(c.proposed))}</p><small>${c.repairEvidence?.routeIds?.length?`Route: ${h(c.repairEvidence.routeIds.join(', '))}`:'Không tự bịa repair route'}</small></div></div>`).join('')||'<p class="academic2026-note">Không có slot an toàn để đề xuất trong tuần đang xem hoặc chưa có intervention phù hợp.</p>';
    const stop=(preview.summary?.stopGatesExcluded||[]).join(', ')||'—';
    return `<div class="academic2026-preview-summary"><span><b>${h(preview.summary?.proposedChanges||0)}</b><small>thay đổi đề xuất</small></span><span><b>${h(preview.summary?.manualOrExternalPreserved||0)}</b><small>slot manual/external được bảo vệ</small></span><span><b>${h(preview.summary?.matchedRepairSessions||0)}</b><small>repair có bằng chứng</small></span><span><b>${h(preview.summary?.diagnosticSessions||0)}</b><small>diagnostic/khoanh lỗi</small></span></div><p class="academic2026-note">Khoảng preview: ${h(preview.range.start)} → ${h(preview.range.end)} · Stage ${h(preview.stageId)}. Gate STOP/JIT rộng bị loại khỏi lịch repair: ${h(stop)}.</p>${stale?'<div class="academic2026-preview-stale">Lịch Main đã thay đổi sau khi tạo preview. Preview này đã stale và không được phép Apply.</div>':''}<div class="academic2026-preview-list">${rows}</div><div class="academic2026-preview-actions"><button class="btn" onclick="discardAcademicSchedulePreview2026()">Hủy preview</button><button class="btn primary" disabled title="Chờ Browser/E2E regression gate">Apply đang khóa · Browser/E2E chưa PASS</button></div><p class="academic2026-note">Rollback baseline đã được đóng gói cho đúng các slot có diff. Pass13D không ghi vào schedule.entries và không gọi autoSchedule().</p>`;
  }
  function openSchedulePreview(){try{const preview=generateSchedulePreview();if(typeof window.openModal==='function')window.openModal('Academic 2026 · Scheduler Preview',previewModal(preview),true);else alert(`Preview: ${preview.summary.proposedChanges} thay đổi đề xuất`);return preview}catch(err){alert(err.message||String(err));return null}}
  function discardPreviewFromUi(){discardStoredPreview();if(typeof window.closeModal==='function')window.closeModal()}
  function renderPreviewPanel(){const root=document.querySelector('[data-academic2026="home"]');if(!root||root.querySelector('[data-academic13d="preview"]'))return;const stored=readStoredPreview(),stale=stored?previewIsStale(stored):false;root.insertAdjacentHTML('beforeend',`<article class="academic2026-panel academic2026-preview-panel" data-academic13d="preview"><div class="academic2026-head"><div><span class="academic2026-badge">PASS 13D · PREVIEW/DIFF ONLY</span><h3>Scheduler Integration Preview</h3><p>Tạo bản đề xuất từ Course Risk + Active Repair nhưng không thay đổi lịch thật. Manual/external slot luôn được bảo vệ.</p></div><span class="academic2026-lock">Apply: LOCKED</span></div><div class="academic2026-preview-guard"><span>✓ STOP gate bị loại</span><span>✓ Repair cần failed-node evidence</span><span>✓ Rollback baseline</span><span>✓ Fingerprint chống apply trên lịch stale</span></div><div class="academic2026-preview-actions"><button class="btn primary" onclick="openAcademicSchedulePreview2026()">Tạo / xem preview tuần</button>${stored?`<span class="academic2026-note">Preview gần nhất: ${h(stored.range?.start||'—')} → ${h(stored.range?.end||'—')} · ${stale?'STALE':'baseline còn khớp'}</span>`:'<span class="academic2026-note">Chưa tạo preview.</span>'}</div></article>`)}
  function patchHome(){if(!window.app||window.app.__academic13dPreviewPatched)return false;const app=window.app,oldHome=app.home?.bind(app);if(!oldHome)return false;app.__academic13dPreviewPatched=true;app.home=function(){oldHome();renderPreviewPanel()};app.home();return true}
  function init(attempt=0){const ready=academicRuntime()&&window.BAUMAN_PREREQ_2026&&window.state?.schedule;if(ready&&patchHome()){console.info(VERSION,{applyEnabled:APPLY_ENABLED,storage:PREVIEW_STORAGE_KEY,maxChanges:MAX_PREVIEW_CHANGES});return}if(attempt<50)setTimeout(()=>init(attempt+1),100);else console.warn(`${VERSION} disabled safely: runtime not ready`)}

  window.openAcademicSchedulePreview2026=openSchedulePreview;
  window.discardAcademicSchedulePreview2026=discardPreviewFromUi;
  window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026=Object.freeze({version:VERSION,generateSchedulePreview,readStoredPreview,discardStoredPreview,previewIsStale,rollbackPackage,applySchedulePreview,applyEnabled:APPLY_ENABLED,storageKey:PREVIEW_STORAGE_KEY});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>init(0),0));
})();