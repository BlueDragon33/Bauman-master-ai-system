import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

let lastSR=null,lastRecorder=null,tracksStopped=0,spoken=[];
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
 addEventListener(){},
};
const navigator={mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){tracksStopped++}}]})}};
const document={addEventListener(){}};
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
lastSR.onresult?.({results:[[{transcript:'Здравствуйте',confidence:.72}]]});
assert.equal(transcript,'Здравствуйте');
asr.cancel();

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