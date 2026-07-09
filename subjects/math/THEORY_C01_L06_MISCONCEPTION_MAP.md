# §1.6 · Từ vector sang ma trận dữ liệu

## Misconception and failure-mode map

Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Case version:
`CASE_C01_L06_V1_LOCKED`

## Use contract

Every misconception item must be used by at least one downstream component:
- core explanation;
- worked example;
- retrieval check;
- code audit;
- professor Q&A;
- lab failure injection;
- or engineering-case interpretation.

Every intercept must expose:
1. trigger;
2. tempting wrong belief;
3. why it looks plausible;
4. precise correction;
5. evidence that separates correct from incorrect reasoning;
6. retrieval prompt;
7. failure class and severity;
8. links to learning outcomes, claims, formulas and case invariants.

## Group A · Orientation and notation failures

### M01 · Transpose until the code runs

Failure class:
`notation + API`

Trigger:
A matrix multiplication raises a shape error.

Wrong belief:
`Keep applying transpose until the operation succeeds.`

Why tempting:
Transpose often changes incompatible dimensions into compatible dimensions, so the code may stop raising an exception.

Correction:
Write the semantic contract before the operation. Under the project convention, `X in R^(m x n)` has observations as rows. Transpose is permitted only when converting to the explicitly named column-observation representation `X_col = X^T`.

Evidence:
- state input and output shapes;
- name the observation and feature axes before and after transpose;
- translate the formula, not only the array.

Retrieval prompt:
`If X has shape 8 x 6 and rows are observations, what does X^T store in its columns?`

Case hook:
`INVALID_TRANSPOSED_WITH_ROW_OBSERVATION_LABEL`

Links:
`LO4`, `LO8`, `C08`, `C09`, `F06`, `F07`, `F09`

Severity:
critical

### M02 · One-dimensional `.T` creates a row vector

Failure class:
`API`

Trigger:
A NumPy observation has shape `(6,)` and the learner writes `x.T`.

Wrong belief:
`x.T has shape (1,6).`

Why tempting:
In written mathematics, transposing a column vector creates a row vector.

Correction:
A one-dimensional NumPy array has no separate row/column axis. Its transpose keeps shape `(6,)`. Use `reshape(1,6)` or `reshape(6,1)` when a two-dimensional object is required.

Evidence:
- print all three shapes;
- show that only the reshape creates a second axis.

Retrieval prompt:
`What are the shapes of x, x.T, x.reshape(1,6) and x.reshape(6,1)?`

Links:
`LO4`, `LO8`, `C08`, `F07`

Severity:
critical

### M03 · Row and column meanings survive transpose unchanged

Failure class:
`conceptual + notation`

Trigger:
The same numeric values are displayed after transposition.

Wrong belief:
`Only layout changed; the interpretation is unchanged.`

Why tempting:
No scalar value is altered by transpose.

Correction:
Transpose exchanges axes. Observation rows become observation columns; feature columns become feature rows. Every row, column, Gram and multiplication interpretation must be rewritten.

Evidence:
- identify row 3 and feature 5 in both `X_raw` and `X_col`;
- verify that column 3 of `X_col` equals observation `UGV-W03`.

Retrieval prompt:
`Where is the yaw-rate trajectory stored before and after transpose?`

Case hook:
`transposeRepresentation`

Links:
`LO3`, `LO4`, `C09`, `F04`, `F06`

Severity:
critical

## Group B · Shape and semantic-compatibility failures

### M04 · Same length means stack-compatible

Failure class:
`conceptual + metadata`

Trigger:
Several vectors all contain six numbers.

Wrong belief:
`They can be stacked because their shapes match.`

Why tempting:
Array libraries require equal shapes for standard stacking operations.

Correction:
Equal shape is only a structural gate. Valid stacking also requires identical feature definitions, order, units, frame, acquisition contract and schema version.

Evidence:
- compare two shape-identical vectors with swapped wheel columns;
- show that numeric stacking succeeds while the schema checksum fails.

Retrieval prompt:
`Which checks remain after x.shape == y.shape returns true?`

Case hook:
`INVALID_SWAP_WHEEL_COLUMNS_STALE_SCHEMA`

Links:
`LO1`, `LO8`, `C04`, `C15`, `F01`, `F08`

Severity:
critical

### M05 · Matrix shape defines matrix meaning

Failure class:
`conceptual`

Trigger:
A matrix has shape `(8,6)`.

