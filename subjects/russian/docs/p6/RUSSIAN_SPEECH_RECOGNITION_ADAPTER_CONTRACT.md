# Russian P6 Speech Recognition Adapter Contract

Canonical owner: `RussianSpeechRecognitionAdapter`.

Support states: SUPPORTED / PARTIAL / UNSUPPORTED / PERMISSION_BLOCKED / RUNTIME_ERROR.

The adapter owns capability detection, one active recognition instance, language, interim/final configuration, timeout, stop/cancel and browser errors. UI/core callers receive transcript + provider confidence when available.

Recognition transcript is not speech truth. It may support keyword/completeness/transcript similarity but cannot independently prove phonetics, stress, intonation, naturalness or mastery. Core stores ASR results as `signalOnly:true`, `confidence:'LIMITED'`, `authoritative:false`.
