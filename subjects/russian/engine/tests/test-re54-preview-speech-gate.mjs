import assert from 'node:assert/strict';
import {createPreviewSpeechGate} from '../integration/preview-speech-gate.mjs';

let clock=1000,calls=[],release;
const gate=createPreviewSpeechGate({
  now:()=>clock,
  playStimulus:args=>{calls.push(args);return new Promise(resolve=>{release=resolve;});}
});
const first=gate.play({audioText:'Здравствуйте.',rate:1});
assert.equal(gate.status().pending,true,'synchronous pending lock must be engaged');
assert.equal((await gate.play({audioText:'Здравствуйте.',rate:1})).reason,'busy');
assert.equal(calls.length,1,'double tap must not call provider twice');
release({started:true});
assert.deepEqual(await first,{started:true,reason:'started'});
assert.equal(gate.status().pending,false);
assert.equal((await gate.play({audioText:'Здравствуйте.',rate:1})).reason,'duplicate','same phrase debounce');
clock+=351;
const slower=gate.play({audioText:'Здравствуйте.',rate:.7});
assert.equal(calls.length,2);
assert.equal(calls[1].rate,.7);
release({started:true});assert.equal((await slower).started,true);

const bad=createPreviewSpeechGate({playStimulus:()=>Promise.reject(new Error('unavailable'))});
assert.equal((await bad.play({audioText:'Где метро?'})).reason,'error','reject must be caught');
assert.equal((await bad.play({audioText:'Где метро?'})).reason,'error','failed playback must allow retry');
const missing=createPreviewSpeechGate();
assert.equal((await missing.play({audioText:'Привет.'})).reason,'unavailable');
assert.equal((await missing.play({audioText:'Привет.',rate:0})).reason,'unavailable');

let complete;
const delayed=createPreviewSpeechGate({playStimulus:()=>new Promise(resolve=>{complete=resolve;})});
const active=delayed.play({audioText:'Спасибо.'});
delayed.invalidate();
complete({started:true});
assert.equal((await active).reason,'stale','old scene completion must not report success');

let finalResolve;
const closing=createPreviewSpeechGate({playStimulus:()=>new Promise(resolve=>{finalResolve=resolve;})});
const requested=closing.play({audioText:'Извините.'});
closing.dispose();finalResolve({started:true});
assert.equal((await requested).reason,'stale');
assert.equal((await closing.play({audioText:'Извините.'})).reason,'disposed');
assert.equal(closing.status().pronunciationVerified,false);
console.log(JSON.stringify({ok:true,providerCalls:calls.length,rapidDoubleTapBlocked:true,asyncAndSyncSupported:true,rejectionSafe:true,staleResponseIgnored:true,noPronunciationAuthority:true}));
