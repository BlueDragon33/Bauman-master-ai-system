# CODEX_TASK

Task: `THEORY_C01_L06_RETRIEVAL_PROFESSOR_QA_PASS_10`
Mode: academic-assessment-only, evidence-first, no runtime edits.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`
3. `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`
4. `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`
5. `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`
6. `subjects/math/data/theory_case/theory_case_c01_l06.json`
7. `subjects/math/data/theory_core/theory_core_c01_l06.json`
8. `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`
9. `subjects/math/data/theory_lab/theory_lab_c01_l06.json`
10. `subjects/math/data/theory_assessment/theory_assessment_c01_l05.json` only as structural precedent.

## Goal
Create `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json` with schema `bauman_math_theory_assessment_v1` and version `ASSESSMENT_C01_L06_V1_PASS10`.

The assessment must test whether the learner can preserve matrix semantics and engineering scope, not merely reproduce syntax.

## Assessment policy
- Answers initially hidden.
- Evidence before reveal.
- Minimum mastery: at least 80%.
- Every critical item must pass.
- Numeric answers require object, shape/orientation and unit/metadata context where relevant.
- API answers must state the active convention.
- Data-contract or preprocessing evidence must never be converted into physical fault diagnosis.

## Required retrieval clusters
- compatibility before stacking;
- canonical row-observation orientation;
- scalar/row/column/block extraction with metadata;
- transpose convention translation;
- NumPy 1D `.T` trap;
- feature-order dependency of `Xw`;
- feature/observation Gram shapes and meaning;
- raw Gram versus sample covariance;
- locked mean and centering invariant;
- centering versus scaling and fit/transform reuse;
- rank bound versus numerical/physical-rank overclaim;
- PCA/SVD and fault-diagnosis boundaries.

## Professor Q&A requirements
Questions must force explanation, not recognition. Include adversarial prompts such as:
- “Hai arrays cùng 8x6 thì vì sao chưa chắc stack-compatible?”
- “Code chạy được sau `.T` thì vì sao vẫn có thể sai?”
- “X_raw.T@X_raw có phải covariance không?”
- “Vì sao không được refit mean/scale trên live batch tùy tiện?”
- “Từ shape 8x6 có được kết luận UGV có 6 physical modes không?”
- “Covariance đã có thì có được gọi ngay các eigenvectors là accepted principal components của pipeline không?”

## Locked case evidence
- Case: `CASE_C01_L06_V1_LOCKED` / `UGV_TELEMETRY_8X6`.
- Shape: `8 x 6`, observations as rows.
- Ordered features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- Preserve `UGV-W01–UGV-W08` and locked timestamps.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Locked extraction: `X_raw[2,4]=0.08 rad/s` for `UGV-W03` yaw_rate.
- Do not invent scale vector, numerical-rank tolerance, PCA result, retained dimension, threshold or fault label.

## Coverage
- Cover `LO1–LO9`.
- Trace to `C01–C24`, `F01–F18`, `M01–M18` as relevant.
- Include critical items for equal-shape semantic mismatch, 1D transpose, locked extraction, centering, Gram/covariance, preprocessing leakage, rank boundary, PCA/diagnosis overclaim.
- Include mastery gates that combine conceptual explanation, locked arithmetic and code-audit evidence.

## Acceptance
Finish with:
- status `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`;
- minimum mastery >= 80%;
- all critical items mandatory;
- `runtimeFilesModified: false`;
- next task `THEORY_C01_L06_REFERENCE_ARTIFACT_PASS_11`.

After verification, update `CODEX_STATE.md` to 10/14 and advance the current task to Pass 11.
