'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m)};
const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))fail(`${m}\nexpected=${JSON.stringify(b)}\nactual=${JSON.stringify(a)}`)};
const must=(v,m)=>{if(!v)fail(m)};

const curriculum=read('assets/data/official-curriculum-iu5-2026.json');
const prereq=read('assets/data/prerequisite-registry-iu5-2026.json');
const arch=read('assets/data/official-course-learning-architecture-2026.json');
const runtime=text('assets/js/academic-course-learning.js');
const loaderHost=text('assets/js/academic-scheduler-apply.js');

must(arch.schema==='bauman_official_course_learning_architecture_v1','schema mismatch');
must(arch.version==='OFFICIAL_COURSE_LEARNING_PASS14A_V1','version mismatch');
must(arch.policy?.schedulerMutation===false,'Pass14A must not mutate scheduler');
must(arch.policy?.courseContentMutation===false,'Pass14A must not overwrite course content');
eq(arch.policy?.defaultLane,['PREREQUISITE_ASSURANCE','COURSE_CORE','GRADED_EVENT','EVIDENCE_REUSE'],'default lane order drift');
must(arch.policy?.performanceTargets?.courseReady===90,'course-ready internal target must stay 90');
must(arch.policy?.performanceTargets?.gradedEventReady===92,'graded-event internal target must stay 92');
must(arch.policy?.performanceTargets?.sourceType==='internal_strategy_not_official_rule','internal targets must not masquerade as official rules');
must(arch.policy?.defaultThesisTrack===null,'No default thesis track is allowed');

const officialS1=[
  ...(curriculum.disciplines||[]).filter(x=>(x.semesters||[]).includes(1)),
  ...(curriculum.practices||[]).filter(x=>(x.semesters||[]).includes(1)),
  ...(curriculum.gia||[]).filter(x=>(x.semesters||[]).includes(1))
];
const expectedS1Ids=officialS1.map(x=>x.id);
eq(arch.semester1DisplayOrder,expectedS1Ids,'Semester-1 display order must mirror official curriculum order');
const blueprints=arch.courseBlueprints||[];
eq(blueprints.map(x=>x.courseId),expectedS1Ids,'Course blueprints must cover exactly every official semester-1 item');
must(new Set(blueprints.map(x=>x.courseId)).size===blueprints.length,'Duplicate course blueprint id');

const allOfficial=[...(curriculum.disciplines||[]),...(curriculum.practices||[]),...(curriculum.gia||[])];
const depById=new Map((prereq.courseDependencies||[]).map(x=>[x.courseId,x]));
const srcById=new Map((arch.sourceCatalog||[]).map(x=>[x.id,x]));
const allowedClaimTypes=new Set(['official_identity','public_course_evidence','existing_repo_reuse','bridge_inference','suggested_evidence']);
for(const bp of blueprints){
  const course=allOfficial.find(x=>x.id===bp.courseId);must(course,`Missing official course ${bp.courseId}`);
  const dep=depById.get(bp.courseId)||{critical:[],support:[]};
  eq(bp.criticalGates,dep.critical||[],`${bp.courseId} critical gate drift`);
  eq(bp.supportGates,dep.support||[],`${bp.courseId} support gate drift`);
  eq(bp.gradedEvents,course.assessment||[],`${bp.courseId} assessment drift`);
  must((bp.knowledgeDomains||[]).length>0,`${bp.courseId} knowledge domains missing`);
  must((bp.focus||[]).length>0,`${bp.courseId} focus missing`);
  must((bp.suggestedEvidence||[]).length>0,`${bp.courseId} suggested evidence missing`);
  for(const f of bp.focus){
    must(allowedClaimTypes.has(f.sourceType),`${bp.courseId} invalid focus source type ${f.sourceType}`);
    if(f.sourceType==='public_course_evidence')must(srcById.has(f.sourceRef),`${bp.courseId} public evidence item lacks valid sourceRef`);
    must(!/official[_ -]?syllabus|официальн.*силлабус/i.test(f.label),`${bp.courseId} overclaims an official syllabus`);
  }
}

const d03=blueprints.find(x=>x.courseId==='d03');
must(d03.focus.some(x=>x.sourceRef==='iu5_analytical_models_public'),'d03 must retain public analytical-models evidence');
const p02=blueprints.find(x=>x.courseId==='p02');
must(p02.focus.some(x=>x.sourceRef==='iu5_nir_public'),'p02 must retain public NIR evidence');
const p02Official=allOfficial.find(x=>x.id==='p02');
must(p02Official.credits===21&&p02Official.hours===756,'p02 official 21cr/756h drift');
eq(p02Official.semesters,[1,2,3,4],'p02 must span semesters 1-4');

const positiveFocus=blueprints.flatMap(x=>x.focus||[]).map(x=>x.label).join('\n');
must(!/(?:UGV|USV|PID|LQR|Kalman|FPGA|PLC|SCADA)/i.test(positiveFocus),'Default semester-1 learning focus reintroduced a deprioritized project/control/hardware track');

must(/const\s+READ_ONLY\s*=\s*true/.test(runtime),'Runtime must declare READ_ONLY=true');
must(!/localStorage\.setItem/.test(runtime),'Pass14A runtime must not write localStorage');
must(!/window\.state\.schedule/.test(runtime),'Pass14A runtime must not touch schedule');
must(!/autoSchedule\s*\(/.test(runtime),'Pass14A runtime must not call autoSchedule');
must(loaderHost.includes('assets/css/academic-course-learning.css'),'Pass13F host missing Pass14A CSS loader');
must(loaderHost.includes('assets/js/academic-course-learning.js'),'Pass13F host missing Pass14A JS loader');

console.log('PASS14A official course learning architecture validated',{
  s1Items:expectedS1Ids.length,
  blueprints:blueprints.length,
  d03Evidence:true,
  p02Evidence:true,
  readOnly:true
});
