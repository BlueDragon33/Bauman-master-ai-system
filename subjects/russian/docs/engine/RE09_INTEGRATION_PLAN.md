# Russian Engine RE09 — Minimal App Integration Plan

State: **APPLIED · VALIDATING**

## Applied change

Pre-integration exact-head repository gates passed 5/5 before the allowlisted write.

Applied app write:
- `subjects/russian/index.html`
- commit: `9bf4f14655cace9623dee46eea491888eb9ad8e3`
- one module tag loads `engine/integration/browser-bootstrap.js`.

No other existing Russian App runtime file was modified by the integration step.

## Goal

Connect the Russian Engine to the existing browser runtime through the smallest possible seam.

No learner-facing redesign is part of this integration step.

## Explicit allowlist

Only one existing app file may be modified:

`subjects/russian/index.html`

Planned modification:
load

`engine/integration/browser-bootstrap.js`

as a module after the existing Russian runtime owners have been declared.

## Passive bridge behavior

The bootstrap:
- inspects current owner availability;
- adapts existing audio/ASR/recording owners;
- exposes `window.RussianEngineIntegration`;
- reports capability status.

It does NOT:
- alter UI;
- start microphone;
- start ASR;
- write learner state;
- write mastery;
- write SRS;
- write planner state;
- load all 100 levels;
- load large dialogue/vocab corpora;
- enable a new learner path.

## Why passive first

This proves the technical seam with near-zero blast radius.

A later RE09 sub-step can route one real learner experience through the Engine after browser acceptance proves the bridge is harmless.

## Rollback

Remove one module script line.

No migration rollback is required because this step changes no learner schema/state.

## Preconditions

Do not apply the allowlisted app write until:
- RE01–RE08 are PASS;
- exact-head repository CI is green;
- bootstrap contract test is PASS.

## Next after passive bridge

Once integrated and browser-validated:

`grounded listen-and-act`

will be the first learner-facing Engine slice.

That later UI change requires a separate explicit RE09 allowlist expansion.


## Offline regression found and fixed

Post-integration Russian Reference UI Gate found:

`Index runtime refs missing from offline shell: ./engine/integration/browser-bootstrap.js`

This was a valid regression signal.

Correction:
- expand RE09 existing-file allowlist to include `subjects/russian/sw.js`;
- bump shell cache to `russian-app-shell-v13-engine-js-module-mime`;
- precache `./engine/integration/browser-bootstrap.js`;
- precache its transitive module dependency `./engine/speech/legacy-speech-provider.js`.

The second file is included proactively because a module cached without its static import dependency would still fail in a true offline launch.

No UI, mastery, planner, learner-state or speech-owner implementation changed.


## Browser module MIME regression found and fixed

Whole System browser acceptance exposed:

`Failed to load module script ... MIME type application/octet-stream`

Root cause:
the repository browser-test HTTP server does not serve `.mjs` with a JavaScript module MIME type.

Correction:
- browser bootstrap is `engine/integration/browser-bootstrap.js`;
- browser speech provider dependency is `engine/speech/legacy-speech-provider.js`;
- offline shell references the `.js` modules;
- cache version is `russian-app-shell-v13-engine-js-module-mime`;
- superseded browser `.mjs` files are removed after references are migrated.

No Engine semantics, UI, learner state, mastery, planner or speech-owner behavior changes.


## RE09 PASS evidence

Exact validated HEAD: `297cfaabea853b059d8e7f4576db192d498056d4`

All required repository gates PASS on that exact HEAD:
- Whole System Integration Gate;
- Future Interface System CI;
- Universal Constitution Compliance;
- Russian Reference UI Gate;
- Prompt Control Center CI;
- Development Fast CI.

The feature-flagged grounded slice is included in source and packaged browser acceptance. Default behavior remains unchanged without `?ruEngine=grounded-v1`.

**RE09 PASS.**
