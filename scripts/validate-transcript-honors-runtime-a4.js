'use strict';
const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const curriculum=json('assets/data/official-curriculum-iu5-2026.json');
const policy=json('assets/data/diploma-supplement-honors-policy-rf-2021.json');
const runtime=read('assets/js/academic-transcript-runtime.js');
const grade=read('assets/js/academic-grade-runtime.js');
const course=read('assets/js/academic-course-runtime.js');
const css=read('assets/css/academic-transcript-2026.css');
const courseCss=read('assets/css/academic-course-2026.css');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

assert(policy.version==='RF_ORDER_670_2021_REV_2023_VERIFIED_2026_PASS14E_V1','A4 federal policy version drifted');
assert(policy.validity?.statedValidUntil==='2028-09-01','Order 670 validity boundary drifted');
assert(policy.honorsRules?.minimumExcellentShare===0.75,'Honors excellent-share threshold must remain 75%');
assert(policy.honorsRules?.allGiaGradesMustEqual===5,'All GIA grades must remain 5 for honors');
assert(policy.honorsRules?.creditGradesExcludedFromPercentage===true,'зачтено must remain excluded from percentage');
assert(policy.hubInterpretation?.assessmentEventToSupplementAutoPromotion==='forbidden','A3 event result must not auto-promote to supplement');
assert(policy.hubInterpretation?.bmstuIU5LocalSupplementMapping?.startsWith('not_yet_verified'),'IU5 local supplement mapping must stay unverified');

const isCredit=a=>Array.isArray(a)&&a.length>0&&a.every(x=>x==='Зчт');
const rows=[];
for(const d of curriculum.disciplines||[])rows.push({id:d.id,kind:'discipline',nature:isCredit(d.assessment)?'credit':'graded'});
for(const e of curriculum.electiveGroups||[])rows.push({id:e.id,kind:'elective_group',nature:isCredit(e.assessment)?'credit':'graded'});
for(const p of curriculum.practices||[])rows.push({id:p.id,kind:'practice',nature:isCredit(p.assessment)?'credit':'graded'});
for(const g of curriculum.gia||[])rows.push({id:g.id,kind:'gia',nature:'graded'});
const graded=rows.filter(x=>x.nature==='graded'),credits=rows.filter(x=>x.nature==='credit');
assert(rows.length===27,`Expected 27 baseline supplement rows, got ${rows.length}`);
assert(graded.length===22,`Expected 22 projected grade-bearing rows, got ${graded.length}`);
assert(credits.length===5,`Expected 5 pure-credit rows, got ${credits.length}`);
assert(Math.ceil(graded.length*.75)===17,'22 projected grade-bearing rows must require 17 grade-5 rows');

