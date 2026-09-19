import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-speaking-shadowing-ladder.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/speaking-shadowing-ladder-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/speaking-coach.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/speaking-coach.css','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const learningFlow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,css,core,learningFlow),true);

{const x=copy();x.prerequisites.normalListensBeforeShadowing=1;assert.throws(()=>validateContract(x),/two normal listens/)}
{const x=copy();x.runtime.roleplayEvidenceRequiresRecording=false;assert.throws(()=>validateContract(x),/real recorder use/)}
{const x=copy();x.runtime.recognitionResultEvidenceRequired=false;assert.throws(()=>validateContract(x),/require non-empty recognition result/)}
{const x=copy();x.runtime.failedOrEmptyRecognitionDoesNotCountAttempt=false;assert.throws(()=>validateContract(x),/require non-empty recognition result/)}
{const x=copy();x.evidence.recognitionConfirmedAttempts=false;assert.throws(()=>validateContract(x),/recognition-confirmed/)}
{const x=copy();x.runtime.deepSpeakingRecognitionRequired=false;assert.throws(()=>validateContract(x),/Deep Speaking/)}
{const x=copy();x.runtime.deepSpeakingSelfAssessmentSeparate=false;assert.throws(()=>validateContract(x),/Deep Speaking/)}
{const x=copy();x.evidence.deepSpeakingAttemptsRecognitionConfirmed=false;assert.throws(()=>validateContract(x),/Deep Speaking attempts/)}
{const x=copy();x.runtime.recognitionSessionTokenRequired=false;assert.throws(()=>validateContract(x),/reject stale callbacks/)}
{const x=copy();x.runtime.staleRecognitionCallbacksIgnored=false;assert.throws(()=>validateContract(x),/reject stale callbacks/)}
{const x=copy();x.evidence.staleRecognitionCannotCreateEvidence=false;assert.throws(()=>validateContract(x),/Stale recognition callbacks/)}
{const x=copy();x.runtime.recognitionContextCapturedAtStart=false;assert.throws(()=>validateContract(x),/preserve its start context/)}
{const x=copy();x.runtime.delayedAutoAdvanceContextGuarded=false;assert.throws(()=>validateContract(x),/preserve its start context/)}
{const x=copy();x.evidence.recognitionWritesOriginalStore=false;assert.throws(()=>validateContract(x),/store captured at recorder start/)}
assert.throws(()=>validateRuntime(js,css,core.replace("const store=state[resultStoreKey]","const store=activeSpeechResults()"),learningFlow),/writes through active\/current surface state|result store/);
assert.throws(()=>validateRuntime(js,css,core.replace("token===speechRecognitionToken&&sameSurface&&currentDialogueId()===dialogueIdAtStart&&activeLineIndex()===idx","token===speechRecognitionToken"),learningFlow),/auto-advance is not context guarded/);
assert.throws(()=>validateRuntime(js,css,core.replace('speechRecognitionToken=0','speechRecognitionTokenMissing=0'),learningFlow),/session token missing/);
assert.throws(()=>validateRuntime(js,css,core.replaceAll('if(token!==speechRecognitionToken)return;',''),learningFlow),/not fully protected from stale sessions/);
assert.throws(()=>validateRuntime(js,css,core.replace('function startDeepSpeakingRecording()','function startDeepSpeakingRecorderMissing()'),learningFlow),/Deep Speaking recognition recorder missing/);
assert.throws(()=>validateRuntime(js,css,core.replace("p.attempts[id]=Number(p.attempts[id]||0)+1","p.attempts[id]=Number(p.attempts[id]||0)"),learningFlow),/Deep Speaking recognition attempt counter missing/);
{const x=copy();x.runtime.manualSelfAssessmentDoesNotCreateSpeakingEvidence=false;assert.throws(()=>validateContract(x),/self-assessment/)}
{const x=copy();x.evidence.learningFlowRecognitionOnly=false;assert.throws(()=>validateContract(x),/recognition-only/)}
assert.throws(()=>validateRuntime(js.replace("return heardCount(c)>=2&&Number(row?.imitationAttempts||0)>0;","return heardCount(c)>=1&&Number(row?.imitationAttempts||0)>0;"),css,core,learningFlow),/not two-listen gated/);
assert.throws(()=>validateRuntime(js.replace("if(mode==='roleplay')bump('roleplayAttempts'","if(mode==='roleplay')bump('freeAttempts'"),css,core,learningFlow),/not recorder-backed/);
assert.throws(()=>validateRuntime(js.replace("russian:speaking-recording-result","russian:speaking-recording-clicked"),css,core,learningFlow),/recognition-result evidence/);
assert.throws(()=>validateRuntime(js,css,core.replace("notifySpeakingRecordingResult(d,idx,transcript,score,lessonIdAtStart)","void score"),learningFlow),/does not emit evidence on recognition result/);


assert.throws(()=>validateRuntime(js,css,core.replace("try{window.dispatchEvent(new CustomEvent('russian:speaking-self-assessed'","try{window.dispatchEvent(new CustomEvent('russian:speaking-manual-rating'"),learningFlow),/self-assessment event missing/);
assert.throws(()=>validateRuntime(js,css,core,learningFlow.replace("window.addEventListener('russian:speaking-recording-result'","window.addEventListener('russian:speaking-recording-clicked'")),/not recognition-result driven/);
assert.throws(()=>validateRuntime(js,css,core,learningFlow.replace("selfAssessments:Number(old.selfAssessments||0)+1","attempts:Number(old.attempts||0)+1")),/Self-assessment still increments speaking attempts/);

console.log('RUSSIAN_SPEAKING_LADDER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:24},null,2));
