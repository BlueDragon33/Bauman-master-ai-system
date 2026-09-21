'use strict';
const fs=require('fs');
const arch=JSON.parse(fs.readFileSync('assets/data/course-learning-architecture-s1-2026.json','utf8'));
const policy=JSON.parse(fs.readFileSync('assets/data/grading-policy-bauman-2024.json','utf8'));
const course=fs.readFileSync('assets/js/academic-course-runtime.js','utf8');
const event=fs.readFileSync('assets/js/academic-event-runtime.js','utf8');
const grade=fs.readFileSync('assets/js/academic-grade-runtime.js','utf8');
const css=fs.readFileSync('assets/css/academic-course-2026.css','utf8');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

assert(policy.version==='BAUMAN_GRADING_POLICY_2024_REFERENCE_V1','grading policy version drifted');
assert(JSON.stringify(policy.ratingScale.map(x=>[x.min,x.max,x.grade5Scale]))===JSON.stringify([[85,100,5],[71,84,4],[60,70,3],[0,59,2]]),'grading bands drifted');
assert(policy.hubPolicy?.gradedEventSafetyTarget===90,'internal graded-event safety target must remain 90');
assert(policy.hubPolicy?.supplementCounting==='forbidden_without_verified_transcript_entry_structure','A3 must not infer transcript counting');

for(const token of ['A3 Event Evidence','bauman_academic_2026_event_readiness_v1','function eventState(','function courseEventAxis(','function recordEvidence(','function ensureGradeRuntime(','lazyGradeLoad:true','homeSurfaceAdded:false',"surface:'course-progress-modal'"])assert(event.includes(token),`A3 event runtime missing ${token}`);
for(const token of ['A3 Grade Evidence Ledger','bauman_academic_2026_grade_results_v1','function resultState(','function recordResult(','supplementEntryVerified:false','supplementEntryCounted:null','homeSurfaceAdded:false',"transcriptBootstrap:false"])assert(grade.includes(token),`A3 grade runtime missing ${token}`);
for(const src of [event,grade]){
  assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(src),'A3 must not mutate scheduler entries');
  assert(!/window\.save\s*\(/.test(src),'A3 must not call main save()');
  assert(!/id\s*:\s*['"](?:COMPLETED|COURSE_COMPLETED|EVENT_COMPLETED)['"]/.test(src),'A3 must not manufacture completion state');
  assert(!src.includes('function appendPanel()'),'A3 must not append a Home ledger');
  assert(!src.includes('function patchHome()'),'A3 must not patch Home');
}
assert(!grade.includes('bootstrapTranscriptRuntime'),'A3 must not bootstrap A4 transcript runtime');
assert(!event.includes('setTimeout(bootstrapGradeRuntime'),'A3 Grade runtime must not auto-load in Hub background');
assert(course.includes('function bootstrapEventRuntime()'),'A2 runtime must bootstrap A3 event evidence');
assert(course.includes('assets/js/academic-event-runtime.js')&&course.includes('assets/css/academic-event-2026.css'),'A3 event assets missing from current-main bridge');
assert(course.includes('openAcademicEventReadiness2026')&&course.includes('openAcademicGradeEvidenceA3'),'course modal must expose readiness and lazy grade actions');
assert(course.includes('a3EvidenceBridge:true'),'A3 bridge marker missing');
assert(css.includes('.course14b-event-a3')&&css.includes('@media(max-width:520px)'),'A3 course modal responsive controls missing');

const events=arch.courses.flatMap(c=>(c.eventModel?.events||[]).map(e=>({courseId:c.courseId,...e})));
const resolved=events.filter(x=>!/^unresolved/.test(String(x.timing||'')));
const locked=events.filter(x=>/^unresolved/.test(String(x.timing||'')));
assert(resolved.length===8,`Expected 8 resolved S1 events, got ${resolved.length}`);
assert(locked.length===4,`Expected 4 timing-locked events, got ${locked.length}`);
for(const e of events){if(e.code==='Зчт')assert(e.internalTarget===null,`${e.courseId} Зчт must not get numeric target`);if(e.gradingNature==='graded')assert(e.internalTarget===90,`${e.courseId} ${e.code} target drifted`)}

const band=n=>policy.ratingScale.find(x=>n>=x.min&&n<=x.max)?.grade5Scale??null;
assert(band(92)===5&&band(89)===5&&band(84)===4&&band(70)===3&&band(59)===2,'grading boundary invariant failed');

if(errors.length){console.error(`A3_EVENT_GRADE_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('A3_EVENT_GRADE_VALID');
console.log(JSON.stringify({resolvedEvents:resolved.length,timingLocked:locked.length,homeSurfaceAdded:false,schedulerMutation:false,courseCompletionMutation:false,transcriptBootstrap:false},null,2));
