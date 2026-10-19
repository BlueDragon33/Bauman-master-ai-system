import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// This is a deterministic contract gate, NOT a claim of on-device Chromium offline acceptance.
const root='subjects/russian/';
const sw=fs.readFileSync(root+'sw.js','utf8');
const optimizer=fs.readFileSync(root+'assets/runtime-optimizer.js','utf8');
const flow=fs.readFileSync(root+'assets/learning-flow.js','utf8');
const index=fs.readFileSync(root+'index.html','utf8');
const letters=JSON.parse(fs.readFileSync(root+'data/handwriting-listen-write.json','utf8'));
const lessons=JSON.parse(fs.readFileSync(root+'data/listen-write-lessons.json','utf8'));
const regex=/^const CACHE='([^']+)';/m;
const cache=sw.match(regex)?.[1];
assert.equal(cache,'russian-app-shell-v39-content-first-alphabet33',
  'New content must rotate SW cache, preventing stale cache-first JavaScript');
assert.ok(sw.includes("'./assets/learning-flow.js'"));
assert.ok(sw.includes("'./index.html'"));
assert.ok(index.includes('src="assets/learning-flow.js"'));
assert.ok(sw.includes("const DATA_CACHE='russian-learning-data-v1'"),
  'No destructive learner data cache migration');
assert.match(sw,/russian-app-shell-v\[0-9\]/);
assert.ok(sw.includes("k!==CACHE")&&sw.includes("caches.delete(k)"),
  'Old Russian shell keys must be eligible for cleanup, not learner data');
for(const dataset of ['handwriting-listen-write','listen-write-lessons']){
  assert.ok(optimizer.includes("'"+dataset+"'"),'Offline preparation missing required '+dataset);
  assert.ok(lessons.length>0 && letters.length===33);
}
assert.ok(!sw.includes('https://commons.wikimedia.org/'),
  'Reference pointers must never become accidental runtime/offline network dependencies');
assert.ok(!flow.includes("sampleAudioAuthority:'VERIFIED'"));
assert.ok(!flow.includes("masteryWrites:true"));
new vm.Script(sw,{filename:'sw.js'});
new vm.Script(flow,{filename:'learning-flow.js'});
console.log('RUSSIAN_CONTENT_FIRST_OFFLINE_CONTRACT_PASS',JSON.stringify({
  cacheVersion:cache,canonicalDataCachePreserved:true,offlineDataNames:2,
  shellHasLearningFlow:true,networkReferenceDependency:false,
  javascriptSyntaxPass:true,chromiumOffline:'NOT_TESTED_ON_V39'
}));
