# Russian P6 Listening · Speaking · Audio Engine Constitution

Phase: **P6 — Listening · Speaking · Audio Interaction Engine**

## Mission
Make audio, recording, recognition, dialogue and Deep Speaking truthful, recoverable and single-owner without redefining P4 mastery or P5 priority.

## Canonical split
- `RussianAudioEngine`: browser TTS and local/external audio playback adapter.
- `RussianSpeechRecognitionAdapter`: the only browser SpeechRecognition owner.
- `RussianRecordingEngine`: the only MediaRecorder/getUserMedia owner.
- `core.js`: dialogue/task orchestration and transient ASR similarity signal calculation.
- `speaking-coach.js`: learner-facing practice workflow, repair flags and local-recording controls.
- P4 remains mastery/evidence authority.
- P5 remains adaptive-priority authority.

## Truth rules
Playback never writes mastery. Recording never writes mastery. ASR transcript similarity is a limited signal and never auto-passes a speaking item. Explicit learner self-confirmation is practice evidence, not official mastery unless a P4 assessment policy explicitly consumes it.

## Fallback
Mic denied/unavailable, ASR unavailable, offline audio miss or recording failure must leave a usable learning path through listening, transcript/text support, self-comparison, typed response or manual confirmation.

## Data/performance
Large dialogue and Deep Speaking data stay lazy. Voice blobs are transient and local by default. No voice upload is performed by P6.