Wrong belief:
`It must contain eight UGV observations and six locked telemetry features.`

Why tempting:
The accepted case also has shape `8 x 6`.

Correction:
Shape describes axis lengths. Meaning comes from orientation, observation metadata, feature schema, units and version.

Evidence:
- construct an unrelated `8 x 6` numeric matrix;
- show that it fails the locked schema checksum and metadata contract.

Retrieval prompt:
`What evidence turns a numeric 8 x 6 array into UGV_TELEMETRY_8X6?`

Links:
`LO1`, `LO6`, `C04`, `C15`, `F01`

Severity:
critical

### M06 · Feature order is cosmetic

Failure class:
`metadata + engineering`

Trigger:
Columns are permuted but shape remains `8 x 6`.

Wrong belief:
`The model sees the same six features, so order does not matter.`

Why tempting:
Column names may still appear somewhere in metadata, and shape checks continue to pass.

Correction:
Feature order is part of the interface. Reordering numeric columns requires the identical permutation of schema, units, preprocessing parameters and every downstream model artifact.

Evidence:
- swap `omega_left` and `omega_right` values while retaining the original schema;
- demonstrate the expected `feature_order_mismatch` and checksum failure.

Retrieval prompt:
`Which artifacts must change together when columns are permuted?`

Case hook:
`INVALID_SWAP_WHEEL_COLUMNS_STALE_SCHEMA`

Links:
`LO1`, `LO6`, `LO8`, `C16`, `F01`, `F05`, `F10`

Severity:
critical

### M07 · Correct feature name proves correct unit

Failure class:
`metadata + engineering`

Trigger:
A column is still labelled `omega_left`.

Wrong belief:
`The values are comparable because the feature ID is unchanged.`

Why tempting:
Feature names are often checked while units are ignored.

Correction:
Feature identity includes unit and acquisition contract. Values converted to rpm cannot remain declared as rad/s.

Evidence:
- compare the canonical left-wheel values with the locked rpm-converted negative variant;
- show the shape and feature name remain valid while the unit contract fails.

Retrieval prompt:
`What must be updated when rad/s values are converted to rpm?`

Case hook:
`INVALID_OMEGA_LEFT_VALUES_IN_RPM_STALE_UNIT`

Links:
`LO1`, `LO6`, `C15`, `C16`, `F01`

Severity:
critical

### M08 · Schema version is optional metadata

Failure class:
`metadata`

Trigger:
Values, feature names and shape are unchanged.

Wrong belief:
`A stale or fabricated schema version cannot affect the calculation.`

Why tempting:
Version strings do not participate in arithmetic.

Correction:
Version identifies the interface under which arithmetic is interpreted. A payload labelled V2 while carrying the V1 contract must be rejected.

Evidence:
- verify that the V1 checksum does not authorize a V2 declaration;
- require exact version and checksum agreement before stacking or inference.

Retrieval prompt:
`Why can a numerically identical matrix still be incompatible with a model?`

Case hook:
`INVALID_SCHEMA_VERSION_V2_WITH_V1_PAYLOAD`

Links:
`LO1`, `LO6`, `LO8`, `C15`, `C16`, `F01`

Severity:
major

## Group C · Indexing, slicing and metadata failures

### M09 · Slicing numeric values is enough

Failure class:
`notation + metadata`

Trigger:
A row or column subset is selected successfully.

Wrong belief:
`The sliced matrix is self-describing.`

Why tempting:
The numeric operation returns an array with the expected shape.

Correction:
Observation subsets must carry the corresponding IDs and timestamps. Feature subsets must carry the corresponding schema and units in the same order.

Evidence:
- extract `X_raw[2:5,2:5]`;
- require observation IDs `UGV-W03–UGV-W05` and features `a_long, a_lat, yaw_rate` beside the 3 x 3 values.

Retrieval prompt:
`Which metadata arrays must be sliced with X[I,J]?`

Case hook:
`lockedExtractions.dataBlock`

Links:
`LO3`, `LO6`, `C03`, `C16`, `F05`

Severity:
major

### M10 · Timestamp is automatically feature 7

Failure class:
`conceptual + engineering`

Trigger:
Timestamps are numeric and available for every observation.

Wrong belief:
`Append time to X because models require numeric input.`

Why tempting:
A timestamp can be converted into a number and concatenated without a shape error.

