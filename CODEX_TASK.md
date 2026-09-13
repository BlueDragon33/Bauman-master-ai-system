# CODEX_TASK

Task: `THEORY_C01_L06_SLIDESHOW_RUNTIME_IMPORT_PASS_13`
Mode: academic-slideshow-and-import-candidate-only, no durable runtime merge.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/data/theory_core/theory_core_c01_l06.json`
3. `subjects/math/data/theory_reference/theory_reference_c01_l06.json`
4. `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`
5. `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`
6. `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`
7. `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`
8. `subjects/math/data/theory_case/theory_case_c01_l06.json`
9. `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`
10. `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`
11. `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`
12. `subjects/math/data/theory_slideshow/theory_slideshow_c01_l05.json` only as structural precedent.
13. `subjects/math/data/theory_integration/theory_lecture_content_c01_l05_import.json` only as structural precedent.

## Goal
Create two Pass 13 candidate artifacts:

1. `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json`
   - schema: `bauman_math_theory_slideshow_v1`
   - version: `SLIDESHOW_C01_L06_V1_PASS13`

2. `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`
   - package type: `bauman.math.theory_lecture_content.merge`
   - target: `theory_lecture_content`
   - mode: `merge`
   - academic status: pending Pass 14 acceptance
   - `runtimeMergeAllowed: false`

## Slide-count policy
- Minimum `16` source slides.
- No maximum.
- Sixteen is a minimum structural threshold, not a target ceiling.
- Do not merge or compress accepted learning beats merely to reach a count.
- Preserve one source slide to one runtime-import slide.
- If 20–24 slides better preserve the 22 core learning beats and Full View reading flow, use the larger count.

## Slideshow contract
- Presentation data only; runtime independent.
- Add no new mathematics, policy, case value or diagnostic conclusion.
- One primary learning beat per slide.
- Every slide must contain:
  - unique stable source slide ID;
  - role;
  - title;
  - purpose;
  - core message;
  - source trace.
- Where relevant also include:
  - formula references with meaning/conditions already locked by Pass 12;
  - semantic diagram specifications only;
  - misconception intercepts;
  - retrieval checks;
  - transition to the next learning beat.
- Diagrams are semantic specifications, not CSS/canvas/JS implementation instructions.
- Do not create a new slideshow engine.

## Required narrative coverage
The slide arc must cover, without compression:
1. governing question: numeric rectangle vs semantic data contract;
2. equal-shape compatibility failure;
3. canonical `X in R^(m x n)` assembly;
4. meaning of entry, row and column;
5. slicing/block extraction with metadata;
6. transpose and row/column observation convention translation;
7. NumPy 1D `.T` trap;
8. stack/vstack versus column_stack;
9. `Xw` and feature-order interface;
10. feature Gram `X^T X`;
11. observation Gram `X X^T`;
12. locked mean `mu`;
13. feature-wise centering and zero-mean invariant;
14. centering versus scaling/standardization/vector normalization;
15. fit/transform reuse and leakage/interface-drift boundary;
16. sample covariance F16 assumption gate;
17. algebraic rank bound and numerical-rank boundary;
18. SVD/PCA/retained-dimension boundary;
19. locked UGV extraction and metadata case;
20. negative variants and troubleshooting;
21. code/contract audit mindset;
22. mastery close and downstream bridge.

## Locked case evidence
Preserve exactly:
- case/version: `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED`;
- shape: `8 x 6`, observations as rows;
- feature order: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`;
- units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`;
- observation IDs: `UGV-W01–UGV-W08`;
- timestamps: 250 ms sequence from `2026-07-09T10:00:00.000Z` through `2026-07-09T10:00:01.750Z`;
- mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`;
- extraction: `X_raw[2,4]=0.08 rad/s`, UGV-W03 yaw_rate;
- locked raw/centred/covariance-preview values only when copied from the case artifact.

Do not invent:
- scale vector;
- numerical-rank tolerance or numerical rank;
- SVD singular values or PCA components;
- retained dimension/energy choice;
- anomaly threshold;
- physical mode count;
- fault label or diagnosis.

## Traceability
- Preserve `LO1–LO9`.
- Preserve `C01–C24`.
- Preserve `F01–F18` and their status classes.
- Preserve `M01–M18`.
- Preserve `T01–T40` terminology identity.
- Every source slide must trace to accepted source artifacts.

## Import candidate contract
- Map every source slide `SLxx` to exactly one runtime-import slide.
- Runtime slide IDs must be stable and lesson-scoped, e.g. `MATH-VN-C01-L06-S01`.
- Keep source slide IDs in `sourceSlideIds`.
- Use import-safe blocks only: text, formula, QA/check, comparison/condition/warning as supported by the existing E129 import contract.
- Do not move semantic diagram specs into unsupported runtime blocks; keep them in slideshow source metadata.
- Record source versions in `integrationMeta`.
- Record source and runtime slide counts; counts must match.
- `compression: false`.
- `mergeBlockedUntil: PASS_14_ACADEMIC_ACCEPTANCE`.
- `runtimeMergeAllowed: false`.

## Runtime protection
Do not change:
- durable `theory_lecture_content` records;
- `subjects/math/index.html`;
- runtime readers;
- manifest;
- CSS or JavaScript;
- Reader Pro;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when:
- slideshow and import candidate both exist and parse;
- source slide count is at least 16 and runtime import slide count is identical;
- source-to-runtime mapping is one-to-one with no duplicate IDs;
- no accepted learning beat is compressed away;
- formula/claim/misconception/terminology traceability is complete;
- locked UGV values remain unchanged;
- no deferred scale/rank/SVD/PCA/diagnosis result is invented;
- durable runtime files modified: `false`;
- status becomes `PASS_13_SLIDESHOW_RUNTIME_IMPORT_COMPLETE`;
- next task becomes `THEORY_C01_L06_ACADEMIC_ACCEPTANCE_PASS_14`.
