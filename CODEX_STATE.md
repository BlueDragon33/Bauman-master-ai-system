# CODEX_STATE

Current task: `THEORY_C01_L06_MISCONCEPTION_MAP_PASS_06`

Status: `PASS_05_ENGINEERING_CASE_VERIFIED`

Date: 2026-07-09
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it materially improves a deep multi-file refactor, broad dependency analysis or unavailable complex automation.
- If Codex is required, create one new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.

## Protected constraints
- Minimum 16 slides, with no maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Preserve one source slide to one runtime slide.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## §1.4 accepted baseline
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Academic workflow: `14/14` complete.
- Runtime workflow: `6/6` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.
- Historical Chromium report commit: `918daa85f0bf2af28f798dd5a669dea8f23ee460`.

## §1.5 accepted package

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Final status:
- academic passes: `14/14`;
- runtime passes: `5/5`;
- browser QA: `PASS_CURRENT_HEAD`;
- source slides: `22`;
- runtime slides: `22`;
- compression: `false`;
- final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`.

Accepted reports and artifacts:
- academic acceptance: `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json`;
- runtime Pass 15: `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json`;
- runtime Pass 16: `subjects/math/THEORY_C01_L05_RUNTIME_PASS16.json`;
- runtime Pass 17: `subjects/math/THEORY_C01_L05_RUNTIME_PASS17.json`;
- runtime Pass 18: `subjects/math/THEORY_C01_L05_RUNTIME_PASS18.json`;
- current-head Chromium acceptance: `subjects/math/THEORY_C01_L05_RUNTIME_PASS19.json`.

Runtime acceptance details:
- merge commit: `6d5883619899227d51cd945cf906cc3ddc37c134`;
- tested runtime head: `cb328018e2221d5a5d3650d8ef753e0ca173016e`;
- E242 repair: `58bab8bd2e131b8250f01a83eb6b611afa0fd2f0`;
- E245 authoritative route: `8792f6350247a6cbb08b23e13ee4c4dcb248c5d1`;
- E245 index load order: `3f9a0af0fd0af7e81330cae7b18649daa7348f34`;
- evidence artifact: `lesson-1-5-pass19-revalidation-v4`;
- §1.4 and §1.5 verified: `22/22` slides each;
- missing required richness markers: `0`;
- stale richness markers: `0`;
- cross-lesson identity leaks: `0`;
- unregistered §1.6 inherited controls/richness: `0`;
- console errors, page errors, local HTTP errors and route ghosts: `0`;
- E235 preserved; E236/E237/E238 disabled.

## §1.6 academic workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Lesson title:
`§1.6 · Từ vector sang ma trận dữ liệu`

Progress:
- academic passes complete: `5/14`;
- academic passes remaining: `9/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files:
  - `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.md`;
  - `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.json`.
- Durable record: index `5` of `18`.
- Current runtime slides: `16`.
- Current slide IDs: absent in all `16` baseline slides.
- Current content blocks: `36` text, `18` Q&A, `7` formula and `3` code.
- Canonical formula references: `0`.
- Existing specialist artifacts: `0`; missing: `11`.
- Exact target-ID matches outside durable content: none.
- Durable content, runtime readers, manifest and E235 unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates: `P1–P4` locked.
- Learning outcomes: `LO1–LO9` locked.
- Mastery evidence groups: `E1–E8` locked.
- Misconception intercepts: `M1–M8` locked.
- Canonical convention: `X in R^(m x n)`, rows are observations, columns are features.
- Alternative column-observation convention is allowed only when declared and translated explicitly.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Fixed raw shape: `X_raw in R^(8 x 6)`.
- Locked feature order: left wheel speed, right wheel speed, longitudinal acceleration, lateral acceleration, yaw rate, battery current.
- Raw, centred and scaled matrices must use distinct notation.
- Gram, covariance, rank, SVD and PCA claims remain assumption-gated or deferred.
- Numeric values, centering mean, scale vector and thresholds remain unlocked until Pass 5.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Convention ownership layers: project, mathematics, array/API and engineering.
- Source anchors: `S1–S12`.
- Claim trace set: `C01–C24`.
- Trilingual terminology: `T01–T40`.
- Symbol contract covers observations, rows, columns, slices, transpose, raw/centred/scaled matrices and Gram objects.
- Usage rules: `U1–U12`.
- NumPy operation map is locked to the row-observation project convention.
- Legacy 16-slide disposition is locked role by role.
- Rank, singular-value, PCA, missing/outlier policy and physical-mode claims are deferred or rewritten.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs: `F01–F18`.
- Core coverage: matrix assembly, entry/row/column/block access, transpose conversion, linear score, mean and centering.
- API equivalents: row-wise and column-wise NumPy stacking.
- One-dimensional transpose trap and valid reshape forms are locked.
- Feature and observation Gram matrices are preview-only.
- Scaling, covariance, feature transformation and rank are preview-only and assumption-scoped.
- SVD and PCA formulas remain deferred.
- Dimensional failures `D01–D05` and forbidden shortcuts are locked.
- Numeric case values remain unlocked until Pass 5.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`.
- Case version: `CASE_C01_L06_V1_LOCKED`.
- Shape: `8 x 6`, observations as rows.
- Observation IDs: `UGV-W01–UGV-W08`; timestamps strictly increasing by 250 ms.
- Feature schema, order, units, version and checksum locked.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Centered column sums and reconstruction pass at `1e-12`.
- Four negative variants locked: swapped columns, wrong units, wrong orientation and schema-version mismatch.
- Scale vector, fault threshold, PCA result and physical mode count remain unlocked/prohibited.
- Runtime content, readers, manifest and E235 unchanged.

## Current task requirements

`THEORY_C01_L06_MISCONCEPTION_MAP_PASS_06`

Pass 6 must:
- convert M1–M8 and the four invalid case variants into a structured misconception map;
- define trigger, wrong inference, correction, evidence and retrieval prompt for each misconception;
- include shape-correct but schema-wrong examples;
- block covariance, rank, PCA and fault-diagnosis overclaims;
- map every misconception to LO1–LO9, C01–C24, F01–F18 and case invariants;
- distinguish conceptual, notation, API, metadata and engineering failure classes;
- avoid runtime modification.
