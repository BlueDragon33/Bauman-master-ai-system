'use strict';
const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};
const files={
  phase1:read('assets/js/academic-main.js'),
  apply:read('assets/js/academic-scheduler-apply.js'),
  course:read('assets/js/academic-course-runtime.js'),
  event:read('assets/js/academic-event-runtime.js'),
  grade:read('assets/js/academic-grade-runtime.js'),
  transcript:read('assets/js/academic-transcript-runtime.js'),
  command:read('assets/js/academic-command-center-runtime.js')
};
const architecture=json('assets/data/course-learning-architecture-s1-2026.json');
const curriculum=json('assets/data/official-curriculum-iu5-2026.json');
const gradePolicy=json('assets/data/grading-policy-bauman-2024.json');
const honorsPolicy=json('assets/data/diploma-supplement-honors-policy-rf-2021.json');

// Bootstrap chain must stay ordered and additive.
const chain=[
  ['apply','assets/js/academic-course-runtime.js','course'],
  ['course','assets/js/academic-event-runtime.js','event'],
  ['event','assets/js/academic-grade-runtime.js','grade'],
  ['grade','assets/js/academic-transcript-runtime.js','transcript'],
  ['transcript','assets/js/academic-command-center-runtime.js','command']
];
for(const [parent,path,child] of chain){assert(files[parent].includes(path),`${parent} must bootstrap ${path}`);assert(files[child].includes("document.readyState==='loading'"),`${child} must be safe when dynamically loaded after DOMContentLoaded`)}
for(const token of ['__academic13fApplyPatched','__course14bPatched','__event14cPatched','__grade14dPatched','__transcript14ePatched','__command14fPatched'])assert(Object.values(files).some(x=>x.includes(token)),`patch-chain flag missing ${token}`);

// Storage isolation: each mutable evidence layer owns a distinct user-scoped store.
const storageLiterals={
  diagnostic:'bauman_academic_2026_diagnostics_v1',
  event:'bauman_academic_2026_event_readiness_v1',
  grade:'bauman_academic_2026_grade_results_v1',
  transcript:'bauman_academic_2026_transcript_evidence_v1',
  scheduleTx:'bauman_academic_2026_schedule_transactions_v1'
};
assert(new Set(Object.values(storageLiterals)).size===Object.keys(storageLiterals).length,'Academic storage keys must be distinct');
assert(files.phase1.includes(storageLiterals.diagnostic),'Phase1 diagnostic storage key drifted');
assert(files.event.includes(storageLiterals.event),'Event storage key drifted');
assert(files.grade.includes(storageLiterals.grade),'Grade storage key drifted');
assert(files.transcript.includes(storageLiterals.transcript),'Transcript storage key drifted');
assert(files.apply.includes(storageLiterals.scheduleTx),'Scheduler transaction storage key drifted');
for(const [name,text] of [['event',files.event],['grade',files.grade],['transcript',files.transcript]])assert(text.includes("CURRENT_USER_KEY='bauman_current_user_fullcode_v1'"),`${name} evidence must remain user-scoped`);

