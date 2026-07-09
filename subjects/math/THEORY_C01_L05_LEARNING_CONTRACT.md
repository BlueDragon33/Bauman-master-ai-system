# §1.5 · Không gian con và biểu diễn dữ liệu

## Learning contract

Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

## 1. Governing question

> Khi nào dữ liệu nhiều chiều có thể được giải thích bằng một cấu trúc tuyến tính thấp chiều, và ta kiểm tra chất lượng biểu diễn đó như thế nào?

The lesson must connect pure linear algebra to engineering data without treating every data cloud as an exact subspace.

## 2. Prerequisite gates

Before entering §1.5, the learner must be able to:

### Gate P1 · Vector contract
- distinguish vector value from units, frame, time and feature order;
- compute vector addition, scalar multiplication and Euclidean norm;
- interpret a vector as an ordered engineering observation.

### Gate P2 · Dot product and orthogonality
- compute a dot product;
- test orthogonality;
- understand that an orthogonality claim depends on the declared inner product.

### Gate P3 · Basis, span and coordinates
- explain span as all linear combinations of generators;
- distinguish spanning from linear independence;
- reconstruct a vector from basis coordinates;
- understand why an orthonormal basis permits dot-product coordinates.

### Gate P4 · Matrix shape literacy
- read a basis matrix `B in R^(n x k)` as `k` basis columns in an ambient `R^n`;
- multiply `Bc` with compatible dimensions;
- distinguish a feature dimension from a sample count.

A learner who fails P2 or P3 should return to §1.3 or §1.4 rather than memorize projection formulas.

## 3. Measurable learning outcomes

At the end of §1.5, the learner must be able to demonstrate all outcomes below.

### LO1 · Classify the geometric model
Given a set or data model, classify it as:
- a linear subspace;
- an affine set `mu + U`;
- a noisy near-subspace model;
- or not closed under the required operations.

Evidence:
- checks zero membership, closure under addition and scalar multiplication;
- does not call a shifted line or plane a linear subspace.

### LO2 · Connect span, basis, dimension and rank
Given generators or a basis matrix `B`, determine:
- the generated subspace `col(B)`;
- whether columns are redundant;
- `dim(col(B))`;
- the rank object being discussed.

Evidence:
- names the matrix and its orientation;
- does not equate number of columns with dimension when columns are dependent.

### LO3 · Select the valid orthogonal projector
For a subspace represented by columns:
- use `P_U = QQ^T` when `Q^TQ = I`;
- use `P_U = B(B^TB)^(-1)B^T` only when `B` has full column rank;
- recognize that `BB^T` is not generally the orthogonal projector.

Evidence:
- verifies compatible dimensions;
- checks `P_U^T = P_U` and `P_U^2 = P_U` numerically or algebraically;
- states the required assumptions.

### LO4 · Decompose a centred observation
Given `y = x - mu`, compute:
- explained component `y_hat = P_U y`;
- residual `r = y - y_hat`;
- residual norm `||r||_2`.

Evidence:
- verifies `Q^Tr approximately 0` for an orthonormal model;
- reconstructs `y = y_hat + r`;
- does not project an uncentred sample while claiming an affine model was handled correctly.

### LO5 · Distinguish exact, numerical and retained dimension
Explain the difference between:
- exact algebraic rank;
- numerical rank under a declared tolerance;
- retained dimension under an energy or engineering criterion.

Evidence:
- identifies the singular values being thresholded;
- states the tolerance or retention rule;
- avoids presenting a software default as a physical truth.

### LO6 · Interpret low-dimensional structure without overclaiming
Use projection residual as a diagnostic indicator while explaining its limits.

Evidence:
- a large residual means the observation is poorly explained by the current model;
- it may indicate a new operating regime, transient, calibration drift, outlier, sensor fault or an underspecified model;
- it does not identify the cause by itself.

### LO7 · Implement a deterministic verification pipeline
Write or audit code that:
- fixes the sample/feature orientation;
- checks shapes;
- centres data;
- obtains or verifies an orthonormal basis;
- computes projection and residual;
- checks reconstruction and orthogonality;
- reports numerical rank with an explicit tolerance.

Evidence:
- deterministic input or seeded generation;
- assertions for the mathematical invariants;
- no silent transpose or broadcasting error.

### LO8 · Transfer to the next lesson
Explain why multiple observations should be assembled into a data matrix and what information rank and singular directions will expose there.

Evidence:
- states whether samples are rows or columns;
- identifies the bridge to §1.6 without deriving the full SVD/PCA pipeline here.

## 4. Fixed engineering-case boundary

The accepted lesson will use one recurring case.

