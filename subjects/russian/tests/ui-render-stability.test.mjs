// Russian UI stability contracts — dependency-free regression checks.
// Run: node --test subjects/russian/tests/ui-render-stability.test.mjs
// These static guardrails do not replace real-browser UX acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source=(path)=>readFileSync(fileURLToPath(new URL('../'+path,import.meta.url)),'utf8');
const core=source('assets/core.js');
const future=source('assets/russian-future-ui.js');
const learningState=source('assets/learning-state.js');
const learningFlow=source('assets/learning-flow.js');
const vocab=source('assets/vocab-srs.js');
const shell=source('sw.js');

for(const [name,js] of Object.entries({core,future,learningState,learningFlow,vocab,shell})){
  test(name+' parses as JavaScript',()=>{
    assert.doesNotThrow(()=>new vm.Script(js,{filename:name+'.js'}));
  });
}
test('one canonical core-render signal drives UI projections',()=>{
  assert.match(core,/dispatchEvent\(new CustomEvent\('russian:core-render'/);
  assert.match(future,/addEventListener\('russian:core-render',schedule\)/);
  assert.match(learningState,/addEventListener\('russian:core-render',scheduleRenderToday\)/);
  assert.match(learningFlow,/addEventListener\('russian:core-render',scheduleRender\)/);
});
test('projections must not watch their own DOM mutations',()=>{
  for(const [name,js] of Object.entries({future,learningState,learningFlow})){
    assert.doesNotMatch(js,/new\s+MutationObserver\s*\(/,name+' has a feedback-loop risk');
  }
});
test('core navigation is updated in place and not replaced on every action',()=>{
  assert.match(core,/const sameNav=existing\.length===PRIMARY_NAV\.length/);
  assert.match(core,/if\(!sameNav\)\{/);
  assert.match(core,/existing\.forEach\(\(b,i\)=>/);
});
test('same-view scroll and input focus survive rerender',()=>{
  assert.match(core,/lastRenderedContext/);
  assert.match(core,/target\.focus\(\{preventScroll:true\}\)/);
  assert.match(core,/positions\.inner\.forEach/);
  assert.match(core,/target\.setSelectionRange/);
});
test('progress panel is recreated when the core replaces its view',()=>{
  assert.match(learningFlow,/const isNew=!panel/);
  assert.match(learningFlow,/if\(isNew\|\|sig!==lastSig\)/);
});
test('overview projection is not replaced for an unchanged data snapshot',()=>{
  assert.match(future,/if\(dash\.__rfRenderedHtml===html\)return/);
});
test('video player uses a stable selected source, not fake playable assets',()=>{
  assert.match(core,/const player=embed\?/);
  assert.match(core,/media-start-listening/);
  assert.match(core,/Nguồn này không có trình phát trong ứng dụng/);
});
test('vocab SRS keeps semantic actions and avoids unrelated whole-page mutation watches',()=>{
  assert.match(vocab,/document\.addEventListener\('click',event=>/);
  assert.match(vocab,/data-ru-srs-rate/);
});
test('offline application shell version invalidates old cached scripts',()=>{
  assert.match(shell,/const CACHE='russian-app-shell-v29-ui-render-stability'/);
});
