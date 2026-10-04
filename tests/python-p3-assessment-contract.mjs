import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const root='prompts/subjects/python/evidence';

for(const name of [
 'PYTHON_CODE_REASONING_CONTRACT.md',
 'PYTHON_DEBUGGING_ERROR_TAXONOMY.json',
 'PYTHON_CODING_ASSESSMENT_CONTRACT.md',
 'PYTHON_TEST_QUALITY_POLICY.md',
 'PYTHON_PARTIAL_CREDIT_RUBRIC.md',
 'PYTHON_ERROR_NOTEBOOK_MAPPING.md',
 'PYTHON_TRANSFER_TASK_POLICY.md',
 'PYTHON04_INPUT_CONTRACT.md',
 'PYTHON_P3_GOLDEN_FIXTURES.json'
])assert.ok(fs.existsSync(`${root}/${name}`),`Missing PYTHON03 deliverable: ${name}`);

const graph=json(root+'/PYTHON_COMPETENCY_GRAPH.json');
const compIds=new Set((graph.competencies||graph.nodes||[]).map(x=>x.id));
assert.ok(compIds.size>=16,'PYTHON02 competency graph must remain available');

const tax=json(root+'/PYTHON_DEBUGGING_ERROR_TAXONOMY.json');
const required=[
 'py.err.syntax-indentation','py.err.name-scope','py.err.type','py.err.value','py.err.index-key',
 'py.err.attribute','py.err.import-environment','py.err.file-encoding','py.err.control-flow',
 'py.err.off-by-one','py.err.mutation-aliasing','py.err.none-truthiness','py.err.iterator-state',
 'py.err.float-numeric','py.err.logic-requirement','py.err.state-side-effect','py.err.test-fixture','py.err.notebook-state'
];
const taxIds=new Set(tax.categories.map(x=>x.id));
for(const id of required)assert.ok(taxIds.has(id),`Missing required Python error category: ${id}`);
for(const item of tax.categories)for(const id of item.competencies||[])assert.ok(compIds.has(id),`Taxonomy references unknown competency ${id}`);

const fixtures=json(root+'/PYTHON_P3_GOLDEN_FIXTURES.json');
const requiredFixtures=[
 'py.fx.mutable-default','py.fx.is-vs-eq','py.fx.shallow-copy','py.fx.off-by-one',
 'py.fx.iterator-exhaustion','py.fx.exception-misuse','py.fx.float-compare',
 'py.fx.stale-notebook','py.fx.hardcoded-sample','py.fx.alternate-valid'
];
const fixtureIds=new Set(fixtures.fixtures.map(x=>x.id));
for(const id of requiredFixtures)assert.ok(fixtureIds.has(id),`Missing golden fixture: ${id}`);

const assessment=read(root+'/PYTHON_CODING_ASSESSMENT_CONTRACT.md');
assert.match(assessment,/Source-code string equality is forbidden as the primary grader/i);
assert.match(assessment,/first official attempt is immutable/i);
assert.match(assessment,/Hidden tests probe documented edge cases\/generalization/i);
assert.match(assessment,/Interpreter\/sandbox\/test-runner providers belong to PYTHON04/i);

const rubric=read(root+'/PYTHON_PARTIAL_CREDIT_RUBRIC.md');
assert.match(rubric,/Ordinal evidence bands/i);
assert.doesNotMatch(rubric,/universal weighted percentage/i);

const p4=read(root+'/PYTHON04_INPUT_CONTRACT.md');
assert.match(p4,/Execution is untrusted/i);
assert.match(p4,/must not create a second mastery engine/i);

const runtime=[
 read('subjects/programming/assets/core.js'),
 read('subjects/programming/assets/subject-adapter.js'),
 read('subjects/programming/index.html')
].join('\n');
assert.doesNotMatch(runtime,/\beval\s*\(/i,'PYTHON03 must not introduce browser eval');
assert.doesNotMatch(runtime,/pyodide|skulpt|brython/i,'PYTHON03 must not activate an interpreter provider');

console.log('PYTHON_P3_ASSESSMENT_CONTRACT=PASS');