Correction:
Timestamp is observation metadata in the locked case. Promoting it to a feature requires an explicit feature-engineering contract, new schema version, unit and downstream regeneration.

Evidence:
- show that appending time changes shape from `8 x 6` to `8 x 7`;
- show that the locked feature checksum no longer matches.

Retrieval prompt:
`What contract changes if timestamp becomes a model feature?`

Links:
`LO6`, `C19`, `F01`

Severity:
major

## Group D · Preprocessing and derived-object overclaims

### M11 · Centering and scaling are the same operation

Failure class:
`conceptual + notation`

Trigger:
Both steps appear inside one preprocessing pipeline.

Wrong belief:
`Subtracting the mean normalizes feature scales.`

Why tempting:
Software documentation and informal prose often use “normalization” loosely.

Correction:
Centering subtracts `mu`; scaling divides by a declared scale vector; vector normalization changes individual observation length. Use `X_raw`, `X_c` and `X_s` separately.

Evidence:
- compute the locked `mu` and `X_c`;
- show wheel-speed and acceleration columns still have different units and scales after centering.

Retrieval prompt:
`Which quantity becomes zero after centering, and which quantity becomes one after standardization?`

Case hook:
`meanVector`, `centeredMatrix`

Links:
`LO7`, `C20`, `F13`, `F14`, `F15`

Severity:
critical

### M12 · Refit preprocessing on live data

Failure class:
`engineering + API`

Trigger:
Live data have a different mean from training/reference data.

Wrong belief:
`Recompute the mean and scale on every incoming batch to keep data centered.`

Why tempting:
The resulting live batch will have visually clean zero means.

Correction:
If the downstream model expects a locked reference preprocessing contract, later data must reuse that contract. Refit only through an explicit retraining/versioning workflow.

Evidence:
- distinguish `fit` from `transform`;
- show that independent centering changes the representation and can hide distribution shift.

Retrieval prompt:
`Whose mean is allowed in X_live_c = X_live - 1 mu^T?`

Links:
`LO7`, `LO8`, `C17`, `C18`, `F14`, `F15`

Severity:
critical

### M13 · Raw Gram matrix is covariance

Failure class:
`conceptual + algebra`

Trigger:
The learner computes `X_raw^T X_raw` and obtains a symmetric `6 x 6` matrix.

Wrong belief:
`Symmetric feature-feature matrix means covariance.`

Why tempting:
Covariance is often implemented using a centered cross-product matrix.

Correction:
`X_raw^T X_raw` is a raw feature Gram matrix. The locked covariance preview requires `X_c`, divisor `m-1` and the declared row-observation orientation.

Evidence:
- compare F11 and F16;
- identify centering and normalization assumptions missing from the raw Gram object.

Retrieval prompt:
`Which exact assumptions turn a feature Gram matrix into the F16 sample covariance?`

Case hook:
`previewOnlyDerivedObjects.sampleCovariance`

Links:
`LO5`, `LO7`, `C11`, `C13`, `C14`, `F11`, `F16`

Severity:
critical

### M14 · Mixed-unit raw columns are directly comparable

Failure class:
`engineering inference`

Trigger:
A distance, Gram or covariance calculation returns numbers without error.

Wrong belief:
`All six feature columns contribute fairly because they are in one matrix.`

Why tempting:
Matrix algebra treats all entries as real numbers.

Correction:
Wheel speeds, accelerations, yaw rate and current have different units and scales. Geometric comparison requires a task-specific scale policy. Pass 5 intentionally locks no scale vector.

Evidence:
- compare units in the feature schema;
- explain why centering alone does not remove unit differences.

Retrieval prompt:
`Why was no scale vector locked in CASE_C01_L06_V1?`

Case hook:
`previewOnlyDerivedObjects.scalePolicy`

Links:
`LO7`, `C20`, `F11`, `F12`, `F15`

Severity:
major

## Group E · Rank, PCA and diagnosis overclaims

### M15 · Rank equals the number of physical UGV modes

Failure class:
`conceptual + engineering inference`

Trigger:
Software reports an integer matrix rank.

Wrong belief:
`The UGV has that many physical operating modes.`

Why tempting:
Rank counts independent algebraic directions and “mode” is used informally in engineering.

Correction:
Rank belongs to a named matrix and criterion. Numerical rank also requires tolerance. Physical mode interpretation requires a model, preprocessing contract and engineering evidence outside §1.6.

