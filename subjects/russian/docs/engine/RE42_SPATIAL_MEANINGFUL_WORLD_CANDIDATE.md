# RE42 — Spatially meaningful Russian real-life worlds (AI candidate)

State: **ENGINEERING_DRAFT · NOT_RU03_APPROVED · NOT_PUBLISHED**. Based on merged RE41 PR #308; this proposal remains isolated and noncanonical. Source revision `real-life-v1-r1` is preserved byte-for-byte.

## Purpose

Replace the broken implication that tapping a *noun icon* proves locating a **physical place**. The 15 previous items remain historical, and 15 noncanonical candidate sentences reuse the same IDs to make review comparisons easier. `real-life-spatial.r2-ai-proposal.json` is an **editorial proposal**, not a canonical dataset, default lesson or authorized spoken/audio model.

Five compact world graphs contain meaningful spatial nodes with normalized coordinates, distinct visuals and wayfinding edges: room, grocery shop, street/metro, dormitory and university. Nodes distinguish **room 12 from generic door**, **lecture room from school building**, **shower room from shower head**, **metro line diagram from payment card**, and **station entrance from being already inside the station**.

## Three fundamentally different actions

- `point-to-location`: identify a location node, not a noun symbol. Has 11 candidate scenarios.
- `handover-object`: transfer a physical thing between specified holder/recipient nodes. Has 3 candidate scenarios with familiar peers.
- `dialogue-intent`: learner as customer requests bottled water from an unfamiliar seller. Has 1 candidate scenario; it requires a speaking/dialogue layer before being scored beyond preview.

Every candidate evaluates **previewOnly**, `masteryMutation=false`, `linguisticAuthority=false`, and `canonicalPublicationReady=false`. The validator checks structural mapping, unique nodes, locations, route references, explicit register/roles, and missing draft signs; it does *not* purport to certify native Russian grammar/pragmatics.

## Next engineering stages (do not skip)

**RE43:** Render real interactive location board from data (not generic emoji), mobile/screen-reader affordances, accessible click targets and wrong-position feedback. Support Vietnamese context first, request repetition/slower audio, optional *reviewed* Vietnamese translation, active listening, word learning, and learner-chosen Russian transcript. Make choices and actions distinguishable by meaning. One scenario per screen; no dashboard clutter.

**RE44:** Branching stranger interactions (shop assistant, dorm receptionist, station staff, lecturer) with `вы`/polite request, `Здравствуйте` → request → directions → `Спасибо`, plus recovery `Повторите, пожалуйста` / `Помедленнее, пожалуйста`. Train learner both to ask and comprehend the reply; do not only require tapping.

**RE45:** Human RU03 reviews EACH exact proposal for grammar, semantics, registers, spelling, phonetic stress and native recording; record immutable revision/fingerprint-bound decisions in the actual review system. Generate fresh review packets for approved revision. AI/editor cannot approve itself. Until then no default-on, canonical promotion, learner mastery, production publish or claim that the draft Russian is verified.

Acceptance: `node subjects/russian/engine/tests/run-engine-suite.mjs`, exact-head CI and source/packaged browser/offline tests; negative cases for `комната ≠ дверь`, `схема метро ≠ карта Тройка`, `аудитория ≠ корпус`, and incorrect speaker register. Roll back draft files only; preserve original data and review queue.