// Semantic separation: no automatic promotion across readiness/result/transcript/lifecycle layers.
assert(files.event.includes('officialResultMutation:false'),'Event readiness must not write official results');
assert(files.grade.includes('supplementCounting:false'),'Grade Control must not count diploma-supplement entries');
assert(files.grade.includes('courseCompletionMutation:false'),'Grade Control must not mark course completed');
assert(files.transcript.includes('autoPromotedFromAssessmentEvent:false'),'Transcript evidence must never be auto-promoted from assessment events');
assert(files.transcript.includes('eventAutoPromotion:false'),'Transcript runtime must advertise event auto-promotion disabled');
assert(files.transcript.includes('courseCompletionMutation:false'),'Transcript runtime must not mark courses completed');
assert(files.command.includes('readOnly:true')&&files.command.includes('schedulerMutation:false'),'Command Center must remain read-only and scheduler-safe');
assert(!/localStorage\.setItem/.test(files.command),'Command Center must not persist or mutate state');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(files.command),'Command Center must not mutate schedule entries');
assert(!/return \{id:'COMPLETED'/.test(files.course),'Course runtime must not fabricate COMPLETED lifecycle');

// Official-course semantic boundaries locked by Pass14A-R.
const byCourse=id=>architecture.courses.find(x=>x.courseId===id);
const d01=byCourse('d01'),d15=byCourse('d15'),p02=byCourse('p02');
assert(d01?.courseLocalReadiness?.language==='English','d01 must remain course-local English readiness');
assert((d01?.criticalPrerequisites||[]).length===0,'d01 must not regain P0 Russian as a critical prerequisite');
for(const c of [d01,d15,p02]){
  assert(c?.semester1Allocation?.credits===null&&c?.semester1Allocation?.hours===null,`${c?.courseId} must keep semester allocation unresolved`);
  assert(c?.semester1Allocation?.assessmentTiming==='unresolved',`${c?.courseId} timing must remain unresolved`);
}
for(const c of architecture.courses)for(const e of c.eventModel?.events||[])if(e.code==='Зчт'&&e.gradingNature==='pass_fail')assert(e.internalTarget===null,`${c.courseId} pure Зчт must not get numeric safety target`);

// Grade policy and honors policy remain evidence-based and distinct from internal target 90.
const bands=gradePolicy.ratingScale||[];
const findBand=s=>bands.find(x=>s>=Number(x.min)&&s<=Number(x.max));
assert(findBand(85)?.grade5Scale===5&&findBand(84)?.grade5Scale===4,'Official grading boundary 85/84 drifted');
assert(findBand(71)?.grade5Scale===4&&findBand(70)?.grade5Scale===3,'Official grading boundary 71/70 drifted');
assert(findBand(60)?.grade5Scale===3&&findBand(59)?.grade5Scale===2,'Official grading boundary 60/59 drifted');
assert(Number(honorsPolicy.honorsRules?.minimumExcellentShare)===0.75,'Honors minimum excellent share must remain 75%');
assert(files.transcript.includes('projectionOnly:true'),'Transcript denominator must remain explicitly projection-only');
assert(files.transcript.includes("finalEligibilityClaimed:complete&&id==='HONORS_RULES_MET_ON_VERIFIED_LEDGER'"),'Final honors claim must require a complete verified ledger');

// Command Center precedence must protect confirmed transcript blockers over lower-level readiness signals.
const precedence=['HONORS_BLOCKER','ASSESSMENT_FAILED','GRADE_3_RISK','HONORS_GRADE_4','GRADE_4_RISK','EVENT_TIMING_LOCKED','EVENT_PREPARING','PREREQ_REPAIR','EVENT_EVIDENCE_REQUIRED','PREREQ_UNASSESSED','EXCELLENT_BELOW_SAFETY_TARGET','READY_FOR_ASSESSMENT'];
let last=-1;for(const token of precedence){const i=files.command.indexOf(`type='${token}'`);assert(i>=0,`Command Center action missing ${token}`);assert(i>last,`Command Center precedence order drifted around ${token}`);last=i}

// Course set and curriculum mirror remain aligned for the S1 orchestration subset.
const expected=['d01','d02','d03','d04','d05','d06','d15','p02'];
assert(JSON.stringify(architecture.courses.map(x=>x.courseId))===JSON.stringify(expected),'Phase2 S1 course orchestration set drifted');
const officialIds=new Set([...(curriculum.disciplines||[]),...(curriculum.practices||[])].map(x=>x.id));
for(const id of expected)assert(officialIds.has(id),`Phase2 course ${id} missing from official curriculum mirror`);

if(errors.length){console.error(`PASS14G_FINAL_INTEGRATION_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PASS14G_FINAL_INTEGRATION_STATIC_PASS');
console.log(JSON.stringify({bootstrapLayers:6,evidenceStores:4,schedulerStoreSeparate:true,courseSet:expected.length,semanticSeparation:true,projectionOnly:true,commandCenterReadOnly:true},null,2));
