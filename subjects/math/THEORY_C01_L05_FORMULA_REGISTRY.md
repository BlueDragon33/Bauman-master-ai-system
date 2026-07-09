# §1.5 · Không gian con và biểu diễn dữ liệu

## Canonical formula registry

Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

## Global shape contract

Unless a formula explicitly overrides this contract:

- ambient dimension: `n`;
- subspace dimension: `k`, with `0 <= k <= n`;
- raw observation: `x in R^n`;
- mean/reference point: `mu in R^n`;
- centred observation: `y = x - mu in R^n`;
- general basis matrix: `B in R^(n x k)`;
- orthonormal basis matrix: `Q in R^(n x k)`;
- coordinates: `c, z in R^k`;
- projector: `P_U in R^(n x n)`;
- residual: `r in R^n`;
- multi-sample matrix, when previewed: `X_c in R^(m x n)` with samples as rows.

Every implementation must assert shapes before numerical work.

## F01 · Linear-subspace closure contract

Canonical statement:

`0 in U`

`u, v in U => u + v in U`

`u in U, alpha in R => alpha u in U`

Question answered:

`Is U a linear subspace of the declared ambient vector space?`

Conditions:
- the ambient vector space and scalar field are declared;
- membership is exact at the mathematical level;
- a numerical dataset is not automatically a subspace.

Checks:
- zero membership;
- closure under addition;
- closure under scalar multiplication.

Common misuse:
- testing only whether a set looks like a line or plane;
- calling a shifted line a linear subspace;
- treating a finite cloud of sampled points as closed under all linear combinations.

Claim links:
`C01`, `LO1`

## F02 · Affine and near-subspace model

Canonical model:

`x = mu + y`

`y = Qz + epsilon`

Equivalent:

`x = mu + Qz + epsilon`

Question answered:

`How is a noisy observation represented relative to a shifted low-dimensional model?`

Conditions:
- `mu`, `Q`, channel order, units and preprocessing are fixed;
- `Q^TQ = I_k` for the orthonormal form;
- `epsilon` is an unexplained component, not automatically random Gaussian noise.

Interpretation:
- `mu + col(Q)` is an affine model;
- `epsilon = 0` gives exact membership in the affine model;
- small nonzero `epsilon` gives a near-subspace model.

Common misuse:
- omitting `mu` and then claiming the raw cloud lies in a linear subspace through the origin;
- diagnosing a specific physical fault from `epsilon` alone.

Claim links:
`C11`, `C12`, `LO1`, `LO4`, `LO6`

## F03 · Span and column-space identity

Canonical statement:

`U = span(b_1, ..., b_k) = col(B)`

where:

`B = [b_1 ... b_k]`

Question answered:

`Which vectors are exactly representable by the generators?`

Conditions:
- all `b_i` belong to the same ambient vector space;
- columns of `B` use the declared order and units.

Interpretation:

`y in U <=> exists c in R^k such that Bc = y`

Common misuse:
- assuming `k` equals `dim(U)` when columns are dependent;
- mixing row-space and column-space interpretations.

Claim links:
`C01`, `C02`, `LO2`

## F04 · Dimension-rank relation

Canonical statement:

`dim(col(B)) = rank(B)`

Question answered:

`How many independent directions do the columns of B provide?`

Conditions:
- rank refers to the named matrix `B`;
- exact rank and numerical rank must not be mixed silently.

Interpretation:
- number of columns is the number of proposed generators;
- rank is the number of independent directions.

Common misuse:
- saying “the data dimension is k” without naming ambient, feature or subspace dimension;
- inferring physical mode count directly from a software rank result.

Claim links:
`C02`, `C07`, `C08`, `LO2`, `LO5`

## F05 · Orthonormal-basis condition

Canonical statement:

`Q^T Q = I_k`

Component form:

`q_i^T q_j = delta_ij`

Question answered:

`Are the basis columns mutually orthogonal and unit length under the declared inner product?`

Conditions:
- standard Euclidean inner product unless another metric is declared;
- numerical verification uses a stated tolerance.

Checks:

`||Q^TQ - I_k|| <= tolerance`

Common misuse:
- checking only pairwise orthogonality but not unit norm;
- assuming visually distinct vectors are orthogonal;
- using the Euclidean dot product after an undeclared feature weighting.

Claim links:
`C04`, `C05`, `LO3`, `LO7`

## F06 · Coordinates in an orthonormal basis

Canonical statement:

