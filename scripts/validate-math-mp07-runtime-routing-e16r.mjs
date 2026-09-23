#!/usr/bin/env node
import fs from "node:fs";
const fail=m=>{console.error("E16R-RUNTIME FAIL:",m);process.exitCode=1};
const ok=m=>console.log("E16R-RUNTIME OK:",m);
const read=p=>fs.readFileSync(p,"utf8");
const json=p=>JSON.parse(read(p));

const theoryTab=read("subjects/math/assets/theory_skin/theory-tab-E129.js");
const activity=read("subjects/math/assets/math-activity-studio.js");
const sim=read("subjects/math/assets/math-simulation-source.js");
const professor=read("subjects/math/assets/math-professor-drill.js");

for(const token of ["primaryContentSource: 'theory_lecture_content'","data/theory_lecture_content.json","legacySource: 'lessons'"]){
  if(!theoryTab.includes(token))fail("E129 theory route missing token: "+token);
}
if(!process.exitCode)ok("E129 keeps theory_lecture_content authoritative with legacy fallback");

for(const path of ["data/exercise_content.json","data/application_content.json","data/simulation_content.json","data/review_pack_content.json","data/question_bank_content.json","data/professor_qa_content.json"]){
  if(!activity.includes(path))fail("Activity Studio missing canonical source "+path);
}
if(!process.exitCode)ok("Activity Studio routes all m_p07 activity stores to modern content");

if(!sim.includes("const CANONICAL='data/simulation_content.json'"))fail("simulation source no longer canonical");
if(!professor.includes("data/professor_qa_content.json")||!professor.includes("data/question_bank_content.json"))fail("professor drill canonical assessment routes missing");
if(!process.exitCode)ok("simulation and professor drill canonical routes intact");

const expected={
 "subjects/math/data/formula_content.json":24,
 "subjects/math/data/exercise_content.json":64,
 "subjects/math/data/application_content.json":16,
 "subjects/math/data/simulation_content.json":16,
 "subjects/math/data/professor_qa_content.json":8,
 "subjects/math/data/question_bank_content.json":48,
 "subjects/math/data/review_pack_content.json":8
};
for(const [p,n] of Object.entries(expected)){
 const v=json(p), rows=(v.records||[]).filter(r=>r.logicalModuleId==="m_p07");
 if(rows.length!==n)fail(p+" expected "+n+" m_p07 records, got "+rows.length);
}
if(!process.exitCode)ok("runtime-active m_p07 content counts match audited recovery bundle");

const theory=json("subjects/math/data/theory_lecture_content.json");
const ids=new Set((theory.records||[]).map(r=>r.lessonId));
for(const id of [
 "MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140",
 "MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T02-centering-scaling",
 "MATH-VN-C04-xac_suat_co_ban_va_bien_-E16R-MP07-T03-covariance",
 "MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T04-pearson",
 "MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T05-covariance-matrix",
 "MATH-VN-C02-ma_tran_va_phep_bien_oi_-L06-matrix-to-pca-linear-model-e143"
])if(!ids.has(id))fail("theory store missing runtime lesson "+id);
if(!process.exitCode)ok("all m_p07 theory runtime targets exist");

console.log("E16R runtime static gate:",process.exitCode?"FAIL":"PASS");
