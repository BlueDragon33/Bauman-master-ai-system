# CODEX_STATE

Current task: `THEORY_C01_L06_LEARNING_CONTRACT_PASS_02`

Status: `PASS_01_BASELINE_AUDIT_COMPLETE`

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
- academic passes complete: `1/14`;
- academic passes remaining: `13/14`;
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

Baseline risks locked for Pass 2:
- rows-as-samples versus columns-as-samples can transpose every downstream formula;
- shape does not prove semantic compatibility;
- stacking requires compatible dimensions, schema, units and acquisition order;
- data matrices are not automatically centred, standardized, full-rank or covariance-ready;
- batch, time-window, channel and trajectory orientations must remain distinct;
- PCA, SVD and rank are downstream bridges, not substitutes for the §1.6 core.

## Current task requirements

`THEORY_C01_L06_LEARNING_CONTRACT_PASS_02`

Pass 2 must:
- lock prerequisite gates from §1.1–§1.5;
- define measurable learning outcomes before slide expansion;
- lock one canonical data contract for observations, features, channels, units and ordering;
- distinguish row-sample and column-sample conventions and state the project convention explicitly;
- separate vector stacking, indexing, slicing, transpose, batch and time-window interpretations;
- define mastery evidence and prohibited shortcuts;
- select one deterministic engineering context for later case development;
- keep PCA/SVD/rank as downstream bridges rather than replacing the §1.6 core;
- avoid runtime modification.
