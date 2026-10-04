import assert from 'node:assert/strict';
import fs from 'node:fs';

const graph=JSON.parse(fs.readFileSync('prompts/subjects/python/evidence/PYTHON_COMPETENCY_GRAPH.json','utf8'));
const ids=new Set(graph.competencies.map(x=>x.id));
const projection=JSON.parse(fs.readFileSync('subjects/programming/data/python-competencies.json','utf8'));
assert.deepEqual(new Set(projection.competencies.map(x=>x.id)),ids,'canonical competency projection drift');

const catalog=JSON.parse(fs.readFileSync('subjects/programming/data/python-task-catalog.json','utf8'));
for(const task of catalog.tasks)assert.ok(ids.has(task.competency),'task uses noncanonical competency '+task.id+' '+task.competency);

const manifest=JSON.parse(fs.readFileSync('subjects/programming/subject-manifest.json','utf8'));
assert.ok(manifest.dataFiles.some(x=>x.id==='python-competencies'&&x.required===true));

const worker=fs.readFileSync('cloudflare/runtime-worker-python.mjs','utf8');
assert.match(worker,/function resolveRunId\(body\)/);
assert.ok((worker.match(/resolveRunId\(body\)/g)||[]).length>=4,'run/test/submit must accept governed client runId');

const lab=fs.readFileSync('subjects/programming/assets/python-lab.js','utf8');
for(const token of ['actionToken','requestRunId="ui-"+crypto.randomUUID().toLowerCase()','Hết thời gian chạy (timeout).','invoke("cancel",{runId:id})'])assert.ok(lab.includes(token),'lab hardening missing '+token);
assert.match(lab,/if\(token!==actionToken\)return/,'late result quarantine missing');

const editor=fs.readFileSync('subjects/programming/editor.html','utf8');
assert.match(editor,/<select id="competency"/);
const author=fs.readFileSync('subjects/programming/assets/python-author.js','utf8');
assert.match(author,/python-competencies\.json/);
assert.match(author,/Competency không thuộc canonical PYTHON02/);

console.log('PYTHON_POST_P6_HARDENING_STATIC=PASS');
