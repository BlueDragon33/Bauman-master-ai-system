# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN17_GREEN_TURN18_ACTIVE`

Date: 2026-09-18
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `2d6ab7e2873bfede63c3c26c659813c71a485d00`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–17 are green.

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

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 18 — Multimodal SRS & review.

Turn 19 does not begin until review evidence can represent audio, visual, recognition, speaking, and writing modalities without taking scheduler or mastery authority.

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
