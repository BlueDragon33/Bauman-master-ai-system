import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/hub-learning-cluster.js','utf8');
const css=fs.readFileSync('assets/css/hub-learning-cluster.css','utf8');
const shell=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');

assert.ok(index.includes('assets/js/hub-learning-cluster.js?v=1'),'reference navigation runtime is not loaded');
assert.ok(index.includes('assets/css/hub-learning-cluster.css?v=1'),'reference navigation CSS is not loaded');
for(const id of ['study','simulation','exercise','ai','exam','review','progress','achievement','community','settings']){
  assert.ok(js.includes(`'${id}'`),`missing reference sidebar action ${id}`);
}
for(const id of ['study','simulation','exercise','ai','review','progress']){
  assert.ok(shell.includes(`['${id}'`),`safe shell no longer creates sidebar source ${id}`);
}
assert.ok(js.includes("labelButton(actionButton(nav,'progress'),'Bản đồ năng lực')"),'progress label no longer matches reference UI');
assert.ok(js.includes("labelButton(actionButton(nav,'achievement'),'Thành tích')"),'achievement label no longer matches reference UI');
assert.ok(js.includes("nav.dataset.learningCluster='flat-v4'"),'reference flat navigation contract drift');
assert.ok(js.includes("schedule?.classList.add('hub-nav-reference-hidden')"),'Schedule should stay route-accessible but hidden from reference sidebar');
assert.ok(js.includes("research?.classList.add('hub-nav-reference-hidden')"),'Research should stay route-accessible but hidden from reference sidebar');
assert.ok(css.includes('.hub-nav-reference-hidden'),'reference hidden-route style missing');
assert.ok(!js.includes('cloneNode(true)'),'reference sidebar must not use display clones');
console.log('HUB_REFERENCE_NAV_STATIC_PASS');
