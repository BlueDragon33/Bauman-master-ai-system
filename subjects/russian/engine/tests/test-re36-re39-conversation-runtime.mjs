import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
 validateBrowserConversationWorld,
 createBrowserConversationRuntime,
 listeningVariantsForText,
 buildSpeakingReflexSignal
} from '../conversation/browser-conversation-model.js';

const pack=JSON.parse(fs.readFileSync(new URL('../content/fixtures/conversation-worlds.v2.json',import.meta.url),'utf8'));
assert.equal(pack.worlds.length,4);
assert.equal(pack.worlds.every(x=>validateBrowserConversationWorld(x).ok),true);

for(const world of pack.worlds){
 const runtime=createBrowserConversationRuntime(world,{clock:()=>100});
 const start=runtime.begin();
 assert.equal(start.completed,false);
 const variants=runtime.listeningVariants();
 assert.deepEqual(variants.map(x=>x.rate),[.7,.85,1]);
 assert(variants.every(x=>x.transcriptPolicy==='hidden'));
 assert(variants.every(x=>x.speakerVariationClaim===false));

 const first=runtime.current().functions[0];
 assert.equal(runtime.respond(first.id).accepted,true);
 const secondNode=runtime.current();
 assert(secondNode.repairOptions.includes('ask-slower'));
 const repair=runtime.repair('ask-slower');
 assert.equal(repair.accepted,true);
 assert.equal(repair.playbackRate,.7);
 assert.equal(runtime.respond(secondNode.functions[0].id).accepted,true);
 assert.equal(runtime.snapshot().completed,true);
 assert(runtime.snapshot().repairUsed.includes('ask-slower'));
}
const signal=buildSpeakingReflexSignal({worldId:'W',turn:1,transcript:'да',startedAt:100,endedAt:780});
assert.equal(signal.latencyMs,680);
assert.equal(signal.pronunciationAuthority,false);
assert.equal(signal.stressAuthority,false);
assert.equal(signal.masteryMutation,false);
const failure=buildSpeakingReflexSignal({worldId:'W',providerFailure:true});
assert.equal(failure.providerFailure,true);
assert.equal(failure.authoritative,false);

console.log(JSON.stringify({
 ok:true,scenarios:pack.worlds.length,listeningRates:[.7,.85,1],
 repairFirstClass:true,goalCompletion:true,asrAuthority:false
}));
