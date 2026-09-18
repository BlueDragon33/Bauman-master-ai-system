# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN19_GREEN_TURN20_ACTIVE`

Date: 2026-09-18
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `c412b76c7332bdb106af1d89241e4d289bdad8e9`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Do not independently redefine turn status in other documents.

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–19 are green.

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

Turn 18 includes behavioral runtime acceptance proving modality evidence isolation and preservation of Core, SRS and canonical Learning State authority.

Turn 19 adds six independent, read-only readiness gates for listening, speaking, print recognition, cursive recognition, reading and writing. Aggregate readiness is advisory only and becomes ready only when every gate meets its explicit evidence threshold.

Turn 5 retains one explicit deferred obligation: browser-level visual proof that the packaged cursive glyph differs from print. This is tracked for Turn 23 and blocks Turn 24 freeze if still open.

## Next turn

Turn 20 — AI mentor direct explanation.

## Turn 20 upgrade stop point

Current AI Mentor runtime is not compatible with the direct-semantic policy already accepted in Turns 10–13:

- `core.js::aiGenerate('lesson')` instructs the learner to restate the lesson in Vietnamese;
- `core.js::aiGenerate('vocab')` still contains learner-facing fallback references to `meaningVi` and `english`;
- the vocabulary AI output still exposes an explicit `English equivalent` field;
- dialogue guidance still treats hiding Vietnamese meaning as a later-round option rather than the default semantic rule;
- `ai-mentor-guard.js` currently protects canonical/mastery authority but does not enforce Russian-first / visual-context-first explanation order.

This requires a new Turn 20 explanation-policy contract, negative tests and runtime migration. It is an architecture/capability upgrade, not a local defect fix.

## Protected authority

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- existing Russian learner-state authority;
- saved progress/state;
- Hub and Device Access boundaries;
- Foundation registry authority;
- Academic scheduler authority.

Subject-local drills and AI help may read evidence and suggest actions but must not silently promote mastery or completion.

## Branch policy

Do not merge to `main` without an explicit promotion decision.
