# CODEX_STATE

Current task: `THEORY_C01_L05_WORKED_EXAMPLES_DERIVATIONS_PASS_08`

Status: `PASS_07_CORE_ARCHITECTURE_COMPLETE`

Date: 2026-07-09
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it adds material value for a deep multi-file refactor, repository-wide dependency analysis, complex unavailable automation or a large transformation unsafe through the connector.
- If Codex is required, create one new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.
- Do not modify runtime content before academic acceptance.

## Protected constraints
- A theory lesson requires at least 16 slides; 16 is not a maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.
- Preserve one source slide to one runtime slide after acceptance.

## §1.4 accepted baseline
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Academic workflow: `14/14` passes complete.
- Runtime workflow: `6/6` passes complete.
- Runtime steps: `34/34` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.
- Historical accepted Chromium report commit: `918daa85f0bf2af28f798dd5a669dea8f23ee460`.
- E243 presenter route lock remains active before host/core scripts.

## §1.5 active workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Progress:
- academic passes complete: `7/14`;
- academic passes remaining: `7/14`;
- runtime integration: not started;
- durable runtime record: one unchanged 16-slide baseline record;
- accepted specialist package: not yet approved;
- next task: Pass 8 worked examples and derivations.

### Pass 1 · Baseline audit
Status: `PASS_01_BASELINE_AUDIT_COMPLETE`

Created:
`subjects/math/THEORY_C01_L05_BASELINE_AUDIT.md`

Locked decisions:
- existing 16-slide record is input only;
- distinguish linear subspace, affine model and noisy near-subspace;
- require both orthonormal and general-basis projection contracts;
- rank statements must name object, orientation and criterion;
- use one fixed engineering case;
- defer full PCA/SVD and rank-nullity treatment.

Commit:
`12207b82888cb03c41c5a8ced2fb8609acaf52ed`

### Pass 2 · Learning contract
Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`

Created:
`subjects/math/THEORY_C01_L05_LEARNING_CONTRACT.md`

Locked:
- prerequisite gates P1–P4;
- learning outcomes LO1–LO8;
- mastery evidence E1–E6;
- fixed case boundary `ROTATING_MACHINE_4CH_2MODE`;
- required, preview and deferred scope.

Commit:
`732764511b8b5bdf8e21c8962eedfeac12a40e13`

### Pass 3 · Source map and terminology
Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`

Created:
`subjects/math/THEORY_C01_L05_SOURCE_MAP_TERMINOLOGY.md`

Locked:
- source anchors S1–S5;
- claim map C01–C12;
- terminology T01–T22;
- symbol and usage rules U1–U8;
- Vietnamese–English–Russian glossary.

Commit:
`9af7bd0477d507c2c73cf78323704c56a2111ff2`

### Pass 4 · Formula registry
Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`

Created:
`subjects/math/THEORY_C01_L05_FORMULA_REGISTRY.md`

Locked:
- canonical formulas F01–F16;
- shape, assumption and failure-mode contracts;
- projector rules for orthonormal and general bases;
- numerical-rank tolerance language;
- SVD and retained-energy preview boundary.

Commit:
`dd09523f5cb419a8384b41797b2c6f1b8d6e969e`

### Pass 5 · Engineering case
Status: `PASS_05_ENGINEERING_CASE_CONTRACT_COMPLETE`

Created:
`subjects/math/data/theory_case/theory_case_c01_l05.json`

Locked and independently verified:
- four-channel feature order and mean;
- orthonormal basis Q and complement basis R;
- projector P and complement projector;
- equivalent non-orthonormal basis B;
- normal score `0.0316227766016838`;
- mismatch score `0.3535533905932738`;
- demonstration threshold `0.1`, teaching-case only;
- centred calibration matrix `8 x 4`;
- singular values `[1.44955817, 0.77504298, 0.03505112, 0.00330126]`;
- floating-point rank `4`;
- numerical rank `2` only under `tau=0.05`;
- retained energy for k=2 approximately `99.9541%`;
- orthogonality, projection, reconstruction and SVD invariants pass.

Commit:
`3d545610bdd3dcdf8bb29c0e2f6742feef7aed0f`

### Pass 6 · Misconception map
Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`

Created:
`subjects/math/THEORY_C01_L05_MISCONCEPTION_MAP.md`

Locked:
- misconception IDs M01–M25;
- conceptual, algebraic, data-contract, numerical and engineering groups;
- severity and required-evidence rules;
- mandatory coverage across core, examples, lab, retrieval and professor Q&A.

Commit:
`d50ebab37c02f33b1ec425a0e92426c5ed4a7fbd`

### Pass 7 · Core architecture
Status: `PASS_07_CORE_ARCHITECTURE_COMPLETE`

Created:
`subjects/math/data/theory_core/theory_core_c01_l05.json`

Locked:
- presentation-independent core;
- 20 learning beats B01–B20;
- all LO1–LO8 represented;
- formula, claim, case and misconception links;
- assessment blueprint A01–A10;
- runtime merge remains forbidden;
- academic acceptance remains pending.

Commit:
`3fab0952004e61e08fa8d25846fbfc7ec4d93987`

## Remaining academic passes
8. worked examples and derivations;
9. deterministic computational lab;
10. retrieval and professor Q&A;
11. reference artifact;
12. full-view and normalization artifacts;
13. slideshow artifact and runtime import package;
14. academic acceptance.

## Current task requirements

`THEORY_C01_L05_WORKED_EXAMPLES_DERIVATIONS_PASS_08`

Pass 8 must:
- derive both projector forms without teaching the full least-squares course;
- show exact, affine and near-subspace classification examples;
- calculate the locked normal and mismatch samples step by step;
- compare Q-coordinates and B-coordinates without changing the physical vector;
- prove or verify symmetry, idempotence, reconstruction and residual orthogonality;
- explain exact rank 4 versus numerical rank 2 under `tau=0.05`;
- interpret retained energy without claiming task accuracy;
- use only numbers from `CASE_C01_L05_V1_LOCKED` for the engineering case;
- keep runtime files unchanged.
