import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const engine=read('subjects/russian/assets/speech-interaction-engine.js');
const core=read('subjects/russian/assets/core.js');
const coach=read('subjects/russian/assets/speaking-coach.js');
const index=read('subjects/russian/index.html');
const sw=read('subjects/russian/sw.js');

assert.match(engine,/RUSSIAN_AUDIO_ENGINE_V1/);
assert.match(engine,/RUSSIAN_SPEECH_RECOGNITION_ADAPTER_V1/);
assert.match(engine,/RUSSIAN_RECORDING_ENGINE_V1/);
assert.match(engine,/getUserMedia/);
assert.match(engine,/MediaRecorder/);
assert.match(engine,/PERMISSION_BLOCKED/);
assert.match(engine,/TRANSIENT_LOCAL/);
assert.match(engine,/pagehide/);
assert.doesNotMatch(engine,/RussianAssessmentMastery\?\.recordEvidence/,'interaction engine must not own mastery evidence writes');

assert.doesNotMatch(core,/window\.SpeechRecognition\|\|window\.webkitSpeechRecognition/,'core must not instantiate/browser-detect SpeechRecognition directly');
assert.doesNotMatch(core,/new SR\s*\(/,'core must not instantiate recognition directly');
assert.match(core,/RussianSpeechRecognitionAdapter/);
assert.match(core,/signalOnly:true/);
assert.match(core,/authoritative:false/);
assert.doesNotMatch(core,/ok:score>=70/,'ASR similarity must not auto-pass');
assert.doesNotMatch(core,/Điểm nói:/,'ASR similarity must not be presented as speaking score');
assert.match(coach,/RussianRecordingEngine/);
assert.match(coach,/Ghi âm cục bộ/);
assert.match(coach,/không tự tạo mastery/);

const enginePos=index.indexOf('assets/speech-interaction-engine.js');
const corePos=index.indexOf('assets/core.js');
assert.ok(enginePos>=0&&enginePos<corePos,'P6 interaction engine must load before core');
const shellCache=sw.match(/const CACHE='russian-app-shell-v([0-9]+)([^']*)'/i);
assert.ok(shellCache,'versioned Russian app-shell cache missing');
assert.ok(Number(shellCache[1])>=8,'P6 requires app-shell cache version >= 8');
assert.match(sw,/\.\/assets\/speech-interaction-engine\.js/);
assert.match(sw,/const SHELL=\[/,'offline shell manifest missing');
assert.match(sw,/cacheShellAfterActivation/,'offline shell must be prepared after service-worker activation');
assert.match(sw,/RUSSIAN_PREPARE_OFFLINE_SHELL/,'offline shell preparation message contract missing');
assert.match(sw,/SHELL\.map\(url=>cacheShellAsset\(cache,url\)\)/,'offline shell preparation must cache the declared runtime assets');

const required=[
 'RUSSIAN_LISTENING_SPEAKING_ENGINE_CONSTITUTION.md','RUSSIAN_AUDIO_OWNER_MAP.md','RUSSIAN_RECORDING_CONTRACT.md',
 'RUSSIAN_SPEECH_RECOGNITION_ADAPTER_CONTRACT.md','RUSSIAN_PRONUNCIATION_SIGNAL_POLICY.md','RUSSIAN_DIALOGUE_RUNTIME_CONTRACT.md',
 'RUSSIAN_DEEP_SPEAKING_RUNTIME_CONTRACT.md','RUSSIAN_AUDIO_OFFLINE_POLICY.md','RUSSIAN_SPEAKING_BROWSER_MATRIX.md',
 'RUSSIAN_P6_ACCEPTANCE_REPORT.md','RUSSIAN_P6_PHASE_RECORD.md','RUSSIAN_P6_EVIDENCE_INDEX.md'
];
for(const name of required)assert.ok(fs.existsSync('subjects/russian/docs/p6/'+name),name+' missing');
console.log('Russian P6 interaction constitution: PASS');