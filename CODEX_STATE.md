# CODEX_STATE

Current task: `THEORY_C01_L05_RUNTIME_SOURCE_REGISTRATION_PASS_16`

Status: `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS`

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
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Academic workflow: `14/14` passes complete.
- Runtime workflow: `6/6` passes complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.
- Historical Chromium report commit: `918daa85f0bf2af28f798dd5a669dea8f23ee460`.

## §1.5 academic acceptance

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Final academic state:
`ACADEMIC_14_OF_14_PASS_RUNTIME_NOT_STARTED`

Progress:
- academic passes complete: `14/14`;
- academic passes remaining: `0/14`;
- runtime integration: 1/5 passes complete;
- durable runtime record: merged 22-slide approved record;
- accepted source slideshow: 22 slides;
- approved import candidate: 22 runtime slides;
- durable merge: PASS with all non-target canonical hashes unchanged.

### Pass 1 · Baseline audit
- File: `subjects/math/THEORY_C01_L05_BASELINE_AUDIT.md`
- Commit: `12207b82888cb03c41c5a8ced2fb8609acaf52ed`
- Result: `PASS_01_BASELINE_AUDIT_COMPLETE`.

### Pass 2 · Learning contract
- File: `subjects/math/THEORY_C01_L05_LEARNING_CONTRACT.md`
- Commit: `732764511b8b5bdf8e21c8962eedfeac12a40e13`
- Locked prerequisite gates P1–P4, outcomes LO1–LO8 and mastery evidence E1–E6.

### Pass 3 · Source map and terminology
- File: `subjects/math/THEORY_C01_L05_SOURCE_MAP_TERMINOLOGY.md`
- Commit: `9af7bd0477d507c2c73cf78323704c56a2111ff2`
- Locked sources S1–S5, claims C01–C12, terms T01–T22 and rules U1–U8.

### Pass 4 · Formula registry
- File: `subjects/math/THEORY_C01_L05_FORMULA_REGISTRY.md`
- Commit: `dd09523f5cb419a8384b41797b2c6f1b8d6e969e`
- Locked formulas F01–F16 with shapes, assumptions, checks and failure modes.

### Pass 5 · Engineering case
- File: `subjects/math/data/theory_case/theory_case_c01_l05.json`
- Commit: `3d545610bdd3dcdf8bb29c0e2f6742feef7aed0f`
- Case: `ROTATING_MACHINE_4CH_2MODE`, version `CASE_C01_L05_V1_LOCKED`.
- Normal score: `0.0316227766016838`.
- Mismatch score: `0.3535533905932738`.
- Floating-point rank: `4`.
- Numerical rank: `2` only under `tau=0.05`.
- Retained energy for k=2: `0.9995414686511285`.

### Pass 6 · Misconception map
- File: `subjects/math/THEORY_C01_L05_MISCONCEPTION_MAP.md`
- Commit: `d50ebab37c02f33b1ec425a0e92426c5ed4a7fbd`
- Locked M01–M25 across conceptual, algebraic, data-contract, numerical and engineering groups.

### Pass 7 · Core architecture
- File: `subjects/math/data/theory_core/theory_core_c01_l05.json`
- Commit: `3fab0952004e61e08fa8d25846fbfc7ec4d93987`
- Built 20 presentation-independent learning beats B01–B20.

