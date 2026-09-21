'use strict';
const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const arch=json('assets/data/course-learning-architecture-s1-2026.json');
const runtime=read('assets/js/academic-course-runtime.js');
const phase1=read('assets/js/academic-main.js');
const apply=read('assets/js/academic-scheduler-apply.js');
const css=read('assets/css/academic-course-2026.css');
const index=read('index.html');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};
const required=['d01','d02','d03','d04','d05','d06','d15','p02'];

assert(arch.version==='PHASE2_CURRENT_MAIN_A1_S1_COURSE_ARCHITECTURE_V3','A2 must consume current-main A1 architecture');
assert(JSON.stringify(arch.courses.map(x=>x.courseId))===JSON.stringify(required),'A2 course order drifted');
for(const token of [
  'A2 Course Readiness Runtime','function prereqAxis(','function lifecycleAxis(','function eventAxis(',
  'function fallbackEventAxis(','function nextAction(','function patchProgressFrame(',
  'data-course14b-progress="s1"','course_local_readiness_unassessed','PREREQ_REPAIR','COURSE_READY',
  "surface:'progress-modal'","mode==='progress'?base+renderProgressSummary():base"
])assert(runtime.includes(token),`A2 runtime missing ${token}`);

assert(!/localStorage\.setItem/.test(runtime),'A2 must not write localStorage');
assert(!/window\.save\s*\(/.test(runtime),'A2 must not call Main save()');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'A2 must not mutate schedule entries');
assert(!/return \{id:'COMPLETED'/.test(runtime),'A2 must not fabricate course completion');
assert(!runtime.includes('function patchApp(')&&!runtime.includes('appendPanel()'),'A2 must not append a new Home surface');
assert(!runtime.includes('bootstrapEventRuntime'),'A2 must not bootstrap A3 event runtime');
assert(runtime.includes("return {id:null,label:'Chưa ghi kết quả vòng đời'"),'Lifecycle must remain unknown without completion evidence');
assert(runtime.includes("if(course?.courseLocalReadiness)return {type:'LOCAL_DIAGNOSTIC_PENDING'"),'d01 must use local English readiness path');
assert(runtime.includes('target nội bộ')&&runtime.includes('Pass/fail · không gán target 90'),'A2 event UI must preserve graded/pass-fail policy');
assert(runtime.includes("if(document.readyState==='loading')")&&runtime.includes('else setTimeout(load,0)'),'A2 dynamic bootstrap must be readyState safe');

assert(phase1.includes("function dependencyFor(courseId){return (window.BAUMAN_PREREQ_2026?.courseDependencies||[]).find(x=>x.courseId===courseId)"),'Phase1 dependency lookup must stay courseId-keyed');
assert(apply.includes('function bootstrapPhase2CourseRuntime()'),'Pass13F must bootstrap A2');
assert(apply.includes('assets/css/academic-course-2026.css')&&apply.includes('assets/js/academic-course-runtime.js'),'A2 bootstrap assets missing');
assert(apply.includes("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true})")&&apply.includes('else start();'),'Pass13F/A2 bootstrap must survive late script execution');
assert(!index.includes('academic-course-runtime.js')&&!index.includes('academic-course-2026.css'),'A2 assets must remain additive; base index must not load them directly');

assert(css.includes('.course14b-grid')&&css.includes('.course14b-progress')&&css.includes('@media(max-width:850px)'),'A2 responsive Progress CSS missing');

const d01=arch.courses.find(x=>x.courseId==='d01');
assert(d01.criticalPrerequisites.length===0&&d01.supportPrerequisites.length===0,'d01 must have no P0/global gate');
assert(d01.courseLocalReadiness?.language==='English','d01 must use local English readiness');
for(const id of ['d01','d15','p02']){
  const c=arch.courses.find(x=>x.courseId===id);
  assert(c.semester1Allocation?.credits===null&&c.semester1Allocation?.hours===null&&c.semester1Allocation?.assessmentTiming==='unresolved',`${id} multi-semester allocation must stay unresolved`);
}
const d02=arch.courses.find(x=>x.courseId==='d02');
assert(d02.eventModel.events.every(x=>x.code!=='Зчт'||x.internalTarget===null),'pure Зчт must not receive numeric target');
const d04=arch.courses.find(x=>x.courseId==='d04');
assert(d04.eventModel.events.every(x=>x.internalTarget===90),'d04 graded-event internal target drifted');

if(errors.length){console.error(`A2_COURSE_READINESS_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('A2_COURSE_READINESS_VALID');
console.log(JSON.stringify({courses:8,readOnly:true,surface:'progress-modal',homeSurfaceAdded:false,d01:'course-local-English',a3Bootstrap:false},null,2));
