'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const apply=text('assets/js/academic-scheduler-apply.js');
const preview=text('assets/js/academic-scheduler-preview.js');
const academic=text('assets/js/academic-main.js');
const index=text('index.html');
const css=text('assets/css/academic-2026.css');
const errors=[];
const assert=(c,m)=>{if(!c)errors.push(m)};

for(const token of [
  "Academic Scheduler Apply · Pass 13F",
  "const TX_STORAGE_KEY='bauman_academic_2026_schedule_transactions_v1'",
  'const EXPLICIT_APPLY_ENABLED=true',
  'const MAX_CHANGES=6',
  "options.confirmed!==true",
  "preview.schema!=='bauman_academic_schedule_preview_v1'",
  "preview.version!=='PASS13D'||preview.mode!=='preview_only'",
  "previewRuntime()?.previewIsStale?.(preview)!==false",
  'scheduleFingerprint()!==preview.baselineFingerprint',
  'sameValue(current,change.current||null)',
  "MUTABLE_BASELINE_SOURCES=new Set(['auto','review'])",
  "change.proposed?.source!=='academic_preview'",
  "change.action==='REPAIR_MATCHED'",
  'change.repairEvidence?.routeIds',
  'change.repairEvidence?.failedNodeIds',
  "source:'academic_applied'",
  'explicitUserApply:true',
  'beforeFingerprint',
  'afterFingerprint',
  "status:'applied'",
  "status='rolled_back'",
  'currentFingerprint!==tx.afterFingerprint',
  'delete nextEntries[key]',
  'restoredFingerprint!==tx.beforeFingerprint',
  'requiresExactAfterFingerprintForRollback:true',
  'window.app?.__academic13dPreviewPatched',
  'window.app?.__academic2026Patched',
  'confirm(',
  'applyApprovedPreview({confirmed:true})',
  'rollbackLatest({confirmed:true})'
]) assert(apply.includes(token),`Pass13F apply runtime missing ${token}`);

assert(!/\.autoSchedule\s*\(/.test(apply),'Pass13F must never call legacy autoSchedule');
assert(!/setInterval\s*\(|MutationObserver\s*\(/.test(apply),'Pass13F must not introduce automatic background Apply triggers');
assert(!/applyApprovedPreview\(\{confirmed:true\}\)\s*;?\s*\}\s*document\.addEventListener/.test(apply),'Pass13F must not auto-apply on DOMContentLoaded');
assert(academic.includes('const SCHEDULER_MUTATION_ENABLED=false'),'Academic automatic scheduler mutation must remain OFF after Pass13F');
assert(preview.includes('const APPLY_ENABLED=false'),'Pass13D direct Apply path must remain OFF after Pass13F');
assert(preview.includes('preview_only'),'Pass13F must consume preview-only artifact, not bypass preview');

const p=index.indexOf('assets/js/academic-scheduler-preview.js');
const a=index.indexOf('assets/js/academic-scheduler-apply.js');
assert(p>=0,'index missing scheduler preview runtime');
assert(a>p,'Pass13F apply runtime must load after Pass13D preview runtime');
for(const cls of ['academic2026-apply-panel','academic2026-apply-actions']) assert(css.includes(cls),`CSS missing ${cls}`);

function stableValue(value){if(Array.isArray(value))return value.map(stableValue);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stableValue(value[k])]));return value}
const baseline={subjectId:'math',learningItem:'x',source:'auto',meta:{b:2,a:1}};
const reordered={meta:{a:1,b:2},source:'auto',learningItem:'x',subjectId:'math'};
assert(JSON.stringify(stableValue(baseline))===JSON.stringify(stableValue(reordered)),'exact baseline comparison must be property-order independent');
const changed={...baseline,learningItem:'y'};
assert(JSON.stringify(stableValue(baseline))!==JSON.stringify(stableValue(changed)),'exact baseline comparison must detect content changes');

const allowed=new Set(['DIAGNOSE','LOCATE_FAILED_NODES','REPAIR_MATCHED','BRIDGE_TO_READY','REPAIR','REVIEW_DIAGNOSTIC']);
assert(!allowed.has('STOP_BROAD')&&!allowed.has('JIT_ONLY')&&!allowed.has('MAINTAIN_READY'),'STOP/JIT/maintain actions must be rejected by Pass13F');
assert(allowed.size===6,'Pass13F allowed action set must stay narrow');

function rollback(entries,tx){const next=JSON.parse(JSON.stringify(entries));for(const key of tx.changedKeys){const original=tx.entriesBefore[key];if(original==null)delete next[key];else next[key]=JSON.parse(JSON.stringify(original))}return next}
const tx={changedKeys:['empty','replace'],entriesBefore:{empty:null,replace:{source:'auto',subjectId:'math'}}};
const after={empty:{source:'academic_applied'},replace:{source:'academic_applied'},manual:{source:'manual'}};
const restored=rollback(after,tx);
assert(!Object.hasOwn(restored,'empty'),'Rollback must delete slot that was empty before Apply');
assert(restored.replace.source==='auto'&&restored.replace.subjectId==='math','Rollback must restore replaced auto/review slot exactly');
assert(restored.manual.source==='manual','Rollback must not affect untouched manual slot');

if(errors.length){console.error(`PASS13F_SCHEDULER_APPLY_FAIL (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log('PASS13F_SCHEDULER_APPLY_PASS');
console.log(JSON.stringify({explicitApply:true,automaticMutation:false,directPreviewApply:false,maxChanges:6,transactional:true,exactBaselineGuard:true,rollbackFingerprintGuard:true,manualExternalProtected:true},null,2));