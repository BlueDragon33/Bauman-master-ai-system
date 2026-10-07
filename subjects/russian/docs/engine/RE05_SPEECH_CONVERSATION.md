# Russian Engine RE05 — Existing Speech Adapter & Conversation Runtime

State: **PASS**

## Core decision

Russian Engine does NOT create a second browser speech engine.

It adapts these existing owners:
- `window.RussianAudioEngine`;
- `window.RussianSpeechRecognitionAdapter`;
- `window.RussianRecordingEngine`.

Adapter policy:

`ADAPT_EXISTING_DO_NOT_DUPLICATE`

## Speech capability contract

The adapter reports:
- TTS/audio support;
- ASR support state;
- recording support state;
- privacy/retention;
- explicit limitations.

It does not hide browser/provider uncertainty.

## Pronunciation honesty

ASR output is recorded only as:

`speech-recognition-observation`

The evidence says explicitly:

`NO_PRONUNCIATION_MASTERY_CLAIM`

Raw ASR confidence is labeled:

`PROVIDER_RECOGNITION_CONFIDENCE_ONLY`

No phoneme/stress/intonation mastery is inferred from transcript confidence.

## Recording

Existing MediaRecorder remains owner.

Engine adapter preserves:
- transient local recording;
- no upload by adapter;
- explicit recording metadata;
- non-authoritative observation evidence.

## Conversation

RE05 adds a small deterministic scenario session runtime that consumes existing scenario definitions.

It owns only transient session state:
- current node;
- turn;
- repair used;
- completion;
- event list.

It does not own canonical scenario truth and does not write mastery/SRS/planner state.

## Repair

A repair strategy must be declared by the current scenario node.

Using an allowed strategy emits:
`scenario.repair.used`

Reaching completion emits:
`scenario.goal.completed`

These are observable events, not mastery decisions.

## Integration

No current Russian app file is modified.

RE09 remains required before wiring the adapter/facade into browser UI.

## Validation

Executed against the branch implementation: **15/15 checks PASS**.

Verified:
- existing speech owners are adapted, not duplicated;
- Russian playback forces `ru-RU`;
- ASR result remains non-authoritative;
- provider confidence is labeled recognition-only;
- no pronunciation mastery claim is emitted;
- recording remains transient/local;
- deterministic scenario repair works;
- goal completion emits an observation event only.

## Exit

**RE05 PASS.**