`z = Q^T y`

Question answered:

`What are the coordinates of the centred observation along the orthonormal model directions?`

Conditions:
- `Q^TQ = I_k`;
- `y` uses the same ambient coordinates, units and preprocessing as `Q`.

Interpretation:
- `z_i` is the signed component along `q_i`;
- coordinates are model-dependent representation data.

Common misuse:
- using `Q^Ty` when columns are merely independent but not orthonormal;
- comparing coordinates from different `Q` versions as if they shared one basis.

Claim links:
`C05`, `LO3`, `LO4`

## F07 · Orthogonal projector for orthonormal columns

Canonical statement:

`P_U = QQ^T`

Question answered:

`Which linear operator maps an ambient vector to its orthogonal projection onto col(Q)?`

Conditions:
- `Q in R^(n x k)`;
- `Q^TQ = I_k`.

Derived action:

`y_hat = P_U y = QQ^T y = Qz`

Checks:
- shape `n x n`;
- symmetry;
- idempotence;
- `P_U Q = Q`.

Common misuse:
- replacing `Q` with an arbitrary basis matrix `B`;
- treating `QQ^T` as invertible when `k < n`.

Claim links:
`C03`, `C04`, `C05`, `LO3`, `LO4`

## F08 · Coordinates for a general full-column-rank basis

Canonical statement:

`c = (B^T B)^(-1) B^T y`

Question answered:

`Which coordinates produce the orthogonal projection when basis columns are independent but not orthonormal?`

Conditions:
- `B in R^(n x k)`;
- `rank(B) = k`;
- Euclidean inner product;
- inverse exists only under full column rank.

Implementation note:
- solve the linear system `B^TB c = B^Ty` rather than explicitly forming an inverse when possible;
- QR or least-squares routines are preferred in numerical code.

Common misuse:
- using the formula when columns are dependent;
- explicitly computing the inverse as a default numerical strategy;
- assuming these coefficients equal `B^Ty`.

Claim links:
`C03`, `C06`, `LO3`, `LO7`

## F09 · Orthogonal projector for a general basis

Canonical statement:

`P_U = B(B^T B)^(-1)B^T`

Question answered:

`What is the orthogonal projector onto col(B) when B is full column rank but not orthonormal?`

Conditions:
- all conditions of F08;
- `B^TB` must be nonsingular.

Checks:
- `P_U^T = P_U`;
- `P_U^2 = P_U`;
- `P_U B = B`.

Common misuse:
- writing `BB^T` as the general projector;
- using transpose as inverse;
- ignoring near-dependence and conditioning.

Claim links:
`C03`, `C06`, `LO3`

## F10 · Orthogonal-projector invariants

Canonical statements:

`P_U^T = P_U`

`P_U^2 = P_U`

`range(P_U) = U`

Question answered:

`Does a candidate matrix behave as the orthogonal projector onto U?`

Conditions:
- real Euclidean setting for transpose symmetry;
- numerical equality uses declared tolerances.

Interpretation:
- symmetry encodes orthogonality;
- idempotence means projecting twice changes nothing after the first projection.

Common misuse:
- treating idempotence alone as proof of orthogonal projection;
- checking only one test sample instead of matrix invariants.

Claim links:
`C03`, `C04`, `LO3`, `LO7`

## F11 · Explained component and residual decomposition

Canonical statements:

`y_hat = P_U y`

`r = y - y_hat = (I_n - P_U)y`

`y = y_hat + r`

Question answered:

`Which part is explained by the model, and which part is outside it?`

Conditions:
- `y` is centred if the model is affine;
- `P_U` is built for the same model version and feature contract.

Checks:

`allclose(y, y_hat + r)`

Common misuse:
- projecting raw `x` while the model was trained on centred observations;
- calling `r` measurement noise without evidence.

Claim links:
`C03`, `C04`, `C11`, `C12`, `LO4`, `LO6`

## F12 · Residual orthogonality

Canonical statements:

`Q^T r = 0`

Equivalent geometric statement:

`r perpendicular to U`

Question answered:

`Is the unexplained component orthogonal to the fitted subspace?`

Conditions:
- orthogonal projection under the same inner product;
- numerical check uses tolerance.

Checks:

`||Q^T r||_2 <= tolerance`

Common misuse:
- expecting exact floating-point zero;
- using this test after an oblique projection;
- concluding that orthogonality proves physical correctness.

Claim links:
`C04`, `LO4`, `LO7`

