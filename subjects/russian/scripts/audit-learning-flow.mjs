import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian/data');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name+'.json'),'utf8'));
const safe=name=>{try{return read(name)}catch(_){return null}};
const arr=v=>Array.isArray(v)?v:[];
const str=v=>String(v??'').trim();
const lessons=arr(read('lessons'));
const lessonIds=new Set(lessons.map(x=>str(x.id||x.lessonId)).filter(Boolean));
const lessonStage=new Map(lessons.map(x=>[str(x.id||x.lessonId),str(x.stage)]));
const linkKeys=['lessonId','lesson_id','routeId','chapterId','lesson','lesson_id_ref'];
const stageKeys=['stage','stageId','stage_id'];
function logical(data){
  if(Array.isArray(data))return data;
  if(!data||typeof data!=='object')return [];
  for(const key of ['questions','items','entries','modules','lessons','data','tasks','videos'])if(Array.isArray(data[key]))return data[key];
  return [];
}
function first(item,keys){for(const key of keys){const v=item?.[key];if(v!==undefined&&v!==null&&v!=='')return {key,value:v};}return null;}
function audit(name){
  const data=safe(name); const items=logical(data); let linked=0,valid=0,unknown=0,stageTagged=0;
  const keyUse={}, perLesson={};
  for(const item of items){
    const hit=first(item,linkKeys); const stage=first(item,stageKeys); if(stage)stageTagged++;
    if(!hit)continue; linked++;keyUse[hit.key]=(keyUse[hit.key]||0)+1;const id=str(hit.value);
    if(lessonIds.has(id)){valid++;perLesson[id]=(perLesson[id]||0)+1;}else unknown++;
  }
  return {dataset:name,total:items.length,linked,valid,unknown,stageTagged,keyUse,perLesson};
}
const datasets=['speaking','exercises','tests','simulations','grammar','grammar-path','videos','writing','vocab','knowledge-index'];
const rows=datasets.map(audit);
const lessonCoverage=lessons.map(lesson=>{
  const id=str(lesson.id||lesson.lessonId); const components={};
  for(const row of rows)components[row.dataset]=row.perLesson[id]||0;
  return {id,stage:str(lesson.stage),title:str(lesson.title||lesson.ruTitle),components};
});
const flowReady=lessonCoverage.map(x=>({
  id:x.id,stage:x.stage,
  speaking:x.components.speaking>0,
  exercises:x.components.exercises>0,
  tests:x.components.tests>0,
  grammar:x.components.grammar>0||x.components['grammar-path']>0,
  media:x.components.videos>0,
  writing:x.components.writing>0
}));
const readiness={
  speaking:flowReady.filter(x=>x.speaking).length,
  exercises:flowReady.filter(x=>x.exercises).length,
  tests:flowReady.filter(x=>x.tests).length,
  grammar:flowReady.filter(x=>x.grammar).length,
  media:flowReady.filter(x=>x.media).length,
  writing:flowReady.filter(x=>x.writing).length
};
const report={schema:'RUSSIAN_LEARNING_FLOW_AUDIT_V1',lessons:lessons.length,rows:rows.map(({perLesson,...x})=>x),readiness,lessonCoverage};
console.log('RUSSIAN_LEARNING_FLOW_AUDIT='+JSON.stringify(report));
console.log('RUSSIAN_LEARNING_FLOW_SUMMARY='+JSON.stringify({lessons:lessons.length,readiness,links:rows.map(x=>({dataset:x.dataset,total:x.total,linked:x.linked,valid:x.valid,unknown:x.unknown,stageTagged:x.stageTagged}))}));
if(!lessons.length)throw new Error('No Russian lessons');
const speaking=rows.find(x=>x.dataset==='speaking');
if(!speaking||speaking.valid!==speaking.total)throw new Error(`Speaking lesson links must be complete: ${speaking?.valid||0}/${speaking?.total||0}`);
for(const row of rows)if(row.unknown)throw new Error(`${row.dataset} has ${row.unknown} unknown lesson links`);
console.log('RUSSIAN_LEARNING_FLOW_AUDIT=PASS');
