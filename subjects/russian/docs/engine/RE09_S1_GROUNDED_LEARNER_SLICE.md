# RE09-S1 — Grounded Learner-Facing Slice

State: **PREPARED · DEFAULT OFF · NOT YET APP-ENABLED**

## Goal

Create the first learner-facing Russian Engine experience without changing the default Russian App experience.

Feature flag:

`?ruEngine=grounded-v1`

No flag = no DOM mutation from this slice.

## Learning flow

`LISTEN → SEE CONTEXT → ACT → CONSEQUENCE → RETRY/SUPPORT → TRANSFER`

The default state:
- audio first;
- no transcript;
- no Vietnamese translation;
- no grammar explanation.

## Support ladder

The browser slice follows 11 support states:
0 none
1 replay
2 visual focus
3 slower replay
4 gesture
5 semantic contrast
6 simpler Russian
7 Russian paraphrase
8 transcript
9 explicit explanation
10 native-language translation availability

The current fixture has no native-language translation payload, so the UI never invents one.

## Evidence

Evidence is:
- in-memory only in this prepared slice;
- observation-only;
- `authoritative:false`;
- `masteryMutation:false`.

It is not written into existing learner state.

## Transfer

Correct completion of the first scene exposes the next scene in the same transfer group.

This prevents the learner-facing proof from being one memorized exact item.

## UI

The slice:
- uses the existing app content host;
- uses compact neutral styling;
- does not introduce a new global design system;
- is responsive;
- contains no mascot/competitor clone;
- uses visual objects as context.

## Files

- `engine/integration/grounded-browser-model.js`
- `engine/integration/grounded-experience.js`
- `engine/tests/test-re09s1-grounded-browser-model.mjs`

## Next gate

Do not import/mount this module from `browser-bootstrap.js` until passive RE09 exact-head integration gates are green.

Then:
1. extend RE09 allowlist;
2. conditionally dynamic-import only when the feature flag is present;
3. precache the module + fixture for true offline mode;
4. run browser acceptance;
5. request human visual verification only after automated acceptance passes.
