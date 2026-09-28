#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E20-RUNTIME FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E20-RUNTIME OK:",m);
const read=p=>fs.readFileSync(p,"utf8"),json=p=>JSON.parse(read(p));
const nav=read("subjects/math/assets/theory_skin/theory-learning-path-E186.js");
for(const token of ["programLectureMatches","Array.isArray(r.programLectureIds)","active&&active.chapterId"])if(!nav.includes(token))fail("E186 routing token missing: "+token);
const tab=read("subjects/math/assets/theory_skin/theory-tab-E129.js");
for(const token of ["data/theory_lecture_content.json","selectedRecord=p.lessonId?cache.records.find","chapterById(selectedRecord.chapterId)"])if(!tab.includes(token))fail("E129 bridge token missing: "+token);
const activity=read("subjects/math/assets/math-activity-studio.js");
for(const p of ["data/exercise_content.json","data/application_content.json","data/simulation_content.json","data/review_pack_content.json","data/question_bank_content.json","data/professor_qa_content.json"])if(!activity.includes(p))fail("Activity Studio missing "+p);
const formula=read("subjects/math/assets/math-formula-library.js");if(!formula.includes("data/formula_content.json"))fail("Formula Library lost canonical source");
const rows=(json("subjects/math/data/theory_lecture_content.json").records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_s03");
if(rows.length!==8)fail("runtime expected 8 m_s03 lessons");
for(const r of rows){
 if(!r.programLectureIds?.includes("MATH-PROG-L12-probability-random-variables")||!r.programLectureIds?.includes("MATH-PROG-L13-mathematical-statistics"))fail("not addressable from both L12/L13: "+r.lessonId);
 if(!/^MATH-PREP-C(15|16)-/.test(r.chapterId||""))fail("unexpected physical chapter: "+r.chapterId);
 if(r.chapterId==="MATH-PREP-PS-C11")fail("legacy alias leaked into runtime");
}
if(!process.exitCode)ok("all E20 lessons route through L12/L13 to real PREP-C15/C16");
console.log("E20 m_s03 runtime static gate:",process.exitCode?"FAIL":"PASS");
