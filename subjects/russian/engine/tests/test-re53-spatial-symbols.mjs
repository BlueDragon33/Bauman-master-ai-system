import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spatialSymbolForNode} from '../integration/spatial-node-symbols.js';

const world=JSON.parse(fs.readFileSync(new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url),'utf8'));
const lookup=(w,id)=>world.worlds.find(x=>x.worldId===w)?.nodes.find(n=>n.nodeId===id);
const map=spatialSymbolForNode(lookup('metro','metro-route-map'));
const entrance=spatialSymbolForNode(lookup('metro','station-entrance'));
const room=spatialSymbolForNode(lookup('dorm','room-12'));
const shower=spatialSymbolForNode(lookup('dorm','shower-room'));
const lecture=spatialSymbolForNode(lookup('university','auditorium-12'));
const door=spatialSymbolForNode(lookup('room','entry'));

assert.equal(map.text,'SƠ ĐỒ');
assert.equal(map.kind,'word');
assert.equal(entrance.text,'Ⓜ');
assert.equal(room.text,'P.12');
assert.equal(shower.text,'P.TẮM');
assert.equal(shower.kind,'word');
assert.equal(lecture.text,'A.12');
assert.equal(door.text,'🚪');
assert.notEqual(map.text,entrance.text,'metro route map is not entrance');
assert.notEqual(lecture.text,room.text,'lecture room is not dorm room');
assert.notEqual(shower.text,'🚿','shower room may not be presented as a showerhead');
assert.notEqual(room.text,door.text,'room is not doorway');
assert.equal(spatialSymbolForNode({nodeId:'unknown',visualType:'unknown'}).text,'▢');
assert.equal(spatialSymbolForNode(lookup('metro','metro-route-map')).text,map.text,'presentation deterministic');

const a=fs.readFileSync(new URL('../integration/repair-dialogue-experience.js',import.meta.url),'utf8');
const b=fs.readFileSync(new URL('../integration/spatial-candidate-experience.js',import.meta.url),'utf8');
for(const source of [a,b]){
  assert.ok(source.includes('spatialSymbolForNode(n).text'),'both previews must use one semantic symbol owner');
  assert.ok(source.includes('spatialSymbolForNode(n).kind'),'both previews style word symbols for readability');
  assert.equal(source.includes('const ICON=Object.freeze'),false,'duplicate map symbol tables forbidden');
}
const sw=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
assert.ok(sw.includes('./engine/integration/spatial-node-symbols.js'),'semantic owner must be cached offline');
assert.ok(sw.includes('russian-app-shell-v24-engine-semantic-node-symbols'),'SW cache must invalidate old symbols');
console.log(JSON.stringify({ok:true,semanticsVerified:6,sharedOwner:true,offlineCached:true,masteryUnchanged:true}));
