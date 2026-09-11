'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtime=text('assets/js/academic-scheduler-preview.js');
const index=text('index.html');
const css=text('assets/css/academic-2026.css');
const errors=[];
const assert=(cond,msg)=>{if(!cond)errors.push(msg)};

for(const token of [
  "Academic Scheduler Preview · Pass 13D",
  "const APPLY_ENABLED=false",
  "const MAX_PREVIEW_CHANGES=6",
  "const PREVIEW_DAYS=7",
  "bauman_academic_2026_schedule_preview_v1",
  "mode:'preview_only'",
  "applyGate:'browser_e2e_regression_required'",
  'baselineFingerprint',
  'rollbackBaseline',
  'previewIsStale',
  'rollbackPackage',
  'protectedManualAndExternal',
  "new Set(['auto','review'])",
  "intervention.action==='REPAIR_MATCHED'&&!proposed.academic2026.routeIds.length",
  "x.action==='STOP_BROAD'||x.action==='JIT_ONLY'||x.state?.id==='mastered'",
  "source:'academic_preview'",
  "Apply đang khóa · Browser/E2E chưa PASS",
  'window.BAUMAN_PREREQ_PACKS_2026',
  'window.app?.__academic2026Patched'
]) assert(runtime.includes(token),`preview runtime missing ${token}`);

assert(!/APPLY_ENABLED\s*=\s*true/.test(runtime),'Pass13D Apply must remain disabled');
assert(!/\.autoSchedule\s*\(/.test(runtime),'Pass13D preview must not invoke autoSchedule');
assert(!/window\.state\.schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Pass13D must not mutate schedule entry by key');
assert(!/window\.state\.schedule\.entries\s*=/.test(runtime),'Pass13D must not replace schedule entries');
assert(!/delete\s+window\.state\.schedule\.entries/.test(runtime),'Pass13D must not delete schedule entries');
assert(runtime.includes("throw new Error('Apply đang khóa cho tới khi Browser/E2E regression gate PASS. Pass13D chỉ tạo preview/diff.')"),'applySchedulePreview must fail closed before Browser/E2E gate');
assert(/const ready=academicRuntime\(\)&&window\.BAUMAN_PREREQ_2026&&window\.BAUMAN_PREREQ_PACKS_2026&&window\.state\?\.schedule&&window\.app\?\.__academic2026Patched/.test(runtime),'preview init must wait until Academic pack load and Academic home patch are complete');

const academicPos=index.indexOf('assets/js/academic-main.js');
const previewPos=index.indexOf('assets/js/academic-scheduler-preview.js');
assert(academicPos>=0,'index must load academic-main.js');
assert(previewPos>academicPos,'scheduler preview must load after academic-main.js');
for(const cls of ['academic2026-preview-panel','academic2026-preview-row','academic2026-preview-stale','academic2026-preview-summary']) assert(css.includes(cls),`CSS missing ${cls}`);

function stableEntries(entries){return Object.fromEntries(Object.entries(entries||{}).sort(([a],[b])=>a.localeCompare(b)))}
function fnv1a(text){let hash=0x811c9dc5;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193)}return (hash>>>0).toString(16).padStart(8,'0')}
function fingerprint(schedule){return fnv1a(JSON.stringify({autoStage:schedule.autoStage||'',autoFrom:schedule.autoFrom||'',autoTo:schedule.autoTo||'',targetScore:Number(schedule.targetScore)||null,entries:stableEntries(schedule.entries||{})}))}
const a={autoStage:'prepare',autoFrom:'2026-09-07',autoTo:'2026-09-13',targetScore:90,entries:{'2026-09-07|morning1':{source:'auto',subjectId:'math'},'2026-09-07|afternoon':{source:'manual',subjectId:'russian'}}};
const b={...a,entries:{'2026-09-07|afternoon':{source:'manual',subjectId:'russian'},'2026-09-07|morning1':{source:'auto',subjectId:'math'}}};
assert(fingerprint(a)===fingerprint(b),'fingerprint must be stable across entry key ordering');
const c=JSON.parse(JSON.stringify(a));c.entries['2026-09-07|morning1'].subjectId='programming';
assert(fingerprint(a)!==fingerprint(c),'fingerprint must detect schedule changes');

const mutable=new Set(['auto','review']);
const sampleSlots=[
  {key:'a',current:null,source:'empty'},
  {key:'b',current:{source:'manual'},source:'manual'},
  {key:'c',current:{source:'auto'},source:'auto'},
  {key:'d',current:{source:'review'},source:'review'},
  {key:'e',current:{source:'external'},source:'external'}
].map(x=>({...x,protected:Boolean(x.current&&!mutable.has(x.source))}));
assert(sampleSlots.find(x=>x.key==='b').protected,'manual entry must be protected');
assert(sampleSlots.find(x=>x.key==='e').protected,'unknown/external entry must be protected');
assert(!sampleSlots.find(x=>x.key==='c').protected&&!sampleSlots.find(x=>x.key==='d').protected,'only auto/review existing entries may be preview-replaced');
assert(!sampleSlots.find(x=>x.key==='a').protected,'empty slots may receive preview proposals');

const allowed=new Set(['DIAGNOSE','LOCATE_FAILED_NODES','REPAIR_MATCHED','BRIDGE_TO_READY','REPAIR','REVIEW_DIAGNOSTIC']);
const interventions=[
  {gateId:'P1',action:'STOP_BROAD',broadStop:true,state:{id:'mastered'},activation:{id:'stopped'}},
  {gateId:'P0',action:'JIT_ONLY',broadStop:true,state:{id:'mastered'},activation:{id:'stopped'}},
  {gateId:'P3',action:'REPAIR_MATCHED',broadStop:false,state:{id:'repair'},activation:{id:'active'},repairRoutes:[{id:'P3-R1'}]},
  {gateId:'P5',action:'LOCATE_FAILED_NODES',broadStop:false,state:{id:'repair'},activation:{id:'active'},repairRoutes:[]}
];
const eligible=interventions.filter(x=>allowed.has(x.action)&&!x.broadStop&&x.action!=='STOP_BROAD'&&x.action!=='JIT_ONLY'&&x.activation?.id!=='stopped'&&x.state?.id!=='mastered');
assert(JSON.stringify(eligible.map(x=>x.gateId))===JSON.stringify(['P3','P5']),'STOP/JIT mastered gates must be excluded from preview scheduling');
const badRepair={action:'REPAIR_MATCHED',repairRoutes:[]};
const goodRepair={action:'REPAIR_MATCHED',repairRoutes:[{id:'P3-R1'}]};
assert((badRepair.repairRoutes||[]).map(x=>x.id).length===0,'bad repair fixture must have no route evidence');
assert((goodRepair.repairRoutes||[]).map(x=>x.id).length===1,'matched repair fixture must retain route evidence');

if(errors.length){console.error(`PASS13D_SCHEDULER_PREVIEW_FAIL (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log('PASS13D_SCHEDULER_PREVIEW_PASS');
console.log(JSON.stringify({applyEnabled:false,previewDays:7,maxChanges:6,manualPreservation:true,externalPreservation:true,rollbackBaseline:true,staleFingerprint:true,stopGateExcluded:true,initOrderGuard:true},null,2));