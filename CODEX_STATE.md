# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `ALL_24_TURNS_GREEN_PROMOTION_CANDIDATE_FROZEN`

Date: 2026-09-19
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Russian accepted head: `3d8ee02b75716b266ae87cd2f63388e14f27657e`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Architecture principles and ownership remain in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

Freeze compatibility is documented in:

- `subjects/russian/MIGRATION_FREEZE.md`

## Accepted status

All canonical Turns 1–24 are GREEN.

The final rebuild preserves:

- oral-first learning priority;
- print + handwriting recognition;
- sound↔letter mapping;
- handwriting motor evidence;
- listening and speaking ladders;
- 8,000-item direct-semantic visual vocabulary authority;
- reading and dictation bridges;
- translation-free dialogue scaffold;
- grammar-from-patterns;
- modality-isolated SRS/review evidence;
- six independent advisory skill gates;
- Russian-first direct-semantic AI help;
- evidence-gated weakness repair;
- truthful offline readiness;
- browser/accessibility/responsive/performance gates;
- 66 distinct uppercase/lowercase Cyrillic handwriting outlines for 33 pairs;
- migration/storage/bridge compatibility.

## Important Turn 23 correction

The first explicit cursive renderer used one hand-authored path per letter pair and only transformed it for uppercase/lowercase. Final QA correctly rejected that as pedagogically unsafe.

The accepted renderer is now:

- `RUSSIAN_CURSIVE_GLYPH_SHAPES_V2`;
- 33 uppercase + 33 lowercase outlines;
- every upper/lower pair has a distinct path;
- outlines are derived from an OFL Cyrillic handwriting source;
- provenance and license are stored beside the runtime;
- no font binary is bundled;
- no installed OS handwriting font is required.

Deferred obligation `RUS-CURSIVE-VISUAL-001` is CLOSED.

## Frozen compatibility

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- `BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS`;
- primary learner storage key `bauman_russian_survival_master_v11_clean_skeleton`;
- canonical Learning State mastery/Review Queue ownership;
- Vocab SRS scheduling ownership;
- Foundation identity authority;
- Hub/Device Access boundaries.

Legacy translation fields may remain in source/editor data and old saved-state snapshots for compatibility, but they have no learner-facing semantic authority.

## Promotion policy

This branch is a promotion candidate only.

Do not merge to `main` automatically. A separate explicit promotion decision is required.

The available GitHub connector did not expose branch-push workflow runs/status checks for the latest commits. Source-level validators, negative-test definitions, package/load-order checks and regression wiring are accepted; an observable GitHub Actions run may be required by a later explicit promotion decision.
