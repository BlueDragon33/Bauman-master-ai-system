import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{},URL,Date};
vm.createContext(context);
const source=fs.existsSync('assets/js/hub-subject-adapter.js')?fs.readFileSync('assets/js/hub-subject-adapter.js','utf8'):'';
vm.runInContext(source,context);
const a=context.window.BAUMAN_HUB_SUBJECTS;
assert.ok(a,'one Hub subject adapter must exist');
for(const value of [null,undefined,'',false,true,[],{},NaN,Infinity]){
  assert.equal(a.progress({x:value},'x').status,'UNAVAILABLE',`invalid ${String(value)} must not become zero`);
}
assert.equal(a.progress({x:0},'x').value,0);
assert.equal(a.progress({x:'0'},'x').value,0,'legacy serialized numbers remain compatible');
const partial=a.averageProgress({a:0},['a','b']);
assert.equal(partial.status,'STALE');assert.equal(partial.value,0);
assert.equal(partial.knownCount,1);assert.equal(partial.totalCount,2);
const state={subjects:{x:{id:'x',name:'X',mainPath:'subjects/x/index.html',editorPath:'subjects/x/editor.html'}},progress:{x:0}};
assert.equal(a.read(state,'x').progressSummary.value,0);
assert.equal(a.resolveLaunch(state,'x').status,'CURRENT','existing learner launch remains supported behind adapter');
assert.equal(a.resolveLaunch(state,'x','authoring').status,'UNAVAILABLE','legacy editorPath is not an authoring capability');
assert.equal(a.resolveLaunch(state,'unknown').status,'UNAVAILABLE');
for(const path of ['javascript:alert(1)','https://evil.example/app','//evil.example/app','subjects/../admin.html']){
  state.subjects.x.mainPath=path;assert.equal(a.resolveLaunch(state,'x').status,'UNAVAILABLE',path);
}
state.subjects.x.mainPath='subjects/x/index.html';
state.subjectContracts={x:{status:'registered',contractVersion:'1',readCapabilities:[{capability:'progressSummary',ttlSeconds:60}],sendCapabilities:[]}};
state.subjectSummaries={x:{progressSummary:{value:37,asOf:'2020-01-01T00:00:00Z',source:'public:x'}}};
const stale=a.read(state,'x').progressSummary;
assert.equal(stale.status,'STALE');assert.equal(stale.value,37);assert.equal(stale.source,'public:x');
assert.equal(stale.asOf,'2020-01-01T00:00:00Z');
state.subjectSummaries.x.progressSummary.status='UNAVAILABLE';
assert.equal(a.read(state,'x').progressSummary.status,'UNAVAILABLE','explicit unavailable export must not leak a numeric cached value');
state.subjectContracts.x.status='disabled';
assert.equal(a.read(state,'x').progressSummary.status,'UNAVAILABLE','disabled contract fails closed');
assert.equal(a.resolveLaunch(state,'x').status,'UNAVAILABLE','disabled contract may not fall through to legacy path');
state.subjectContracts.x.status='registered';state.subjectContracts.x.readCapabilities=[];
assert.equal(a.read(state,'x').progressSummary.status,'UNAVAILABLE','registered contract without progress capability must not fall back to legacy data');
state.subjectContracts.x.readCapabilities=[{capability:'progressSummary',ttlSeconds:60}];
state.subjectSummaries.x.progressSummary={status:'BROKEN',value:75,asOf:new Date().toISOString(),source:'public:x'};
assert.equal(a.read(state,'x').progressSummary.status,'UNAVAILABLE','invalid status must fail closed');
const subjects=fs.readFileSync('assets/js/subjects-reference-v1.js','utf8');
assert.ok(!subjects.includes('openSubjectEditor'),'Subjects learner presentation must not call private authoring');
assert.ok(!subjects.includes('Dữ liệu môn'),'Subjects learner menu must not expose private editor');
console.log('HUB_SUBJECT_ADAPTER_UNIT_PASS');
