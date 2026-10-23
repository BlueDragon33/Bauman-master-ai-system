import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const contract=JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const dataJs=fs.readFileSync('assets/js/data.js','utf8');
const mainJs=fs.readFileSync('assets/js/main.js','utf8');
const planningJs=fs.readFileSync('assets/js/planning-main.js','utf8');
const configWindow={};
vm.runInNewContext(dataJs,{window:configWindow});
vm.runInNewContext(fs.readFileSync('assets/js/platform/hub-subject-config.js','utf8'),{window:configWindow,structuredClone});
vm.runInNewContext(fs.readFileSync('assets/js/platform/hub-subject-launch.js','utf8'),{window:configWindow,URL,location:{href:'https://hub.example/',origin:'https://hub.example'}});
for(const presentation of [mainJs,planningJs]){
  assert.doesNotMatch(presentation,/\.mainPath|\.editorPath|\b(?:pathMap|editorMap)\b/,'Hub presentation must not own raw launch/editor configuration');
  assert.ok(presentation.includes('BAUMAN_HUB_SUBJECT_LAUNCH.launchInHub'),'Hub/planning must delegate in-page launch to the shared adapter');
  assert.ok(presentation.includes('BAUMAN_HUB_SUBJECT_LAUNCH.launchInTab'),'Hub/planning must delegate tab launch to the shared adapter');
}

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
  assert.equal(configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration(sub.id)?.entry,runtime+'/index.html',sub.id+': runtime missing from canonical Hub Subject Config');
  const descriptor=configWindow.BAUMAN_HUB_SUBJECT_LAUNCH.getDescriptor(sub.id);
  assert.equal(descriptor?.subjectId,sub.id,sub.id+': adapter must resolve the same-subject descriptor');
  assert.equal(descriptor?.source,'HUB_APPLICATION_CONFIG',sub.id+': descriptor must have the canonical Hub config owner');
  assert.equal(descriptor?.authoring,null,sub.id+': editor configuration must not imply learner authoring');

  if(manifest.editor){
    const editorPath=String(manifest.editor).includes('/')
      ? String(manifest.editor).replace(/^[/]+/, '')
      : path.join(runtime,String(manifest.editor)).replaceAll('\\\\','/');
    assert.ok(fs.existsSync(editorPath),sub.id+': declared editor missing at '+editorPath);
    assert.equal(configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration(sub.id)?.editor,editorPath.replaceAll('\\','/'),sub.id+': editor missing from canonical Hub Subject Config');
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
