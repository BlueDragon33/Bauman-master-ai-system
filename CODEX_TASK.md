# CODEX_TASK

Task: `THEORY_C01_L06_FULL_VIEW_NORMALIZATION_PASS_12`
Mode: academic-presentation-data-only, normalization-only, no runtime edits.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/data/theory_core/theory_core_c01_l06.json`
3. `subjects/math/data/theory_reference/theory_reference_c01_l06.json`
4. `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`
5. `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`
6. `subjects/math/data/theory_case/theory_case_c01_l06.json`
7. `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`
8. `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`
9. `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`
10. `subjects/math/data/theory_full_view/theory_full_view_c01_l05.json` only as structural precedent.
11. `subjects/math/data/theory_normalization/theory_normalization_c01_l05.json` only as structural precedent.

## Goal
Create two Pass 12 artifacts:

1. `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`
   - schema: `bauman_math_theory_full_view_v1`
   - version: `FULL_VIEW_C01_L06_V1_PASS12`

2. `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`
   - schema: `bauman_math_theory_normalization_v1`
   - version: `NORMALIZATION_C01_L06_V1_PASS12`

## Full View contract
- Complete reading flow, not a new mathematical source.
- Core remains source-of-truth candidate; Reference remains lookup layer; Worked Examples provide verified derivations.
- Add no new mathematics, policy, case value or diagnostic conclusion.
- Do not copy assessment answers as primary teaching prose.
- Do not embed implementation/runtime code as lesson content.
- Every formula used in teaching flow must carry meaning, shape/conditions and misuse warning.
- Use the locked UGV case for concrete interpretation while preserving all numeric and metadata values.
- The flow must be rich enough for later slideshow expansion to at least 16 slides without compression.

## Suggested Full View architecture
Build approximately 12 coherent reading sections covering:
1. governing question + why a data matrix is a semantic contract;
2. compatibility before stacking;
3. canonical row-observation assembly and matrix meaning;
4. entry/row/column/block extraction with metadata;
5. row-observation vs column-observation conventions;
6. NumPy stack/vstack/column_stack and 1D `.T` trap;
7. linear score and feature-order interface;
8. feature/observation Gram matrices and their distinct meanings;
9. locked mean and feature-wise centering;
10. centering vs scaling, fit/transform reuse and leakage boundary;
11. sample covariance preview and rank/SVD/PCA boundaries;
12. locked UGV case, troubleshooting, mastery close and downstream bridge.

## Normalization contract
- Canonical overlay only; core meaning has precedence.
- Lexical/display aliases may map to a canonical form; semantic conflicts must block integration.
- Normalize notation for `m`, `n`, `x^(i)`, `X`, `X_col`, `X_raw`, `mu`, `X_c`, `X_s`, `G_f`, `G_o`, `C`, `w`, `y`, index sets `I/J`, transpose and shape notation.
- Keep mathematical vector orientation distinct from NumPy 1D shape semantics.
- Keep row-observation and column-observation conventions distinct.
- Keep raw, centred and scaled matrices distinct.
- Keep feature Gram, observation Gram and covariance distinct.
- Keep centering, scaling, standardization and vector normalization distinct.
- Keep exact algebraic rank bound distinct from numerical rank, retained dimension and physical mode count.
- Preserve `F01–F18`, `C01–C24`, `M01–M18`, `T01–T40` identities and meaning.
- Preserve case/version `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED` exactly.

## Locked case evidence
- Shape: `8 x 6`, observations as rows.
- Ordered features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- IDs: `UGV-W01–UGV-W08`; timestamps remain the locked 250 ms sequence.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Locked extraction: `X_raw[2,4]=0.08 rad/s`, UGV-W03 yaw_rate.
- Scale vector: not locked.
- Numerical-rank tolerance: not locked.
- PCA result / retained dimension: not locked.
- Fault threshold/label: prohibited.

## Runtime protection
- No changes to durable lesson records, `index.html`, runtime readers, manifest, CSS or JS.
- No Reader Pro patch.
- Do not touch E235.
- E236/E237/E238 remain disabled.

## Acceptance
Pass only when:
- both Full View and Normalization artifacts exist and parse;
- Full View has a complete coherent reading flow and no new mathematics;
- Normalization reports zero semantic conflicts or explicitly blocks integration if a real conflict is found;
- all locked case values remain unchanged;
- formula, claim, misconception and terminology traceability is complete;
- runtime files modified: `false`;
- final status advances to `PASS_12_FULL_VIEW_NORMALIZATION_COMPLETE`;
- next task becomes `THEORY_C01_L06_SLIDESHOW_RUNTIME_IMPORT_PASS_13`.
