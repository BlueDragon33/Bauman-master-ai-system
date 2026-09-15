'use strict';
const fs=require('fs');
const curriculum=JSON.parse(fs.readFileSync('assets/data/official-curriculum-iu5-2026.json','utf8'));
const policy=JSON.parse(fs.readFileSync('assets/data/diploma-supplement-honors-policy-rf-2021.json','utf8'));
const runtime=fs.readFileSync('assets/js/academic-transcript-runtime.js','utf8');
const gradeRuntime=fs.readFileSync('assets/js/academic-grade-runtime.js','utf8');
const css=fs.readFileSync('assets/css/academic-transcript-2026.css','utf8');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

assert(policy.version==='RF_ORDER_670_2021_REV_2023_VERIFIED_2026_PASS14E_V1','Pass14E federal policy version drifted');
assert(policy.primarySource?.order.includes('27.07.2021 N 670'),'Order 670 identity missing');
assert(policy.validity?.statedValidUntil==='2028-09-01','Order 670 stated validity must remain locked to 2028-09-01');
assert(policy.supplementRowRules?.discipline?.onePrimaryRowPerDiscipline===true,'Discipline supplement row model must be one primary row per discipline');
assert(policy.supplementRowRules?.discipline?.assessmentEventsAreNotAutomaticallyRows===true,'Assessment events must not be auto-counted as supplement rows');
assert(policy.supplementRowRules?.practice?.onePrimaryRowPerPractice===true,'Practice row model drifted');
assert(policy.supplementRowRules?.gia?.oneRowPerAttestationTest===true,'GIA row model drifted');
assert(policy.supplementRowRules?.courseWork?.separateFromDisciplineRow===true,'Course work must remain a separate supplement-row type');
assert(policy.honorsRules?.minimumExcellentShare===0.75,'Honors excellent-share threshold must be 75%');
assert(JSON.stringify(policy.honorsRules?.allNonCreditDisciplineCourseworkPracticeGradesAllowed)==='[5,4]','Honors non-credit grades must be only 5 or 4');
assert(policy.honorsRules?.allGiaGradesMustEqual===5,'All GIA grades must be 5 for honors diploma');
assert(policy.honorsRules?.creditGradesExcludedFromPercentage===true,'зачтено must remain excluded from percentage');
assert(policy.hubInterpretation?.assessmentEventToSupplementAutoPromotion==='forbidden','Event-to-supplement auto-promotion must be forbidden');
assert(policy.hubInterpretation?.bmstuIU5LocalSupplementMapping?.startsWith('not_yet_verified'),'IU5 local supplement mapping must remain explicitly unverified');

const isCredit=a=>a.length>0&&a.every(x=>x==='Зчт');
const rows=[];
for(const d of curriculum.disciplines)rows.push({id:d.id,kind:'discipline',nature:isCredit(d.assessment)?'credit':'graded'});
for(const e of curriculum.electiveGroups)rows.push({id:e.id,kind:'elective_group',nature:isCredit(e.assessment)?'credit':'graded'});
for(const p of curriculum.practices)rows.push({id:p.id,kind:'practice',nature:isCredit(p.assessment)?'credit':'graded'});
for(const g of curriculum.gia)rows.push({id:g.id,kind:'gia',nature:'graded'});
const graded=rows.filter(x=>x.nature==='graded'),credits=rows.filter(x=>x.nature==='credit');
assert(rows.length===27,`Expected 27 baseline supplement rows from locked curriculum, got ${rows.length}`);
assert(graded.length===22,`Expected 22 projected grade-bearing rows, got ${graded.length}`);
assert(credits.length===5,`Expected 5 pure-credit rows, got ${credits.length}`);
assert(Math.ceil(graded.length*0.75)===17,'22 projected grade-bearing rows must require at least 17 grade-5 rows');
assert(graded.length-Math.ceil(graded.length*0.75)===5,'Projection should allow at most 5 grade-4 rows if no additional graded rows exist');
assert(curriculum.facultatives.length===2&&curriculum.facultatives.every(x=>isCredit(x.assessment)),'Current two facultatives should remain pure-credit and outside baseline projection');
assert(!curriculum.disciplines.some(x=>(x.assessment||[]).some(a=>/КР|КП|курсов/i.test(a))),'Locked curriculum mirror contains no explicit course-work/project assessment row; do not invent one');

