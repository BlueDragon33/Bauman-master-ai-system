#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fail=(m)=>{ console.error("E16R STAGED FAIL:",m); process.exitCode=1; };
const ok=(m)=>console.log("E16R STAGED OK:",m);

const map=read("subjects/math/data/mp07-source-map-e16r.json");
const cores=read("subjects/math/content_bundles/theory/e16r_mp07_missing_cores_bundle.json");
const pca=read("subjects/math/content_bundles/theory/e16r_mp07_pca_anchor_upgrade_bundle.json");
const store=read("subjects/math/data/theory_lecture_content.json");

if((cores.records||[]).length!==4) fail("missing-core bundle must contain exactly 4 records");
else ok("missing-core bundle has 4 records");

for(const r of cores.records||[]){
  if((r.slides||[]).length<8) fail(r.lessonId+" has fewer than 8 slides");
  const roles=new Set((r.slides||[]).map(s=>s.role));
  for(const required of ["section_open","definition","notation_formula","worked_example","warning_counterexample","application_link","summary"]){
    if(!roles.has(required)) fail(r.lessonId+" missing role "+required);
  }
  if(!r.sourceAnchors?.logicalLessonId) fail(r.lessonId+" missing logicalLessonId provenance");
}
if(!process.exitCode) ok("four staged cores satisfy minimum theory blueprint/provenance");

if((pca.records||[]).length!==1) fail("PCA upgrade bundle must contain one replacement record");
else {
  const r=pca.records[0];
  const base=(store.records||[]).find(x=>x.lessonId===r.lessonId);
  if(!base) fail("PCA replacement target not found in modern store");
  else {
    if((r.slides||[]).length!==(base.slides||[]).length+6) fail("PCA upgrade must preserve base and append exactly 6 depth slides");
    const roles=new Set((r.slides||[]).map(s=>s.role));
    for(const role of ["covariance_eigen_structure","principal_axis_ordering","explained_variance","projection_reconstruction","reconstruction_error","pca_decision_gate"]){
      if(!roles.has(role)) fail("PCA upgrade missing "+role);
    }
  }
}
if(!process.exitCode) ok("PCA staged replacement preserves base and adds six required depth roles");

const statuses=new Map((map.logicalLessons||[]).map(x=>[x.logicalId,x.coverage]));
const expected={
  m_p07_t01:"COVERED_BY_MODERN_ANCHOR",
  m_p07_t02:"STAGED_FOR_ACADEMIC_AUDIT",
  m_p07_t03:"STAGED_FOR_ACADEMIC_AUDIT",
  m_p07_t04:"STAGED_FOR_ACADEMIC_AUDIT",
  m_p07_t05:"STAGED_FOR_ACADEMIC_AUDIT",
  m_p07_t06:"STAGED_UPGRADE_CANDIDATE",
  m_p07_t07:"STAGED_UPGRADE_CANDIDATE",
  m_p07_t08:"STAGED_UPGRADE_CANDIDATE"
};
for(const [id,status] of Object.entries(expected)) if(statuses.get(id)!==status) fail(id+" unexpected coverage status");
if(!process.exitCode) ok("all 8 logical lessons have explicit recovery status");

console.log("E16R staged gate:", process.exitCode ? "FAIL" : "PASS");
