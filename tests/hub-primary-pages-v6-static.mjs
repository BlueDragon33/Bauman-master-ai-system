import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const pages=fs.readFileSync('assets/js/hub-primary-pages-v6.js','utf8');
const css=fs.readFileSync('assets/css/hub-primary-pages-v6.css','utf8');
const nav=fs.readFileSync('assets/js/hub-learning-cluster.js','utf8');
const shell=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const safeUx=fs.readFileSync('assets/js/hub-safe-ux.js','utf8');
const search=fs.readFileSync('assets/js/hub-overview-search-v2.js','utf8');

assert.ok(index.includes('hub-ui-booting'),'Hub boot guard is missing');
assert.ok(index.includes('assets/css/hub-primary-pages-v6.css?v=1'),'V6 page stylesheet is not loaded');
assert.ok(index.includes('assets/js/hub-primary-pages-v6.js?v=1'),'V6 page renderer is not loaded');

for(const id of ['subjects','schedule','research']){
  assert.ok(pages.includes(`a.${id}=function()`),`V6 does not synchronously own the ${id} presentation pass`);
  assert.ok(pages.includes(`pageId==='${id}'`),`V6 finalizer is missing ${id}`);
}
assert.ok(pages.includes("document.body.classList.remove('hub-ui-booting')"),'V6 never releases the boot guard');
assert.ok(pages.includes("document.body.classList.add('hub-ui-routing')"),'V6 route paint guard is missing');
assert.ok(css.includes('body.hub-ui-booting #appRoot:not(.hidden){visibility:hidden}'),'Boot guard CSS is missing');
assert.ok(css.includes('#page-subjects'),'Subjects V6 styling missing');
assert.ok(css.includes('#page-schedule'),'Schedule V6 styling missing');
assert.ok(css.includes('#page-research'),'Research V6 styling missing');
assert.ok(css.includes('.page.active{min-width:0;animation:none!important;transform:none!important}'),'V6 must disable the legacy 4px route-entry transform');

assert.ok(!nav.includes('attempts<20'),'Primary navigation still performs delayed polling reflows');
assert.ok(!shell.includes('setTimeout(ensureAll,350)'),'Safe shell still performs delayed 350ms startup reflow');
assert.ok(!shell.includes('setTimeout(ensureAll,1200)'),'Safe shell still performs delayed 1200ms startup reflow');
assert.ok(!safeUx.includes('setTimeout(refresh,1400)'),'Safe UX still performs delayed startup reflow');
assert.ok(!search.includes('setTimeout(install,350)'),'Overview/search still performs delayed 350ms startup reflow');
assert.ok(!search.includes('setTimeout(install,1200)'),'Overview/search still performs delayed 1200ms startup reflow');
assert.ok(!search.includes('setTimeout(compactHome,0)'),'Home observer still defers layout mutation to a later paint');
assert.ok(!search.includes('setTimeout(compactSubjectCapability,0)'),'Subject capability observer still defers layout mutation to a later paint');

console.log('HUB_PRIMARY_PAGES_V6_STATIC_PASS');