for(const token of ['Pass 14E Transcript Evidence Registry','bauman_academic_2026_transcript_evidence_v1','function candidateRows(','function recordEntry(','function projection(','function honorsEvaluation(','assessment event','autoPromotedFromAssessmentEvent:false','eventAutoPromotion:false','CURRENT_EVIDENCE_BLOCKS_HONORS','HONORS_RULES_MET_ON_VERIFIED_LEDGER','EXCELLENT_SHARE_BELOW_75'])assert(runtime.includes(token),`Pass14E runtime missing ${token}`);
assert(runtime.includes("sourceClass:'explicit_verified_diploma_supplement_entry'"),'Transcript evidence must be explicitly sourced');
assert(runtime.includes("payload.entryVerified!==true"),'Transcript entry must require explicit verification');
assert(runtime.includes("row.kind==='elective_group'")&&runtime.includes('selectedOptionId'),'Elective group must require selected option evidence');
assert(runtime.includes("['зачтено','незачтено']"),'Pure credit transcript values must be explicit');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Pass14E must not mutate scheduler entries');
assert(!/window\.save\s*\(/.test(runtime),'Pass14E must not call main save()');
assert(!/recordResult\s*\(/.test(runtime),'Pass14E must not auto-promote Pass14D assessment result into transcript evidence');
assert(gradeRuntime.includes('function bootstrapTranscriptRuntime()')&&gradeRuntime.includes('assets/js/academic-transcript-runtime.js')&&gradeRuntime.includes('assets/css/academic-transcript-2026.css'),'Pass14D must additively bootstrap Pass14E');
assert(css.includes('.transcript14e-kpis')&&css.includes('@media(max-width:850px)'),'Pass14E responsive CSS missing');

function evalLedger(values={}){
  const states=rows.map(r=>({row:r,value:Object.prototype.hasOwnProperty.call(values,r.id)?values[r.id]:null,verified:Object.prototype.hasOwnProperty.call(values,r.id)}));
  const g=states.filter(x=>x.row.nature==='graded'),c=states.filter(x=>x.row.nature==='credit'),missing=states.filter(x=>!x.verified),five=g.filter(x=>x.value===5),low=g.filter(x=>[2,3].includes(x.value)),giaBad=g.filter(x=>x.row.kind==='gia'&&x.verified&&x.value!==5),creditFail=c.filter(x=>x.verified&&x.value==='незачтено');
  if(low.length||giaBad.length||creditFail.length)return 'CURRENT_EVIDENCE_BLOCKS_HONORS';
  if(missing.length)return 'EVIDENCE_INCOMPLETE';
  return five.length>=17?'HONORS_RULES_MET_ON_VERIFIED_LEDGER':'EXCELLENT_SHARE_BELOW_75';
}
const full17={};for(const r of credits)full17[r.id]='зачтено';for(const r of graded)full17[r.id]=4;const gia=graded.find(x=>x.kind==='gia');full17[gia.id]=5;const nonGia=graded.filter(x=>x.id!==gia.id);for(const r of nonGia.slice(0,16))full17[r.id]=5;
assert(evalLedger(full17)==='HONORS_RULES_MET_ON_VERIFIED_LEDGER','17/22 grade-5 rows with all remaining grade 4 and GIA 5 should meet federal 75% rule');
const full16={...full17};full16[nonGia[0].id]=4;assert(evalLedger(full16)==='EXCELLENT_SHARE_BELOW_75','16/22 grade-5 rows must be below 75%');
const with3={...full17};const anyFour=graded.find(x=>with3[x.id]===4);with3[anyFour.id]=3;assert(evalLedger(with3)==='CURRENT_EVIDENCE_BLOCKS_HONORS','Any final 3 must block honors conditions');
const badGia={...full17,[gia.id]:4};assert(evalLedger(badGia)==='CURRENT_EVIDENCE_BLOCKS_HONORS','Any GIA grade below 5 must block honors conditions');
const missingOne={...full17};delete missingOne[graded[0].id];assert(evalLedger(missingOne)==='EVIDENCE_INCOMPLETE','Missing verified supplement row must prevent final honors conclusion');
const badCredit={...full17,[credits[0].id]:'незачтено'};assert(evalLedger(badCredit)==='CURRENT_EVIDENCE_BLOCKS_HONORS','A verified credit failure must block current honors eligibility');

if(errors.length){console.error(`PASS14E_TRANSCRIPT_HONORS_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PASS14E_TRANSCRIPT_HONORS_VALID');
console.log(JSON.stringify({baselineRows:rows.length,projectedGradeBearingRows:graded.length,pureCredits:credits.length,projectedRequiredFive:17,projectedMaxFours:5,eventAutoPromotion:false,localIU5Mapping:'unverified'},null,2));
