#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E19-MP10 FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E19-MP10 OK:",m);
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const map=json("subjects/math/data/mp10-source-map-e19.json");
if(map.frameworkChapterId!=="m_s02"||map.logicalModuleId!=="m_p10")fail("framework/logical IDs inconsistent");
if(map.architecture!=="framework_chapter_logical_lesson_group_over_existing_prep_linear_algebra_spine")fail("invalid source-map architecture");
if((map.logicalLessons||[]).length!==8)fail("expected 8 logical lessons");
const spine=json("subjects/math/data/chapter_spine.json");
const prep=new Set(spine.filter(x=>x.stageId==="prep").map(x=>x.chapterId));
const allowed=new Set(["MATH-PREP-C09-ai_so_tuyen_tinh_i_vecto","MATH-PREP-C10-ai_so_tuyen_tinh_ii_tri_"]);
for(const x of map.logicalLessons||[]){
 if(!/^m_p10_t0[1-8]$/.test(x.logicalId||""))fail("invalid logical lesson "+x.logicalId);
 if(!allowed.has(x.runtimeChapterId))fail("runtime chapter outside C09/C10: "+x.runtimeChapterId);
 for(const ch of x.physicalChapterIds||[])if(!prep.has(ch)||!allowed.has(ch))fail("mapped chapter outside existing linear-algebra prep spine: "+ch);
}
if(!process.exitCode)ok("m_s02/m_p10 maps only to existing PREP-C09/C10");

const theory=json("subjects/math/data/theory_lecture_content.json");
const rows=(theory.records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_p10");
if(rows.length!==8)fail("expected 8 m_p10 theory records, got "+rows.length);
const slideCount=rows.reduce((n,r)=>n+(r.slides||[]).length,0);
if(slideCount!==160)fail("expected 160 theory slides, got "+slideCount);
const roles=["russian_term_bridge","pronunciation_drill","condition_gate","dimension_logic_gate","oral_response","warning_counterexample","assumption_gate","error_repair"];
for(const r of rows){
 if(r?.sourceAnchors?.frameworkChapterId!=="m_s02")fail("missing m_s02 framework anchor: "+r.lessonId);
 if(!r.programLectureIds?.includes("MATH-PROG-L01-linear-algebra-basic"))fail("missing L01 bridge: "+r.lessonId);
 if(!r.programLectureIds?.includes("MATH-PROG-L02-vector-spaces-linear-maps"))fail("missing L02 bridge: "+r.lessonId);
 for(const role of roles)if(!(r.slides||[]).some(s=>s.role===role))fail("missing "+role+": "+r.lessonId);
 if(!/[А-Яа-яЁё]/.test(JSON.stringify(r)))fail("no Cyrillic content: "+r.lessonId);
}
if(!process.exitCode)ok("8 lessons / 160 slides contain Russian, condition/dimension and oral-defense gates");

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
 const rs=(json(p).records||[]).filter(r=>r.logicalModuleId==="m_p10");stores[p]=rs;
 if(rs.length!==n)fail(p+" expected "+n+", got "+rs.length);
}
const lessonIds=new Set(rows.map(r=>r.lessonId));
for(const [p,rs] of Object.entries(stores))for(const r of rs){
 if(!lessonIds.has(r.lessonId))fail(p+" orphan lessonId "+r.lessonId);
 if(!/^m_p10_t0[1-8]$/.test(r.logicalLessonId||""))fail(p+" invalid logicalLessonId "+r.logicalLessonId);
 if(r.frameworkChapterId!=="m_s02")fail(p+" missing frameworkChapterId m_s02");
}
const dist=[
 ["subjects/math/data/formula_content.json",3],["subjects/math/data/exercise_content.json",8],
 ["subjects/math/data/application_content.json",2],["subjects/math/data/simulation_content.json",2],
 ["subjects/math/data/professor_qa_content.json",1],["subjects/math/data/question_bank_content.json",6],
 ["subjects/math/data/review_pack_content.json",1]
];
for(const [p,n] of dist)for(let i=1;i<=8;i++){
 const id="m_p10_t0"+i,c=stores[p].filter(r=>r.logicalLessonId===id).length;
 if(c!==n)fail(p+" "+id+" expected "+n+", got "+c);
}
const rpIds=new Set(stores["subjects/math/data/review_pack_content.json"].map(r=>r.reviewPackId));
for(const q of stores["subjects/math/data/question_bank_content.json"])if(!rpIds.has(q.reviewPackId))fail("orphan reviewPackId "+q.questionId);
for(let i=1;i<=8;i++){
 const id="m_p10_t0"+i,s=stores["subjects/math/data/simulation_content.json"].filter(r=>r.logicalLessonId===id);
 if(!s.some(x=>x.simulationClass==="theory")||!s.some(x=>x.simulationClass==="application"))fail("simulation classes incomplete "+id);
}
if(!process.exitCode)ok("sidecar counts, per-lesson distribution, review links and simulation classes are consistent");
console.log("E19 m_p10 academic gate:",process.exitCode?"FAIL":"PASS");
