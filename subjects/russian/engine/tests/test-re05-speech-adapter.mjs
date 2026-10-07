import assert from 'node:assert/strict';
import {createLegacySpeechProvider,SPEECH_PROVIDER_STATUS} from '../speech/legacy-speech-provider.js';
import {createOralSessionRuntime} from '../speech/oral-session-runtime.mjs';
import {createScenarioPort} from '../speech/scenario-port.mjs';

let spoken=[];
let lastRecognition=null;
let lastRecording=null;

const audio={
  support:()=>({tts:true,htmlAudio:true}),
  speak:(text,options={})=>{spoken.push({text,rate:options.rate,lang:options.lang});return {started:true,sourceType:'TTS'}},
  playSource:(src,options={})=>({started:true,sourceType:options.sourceType||'SOURCE_AUDIO',src,rate:options.rate})
};

const recognition={
  support:()=> 'SUPPORTED',
  start:options=>{
    lastRecognition=options;
    return {started:true,support:'SUPPORTED'};
  },
  stop:()=>true,
  cancel:()=>true
};

const recording={
  support:()=> 'SUPPORTED',
  status:()=>({support:'SUPPORTED',micState:'GRANTED',active:false}),
  start:async options=>{
    const row={sessionId:'REC-1',createdAt:'2026-10-07T00:00:00Z',durationMs:1200,mimeType:'audio/webm',size:1234,url:'blob:1',retention:'TRANSIENT_LOCAL'};
    lastRecording=row;
    options.onStop?.(row);
    return {started:true,status:{support:'SUPPORTED',micState:'GRANTED'}};
  },
  stop:()=>true,
  cancel:()=>true,
  clear:()=>{lastRecording=null;return true},
  getLastRecording:()=>lastRecording
};

const provider=createLegacySpeechProvider({audio,recognition,recording});
const caps=provider.capabilities();
assert.equal(caps.recognition,SPEECH_PROVIDER_STATUS.READY);
assert.equal(caps.recording,SPEECH_PROVIDER_STATUS.READY);
assert.equal(caps.pronunciationPrecision,'NOT_PROVIDED_BY_PLAIN_ASR');
assert.equal(caps.remoteRequired,false);

assert.equal(provider.playStimulus({audioText:'Привет',rate:.9}).started,true);
assert.equal(spoken.at(-1).lang,'ru-RU');
assert.equal(spoken.at(-1).rate,.9);

let signal=null;
assert.equal(provider.recognize({onSignal:x=>signal=x}).started,true);
lastRecognition.onResult({transcript:'Привет',rawConfidence:.73});
assert.equal(signal.kind,'ASR_TRANSCRIPT_SIGNAL');
assert.equal(signal.transcript,'Привет');
assert.equal(signal.pronunciationAuthority,false);
assert.equal(signal.stressAuthority,false);

let recordingResult=null;
const rec=await provider.startRecording({onStop:x=>recordingResult=x});
assert.equal(rec.started,true);
assert.equal(recordingResult.localOnly,true);
assert.equal(recordingResult.retention,'TRANSIENT_LOCAL');

let tick=1000;
const oral=createOralSessionRuntime({speechProvider:provider,clock:()=>++tick});
oral.startSession({
  sessionId:'OS-1',
  attemptId:'ATT-1',
  experienceId:'EXP-1',
  competencyIds:['COMP-RU-LISTEN','COMP-RU-SPEAK'],
  mode:'shadow',
  stimulus:{audioText:'Здравствуйте',rate:1},
  supportLevel:1,
  difficulty:'clear-native'
});

assert.equal(oral.play('OS-1').started,true);
const listenEvidence=oral.listenEvidence('OS-1');
assert.equal(listenEvidence.result.listens,1);
assert.equal(listenEvidence.authoritative,false);

oral.recognize('OS-1');
lastRecognition.onResult({transcript:'Здравствуйте',rawConfidence:.81});
const asrEvidence=oral.recognitionEvidence('OS-1',{targetText:'Здравствуйте'});
assert.equal(asrEvidence.observationType,'asr-transcript-signal');
assert.equal(asrEvidence.result.transcript,'Здравствуйте');
assert.equal(asrEvidence.result.pronunciationEvaluated,false);
assert.equal(asrEvidence.result.stressEvaluated,false);
assert.equal(asrEvidence.authoritative,false);

await oral.startRecording('OS-1');
const recordingEvidence=oral.recordingEvidence('OS-1');
assert.equal(recordingEvidence.result.captured,true);
assert.equal(recordingEvidence.result.localOnly,true);
assert.equal(recordingEvidence.authoritative,false);

const scenarioState=new Map();
const scenarioPort=createScenarioPort({
  getScenario:async id=>({id,goal:'repair-communication'}),
  startRun:async input=>{
    const run={runId:'RUN-1',scenarioId:input.scenarioId,state:'active'};
    scenarioState.set(run.runId,run);return run;
  },
  advanceRun:async input=>({runId:input.runId,state:'active',observation:{repairUsed:true},authoritative:false}),
  getRun:async id=>scenarioState.get(id)||null
});
assert.equal((await scenarioPort.getScenario('P11-ADMIN-RECEPTION')).id,'P11-ADMIN-RECEPTION');
assert.equal((await scenarioPort.start({scenarioId:'P11-ADMIN-RECEPTION'})).runId,'RUN-1');
assert.equal((await scenarioPort.advance({runId:'RUN-1'})).observation.repairUsed,true);

const badScenarioPort=createScenarioPort({
  getScenario:async()=>({}),
  startRun:async()=>({}),
  advanceRun:async()=>({masteryGranted:true}),
  getRun:async()=>({})
});
await assert.rejects(()=>badScenarioPort.advance({runId:'BAD'}),/cannot grant mastery/);

const failedRecognition={
  support:()=> 'UNSUPPORTED',
  start:options=>{options.onUnsupported?.({support:'UNSUPPORTED'});return {started:false,support:'UNSUPPORTED'}},
  stop:()=>false,
  cancel:()=>false
};
const failedProvider=createLegacySpeechProvider({audio,recognition:failedRecognition,recording});
const failedOral=createOralSessionRuntime({speechProvider:failedProvider,clock:()=>2000});
failedOral.startSession({
  sessionId:'OS-FAIL',
  attemptId:'ATT-F',
  experienceId:'EXP-F',
  competencyIds:['COMP-RU-LISTEN'],
  mode:'listen',
  stimulus:{audioText:'Да'},
  supportLevel:0,
  difficulty:'clear-native'
});
failedOral.recognize('OS-FAIL');
const failureEvidence=failedOral.recognitionEvidence('OS-FAIL');
assert.equal(failureEvidence.result.providerSignalAvailable,false);
assert.equal(failureEvidence.provider.infrastructureFailure,true);
assert.equal(failureEvidence.authoritative,false);

console.log(JSON.stringify({
  ok:true,
  speechProvider:provider.schema,
  oralRuntime:oral.schema,
  scenarioPort:scenarioPort.schema,
  asrPronunciationAuthority:false,
  localRecording:true,
  infrastructureFailureSeparated:true,
  masteryAuthority:'RU04/C4'
}));