Evidence:
- state only `rank(X) <= min(8,6)` in this lesson;
- refuse a physical conclusion from the bound or software default.

Retrieval prompt:
`What additional contract is needed before an algebraic rank can be interpreted physically?`

Case hook:
`previewOnlyDerivedObjects.rankPolicy`

Links:
`LO9`, `C21`, `C22`, `F18`

Severity:
critical

### M16 · Low variance means useless feature

Failure class:
`engineering inference`

Trigger:
A feature changes little in the eight-window case.

Wrong belief:
`A low-variance feature should be removed.`

Why tempting:
PCA and variance filters often emphasize high-variance directions.

Correction:
Low variance under one short dataset does not prove task irrelevance. A nearly constant feature may encode a safety limit, operating condition or rare-event boundary.

Evidence:
- distinguish descriptive variance from predictive or safety importance;
- defer feature removal policy.

Retrieval prompt:
`Can a low-variance battery-current feature still be operationally important? Why?`

Links:
`LO7`, `LO9`, `C22`

Severity:
major

### M17 · Covariance preview identifies PCA components

Failure class:
`scope + engineering inference`

Trigger:
The locked case includes a covariance preview matrix.

Wrong belief:
`The principal components and retained dimension are now known.`

Why tempting:
PCA commonly begins from covariance or SVD.

Correction:
F16 only verifies an assumption-scoped covariance construction. Eigenvectors, singular values, component selection and retained-energy policy are deferred.

Evidence:
- identify which quantities are absent from the case;
- state that no PCA result is locked.

Retrieval prompt:
`What additional computations and criteria would a PCA claim require?`

Case hook:
`previewOnlyDerivedObjects.sampleCovariance`

Links:
`LO9`, `C22`, `F16`

Severity:
major

### M18 · A data audit diagnoses a fault

Failure class:
`engineering inference`

Trigger:
A column has unusual scale, mean, variance or schema mismatch.

Wrong belief:
`The audit proves a wheel, IMU or battery fault.`

Why tempting:
Bad data and physical faults can produce similar numerical symptoms.

Correction:
The audit detects contract violations or suspicious data properties. It does not identify a physical cause without additional diagnostics and domain evidence.

Evidence:
- classify each invalid variant as interface/data-contract failure;
- avoid mapping it to a component fault.

Retrieval prompt:
`What can the audit conclude, and what cause remains undetermined?`

Links:
`LO6`, `LO8`, `C24`

Severity:
critical

## Failure-class matrix

| Class | Items | Primary defense |
|---|---|---|
| conceptual | M03, M04, M05, M10, M11, M13, M15, M16, M17 | governing question, contrast examples, retrieval |
| notation | M01, M03, M09, M11 | shape tables, symbol contract, rewrite tasks |
| API | M01, M02, M12 | executable shape assertions and fit/transform distinction |
| metadata | M04, M06, M07, M08, M09 | schema checksum, units, version and aligned slicing |
| engineering inference | M06, M07, M10, M12, M14, M15, M16, M17, M18 | bounded language and prohibited claims |
| scope | M17 | explicit defer labels |

## Negative-case coverage

| Case variant | Primary misconception links | Expected detection |
|---|---|---|
| `INVALID_SWAP_WHEEL_COLUMNS_STALE_SCHEMA` | M04, M06 | feature-order and checksum mismatch |
| `INVALID_OMEGA_LEFT_VALUES_IN_RPM_STALE_UNIT` | M07, M14 | unit-contract mismatch |
| `INVALID_TRANSPOSED_WITH_ROW_OBSERVATION_LABEL` | M01, M03 | orientation and metadata-length mismatch |
| `INVALID_SCHEMA_VERSION_V2_WITH_V1_PAYLOAD` | M05, M08 | version and checksum mismatch |

## Retrieval distribution requirements

Future artifacts must include at least:
- four orientation/shape retrievals from M01–M05;
- three metadata/schema retrievals from M06–M10;
- three preprocessing/derived-object retrievals from M11–M14;
- three bounded-interpretation retrievals from M15–M18;
- one code-audit task using all four invalid variants;
- one professor Q&A sequence in which a shape-correct payload is rejected for semantic reasons.

## Pass 6 decision

- Misconceptions M01–M18 are locked.
- Failure classes and severities are locked.
- All four invalid case variants are mapped.
- Covariance, rank, PCA and physical-fault overclaims are explicitly blocked.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L06_CORE_CONTENT_PASS_07`
