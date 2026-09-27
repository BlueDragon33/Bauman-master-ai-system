#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E18-MP09 FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E18-MP09 OK:",m);
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const map=json("subjects/math/data/mp09-source-map-e18.json");
if(map.frameworkChapterId!=="m_s01"||map.logicalModuleId!=="m_p09")fail("framework/logical IDs are inconsistent");
if(map.architecture!=="framework_chapter_logical_lesson_group_over_physical_prep_spine")fail("invalid source-map architecture");
if((map.logicalLessons||[]).length!==8)fail("expected 8 logical lessons");
const spine=json("subjects/math/data/chapter_spine.json");
const prep=new Set(spine.filter(x=>x.stageId==="prep").map(x=>x.chapterId));
for(const x of map.logicalLessons||[]){
 if(!/^m_p09_t0[1-8]$/.test(x.logicalId||""))fail("invalid logical lesson "+x.logicalId);
 for(const ch of x.physicalChapterIds||[])if(!prep.has(ch))fail("mapped physical chapter is not an existing prep spine chapter: "+ch);
 if(!prep.has(x.runtimeChapterId))fail("runtime chapter not in prep spine: "+x.runtimeChapterId);
}
if(!process.exitCode)ok("m_s01/m_p09 mapping resolves only to existing prep physical chapters");

const theory=json("subjects/math/data/theory_lecture_content.json");
const trows=(theory.records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_p09");
if(trows.length!==8)fail("expected 8 m_p09 theory records, got "+trows.length);
const slides=trows.reduce((n,r)=>n+(r.slides||[]).length,0);
if(slides!==160)fail("expected 160 theory slides, got "+slides);
const required=["russian_term_bridge","pronunciation_drill","oral_response","warning_counterexample","assumption_gate","error_repair"];
for(const r of trows){
 if(!Array.isArray(r.programLectureIds)||!r.programLectureIds.includes("MATH-PROG-L10-logic-set-theory-boolean"))fail("missing common L10 bridge: "+r.lessonId);
 if(r?.sourceAnchors?.frameworkChapterId!=="m_s01")fail("missing m_s01 framework anchor: "+r.lessonId);
 for(const role of required)if(!(r.slides||[]).some(s=>s.role===role))fail("missing "+role+": "+r.lessonId);
 if(!/[А-Яа-яЁё]/.test(JSON.stringify(r)))fail("lesson has no Cyrillic content: "+r.lessonId);
}
if(!process.exitCode)ok("8 lessons / 160 slides contain Russian terms, pronunciation, oral defense and repair gates");

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
 const rows=(json(p).records||[]).filter(r=>r.logicalModuleId==="m_p09");
 stores[p]=rows;if(rows.length!==n)fail(p+" expected "+n+", got "+rows.length);
}
const lessonIds=new Set(trows.map(r=>r.lessonId));
for(const [p,rows] of Object.entries(stores))for(const r of rows){
 if(!lessonIds.has(r.lessonId))fail(p+" orphan lessonId "+r.lessonId);
 if(!/^m_p09_t0[1-8]$/.test(r.logicalLessonId||""))fail(p+" invalid logicalLessonId "+r.logicalLessonId);
 if(r.frameworkChapterId!=="m_s01")fail(p+" missing frameworkChapterId m_s01");
}
const dist=[
 ["subjects/math/data/formula_content.json",3],["subjects/math/data/exercise_content.json",8],
 ["subjects/math/data/application_content.json",2],["subjects/math/data/simulation_content.json",2],
 ["subjects/math/data/professor_qa_content.json",1],["subjects/math/data/question_bank_content.json",6],
 ["subjects/math/data/review_pack_content.json",1]
];
for(const [p,n] of dist)for(let i=1;i<=8;i++){
 const id="m_p09_t0"+i,c=stores[p].filter(r=>r.logicalLessonId===id).length;
 if(c!==n)fail(p+" "+id+" expected "+n+", got "+c);
}
const rpIds=new Set(stores["subjects/math/data/review_pack_content.json"].map(r=>r.reviewPackId));
for(const q of stores["subjects/math/data/question_bank_content.json"])if(!rpIds.has(q.reviewPackId))fail("question orphan reviewPackId "+q.questionId);
for(let i=1;i<=8;i++){
 const id="m_p09_t0"+i,s=stores["subjects/math/data/simulation_content.json"].filter(r=>r.logicalLessonId===id);
 if(!s.some(x=>x.simulationClass==="theory")||!s.some(x=>x.simulationClass==="application"))fail("simulation classes incomplete "+id);
}
if(!process.exitCode)ok("sidecar counts, lesson links, review packs and simulation classes are consistent");
console.log("E18 m_p09 academic gate:",process.exitCode?"FAIL":"PASS");
