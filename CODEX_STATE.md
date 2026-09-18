# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN6_GREEN_TURN7_ACTIVE`

Date: 2026-09-18
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `100b508a9ae6aa86afd2047b584cc92fa59b8d7c`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–6 are green.

- Turn 1 — baseline audit and pedagogy contract
- Turn 2 — oral-first route priority
- Turn 3 — hear-before-see warm-up
- Turn 4 — 33-letter print recognition
- Turn 5 — print ↔ cursive recognition
- Turn 6 — sound ↔ letter mapping

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 7 — Handwriting motor practice.

Turn 8 does not begin until Turn 7's own contract, validator, negative tests, runtime evidence checks, and existing Russian regression are green.

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
