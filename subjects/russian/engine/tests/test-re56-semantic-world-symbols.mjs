import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SPATIAL_SYMBOLS,symbolForSpatialType} from '../integration/spatial-node-symbols.mjs';
const spatial=JSON.parse(fs.readFileSync(new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url),'utf8'));
const types=new Set(spatial.worlds.flatMap(w=>w.nodes.map(node=>node.visualType)));
assert.equal(types.size,20);
for(const type of types){
  assert.equal(typeof SPATIAL_SYMBOLS[type],'string','symbol missing for '+type);
  assert.notEqual(symbolForSpatialType(type),'▢','no fallback for grounded semantic node '+type);
}
for(const [a,b] of [
  ['numbered-room','doorway'],
  ['lecture-room','numbered-room'],
  ['shower-room','doorway'],
  ['map-board','machine'],
  ['entrance','platform']
]){
  assert.notEqual(symbolForSpatialType(a),symbolForSpatialType(b),a+' icon must differ from '+b);
}
assert.equal(symbolForSpatialType('library'),'📚');
assert.equal(symbolForSpatialType('unknown-kind'),'▢');
assert.equal(spatial.scenes.find(s=>s.sceneId==='rl-11-dorm').expectedAction.targetId,'room-12');
assert.equal(spatial.scenes.find(s=>s.sceneId==='rl-13-university').expectedAction.targetId,'auditorium-12');
assert.equal(spatial.scenes.find(s=>s.sceneId==='rl-12-dorm').expectedAction.targetId,'shower-room');

const sceneA=fs.readFileSync(new URL('../integration/spatial-candidate-experience.js',import.meta.url),'utf8');
const sceneB=fs.readFileSync(new URL('../integration/repair-dialogue-experience.js',import.meta.url),'utf8');
for(const file of [sceneA,sceneB]){
  assert.ok(file.includes("symbolForSpatialType(n.visualType)"),'every preview must use shared semantic symbols');
  assert.ok(!file.includes('const ICON=Object.freeze'),'no duplicate visual truth');
}
const sw=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
assert.ok(sw.includes("'./engine/integration/spatial-node-symbols.mjs'"),'semantic symbol map must work offline');
console.log(JSON.stringify({ok:true,worldVisualTypes:types.size,semanticPairsDistinct:5,sharedSymbolSource:true,offlineCached:true,masteryMutation:false}));
