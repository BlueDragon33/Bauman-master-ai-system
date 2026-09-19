# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN20_GREEN_TURN21_ACTIVE`

Date: 2026-09-19
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `7948278d3d33d2e53c33afc4dac6e8a92648fd4f`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–20 are green.

- Turn 1 — baseline audit and pedagogy contract
- Turn 2 — oral-first route priority
- Turn 3 — hear-before-see warm-up
- Turn 4 — 33-letter print recognition
- Turn 5 — print ↔ cursive recognition
- Turn 6 — sound ↔ letter mapping
- Turn 7 — handwriting motor practice
- Turn 8 — listening ladder
- Turn 9 — speaking & shadowing ladder
- Turn 10 — visual vocabulary contract
- Turn 11 — visual asset coverage
- Turn 12 — direct-semantic explanation
- Turn 13 — visual vocabulary runtime
- Turn 14 — reading bridge
- Turn 15 — dictation & listen-to-write
- Turn 16 — translation-free dialogue scaffolding
- Turn 17 — grammar from patterns
- Turn 18 — multimodal SRS & review
- Turn 19 — skill-gated assessment
- Turn 20 — AI mentor direct explanation

Turn 18 includes behavioral runtime acceptance proving modality evidence isolation and preservation of Core, SRS and canonical Learning State authority.

Turn 19 adds six independent, read-only readiness gates for listening, speaking, print recognition, cursive recognition, reading and writing. Aggregate readiness is advisory only and becomes ready only when every gate meets its explicit evidence threshold.

Turn 20 moves AI Mentor to a Russian-first direct-semantic explanation runtime. Visual/scene and Russian context precede optional meta-language help; Vietnamese/English meaning fallback is blocked. AI remains read-only for canonical state, mastery, Review Queue and scheduling. The AI guard also now reads the real `RussianVocabSrs.get()` API instead of the previous nonexistent `RussianVocabSRS.context()` path.

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 21 — Weakness repair routing.

## Turn 21 upgrade stop point

The current system has multiple weakness/evidence sources but no unified repair-routing authority:

- exam remediation is built only from wrong exam questions in `core.js::createRemedialPlan()`;
- clicking a current remedial card marks it complete immediately before any repair evidence is produced;
- pronunciation flags enter the canonical Review Queue through Speaking Coach but are not represented in the exam remedial plan;
- `deepSpeakingProgress.weak` is a separate weakness bucket;
- Listening Ladder detail misses, Cyrillic recognition errors, Reading Bridge evidence, Dictation errors and multimodal review ratings are not normalized into one repair signal model;
- Turn 19 skill-gate blockers are read-only readiness signals and currently have no focused route mapping.

Turn 21 therefore needs a new additive weakness-signal and repair-routing layer. It must consume existing evidence read-only, normalize signals, map each signal to a focused learning route, and only close a repair item after new repair evidence exists. It must not mutate mastery/completion or take scheduler/Review Queue authority.

This is an architecture/capability upgrade, not a local defect fix.

## Protected authority

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- existing Russian learner-state authority;
- saved progress/state;
- Hub and Device Access boundaries;
- Foundation registry authority;
- Academic scheduler authority;
- Turn 18 SRS/Review Queue authority boundaries;
- Turn 19 advisory skill-gate semantics;
- Turn 20 AI read-only direct-semantic policy.

Subject-local repair routing may derive and store additive repair state, but must not silently promote mastery or completion.

## Branch policy

Do not merge to `main` without an explicit promotion decision.
