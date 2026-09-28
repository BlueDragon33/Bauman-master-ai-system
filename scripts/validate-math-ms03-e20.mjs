#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E20-MS03 FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E20-MS03 OK:",m);
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const map=json("subjects/math/data/ms03-source-map-e20.json");
if(map.frameworkChapterId!=="m_s03"||map.logicalModuleId!=="m_s03")fail("framework/logical IDs inconsistent");
if(map.architecture!=="framework_chapter_over_existing_prep_probability_statistics_spine")fail("invalid architecture");
if(map.legacyFrameworkAlias!=="MATH-PREP-PS-C11"||map.legacyAliasPolicy!=="reference_only_not_runtime_physical_chapter")fail("legacy alias policy missing");
if((map.logicalLessons||[]).length!==8)fail("expected 8 logical lessons");
const spine=json("subjects/math/data/chapter_spine.json");
const prep=new Set(spine.filter(x=>x.stageId==="prep").map(x=>x.chapterId));
const allowed=new Set(["MATH-PREP-C15-xac_suat_phan_phoi_ky_vo","MATH-PREP-C16-thong_ke_uoc_luong_kiem_"]);
if(prep.has("MATH-PREP-PS-C11"))fail("legacy alias unexpectedly exists in physical spine");
for(const x of map.logicalLessons||[]){
 if(!/^m_s03_t0[1-8]$/.test(x.logicalId||""))fail("invalid logical lesson "+x.logicalId);
 if(!allowed.has(x.runtimeChapterId))fail("runtime chapter outside C15/C16: "+x.runtimeChapterId);
 for(const ch of x.physicalChapterIds||[])if(!prep.has(ch)||!allowed.has(ch))fail("mapped chapter outside existing probability/statistics spine: "+ch);
}
if(!process.exitCode)ok("m_s03 maps only to existing PREP-C15/C16; legacy alias stays non-runtime");

const theory=json("subjects/math/data/theory_lecture_content.json");
const rows=(theory.records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_s03");
if(rows.length!==8)fail("expected 8 theory records, got "+rows.length);
const slides=rows.reduce((n,r)=>n+(r.slides||[]).length,0);
if(slides!==160)fail("expected 160 theory slides, got "+slides);
const roles=["russian_term_bridge","pronunciation_drill","assumption_gate","statistical_logic_gate","uncertainty_gate","oral_response","warning_counterexample","error_repair"];
for(const r of rows){
 if(r?.sourceAnchors?.frameworkChapterId!=="m_s03")fail("missing m_s03 framework anchor: "+r.lessonId);
 if(r?.sourceAnchors?.legacyFrameworkChapterAlias!=="MATH-PREP-PS-C11")fail("missing legacy alias evidence: "+r.lessonId);
 if(!r.programLectureIds?.includes("MATH-PROG-L12-probability-random-variables")||!r.programLectureIds?.includes("MATH-PROG-L13-mathematical-statistics"))fail("lesson not addressable from both L12/L13: "+r.lessonId);
 for(const role of roles)if(!(r.slides||[]).some(s=>s.role===role))fail("missing "+role+": "+r.lessonId);
 if(!/[А-Яа-яЁё]/.test(JSON.stringify(r)))fail("no Cyrillic content: "+r.lessonId);
}
if(!process.exitCode)ok("8 lessons / 160 slides include Russian, assumption, statistical-logic and uncertainty gates");

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
 const rs=(json(p).records||[]).filter(r=>r.logicalModuleId==="m_s03");stores[p]=rs;
 if(rs.length!==n)fail(p+" expected "+n+", got "+rs.length);
}
const lessonIds=new Set(rows.map(r=>r.lessonId));
for(const [p,rs] of Object.entries(stores))for(const r of rs){
 if(!lessonIds.has(r.lessonId))fail(p+" orphan lessonId "+r.lessonId);
 if(!/^m_s03_t0[1-8]$/.test(r.logicalLessonId||""))fail(p+" invalid logicalLessonId "+r.logicalLessonId);
 if(r.frameworkChapterId!=="m_s03")fail(p+" missing frameworkChapterId m_s03");
}
const dist=[
 ["subjects/math/data/formula_content.json",3],["subjects/math/data/exercise_content.json",8],
 ["subjects/math/data/application_content.json",2],["subjects/math/data/simulation_content.json",2],
 ["subjects/math/data/professor_qa_content.json",1],["subjects/math/data/question_bank_content.json",6],
 ["subjects/math/data/review_pack_content.json",1]
];
for(const [p,n] of dist)for(let i=1;i<=8;i++){
 const id="m_s03_t0"+i,c=stores[p].filter(r=>r.logicalLessonId===id).length;
 if(c!==n)fail(p+" "+id+" expected "+n+", got "+c);
}
const rpIds=new Set(stores["subjects/math/data/review_pack_content.json"].map(r=>r.reviewPackId));
for(const q of stores["subjects/math/data/question_bank_content.json"])if(!rpIds.has(q.reviewPackId))fail("orphan reviewPackId "+q.questionId);
for(let i=1;i<=8;i++){
 const id="m_s03_t0"+i,s=stores["subjects/math/data/simulation_content.json"].filter(r=>r.logicalLessonId===id);
 if(!s.some(x=>x.simulationClass==="theory")||!s.some(x=>x.simulationClass==="application"))fail("simulation classes incomplete "+id);
}
if(!process.exitCode)ok("sidecar counts, links and simulation classes consistent");
console.log("E20 m_s03 academic gate:",process.exitCode?"FAIL":"PASS");
