# §1.5 · Không gian con và biểu diễn dữ liệu

## Baseline audit

Status: `PASS_01_BASELINE_AUDIT_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Chapter:
`MATH-VN-C01-vector_trong_khong_gian_`

Current durable source:
`subjects/math/data/theory_lecture_content.json`

Current runtime record:
- one target occurrence;
- 16 slides;
- minimum-count compliant;
- no accepted specialist artifact package;
- no dedicated core, reference, slideshow, full-view, normalization or integration file.

## Role in Chapter 1

§1.5 is the bridge between:
- §1.4: basis, span and coordinates;
- §1.6: vectors organized as a data matrix.

It must answer:

> How can a low-dimensional linear structure explain, compress and diagnose high-dimensional engineering data?

It must not become:
- a duplicate of §1.4;
- a full PCA/SVD course taught before the matrix chapter;
- a loose anomaly-detection tutorial without mathematical contracts;
- a collection of NumPy snippets detached from geometry.

## Current 16-slide baseline

The existing record already covers these roles:
1. problem framing;
2. deep essence;
3. counter-intuition;
4. engineering bridge;
5. notation;
6. core formula;
7. assumption gate;
8. mini case;
9. interpretation;
10. simulation;
11. common mistakes;
12. application;
13. practice;
14. professor Q&A;
15. bridge to the data-matrix lesson;
16. takeaway.

This role skeleton is reusable, but the current content is only an input draft. It is not the accepted academic package.

## Strengths already present

- Correctly introduces a linear subspace as a set containing zero and closed under addition and scalar multiplication.
- Connects span, dimension and rank.
- Distinguishes algebraic rank from effective rank in noisy data at a high level.
- Mentions centering, scaling, noise and outliers before low-dimensional modelling.
- Uses projection residual as an anomaly score.
- Includes an SVD-based exploratory lab.
- Connects the lesson to vibration monitoring, sensor fusion, compression and dimensionality reduction.

## Critical academic gaps

### 1. Exact subspace, affine set and near-subspace are not separated sharply enough

The final lesson must distinguish:
- exact linear subspace `U` through the origin;
- affine model `mu + U` after centering;
- noisy observation `x = mu + Bz + epsilon` lying near, not exactly in, the model.

Without this separation, learners may incorrectly call any low-dimensional cloud a linear subspace.

### 2. Projection contract is incomplete

The current draft states projection residual but does not lock the two principal formulas:
- orthonormal basis: `P_U = QQ^T`;
- general full-column-rank basis: `P_U = B(B^T B)^{-1}B^T`.

The lesson must state when each formula is valid and why `BB^T` is not generally a projector.

### 3. Rank language needs a precise object

Every rank statement must identify the matrix being ranked:
- basis matrix;
- centred data matrix;
- covariance matrix;
- measurement matrix.

“Data has rank k” is insufficient without orientation, centering and tolerance.

### 4. Effective rank needs a declared tolerance or energy rule

The final package must distinguish:
- exact algebraic rank;
- numerical rank under a tolerance;
- retained dimension under an energy criterion.

It must not present one arbitrary threshold as universal.

### 5. PCA and SVD are currently named before their contracts are ready

§1.5 may use them as preview tools, but must defer:
- full derivation;
- covariance eigendecomposition;
- complete SVD theory;
- algorithmic complexity;
- model-selection doctrine.

Those belong to later matrix and statistics units.

### 6. No fixed engineering case runs through the lesson

The accepted lesson needs one invariant case from problem framing to final transfer. Preferred domain:
- multi-sensor vibration monitoring of a rotating machine;
- normal operation explained by two dominant physical modes;
- centred observations near a two-dimensional subspace;
- projection residual used only as a diagnostic score, not an automatic fault diagnosis.

All numbers, units, matrix orientation and thresholds must remain consistent across slides and artifacts.

### 7. Existing code is exploratory, not verification-grade

The final code must include:
- deterministic seed or fixed data;
- explicit row/column convention;
- shape checks;
- centering step;
- orthonormality check when using `QQ^T`;
- reconstruction and residual assertions;
- no claim that a large residual alone identifies a fault cause.

### 8. Source trace and formula registry are absent

The accepted package requires:
- stable slide IDs;
- one source slide per runtime slide;
- formula IDs and aliases;
- trace from claim to source section;
- no unsupported theorem or engineering assertion.

## Scope boundary

### Required in §1.5

- linear subspace test;
- span and dimension as structure;
- exact versus affine versus near-subspace;
- basis matrix and coordinates inside a subspace;
- orthogonal projection and residual;
- rank and numerical/effective rank at an introductory level;
- centering, scale, noise and outlier gates;
- one fixed engineering case;
- deterministic computational verification;
- bridge to the data-matrix lesson.

### Deferred to later lessons

- full four fundamental subspaces treatment;
- rank-nullity proof;
- complete least-squares derivation;
- full SVD derivation;
- covariance eigendecomposition;
- PCA model-selection doctrine;
- robust PCA algorithms;
- nonlinear manifolds and kernel methods.

## Academic workflow for §1.5

The lesson will use a new isolated 14-pass workflow:

1. baseline audit;
2. learning contract and scope boundary;
3. source map and terminology contract;
4. canonical formula registry;
5. fixed engineering-case contract;
6. misconception and failure-mode map;
7. core lesson architecture;
8. worked examples and derivations;
9. deterministic computational lab;
10. retrieval and professor-Q&A design;
11. reference artifact;
12. full-view and normalization artifacts;
13. slideshow artifact and runtime import package;
14. academic acceptance.

Runtime integration follows only after academic acceptance.

## Pass 1 decision

- Keep the existing 16-slide record unchanged as the baseline input.
- Do not merge or overwrite runtime content yet.
- Do not reuse §1.4 numerical invariants as if they were §1.5 evidence.
- Do not create a new slideshow engine.
- Do not enable E236, E237 or E238.
- Keep E235 unchanged.
- Start Pass 2 by defining measurable learning outcomes, prerequisite gates and explicit deferrals.

## Next task

`THEORY_C01_L05_LEARNING_CONTRACT_PASS_02`
