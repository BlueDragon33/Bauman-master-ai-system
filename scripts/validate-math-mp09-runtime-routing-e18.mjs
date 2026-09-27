#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E18-RUNTIME FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E18-RUNTIME OK:",m);
const read=p=>fs.readFileSync(p,"utf8"),json=p=>JSON.parse(read(p));
const nav=read("subjects/math/assets/theory_skin/theory-learning-path-E186.js");
for(const token of ["E197_PROGRAM_ANCHOR_ROUTING_MP08","programLectureMatches","Array.isArray(r.programLectureIds)","active&&active.chapterId"])if(!nav.includes(token))fail("program-anchor routing token missing: "+token);
const tab=read("subjects/math/assets/theory_skin/theory-tab-E129.js");
for(const token of ["data/theory_lecture_content.json","selectedRecord=p.lessonId?cache.records.find","chapterById(selectedRecord.chapterId)"])if(!tab.includes(token))fail("E129 physical bridge token missing: "+token);
const activity=read("subjects/math/assets/math-activity-studio.js");
for(const p of ["data/exercise_content.json","data/application_content.json","data/simulation_content.json","data/review_pack_content.json","data/question_bank_content.json","data/professor_qa_content.json"])if(!activity.includes(p))fail("Activity Studio missing "+p);
const formula=read("subjects/math/assets/math-formula-library.js");if(!formula.includes("data/formula_content.json"))fail("Formula Library lost canonical source");
const rows=(json("subjects/math/data/theory_lecture_content.json").records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_p09");
if(rows.length!==8)fail("runtime theory store expected 8 m_p09 lessons");
for(const r of rows){
 if(!r.programLectureIds?.includes("MATH-PROG-L10-logic-set-theory-boolean"))fail("m_p09 lesson not addressable from common L10 bridge: "+r.lessonId);
 if(!/^MATH-PREP-C(07|08|09|11|12|15)-/.test(r.chapterId||""))fail("unexpected E18 runtime physical chapter: "+r.chapterId);
}
if(!process.exitCode)ok("E18 lessons are addressable from L10 while retaining real prep physical chapter IDs");
console.log("E18 m_p09 runtime static gate:",process.exitCode?"FAIL":"PASS");
