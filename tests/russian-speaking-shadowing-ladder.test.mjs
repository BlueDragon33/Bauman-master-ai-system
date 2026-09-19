import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-speaking-shadowing-ladder.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/speaking-shadowing-ladder-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/speaking-coach.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/speaking-coach.css','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,css,core),true);

{const x=copy();x.prerequisites.normalListensBeforeShadowing=1;assert.throws(()=>validateContract(x),/two normal listens/)}
{const x=copy();x.runtime.roleplayEvidenceRequiresRecording=false;assert.throws(()=>validateContract(x),/real recorder use/)}
{const x=copy();x.runtime.recordingStartEvidenceRequired=false;assert.throws(()=>validateContract(x),/require recorder onstart/)}
{const x=copy();x.runtime.failedRecorderDoesNotCountAttempt=false;assert.throws(()=>validateContract(x),/require recorder onstart/)}
{const x=copy();x.evidence.recorderConfirmedAttempts=false;assert.throws(()=>validateContract(x),/recorder-confirmed/)}
assert.throws(()=>validateRuntime(js.replace("return heardCount(c)>=2&&Number(row?.imitationAttempts||0)>0;","return heardCount(c)>=1&&Number(row?.imitationAttempts||0)>0;"),css,core),/not two-listen gated/);
assert.throws(()=>validateRuntime(js.replace("if(mode==='roleplay')bump('roleplayAttempts'","if(mode==='roleplay')bump('freeAttempts'"),css,core),/not recorder-backed/);
assert.throws(()=>validateRuntime(js.replace("russian:speaking-recording-started","russian:speaking-recording-clicked"),css,core),/recorder-start evidence/);
assert.throws(()=>validateRuntime(js,css,core.replace("rec.onstart=()=>{state.speechRecording=true;save();render();notifySpeakingRecordingStarted(d,idx);","rec.onstart=()=>{state.speechRecording=true;save();render();")),/does not emit evidence on actual onstart/);

console.log('RUSSIAN_SPEAKING_LADDER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:9},null,2));
