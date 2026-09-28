#!/usr/bin/env node
import fs from "node:fs";

const fail = msg => { console.error("E26-HK1 FAIL:", msg); process.exitCode = 1; };
const ok = msg => console.log("E26-HK1 OK:", msg);
const json = p => JSON.parse(fs.readFileSync(p, "utf8"));

const modules = [
  { id:"m_m101", map:"subjects/math/data/mm101-source-map-e23.json", round:"E23" },
  { id:"m_m102", map:"subjects/math/data/mm102-source-map-e23.json", round:"E23" },
  { id:"m_m103", map:"subjects/math/data/mm103-source-map-e24.json", round:"E24" },
  { id:"m_m104", map:"subjects/math/data/mm104-source-map-e25.json", round:"E25" }
];
const expected = {
  theory:8, formulas:24, exercises:64, applications:16,
  simulations:16, professorQA:8, questions:48, reviewPacks:8
};
const storePaths = {
  formulas:"subjects/math/data/formula_content.json",
  exercises:"subjects/math/data/exercise_content.json",
  applications:"subjects/math/data/application_content.json",
  simulations:"subjects/math/data/simulation_content.json",
  professorQA:"subjects/math/data/professor_qa_content.json",
  questions:"subjects/math/data/question_bank_content.json",
  reviewPacks:"subjects/math/data/review_pack_content.json"
};

for (const m of modules) {
  const map = json(m.map);
  if (map.logicalModuleId !== m.id || map.frameworkChapterId !== m.id) fail(m.id+" source-map IDs inconsistent");
  if ((map.logicalLessons||[]).length !== 8) fail(m.id+" must have 8 logical lessons");
  if (map.runtimeIsolation?.forbiddenProgramLectureIds?.includes("MATH-PROG-L14-stochastic-processes-time-series") !== true) {
    fail(m.id+" must explicitly isolate time-series lecture L14");
  }
}
if (!process.exitCode) ok("source maps m_m101→m_m104 present with 8 lessons and L14 isolation");

const theory = json("subjects/math/data/theory_lecture_content.json").records || [];
for (const m of modules) {
  const rows = theory.filter(r => r?.sourceAnchors?.logicalModuleId === m.id || r?.logicalModuleId === m.id);
  if (rows.length !== expected.theory) fail(m.id+" theory expected 8 records, got "+rows.length);
  const slides = rows.reduce((n,r)=>n+(r.slides||[]).length,0);
  if (slides !== 160) fail(m.id+" theory expected 160 slides, got "+slides);
  for (const r of rows) {
    if (r.programLectureIds?.includes("MATH-PROG-L14-stochastic-processes-time-series")) fail(m.id+" leaks into time-series L14: "+r.lessonId);
    const rc=r.renderContract||{};
    for (const k of ["formulaBlockOnly","matrixBlockOnly","noRawLatex","noCodeStyleFormula","hideSearchMeta"]) {
      if (rc[k] !== true) fail(m.id+" render contract "+k+" not true: "+r.lessonId);
    }
  }
}
if (!process.exitCode) ok("32 HK1 theory lessons / 640 slides / render contracts pass");

const stores = {};
for (const [key,path] of Object.entries(storePaths)) stores[key] = json(path).records || [];
for (const m of modules) {
  for (const [key,n] of Object.entries(expected)) {
    if (key === "theory") continue;
    const rows = stores[key].filter(r=>r.logicalModuleId===m.id);
    if (rows.length !== n) fail(m.id+" "+key+" expected "+n+", got "+rows.length);
  }
}
if (!process.exitCode) ok("canonical store counts pass for m_m101→m_m104");

const perLesson = {formulas:3,exercises:8,applications:2,simulations:2,professorQA:1,questions:6,reviewPacks:1};
for (const m of modules) for (let i=1;i<=8;i++) {
  const lid = `${m.id}_t${String(i).padStart(2,"0")}`;
  for (const [key,n] of Object.entries(perLesson)) {
    const c=stores[key].filter(r=>r.logicalModuleId===m.id&&r.logicalLessonId===lid).length;
    if(c!==n) fail(lid+" "+key+" expected "+n+", got "+c);
  }
}
if (!process.exitCode) ok("per-lesson distribution is complete");

for (const m of modules) {
  const rps=stores.reviewPacks.filter(r=>r.logicalModuleId===m.id);
  const rpIds=new Set(rps.map(r=>r.reviewPackId));
  for (const rp of rps) if (!Array.isArray(rp.items)||rp.items.length<5) fail(m.id+" review pack missing runtime items: "+rp.reviewPackId);
  for (const q of stores.questions.filter(r=>r.logicalModuleId===m.id)) if(!rpIds.has(q.reviewPackId)) fail("orphan reviewPackId "+q.questionId);
  for (let i=1;i<=8;i++) {
    const lid=`${m.id}_t${String(i).padStart(2,"0")}`;
    const sims=stores.simulations.filter(r=>r.logicalModuleId===m.id&&r.logicalLessonId===lid);
    const kinds=new Set(sims.map(x=>x.kind||x.simulationClass));
    if(!kinds.has("theory")||!kinds.has("application")) fail(lid+" requires theory + application simulations");
  }
}
if (!process.exitCode) ok("review links, runtime review items and simulation dual-class pass");

const e24=json("subjects/math/docs/E24_MM103_SIMILARITY_CLUSTERING_REPORT.json");
const e25=json("subjects/math/docs/E25_MM104_HK1_ASSESSMENT_REPORT.json");
if(e24.scope!=="HK1 · m_m103 Similarity & clustering") fail("E24 report scope changed");
if(e25.scope!=="HK1 · m_m104 Sát hạch học kỳ 1") fail("E25 report scope changed");
if(!String(e25.next||"").startsWith("E26")) fail("E25 must hand off to E26 cumulative readiness");

console.log("E26 HK1 cumulative readiness:", process.exitCode ? "FAIL" : "PASS");
