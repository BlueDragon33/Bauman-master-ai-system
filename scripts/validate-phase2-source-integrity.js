'use strict';
const fs=require('fs');
const architecture=JSON.parse(fs.readFileSync('assets/data/course-learning-architecture-s1-2026.json','utf8'));
const errors=[];
const assert=(c,m)=>{if(!c)errors.push(m)};
const d01=architecture.courses.find(x=>x.courseId==='d01');
const evidence=d01?.courseLocalReadiness?.sourceEvidence||[];
assert(evidence.length===1,'d01 must use exactly one verified public source until another source is independently verified');
assert(evidence[0]?.url==='https://e-learning.bmstu.ru/l/course/index.php?categoryid=3','d01 must use the verified L2 public learning portal source');
assert(!JSON.stringify(d01).includes('library.bmstu.ru/Catalog/Details/552992'),'unverified secondary BMSTU library record must not be used as active evidence');
assert(d01?.courseLocalReadiness?.thresholdStatus==='not_defined_until_verified_course_requirements_or_diagnostic_blueprint','d01 English threshold must remain unresolved');
assert(d01?.criticalPrerequisites?.length===0,'d01 must not regain a global Russian prerequisite');
assert(d01?.semester1Allocation?.status==='unresolved_from_locked_curriculum','d01 semester allocation must remain unresolved');
for(const id of ['d15','p02']){
  const c=architecture.courses.find(x=>x.courseId===id);
  assert(c?.semester1Allocation?.credits===null&&c?.semester1Allocation?.hours===null,`${id} must not fabricate semester-1 credits/hours`);
  assert(c?.semester1Allocation?.assessmentTiming==='unresolved',`${id} assessment timing must remain unresolved`);
}
for(const c of architecture.courses){
  for(const e of c.eventModel?.events||[]){
    if(e.code==='Зчт')assert(e.internalTarget===null,`${c.courseId}: pure Зчт must not carry numeric internal target`);
  }
}
if(errors.length){console.error(`PHASE2_SOURCE_INTEGRITY_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PHASE2_SOURCE_INTEGRITY_PASS');
