# §1.6 · Từ vector sang ma trận dữ liệu

## Canonical formula registry

Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

## Global shape and convention contract

Unless a formula explicitly overrides this contract:

- number of observations: `m`;
- number of features: `n`;
- observation vector: `x^(i) in R^n`;
- canonical data matrix: `X in R^(m x n)`;
- rows are observations;
- columns are features;
- entry `x_ij` is feature `j` of observation `i`;
- project indexing is one-based in mathematics and zero-based in Python;
- feature schema `S=(s_1,...,s_n)` and units `U=(u_1,...,u_n)` are ordered;
- timestamps and observation IDs are metadata, not automatic features;
- raw, centred and scaled matrices use distinct symbols.

Every implementation must assert shape, feature order and schema version before numerical work.

## Formula status classes

- `CORE`: required §1.6 mastery.
- `API_EQUIVALENT`: software expression of a locked mathematical contract.
- `PREVIEW`: valid only under stated assumptions; full theory is deferred.
- `FORBIDDEN_SHORTCUT`: recorded only to block misuse.

## F01 · Canonical row-observation assembly

Status:
`CORE`

Canonical statement:

`X = [x^(1)^T; x^(2)^T; ...; x^(m)^T] in R^(m x n)`

where:

`x^(i) in R^n`

Question answered:

`How are m compatible observation vectors assembled under the project convention?`

Conditions:
- every observation has dimension `n`;
- feature schema, feature order and units are identical;
- observation vectors use the same frame and acquisition contract where applicable.

Interpretation:
- row `i` stores observation `i`;
- column `j` stores feature `j` across all observations.

Checks:
- `shape(X) = (m,n)`;
- `X[i,:]^T = x^(i)` under matching indexing conventions;
- metadata lengths agree with `m` and `n`.

Common misuse:
- stacking equal-length vectors with different feature order;
- inserting observation columns without transposing them into rows;
- flattening multiple observations into one long vector.

Links:
`C01`, `C02`, `C15`, `LO1`, `LO2`, `LO8`

## F02 · Matrix entry meaning

Status:
`CORE`

Canonical statement:

`x_ij = feature j of observation i`

Domain:

`1 <= i <= m`

`1 <= j <= n`

Question answered:

`What does one scalar entry of the data matrix mean?`

Conditions:
- row-observation convention is active;
- schema element `s_j` and unit `u_j` are declared.

Interpretation:

`x_ij` is not meaningful without the ordered feature schema.

Common misuse:
- treating indices as interchangeable;
- reading `x_ij` as observation `j`, feature `i` after a transpose without rewriting notation.

Links:
`C03`, `LO3`

## F03 · Observation-row extraction

Status:
`CORE`

Canonical statement:

`X[i,:] = x^(i)^T in R^(1 x n)`

Column-vector recovery:

`x^(i) = X[i,:]^T in R^n`

Question answered:

`How is one observation recovered from the data matrix?`

Conditions:
- two-dimensional row semantics are preserved;
- code indexing offset is handled explicitly.

Common misuse:
- losing the row axis and then claiming the resulting one-dimensional array is already a column vector;
- returning row values without the matching observation ID and timestamp.

Links:
`C01`, `C03`, `LO2`, `LO3`, `LO6`

## F04 · Feature-column extraction

Status:
`CORE`

Canonical statement:

`f_j = X[:,j] in R^m`

Question answered:

`How is one feature trajectory across all observations recovered?`

Conditions:
- column `j` maps to schema entry `s_j` and unit `u_j`;
- observation order remains fixed.

Interpretation:
- `f_j` is a feature trajectory, not one observation.

Common misuse:
- calling a feature column a sample vector;
- comparing two feature columns with incompatible units without a policy.

Links:
`C03`, `C16`, `LO3`, `LO6`

## F05 · Row, column and block slicing

Status:
`CORE`

Canonical statements:

`X[I,:] in R^(|I| x n)`

`X[:,J] in R^(m x |J|)`

`X[I,J] in R^(|I| x |J|)`

Question answered:

`What shapes result when observations, features or both are selected?`

