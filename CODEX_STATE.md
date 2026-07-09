# CODEX_STATE

Current task: `THEORY_C01_L05_REFERENCE_ARTIFACT_PASS_11`

Status: `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`

Date: 2026-07-09
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it adds material value for deep multi-file refactors, broad dependency analysis, unavailable complex automation or unsafe large transformations.
- If Codex is required, create one new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.
- Do not modify runtime content before academic acceptance.

## Protected constraints
- Minimum 16 slides, with no maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Preserve one source slide to one runtime slide after acceptance.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## §1.4 accepted baseline
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Academic workflow: `14/14` passes complete.
- Runtime workflow: `6/6` passes complete.
- Runtime steps: `34/34` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.
- Historical Chromium report commit: `918daa85f0bf2af28f798dd5a669dea8f23ee460`.
- E243 presenter route lock remains active before host/core scripts.

## §1.5 active workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Progress:
- academic passes complete: `10/14`;
- academic passes remaining: `4/14`;
- runtime integration: not started;
- durable runtime record: one unchanged 16-slide baseline record;
- accepted specialist package: not yet approved;
- next task: Pass 11 Reference artifact.

## Completed passes

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`
- File: `subjects/math/THEORY_C01_L05_BASELINE_AUDIT.md`
- Commit: `12207b82888cb03c41c5a8ced2fb8609acaf52ed`
- Locked the linear/affine/near-subspace distinction, projector gap, rank criterion, fixed-case requirement and scope boundary.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`
- File: `subjects/math/THEORY_C01_L05_LEARNING_CONTRACT.md`
- Commit: `732764511b8b5bdf8e21c8962eedfeac12a40e13`
- Locked prerequisite gates P1–P4, outcomes LO1–LO8, mastery evidence E1–E6 and case boundary.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`
- File: `subjects/math/THEORY_C01_L05_SOURCE_MAP_TERMINOLOGY.md`
- Commit: `9af7bd0477d507c2c73cf78323704c56a2111ff2`
- Locked sources S1–S5, claims C01–C12, terms T01–T22 and rules U1–U8.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`
- File: `subjects/math/THEORY_C01_L05_FORMULA_REGISTRY.md`
- Commit: `dd09523f5cb419a8384b41797b2c6f1b8d6e969e`
- Locked formulas F01–F16 with shapes, assumptions, checks and failure modes.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_CONTRACT_COMPLETE`
- File: `subjects/math/data/theory_case/theory_case_c01_l05.json`
- Commit: `3d545610bdd3dcdf8bb29c0e2f6742feef7aed0f`
- Case: `ROTATING_MACHINE_4CH_2MODE`, version `CASE_C01_L05_V1_LOCKED`.
- Locked Q, R, P, general B, two observations, calibration matrix, tolerance and invariants.
- Normal score: `0.0316227766016838`.
- Mismatch score: `0.3535533905932738`.
- Floating-point rank: `4`.
- Numerical rank: `2` only under `tau=0.05`.
- Retained energy k=2: approximately `99.9541%`.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`
- File: `subjects/math/THEORY_C01_L05_MISCONCEPTION_MAP.md`
- Commit: `d50ebab37c02f33b1ec425a0e92426c5ed4a7fbd`
- Locked M01–M25 across conceptual, algebraic, data-contract, numerical and engineering groups.

### Pass 7 · Core architecture
- Status: `PASS_07_CORE_ARCHITECTURE_COMPLETE`
- File: `subjects/math/data/theory_core/theory_core_c01_l05.json`
- Commit: `3fab0952004e61e08fa8d25846fbfc7ec4d93987`
- Built 20 presentation-independent learning beats B01–B20 and assessment blueprint A01–A10.

### Pass 8 · Worked examples and derivations
- Status: `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`
- File: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l05.json`
- Commit: `3374a3020f45762687b4a983fb3184a779272fdb`
- Added 12 worked examples.
- Derived `QQ^T` and `B(B^TB)^(-1)B^T` without expanding into a full least-squares course.
- Classified exact, affine and near-subspace models.
- Calculated both locked samples step by step.
- Compared Q and B coordinates while preserving the represented vector.
- Covered projector invariants, rank tolerance and bounded retained-energy interpretation.

### Pass 9 · Deterministic computational lab
- Status: `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`
- File: `subjects/math/data/theory_lab/theory_lab_c01_l05.json`
- Commit: `2f84f655be887585ec5e1663a972e3e3190c06fb`
- Added 8 deterministic lab stages and 6 broken-code audits.
- Includes canonical NumPy code with shape, centering, orthonormality, projector, reconstruction, residual, SVD and rank assertions.
- Uses no random input, network or external file.

### Pass 10 · Retrieval and professor Q&A
- Status: `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`
- File: `subjects/math/data/theory_assessment/theory_assessment_c01_l05.json`
- Commit: `9666fff29969b5979ba35af64f0ef40bbfc9bc7a`
- Added 16 retrieval checks, 14 professor questions and 5 mastery gates.
- Covers LO1–LO8 and all five misconception groups.
- Critical items require correct model classification, projector choice, centering, rank criterion and bounded engineering interpretation.

## Remaining academic passes
11. Reference artifact.
12. Full View and Normalization artifacts.
13. Slideshow artifact and runtime import package.
14. Academic acceptance.

## Current task requirements

`THEORY_C01_L05_REFERENCE_ARTIFACT_PASS_11`

Pass 11 must build a compact lookup artifact that:
- preserves the exact linear, affine and near-subspace distinctions;
- exposes formulas F01–F16 with conditions and failure modes;
- includes projector-selection and rank-reporting decision tables;
- includes the locked four-channel case values without introducing new numbers;
- includes a troubleshooting matrix for M01–M25;
- includes Vietnamese, English and Russian terminology lookup;
- remains presentation-independent and lesson-scoped;
- does not modify runtime files.
