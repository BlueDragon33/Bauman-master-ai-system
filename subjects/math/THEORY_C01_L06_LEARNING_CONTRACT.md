# §1.6 · Từ vector sang ma trận dữ liệu

## Learning contract

Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

## 1. Governing question

> Làm thế nào ghép nhiều vector quan sát thành một ma trận dữ liệu mà vẫn bảo toàn ý nghĩa của từng hàng, từng cột, đơn vị, thứ tự đặc trưng và trục lấy mẫu?

The lesson must make matrix shape a semantic contract, not merely a software output.

A learner must leave §1.6 understanding that a numeric rectangle becomes an engineering data matrix only after the observation axis, feature axis, ordering, units and acquisition contract are declared.

## 2. Canonical data-matrix contract

### 2.1 Project convention

The accepted convention for this lesson is:

`X in R^(m x n)`

where:
- `m` is the number of observations;
- `n` is the number of features per observation;
- row `i` stores observation `x^(i)^T in R^(1 x n)`;
- column `j` stores feature trajectory `f_j in R^m` across all observations;
- entry `x_ij` means feature `j` measured or computed for observation `i`.

The underlying observation vector remains a column vector:

`x^(i) in R^n`

and is inserted into the data matrix as a row:

`X = [x^(1)^T; x^(2)^T; ...; x^(m)^T] in R^(m x n)`

### 2.2 Alternative convention

Some mathematics and signal-processing sources store observations as columns:

`X_col = [x^(1) x^(2) ... x^(m)] in R^(n x m)`

The conversion is:

`X_col = X^T`

The learner must state the active convention before using a formula. A transpose is a declared convention conversion, not a repair button for incompatible code.

### 2.3 Required metadata

A valid lesson data object is conceptually:

`D = (X, observation_index, feature_schema, units, schema_version)`

where:
- `observation_index` maps each row to time, window or sample identity;
- `feature_schema` is an ordered list of exactly `n` feature names;
- `units` is an ordered list aligned one-to-one with `feature_schema`;
- `schema_version` identifies the acquisition and feature contract.

The metadata may be stored outside the numeric matrix, but it may never be discarded from the reasoning.

### 2.4 Valid stacking gate

Vectors may be stacked only when all observations share:
- the same dimension `n`;
- the same feature definitions;
- the same feature order;
- compatible units for each corresponding feature;
- the same coordinate frame and sign convention when physical vectors are used;
- a declared acquisition or preprocessing version.

Equal length alone is insufficient.

## 3. Prerequisite gates

Before entering §1.6, the learner must pass all gates below.

### Gate P1 · Vector semantics
- distinguish a vector value from frame, units, time and feature order;
- read `x in R^n` as an ordered object rather than an unordered bag of numbers;
- identify when two equal-length vectors are semantically incompatible.

### Gate P2 · Coordinates and basis
- distinguish a physical vector from its coordinate tuple;
- reconstruct a vector from declared coordinates and basis;
- recognize that changing basis or feature order changes coordinates even when the underlying object is related.

### Gate P3 · Subspace and representation boundary
- explain span, basis and dimension;
- distinguish exact subspace, affine model and noisy near-subspace;
- understand that a batch of observations is not automatically a basis or a subspace.

### Gate P4 · Shape literacy
- read row, column and matrix dimensions;
- predict the shape of a transpose;
- use indexing notation `x_ij` without swapping observation and feature roles;
- distinguish sample count from feature dimension.

A learner who fails P1 or P4 must return to earlier material instead of memorizing stacking syntax.

## 4. Measurable learning outcomes

At the end of §1.6, the learner must demonstrate all outcomes below.

### LO1 · Validate batch compatibility

Given several vectors and metadata, decide whether they may be stacked into one data matrix.

Evidence:
- verifies equal dimension;
- compares ordered feature schema and units;
- rejects silent channel reordering;
- rejects vectors from incompatible frames or preprocessing versions;
- explains why equal shape does not prove compatibility.

### LO2 · Assemble the canonical row-observation matrix

