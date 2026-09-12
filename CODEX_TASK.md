# CODEX_TASK

Task: `THEORY_C01_L06_WORKED_EXAMPLES_DERIVATIONS_PASS_08`
Mode: academic-content-only, inspect-first, deterministic derivations, no runtime edits.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/data/theory_core/theory_core_c01_l06.json`
3. `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`
4. `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`
5. `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`
6. `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`
7. `subjects/math/data/theory_case/theory_case_c01_l06.json`
8. `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`
9. `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l05.json` only as structural precedent.

## Goal
Create `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json` with version `WORKED_EXAMPLES_C01_L06_V1_PASS08`.

The artifact must turn the locked §1.6 core into worked, checkable derivations while preserving the project convention `X in R^(m x n)` with observations as rows and features as columns.

## Required worked coverage
- compatibility gate: equal shape is not enough;
- canonical row-observation assembly and explicit column-observation alternative;
- scalar entry, observation-row, feature-column and block extraction with aligned metadata;
- transpose convention conversion;
- NumPy 1D `.T` trap and valid reshape forms;
- linear score `y=Xw` with feature-order contract;
- feature and observation Gram shapes/roles;
- why raw Gram is not automatically covariance;
- locked feature-wise mean and centering of `UGV_TELEMETRY_8X6`;
- centering invariant and reconstruction check;
- scaling boundary: no invented scale vector;
- feature transform preview `Y=XA` with shape reasoning;
- rank bound only: `rank(X)<=6`, no invented numerical/physical rank;
- PCA/SVD boundary and prohibited fault diagnosis.

## Locked evidence
- Case version: `CASE_C01_L06_V1_LOCKED`.
- Raw shape: `8 x 6`.
- Feature order: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- Observation IDs: `UGV-W01–UGV-W08` with the locked timestamps.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Do not change or substitute locked case numbers.

## Quality rules
- Map examples to `LO1–LO9`, `C01–C24`, `F01–F18` and `M01–M18` as relevant.
- State dimensions/shapes before or during every derivation where orientation matters.
- Carry observation metadata and feature schema/units through slices.
- Treat F07 as a forbidden shortcut, F08/F09 as API equivalents and F11/F12/F15–F18 as preview/assumption scoped.
- Do not derive full covariance eigendecomposition, SVD or PCA.
- Do not select a scale vector, numerical-rank tolerance, retained dimension, threshold or physical mode count.
- Do not turn semantic/data-quality failures into fault diagnosis.
- Do not modify durable runtime, readers, slideshow engine, manifest or E235.
- Keep E236/E237/E238 disabled.

## Acceptance
The artifact must end with:
- status `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`;
- coverage proving LO1–LO9 are represented;
- locked-case numeric examples traceable to the case artifact;
- `runtimeFilesModified: false`;
- next task `THEORY_C01_L06_DETERMINISTIC_COMPUTATIONAL_LAB_PASS_09`.

After the artifact is verified, update `CODEX_STATE.md` to 8/14 academic passes and advance the current task to Pass 9.
