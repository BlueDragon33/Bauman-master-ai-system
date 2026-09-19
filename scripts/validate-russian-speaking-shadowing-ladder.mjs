import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_SPEAKING_LADDER_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_SPEAKING_SHADOWING_LADDER_CONTRACT_V1','Unexpected speaking ladder schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['imitation','shadowing','memory','roleplay','repair']),'Speaking ladder order drifted');
  assert(c.prerequisites?.normalListenBeforeImitation===1,'Imitation must require prior normal listening');
  assert(c.prerequisites?.normalListensBeforeShadowing===2,'Shadowing must require two normal listens');
  assert(c.prerequisites?.imitationBeforeShadowing===true&&c.prerequisites?.shadowingBeforeMemory===true&&c.prerequisites?.memoryBeforeRoleplay===true,'Speaking stage prerequisites weakened');
  assert(c.prerequisites?.pronunciationFlagBeforeRepair===true,'Repair must require explicit pronunciation flag');
  assert(c.runtime?.reuseCoreRecorder===true&&c.runtime?.roleplayEvidenceRequiresRecording===true,'Speaking evidence must come from real recorder use');
  assert(c.runtime?.recognitionResultEvidenceRequired===true&&c.runtime?.failedOrEmptyRecognitionDoesNotCountAttempt===true,'Speaking evidence must require non-empty recognition result');
  assert(c.runtime?.deepSpeakingRecognitionRequired===true&&c.runtime?.deepSpeakingSelfAssessmentSeparate===true,'Deep Speaking must require recognition evidence and keep self-assessment separate');
  assert(c.runtime?.recognitionSessionTokenRequired===true&&c.runtime?.staleRecognitionCallbacksIgnored===true,'Speech recognition sessions must reject stale callbacks');
  assert(c.runtime?.recognitionContextCapturedAtStart===true&&c.runtime?.delayedAutoAdvanceContextGuarded===true,'Speech recognition must preserve its start context through delayed callbacks');
  assert(c.runtime?.singleRecognitionResultPerSession===true&&c.evidence?.duplicateRecognitionCallbacksDoNotDuplicateAttempts===true,'Each recognition session must create evidence at most once');
  assert(c.runtime?.manualSelfAssessmentDoesNotCreateSpeakingEvidence===true,'Manual self-assessment must remain non-evidence');
  assert(c.evidence?.recognitionConfirmedAttempts===true,'Speaking attempts must remain recognition-confirmed');
  assert(c.evidence?.deepSpeakingAttemptsRecognitionConfirmed===true,'Deep Speaking attempts must remain recognition-confirmed');
  assert(c.evidence?.staleRecognitionCannotCreateEvidence===true,'Stale recognition callbacks must not create evidence');
  assert(c.evidence?.recognitionWritesOriginalStore===true,'Recognition evidence must be written to the store captured at recorder start');
  assert(c.evidence?.learningFlowRecognitionOnly===true&&c.evidence?.selfAssessmentStoredSeparately===true,'Learning-flow speaking evidence must remain recognition-only');
  assert(c.runtime?.listeningLadderOwnedByTurn8===true&&c.runtime?.slowListenOwnedByRepairOnly===true,'Listening/speaking ownership drifted');
  assert(c.feedback?.translationAnswerForbidden===true&&c.feedback?.autoMasteryFromSimilarityScore===false,'Speaking feedback policy weakened');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Speaking ladder may not own mastery');
  return true;
}