Given `m` compatible observations `x^(i) in R^n`, construct:

`X = [x^(1)^T; ...; x^(m)^T] in R^(m x n)`

Evidence:
- names `m` and `n` correctly;
- states that rows are observations and columns are features;
- reconstructs any observation using row extraction;
- reconstructs any feature trajectory using column extraction.

### LO3 · Interpret entries, rows, columns and slices

For `X in R^(m x n)`, interpret:
- scalar `x_ij`;
- row `X[i,:]`;
- column `X[:,j]`;
- row subset `X[I,:]`;
- feature subset `X[:,J]`;
- block `X[I,J]`.

Evidence:
- states the resulting shape of each extraction;
- preserves feature names and units after slicing;
- does not call a feature column an observation vector.

### LO4 · Translate between row-observation and column-observation conventions

Convert correctly between:

`X in R^(m x n)`

and:

`X_col = X^T in R^(n x m)`

Evidence:
- states both shapes before transposing;
- rewrites row and column interpretations after conversion;
- translates a formula rather than copying it unchanged across conventions;
- never transposes only because an operation raised a dimension error.

### LO5 · Distinguish the matrix from its derived objects

Given `X in R^(m x n)`, identify shapes and basic roles of:
- `X^T in R^(n x m)`;
- `X^T X in R^(n x n)`;
- `X X^T in R^(m x m)`.

Evidence:
- identifies `X^T X` as a feature-feature Gram-type object;
- identifies `X X^T` as an observation-observation Gram-type object;
- does not call either matrix a covariance matrix without centering and normalization assumptions;
- does not infer physical modes from shape alone.

### LO6 · Preserve observation and feature identity

Maintain explicit mappings between:
- row index and observation identity;
- column index and feature name;
- feature name and unit;
- matrix version and preprocessing contract.

Evidence:
- catches a permutation of feature columns even when matrix shape is unchanged;
- explains why timestamp is usually metadata rather than an automatically appended feature;
- prevents train/test or reference/live data from using different feature ordering.

### LO7 · Separate raw, centred and scaled matrices

Use distinct notation:
- `X_raw` for acquired or computed raw features;
- `X_c` for centred features;
- `X_s` for scaled or standardized features.

Evidence:
- never overwrites the semantic distinction with one ambiguous symbol `X`;
- states the mean and scale source;
- does not apply distances, dot products, Gram matrices or later PCA interpretation to mixed-unit raw features without a declared policy;
- understands that centering and scaling are operations, not properties guaranteed by matrix shape.

### LO8 · Implement a deterministic, shape-safe assembly pipeline

Write or audit code that:
- checks every observation shape;
- checks schema and units;
- stacks observations along a declared axis;
- asserts final matrix shape;
- stores or validates observation and feature metadata;
- detects a silent transpose or column permutation.

Evidence:
- deterministic input or seeded generation;
- explicit `axis` or row-wise stacking operation;
- assertions for shape, feature count and schema order;
- no broadcasting used as an accidental substitute for stacking;
- no automatic flattening that destroys observation boundaries.

### LO9 · Explain the downstream bridge without overclaiming

Explain why a data matrix enables later study of:
- rank;
- column and row spaces;
- linear transformations;
- least-squares models;
- singular directions;
- PCA after a valid preprocessing contract.

Evidence:
- states which objects remain deferred;
- does not call matrix rank the physical number of modes without tolerance and model context;
- does not derive a full PCA or SVD pipeline inside §1.6.

## 5. Fixed engineering-case boundary

The accepted lesson will use one recurring case.

### Case name

`UGV_TELEMETRY_8X6`

### Physical setting

- one unmanned ground vehicle;
- eight ordered observation windows;
- all observations use the same acquisition configuration;
- no missing values in the canonical teaching case;
- observation timing is stored as metadata, not silently appended as a feature;
- feature schema is fixed and versioned.

### Canonical feature order

For each observation `x^(i) in R^6`:

