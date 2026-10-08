# RE41 — Zero-Russian A0 learner safety bridge (engineering-only)

Status: **IMPLEMENTATION_CANDIDATE / HUMAN_RU03_REVIEW_REQUIRED**  
Base: `main` at `6e312312c6161d4b37795c311653840f5139a9f7`. Scope: `subjects/russian/` only. This is NOT a Russian linguistic approval.

## Learner contract

The learner begins at **Pre-A0**, with no assumed vocabulary, Russian alphabet, grammatical knowledge, confidence using the metro, or cultural familiarity.

For each scene: Vietnamese situation orientation → optional Russian audio replay → contextual visual choice → Vietnamese help **on demand** → feedback that names exactly what skill was and was not tested → repeat with a changed situation later. Existing Russian-first audio and hidden transcript remain. Never force ten wrong answers just to access basic Vietnamese orientation. Do not display unreviewed translations as certified content.

## Phase 7 findings now protected in code

- Original 15 r1 scene sentences, review packets and fingerprints remain untouched.
- All 15 scenes are labelled **preview pending human linguistic review** in the opt-in grounded experience.
- 11 `locate-object + select-object` interactions are **icon-recognition preview only**. A successful icon selection may highlight the icon, but must not transfer it to the speaker; it must not be delivered as competence/mastery evidence to RU04.
- The other four `request-object` scenes retain their existing practice flow but are NOT certified as appropriate Russian register. User sees a review-pending notice.
- Legacy `grounded-scenes.v1.json` and default-off feature-flag behavior stay unchanged. Do not create a parallel learner record.
- Reference UI stays compact; contextual help is a user-triggered toggle, not a blocking modal.

## Subsequent build — *not satisfied by this patch*

**RE42 spatial candidate r2:** Set explicit player position, scene objects, destination targets, routes and proper `point-to-location` or `navigate-to` actions with evidence distinct from `select-object` and `transfer-object`. Replace meaningless icons with grounded illustrations (station entrance vs station, room vs door, auditorium vs university building, shower facility vs faucet, ticket vending machine vs ticket); use clear speech roles in shop/stranger/staff/dorm and distinguish `ты/вы`. Metro map `схема метро` ≠ transit card `карта «Тройка»`. Preserve r1 history; write new revision + fresh fingerprints and human review packets. This work must be checked end-to-end for map-side selection, audio, role-play, accessibility, offline, and mobile.

**RE43 learning loop:** Hear native/studio-reviewed audio → understand situation → select/point → say useful phrase → ask clarification or repetition → transfer to real-life encounter; short adaptive lessons and honest grading. Provide listen-before-read support, Cyrillic later, pronunciation contrast practice and Vietnamese explanations progressively, without requiring the learner to diagnose grammar.

**Human gate remains:** independently authorized Russian-speaking human RU03 must decide against exact r2 revision/fingerprint (grammar, pragmatic register, phonetics, audio). An AI cannot write an APPROVE or publish canonical material. Keep feature flag OPT_IN, no default-on or production claim.

## Engineering acceptance

1. All 15 fixture scenes have Pre-A0 Vietnamese scene orientation without embedded Russian sentence translations.
2. Eleven icon-only locations never produce RU04 competency evidence, and the requester is not shown as receiving a place.
3. Request-object scenario behavior and legacy browser acceptance remain intact.
4. SW precache includes the new small imported module; cache version changed for offline invalidation.
5. `node subjects/russian/engine/tests/run-engine-suite.mjs`, Russian source + packaged browser tests, and exact-head CI must pass before merge.
6. Any violation of RU03/linguistic boundary, offline break, stale review fingerprint or false mastery is a hard block; do not merge on test assertions alone.

Rollback: revert only this branch's guide, observation-safety guard, renderer wiring, and SW entry. Canonical fixtures, review packets, human decision registry, and main app pedagogy are unchanged.
