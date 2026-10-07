import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createConversationWorld,validateConversationWorld} from '../conversation/conversation-world.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('../content/fixtures/conversation-worlds.v1.json',import.meta.url),'utf8'));
const def=fixture.worlds[0];
assert.equal(validateConversationWorld(def).ok,true);

const world=createConversationWorld(def,{clock:()=>10});
world.begin();
world.advance({functionId:'greet'});
const repaired=world.advance({repair:'ask-slower'});
assert.equal(repaired.repairUsed.includes('ask-slower'),true);
const done=world.advance({functionId:'confirm-understanding'});
assert.equal(done.completed,true);
assert(done.events.some(x=>x.type==='conversation.goal.completed'));

const safe=world.validateAiVariation({facts:def.facts,goalId:def.goal.id});
assert.equal(safe.ok,true);

const changedFacts=world.validateAiVariation({facts:{location:'airport'},goalId:def.goal.id});
assert.equal(changedFacts.ok,false);
assert(changedFacts.errors.some(x=>x.includes('changed world facts')));

const fakeMastery=world.validateAiVariation({facts:def.facts,goalId:def.goal.id,masteryGranted:true});
assert.equal(fakeMastery.ok,false);

assert.throws(()=>createConversationWorld({...def,startNode:'missing'}),/invalid/);

console.log(JSON.stringify({
 ok:true,
 statefulWorld:true,
 repairFirstClass:true,
 goalCompletion:true,
 aiCannotChangeFacts:true,
 aiCannotGrantMastery:true
}));
