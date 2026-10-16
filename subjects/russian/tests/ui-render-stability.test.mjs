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
const academic=source('assets/academic-language.js');
const vocab=source('assets/vocab-srs.js');
const speech=source('assets/speech-interaction-engine.js');
const shell=source('sw.js');

for(const [name,js] of Object.entries({core,future,learningState,learningFlow,academic,vocab,speech,shell})){
  test(name+' parses as JavaScript',()=>{
    assert.doesNotThrow(()=>new vm.Script(js,{filename:name+'.js'}));
  });
}
test('one canonical core-render signal drives UI projections',()=>{
  assert.match(core,/dispatchEvent\(new CustomEvent\('russian:core-render'/);
  assert.match(future,/addEventListener\('russian:core-render',upgrade\)/);
  assert.match(learningState,/addEventListener\('russian:core-render',renderToday\)/);
  assert.match(learningFlow,/addEventListener\('russian:core-render',event=>/);
  assert.match(academic,/addEventListener\('russian:core-render',schedule\)/);
});
test('projections must not watch their own DOM mutations',()=>{
  for(const [name,js] of Object.entries({future,learningState,learningFlow,academic})){
    assert.doesNotMatch(js,/new\s+MutationObserver\s*\(/,name+' has a feedback-loop risk');
  }
});
test('learning flow consumes the canonical index without an abortable network request',()=>{
  assert.match(core,/knowledgeIndex:DB\['knowledge-index'\]/);
  assert.doesNotMatch(learningFlow,/fetch\('data\/knowledge-index\.json'/);
});
test('core navigation is updated in place and not replaced on every action',()=>{
  assert.match(core,/const sameNav=existing\.length===PRIMARY_NAV\.length/);
  assert.match(core,/if\(!sameNav\)\{/);
  assert.match(core,/existing\.forEach\(\(b,i\)=>/);
});
test('academic and lesson panels do not replace identical content',()=>{
  assert.match(academic,/if\(panel\.innerHTML!==markup\)panel\.innerHTML=markup/);
  assert.match(learningFlow,/if\(panel\.innerHTML!==html\)panel\.innerHTML=html/);
  assert.doesNotMatch(academic,/return;\}setTimeout\(schedule,0\);\},true\)/);
});
test('same-view scroll and input focus survive rerender',()=>{
  assert.match(core,/lastRenderedContext/);
  assert.match(core,/target\.focus\(\{preventScroll:true\}\)/);
  assert.match(core,/positions\.inner\.forEach/);
  assert.match(core,/target\.setSelectionRange/);
});
test('rerender does not schedule focus theft from an active input',()=>{
  assert.doesNotMatch(core,/if\(state\.view==='learning'\)\s*setTimeout\(\(\)=>.*?\.focus\(/);
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
test('media filtering retains current embedded player and updates only the playlist',()=>{
  assert.match(core,/function patchMediaList\(\)/);
  assert.match(core,/current\.replaceChildren\(\.\.\.next\.childNodes\)/);
  assert.match(core,/\['mediaQuery','mediaCat'\]\.includes\(k\)&&patchMediaList\(\)/);
});
test('vocab SRS keeps semantic actions and avoids unrelated whole-page mutation watches',()=>{
  assert.match(vocab,/document\.addEventListener\('click',event=>/);
  assert.match(vocab,/data-ru-srs-rate/);
});
test('vocabulary review and speaking links use bounded in-app routing',()=>{
  assert.match(core,/function handleCoreNavigationRequest\(event\)/);
  assert.match(core,/addEventListener\('russian:core-navigation-request',handleCoreNavigationRequest\)/);
  assert.match(vocab,/new CustomEvent\('russian:core-navigation-request'/);
  assert.doesNotMatch(vocab,/location\.reload\(/);
});
test('offline application shell version invalidates old cached scripts',()=>{
  const shellVersion=Number(shell.match(/const CACHE='russian-app-shell-v([0-9]+)-engine-/)?.[1]||0);
  assert.ok(shellVersion>=33,'Russian listening playback requires refreshed v33+ offline shell');
  assert.match(speech,/if\(permissionPending\|\|recorder\)cancelRecording\(\)/);
  assert.match(speech,/stopTracks\(grantedStream\)/);
});
