# E16 · Linear Algebra advanced cluster audit & content-sync hardening

## Status

**BLOCKED by a verified repository-state defect; false PASS is prevented.**

E15 declared Chapter 7 complete and synchronized, but current `main` does not match that handoff.

## Verified repository findings

The following E15-declared stores are empty arrays on `main`: `formulas.json`, `exercises.json`, `applications.json`, `simulations.json`, `professor_qa.json`, `question_bank.json`, `review_packs.json`, `mastery-map.json`, `content-index.json`, `concept-map.json`, and `mindmap.json`.

`subject-manifest.js` also advertises zero counts for the same sidecar families.

## E16-A · Hardened recovery gate

The validator now checks both data stores and manifest counters. Minimum evidence required from the E15 handoff is: lessons 8, formulas 24, exercises 64, applications 16, simulations 16, professor Q&A 8, question bank 48, review packs 8, mastery map 8, content index 8, concept map 1, mind map 1.

It fails closed on missing files, malformed JSON, underfilled stores, missing manifest counters, or stale manifest counters.

## Recovery investigation

The canonical E15 report/payload is not present on current `main`. Code search did not locate it. Branch `codex/e150-c01-l01-clean-replacement` also has empty sidecar arrays and no E15 report. The separate `BlueDragon33/Math_Bauman` repository did not yield the canonical payload in code search. The Project file `UI môn Toán.txt` preserves counts and topic coverage but not the full structured records.

Therefore the project must not fabricate records merely to satisfy counts.

## Automatically generated recovery sequence

- **E16-B1** Locate/recover the canonical E15 generated payload or generation source.
- **E16-B2** Restore formulas/exercises/applications/simulations/Q&A/questions/review/mastery/index/maps.
- **E16-B3** Recompute and update `subject-manifest.js` counts from restored stores.
- **E16-C** Validate identity/link integrity across lessons → formulas/exercises/applications/simulations/questions/review/mastery/index.
- **E16-D** Audit prerequisite continuity across Chapters 1, 2 and 7.
- **E16-E** Regression-test Math runtime selectors and simulation routing.
- **E17** Start Chapter 8 only after E16-B…E16-E PASS.

No production deploy/publish. No merge to `main` while E16 is blocked.
