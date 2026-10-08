import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spatialCandidateLocation} from '../integration/spatial-candidate-experience.js';
import {validateSpatialCandidate,evaluateSpatialCandidateAction} from '../world/spatial-candidate-runtime.mjs';
const pack=JSON.parse(fs.readFileSync(new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url),'utf8'));
assert.equal(spatialCandidateLocation('https://example.test/').enabled,false);
assert.equal(spatialCandidateLocation('https://example.test/?ruWorld=spatial-r2-candidate').enabled,false);
assert.equal(spatialCandidateLocation('https://example.test/?ruEngine=grounded-v1').enabled,false);
assert.equal(spatialCandidateLocation('https://example.test/?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate').enabled,true);
assert.equal(spatialCandidateLocation('https://example.test/?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate&ruSetting=dorm').setting,'dorm');
const valid=validateSpatialCandidate(pack);
assert.equal(valid.ok,true,valid.errors.join('; '));
const spatial=pack.scenes.find(x=>x.sceneId==='rl-11-dorm');
assert.equal(evaluateSpatialCandidateAction({scene:spatial,kind:'point-to-location',targetId:'door'}).success,false);
assert.equal(evaluateSpatialCandidateAction({scene:spatial,kind:'point-to-location',targetId:'room-12'}).success,true);
const source=fs.readFileSync(new URL('../integration/grounded-experience.js',import.meta.url),'utf8');
const serviceWorker=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
assert.ok(source.includes("flag.searchParams.get('ruWorld')==='spatial-r2-candidate'"));
for(const path of ['spatial-candidate-experience.js','spatial-candidate-runtime.mjs','real-life-spatial.r2-ai-proposal.json']){
  assert.ok(serviceWorker.includes(path),'missing offline resource '+path);
}
const renderer=fs.readFileSync(new URL('../integration/spatial-candidate-experience.js',import.meta.url),'utf8');
assert.equal(renderer.includes('submitObservation'),false,'AI draft preview must not send competency evidence');
assert.equal(renderer.includes('recordEvidence'),false,'AI draft preview must not record RU04 evidence');
assert.ok(renderer.includes('data-re-spatial-script hidden'),'Cyrillic script should not be compulsory at zero Russian');
assert.ok(renderer.includes('Gợi ý (VI)'),'Vietnamese support required');
console.log(JSON.stringify({ok:true,spatialPreviewExplicitDoubleOptIn:true,offlineAssets:true,noAuthority:true,zeroRussianHelp:true,canonicalPublicationReady:false}));
