# Russian Engine RE05 — Speech Provider Adapter & Oral Runtime

State: VALIDATING

## Purpose

Reuse the existing Russian speech owners without creating a duplicate engine.

Existing owners remain:
- `window.RussianAudioEngine`
- `window.RussianSpeechRecognitionAdapter`
- `window.RussianRecordingEngine`

RE05 adds an Engine-side adapter contract only.

## Provider boundary

`legacy-speech-provider.mjs` can wrap the three existing owners.

The provider exposes:
- capability status;
- Russian audio playback/TTS;
- ASR transcript signal;
- transient local recording;
- stop/cancel/cleanup.

It explicitly advertises:

`pronunciationPrecision = NOT_PROVIDED_BY_PLAIN_ASR`

## ASR honesty

ASR returns:
- transcript;
- raw provider confidence.

It does NOT return authoritative:
- pronunciation judgment;
- stress judgment;
- mastery.

Every ASR signal carries:
- `pronunciationAuthority:false`
- `stressAuthority:false`

## Recording privacy

The adapter preserves current recording semantics:
- transient local;
- no silent remote upload;
- explicit local recording result;
- cleanup remains available.

## Oral session runtime

The Engine can now model:
- listen;
- listen slow;
- shadow;
- repeat;
- memory;
- guided answer;
- roleplay;
- free response.

Difficulty supports the future ladder:
isolated/careful
→ clear native
→ normal native
→ connected speech
→ alternate speaker
→ reduced predictability
→ noise/interruption
→ multi-speaker
→ open spontaneous response.

## Evidence

RE05 emits observation evidence only:
- oral exposure;
- ASR transcript signal;
- local recording captured.

Infrastructure failure is recorded separately from learner behavior.

Provider failure never becomes automatic learner failure.

## Scenario boundary

`scenario-port.mjs` defines a conversation/scenario integration seam.

It does not own canonical scenario state.

It can adapt the existing RU05 scenario owner later.

The port explicitly rejects a scenario adapter attempting to return `masteryGranted=true`.

## App integration

No current Russian App file is modified.

The browser-specific helper can construct the provider from current global owners when RE09 later authorizes integration.

## Files

- `subjects/russian/engine/speech/legacy-speech-provider.mjs`
- `subjects/russian/engine/speech/oral-session-runtime.mjs`
- `subjects/russian/engine/speech/scenario-port.mjs`
- `subjects/russian/engine/tests/test-re05-speech-adapter.mjs`

## Exit gate

RE05 speech foundation PASS requires proof that:
- existing owners are adapted, not duplicated;
- TTS/source audio route through provider;
- ASR remains a noisy transcript signal;
- plain ASR cannot claim pronunciation/stress authority;
- local recording remains transient/local;
- provider failure is separated from learner evidence;
- scenario integration cannot grant mastery;
- no general Russian App modification is required.
