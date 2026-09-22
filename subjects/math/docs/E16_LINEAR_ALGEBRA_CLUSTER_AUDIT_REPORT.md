# E16 · Linear Algebra advanced cluster audit & content-sync hardening

## Status

**BLOCKED by a real repository-state defect; false PASS is now prevented.**

This iteration follows the internal E15 handoff that declared Chapter 7 (covariance, correlation, PCA introduction) complete and synchronized across the Math content stores.

## Repository findings on current main

The following E15-declared output stores are present on `main`, but several are still serialized as empty JSON arrays (`[]`, 2 bytes):

- `applications.json`
- `simulations.json`
- `professor_qa.json`
- `question_bank.json`
- `review_packs.json`
- `mastery-map.json`
- `content-index.json`
- `concept-map.json`
- `mindmap.json`

This contradicts the E15 handoff counts and means an E16 cluster audit cannot legitimately PASS from repository evidence yet.

## E16-A · Automatically generated recovery step

Added `scripts/validate-math-content-sync-e16.mjs`.

The gate is fail-closed and requires at least:

| Store | Minimum |
|---|---:|
| applications | 16 |
| simulations | 16 |
| professor Q&A | 8 |
| question bank | 48 |
| review packs | 8 |
| mastery map | 8 |
| content index | 8 |
| concept map | 1 |
| mind map | 1 |

The validator also fails on missing files or malformed JSON.

## Why the data itself was not auto-filled

The canonical `lessons.json` on `main` is roughly 7.8 MB and could not be read through the current connector as line-scoped content. The internal E15 handoff provides counts and topic coverage but not the complete structured records needed to reconstruct all synchronized stores without inventing content.

Therefore this iteration deliberately does **not** fabricate placeholder application/question/simulation records merely to satisfy counts.

## Gate policy

1. E15 repository synchronization must be restored from the canonical generated payload/source.
2. Run `node scripts/validate-math-content-sync-e16.mjs`.
3. Only after the gate is PASS may E16 continue with the cross-chapter audit for Chapters 1, 2 and 7.
4. Only after that audit is PASS may the project start Chapter 8 (introductory time series).

## Next automatically generated sub-steps

- **E16-B** Restore/materialize the E15 sidecar stores from canonical source.
- **E16-C** Validate object identity/link integrity across lessons → formulas/exercises/applications/simulations/questions/review/mastery/index.
- **E16-D** Cross-chapter prerequisite audit for Chapters 1, 2 and 7.
- **E16-E** Regression check of Math runtime selectors and simulation routing.
- **E17** Start Chapter 8 only when E16-B…E16-E are PASS.

No production deploy/publish. No direct merge to `main`.
