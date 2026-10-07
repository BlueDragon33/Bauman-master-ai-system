# Russian Engine RE09 — Minimal App Integration Plan

State: **APPLIED · VALIDATING**

## Applied change

Pre-integration exact-head repository gates passed 5/5 before the allowlisted write.

Applied app write:
- `subjects/russian/index.html`
- commit: `9bf4f14655cace9623dee46eea491888eb9ad8e3`
- one module tag loads `engine/integration/browser-bootstrap.mjs`.

No other existing Russian App runtime file was modified by the integration step.

## Goal

Connect the Russian Engine to the existing browser runtime through the smallest possible seam.

No learner-facing redesign is part of this integration step.

## Explicit allowlist

Only one existing app file may be modified:

`subjects/russian/index.html`

Planned modification:
load

`engine/integration/browser-bootstrap.mjs`

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

`Index runtime refs missing from offline shell: ./engine/integration/browser-bootstrap.mjs`

This was a valid regression signal.

Correction:
- expand RE09 existing-file allowlist to include `subjects/russian/sw.js`;
- bump shell cache to `russian-app-shell-v12-engine-passive-bridge`;
- precache `./engine/integration/browser-bootstrap.mjs`;
- precache its transitive module dependency `./engine/speech/legacy-speech-provider.mjs`.

The second file is included proactively because a module cached without its static import dependency would still fail in a true offline launch.

No UI, mastery, planner, learner-state or speech-owner implementation changed.