1. `omega_left` in `rad/s`;
2. `omega_right` in `rad/s`;
3. `a_long` in `m/s^2`;
4. `a_lat` in `m/s^2`;
5. `yaw_rate` in `rad/s`;
6. `battery_current` in `A`.

The raw data matrix is:

`X_raw in R^(8 x 6)`

with rows as observation windows and columns in the locked feature order above.

### Required metadata

- `observation_id[8]`;
- `timestamp[8]` with strictly increasing order;
- `feature_schema[6]`;
- `units[6]`;
- `schema_version`;
- acquisition configuration identifier.

### Permitted conclusions

- the matrix stores eight comparable observations under one declared schema;
- row extraction retrieves one observation;
- column extraction retrieves one feature trajectory across the eight windows;
- shape checks can detect missing or extra observations/features;
- metadata checks can detect semantic mismatch even when shape is unchanged;
- the matrix is ready for later preprocessing only after validation.

### Prohibited conclusions

- mixed-unit raw columns are automatically comparable under Euclidean distance;
- `X_raw^T X_raw` is automatically a covariance matrix;
- matrix rank is automatically the number of physical UGV modes;
- a column permutation is harmless because dimensions remain `8 x 6`;
- timestamps may be appended as feature 7 without changing the schema;
- a transpose preserves the same row/column interpretation;
- a software operation that runs is therefore semantically valid.

### Numeric policy

Pass 5 will lock one deterministic numeric instance. Until then:
- no slide may invent independent values for the eight observations;
- no feature may change name, order or unit;
- no alternate vehicle case may replace `UGV_TELEMETRY_8X6` halfway through the lesson;
- no centering mean, scale vector, rank tolerance or anomaly threshold may be invented;
- examples may use symbolic entries only when they preserve the fixed `8 x 6` contract.

## 6. Explicit scope

### Must be taught

- observation vector versus data matrix;
- valid and invalid stacking;
- canonical row-observation convention;
- alternative column-observation convention;
- matrix shape as a semantic contract;
- entry, row, column, slice and block interpretation;
- transpose as convention conversion;
- feature schema, order and units;
- observation identity and timing metadata;
- raw, centred and scaled notation;
- shape-safe deterministic code;
- shapes of `X^T`, `X^T X` and `X X^T`;
- bridge to matrix algebra and later data analysis.

### May be previewed, not derived fully

- feature and observation Gram matrices;
- matrix rank;
- row and column spaces;
- centering matrix notation;
- standardization;
- covariance construction;
- SVD and principal directions;
- PCA data pipeline;
- batch inference and train/test matrices.

### Must be deferred

- determinant and matrix inverse theory;
- Gaussian elimination as a complete algorithm;
- four fundamental subspaces as a full theory;
- rank-nullity proof;
- numerical-rank tolerance selection;
- covariance eigendecomposition;
- complete SVD derivation;
- full PCA derivation and retained-energy policy;
- missing-data imputation;
- outlier treatment;
- robust scaling;
- time-series window design;
- tensor batches;
- fault classification or anomaly diagnosis.

## 7. Prohibited shortcuts and misconception intercepts

Future artifacts must explicitly block these shortcuts:

### M1 · Transpose until it runs
Wrong:
- repeatedly transpose arrays until multiplication succeeds.

Correction:
- write the semantic contract and expected shapes before the operation.

### M2 · Same length means compatible
Wrong:
- stack vectors because all contain six numbers.

Correction:
- compare schema, order, units, frame and acquisition version.

### M3 · Shape defines meaning
Wrong:
- assume every `8 x 6` matrix uses eight observations and six features.

Correction:
- orientation must be declared; the same shape can encode another object.

### M4 · Column order is cosmetic
Wrong:
- reorder features without changing metadata or downstream model.

Correction:
- feature order is part of the model interface.

### M5 · Raw Gram equals covariance
Wrong:
- call `X_raw^T X_raw` a covariance matrix.

Correction:
- centering and normalization conventions must be stated first.

### M6 · Rank equals physical modes
Wrong:
- interpret an exact or numerical rank as a physical mode count without model and tolerance context.

