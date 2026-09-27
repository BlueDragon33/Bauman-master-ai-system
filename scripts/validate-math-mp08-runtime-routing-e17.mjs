#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E17-RUNTIME FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E17-RUNTIME OK:",m);
const read=p=>fs.readFileSync(p,"utf8");
const json=p=>JSON.parse(read(p));
const nav=read("subjects/math/assets/theory_skin/theory-learning-path-E186.js");
for(const token of ["E197_PROGRAM_ANCHOR_ROUTING_MP08","programLectureMatches","-L'+String(no).padStart(2,'0')+'-","active&&active.chapterId"]){
 if(!nav.includes(token))fail("E186 program-anchor routing token missing: "+token);
}
if(!process.exitCode)ok("E186 can aggregate program L14 across physical chapters and route selected lesson to its real chapterId");

const theoryTab=read("subjects/math/assets/theory_skin/theory-tab-E129.js");
if(!theoryTab.includes("data/theory_lecture_content.json"))fail("theory runtime lost canonical content source");
const activity=read("subjects/math/assets/math-activity-studio.js");
for(const p of ["data/exercise_content.json","data/application_content.json","data/simulation_content.json","data/review_pack_content.json","data/question_bank_content.json","data/professor_qa_content.json"])if(!activity.includes(p))fail("Activity Studio missing "+p);
const formula=read("subjects/math/assets/math-formula-library.js");
if(!formula.includes("data/formula_content.json"))fail("Formula Library missing canonical formula content");
if(!process.exitCode)ok("canonical runtime stores remain wired");

const rows=(json("subjects/math/data/theory_lecture_content.json").records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_p08");
if(rows.length!==8)fail("runtime theory store expected 8 m_p08 lessons");
for(const r of rows)if(r.programLectureId!=="MATH-PROG-L14-stochastic-processes-time-series")fail("runtime lesson is not addressable from L14: "+r.lessonId);
if(!process.exitCode)ok("all m_p08 lessons are addressable from program L14");
console.log("E17 m_p08 runtime static gate:",process.exitCode?"FAIL":"PASS");
