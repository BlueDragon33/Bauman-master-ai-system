import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/hub-learning-cluster.js','utf8');
const css=fs.readFileSync('assets/css/hub-learning-cluster.css','utf8');
const shell=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const safeUx=fs.readFileSync('assets/js/hub-safe-ux.js','utf8');
const roadmap=fs.readFileSync('assets/js/hub-roadmap-comprehensive-v2.js','utf8');

assert.ok(index.includes('assets/js/hub-learning-cluster.js?v=5'),'compact primary navigation runtime is not loaded');
assert.ok(index.includes('assets/css/hub-learning-cluster.css?v=5'),'compact primary navigation CSS is not loaded');

for(const id of ['home','roadmap','subjects','schedule','research']){
  assert.ok(js.includes(`['${id}'`),`missing primary page ${id}`);
}
for(const id of ['study','simulation','exercise','ai','exam','review','progress','achievement','community','settings']){
  assert.ok(!js.includes(`['action','${id}']`),`secondary action ${id} must not be a top-level ordered tab`);
}
assert.ok(js.includes("button.classList.add('hub-nav-reference-hidden','hub-nav-secondary-action')"),'secondary shortcuts are not hidden from primary navigation');
assert.ok(js.includes("nav.dataset.learningCluster='primary-v5'"),'primary navigation contract drift');
assert.ok(!js.includes("schedule?.classList.add('hub-nav-reference-hidden')"),'Schedule must remain a visible primary page');
assert.ok(!js.includes("research?.classList.add('hub-nav-reference-hidden')"),'Research must remain a visible primary page');
assert.ok(shell.includes("hub-safe-nav-action hub-nav-reference-hidden hub-nav-secondary-action"),'safe-shell shortcuts must start hidden');
assert.ok(safeUx.includes("hub-safe-nav-action hub-nav-reference-hidden hub-nav-secondary-action"),'safe-ux shortcuts must start hidden');
assert.ok(css.includes('#nav>.hub-nav-secondary-action{display:none!important}'),'secondary-action anti-flicker rule missing');
assert.ok(roadmap.includes("q('#hubRoadmapTopNav')?.remove()"),'Roadmap must remove the duplicate top navigation');
assert.ok(!roadmap.includes("nav.id='hubRoadmapTopNav'"),'Roadmap must not recreate a second navigation row');
assert.ok(!js.includes('cloneNode(true)'),'primary sidebar must not use display clones');

console.log('HUB_PRIMARY_NAV_V5_STATIC_PASS');
