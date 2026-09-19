# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `ALL_24_TURNS_GREEN_PROMOTION_CANDIDATE_FROZEN`

Date: 2026-09-19
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Russian accepted head: `90e797c6dda4c42bddea71fb0ad14316c82f67ce`

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

Observable GitHub Actions evidence is now available. Workflow run `35416011837` completed successfully on commit `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`: both `russian-learning-contract` and `russian-existing-regression` passed. Later documentation-only commits must preserve the same gates before any explicit promotion decision.

## Post-freeze defect fixes

The frozen candidate was re-audited after Turn 24 and two defects were found inside existing responsibilities, so no Turn 25 was created:

- Turn 23.8: modal accessibility lifecycle now sets `aria-hidden=false` on open, restores `true` on close, moves focus into the dialog and restores the opener. Browser QA, migration freeze and promotion gates all enforce this.
- Turn 24.7: versioned learner-facing fallback labels were removed directly from `subject-adapter.js` and `core.js`; the UI no longer relies only on cleanup overrides to hide legacy build labels.
- Turn 24.8: post-freeze source validation confirms the new assertions are wired into negative/promotion gates.

All canonical Turns 1–24 remain GREEN after these fixes.


## Post-freeze hardening

The frozen candidate was re-audited after Turn 24 acceptance.

Fixed inside existing Turn 24 responsibility:

- added `tests/russian-promotion-freeze.test.mjs` with 14 explicit negative cases and wired it into CI;
- removed stale learner guidance `V ẩn/hiện nghĩa`;
- removed unused translation-era helpers from `core.js` so Vietnamese/English legacy semantic helpers cannot be accidentally reconnected;
- preserved `dialogueHideVi` and `practiceHideVi` only as inert saved-state compatibility fields;
- folded the hardening into canonical Turn 24.5/24.8 rather than creating a duplicate substep or unjustified Turn 25.

The promotion candidate remains frozen and must not merge to `main` without an explicit promotion decision.


## Post-freeze gate-regression repair — 2026-09-19

A full branch-push audit exposed stale/over-broad gate logic inside already-owned responsibilities. No Turn 25 was created.

- Turn 8.1: corrected the listening tokenizer validator and negative mutation to match the real whitespace tokenizer.
- Turn 18.1: narrowed multimodal authority-token detection to executable references while preserving strict scheduler/mastery isolation.
- Turn 21.7: aligned the opened-state assertion with the real repair lifecycle and added a dedicated negative case.
- Turn 22.7: separated asset-runtime existence from the required `missing_visual_asset` fallback invariant.
- Turn 23.9: hardened Browser/Package negative tests for all 760px breakpoints and made load-order diagnostics precede shell-inventory masking.
- Turn 24.9: hardened the promotion-freeze bridge negative case across both READY and PROGRESS contract markers.

Accepted executable checkpoint before this documentation update:

- commit: `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`
- workflow: `35416011837`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen. Do not merge to `main` automatically.
