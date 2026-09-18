# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN11_GREEN_TURN12_ACTIVE`

Date: 2026-09-18
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `13a72224af3a0f34be627c8db78c29150ce2d154`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–11 are green.

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

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 12 — Direct-semantic explanation.

Turn 13 does not begin until Turn 12 defines deterministic scene/gesture/contrast/category/analogy/Russian-definition strategies and proves translation fields are not consulted.

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
