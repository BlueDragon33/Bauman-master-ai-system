import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const contract=JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const dataJs=fs.readFileSync('assets/js/data.js','utf8');
const mainJs=fs.readFileSync('assets/js/main.js','utf8');

const mapped=[];
for(const sub of contract.subclients??[]){
  const manifestPath=path.join('subjects',sub.id,'subject-manifest.json');
  if(!fs.existsSync(manifestPath)) continue;
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const sp=manifest.studyPlan;
  if(!sp||sp.version!==1||sp.relation!=='related'||!Array.isArray(sp.courseIds)||!sp.courseIds.length) continue;

  const runtime=(sp.runtimePath||('subjects/'+sub.id+'/')).replace(/^\/+|\/+$/g,'');
  assert.ok(fs.existsSync(path.join(runtime,'index.html')),sub.id+': runtime index missing');
  assert.ok(dataJs.includes("id:'"+sub.id+"'"),sub.id+': missing from BAUMAN_DATA.subjects');
  assert.ok(mainJs.includes("'"+sub.id+"':'"+runtime+"/index.html'")||mainJs.includes(sub.id+":'"+runtime+"/index.html'"),sub.id+': missing from main pathMap');

  if(manifest.editor){
    const editorPath=String(manifest.editor).includes('/')
      ? String(manifest.editor).replace(/^[/]+/, '')
      : path.join(runtime,String(manifest.editor)).replaceAll('\\\\','/');
    assert.ok(fs.existsSync(editorPath),sub.id+': declared editor missing at '+editorPath);
    assert.ok(mainJs.includes("'"+sub.id+"':'"+editorPath+"'")||mainJs.includes(sub.id+":'"+editorPath+"'"),sub.id+': editor missing from main editorMap');
  }

  if(Array.isArray(manifest.data)&&manifest.data.length){
    assert.ok(fs.existsSync(path.join(runtime,'subject-manifest.js')),sub.id+': subject runtime config missing');
    for(const file of manifest.data){
      assert.ok(fs.existsSync(path.join(runtime,'data',file)),sub.id+': data/'+file+' missing');
    }
  }

  mapped.push({id:sub.id,courseIds:sp.courseIds,runtime,kind:manifest.kind||'subject'});
}

assert.ok(mapped.length>=13,'Expected all manifest-driven study-plan surfaces');
assert.ok(mapped.some(x=>x.id==='foreign-language'),'Foreign Language module not integrated');
assert.ok(mapped.some(x=>x.id==='security-elective'),'Security elective not integrated');
assert.ok(mapped.some(x=>x.id==='specialization-elective'),'Elective 2 not integrated');
assert.ok(mapped.some(x=>x.id==='practice-workflow'&&x.kind==='workflow'),'Practice workflow not integrated as workflow');

console.log(JSON.stringify({
  gate:'STUDY_PLAN_RUNTIME_INTEGRATION',
  status:'PASS',
  surfaces:mapped.length,
  courseMappings:mapped.reduce((n,x)=>n+x.courseIds.length,0),
  ids:mapped.map(x=>x.id)
},null,2));
