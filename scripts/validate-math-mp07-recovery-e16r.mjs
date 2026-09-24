#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fail = (m) => { console.error("E16R FAIL:",m); process.exitCode=1; };
const ok = (m) => console.log("E16R OK:",m);

const roadmap = readJson("subjects/math/data/academic-roadmap.json");
const framework = readJson("subjects/math/data/theory-framework.json");
const spine = readJson("subjects/math/data/chapter_spine.json");
const theory = readJson("subjects/math/data/theory_lecture_content.json");
const legacy = readJson("subjects/math/data/lessons.json");
const map = readJson("subjects/math/data/mp07-source-map-e16r.json");

const spineIds = new Set(spine.map(x=>x.chapterId||x.id));
const theoryIds = new Set((theory.records||[]).map(x=>x.lessonId));
const legacyIds = new Set(legacy.map(x=>x.lessonId||x.id));

const roadmapHas = JSON.stringify(roadmap).includes('"m_p07"');
if(!roadmapHas) fail("academic-roadmap lost m_p07"); else ok("academic-roadmap contains m_p07");

let moduleNode=null;
const walk=(v)=>{
  if(!v||typeof v!=="object"||moduleNode) return;
  if(v.id==="m_p07") { moduleNode=v; return; }
  for(const x of Object.values(v)) walk(x);
};
walk(framework);
if(!moduleNode) fail("theory-framework missing m_p07");
else {
  if((moduleNode.subLessons||[]).length!==8) fail("m_p07 must keep exactly 8 logical sub-lessons");
  else ok("m_p07 has 8 logical sub-lessons");
}

if(spineIds.has("MATH-VN-LA-C07")) fail("forbidden physical chapter MATH-VN-LA-C07 exists");
else ok("no invalid physical MATH-VN-LA-C07 chapter");

if((map.logicalLessons||[]).length!==8) fail("source map must contain 8 logical lessons");
const logicalIds=new Set();
for(const item of map.logicalLessons||[]){
  if(logicalIds.has(item.logicalId)) fail("duplicate logicalId "+item.logicalId);
  logicalIds.add(item.logicalId);
  for(const id of item.physicalChapterIds||[]) if(!spineIds.has(id)) fail(item.logicalId+" references missing physical chapter "+id);
  for(const id of item.currentTheoryAnchors||[]) if(!theoryIds.has(id)) fail(item.logicalId+" references missing modern theory anchor "+id);
  for(const id of item.legacyAnchors||[]) if(!legacyIds.has(id)) fail(item.logicalId+" references missing legacy anchor "+id);
}
if(!process.exitCode) ok("source-map provenance anchors resolve");

const authoringRequired=(map.logicalLessons||[]).filter(x=>x.coverage==="AUTHORING_REQUIRED").map(x=>x.logicalId);
console.log("E16R RECOVERY STATUS:", JSON.stringify({
  moduleId:"m_p07",
  logicalLessons:(map.logicalLessons||[]).length,
  authoringRequired,
  gate:authoringRequired.length ? "RECOVERY_READY_NOT_CONTENT_COMPLETE" : "READY_FOR_CONTENT_INTEGRITY_GATE"
},null,2));
