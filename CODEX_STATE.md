# CODEX_STATE

Current task: `THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY_PASS_03`

Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`

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
- academic passes complete: `2/14`;
- academic passes remaining: `12/14`;
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

## Current task requirements

`THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY_PASS_03`

Pass 3 must:
- map every learning-contract claim cluster to authoritative algebra, array and preprocessing sources;
- distinguish project conventions from external mathematical or software conventions;
- define a canonical Vietnamese-English-Russian terminology table where needed for Bauman study;
- lock notation for observation vectors, data matrices, rows, columns, entries, slices, transpose and derived matrices;
- document how NumPy stacking axes map to the project row-observation convention;
- map feature-order and preprocessing consistency requirements to official software documentation;
- identify unsupported legacy claims that must not survive into the core artifact;
- preserve the fixed case and scope boundaries;
- avoid runtime modification.
