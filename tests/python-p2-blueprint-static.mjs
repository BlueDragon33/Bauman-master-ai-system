import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const root='prompts/subjects/python/evidence';

for(const name of [
 'PYTHON_CURRICULUM_BLUEPRINT.md',
 'PYTHON_COMPETENCY_GRAPH.json',
 'PYTHON_PREREQUISITE_GRAPH.json',
 'PYTHON_CANONICAL_ENTITY_MODEL.md',
 'PYTHON_VERSION_AUTHORITY_POLICY.md',
 'PYTHON_CONTENT_PROVENANCE_POLICY.md',
 'PYTHON_ADJACENT_SUBJECT_BOUNDARY.md',
 'PYTHON_LEGACY_LESSON_OWNERSHIP_MAP.json',
 'PYTHON03_INPUT_CONTRACT.md'
])assert.ok(fs.existsSync(`${root}/${name}`),`Missing PYTHON02 deliverable: ${name}`);

const lessons=json('subjects/programming/data/lessons.json');
const map=json(root+'/PYTHON_LEGACY_LESSON_OWNERSHIP_MAP.json');
assert.equal(map.lessons.length,48);
assert.deepEqual([...map.lessons.map(x=>x.lessonId)].sort(),[...lessons.map(x=>x.id)].sort(),'Every current Programming lesson must have one PYTHON02 ownership classification');
assert.equal(new Set(map.lessons.map(x=>x.lessonId)).size,48,'Duplicate lesson ownership IDs');
const allowed=new Set(map.allowedClassifications);
assert.ok(map.lessons.every(x=>allowed.has(x.classification)),'Unknown ownership classification');
assert.ok(map.lessons.every(x=>x.compatibility==='PRESERVE_LEGACY_ID'),'Legacy IDs must remain preserved in PYTHON02');

function assertDag(graph,label){
 const nodes=new Set(graph.nodes.map(x=>typeof x==='string'?x:x.id));
 assert.equal(nodes.size,graph.nodes.length,`${label}: duplicate node IDs`);
 const adj=new Map([...nodes].map(x=>[x,[]]));
 for(const [a,b] of graph.edges){
   assert.ok(nodes.has(a)&&nodes.has(b),`${label}: edge references unknown node ${a} -> ${b}`);
   adj.get(a).push(b);
 }
 const visiting=new Set(),done=new Set();
 function visit(n){
   if(done.has(n))return;
   assert.ok(!visiting.has(n),`${label}: cycle detected at ${n}`);
   visiting.add(n);
   for(const m of adj.get(n))visit(m);
   visiting.delete(n);done.add(n);
 }
 for(const n of nodes)visit(n);
}
assertDag(json(root+'/PYTHON_COMPETENCY_GRAPH.json'),'competency graph');
assertDag(json(root+'/PYTHON_PREREQUISITE_GRAPH.json'),'prerequisite graph');

const version=read(root+'/PYTHON_VERSION_AUTHORITY_POLICY.md');
assert.match(version,/does \*\*not\*\* select a Python minor version/i);
const blueprint=read(root+'/PYTHON_CURRICULUM_BLUEPRINT.md');
assert.match(blueprint,/No interpreter, browser eval, sandbox or package installer is introduced here/i);
assert.match(read(root+'/PYTHON03_INPUT_CONTRACT.md'),/Runtime execution\/sandbox implementation belongs to PYTHON04/i);

console.log('PYTHON_P2_BLUEPRINT_STATIC=PASS');
