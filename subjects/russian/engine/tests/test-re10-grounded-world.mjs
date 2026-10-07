import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createGroundedWorldRuntime,validateGroundedWorld} from '../world/grounded-world-runtime.mjs';

const catalog=JSON.parse(fs.readFileSync(new URL('../content/worlds/grounded-worlds.v1.json',import.meta.url),'utf8'));
assert.equal(catalog.worlds.length,1);
const world=catalog.worlds[0];
assert.equal(validateGroundedWorld(world).ok,true);

const runtime=createGroundedWorldRuntime(world,{clock:()=>123});
assert.equal(runtime.experiences().length,3);

runtime.start('WORLD-ROOM-001-GIVE-BALL');
const before=runtime.snapshot();
const wrong=runtime.act({kind:'transfer-object',objectId:'book',toEntityId:'requester'});
assert.equal(wrong.success,false);
assert.equal(wrong.consequence.kind,'no-success-mutation');
assert.deepEqual(runtime.snapshot().holders,before.holders);

const right=runtime.act({kind:'transfer-object',objectId:'ball',toEntityId:'requester'});
assert.equal(right.success,true);
assert.equal(right.state.holders.ball,'requester');
assert.equal(right.evidence.authoritative,false);
assert.equal(right.evidence.masteryMutation,false);

const transfer=runtime.nextTransferExperience();
assert.equal(transfer.experienceId,'WORLD-ROOM-001-GIVE-BOOK');

runtime.start('WORLD-ROOM-001-PUT-CUP');
const placed=runtime.act({kind:'place-object',objectId:'cup',locationId:'table'});
assert.equal(placed.success,true);
assert.equal(placed.state.locations.cup,'table');

runtime.reset();
assert.equal(runtime.snapshot().currentExperienceId,null);
assert.equal(runtime.snapshot().locations.ball,'table');

console.log(JSON.stringify({
  ok:true,
  world:runtime.worldId,
  experienceCount:runtime.experiences().length,
  wrongActionMutatesWorld:false,
  transferExperience:true,
  masteryMutation:false
}));
