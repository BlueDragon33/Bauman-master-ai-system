'use strict';
const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const runtime=read('assets/js/academic-command-center-runtime.js');
const transcript=read('assets/js/academic-transcript-runtime.js');
const course=read('assets/js/academic-course-runtime.js');
const css=read('assets/css/academic-command-center-2026.css');
const arch=JSON.parse(read('assets/data/course-learning-architecture-s1-2026.json'));
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};
const order=['d01','d02','d03','d04','d05','d06','d15','p02'];

for(const token of [
  'A5 Academic Command Center','function courseCommand(','function commandBoard(','function summary(','function openOverview(',
  'HONORS_BLOCKER','ASSESSMENT_FAILED','GRADE_3_RISK','HONORS_GRADE_4','GRADE_4_RISK','EVENT_TIMING_LOCKED',
  'EVENT_PREPARING','PREREQ_REPAIR','EVENT_EVIDENCE_REQUIRED','PREREQ_UNASSESSED','EXCELLENT_BELOW_SAFETY_TARGET','READY_FOR_ASSESSMENT',
  "surface:'progress-modal'","homeSurfaceAdded:false","schedulerMutation:false","evidenceMutation:false"
])assert(runtime.includes(token),`A5 runtime missing ${token}`);

assert(!/localStorage\.setItem/.test(runtime),'A5 must not write localStorage');
assert(!/window\.save\s*\(/.test(runtime),'A5 must not call Main save()');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'A5 must not mutate scheduler entries');
assert(!/record(?:Entry|Result|Evidence|Diagnostic)\s*\(/.test(runtime),'A5 must not mutate lower-layer evidence');
assert(!runtime.includes('patchHome')&&!runtime.includes('appendPanel'),'A5 must not patch or append Home');
assert(runtime.includes("const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02']"),'A5 course order drifted');
assert(JSON.stringify(arch.courses.map(x=>x.courseId))===JSON.stringify(order),'A5 must cover exact corrected S1 architecture');
assert(runtime.includes("transcriptRuntime()?.entryState?.(courseId)")&&runtime.includes("gradeRuntime()?.resolvedEvents?.()")&&runtime.includes("eventRuntime()?.courseEventAxis?.(courseId)")&&runtime.includes("cr?.prereqAxis?.(courseId)"),'A5 must integrate all four evidence layers');
assert(runtime.includes('projectionCaveatActive')&&runtime.includes('finalEligibilityClaimed'),'A5 must preserve A4 honors projection caveat');

assert(transcript.includes('function ensureCommandCenterRuntime()')&&transcript.includes('lazyCommandCenterLoad:true'),'A4 must expose lazy A5 loader');
assert(transcript.includes('assets/js/academic-command-center-runtime.js')&&transcript.includes('assets/css/academic-command-center-2026.css'),'A4 lazy A5 assets missing');
assert(!transcript.includes('setTimeout(bootstrapCommandCenter'),'A5 must not auto-bootstrap from A4');
assert(course.includes('function openCommandCenter()')&&course.includes('data-a5-command-open')&&course.includes('openAcademicCommandCenterA5'),'Progress flow must expose A5 action');
assert(course.includes('a5CommandBridge:true'),'A5 course bridge marker missing');
assert(css.includes('.commandA5-grid')&&css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:600px)'),'A5 responsive CSS missing');

const precedence=['HONORS_BLOCKER','ASSESSMENT_FAILED','GRADE_3_RISK','HONORS_GRADE_4','GRADE_4_RISK','EVENT_TIMING_LOCKED','EVENT_PREPARING','PREREQ_REPAIR','EVENT_EVIDENCE_REQUIRED','PREREQ_UNASSESSED','EXCELLENT_BELOW_SAFETY_TARGET','READY_FOR_ASSESSMENT'];
for(let i=1;i<precedence.length;i++)assert(runtime.indexOf(`type='${precedence[i-1]}'`)<runtime.indexOf(`type='${precedence[i]}'`),`A5 precedence drift: ${precedence[i-1]} before ${precedence[i]}`);

if(errors.length){console.error(`A5_COMMAND_CENTER_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('A5_COMMAND_CENTER_VALID');
console.log(JSON.stringify({courses:8,readOnly:true,homeSurfaceAdded:false,surface:'progress-modal',schedulerMutation:false,evidenceMutation:false,honorsProjectionFinal:false},null,2));
