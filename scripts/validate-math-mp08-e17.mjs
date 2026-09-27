#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E17-MP08 FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E17-MP08 OK:",m);
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const map=json("subjects/math/data/mp08-source-map-e17.json");
if(map.moduleId!=="m_p08"||map.architecture!=="logical_module_over_physical_content")fail("invalid source-map architecture");
if((map.logicalLessons||[]).length!==8)fail("expected 8 logical lessons");
if(JSON.stringify(map).includes("MATH-VN-C08"))fail("forbidden fabricated VN physical C08");
if(!process.exitCode)ok("source-map preserves logical-module architecture");

const theory=json("subjects/math/data/theory_lecture_content.json");
const trows=(theory.records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_p08");
if(trows.length!==8)fail("expected 8 m_p08 theory records, got "+trows.length);
const totalSlides=trows.reduce((n,r)=>n+(r.slides||[]).length,0);
if(totalSlides!==82)fail("expected 82 theory slides, got "+totalSlides);
for(const r of trows){
 if(r.programLectureId!=="MATH-PROG-L14-stochastic-processes-time-series")fail("wrong program anchor: "+r.lessonId);
 if(!(r.slides||[]).some(s=>s.role==="warning_counterexample"))fail("missing warning slide: "+r.lessonId);
 if(!(r.slides||[]).some(s=>s.role==="assumption_gate"))fail("missing assumption gate: "+r.lessonId);
}
if(!process.exitCode)ok("8 lessons / 82 slides resolve to program L14");

const expected={
 "subjects/math/data/formula_content.json":24,
 "subjects/math/data/exercise_content.json":64,
 "subjects/math/data/application_content.json":16,
 "subjects/math/data/simulation_content.json":16,
 "subjects/math/data/professor_qa_content.json":8,
 "subjects/math/data/question_bank_content.json":48,
 "subjects/math/data/review_pack_content.json":8
};
const stores={};
for(const [p,n] of Object.entries(expected)){
 const rows=(json(p).records||[]).filter(r=>r.logicalModuleId==="m_p08");
 stores[p]=rows;
 if(rows.length!==n)fail(p+" expected "+n+", got "+rows.length);
}
const lessonIds=new Set(trows.map(r=>r.lessonId));
for(const [p,rows] of Object.entries(stores)) for(const r of rows){
 if(!lessonIds.has(r.lessonId))fail(p+" orphan lessonId "+r.lessonId);
 if(!/^m_p08_t0[1-8]$/.test(r.logicalLessonId||""))fail(p+" invalid logicalLessonId "+r.logicalLessonId);
}
const dist=[
 ["subjects/math/data/formula_content.json",3],
 ["subjects/math/data/exercise_content.json",8],
 ["subjects/math/data/application_content.json",2],
 ["subjects/math/data/simulation_content.json",2],
 ["subjects/math/data/professor_qa_content.json",1],
 ["subjects/math/data/question_bank_content.json",6],
 ["subjects/math/data/review_pack_content.json",1]
];
for(const [p,n] of dist)for(let i=1;i<=8;i++){
 const id="m_p08_t0"+i,c=stores[p].filter(r=>r.logicalLessonId===id).length;
 if(c!==n)fail(p+" "+id+" expected "+n+", got "+c);
}
const rpIds=new Set(stores["subjects/math/data/review_pack_content.json"].map(r=>r.reviewPackId));
for(const q of stores["subjects/math/data/question_bank_content.json"])if(!rpIds.has(q.reviewPackId))fail("question orphan reviewPackId "+q.questionId);
for(let i=1;i<=8;i++){
 const id="m_p08_t0"+i,sims=stores["subjects/math/data/simulation_content.json"].filter(r=>r.logicalLessonId===id);
 if(!sims.some(x=>x.simulationClass==="theory")||!sims.some(x=>x.simulationClass==="application"))fail("simulation classes incomplete "+id);
}
if(!process.exitCode)ok("sidecar counts, per-lesson distribution and links are consistent");
console.log("E17 m_p08 academic gate:",process.exitCode?"FAIL":"PASS");
