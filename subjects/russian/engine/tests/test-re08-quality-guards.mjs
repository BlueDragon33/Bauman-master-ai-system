import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  classifyFailure,
  validateVoicePrivacyCapabilities,
  validateEvidenceAuthority,
  validateLevelScale,
  validateReferenceGraphSafety
} from '../quality/engine-guard.mjs';
import {createExistingRussianSpeechAdapter} from '../providers/existing-speech-adapter.mjs';
import {createProfileScope} from '../product/profile-scope.mjs';

const levels=JSON.parse(fs.readFileSync(new URL('../content/levels/levels.v1.json',import.meta.url),'utf8'));
const graph=JSON.parse(fs.readFileSync(new URL('../content/graph/reference-graph.v1.json',import.meta.url),'utf8'));

const mockRuntime={
 RussianAudioEngine:{support:()=>({tts:true,htmlAudio:true}),speak:()=>({started:true})},
 RussianSpeechRecognitionAdapter:{schema:'ASR',support:()=> 'UNSUPPORTED',start:()=>({started:false,support:'UNSUPPORTED'}),stop:()=>false,cancel:()=>false},
 RussianRecordingEngine:{schema:'REC',support:()=> 'UNSUPPORTED',start:async()=>({started:false}),stop:()=>false,cancel:()=>true,status:()=>({support:'UNSUPPORTED'}),getLastRecording:()=>null,clear:()=>true}
};
const speech=createExistingRussianSpeechAdapter(mockRuntime);
const privacy=validateVoicePrivacyCapabilities(speech.capabilities());
assert.equal(privacy.ok,true,privacy.errors.join('; '));

assert.deepEqual(classifyFailure('stt-unavailable'),{kind:'infrastructure',affectsLearnerJudgment:false});
assert.deepEqual(classifyFailure('microphone-denied'),{kind:'infrastructure',affectsLearnerJudgment:false});
assert.deepEqual(classifyFailure('network-failed'),{kind:'infrastructure',affectsLearnerJudgment:false});
assert.deepEqual(classifyFailure('learner-response-invalid'),{kind:'learner',affectsLearnerJudgment:true});
assert.equal(classifyFailure('unknown-provider-problem').affectsLearnerJudgment,false);

const evidenceCheck=validateEvidenceAuthority([
 {evidenceId:'E1',authoritative:false},
 {evidenceId:'E2',authoritative:false}
]);
assert.equal(evidenceCheck.ok,true);

const badEvidence=validateEvidenceAuthority([{evidenceId:'BAD',authoritative:true,masteryGranted:true}]);
assert.equal(badEvidence.ok,false);
assert(badEvidence.errors.length>=2);

const scale=validateLevelScale(levels);
assert.equal(scale.ok,true,scale.errors.join('; '));
assert.equal(levels.levels.length,100);

const graphSafe=validateReferenceGraphSafety(graph);
assert.equal(graphSafe.ok,true,graphSafe.errors.join('; '));
assert.equal(graph.nodes.filter(x=>x.kind==='canonical-ref').every(x=>!Object.hasOwn(x,'russian')&&!Object.hasOwn(x,'text')),true);

const a=createProfileScope('qa-a');
const b=createProfileScope('qa-b');
assert.notEqual(a.key('state','same'),b.key('state','same'));

assert.equal(speech.capabilities().speechRecognition.support,'UNSUPPORTED');
assert.equal(speech.capabilities().recording.support,'UNSUPPORTED');
assert.equal(speech.ownerPolicy,'ADAPT_EXISTING_DO_NOT_DUPLICATE');

console.log(JSON.stringify({
 ok:true,
 levelScale:100,
 graphSafe:true,
 profileIsolation:true,
 voicePrivacy:true,
 infrastructureFailureNotLearnerFailure:true,
 authoritativeEvidenceBlocked:true,
 unsupportedSpeechDegradesCapability:true
}));
