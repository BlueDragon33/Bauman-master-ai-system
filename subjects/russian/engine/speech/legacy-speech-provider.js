const clean = value => String(value ?? '').trim();
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const SPEECH_PROVIDER_STATUS = Object.freeze({
  READY: 'READY',
  PARTIAL: 'PARTIAL',
  UNAVAILABLE: 'UNAVAILABLE',
  PERMISSION_BLOCKED: 'PERMISSION_BLOCKED',
  ERROR: 'ERROR'
});

function normalizeRecognitionStatus(status) {
  const value = clean(status);
  if (value === 'SUPPORTED') return SPEECH_PROVIDER_STATUS.READY;
  if (value === 'PARTIAL') return SPEECH_PROVIDER_STATUS.PARTIAL;
  if (value === 'PERMISSION_BLOCKED') return SPEECH_PROVIDER_STATUS.PERMISSION_BLOCKED;
  if (value === 'RUNTIME_ERROR') return SPEECH_PROVIDER_STATUS.ERROR;
  return SPEECH_PROVIDER_STATUS.UNAVAILABLE;
}

function normalizeRecorderStatus(status) {
  const support = clean(status?.support);
  const micState = clean(status?.micState);
  if (micState === 'DENIED') return SPEECH_PROVIDER_STATUS.PERMISSION_BLOCKED;
  if (micState === 'ERROR') return SPEECH_PROVIDER_STATUS.ERROR;
  if (support === 'SUPPORTED') return SPEECH_PROVIDER_STATUS.READY;
  if (support === 'PARTIAL') return SPEECH_PROVIDER_STATUS.PARTIAL;
  return SPEECH_PROVIDER_STATUS.UNAVAILABLE;
}

export function createLegacySpeechProvider({
  audio,
  recognition,
  recording
}={}) {
  if (!audio || !recognition || !recording) {
    throw new TypeError('audio, recognition and recording owners are required');
  }

  return Object.freeze({
    schema: 'RUSSIAN_ENGINE_LEGACY_SPEECH_PROVIDER_V1',

    capabilities() {
      const audioSupport = audio.support?.() || {};
      const recognitionState = normalizeRecognitionStatus(recognition.support?.());
      const recordingState = normalizeRecorderStatus(recording.status?.() || {support:recording.support?.()});
      return copy({
        audio: {
          tts: audioSupport.tts === true,
          htmlAudio: audioSupport.htmlAudio === true
        },
        recognition: recognitionState,
        recording: recordingState,
        pronunciationPrecision: 'NOT_PROVIDED_BY_PLAIN_ASR',
        remoteRequired: false
      });
    },

    playStimulus(stimulus={}, handlers={}) {
      const source = clean(stimulus.audioSource);
      const text = clean(stimulus.audioText);
      const rate = Number(stimulus.rate) || 1;
      if (source && typeof audio.playSource === 'function') {
        return audio.playSource(source, {
          rate,
          sourceType: clean(stimulus.sourceType) || 'SOURCE_AUDIO',
          onEnd: handlers.onEnd,
          onError: handlers.onError
        });
      }
      if (text && typeof audio.speak === 'function') {
        return audio.speak(text, {
          lang: 'ru-RU',
          rate,
          onStart: handlers.onStart,
          onEnd: handlers.onEnd,
          onError: handlers.onError,
          onUnavailable: handlers.onUnavailable
        });
      }
      return {started:false,sourceType:'NONE',reason:'missing-stimulus'};
    },

    recognize(options={}) {
      return recognition.start?.({
        lang: 'ru-RU',
        timeoutMs: options.timeoutMs,
        onResult: result => options.onSignal?.({
          kind: 'ASR_TRANSCRIPT_SIGNAL',
          transcript: clean(result?.transcript),
          rawConfidence: Number.isFinite(Number(result?.rawConfidence)) ? Number(result.rawConfidence) : null,
          pronunciationAuthority: false,
          stressAuthority: false,
          source: 'RussianSpeechRecognitionAdapter'
        }),
        onUnsupported: result => options.onUnavailable?.({
          status: SPEECH_PROVIDER_STATUS.UNAVAILABLE,
          detail: copy(result)
        }),
        onError: result => options.onError?.({
          status: normalizeRecognitionStatus(result?.support),
          detail: copy(result)
        }),
        onEnd: options.onEnd
      }) || {started:false,support:'UNAVAILABLE'};
    },

    stopRecognition() {
      return recognition.stop?.() === true;
    },

    cancelRecognition() {
      return recognition.cancel?.() === true;
    },

    async startRecording(options={}) {
      const result = await recording.start?.({
        maxDurationMs: options.maxDurationMs,
        onStop: row => options.onStop?.({
          sessionId: clean(row?.sessionId),
          createdAt: clean(row?.createdAt),
          durationMs: Number(row?.durationMs) || 0,
          mimeType: clean(row?.mimeType),
          size: Number(row?.size) || 0,
          url: clean(row?.url),
          retention: clean(row?.retention) || 'TRANSIENT_LOCAL',
          localOnly: true
        }),
        onError: error => options.onError?.({
          status: SPEECH_PROVIDER_STATUS.ERROR,
          name: clean(error?.name),
          message: clean(error?.message)
        }),
        onStatus: status => options.onStatus?.(copy(status))
      });
      return copy(result || {started:false});
    },

    stopRecording() {
      return recording.stop?.() === true;
    },

    cancelRecording() {
      return recording.cancel?.() === true;
    },

    clearRecording() {
      return recording.clear?.() === true;
    },

    recordingStatus() {
      return copy(recording.status?.() || {});
    },

    getLastRecording() {
      const row = recording.getLastRecording?.();
      if (!row) return null;
      return {
        sessionId: clean(row.sessionId),
        createdAt: clean(row.createdAt),
        durationMs: Number(row.durationMs) || 0,
        mimeType: clean(row.mimeType),
        size: Number(row.size) || 0,
        url: clean(row.url),
        retention: clean(row.retention) || 'TRANSIENT_LOCAL',
        localOnly: true
      };
    }
  });
}

export function createBrowserLegacySpeechProvider(windowLike=globalThis?.window) {
  if (!windowLike) throw new Error('browser window is unavailable');
  return createLegacySpeechProvider({
    audio: windowLike.RussianAudioEngine,
    recognition: windowLike.RussianSpeechRecognitionAdapter,
    recording: windowLike.RussianRecordingEngine
  });
}
