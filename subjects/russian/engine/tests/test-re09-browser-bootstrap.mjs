import fs from 'node:fs';
import assert from 'node:assert/strict';
import {inspectLegacyOwners,bootstrapRussianEngine} from '../integration/browser-bootstrap.js';

const missing=inspectLegacyOwners({});
assert.equal(missing.ready,false);
assert(missing.missing.includes('audio'));
assert(missing.missing.includes('assessmentMastery'));

const fakeWindow={
  RussianAudioEngine:{
    support:()=>({tts:true,htmlAudio:true}),
    speak:()=>({started:true}),
    playSource:()=>({started:true})
  },
  RussianSpeechRecognitionAdapter:{
    support:()=> 'SUPPORTED',
    start:()=>({started:true}),
    stop:()=>true,
    cancel:()=>true
  },
  RussianRecordingEngine:{
    support:()=> 'SUPPORTED',
    status:()=>({support:'SUPPORTED',micState:'UNKNOWN'}),
    start:async()=>({started:true}),
    stop:()=>true,
    cancel:()=>true,
    clear:()=>true,
    getLastRecording:()=>null
  },
  RussianAssessmentMastery:{schema:'existing-owner'},
  RussianAdaptivePlanner:{schema:'existing-owner'},
  RussianLearningState:{schema:'existing-owner'}
};

const before={
  assessment:fakeWindow.RussianAssessmentMastery,
  planner:fakeWindow.RussianAdaptivePlanner,
  state:fakeWindow.RussianLearningState
};

const status=bootstrapRussianEngine(fakeWindow);
assert.equal(status.ready,true);
assert.equal(status.enabled,false);
assert.equal(status.mode,'PASSIVE_BRIDGE');
assert.equal(status.capabilities.recognition,'READY');
assert.equal(status.capabilities.pronunciationPrecision,'NOT_PROVIDED_BY_PLAIN_ASR');

assert.equal(fakeWindow.RussianAssessmentMastery,before.assessment);
assert.equal(fakeWindow.RussianAdaptivePlanner,before.planner);
assert.equal(fakeWindow.RussianLearningState,before.state);

const bridge=fakeWindow.RussianEngineIntegration;
assert.equal(bridge.schema,'RUSSIAN_ENGINE_BROWSER_BOOTSTRAP_V1');
assert.equal(bridge.status().ready,true);
assert.equal(bridge.getSpeechProvider().schema,'RUSSIAN_ENGINE_LEGACY_SPEECH_PROVIDER_V1');

const indexHtml=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const integrationTag='<script type="module" src="engine/integration/browser-bootstrap.js"></script>';
const indexIntegrationTagCount=indexHtml.split(integrationTag).length-1;
const sw=fs.readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
const offlineShellHasBootstrap=sw.includes("'./engine/integration/browser-bootstrap.js'");
const offlineShellHasSpeechProvider=sw.includes("'./engine/speech/legacy-speech-provider.js'");
const offlineCacheVersionBumped=/russian-app-shell-v13-engine-js-module-mime/.test(sw);

assert.equal(indexIntegrationTagCount,1,'Russian Engine bootstrap must be loaded exactly once');
assert(indexHtml.indexOf('assets/speech-interaction-engine.js')<indexHtml.indexOf(integrationTag),'bootstrap must load after legacy speech owner declaration');
assert.equal(offlineShellHasBootstrap,true,'offline shell must cache Engine bootstrap');
assert.equal(offlineShellHasSpeechProvider,true,'offline shell must cache bootstrap dependency');
assert.equal(offlineCacheVersionBumped,true,'offline shell cache version must bump for Engine bridge');

console.log(JSON.stringify({
  ok:true,
  passiveBridge:true,
  existingOwnerMutation:false,
  uiMutation:false,
  learnerStateMutation:false,
  indexIntegrationTagCount,
  offlineShellHasBootstrap,
  offlineShellHasSpeechProvider,
  offlineCacheVersionBumped
}));