### Pass 8 · Worked examples and derivations
- File: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l05.json`
- Commit: `3374a3020f45762687b4a983fb3184a779272fdb`
- Added 12 verified worked examples and both projector derivations.

### Pass 9 · Deterministic computational lab
- File: `subjects/math/data/theory_lab/theory_lab_c01_l05.json`
- Commit: `2f84f655be887585ec5e1663a972e3e3190c06fb`
- Added 8 deterministic lab stages and 6 broken-code audits.

### Pass 10 · Retrieval and professor Q&A
- File: `subjects/math/data/theory_assessment/theory_assessment_c01_l05.json`
- Commit: `9666fff29969b5979ba35af64f0ef40bbfc9bc7a`
- Added 16 retrieval checks, 14 professor questions and 5 mastery gates.

### Pass 11 · Reference artifact
- File: `subjects/math/data/theory_reference/theory_reference_c01_l05.json`
- Commit: `5bf3cfb00d934f3cc46b298fb30c29b286e9b59f`
- Sections: 8; formulas: F01–F16; terminology: T01–T22; misconception coverage: M01–M25.

### Pass 12 · Full View and Normalization
- Files:
  - `subjects/math/data/theory_full_view/theory_full_view_c01_l05.json`
  - `subjects/math/data/theory_normalization/theory_normalization_c01_l05.json`
- Commits:
  - `174ae9a98865f1d287bb56f6e79d67964e03a2b1`
  - `6ff1b716f8e2cf7f2203592160eae3f697aeb5a2`
- Full View sections: 12.
- Canonical notation: N01–N18.
- Canonical formulas: F01–F16.
- Semantic conflicts: 0.

### Pass 13 · Slideshow and import package
- Files:
  - `subjects/math/data/theory_slideshow/theory_slideshow_c01_l05.json`
  - `subjects/math/data/theory_integration/theory_lecture_content_c01_l05_import.json`
- Commits:
  - `62d649db653ba3e4bbcb51e05b822e99ebae440f`
  - `00196604e2e68095860e6bf37a205a9d772c0e5e`
- Source slides: 22.
- Runtime import slides: 22.
- One-to-one mapping: SL01–SL22 to L05-S01–S22.
- Diagram specs: 9.
- Retrieval slides: 10.
- Misconception slides: 17.
- Compression: false.

### Pass 14 · Academic acceptance
- Report: `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json`
- Report commit: `257534dc8de95b6507db325fc624ae95fb79442c`
- Approval sidecar: `subjects/math/data/theory_integration/theory_lecture_content_c01_l05_approval.json`
- Approval commit: `dacfe8f9a91ec6227df64995d2ee51c6b9defe0f`
- Status: `PASS_14_ACADEMIC_ACCEPTANCE_COMPLETE`.
- Verification mode: direct high-reasoning connector static cross-check.
- GitHub Actions acceptance run: not available.
- Browser QA: not run.
- Runtime durable merge: not performed.

## §1.5 runtime roadmap
1. Pass 15: durable merge into `subjects/math/data/theory_lecture_content.json` with exact non-target preservation.
2. Pass 16: register lesson-scoped Reference, Full View and Normalization sources.
3. Pass 17: extend existing slideshow richness/readers for L05 without creating a new engine.
4. Pass 18: synchronize lesson selection and route locking for L05 while preserving L04.
5. Pass 19: Chromium browser QA, leak checks and final runtime acceptance.

## Current task requirements

`THEORY_C01_L05_DURABLE_MERGE_RUNTIME_PASS_15`

Pass 15 must:
- require both academic acceptance report and approval sidecar status PASS/approved;
- parse durable content and the exact approved import candidate;
- replace only the L05 target record;
- preserve target index and neighboring lesson IDs;
- preserve canonical hashes of all non-target records;
- keep record count unchanged;
- keep duplicate lesson IDs at zero;
- verify 22 source slides map to 22 runtime slides;
- verify formula coverage F01–F16;
- preserve locked case values and prohibited-claim boundaries;
- avoid any runtime reader, UI or manifest modification in this pass.


## §1.5 Runtime Pass 15 · Durable merge
- Status: `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS`.
- Report: `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json`.
- Target index: `4`.
- Previous lesson: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Next lesson: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`.
- Record count: `18` before and after.
- Runtime slides: `22/22`.
- Changed non-target records: `0`.
- Duplicate lesson IDs: `0`.
- Browser QA: not run.
- Next: `THEORY_C01_L05_RUNTIME_SOURCE_REGISTRATION_PASS_16`.