for(const token of [
  'A4 Transcript / Honors Evidence Registry','bauman_academic_2026_transcript_evidence_v1',
  'function candidateRows(','function recordEntry(','function projection(','function honorsEvaluation(',
  'autoPromotedFromAssessmentEvent:false','eventAutoPromotion:false','homeSurfaceAdded:false',
  "surface:'progress-modal'","a5Bootstrap:false",'function openOverview('
])assert(runtime.includes(token),`A4 runtime missing ${token}`);
assert(runtime.includes("sourceClass:'explicit_verified_diploma_supplement_entry'"),'A4 evidence must require explicit source class');
assert(runtime.includes("payload.entryVerified!==true"),'A4 entry must require explicit verification');
assert(runtime.includes("row.kind==='elective_group'")&&runtime.includes('selectedOptionId'),'Elective group must require chosen option');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'A4 must not mutate scheduler');
assert(!/window\.save\s*\(/.test(runtime),'A4 must not call Main save()');
assert(!/recordResult\s*\(/.test(runtime),'A4 must not auto-promote A3 grade result');
assert(!runtime.includes('function appendPanel()')&&!runtime.includes('function patchHome('),'A4 must not add Home surface');
assert(!runtime.includes('bootstrapCommandCenter'),'A4 must not bootstrap A5');
assert(runtime.includes('Báo cáo phụ lục văn bằng & mục tiêu bằng đỏ'),'A4 professional transcript report title missing');
assert(runtime.includes('data-academic-report')&&runtime.includes('In / lưu PDF'),'A4 professional report print affordance missing');
for(const leak of ['Diploma supplement evidence','Lưu evidence','Xóa evidence','Evidence hiện tại'])assert(!runtime.includes(leak),`A4 developer-facing label leaked: ${leak}`);
assert(runtime.includes("window.confirm('Xóa dữ liệu phụ lục đã xác minh"),'A4 destructive transcript clear must require explicit confirmation');
assert(runtime.includes('projectionCaveatActive')&&runtime.includes("finalEligibilityClaimed:complete&&id==='HONORS_RULES_MET_ON_VERIFIED_LEDGER'&&!projectionCaveatActive"),'A4 must never claim final honors eligibility while the supplement denominator/mapping is still projected');

assert(grade.includes('function ensureTranscriptRuntime()')&&grade.includes('lazyTranscriptLoad:true'),'A3 grade layer must expose lazy A4 loader');
assert(!grade.includes('setTimeout(bootstrapTranscriptRuntime'),'A4 must never auto-load from grade runtime');
assert(course.includes('openAcademicTranscriptEvidenceA4')&&course.includes('data-a4-transcript-open'),'Progress must expose explicit A4 action');
assert(course.includes('a4TranscriptBridge:true'),'A4 bridge marker missing');
assert(css.includes('.transcript14e-kpis')&&css.includes('@media(max-width:850px)'),'A4 responsive CSS missing');
assert(courseCss.includes('.course14b-progress-actions')&&courseCss.includes('@media(max-width:640px)'),'A4 Progress action responsive CSS missing');

function evalLedger(values={}){
  const states=rows.map(r=>({row:r,value:Object.prototype.hasOwnProperty.call(values,r.id)?values[r.id]:null,verified:Object.prototype.hasOwnProperty.call(values,r.id)}));
  const g=states.filter(x=>x.row.nature==='graded'),c=states.filter(x=>x.row.nature==='credit'),missing=states.filter(x=>!x.verified),five=g.filter(x=>x.value===5),low=g.filter(x=>[2,3].includes(x.value)),giaBad=g.filter(x=>x.row.kind==='gia'&&x.verified&&x.value!==5),creditFail=c.filter(x=>x.verified&&x.value==='незачтено');
  if(low.length||giaBad.length||creditFail.length)return 'CURRENT_EVIDENCE_BLOCKS_HONORS';
  if(missing.length)return 'EVIDENCE_INCOMPLETE';
  return five.length>=17?'HONORS_RULES_MET_ON_VERIFIED_LEDGER':'EXCELLENT_SHARE_BELOW_75';
}
const full17={};for(const r of credits)full17[r.id]='зачтено';for(const r of graded)full17[r.id]=4;
const gia=graded.find(x=>x.kind==='gia');full17[gia.id]=5;const nonGia=graded.filter(x=>x.id!==gia.id);for(const r of nonGia.slice(0,16))full17[r.id]=5;
assert(evalLedger(full17)==='HONORS_RULES_MET_ON_VERIFIED_LEDGER','17/22 projection invariant failed');
const full16={...full17,[nonGia[0].id]:4};assert(evalLedger(full16)==='EXCELLENT_SHARE_BELOW_75','16/22 must stay below 75%');
const with3={...full17};const four=graded.find(x=>with3[x.id]===4);with3[four.id]=3;assert(evalLedger(with3)==='CURRENT_EVIDENCE_BLOCKS_HONORS','Any grade 3 must block current honors evidence');

if(errors.length){console.error(`A4_TRANSCRIPT_HONORS_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('A4_TRANSCRIPT_HONORS_VALID');
console.log(JSON.stringify({baselineRows:27,projectedGradeBearingRows:22,pureCredits:5,requiredFive:17,lazyLoad:true,homeSurfaceAdded:false,a5Bootstrap:false,eventAutoPromotion:false},null,2));
