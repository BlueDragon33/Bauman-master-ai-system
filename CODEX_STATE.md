# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN18_GREEN_TURN19_ACTIVE`

Date: 2026-09-18
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `331b60a1d2e6dd9d7ccfd6f3bb9d2d8995780005`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–18 are green.

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

Turn 18 includes behavioral runtime acceptance proving evidence isolation and preservation of Core, SRS and canonical Learning State authority.

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 19 — Skill-gated assessment.

Aggregate readiness must not become green until the separately required Russian skills are individually evidenced. Turn 19 must remain assessment/readiness logic only and must not take mastery, scheduler, or learner-state mutation authority.

## Protected authority

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- existing Russian learner-state authority;
- saved progress/state;
- Hub and Device Access boundaries;
- Foundation registry authority;
- Academic scheduler authority.

Subject-local drills may store additive evidence but must not silently promote mastery.

## Branch policy

Do not merge to `main` without an explicit promotion decision.