export function validateRuntime(js,css,core,learningFlow){
  assert(js.includes("const STAGES=['imitation','shadowing','memory','roleplay','repair']"),'Runtime speaking stage sequence missing');
  assert(js.includes("function startImitation()"),'Imitation stage missing');
  assert(js.includes("function startShadow()"),'Shadowing stage missing');
  assert(js.includes("function startMemory()"),'Memory speaking stage missing');
  assert(js.includes("function startRoleplay(role)"),'Role-play stage missing');
  assert(js.includes("function startRepair()"),'Repair stage missing');
  assert(js.includes("heardCount(c)>=1"),'Imitation is not listening-gated');
  assert(/function canShadow\([^]*?heardCount\(c\)>=2&&Number\(row\?\.imitationAttempts\|\|0\)>0;/.test(js),'Shadowing is not two-listen gated');
  assert(js.includes("clickCore('record-line')"),'Speaking ladder does not reuse core recorder');
  assert(js.includes("russian:speaking-recording-result"),'Speaking coach is not bound to recognition-result evidence');
  assert(js.includes('recognitionConfirmed:true'),'Speaking attempts lack recognition-confirmed evidence marker');
  assert(!/if\(act==='record-line'\)[\s\S]{0,500}bump\('(imitationAttempts|shadowAttempts|memoryAttempts|roleplayAttempts|repairAttempts)'/.test(js),'Click-equals-speaking-attempt behavior returned');
  assert(js.includes("clickCore(role==='B'?'role-b':'role-a')"),'Role-play does not reuse core role controls');
  assert(js.includes("clickCore('speak-line-slow')"),'Repair does not reuse slow-listen repair control');
  assert(!js.includes('Listening ladder'),'Speaking coach still duplicates Turn 8 ownership');
  assert(!js.includes("startListening("),'Speaking coach still owns a separate listening flow');
  assert(js.includes("if(mode==='roleplay')bump('roleplayAttempts'"),'Role-play evidence is not recorder-backed');
  assert(!/speak-dialogue[^\n]*roleplay/i.test(js),'Role-play evidence must not come from listening to full dialogue');
  assert(js.includes("'pronunciation_error'"),'Pronunciation repair Review Queue bridge missing');
  assert(!js.includes('mastered:true')&&!js.includes("status:'mastered'"),'Speaking ladder writes mastery');
  assert(!/score\s*[><]=?/.test(js),'Speaking ladder must not auto-classify by score threshold');
  assert(css.includes('.ru-speaking-memory-mode')&&css.includes('.russian-line'),'Memory mode must hide the actual Russian line');
  assert(core.includes("if(act==='record-line')startLineRecording();"),'Core recorder action missing');
  assert(core.includes("notifySpeakingRecordingResult(d,idx,transcript,score,lessonIdAtStart)"),'Core recorder does not emit evidence on recognition result with captured lesson identity');
  assert(core.includes("russian:speaking-self-assessed"),'Core self-assessment event missing');
  assert(!/if\(act==='mark-line-ok'\)[^\n]*activeSpeechResults\(/.test(core),'Manual self-assessment writes speaking-result evidence');
  assert(!/if\(act==='mark-line-ok'\)[^\n]*(score:100|transcript:dialogueText)/.test(core),'Manual self-assessment fabricates recognition evidence');
  assert(!/else if\(act==='mark-line-ok'\)\{[^}]*markSessionAttempt\(\)/.test(js),'Self-assessment still marks a speaking session attempt');
  assert(!/else if\(act==='mark-line-ok'\)\{[^}]*clearPronunciationReview\(\)/.test(js),'Self-assessment still clears pronunciation repair evidence');
  assert(learningFlow.includes("window.addEventListener('russian:speaking-recording-result'"),'Learning flow is not recognition-result driven');
  assert(!learningFlow.includes("['record-line','speak-line','speak-line-slow','speak-dialogue']"),'Listening/recorder clicks still count as speaking attempts');
  assert(!/act==='mark-line-ok'[^\n]*attempts/.test(learningFlow),'Self-assessment still increments speaking attempts');
  assert(core.includes("try{rec.start();toast('Đang mở micro tiếng Nga...');return true}catch(_)"),'Core recorder start failure is not explicit');
  assert(core.includes('function startDeepSpeakingRecording()'),'Deep Speaking recognition recorder missing');
  assert(core.includes("if(act==='deep-record'){startDeepSpeakingRecording();return}"),'Deep Speaking record action missing');
  assert(core.includes("p.attempts[id]=Number(p.attempts[id]||0)+1"),'Deep Speaking recognition attempt counter missing');
  assert(core.includes("russian:deep-speaking-recording-result"),'Deep Speaking recognition result event missing');
  assert(core.includes('Tự đánh giá: ổn'),'Deep Speaking self-assessment is not explicitly separated from recognition evidence');
  assert(!/deep-mark-ok[^\n]{0,600}p\.attempts\[/.test(core),'Deep Speaking self-assessment must not create recognition attempts');
  assert(core.includes('speechRecognitionToken=0'),'Speech recognition session token missing');
  assert((core.match(/const token=\+\+speechRecognitionToken;/g)||[]).length>=2,'Both recorders must start a fresh recognition session token');
  const staleOnlyGuards=(core.match(/if\(token!==speechRecognitionToken\)return;/g)||[]).length; const staleConsumedGuards=(core.match(/if\(token!==speechRecognitionToken\|\|resultConsumed\)return;/g)||[]).length; assert(staleOnlyGuards+staleConsumedGuards>=8,'Recognition callbacks are not fully protected from stale sessions');
  assert(core.includes("const resultStoreKey=inPracticeMode()?'practiceSpeechResults':'dialogueSpeechResults'"),'Recorder does not capture its result store at start');
  assert(core.includes("dialogueIdAtStart=str(d?.id||d?.title||'dialogue')")&&core.includes("lessonIdAtStart=str(state.lessonId||'')"),'Recorder does not capture dialogue/lesson identity at start');
  assert(core.includes('state[resultStoreKey]=state[resultStoreKey]||{}; const store=state[resultStoreKey]'),'Recognition result still writes through active/current surface state');
  assert(core.includes('token===speechRecognitionToken&&sameSurface&&currentDialogueId()===dialogueIdAtStart&&activeLineIndex()===idx'),'Delayed speaking auto-advance is not context guarded');
  assert((core.match(/let resultConsumed=false;/g)||[]).length>=2,'Both recorders must track recognition-result consumption');
  assert((core.match(/token!==speechRecognitionToken\|\|resultConsumed/g)||[]).length>=4,'Recognition result/error callbacks are not single-consumption guarded');
  assert((core.match(/resultConsumed=true;const transcript=/g)||[]).length>=2,'Recognition result is not consumed before evidence creation');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/speaking-shadowing-ladder-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/speaking-coach.js','utf8'),
    fs.readFileSync('subjects/russian/assets/speaking-coach.css','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8')
  );
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_SPEAKING_LADDER_GATE=PASS');
  console.log(JSON.stringify({stages:5,roleplayRecorderBacked:true,recognitionResultEvidence:true,manualSelfAssessmentIsEvidence:false,learningFlowRecognitionOnly:true,failedOrEmptyRecognitionDoesNotCount:true,repairExplicit:true,listeningOwner:'Turn8'},null,2));
}
