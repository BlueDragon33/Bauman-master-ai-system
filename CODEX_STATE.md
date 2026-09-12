# CODEX_STATE

Current task: `THEORY_C01_L06_WORKED_EXAMPLES_DERIVATIONS_PASS_08`

Status: `PASS_07_CORE_CONTENT_COMPLETE`

Date: 2026-09-12
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
- academic passes complete: `7/14`;
- academic passes remaining: `7/14`;
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
- Existing specialist artifacts at the time of audit: `0`; missing: `11`.
- Durable content, runtime readers, manifest and E235 unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates: `P1–P4`.
- Learning outcomes: `LO1–LO9`.
- Canonical convention: `X in R^(m x n)`, observations as rows, features as columns.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Raw, centred and scaled matrices use distinct notation.
- Gram, covariance, rank, SVD and PCA claims remain assumption-gated or deferred.
- Runtime unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Source anchors: `S1–S12`.
- Claim trace set: `C01–C24`.
- Trilingual terminology: `T01–T40`.
- Project/mathematics/API/engineering ownership layers locked.
- Legacy 16-slide disposition locked role by role.
- Runtime unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs: `F01–F18`.
- Core: assembly, indexing/slicing, transpose conversion, linear score, mean and centering.
- API equivalents: row-wise and column-wise NumPy stacking.
- F07 locks the one-dimensional transpose trap as a forbidden shortcut.
- Gram, scaling, covariance, feature transform and rank are preview/assumption scoped.
- SVD and PCA formulas remain deferred.
- Runtime unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`.
- Case version: `CASE_C01_L06_V1_LOCKED`.
- Shape: `8 x 6`, observations as rows.
- Observation IDs: `UGV-W01–UGV-W08`; timestamps increase by 250 ms.
- Ordered feature schema, units, version and checksum locked.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Four negative variants locked: swapped columns, stale unit, wrong orientation and schema-version mismatch.
- Scale vector, fault threshold, PCA result and physical mode count remain unlocked/prohibited.
- Runtime unchanged.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions: `M01–M18`.
- Failure classes: conceptual, notation, API, metadata, engineering inference and scope.
- Orientation, 1D transpose, stacking, schema, units, slicing and preprocessing failures locked.
- Covariance, rank, PCA and fault-diagnosis overclaims explicitly blocked.
- Retrieval distribution and code-audit requirements locked.
- Runtime unchanged.

### Pass 7 · Core content
- Status: `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Commit: `ec281b90883ca8edad77b688492c7bcf59525121`.
- Learning beats: `22`.
- Embedded retrieval checks: `12`.
- Coverage:
  - learning outcomes: `LO1–LO9` complete;
  - claims: `C01–C24` reachable;
  - formulas: `F01–F18` reachable;
  - misconceptions: `M01–M18` covered.
- Core distinguishes `CORE`, `API_EQUIVALENT`, `FORBIDDEN_SHORTCUT` and `PREVIEW`.
- Locked UGV feature order, units, observation IDs, timestamps, raw values, mean and centred values preserved.
- No scale vector, numerical-rank interpretation, SVD/PCA result, retained dimension, threshold or fault diagnosis invented.
- Source architecture supports expansion beyond the minimum `16` slides without compression.
- Runtime files modified: `false`.
- Academic acceptance: not yet; Pass 8–14 remain.

## Current task requirements

`THEORY_C01_L06_WORKED_EXAMPLES_DERIVATIONS_PASS_08`

Pass 8 must:
- create `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`;
- use schema `bauman_math_theory_worked_examples_v1` and version `WORKED_EXAMPLES_C01_L06_V1_PASS08`;
- derive examples only from the accepted Pass 1–7 contracts and `CASE_C01_L06_V1_LOCKED`;
- cover LO1–LO9 and all core formula families needed for mastery without turning preview formulas into full deferred theory;
- include explicit examples for compatibility rejection, row-observation assembly, entry/row/column/block extraction, transpose convention conversion, NumPy 1D transpose trap, mean/centering, Gram-versus-covariance distinction and downstream rank/PCA boundaries;
- preserve all locked UGV numeric values, feature order, units, observation IDs and timestamps;
- show dimensions/shapes at each derivation step and carry metadata through slices;
- include misconception intercepts and quality checks in every relevant example;
- keep scaling policy task-dependent and unlocked;
- keep rank interpretation, SVD/PCA component selection and fault diagnosis deferred;
- modify no runtime file;
- finish with `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE` and set next task to `THEORY_C01_L06_DETERMINISTIC_COMPUTATIONAL_LAB_PASS_09`.

## Maintenance patch · E215 Reader Pro extension panel and fit rules

Historical accepted maintenance state:
- status: `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD`;
- patched E212 reader-fit and E242 richness layers plus index cache versions;
- right-side Reader Pro panel is `Nội dung mở rộng`, de-duplicates lower-card summaries and preserves internal scrolling/responsive visibility;
- duplicated relation operators are sanitized after formula typesetting;
- E242 semantic diagrams remain embedded in the extension panel;
- Chromium smoke passed at `1280 x 720` and `900 x 720`;
- console/page/local HTTP errors: `0`;
- E235 remained unchanged and E236/E237/E238 remained disabled.
