# Russian Migration Freeze — Promotion Candidate

Date: 2026-09-19  
Branch: `work/russian-listen-speak-literacy-visual-semantics`  
Canonical plan: `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

## Freeze purpose

This freeze closes the 24-turn Russian Listen/Speak/Literacy/Visual-Semantics rebuild without taking authority away from the existing learner state, Review Queue, SRS scheduler, Foundation identity or Hub bridge.

Promotion is a separate decision. This branch must not merge to `main` automatically.

## Compatibility preserved

- Primary learner storage remains `bauman_russian_survival_master_v11_clean_skeleton`.
- Existing saved-state fields `dialogueHideVi` and `practiceHideVi` remain loadable for old snapshots, but have no executable translation-toggle handler.
- Legacy Vietnamese/English fields may remain in source/editor data for migration compatibility. They are not learner-facing semantic authority for vocabulary, dialogue or AI explanation.
- Host bridge continues to emit `BAUMAN_SUBJECT_BRIDGE_V1`.
- Planning protocol remains `BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS`.
- No migration gate may call `localStorage.clear()` or silently reset existing learner progress.

## Frozen learning authority

- Vocabulary semantics: `RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1`.
- Dialogue scaffolding: `RUSSIAN_DIALOGUE_SCAFFOLD_V1`.
- AI explanation: `RUSSIAN_AI_DIRECT_EXPLANATION_V1`, read-only and direct-semantic.
- Mastery and canonical Review Queue: `RUSSIAN_LEARNING_STATE_V1`.
- Vocabulary scheduling: `RUSSIAN_VOCAB_SRS_V1`.
- Skill-gated assessment: advisory only; no cross-skill inference.
- Weakness repair: additive `RUSSIAN_WEAKNESS_REPAIR_ROUTER_V1`; resolution requires new repair evidence.
- Cursive recognition: explicit `RUSSIAN_CURSIVE_GLYPH_SHAPES_V2` vector shapes for all 33 Cyrillic letters.
- Browser speech fallback: `RUSSIAN_BROWSER_CAPABILITY_V1`.
- Offline readiness: requires verified current app shell and all required learning-data sources.

## Display policy

User-facing module identity is simply **Tiếng Nga Bauman**. Legacy build/version strings may remain as internal compatibility metadata, but display fields and UI cleanup hide them from the learner experience.

## Turn 24 promotion checks

Promotion candidate gates cover:

1. all Turns 1–23 already GREEN;
2. no open deferred obligation;
3. translation-first runtime authority removed;
4. old translation-toggle saved fields inert but compatible;
5. exact package/load-order checks retained from Turn 23;
6. bridge/storage/SRS/mastery authority unchanged;
7. direct-semantic vocabulary/dialogue/AI runtime frozen;
8. 66-glyph OFL cursive outline layer retained;
9. weakness repair remains evidence-gated;
10. browser/offline fallbacks retained;
11. no destructive local-storage reset;
12. no automatic merge to `main`.

## CI observation note

The GitHub connector available during the freeze did not expose branch-push workflow runs/status checks for the latest commits. Acceptance therefore uses the repository validators, negative-test definitions, direct source-level behavioral/package checks and existing regression wiring. A later promotion decision may additionally require an observable GitHub Actions run without changing the frozen responsibilities.