### Case name
`ROTATING_MACHINE_4CH_2MODE`

### Physical setting
- rotating machine under normal operating conditions;
- four synchronized vibration channels;
- each observation is a fixed-window feature vector;
- feature order is fixed and documented;
- all four components use compatible acceleration units after calibration.

### Mathematical model

For observation `x in R^4`:

`y = x - mu`

`y = Qz + epsilon`

where:
- `mu in R^4` is the normal-operation mean;
- `Q in R^(4 x 2)` contains two orthonormal dominant-mode directions;
- `Q^TQ = I_2`;
- `z in R^2` contains low-dimensional coordinates;
- `epsilon in R^4` is the unexplained component.

Projection and residual:

`y_hat = QQ^T y`

`r = (I - QQ^T)y`

`score(x) = ||r||_2`

### Permitted conclusions
- two coordinates explain the part represented by the normal model;
- the residual quantifies the part outside that model;
- score comparison is meaningful only under the same preprocessing, units, channel order and model version.

### Prohibited conclusions
- a large score proves a bearing fault;
- the model remains valid after changing sensor order or scale;
- a two-mode model is universally optimal;
- a low residual proves all sensors are healthy;
- a software rank result is the physical number of modes without a tolerance and engineering review.

### Numeric policy
Pass 5 will lock one deterministic numeric instance. Until then:
- no slide may invent independent numbers;
- no threshold may be called universal;
- no alternate case may replace the four-channel model halfway through the lesson.

## 5. Explicit scope

### Must be taught
- linear subspace conditions;
- affine and near-subspace distinction;
- column-space interpretation of a basis matrix;
- dimension and rank at an introductory but precise level;
- orthogonal projection;
- residual and orthogonality;
- centering and scale gates;
- numerical-rank tolerance;
- deterministic verification;
- engineering interpretation and limits.

### May be previewed, not derived fully
- reduced SVD;
- principal directions;
- retained-energy dimension;
- anomaly scoring;
- denoising by low-dimensional reconstruction.

### Must be deferred
- four fundamental subspaces as a complete theory;
- rank-nullity proof;
- pseudoinverse theory beyond the projection formula context;
- complete least-squares derivation;
- covariance eigendecomposition;
- full PCA derivation and model selection;
- robust PCA;
- nonlinear manifold learning;
- kernel PCA;
- probabilistic PCA;
- fault classification.

## 6. Mastery evidence

A learner passes the lesson only when all six evidence groups are present.

### E1 · Classification
Correctly classify at least:
- one exact subspace;
- one affine set;
- one non-subspace;
- one noisy near-subspace model.

### E2 · Projection derivation
Derive or justify both projector forms and state their assumptions.

### E3 · Invariant checks
Verify:
- symmetry;
- idempotence;
- reconstruction;
- residual orthogonality.

### E4 · Rank judgement
Report exact or numerical rank with the matrix object, orientation and tolerance stated.

### E5 · Engineering case
Interpret coordinates and residual for `ROTATING_MACHINE_4CH_2MODE` without diagnosing a specific fault from residual alone.

### E6 · Code audit
Find and correct at least three implementation defects such as:
- missing centering;
- wrong sample orientation;
- using `BB^T` for a non-orthonormal basis;
- hidden tolerance;
- channel-order mismatch;
- nondeterministic test data.

## 7. Acceptance gates for future artifacts

No core, reference, slideshow or runtime import artifact may be approved unless it:
- maps every major claim to one learning outcome;
- keeps the fixed case contract unchanged;
- declares assumptions beside formulas;
- distinguishes exact and approximate statements;
- includes at least one retrieval check for each LO1–LO8 cluster;
- contains no more mathematics than the declared scope;
- preserves one source slide to one runtime slide;
- uses at least 16 slides but treats 16 as a minimum, not a target ceiling.

## 8. Source anchors used to validate this contract

- MIT OpenCourseWare 18.06, Lecture 15: projection onto subspaces as the algebraic basis of best approximation.
- NumPy `matrix_rank`: numerical rank depends on singular values and a tolerance; measurement uncertainty can justify a tolerance different from floating-point defaults.
- NumPy `svd`: reduced SVD shapes and reconstruction must be handled explicitly.
- NIST Engineering Statistics Handbook: principal components belong to a broader data-analysis treatment and are previewed rather than fully derived here.

## Pass 2 decision

- Learning outcomes LO1–LO8 are locked.
- Prerequisite gates P1–P4 are locked.
- The fixed case domain and mathematical boundary are locked.
- Numeric values remain intentionally unlocked until Pass 5.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L05_SOURCE_MAP_TERMINOLOGY_PASS_03`
