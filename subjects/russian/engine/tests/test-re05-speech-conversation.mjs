import assert from 'node:assert/strict';
import {createExistingRussianSpeechAdapter} from '../providers/existing-speech-adapter.mjs';
import {buildAsrObservation,buildRecordingObservation} from '../speech/oral-evidence.mjs';
import {createScenarioRuntime,validateScenarioDefinition} from '../conversation/scenario-runtime.mjs';

const calls={speak:[],asr:[],record:0};
let asrHandler=null;
const runtime={
 RussianAudioEngine:{
   schema:'RUSSIAN_AUDIO_ENGINE_V1',
   support:()=>({tts:true,htmlAudio:true}),
   speak:(text,options)=>{calls.speak.push({text,options});return {started:true,sourceType:'TTS'}}
 },
 RussianSpeechRecognitionAdapter:{
   schema:'RUSSIAN_SPEECH_RECOGNITION_ADAPTER_V1',
   support:()=> 'SUPPORTED',
   start:options=>{calls.asr.push(options);asrHandler=options;return {started:true,support:'SUPPORTED'}},
   stop:()=>true,cancel:()=>true
 },
 RussianRecordingEngine:{
   schema:'RUSSIAN_RECORDING_ENGINE_V1',
   support:()=> 'SUPPORTED',
   start:async()=>{calls.record++;return {started:true,status:{active:true}}},
   stop:()=>true,cancel:()=>true,status:()=>({active:false,support:'SUPPORTED'}),
   getLastRecording:()=>({sessionId:'REC-1',durationMs:1200,mimeType:'audio/webm',size:1000,retention:'TRANSIENT_LOCAL'}),
   clear:()=>true
 }
};

const adapter=createExistingRussianSpeechAdapter(runtime);
const caps=adapter.capabilities();
assert.equal(adapter.ownerPolicy,'ADAPT_EXISTING_DO_NOT_DUPLICATE');
assert.equal(caps.speechRecognition.support,'SUPPORTED');
assert.equal(caps.recording.support,'SUPPORTED');
assert.equal(caps.privacy.voiceUploadByAdapter,false);
assert(caps.limitations.some(x=>x.includes('not pronunciation mastery evidence')));

const audio=adapter.playRussian('Привет',{rate:1});
assert.equal(audio.result.started,true);
assert.equal(calls.speak[0].options.lang,'ru-RU');

const session=adapter.recognizeRussian({});
assert.equal(session.start.started,true);
asrHandler.onResult({transcript:'привет',rawConfidence:.71,support:'SUPPORTED'});
assert.equal(session.getLastResult().transcript,'привет');

const asrEvidence=buildAsrObservation({
 evidenceId:'E-ASR-1',attemptId:'ATT-1',experienceId:'EXP-1',
 competencyIds:['COMP-RU-SPEAK'],transcript:'привет',target:'Привет',
 rawConfidence:.71,responseMs:800,providerState:'SUPPORTED'
});
assert.equal(asrEvidence.authoritative,false);
assert.equal(asrEvidence.result.interpretation,'NO_PRONUNCIATION_MASTERY_CLAIM');
assert.equal(asrEvidence.provider.confidenceMeaning,'PROVIDER_RECOGNITION_CONFIDENCE_ONLY');

await adapter.startLocalRecording();
assert.equal(calls.record,1);
const recEvidence=buildRecordingObservation({
 evidenceId:'E-REC-1',attemptId:'ATT-1',experienceId:'EXP-1',
 competencyIds:['COMP-RU-SPEAK'],recordingMeta:adapter.getLastRecording()
});
assert.equal(recEvidence.result.retention,'TRANSIENT_LOCAL');
assert.equal(recEvidence.provider.localOnly,true);

const scenario={
 id:'P11-LIFE-ROOMMATE',
 goal:'introduce-self-and-establish-basic-roommate-coordination',
 roles:['learner','roommate'],
 startNode:'intro',
 nodes:{
   intro:{next:['clarify']},
   clarify:{unexpectedTurn:'roommate-speaks-too-fast',repairPath:['ask-repeat','ask-slower'],next:['close']},
   close:{completion:'practice'}
 }
};
assert.equal(validateScenarioDefinition(scenario).ok,true);
const sc=createScenarioRuntime(scenario,{clock:()=>123});
sc.begin();
sc.advance({action:'continue'});
const repaired=sc.advance({repairStrategy:'ask-slower',action:'repair'});
assert.equal(repaired.completed,true);
assert.deepEqual(repaired.repairUsed,['ask-slower']);
assert(repaired.events.some(x=>x.type==='scenario.repair.used'));
assert(repaired.events.some(x=>x.type==='scenario.goal.completed'));

console.log(JSON.stringify({
 ok:true,
 speechOwnerPolicy:adapter.ownerPolicy,
 asrPronunciationAuthority:false,
 recordingRetention:recEvidence.result.retention,
 scenarioRepair:true,
 masteryAuthority:'RU04/C4'
}));
