import {SCHEMAS, validateEvidence} from '../public/contracts.mjs';

const clean = value => String(value ?? '').trim();
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const ORAL_MODES = Object.freeze([
  'listen',
  'listen-slow',
  'shadow',
  'repeat',
  'memory',
  'guided-answer',
  'roleplay',
  'free-response'
]);

export const ORAL_DIFFICULTY = Object.freeze([
  'isolated-or-careful',
  'careful-phrase',
  'clear-native',
  'normal-native',
  'connected-native',
  'alternate-speaker',
  'reduced-predictability',
  'mild-noise',
  'interruption-overlap',
  'multi-speaker',
  'open-spontaneous'
]);

function requireMode(mode) {
  const value = clean(mode);
  if (!ORAL_MODES.includes(value)) throw new Error(`Unsupported oral mode: ${value}`);
  return value;
}

function makeEvidence({
  evidenceId,
  attemptId,
  experienceId,
  competencyIds,
  observationType,
  result,
  provider,
  supportLevel
}) {
  return validateEvidence({
    schemaVersion: SCHEMAS.evidence,
    evidenceId,
    attemptId,
    experienceId,
    competencyIds,
    observationType,
    result,
    provider,
    supportLevel,
    authoritative: false
  });
}

export function createOralSessionRuntime({speechProvider, clock=Date.now}={}) {
  if (!speechProvider) throw new TypeError('speechProvider is required');
  let sequence = 0;
  const sessions = new Map();

  function startSession({
    sessionId,
    attemptId,
    experienceId,
    competencyIds,
    mode='listen',
    stimulus={},
    supportLevel=0,
    difficulty='clear-native'
  }={}) {
    const id = clean(sessionId);
    if (!id) throw new Error('sessionId is required');
    if (sessions.has(id)) throw new Error(`session already exists: ${id}`);
    if (!clean(attemptId) || !clean(experienceId)) throw new Error('attemptId and experienceId are required');
    if (!Array.isArray(competencyIds) || !competencyIds.length) throw new Error('competencyIds are required');
    const normalizedMode = requireMode(mode);
    if (!ORAL_DIFFICULTY.includes(clean(difficulty))) throw new Error(`Unsupported oral difficulty: ${difficulty}`);
    const session = {
      sessionId:id,
      attemptId:clean(attemptId),
      experienceId:clean(experienceId),
      competencyIds:[...competencyIds],
      mode:normalizedMode,
      stimulus:copy(stimulus),
      supportLevel:Math.max(0,Math.min(10,Number(supportLevel)||0)),
      difficulty:clean(difficulty),
      startedAtMs:Number(clock()),
      listens:0,
      recognitionSignals:[],
      recording:null,
      failures:[],
      completed:false
    };
    sessions.set(id,session);
    return copy(session);
  }

  function getSession(sessionId) {
    const session=sessions.get(clean(sessionId));
    return session?copy(session):null;
  }

  function play(sessionId,{rate}={}) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    const effectiveRate=Number(rate)||Number(session.stimulus?.rate)||1;
    const result=speechProvider.playStimulus({...session.stimulus,rate:effectiveRate},{
      onError:error=>session.failures.push({kind:'AUDIO_PROVIDER_ERROR',detail:clean(error?.message||error),atMs:Number(clock())}),
      onUnavailable:()=>session.failures.push({kind:'AUDIO_PROVIDER_UNAVAILABLE',atMs:Number(clock())})
    });
    if (result?.started) session.listens+=1;
    return copy(result);
  }

  function listenEvidence(sessionId) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    return makeEvidence({
      evidenceId:`RE05-EVID-${session.attemptId}-${++sequence}`,
      attemptId:session.attemptId,
      experienceId:session.experienceId,
      competencyIds:session.competencyIds,
      observationType:'oral-exposure-observation',
      result:{
        mode:session.mode,
        listens:session.listens,
        difficulty:session.difficulty,
        completed:session.listens>0
      },
      provider:{kind:'speech-provider',confidence:null,infrastructureFailure:session.failures.length>0},
      supportLevel:session.supportLevel
    });
  }

  function recognize(sessionId,callbacks={}) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    return speechProvider.recognize({
      timeoutMs:callbacks.timeoutMs,
      onSignal:signal=>{
        const normalized={
          ...copy(signal),
          receivedAtMs:Number(clock()),
          pronunciationAuthority:false,
          stressAuthority:false
        };
        session.recognitionSignals.push(normalized);
        callbacks.onSignal?.(copy(normalized));
      },
      onUnavailable:failure=>{
        session.failures.push({kind:'ASR_PROVIDER_UNAVAILABLE',detail:copy(failure),atMs:Number(clock())});
        callbacks.onUnavailable?.(copy(failure));
      },
      onError:failure=>{
        session.failures.push({kind:'ASR_PROVIDER_ERROR',detail:copy(failure),atMs:Number(clock())});
        callbacks.onError?.(copy(failure));
      },
      onEnd:callbacks.onEnd
    });
  }

  function recognitionEvidence(sessionId,{targetText=''}={}) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    const latest=session.recognitionSignals.at(-1)||null;
    return makeEvidence({
      evidenceId:`RE05-EVID-${session.attemptId}-${++sequence}`,
      attemptId:session.attemptId,
      experienceId:session.experienceId,
      competencyIds:session.competencyIds,
      observationType:'asr-transcript-signal',
      result:{
        transcript:clean(latest?.transcript),
        targetText:clean(targetText),
        rawConfidence:Number.isFinite(Number(latest?.rawConfidence))?Number(latest.rawConfidence):null,
        pronunciationEvaluated:false,
        stressEvaluated:false,
        providerSignalAvailable:!!latest
      },
      provider:{
        kind:'speech-recognition-adapter',
        confidence:Number.isFinite(Number(latest?.rawConfidence))?Number(latest.rawConfidence):null,
        infrastructureFailure:!latest && session.failures.some(x=>x.kind.startsWith('ASR_PROVIDER_'))
      },
      supportLevel:session.supportLevel
    });
  }

  async function startRecording(sessionId,options={}) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    return speechProvider.startRecording({
      maxDurationMs:options.maxDurationMs,
      onStop:recording=>{
        session.recording=copy(recording);
        options.onStop?.(copy(recording));
      },
      onError:failure=>{
        session.failures.push({kind:'RECORDING_PROVIDER_ERROR',detail:copy(failure),atMs:Number(clock())});
        options.onError?.(copy(failure));
      },
      onStatus:options.onStatus
    });
  }

  function recordingEvidence(sessionId) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    return makeEvidence({
      evidenceId:`RE05-EVID-${session.attemptId}-${++sequence}`,
      attemptId:session.attemptId,
      experienceId:session.experienceId,
      competencyIds:session.competencyIds,
      observationType:'local-recording-created',
      result:{
        captured:!!session.recording,
        durationMs:Number(session.recording?.durationMs)||0,
        size:Number(session.recording?.size)||0,
        retention:clean(session.recording?.retention),
        localOnly:session.recording?.localOnly===true
      },
      provider:{
        kind:'recording-adapter',
        confidence:session.recording?1:null,
        infrastructureFailure:!session.recording && session.failures.some(x=>x.kind==='RECORDING_PROVIDER_ERROR')
      },
      supportLevel:session.supportLevel
    });
  }

  function complete(sessionId) {
    const session=sessions.get(clean(sessionId));
    if (!session) throw new Error(`unknown oral session: ${sessionId}`);
    session.completed=true;
    session.completedAtMs=Number(clock());
    return copy(session);
  }

  function cancel(sessionId) {
    const id=clean(sessionId);
    if (!sessions.has(id)) return false;
    speechProvider.cancelRecognition?.();
    speechProvider.cancelRecording?.();
    sessions.delete(id);
    return true;
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_ORAL_SESSION_RUNTIME_V1',
    modes:ORAL_MODES,
    difficulty:ORAL_DIFFICULTY,
    capabilities:()=>copy(speechProvider.capabilities?.()||{}),
    startSession,
    getSession,
    play,
    listenEvidence,
    recognize,
    recognitionEvidence,
    startRecording,
    recordingEvidence,
    complete,
    cancel
  });
}
