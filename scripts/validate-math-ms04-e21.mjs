#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E21-MS04 FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E21-MS04 OK:",m);
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const map=json("subjects/math/data/ms04-source-map-e21.json");
if(map.frameworkChapterId!=="m_s04"||map.logicalModuleId!=="m_s04")fail("framework/logical IDs inconsistent");
if(map.architecture!=="framework_chapter_over_existing_multidisciplinary_prep_spine")fail("invalid architecture");
if(map.legacyFrameworkAlias!=="MATH-PREP-MT-C12"||map.legacyAliasPolicy!=="reference_only_not_runtime_physical_chapter")fail("legacy alias policy missing");
if((map.logicalLessons||[]).length!==8)fail("expected 8 logical lessons");
const spine=json("subjects/math/data/chapter_spine.json");
const prep=new Set(spine.filter(x=>x.stageId==="prep").map(x=>x.chapterId));
const allowed=new Set(["MATH-PREP-C09-ai_so_tuyen_tinh_i_vecto","MATH-PREP-C10-ai_so_tuyen_tinh_ii_tri_","MATH-PREP-C16-thong_ke_uoc_luong_kiem_","MATH-PREP-C18-lab_mo_hinh_toan_tin_hie"]);
if(prep.has("MATH-PREP-MT-C12"))fail("legacy alias unexpectedly exists in physical spine");
for(const x of map.logicalLessons||[]){
 if(!/^m_s04_t0[1-8]$/.test(x.logicalId||""))fail("invalid logical lesson "+x.logicalId);
 if(!allowed.has(x.runtimeChapterId))fail("runtime chapter outside E21 set: "+x.runtimeChapterId);
 for(const ch of x.physicalChapterIds||[])if(!prep.has(ch)||!allowed.has(ch))fail("mapped chapter outside E21 physical spine: "+ch);
}
if(!process.exitCode)ok("m_s04 maps only to existing C09/C10/C16/C18; alias stays non-runtime");

const theory=json("subjects/math/data/theory_lecture_content.json");
const rows=(theory.records||[]).filter(r=>r?.sourceAnchors?.logicalModuleId==="m_s04");
if(rows.length!==8)fail("expected 8 m_s04 theory records, got "+rows.length);
const slides=rows.reduce((n,r)=>n+(r.slides||[]).length,0);
if(slides!==160)fail("expected 160 slides, got "+slides);
const roles=["russian_term_bridge","notation_formula","matrix_example","condition_gate","data_leakage_gate","render_integrity","warning_counterexample","error_repair"];
for(const r of rows){
 if(r?.sourceAnchors?.frameworkChapterId!=="m_s04")fail("missing m_s04 framework anchor: "+r.lessonId);
 if(r?.sourceAnchors?.legacyFrameworkChapterAlias!=="MATH-PREP-MT-C12")fail("missing legacy alias evidence: "+r.lessonId);
 if(!r.programLectureIds?.includes("MATH-PROG-L17-ai-machine-learning-math-foundations"))fail("missing L17 bridge: "+r.lessonId);
 if(r.programLectureIds?.includes("MATH-PROG-L14-stochastic-processes-time-series"))fail("E21 must not leak into E17/L14: "+r.lessonId);
 for(const role of roles)if(!(r.slides||[]).some(s=>s.role===role))fail("missing "+role+": "+r.lessonId);
 const rc=r.renderContract||{};
 for(const k of ["formulaBlockOnly","matrixBlockOnly","noRawLatex","noCodeStyleFormula","hideSearchMeta"])if(rc[k]!==true)fail("render contract "+k+" not true: "+r.lessonId);
 const formulaSlide=(r.slides||[]).find(s=>s.role==="notation_formula");
 if(!formulaSlide||(formulaSlide.blocks||[]).some(b=>b.type!=="formula"))fail("notation_formula contains non-formula block: "+r.lessonId);
 const matrixSlide=(r.slides||[]).find(s=>s.role==="matrix_example");
 if(!matrixSlide||(matrixSlide.blocks||[]).some(b=>b.type!=="matrix"))fail("matrix_example contains non-matrix block: "+r.lessonId);
 const raw=JSON.stringify(r);
 if(raw.includes("\\\\(")||raw.includes("\\\\[")||raw.includes("$$"))fail("raw LaTeX marker found: "+r.lessonId);
}
if(!process.exitCode)ok("8/160 content and render integrity gates pass");

const expected={"subjects/math/data/formula_content.json":24,"subjects/math/data/exercise_content.json":64,"subjects/math/data/application_content.json":16,"subjects/math/data/simulation_content.json":16,"subjects/math/data/professor_qa_content.json":8,"subjects/math/data/question_bank_content.json":48,"subjects/math/data/review_pack_content.json":8};
const stores={};
for(const [p,n] of Object.entries(expected)){const rs=(json(p).records||[]).filter(r=>r.logicalModuleId==="m_s04");stores[p]=rs;if(rs.length!==n)fail(p+" expected "+n+", got "+rs.length);}
const lessonIds=new Set(rows.map(r=>r.lessonId));
for(const [p,rs] of Object.entries(stores))for(const r of rs){if(!lessonIds.has(r.lessonId))fail(p+" orphan lessonId "+r.lessonId);if(!/^m_s04_t0[1-8]$/.test(r.logicalLessonId||""))fail(p+" invalid logicalLessonId "+r.logicalLessonId);if(r.frameworkChapterId!=="m_s04")fail(p+" missing frameworkChapterId");}
const dist=[["subjects/math/data/formula_content.json",3],["subjects/math/data/exercise_content.json",8],["subjects/math/data/application_content.json",2],["subjects/math/data/simulation_content.json",2],["subjects/math/data/professor_qa_content.json",1],["subjects/math/data/question_bank_content.json",6],["subjects/math/data/review_pack_content.json",1]];
for(const [p,n] of dist)for(let i=1;i<=8;i++){const id="m_s04_t0"+i,c=stores[p].filter(r=>r.logicalLessonId===id).length;if(c!==n)fail(p+" "+id+" expected "+n+", got "+c);}
const rpIds=new Set(stores["subjects/math/data/review_pack_content.json"].map(r=>r.reviewPackId));
for(const q of stores["subjects/math/data/question_bank_content.json"])if(!rpIds.has(q.reviewPackId))fail("orphan reviewPackId "+q.questionId);
for(let i=1;i<=8;i++){const id="m_s04_t0"+i,s=stores["subjects/math/data/simulation_content.json"].filter(r=>r.logicalLessonId===id);if(!s.some(x=>x.simulationClass==="theory")||!s.some(x=>x.simulationClass==="application"))fail("simulation classes incomplete "+id);}
if(!process.exitCode)ok("sidecar counts, links and simulation classes consistent");
console.log("E21 m_s04 academic/render gate:",process.exitCode?"FAIL":"PASS");
