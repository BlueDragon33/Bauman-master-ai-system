import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/hub-data-truth.js','utf8');

assert.ok(index.includes('assets/js/hub-data-truth.js?v=1'),'Hub data truth adapter is not loaded');
assert.ok(index.indexOf('assets/js/hub-data-truth.js?v=1')>index.indexOf('assets/js/thesis-reference-v1.js?v=1'),'truth adapter must load after primary reference decorators');
for(const state of ['CURRENT','STALE','UNAVAILABLE','LOCAL_HUB']) assert.ok(js.includes(state),'missing truth state: '+state);
assert.ok(js.includes("Object.prototype.hasOwnProperty.call"),'truth adapter must distinguish missing keys from zero values');
assert.ok(js.includes("realZero:progress({x:0},'x').value===0"),'real zero invariant missing');
assert.ok(js.includes("missingIsUnavailable:progress({},'x').status===STATES.UNAVAILABLE"),'missing progress invariant missing');
assert.ok(js.includes("known.length===rows.length?STATES.CURRENT:STATES.STALE"),'partial aggregate must be STALE');
assert.ok(js.includes("function local(value"),'LOCAL_HUB helper missing');
assert.ok(js.includes("source='hub.state.progress'"),'progress provenance missing');
console.log('HUB_DATA_TRUTH_STATIC_PASS');
