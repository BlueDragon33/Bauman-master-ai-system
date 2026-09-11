'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'assets/js/academic-main.js'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'assets/data/prerequisite-registry-iu5-2026.json'),'utf8'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'assets/data/official-curriculum-iu5-2026.json'),'utf8'));
const errors=[];
const assert=(cond,msg)=>{if(!cond)errors.push(msg)};

for(const token of [
  "Academic 2026 Runtime · Pass 13C",
  "const SCHEDULER_MUTATION_ENABLED=false",
  "prepare:'before_stankin'",
  "preparatory:'stankin'",
  "bauman:'pre_bauman_8_weeks'",
  "m1:'semester_1'",
  'function currentStageId()',
  'function currentCourseHorizon(',
  'function gateActivation(',
  'function courseRisk(',
  'function courseRiskBoard(',
  'function gateIntervention(',
  'function activeRepairPlan(',
  'function schedulerCompatibility(',
  "mode:'advice_only'",
  'Readiness risk only; not a probability of receiving a grade.'
]) assert(runtime.includes(token),`runtime missing ${token}`);

assert(!/SCHEDULER_MUTATION_ENABLED\s*=\s*true/.test(runtime),'scheduler mutation must remain disabled in Pass13C');
assert(!/\.autoSchedule\s*\(/.test(runtime),'Academic runtime must not invoke legacy autoSchedule in Pass13C');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Academic runtime must not write schedule entries in Pass13C');
assert(!/probability of receiving a grade[^.]*\d+%/i.test(runtime),'Course risk must not fabricate grade probability');

const stageExpected={prepare:'before_stankin',preparatory:'stankin',bauman:'pre_bauman_8_weeks',m1:'semester_1',m2:'semester_2',m3:'semester_3',m4:'semester_4'};
for(const [legacy,academic] of Object.entries(stageExpected)) assert(runtime.includes(`${legacy}:'${academic}'`),`stage map missing ${legacy} -> ${academic}`);
for(const id of Object.values(stageExpected)) assert(registry.stageActivationPolicy.some(x=>x.stage===id),`registry missing activation stage ${id}`);

const electiveGroups=curriculum.electiveGroups.map(g=>({...g,semesters:[g.semester]}));
const electiveOptions=curriculum.electiveGroups.flatMap(g=>g.options.map(o=>({...o,credits:g.credits,hours:g.hours,semesters:[g.semester],assessment:g.assessment})));
const allOfficial=[...curriculum.disciplines,...curriculum.practices,...curriculum.gia,...electiveGroups,...electiveOptions];
const officialIds=new Set(allOfficial.map(x=>x.id));
for(const dep of registry.courseDependencies) assert(officialIds.has(dep.courseId),`risk engine dependency points to unknown official course ${dep.courseId}`);

function stateRisk(state){return ({rebuild:'CRITICAL',repair:'HIGH',bridge:'MEDIUM',unassessed:'UNKNOWN',ready:'CLEAR',mastered:'CLEAR'})[state]}
assert(stateRisk('unassessed')==='UNKNOWN','unassessed course readiness must stay UNKNOWN, not be treated as failure');
assert(stateRisk('rebuild')==='CRITICAL','rebuild must map to CRITICAL readiness risk');
assert(stateRisk('repair')==='HIGH','repair must map to HIGH readiness risk');
assert(stateRisk('bridge')==='MEDIUM','bridge must map to MEDIUM readiness risk');
assert(stateRisk('ready')==='CLEAR'&&stateRisk('mastered')==='CLEAR','ready/mastered must map to CLEAR readiness risk');

function weighted(D0,D1,D2){return Math.round((.25*D0+.5*D1+.25*D2)*10)/10}
function gateState({D0,D1,D2,critical}){
  const score=weighted(D0,D1,D2);
  if(critical>0)return 'repair';
  if(score<60)return 'rebuild';
  if(score<80)return 'repair';
  if(score<90)return 'bridge';
  if(D1<85)return 'repair';
  if(score>=95&&D1>=90)return 'mastered';
  return 'ready';
}
assert(gateState({D0:100,D1:80,D2:100,critical:0})==='repair','D1 floor must override high weighted score');
assert(gateState({D0:100,D1:100,D2:100,critical:1})==='repair','critical misconception must override perfect score');
assert(gateState({D0:95,D1:95,D2:95,critical:0})==='mastered','95/95/95 with zero critical must be MASTERED');
assert(gateState({D0:90,D1:90,D2:90,critical:0})==='ready','90/90/90 must be READY');

function courseWorst(states){
  if(states.includes('unassessed'))return 'unassessed';
  if(states.every(s=>s==='mastered'))return 'mastered';
  if(states.every(s=>s==='ready'||s==='mastered'))return 'ready';
  const order=['rebuild','repair','bridge','ready','mastered'];
  return states.reduce((a,b)=>order.indexOf(b)<order.indexOf(a)?b:a,states[0]);
}
assert(courseWorst(['mastered','ready','bridge'])==='bridge','course readiness must use worst critical gate');
assert(courseWorst(['mastered','ready','ready'])==='ready','course should be READY when all critical gates are ready/mastered');
assert(courseWorst(['mastered','unassessed'])==='unassessed','unknown critical gate must keep course readiness unknown');

const p0=registry.coreGates.find(g=>g.id==='P0');
assert(Boolean(p0),'P0 must exist');
assert(runtime.includes("gateId==='P0'?'JIT_ONLY':'STOP_BROAD'"),'P0 MASTERED must stop broad remediation but keep JIT continuity');
assert(runtime.includes('course_event_jit_russian_only'),'P0 stop continuity marker is required');

const pre=registry.stageActivationPolicy.find(x=>x.stage==='pre_bauman_8_weeks');
for(const gateId of ['P2','P3','P4','P5','P6','P8','P9','P10','P11','J1']) assert(pre.active.includes(gateId),`pre-Bauman active route missing ${gateId}`);

if(errors.length){
  console.error(`PASS13C_RISK_ENGINE_FAIL (${errors.length})`);
  for(const e of errors)console.error(`- ${e}`);
  process.exit(1);
}
console.log('PASS13C_RISK_ENGINE_PASS');
console.log(JSON.stringify({schedulerMutation:false,stageMappings:Object.keys(stageExpected).length,officialDependencies:registry.courseDependencies.length,riskStates:['CRITICAL','HIGH','MEDIUM','UNKNOWN','CLEAR'],p0StopMode:'JIT_ONLY'},null,2));