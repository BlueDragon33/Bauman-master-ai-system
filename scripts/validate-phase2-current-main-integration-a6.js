'use strict';
const fs=require('fs');
const cp=require('child_process');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};
const run=p=>{try{cp.execFileSync(process.execPath,[p],{stdio:'pipe'});return true}catch(e){errors.push(`${p} failed: ${String(e.stderr||e.message).trim()}`);return false}};

const validators=[
  'scripts/validate-academic-2026.js',
  'scripts/validate-course-learning-architecture-s1-2026.js',
  'scripts/validate-course-readiness-runtime-a2.js',
  'scripts/validate-event-grade-runtime-a3.js',
  'scripts/validate-transcript-honors-runtime-a4.js',
  'scripts/validate-academic-command-center-a5.js'
];
for(const p of validators){assert(fs.existsSync(p),`Missing validator ${p}`);if(fs.existsSync(p))run(p)}

const arch=json('assets/data/course-learning-architecture-s1-2026.json');
const p0=json('assets/data/prerequisite-packs/p00-technical-russian.json');
const registry=json('assets/data/prerequisite-registry-iu5-2026.json');
const course=read('assets/js/academic-course-runtime.js');
const event=read('assets/js/academic-event-runtime.js');
const grade=read('assets/js/academic-grade-runtime.js');
const transcript=read('assets/js/academic-transcript-runtime.js');
const command=read('assets/js/academic-command-center-runtime.js');
const workflow=read('.github/workflows/academic-2026-prerequisite-gate.yml');

const expected=['d01','d02','d03','d04','d05','d06','d15','p02'];
assert(JSON.stringify(arch.courses.map(x=>x.courseId))===JSON.stringify(expected),'A6 S1 scope drifted');
const d01=arch.courses.find(x=>x.courseId==='d01');
assert(d01?.courseLocalReadiness?.language==='English','A6 d01 must remain English-owned');
assert((d01?.criticalPrerequisites||[]).length===0&&(d01?.supportPrerequisites||[]).length===0,'A6 d01 must remain outside P0 global gate');
assert(!(p0.officialTargets||[]).some(x=>x.courseId==='d01'),'A6 P0 must not target d01');
const dep=(registry.courseDependencies||[]).find(x=>x.courseId==='d01');
assert(dep&&(dep.critical||[]).length===0&&(dep.support||[]).length===0,'A6 prerequisite registry reintroduced d01/P0 coupling');

for(const id of ['d01','d15','p02']){
  const c=arch.courses.find(x=>x.courseId===id);
  assert(c?.semester1Allocation?.credits===null&&c?.semester1Allocation?.hours===null&&c?.semester1Allocation?.assessmentTiming==='unresolved',`A6 ${id} multi-semester allocation must remain unresolved`);
}

assert(!/localStorage\.setItem/.test(command),'A6 Command Center must stay read-only');
assert(!/window\.save\s*\(/.test(command),'A6 Command Center must not call save');
assert(command.includes('schedulerMutation:false')&&command.includes('evidenceMutation:false'),'A6 Command Center safety markers missing');
assert(event.includes('officialResultMutation:false'),'A6 Event runtime official-result boundary missing');
assert(grade.includes('supplementCounting:false'),'A6 Grade runtime supplement boundary missing');
assert(transcript.includes('eventAutoPromotion:false'),'A6 Transcript event-auto-promotion boundary missing');
assert(transcript.includes('projectionCaveatActive'),'A6 honors projection caveat missing');
assert(transcript.includes("finalEligibilityClaimed:complete&&id==='HONORS_RULES_MET_ON_VERIFIED_LEDGER'&&!projectionCaveatActive"),'A6 final honors claim guard drifted');
assert(!/return \{id:'COMPLETED'/.test(course),'A6 Course runtime must not fabricate COMPLETED lifecycle');

for(const test of [
  'tests/academic-browser-acceptance-13e.mjs',
  'tests/course-readiness-browser-a2.mjs',
  'tests/event-grade-browser-a3.mjs',
  'tests/transcript-honors-browser-a4.mjs',
  'tests/academic-command-center-browser-a5.mjs'
])assert(workflow.includes(test),`A6 workflow missing browser regression ${test}`);

assert(workflow.includes('Validate A5 Academic Command Center'),'A6 workflow lost A5 static gate');
assert(!/wrangler\s+deploy/.test(workflow),'Academic gate must never deploy');
assert(!/CLOUDFLARE_API_TOKEN/.test(workflow),'Academic gate must not consume deploy credentials');

if(errors.length){console.error(`A6_CURRENT_MAIN_INTEGRATION_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('A6_CURRENT_MAIN_INTEGRATION_PASS');
console.log(JSON.stringify({validators:validators.length,courses:expected.length,semanticSeparation:true,d01English:true,commandCenterReadOnly:true,browserCoverage:5,productionMutation:false},null,2));
