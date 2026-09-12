# CODEX_TASK

Task: `THEORY_C01_L06_REFERENCE_ARTIFACT_PASS_11`
Mode: academic-reference-only, compact lookup, no runtime edits.

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
10. `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`
11. `subjects/math/data/theory_reference/theory_reference_c01_l05.json` only as structural precedent.

## Goal
Create `subjects/math/data/theory_reference/theory_reference_c01_l06.json` with schema `bauman_math_theory_reference_v1` and version `REFERENCE_C01_L06_V1_PASS11`.

The reference artifact is a compact lookup companion, not a new lesson and not a new source of mathematics.

## Required reference architecture
Use eight compact sections:
1. canonical matrix/data contract and orientation;
2. notation lookup;
3. formula table `F01–F18` with shape, conditions, checks and misuse warnings;
4. extraction/slicing + metadata lookup;
5. NumPy/API orientation and 1D-transpose lookup;
6. preprocessing/centering/Gram/covariance gates;
7. locked `UGV_TELEMETRY_8X6` case and troubleshooting for `M01–M18`;
8. Việt–Anh–Nga terminology plus permitted/prohibited interpretation language.

## Locked case evidence
- Case/version: `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED`.
- `X_raw` shape: `8 x 6`, observations as rows.
- Ordered features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- Observation IDs: `UGV-W01–UGV-W08`; preserve locked timestamps.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Locked extraction: `X_raw[2,4]=0.08 rad/s` for UGV-W03 yaw_rate.
- Centered matrix and covariance preview may be quoted only from the locked case.

## Reference rules
- Reference only; compact by design.
- Add no new mathematics or policy.
- Trace formulas and claims to locked sources.
- Keep row-observation convention explicit.
- Keep raw, centred and scaled matrices distinct.
- Keep feature Gram, observation Gram and sample covariance distinct.
- Explain `x.T` on a NumPy 1D array as a trap; do not normalize it away.
- Preserve feature order, units, IDs, timestamps, schema version and acquisition contract.
- Do not invent a scale vector, rank tolerance, numerical rank, PCA result, retained dimension, anomaly threshold or fault label.
- No runtime registration or UI instructions.

## Acceptance
Finish with:
- status `PASS_11_REFERENCE_ARTIFACT_COMPLETE`;
- section count `8`;
- formula count `18`;
- terminology coverage `T01–T40` or a clearly complete compact lookup derived from that contract;
- misconception coverage `M01–M18`;
- `runtimeFilesModified: false`;
- next task `THEORY_C01_L06_FULL_VIEW_NORMALIZATION_PASS_12`.

After verification, update `CODEX_STATE.md` to `11/14` and advance the current task to Pass 12.