Conditions:
- selected observation metadata follows `I`;
- selected feature schema and units follow `J`;
- the relative order of selected indices is declared.

Common misuse:
- slicing numeric values but not slicing metadata;
- reordering columns while leaving the original feature schema unchanged.

Links:
`C03`, `C16`, `LO3`, `LO6`

## F06 · Convention conversion by transpose

Status:
`CORE`

Canonical statement:

`X_col = X^T in R^(n x m)`

Inverse conversion:

`X = X_col^T`

Question answered:

`How are row-observation and column-observation representations converted?`

Conditions:
- `X` is a two-dimensional matrix;
- all row and column interpretations are rewritten after conversion.

Interpretation:
- rows of `X` become columns of `X_col`;
- columns of `X` become rows of `X_col`.

Common misuse:
- transposing only to silence a dimension error;
- copying a formula unchanged after switching convention.

Links:
`C09`, `LO4`

## F07 · One-dimensional transpose trap

Status:
`FORBIDDEN_SHORTCUT`

NumPy fact:

`shape(x) = (n,) => shape(x.T) = (n,)`

Valid explicit row form:

`x_row = x.reshape(1,n)`

Valid explicit column form:

`x_col = x.reshape(n,1)`

Question answered:

`Why does .T not create a row or column matrix from a one-dimensional NumPy array?`

Conditions:
- this is API behavior, not a mathematical identity about abstract vectors.

Common misuse:
- using `x.T` as if it changed `(n,)` into `(1,n)`;
- mixing one-dimensional arrays with true two-dimensional row/column arrays without shape checks.

Links:
`C08`, `M1`, `LO4`, `LO8`

## F08 · Canonical NumPy assembly

Status:
`API_EQUIVALENT`

Canonical expressions:

`X = np.stack(observations, axis=0)`

or:

`X = np.vstack(observations)`

Expected result:

`shape(X) = (m,n)`

Question answered:

`Which NumPy operations implement the locked row-observation convention?`

Conditions:
- each observation has shape `(n,)` or an explicitly supported row shape;
- all semantic compatibility checks occur before stacking.

Common misuse:
- assuming `stack` validates units or schema;
- using `axis=1` and then continuing to describe rows as observations.

Links:
`C05`, `C06`, `LO2`, `LO8`

## F09 · Column-observation NumPy assembly

Status:
`API_EQUIVALENT`

Canonical expressions:

`X_col = np.stack(observations, axis=1)`

or:

`X_col = np.column_stack(observations)`

Expected result:

`shape(X_col) = (n,m)`

Question answered:

`Which NumPy operations intentionally create observations as columns?`

Conditions:
- the alternative convention is declared;
- downstream formulas are translated accordingly.

Common misuse:
- calling the result canonical `X` while retaining row-observation prose;
- mixing `X_col` with code written for `X in R^(m x n)`.

Links:
`C05`, `C07`, `LO4`, `LO8`

## F10 · Linear score per observation

Status:
`CORE`

Canonical statement:

`y = Xw`

Shapes:

`X in R^(m x n)`

`w in R^n`

`y in R^m`

Component form:

`y_i = x^(i)^T w`

Question answered:

`How does one feature-weight vector produce one scalar score per observation?`

Conditions:
- `w` follows the same feature order and units contract as the columns of `X`;
- the operation is linear and contains no bias term.

Common misuse:
- using a weight vector trained under a different feature order;
- interpreting successful multiplication as proof that the interface is correct.

Links:
`C24`, `LO5`, `LO6`, `LO9`

## F11 · Feature-feature Gram matrix

Status:
`PREVIEW`

Canonical statement:

`G_f = X^T X in R^(n x n)`

Entries:

`(G_f)_jk = f_j^T f_k = sum_i x_ij x_ik`

Question answered:

`Which matrix stores pairwise raw inner products between feature columns?`

Conditions:
- row-observation convention;
- declared preprocessing stage;
- feature scaling and units are acknowledged.

Interpretation:
- `G_f` is a feature-feature Gram matrix;
- it is not automatically covariance.

Common misuse:
- calling `X_raw^T X_raw` covariance;
- interpreting large entries without considering feature scale.

