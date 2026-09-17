import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/hub-learning-cluster.js','utf8');
const css=fs.readFileSync('assets/css/hub-learning-cluster.css','utf8');

assert.ok(index.includes('assets/js/hub-learning-cluster.js?v=1'),'learning cluster runtime is not loaded');
assert.ok(index.includes('assets/css/hub-learning-cluster.css?v=1'),'learning cluster CSS is not loaded');
for(const id of ['study','simulation','exercise','test','review'])assert.ok(js.includes(`'${id}'`),`missing learning action ${id}`);
assert.ok(js.includes("'achievement','settings'"),'removed sidebar actions contract drift');
assert.ok(js.includes("label.textContent='Tiến độ'"),'progress rename contract drift');
assert.ok(js.includes('Tiếp tục nơi vừa mới học xong'),'learning cluster title drift');
assert.ok(css.includes('.hub-learning-cluster'),'learning cluster style missing');
console.log('HUB_LEARNING_CLUSTER_STATIC_PASS');
