import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base='prompts/subjects/python/evidence/';
const required=[
 'PYTHON_LEARNER_JOURNEY_MAP.md','PYTHON_CODE_LAB_UX_CONTRACT.md','PYTHON_AUTHORING_BLOCK_SCHEMA.md',
 'PYTHON_TASK_AUTHORING_CONTRACT.md','PYTHON_TEST_OF_TESTS_POLICY.md','PYTHON_RESPONSIVE_ACCESSIBILITY_MATRIX.md',
 'PYTHON_OFFLINE_UX_MATRIX.md','PYTHON_SUBJECT_MANIFEST_CONTRACT.md','PYTHON06_INPUT_CONTRACT.md'
];
for(const name of required) assert.ok(fs.existsSync(base+name),'Missing PYTHON05 output '+name);

const html=fs.readFileSync('subjects/programming/code-lab.html','utf8');
for(const token of ['python-product-integration.js','python-lab.js','Run tests','Submit','stdinInput','role="status"'])assert.ok(html.includes(token),'Code Lab missing '+token);
const author=fs.readFileSync('subjects/programming/editor.html','utf8');
for(const token of ['Task Authoring','Public tests','Hidden tests','Validate','Preview starter'])assert.ok(author.includes(token),'Authoring missing '+token);

const catalog=JSON.parse(fs.readFileSync('subjects/programming/data/python-task-catalog.json','utf8'));
assert.equal(catalog.runtimeProfileId,'cpython-3.14.8-stdlib-v1');
assert.ok(catalog.tasks.length>=3);
const publicText=JSON.stringify(catalog);
assert.ok(!publicText.includes('"hiddenTests"'),'Learner catalog must not contain hidden tests');
assert.ok(!publicText.includes('"expected"'),'Learner catalog must not contain grading expected values');

const manifest=JSON.parse(fs.readFileSync('subjects/programming/subject-manifest.json','utf8'));
assert.equal(manifest.paths.codeLab,'code-lab.html');
assert.equal(manifest.paths.authoring,'editor.html');
assert.equal(manifest.capabilities.pythonCodeLab,true);
assert.equal(manifest.capabilities.codingTaskAuthoring,true);
assert.equal(manifest.capabilities.hiddenTestServerBoundary,true);
assert.equal(manifest.pythonRuntime.offlineExecution,false);
assert.equal(manifest.pythonRuntime.runtimeProfileId,'cpython-3.14.8-stdlib-v1');

const source=fs.readFileSync('subjects/programming/assets/python-product-integration.js','utf8');
const sandbox={window:{location:{search:''}},globalThis:{},navigator:{onLine:true},URLSearchParams,URL,module:{exports:{}},console};
sandbox.window.window=sandbox.window;sandbox.window.navigator=sandbox.navigator;sandbox.window.URLSearchParams=URLSearchParams;sandbox.window.URL=URL;
vm.createContext(sandbox);vm.runInContext(source,sandbox);
const self=sandbox.window.BAUMAN_PYTHON_PRODUCT.selfCheck();
assert.equal(self.platformFork,false);
assert.equal(self.sharedDesignSystem,true);
assert.equal(self.providerSpecificCalls,false);
assert.equal(self.masteryAuthority,false);
assert.equal(self.runTestSubmitDistinct,true);
assert.equal(self.hiddenTestsInBrowser,false);
assert.equal(self.offlineHonest,true);
assert.equal(self.multiTabConflict,true);

const server=fs.readFileSync('cloudflare/python-task-registry.mjs','utf8');
assert.match(server,/hiddenTests/);
assert.ok(!html.includes('1000001')&&!fs.readFileSync('subjects/programming/assets/python-lab.js','utf8').includes('1000001'),'Hidden fixture leaked to learner UI');

console.log('PYTHON_P5_PRODUCT_CONTRACT=PASS');