Links:
`C10`, `C11`, `C13`, `LO5`, `LO7`, `LO9`

## F12 · Observation-observation Gram matrix

Status:
`PREVIEW`

Canonical statement:

`G_o = X X^T in R^(m x m)`

Entries:

`(G_o)_ik = x^(i)^T x^(k)`

Question answered:

`Which matrix stores pairwise raw inner products between observations?`

Conditions:
- all observations share one valid feature contract;
- raw feature scales are appropriate for the intended comparison.

Interpretation:
- `G_o` is an observation-observation Gram matrix.

Common misuse:
- treating large similarity as physical closeness when mixed units dominate;
- confusing `G_o` with a feature covariance object.

Links:
`C10`, `C12`, `LO5`, `LO7`, `LO9`

## F13 · Feature-wise mean vector

Status:
`CORE`

Canonical statement:

`mu = (1/m) sum_(i=1)^m x^(i) in R^n`

Equivalent matrix statement:

`mu^T = (1/m) 1_m^T X_raw`

Question answered:

`What is the mean observation under the row-observation convention?`

Conditions:
- observations are valid under one schema;
- missing-data policy is outside the canonical teaching case because the case contains no missing values.

Common misuse:
- averaging along the feature axis and calling the result a feature-wise mean;
- mixing means from incompatible schema versions.

Links:
`C20`, `LO7`, `LO8`

## F14 · Feature-wise centering

Status:
`CORE`

Canonical statement:

`X_c = X_raw - 1_m mu^T`

Shapes:

`1_m in R^m`

`mu in R^n`

`X_c in R^(m x n)`

Invariant:

`1_m^T X_c = 0^T`

Question answered:

`How is the feature-wise mean removed from every observation?`

Conditions:
- `mu` is computed from or supplied for the declared reference dataset;
- deployment data reuse the approved reference mean rather than silently refitting it.

Common misuse:
- subtracting a row-wise mean;
- computing a fresh live-data mean when the model expects the training mean;
- calling centering normalization.

Links:
`C17`, `C18`, `C20`, `LO7`, `LO8`

## F15 · Feature-wise scaling

Status:
`PREVIEW`

Canonical statement:

`X_s[:,j] = X_c[:,j] / s_j`

Compact notation:

`X_s = X_c D_s^(-1)`

where:

`D_s = diag(s_1,...,s_n)`

Conditions:
- every `s_j > 0`;
- scale source and version are declared;
- scaling policy is justified for the engineering task.

Question answered:

`How are feature scales adjusted without changing observation orientation?`

Common misuse:
- dividing by zero for a constant feature;
- refitting scales independently on test/live data;
- treating scaling as universally desirable.

Links:
`C17`, `C18`, `C20`, `LO7`, `LO8`

## F16 · Sample covariance under explicit assumptions

Status:
`PREVIEW`

Canonical row-observation form:

`C = (1/(m-1)) X_c^T X_c in R^(n x n)`

Question answered:

`When does a centred feature Gram matrix become the usual unbiased sample covariance matrix?`

Conditions:
- observations are rows;
- `X_c` is centred feature-wise;
- `m > 1`;
- normalization uses divisor `m-1`;
- optional weights and alternative conventions are absent.

Interpretation:
- `C` is feature covariance under these assumptions.

Common misuse:
- using `X_raw^T X_raw`;
- omitting the divisor;
- ignoring an API's row/column variable convention;
- presenting covariance derivation as the core of §1.6.

Links:
`C13`, `C14`, `LO5`, `LO7`, `LO9`

## F17 · Feature transformation bridge

Status:
`PREVIEW`

Canonical statement:

`Y = X A`

Shapes:

`X in R^(m x n)`

`A in R^(n x p)`

`Y in R^(m x p)`

Question answered:

`How does one linear feature transformation act on every observation row?`

Interpretation:
- each row is transformed from `n` input features to `p` output features;
- observation count `m` is preserved.

Conditions:
- `A` uses the same input feature order as `X`;
- output feature meaning is declared;
- affine offsets are not included in this formula.

Common misuse:
- writing `AX` under the row-observation convention without translating shapes;
- treating any transformation as a basis change or PCA.

