# CODEX_STATE

Current task: `THEORY_C01_L06_RETRIEVAL_PROFESSOR_QA_PASS_10`

Status: `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`

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
- academic passes complete: `9/14`;
- academic passes remaining: `5/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files: `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.md`, `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.json`.
- Durable record: index `5` of `18`; current runtime baseline has `16` slides.
- Durable content, runtime readers, manifest and E235 unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates `P1–P4`; outcomes `LO1–LO9`.
- Canonical convention: `X in R^(m x n)`, observations as rows, features as columns.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Raw, centred and scaled matrices use distinct notation.
- Gram, covariance, rank, SVD and PCA remain assumption-gated or deferred.
- Runtime unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Source anchors `S1–S12`; claims `C01–C24`; terminology `T01–T40`.
- Project/mathematics/API/engineering ownership layers and legacy-slide disposition locked.
- Runtime unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs: `F01–F18`.
- Core: assembly, indexing/slicing, transpose conversion, linear score, mean and centering.
- API equivalents: F08/F09; F07 is the one-dimensional transpose forbidden shortcut.
- Gram, scaling, covariance, feature transform and rank are preview/assumption scoped.
- SVD and PCA formulas remain deferred.
- Runtime unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`.
- Version: `CASE_C01_L06_V1_LOCKED`.
- Shape `8 x 6`, observations as rows; IDs `UGV-W01–UGV-W08`; timestamps increase by 250 ms.
- Ordered schema, units, version and checksum locked.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Four negative variants locked: swapped columns, stale unit, wrong orientation, schema-version mismatch.
- Scale vector, fault threshold, PCA result and physical mode count remain unlocked/prohibited.
- Runtime unchanged.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions: `M01–M18`.
- Orientation, 1D transpose, stacking, schema, units, slicing and preprocessing failures locked.
- Covariance, rank, PCA and fault-diagnosis overclaims blocked.
- Retrieval distribution and code-audit requirements locked.
- Runtime unchanged.

### Pass 7 · Core content
- Status: `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Commit: `ec281b90883ca8edad77b688492c7bcf59525121`.
- Learning beats: `22`; embedded retrieval checks: `12`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` complete/reachable.
- Distinguishes `CORE`, `API_EQUIVALENT`, `FORBIDDEN_SHORTCUT`, `PREVIEW`.
- Locked UGV numeric and metadata contracts preserved; no scale/rank/SVD/PCA/diagnostic result invented.
- Runtime files modified: `false`.

### Pass 8 · Worked examples and derivations
- Status: `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`.
- Artifact: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`.
- Version: `WORKED_EXAMPLES_C01_L06_V1_PASS08`.
- Commit: `f46521e74b71eb34304510c99713f1f1191ccc1a`.
- Worked examples: `15`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` complete.
- Includes compatibility rejection, canonical assembly, entry/row/column/block extraction, convention translation, NumPy 1D trap, feature selector, Gram-vs-covariance counterexample, locked mean/centering, scaling boundary, feature-transform preview and rank/PCA/diagnosis boundaries.
- Locked yaw-rate raw self-product: `0.0382`; sample variance after centering: `0.005342857142857143`.
- No scale vector, numerical rank, PCA component, retained dimension or fault conclusion fabricated.
- Runtime files modified: `false`.

### Pass 9 · Deterministic computational lab
- Status: `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`.
- Artifact: `subjects/math/data/theory_lab/theory_lab_c01_l06.json`.
- Version: `LAB_C01_L06_V1_PASS09`.
- Commit: `302cafdf5519b59c64fbdb00889189f561807694`.
- Lab stages: `8`; broken-code audits: `6`.
- Canonical NumPy code executed before commit with no randomness, network or file input.
- Assertions passed for canonical shape, locked extraction values, 6x8 transpose, 1D transpose behavior, yaw selector, locked mean, locked centered matrix, zero-mean invariant, UGV-W03 reconstruction, Gram shapes, yaw self-product/sample variance and rank upper bound `6`.
- Lab tasks explicitly cover the four locked invalid variants and forbid silent normalization of bad input.
- Scale policy remains unlocked; rank interpretation and SVD/PCA remain deferred; fault diagnosis remains prohibited.
- Runtime files modified: `false`.

## Current task requirements

`THEORY_C01_L06_RETRIEVAL_PROFESSOR_QA_PASS_10`

Pass 10 must:
- create `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`;
- use schema `bauman_math_theory_assessment_v1` and version `ASSESSMENT_C01_L06_V1_PASS10`;
- build retrieval checks, professor Q&A and mastery gates from the locked Pass 1–9 artifacts;
- keep answers initially hidden and require evidence before reveal;
- require shape/orientation/schema/unit evidence whenever a calculation or API result is interpreted;
- cover `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` with strong emphasis on compatibility, orientation, indexing/slicing, centering and scope boundaries;
- include critical items for equal-shape semantic mismatch, 1D transpose trap, locked extraction, centering, Gram-vs-covariance distinction, live preprocessing leakage, rank boundary and PCA/diagnosis overclaim;
- use the locked UGV numbers without changing values, order, units, IDs or timestamps;
- keep scaling policy task-dependent/unlocked;
- keep numerical-rank interpretation, SVD/PCA component selection and physical fault diagnosis deferred;
- set minimum mastery to at least `80%` and require all critical items to pass;
- modify no runtime file;
- finish with `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE` and advance to `THEORY_C01_L06_REFERENCE_ARTIFACT_PASS_11`.

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
