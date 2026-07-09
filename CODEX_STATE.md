# CODEX_STATE

Current task: `THEORY_C01_L06_BASELINE_AUDIT_PASS_01`

Status: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`

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

## §1.5 accepted academic package

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Academic status:
- passes complete: `14/14`;
- source slides: `22`;
- runtime import slides: `22`;
- slide mapping: `SL01–SL22` to `L05-S01–S22`;
- compression: `false`;
- acceptance report: `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json`;
- approval sidecar: `subjects/math/data/theory_integration/theory_lecture_content_c01_l05_approval.json`.

Locked case:
- case: `CASE_C01_L05_V1_LOCKED`;
- normal score: `0.0316227766016838`;
- mismatch score: `0.3535533905932738`;
- floating-point rank: `4`;
- numerical rank: `2` under `tau=0.05`;
- retained energy k=2: `0.9995414686511285`.

Academic artifacts:
- baseline audit: `subjects/math/THEORY_C01_L05_BASELINE_AUDIT.md`;
- learning contract: `subjects/math/THEORY_C01_L05_LEARNING_CONTRACT.md`;
- source map: `subjects/math/THEORY_C01_L05_SOURCE_MAP_TERMINOLOGY.md`;
- formula registry: `subjects/math/THEORY_C01_L05_FORMULA_REGISTRY.md`;
- case: `subjects/math/data/theory_case/theory_case_c01_l05.json`;
- misconception map: `subjects/math/THEORY_C01_L05_MISCONCEPTION_MAP.md`;
- core: `subjects/math/data/theory_core/theory_core_c01_l05.json`;
- worked examples: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l05.json`;
- lab: `subjects/math/data/theory_lab/theory_lab_c01_l05.json`;
- assessment: `subjects/math/data/theory_assessment/theory_assessment_c01_l05.json`;
- reference: `subjects/math/data/theory_reference/theory_reference_c01_l05.json`;
- full view: `subjects/math/data/theory_full_view/theory_full_view_c01_l05.json`;
- normalization: `subjects/math/data/theory_normalization/theory_normalization_c01_l05.json`;
- slideshow: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l05.json`;
- import: `subjects/math/data/theory_integration/theory_lecture_content_c01_l05_import.json`.

## §1.5 runtime progress

Runtime passes complete: `5/5`.
Runtime passes remaining: `0/5`.
Browser QA: `PASS_CURRENT_HEAD`.

### Runtime Pass 15 · Durable merge
- Status: `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS`.
- Main commit: `abefabc959561e0e77c8784c7e0c1f559fdc4796`.
- Report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json`.
- Target index: `4`.
- Previous lesson: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Next lesson: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`.
- Record count: `18` before and after.
- Runtime slides: `22/22`.
- Changed non-target canonical hashes: `0`.
- Duplicate lesson IDs: `0`.

### Runtime Pass 16 · Source registration
- Status: `PASS_16_RUNTIME_SOURCE_REGISTRATION_STATIC_VERIFY_PASS`.
- Registry: `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js`.
- Initial registry commit: `389050ee24c92def637d0c4e1c1bebf638c0e4d5`.
- Index load-order commit: `81174ffadc0e7801c12a389e32656efda598f5fa`.
- Report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS16.json`.
- L05 registered sources: Reference, Full View and Normalization.
- Subject manifest unchanged.
- E235 unchanged.

### Runtime Pass 17 · Multi-lesson reader and richness
- Status: `PASS_17_MULTI_LESSON_READER_RICHNESS_STATIC_VERIFY_PASS`.
- Report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS17.json`.
- E244 multi-lesson registry commit: `67610c6f49b84cd0d2cef1a21ba98eb635b60267`.
- E241 multi-lesson artifact reader commit: `0e1abf8fc2a43a81689ba3973ef05cd32c5676ac`.
- Initial E242 multi-lesson richness commit: `153cce335777c5fc86db8957421033ba7c687521`.
- Registry: 2 lessons, 8 optional sources, 4 source kinds.
- L04 richness: 22 slides, 8 diagrams, 9 retrieval checks, 16 misconception intercepts.
- L05 richness: 22 slides, 9 diagrams, 10 retrieval checks, 18 misconception intercepts.
- E202, E211 and E235 unchanged.
- New slideshow engine: none.

### Runtime Pass 18 · Selection and route identity sync
- Status: `PASS_18_SELECTION_ROUTE_SYNC_STATIC_VERIFY_PASS`.
- E210 canonical identity commit: `d39706c75ce9b9f4d4b720880da1a72f9898b92f`.
- E243 route and identity lock commit: `d4ba315649d8873345eff5beb862ddd370050224`.
- Report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS18.json`.
- E129, E202, E211 and E235 were not modified.

## Chromium acceptance history and revalidation reason
- Historical Pass 19 report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS19.json`.
- Historical acceptance commit: `b28d460f7e584e333f36dd9068bfe2f2aead34c6`.
- A stricter later Chromium sequence exposed that E211/E241 could replace the visual after E242 applied, while E242 returned early from a stale `lastKey` marker.
- Runtime repair commit: `58bab8bd2e131b8250f01a83eb6b611afa0fd2f0`.
- The repair prioritizes deck-locked lesson identity and verifies required richness markers still exist before treating a slide as already applied.
- Because this repair was committed after the historical browser report, that report is retained as history but is not sufficient for the current head.

## Current task requirements

`THEORY_C01_L05_CHROMIUM_REVALIDATION_AFTER_E242_FIX`

The revalidation must:
- run real Chromium against the current `main` head including commit `58bab8bd2e131b8250f01a83eb6b611afa0fd2f0`;
- open §1.4 and §1.5 through the real E129 presenter action;
- navigate all 22 slides in each lesson;
- for every source slide, verify each required diagram, retrieval and misconception marker remains present after reader/artifact rerenders;
- verify canonical identity and artifact controls never leak between §1.4 and §1.5;
- open lesson-scoped Reference and Full View;
- verify the formula modal remains separate and E235 remains active;
- verify zero console errors, page errors, failed local requests and routing-ghost leftovers;
- update the Pass 19 report with the new tested commit and evidence artifact;
- restore `5/5` only after the current head passes.


## Runtime Pass 19 current-head revalidation
- Status: `PASS_CURRENT_HEAD_AFTER_E242_REPAIR`.
- Tested runtime commit: `3acd90894051e86df6c93fadd1e84b54f283b021`.
- E242 repair commit: `58bab8bd2e131b8250f01a83eb6b611afa0fd2f0`.
- Evidence artifact: `lesson-1-5-pass19-revalidation-v4`.
- L04 and L05: all 22 slides verified against source richness requirements.
- Missing required richness markers: 0. Stale richness markers: 0.
- Reference, Full View, formula modal and E235: PASS.
- Cross-lesson identity leaks: 0. L06 stale registered controls: 0.
- Console errors: 0. Page errors: 0. Local HTTP errors: 0. Route ghosts: 0.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`.
- Next: `THEORY_C01_L06_BASELINE_AUDIT_PASS_01`.
