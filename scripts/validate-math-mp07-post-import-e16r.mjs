#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root=process.cwd(), read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const map=read("subjects/math/data/mp07-source-map-e16r.json");
const theory=read("subjects/math/data/theory_lecture_content.json");
const stores={
 formulas:read("subjects/math/data/formula_content.json"),
 exercises:read("subjects/math/data/exercise_content.json"),
 applications:read("subjects/math/data/application_content.json"),
 simulations:read("subjects/math/data/simulation_content.json"),
 professorQa:read("subjects/math/data/professor_qa_content.json"),
 questions:read("subjects/math/data/question_bank_content.json"),
 reviewPacks:read("subjects/math/data/review_pack_content.json")
};
let bad=false; const fail=m=>{bad=true;console.error("E16R-D FAIL:",m)}, ok=m=>console.log("E16R-D OK:",m);
const nodes=new Map((map.logicalLessons||[]).map(x=>[x.logicalId,x]));
if(nodes.size!==8)fail("expected 8 logical lessons");
for(const [id,n] of nodes){
 for(const p of n.prerequisiteLogicalIds||[])if(!nodes.has(p))fail(id+" missing prerequisite node "+p);
}
const visiting=new Set(),done=new Set();
function dfs(id){if(done.has(id))return;if(visiting.has(id)){fail("cycle at "+id);return;}visiting.add(id);for(const p of nodes.get(id)?.prerequisiteLogicalIds||[])dfs(p);visiting.delete(id);done.add(id);}
for(const id of nodes.keys())dfs(id);
if(!bad)ok("8-node prerequisite graph is acyclic and resolved");

const theoryIds=new Set((theory.records||[]).map(x=>x.lessonId));
for(const n of nodes.values()){
 const ids=n.resolution?.lessonIds||[n.resolution?.targetLessonId].filter(Boolean);
 for(const id of ids)if(!theoryIds.has(id))fail(n.logicalId+" theory target missing "+id);
}
if(!bad)ok("logical lesson theory targets resolve after import");

const expected={formulas:3,exercises:8,applications:2,simulations:2,professorQa:1,questions:6,reviewPacks:1};
for(const [kind,count] of Object.entries(expected)){
 for(const id of nodes.keys()){
  const c=(stores[kind].records||[]).filter(r=>r.logicalLessonId===id).length;
  if(c!==count)fail(kind+" "+id+" expected "+count+" got "+c);
 }
}
if(!bad)ok("all sidecar distributions resolve per logical lesson");
console.log("E16R-D gate:",bad?"FAIL":"PASS");
if(bad)process.exitCode=1;
