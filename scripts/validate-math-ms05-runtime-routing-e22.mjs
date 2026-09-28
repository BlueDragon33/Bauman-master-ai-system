#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E22-RUNTIME FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E22-RUNTIME OK:",m);
const read=p=>fs.readFileSync(p,"utf8"),json=p=>JSON.parse(read(p));
const nav=read("subjects/math/assets/theory_skin/theory-learning-path-E186.js");
for(const token of ["programLectureMatches","Array.isArray(r.programLectureIds)","active&&active.chapterId"])if(!nav.includes(token))fail("E186 routing token missing: "+token);
const tab=read("subjects/math/assets/theory_skin/theory-tab-E129.js");
for(const token of ["data/theory_lecture_content.json","selectedRecord=p.lessonId?cache.records.find","chapterById(selectedRecord.chapterId)"])if(!tab.includes(token))fail("E129 bridge token missing: "+token);
const rows=(json("subjects/math/data/theory_lecture_content.json").records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_s05");
if(rows.length!==8)fail("runtime expected 8 m_s05 lessons");
const allowed=/^MATH-PREP-C(07|08|09|11|12|15|16|18)-/;
for(const r of rows){
 if(!r.programLectureId||!r.programLectureIds?.includes(r.programLectureId))fail("primary program anchor missing from programLectureIds: "+r.lessonId);
 if(r.programLectureIds?.includes("MATH-PROG-L14-stochastic-processes-time-series"))fail("E22 leaked into L14: "+r.lessonId);
 if(!allowed.test(r.chapterId||""))fail("unexpected physical chapter: "+r.chapterId);
}
const must=[
["m_s05_t01","MATH-PROG-L01-linear-algebra-basic","MATH-PREP-C09-"],
["m_s05_t02","MATH-PROG-L03-calculus-gradient-optimization","MATH-PREP-C12-"],
["m_s05_t03","MATH-PROG-L12-probability-random-variables","MATH-PREP-C15-"],
["m_s05_t05","MATH-PROG-L13-mathematical-statistics","MATH-PREP-C16-"],
["m_s05_t06","MATH-PROG-L10-logic-set-theory-boolean","MATH-PREP-C07-"],
["m_s05_t08","MATH-PROG-L16-numerical-methods-computing","MATH-PREP-C18-"]
];
for(const [id,program,chapterPrefix] of must){
 const r=rows.find(x=>x?.sourceAnchors?.logicalLessonId===id);
 if(!r)fail("missing representative "+id);
 else {if(!r.programLectureIds?.includes(program))fail(id+" missing "+program);if(!r.chapterId.startsWith(chapterPrefix))fail(id+" wrong physical route "+r.chapterId);}
}
const activity=read("subjects/math/assets/math-activity-studio.js");
for(const p of ["data/exercise_content.json","data/application_content.json","data/simulation_content.json","data/review_pack_content.json","data/question_bank_content.json","data/professor_qa_content.json"])if(!activity.includes(p))fail("Activity Studio missing "+p);
const formula=read("subjects/math/assets/math-formula-library.js");
if(!formula.includes("data/formula_content.json"))fail("Formula Library lost canonical source");
if(!process.exitCode)ok("E22 multi-program routing + canonical stores + L14 isolation pass");
console.log("E22 m_s05 runtime static gate:",process.exitCode?"FAIL":"PASS");