## F13 · Numerical-rank rule

Canonical statement:

`rank_tau(A) = #{i : sigma_i(A) > tau}`

Question answered:

`How many singular directions are treated as nonzero under a declared tolerance?`

Conditions:
- matrix `A` is named and oriented;
- singular values are ordered non-increasingly;
- tolerance `tau >= 0` is stated.

Interpretation:
- numerical rank is a decision, not a timeless property independent of scale and uncertainty;
- software defaults mainly address floating-point deficiency.

Common misuse:
- omitting `tau`;
- confusing numerical rank with retained engineering dimension;
- comparing ranks after arbitrary feature rescaling.

Claim links:
`C07`, `C08`, `LO5`, `LO7`

## F14 · Reduced SVD preview

Canonical statement:

`X_c = U Sigma V^T`

For reduced SVD with samples as rows:
- `X_c in R^(m x n)`;
- `p = min(m,n)`;
- `U in R^(m x p)`;
- `Sigma in R^(p x p)`;
- `V in R^(n x p)`.

Question answered:

`Which orthogonal directions and singular magnitudes describe the centred data matrix?`

Conditions:
- sample orientation is declared;
- data are centred for the intended affine-model interpretation;
- no claim that SVD alone establishes causal physical modes.

Checks:

`X_c approximately U @ diag(sigma) @ V.T`

Common misuse:
- mixing `V` and `V^T` shapes;
- treating rows of `V` as feature directions under the samples-as-rows convention;
- skipping centering while interpreting directions as variation around the mean.

Claim links:
`C09`, `C10`, `LO5`, `LO7`, `LO8`

## F15 · Retained-energy ratio

Canonical statement:

`rho_k = (sum_{i=1}^k sigma_i^2) / (sum_{i=1}^p sigma_i^2)`

Question answered:

`What fraction of squared singular-value energy is represented by the first k directions?`

Conditions:
- singular values come from the declared centred matrix;
- denominator is nonzero;
- `k` and the retention criterion are stated.

Interpretation:
- `rho_k` is a summary of representation energy under this scaling and preprocessing;
- it is not a universal measure of task usefulness.

Common misuse:
- declaring a universal 95% rule;
- calling retained energy prediction accuracy;
- ignoring feature scaling.

Claim links:
`C10`, `LO5`, `LO8`

## F16 · Residual diagnostic score

Canonical statement:

`score(x) = ||r||_2 = ||(I_n - P_U)(x - mu)||_2`

Question answered:

`How far is the centred observation from the current model subspace in Euclidean norm?`

Conditions:
- same `mu`, `P_U`, channel order, units, preprocessing and model version;
- score threshold, if any, is system-specific;
- missing channels and sensor saturation are handled before scoring.

Interpretation:
- larger score means poorer representation by the current model;
- the score does not identify the cause.

Common misuse:
- diagnosing a bearing fault solely from a large score;
- comparing scores across differently scaled models;
- ignoring model drift or changed operating regime.

Claim links:
`C12`, `LO4`, `LO6`, `LO7`

## Formula dependency graph

- F01 defines exact linear structure.
- F02 separates affine and noisy observations from F01.
- F03 and F04 establish representation and dimension.
- F05 enables F06 and F07.
- F08 enables F09 for a non-orthonormal basis.
- F10 validates F07 or F09.
- F11 and F12 validate a projected observation.
- F13 defines numerical-rank language.
- F14 previews the data-matrix factorization used later.
- F15 previews retained dimension.
- F16 turns F11 into a bounded engineering diagnostic statement.

## Implementation rules

1. Never form a matrix inverse in teaching code when a solve, QR or least-squares call communicates the computation more safely.
2. Never use `BB^T` as the general orthogonal projector.
3. Never omit centering for the fixed affine case.
4. Never report numerical rank without the matrix, orientation and tolerance.
5. Never compare residual scores across incompatible preprocessing contracts.
6. Every formula-bearing slide must expose the relevant formula IDs.
7. Every code example must assert at least shape, reconstruction and residual orthogonality where applicable.
8. Full PCA and least-squares derivations remain outside this registry's teaching scope.

## Pass 4 decision

- Formula IDs F01–F16 are locked.
- Shape and assumption contracts are locked.
- The formula dependency graph is locked.
- Numeric values for the fixed case remain unlocked until Pass 5.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L05_ENGINEERING_CASE_CONTRACT_PASS_05`