Links:
`C24`, `LO4`, `LO9`

## F18 · Rank bound and criterion boundary

Status:
`PREVIEW`

Canonical bound:

`rank(X) <= min(m,n)`

Question answered:

`What is the maximum possible algebraic rank of an m x n matrix?`

Conditions:
- rank refers to the named matrix and scalar field;
- numerical rank requires a separate tolerance;
- physical interpretation is deferred.

Common misuse:
- equating rank with physical mode count;
- saying rank equals the number of useful features;
- ignoring the difference between `X_raw`, `X_c` and `X_s`;
- using software default tolerance as an engineering truth.

Links:
`C21`, `C22`, `LO9`

## Dimensional failure examples

### D01 · Wrong weight length

Invalid:

`X:(m,n), w:(p,), p != n`

Then `Xw` is undefined under the intended model.

### D02 · Wrong convention multiplication

Under row observations:

`w^T X`

is generally dimensionally invalid or semantically wrong for per-observation scoring.

Correct:

`Xw`

### D03 · Accidental one-dimensional transpose

Invalid assumption:

`x.shape == (n,) => x.T.shape == (1,n)`

Actual NumPy result:

`x.T.shape == (n,)`

### D04 · Metadata-compatible shape failure

Two matrices may both have shape `(8,6)` but be incompatible when feature order or units differ.

### D05 · Broadcasting masquerading as stacking

Adding arrays with broadcast-compatible shapes does not assemble observations into a data matrix.

## Forbidden formula shortcuts

- `X = [x^(1),...,x^(m)]` without declaring whether vectors are rows or columns.
- `X.T` as a universal repair for shape errors.
- `X_raw^T X_raw = covariance` without centering and normalization assumptions.
- `rank(X) = number of physical modes`.
- `X = normalize(X)` without naming centering, scaling or vector normalization.
- `mu_live = mean(X_live)` when deployment must reuse training/reference preprocessing.
- `X[:,J]` while retaining the original full feature schema.
- `Y = XA` without declaring the input and output feature interfaces.
- `np.asarray` as proof that observations share one semantic schema.

## Registry trace matrix

| Formula | Primary LO | Claim links | Owner | Status |
|---|---|---|---|---|
| F01 | LO1, LO2 | C01, C02, C15 | P/M/E | CORE |
| F02 | LO3 | C03 | P | CORE |
| F03 | LO2, LO3 | C01, C03 | P/M | CORE |
| F04 | LO3, LO6 | C03, C16 | P/E | CORE |
| F05 | LO3, LO6 | C03, C16 | P/M/E | CORE |
| F06 | LO4 | C09 | M | CORE |
| F07 | LO4, LO8 | C08 | A | FORBIDDEN_SHORTCUT |
| F08 | LO2, LO8 | C05, C06 | A/P | API_EQUIVALENT |
| F09 | LO4, LO8 | C05, C07 | A/P | API_EQUIVALENT |
| F10 | LO5, LO6 | C24 | M/E | CORE |
| F11 | LO5, LO9 | C10, C11, C13 | M/P | PREVIEW |
| F12 | LO5, LO9 | C10, C12 | M/P | PREVIEW |
| F13 | LO7 | C20 | M/P | CORE |
| F14 | LO7, LO8 | C17, C18, C20 | M/E | CORE |
| F15 | LO7, LO8 | C17, C18, C20 | M/E | PREVIEW |
| F16 | LO5, LO9 | C13, C14 | M/A | PREVIEW |
| F17 | LO4, LO9 | C24 | M/E | PREVIEW |
| F18 | LO9 | C21, C22 | M | PREVIEW |

## Pass 4 decision

- Formula IDs F01–F18 are locked.
- Core formulas are limited to assembly, indexing, slicing, convention conversion, scoring, mean and centering.
- NumPy equivalents remain separately labelled from mathematical identities.
- Covariance, scaling, feature transforms and rank are preview-only.
- SVD and PCA formulas remain deferred.
- Numeric case values remain unlocked until Pass 5.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L06_ENGINEERING_CASE_PASS_05`
