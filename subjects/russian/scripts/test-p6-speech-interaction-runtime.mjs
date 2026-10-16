import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

let lastSR=null,lastRecorder=null,tracksStopped=0,spoken=[];
const domHandlers=new Map();
class MockSR{
 constructor(){lastSR=this;this.lang='';this.interimResults=false;this.maxAlternatives=1;this.continuous=false}
 start(){this.started=true}
 stop(){this.stopped=true;this.onend?.()}
 abort(){this.aborted=true}
}
class MockRecorder{
 constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';lastRecorder=this}
 start(){this.state='recording'}
 stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'])});this.onstop?.()}
}
class MockUtterance{constructor(text){this.text=text}}
class MockAudio{constructor(src){this.src=src;this.playbackRate=1}addEventListener(){}play(){return Promise.resolve()}}
const window={
 SpeechRecognition:MockSR,webkitSpeechRecognition:null,MediaRecorder:MockRecorder,
 SpeechSynthesisUtterance:MockUtterance,Audio:MockAudio,
 speechSynthesis:{cancel(){},speak(u){spoken.push(u.text);u.onstart?.();u.onend?.()}},
 addEventListener(name,handler){domHandlers.set('window:'+name,handler)},
};
const navigator={mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){tracksStopped++}}]})}};
const document={addEventListener(name,handler){domHandlers.set('document:'+name,handler)}};
let urlSeq=0;
const URL={createObjectURL:()=>`blob:mock-${++urlSeq}`,revokeObjectURL(){}};
const context={window,navigator,document,URL,Blob,console,setTimeout,clearTimeout,Date,JSON,Math,String,Number,Object,Array};
vm.createContext(context);
vm.runInContext(fs.readFileSync('subjects/russian/assets/speech-interaction-engine.js','utf8'),context);

const asr=window.RussianSpeechRecognitionAdapter;
assert.equal(asr.support(),'SUPPORTED');
let transcript='';
const started=asr.start({lang:'ru-RU',onResult:x=>transcript=x.transcript});
assert.equal(started.started,true);
assert.equal(lastSR.lang,'ru-RU');
const detachedResult=lastSR.onresult;
lastSR.onresult?.({results:[{0:{transcript:'Здрав...',confidence:.91},isFinal:false}]});
assert.equal(transcript,'','Interim result must not become a completed spoken answer');
lastSR.onresult?.({results:[{0:{transcript:'Здравствуйте',confidence:.72},isFinal:true}]});
assert.equal(transcript,'Здравствуйте');
asr.cancel();
detachedResult({results:[{0:{transcript:'stale callback',confidence:.99},isFinal:true}]});
assert.equal(transcript,'Здравствуйте','Cancelled recognition must reject delayed result callbacks');

const recorder=window.RussianRecordingEngine;
let stopped=null;
const recStart=await recorder.start({maxDurationMs:5000,onStop:x=>stopped=x});
assert.equal(recStart.started,true);
assert.equal(recorder.status().active,true);
assert.equal(lastRecorder.state,'recording');
assert.equal(recorder.stop(),true);
assert.ok(stopped?.size>0);
assert.equal(stopped.retention,'TRANSIENT_LOCAL');
assert.ok(stopped.url.startsWith('blob:mock-'));
assert.ok(tracksStopped>0);
recorder.clear();

assert.equal(recorder.status().last,null,'Clearing a completed local recording must remove its reference');

// A real browser can settle getUserMedia after the learner navigated away.
const normalGetUserMedia=navigator.mediaDevices.getUserMedia;
let resolvePermission, permissionCalls=0, delayedStopCount=0, unintendedStopCount=0;
navigator.mediaDevices.getUserMedia=()=>{
  permissionCalls++;
  return new Promise(resolve=>{resolvePermission=resolve});
};
let unintendedRecording=null;
const waiting=recorder.start({onStop:row=>{unintendedRecording=row}});
assert.equal(recorder.status().pending,true,'Mic permission must be visible as pending');
assert.equal(recorder.status().active,false,'Requesting permission must not count as recording');
const duplicate=await recorder.start();
assert.equal(duplicate.started,false,'Double-tap during permission must not trigger a second request');
assert.equal(duplicate.reason,'already-active');
assert.equal(permissionCalls,1);
assert.equal(recorder.cancel(),true,'Cancel must invalidate pending permissions');
resolvePermission({getTracks:()=>[{stop(){delayedStopCount++}}]});
const cancelled=await waiting;
assert.equal(cancelled.started,false);
assert.equal(cancelled.reason,'cancelled');
assert.equal(delayedStopCount,1,'Tracks granted after cancellation must stop immediately');
assert.equal(unintendedRecording,null,'Cancelled permission cannot deliver an onStop recording');
assert.equal(recorder.status().active,false);
assert.equal(recorder.status().pending,false);
assert.equal(recorder.status().session,null);

// A stale first permission response cannot stop or replace a newer active capture.
let resolveOld,resolveNew,oldTrackStops=0,newTrackStops=0;
navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{
  if(!resolveOld)resolveOld=resolve;else resolveNew=resolve;
});
const oldRequest=recorder.start();
recorder.cancel();
const newRequest=recorder.start();
resolveOld({getTracks:()=>[{stop(){oldTrackStops++}}]});
const stale=await oldRequest;
assert.equal(stale.reason,'cancelled');
assert.equal(oldTrackStops,1);
assert.equal(recorder.status().pending,true,'Old completion must not clear the new permission request');
resolveNew({getTracks:()=>[{stop(){newTrackStops++}}]});
const current=await newRequest;
assert.equal(current.started,true);
assert.equal(recorder.status().active,true,'Current capture must survive late old permission');
recorder.cancel();
assert.equal(newTrackStops,1,'Cancelling current capture must stop its active microphone');

// Navigation while permission is pending must cancel even without a MediaRecorder.
let resolveOnNavigation,navTrackStops=0;
navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{resolveOnNavigation=resolve});
const navRequest=recorder.start();
const navHandler=domHandlers.get('document:click');
assert.equal(typeof navHandler,'function');
navHandler({target:{closest:selector=>selector==='[data-view],[data-route],a[href]'?{}:null}});
resolveOnNavigation({getTracks:()=>[{stop(){navTrackStops++}}]});
assert.equal((await navRequest).reason,'cancelled');
assert.equal(navTrackStops,1,'Navigation cancellation must release a delayed mic stream');

// pagehide must also invalidate pending permission without starting recording.
let resolveAfterPagehide,pagehideStops=0;
navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{resolveAfterPagehide=resolve});
const pageLeaving=recorder.start();
domHandlers.get('window:pagehide')();
resolveAfterPagehide({getTracks:()=>[{stop(){pagehideStops++}}]});
assert.equal((await pageLeaving).reason,'cancelled');
assert.equal(pagehideStops,1);
assert.equal(recorder.status().active,false);
navigator.mediaDevices.getUserMedia=normalGetUserMedia;


const audio=window.RussianAudioEngine;
assert.equal(audio.speak('Привет',{lang:'ru-RU'}).started,true);
assert.deepEqual(spoken,['Привет']);

delete window.SpeechRecognition;
delete window.webkitSpeechRecognition;
assert.equal(asr.support(),'UNSUPPORTED');
let unsupported=false;
const noAsr=asr.start({onUnsupported:()=>unsupported=true});
assert.equal(noAsr.started,false);assert.equal(unsupported,true);
console.log('Russian P6 speech interaction runtime: PASS');