Correction:
- rank interpretation belongs to later lessons and requires assumptions.

### M7 · Timestamp is just another feature
Wrong:
- append time automatically to the feature vector.

Correction:
- keep timestamp as observation metadata unless an explicit feature-engineering contract promotes it.

### M8 · Successful code proves valid data
Wrong:
- accept a matrix because NumPy produced an array without error.

Correction:
- software shape validity and engineering semantic validity are separate gates.

## 8. Mastery evidence

A learner passes only when all evidence groups are demonstrated.

### E1 · Compatibility audit

Given five candidate observations, identify which may be stacked and explain every rejection using schema, units, order, frame or version.

### E2 · Matrix assembly

Construct an `m x n` row-observation matrix from column observation vectors and recover selected rows and columns with correct meanings.

### E3 · Convention translation

Translate one formula and one code fragment between row-observation and column-observation conventions, including all shape changes.

### E4 · Index and slice interpretation

Interpret at least:
- one scalar entry;
- one row;
- one feature column;
- one row subset;
- one feature subset;
- one rectangular block.

### E5 · Derived-shape reasoning

For a declared `X in R^(m x n)`, state shapes and roles of `X^T`, `X^T X` and `X X^T`, then explain why neither Gram matrix is automatically covariance.

### E6 · Engineering case

For `UGV_TELEMETRY_8X6`:
- reproduce the six-feature schema in order;
- state the matrix shape;
- identify row and column meanings;
- explain why raw mixed-unit columns need a preprocessing decision before geometric comparison.

### E7 · Code audit

Find and correct at least five defects among:
- wrong stacking axis;
- inconsistent vector length;
- silent feature permutation;
- metadata length mismatch;
- timestamp inserted as an undeclared feature;
- accidental flattening;
- broadcasting instead of stacking;
- stale schema version;
- missing final shape assertion;
- train/live feature-order mismatch.

### E8 · Boundary control

Explain what §1.6 establishes and what is intentionally deferred to matrix algebra, rank, SVD and PCA lessons.

## 9. Acceptance gates for future artifacts

No core, case, formula, reference, slideshow or runtime import artifact may be approved unless it:
- maps every major claim to LO1 through LO9;
- uses the canonical row-observation contract or clearly labels a temporary alternative convention;
- preserves the `UGV_TELEMETRY_8X6` feature order and metadata contract;
- declares matrix shapes beside formulas and code outputs;
- distinguishes raw, centred and scaled matrices;
- places assumptions beside Gram, covariance, rank or preprocessing claims;
- includes misconception intercepts M1 through M8;
- includes deterministic assertions for shape, schema and feature order;
- preserves one source slide to one runtime slide;
- uses at least 16 slides but treats 16 as a minimum, not a target ceiling;
- does not modify runtime content before academic approval;
- does not enable E236, E237 or E238;
- does not modify E235.

## 10. Source anchors used to validate this contract

- NumPy `stack`: joins equal-shape arrays along a new, explicitly selected axis.
- NumPy `vstack`: stacks compatible arrays row-wise and reshapes one-dimensional arrays into rows.
- NumPy `column_stack`: stacks one-dimensional arrays as columns and requires a shared first dimension.
- scikit-learn Common pitfalls: preprocessing learned on one dataset must be applied consistently to later data, and feature interfaces must remain consistent.
- MIT OpenCourseWare 18.06: matrix multiplication and column interpretation provide the linear-algebra bridge for later lessons.

These sources validate software and algebraic behavior only. The engineering feature schema and case boundary are project decisions locked by this contract.

## Pass 2 decision

- Prerequisite gates P1 through P4 are locked.
- Learning outcomes LO1 through LO9 are locked.
- The canonical convention `X in R^(m x n)` with rows as observations is locked.
- The alternative column-observation convention is permitted only when declared and translated explicitly.
- The case `UGV_TELEMETRY_8X6` and its ordered feature schema are locked.
- Numeric values, centering mean, scaling vector and thresholds remain intentionally unlocked until Pass 5.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY_PASS_03`
