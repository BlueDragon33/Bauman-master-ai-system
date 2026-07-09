# §1.6 · Từ vector sang ma trận dữ liệu

## Source map and terminology contract

Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

## 1. Source policy

Source priority for the accepted §1.6 artifact package:

1. the locked §1.6 Learning Contract for project conventions, scope and the fixed engineering case;
2. official NumPy documentation for array shape, stacking, transpose, matrix multiplication and covariance API semantics;
3. official scikit-learn documentation for consistent preprocessing, train/test boundaries and feature-interface discipline;
4. accepted §1.4 and §1.5 artifacts for basis, coordinates, subspace, rank and PCA boundary terminology;
5. standard finite-dimensional linear algebra only for identities that are not software-specific;
6. no blog, retail tutorial or generated prose may serve as a load-bearing source.

The source map validates claims and interfaces. It does not authorize copying source wording into lesson artifacts.

## 2. Convention ownership

Every future claim must identify which layer owns it.

### Layer P · Project contract

Project decisions, not universal mathematical laws:
- rows are observations;
- columns are features;
- `X in R^(m x n)` is the canonical lesson convention;
- `UGV_TELEMETRY_8X6` is the fixed case;
- feature order, units, schema version and timestamp treatment;
- raw, centred and scaled notation policy;
- what is taught, previewed or deferred.

### Layer M · Mathematical identity

Convention-independent mathematics after shapes are declared:
- transpose swaps matrix axes;
- `X^T X in R^(n x n)` and `X X^T in R^(m x m)`;
- matrix entry, row, column and block meanings under a declared orientation;
- matrix multiplication shape rules;
- exact linear-dependence statements.

### Layer A · Array/API semantics

Software behavior defined by official array-library documentation:
- `shape` reports axis lengths;
- `stack` creates a new axis for equal-shape arrays;
- `vstack` stacks row-wise;
- `column_stack` places one-dimensional inputs as columns;
- one-dimensional transpose does not create a column vector;
- broadcasting may allow code to run without matching the intended mathematical object;
- covariance orientation depends on the API convention and options.

### Layer E · Engineering contract

Domain requirements that shape alone cannot prove:
- feature names and order;
- units and frame compatibility;
- observation identity and acquisition configuration;
- schema version;
- permissible preprocessing and deployment interface.

## 3. Primary source anchors

### S1 · §1.6 Learning Contract

File:
`subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`

Use for:
- canonical row-observation convention;
- fixed case and feature schema;
- scope boundaries;
- prerequisite gates, learning outcomes and mastery evidence;
- project-specific notation and metadata contract.

Authority type:
- project contract;
- not an external mathematical source.

### S2 · NumPy `ndarray.shape` / `numpy.shape`

Use for:
- shape as the tuple of axis lengths;
- code-level shape assertions;
- distinguishing `(n,)`, `(n,1)`, `(1,n)` and `(m,n)`.

Boundary:
- shape reports structure, not engineering meaning.

### S3 · NumPy `numpy.stack`

Use for:
- joining equal-shape arrays along a new axis;
- explaining why axis selection creates a row-observation or another batch arrangement;
- rejecting silent stacking of unequal shapes.

Boundary:
- equal shape is necessary for `stack`, but not sufficient for semantic compatibility.

### S4 · NumPy `numpy.vstack`

Use for:
- row-wise assembly;
- one-dimensional inputs being treated as rows;
- mapping observation vectors into the project `m x n` convention.

Boundary:
- `vstack` does not validate feature order, units or schema version.

### S5 · NumPy `numpy.column_stack`

Use for:
- contrasting column assembly with row assembly;
- showing how one-dimensional arrays become columns;
- preventing accidental use when observations should be rows.

### S6 · NumPy `numpy.transpose` / `ndarray.T`

Use for:
- matrix-axis reversal;
- converting between row-observation and column-observation conventions;
- teaching the one-dimensional transpose trap.

Required warning:
- for a one-dimensional array, transpose does not create shape `(n,1)`.

### S7 · NumPy `numpy.matmul`

Use for:
- software-level matrix multiplication shape behavior;
- connecting `X @ w`, `X.T @ X` and `X @ X.T` to declared shapes;
- distinguishing matrix multiplication from elementwise multiplication.

Boundary:
- successful multiplication does not prove semantic validity.

### S8 · NumPy `numpy.cov`

Use for:
- showing that covariance orientation is controlled by the API convention;
- documenting `rowvar` and normalization behavior;
- blocking the claim that raw `X^T X` is automatically covariance.

Boundary:
- covariance derivation and statistical interpretation remain preview material.

### S9 · scikit-learn Common Pitfalls: inconsistent preprocessing

Use for:
- applying the same learned preprocessing to later data;
- preserving feature interface between training and deployment;
- explaining why independently transformed train/live matrices are incomparable.

### S10 · scikit-learn Common Pitfalls: data leakage

Use for:
- fitting preprocessing only on training data;
- separating `fit` from `transform`;
- previewing pipeline discipline without turning §1.6 into a machine-learning workflow lesson.

### S11 · Accepted §1.4 package

Use for:
- ordered coordinates and ordered basis contracts;
- why reordering components changes coordinate tuples;
- shape versus representation semantics.

### S12 · Accepted §1.5 package

Use for:
- exact versus numerical rank boundary;
- centering, scaling and near-subspace terminology;
- why rank, SVD and PCA claims require declared criteria;
- bridge from one observation to a multi-observation matrix.

## 4. Claim-to-source map

| Claim ID | Accepted claim | Owner | Source anchor | Artifact use |
|---|---|---|---|---|
| C01 | §1.6 uses `X in R^(m x n)` with rows as observations and columns as features. | P | S1 | Core contract, diagrams, code |
| C02 | Observation `x^(i) in R^n` is inserted as row `x^(i)^T`. | P/M | S1, standard linear algebra | Assembly formula |
| C03 | Entry `x_ij` is feature `j` of observation `i` under the project convention. | P | S1 | Notation, retrieval |
| C04 | Array shape is a tuple of axis lengths, not a semantic label. | A/E | S2, S1 | Shape gate |
| C05 | `stack` joins equal-shape arrays along a new declared axis. | A | S3 | Code comparison |
| C06 | `vstack` maps one-dimensional observations to rows. | A | S4 | Canonical assembly code |
| C07 | `column_stack` maps one-dimensional inputs to columns. | A | S5 | Counterexample |
| C08 | One-dimensional `.T` does not convert shape `(n,)` to `(n,1)`. | A | S6 | Misconception M1 |
| C09 | A two-dimensional transpose converts `m x n` to `n x m` and swaps interpretation. | M/A | S6, S1 | Convention translation |
| C10 | `X^T X` is `n x n`; `X X^T` is `m x m`. | M | S7, standard linear algebra | Derived-shape reasoning |
| C11 | `X^T X` is a feature-feature Gram-type object under row observations. | P/M | S1, S7 | Preview |
| C12 | `X X^T` is an observation-observation Gram-type object under row observations. | P/M | S1, S7 | Preview |
| C13 | Raw Gram matrices are not automatically covariance matrices. | M/A | S8 | Assumption gate |
| C14 | Covariance API orientation and normalization must be stated. | A | S8 | Reference, code audit |
| C15 | Equal vector length or equal matrix shape does not prove schema compatibility. | E | S1 | Core gate, case |
| C16 | Feature order is part of the model interface. | E | S1, S9 | Deployment contract |
| C17 | Preprocessing learned on one dataset must be reused consistently on later data. | E/A | S9 | Preview, lab assertion |
| C18 | Fitting preprocessing on test/live data causes leakage or interface drift. | E/A | S10 | Preview boundary |
| C19 | Timestamp remains observation metadata unless explicitly promoted by feature engineering. | P/E | S1 | Case contract |
| C20 | Raw, centred and scaled matrices require distinct notation. | P/E | S1, S9 | Formula registry gate |
| C21 | Matrix rank requires the named matrix and an exact or numerical criterion. | M | S12 | Deferred bridge |
| C22 | Singular values and PCA may preview downstream structure but are not core §1.6 outcomes. | P | S1, S12 | Deferral labels |
| C23 | `UGV_TELEMETRY_8X6` uses eight observation rows and six ordered feature columns. | P | S1 | Case and examples |
| C24 | Software success is not evidence that schema, units or orientation are correct. | E | S1, S9 | Code audit |

## 5. Terminology contract

### 5.1 Core trilingual glossary

| ID | Vietnamese canonical term | English | Russian | Contract note |
|---|---|---|---|---|
| T01 | quan sát | observation | наблюдение | One row in the project convention. |
| T02 | mẫu dữ liệu | data sample | образец данных | May be used as a synonym for observation after orientation is declared. |
| T03 | đặc trưng | feature | признак | One named, ordered column. |
| T04 | vectơ đặc trưng | feature vector | вектор признаков | `x^(i) in R^n`. |
| T05 | ma trận dữ liệu | data matrix | матрица данных | Numeric matrix plus declared semantic contract. |
| T06 | hàng quan sát | observation row | строка наблюдения | `X[i,:]` under the project convention. |
| T07 | cột đặc trưng | feature column | столбец признака | `X[:,j]`. |
| T08 | vectơ hàng | row vector | вектор-строка | Shape `1 x n` in mathematics. |
| T09 | vectơ cột | column vector | вектор-столбец | Shape `n x 1` in mathematics. |
| T10 | phần tử ma trận | matrix entry | элемент матрицы | `x_ij`. |
| T11 | kích thước ma trận | matrix dimensions / shape | размер матрицы / форма массива | Use `shape` for API output. |
| T12 | trục mảng | array axis | ось массива | Code-level axis, not physical coordinate axis. |
| T13 | xếp chồng | stacking | объединение массивов | Keep `stack` in code. |
| T14 | xếp chồng theo hàng | row-wise / vertical stacking | вертикальное объединение | Project assembly uses this behavior. |
| T15 | xếp theo cột | column stacking | объединение по столбцам | Contrasting API behavior. |
| T16 | chuyển vị | transpose | транспонирование | Changes shape and interpretation for matrices. |
| T17 | lập chỉ mục | indexing | индексирование | Scalar or axis selection. |
| T18 | lát cắt | slice | срез | Subset retaining axis structure according to the API. |
| T19 | ma trận con | submatrix | подматрица | Row/column subset. |
| T20 | khối ma trận | matrix block | блок матрицы | Rectangular submatrix. |
| T21 | lô dữ liệu | data batch | пакет данных | Do not confuse with a tensor batch. |
| T22 | cửa sổ thời gian | time window | временное окно | One observation in the fixed case. |
| T23 | kênh đo | measurement channel | измерительный канал | Physical acquisition channel. |
| T24 | lược đồ đặc trưng | feature schema | схема признаков | Ordered names plus definitions. |
| T25 | thứ tự đặc trưng | feature order | порядок признаков | Part of the model interface. |
| T26 | đơn vị đo | measurement unit | единица измерения | One-to-one with feature schema. |
| T27 | phiên bản lược đồ | schema version | версия схемы | Required deployment metadata. |
| T28 | siêu dữ liệu | metadata | метаданные | Observation IDs, timestamps, units, schema version. |
| T29 | ma trận dữ liệu thô | raw data matrix | исходная матрица данных | `X_raw`. |
| T30 | ma trận đã tâm hóa | centred data matrix | центрированная матрица данных | `X_c`. |
| T31 | ma trận đã đổi thang | scaled data matrix | масштабированная матрица данных | `X_s`. |
| T32 | ma trận đã chuẩn hóa thống kê | standardized data matrix | стандартизованная матрица данных | Mean/scale policy must be stated. |
| T33 | tiền xử lý dữ liệu | data preprocessing | предобработка данных | Do not use as an unnamed catch-all. |
| T34 | ma trận Gram | Gram matrix | матрица Грама | Name the vectors whose inner products it stores. |
| T35 | ma trận hiệp phương sai | covariance matrix | ковариационная матрица | Requires orientation, centering and normalization policy. |
| T36 | phát quảng bá | broadcasting | трансляция массивов | Keep `broadcasting` in code-oriented prose after definition. |
| T37 | rò rỉ dữ liệu | data leakage | утечка данных | Preview only in §1.6. |
| T38 | quỹ đạo đặc trưng | feature trajectory | траектория признака | One feature across observations. |
| T39 | tương thích ngữ nghĩa | semantic compatibility | семантическая совместимость | Stronger than equal shape. |
| T40 | hợp đồng dữ liệu | data contract | контракт данных | Matrix plus schema, units, order and version. |

### 5.2 Translation rules

- Vietnamese is the primary teaching language.
- English appears for APIs, code identifiers and internationally common terms.
- Russian appears in glossary/reference contexts, not as duplicated prose on every slide.
- Formula symbols remain Latin or Greek.
- Use `vectơ` consistently in Vietnamese prose.
- Use `đặc trưng` in teaching prose and retain `feature` in schemas/code after first definition.
- Do not translate `shape` simply as `hình dạng`; use `kích thước mảng` or retain `shape`.
- Distinguish `tâm hóa`, `đổi thang`, `chuẩn hóa thống kê` and `chuẩn hóa vectơ`.
- Do not translate `data leakage` as a generic software leak; use `rò rỉ dữ liệu` in the machine-learning sense.

## 6. Symbol contract

| Symbol | Meaning | Shape / domain |
|---|---|---|
| `m` | number of observations | positive integer |
| `n` | number of features | positive integer |
| `i` | observation index | `1 <= i <= m` in mathematics |
| `j` | feature index | `1 <= j <= n` in mathematics |
| `I` | selected observation-index set | subset of `{1,...,m}` |
| `J` | selected feature-index set | subset of `{1,...,n}` |
| `x^(i)` | observation column vector | `R^n` |
| `x^(i)^T` | observation inserted as a row | `R^(1 x n)` |
| `X` | canonical row-observation data matrix | `R^(m x n)` |
| `X_col` | column-observation representation | `R^(n x m)`, `X_col=X^T` |
| `x_ij` | feature `j` of observation `i` | real scalar |
| `f_j` | feature trajectory | `R^m` |
| `X[I,:]` | selected observations | `R^(|I| x n)` |
| `X[:,J]` | selected features | `R^(m x |J|)` |
| `X[I,J]` | selected data block | `R^(|I| x |J|)` |
| `X_raw` | validated raw-feature matrix | `R^(m x n)` |
| `mu` | feature-wise mean vector | `R^n` |
| `1_m` | all-ones observation vector | `R^m` |
| `X_c` | centred matrix `X_raw-1_m mu^T` | `R^(m x n)` |
| `s` | declared feature-scale vector | `R^n` |
| `X_s` | scaled/standardized matrix | `R^(m x n)` |
| `G_f=X^T X` | feature-feature Gram matrix | `R^(n x n)` |
| `G_o=X X^T` | observation-observation Gram matrix | `R^(m x m)` |
| `t_i` | timestamp metadata for observation `i` | scalar/time object, not an automatic feature |
| `S` | ordered feature schema | length `n` |
| `U` | ordered unit list | length `n` |
| `v_schema` | schema version | identifier |

## 7. Usage rules

### U1 · State orientation before formulas

Every matrix formula, diagram or code block must state:
- observations as rows or columns;
- matrix shape;
- meaning of each axis.

### U2 · Keep observation vectors and stored rows distinct

Use:
- `x^(i) in R^n` for the column-vector mathematical object;
- `x^(i)^T` when it is inserted as row `i` of `X`.

### U3 · Distinguish mathematical and code indexing

- mathematics: `i=1,...,m`, `j=1,...,n`;
- Python/NumPy: indices start at zero.

Every code artifact must say which indexing convention is active.

### U4 · Shape is not semantics

A matrix of shape `(8,6)` is not automatically `UGV_TELEMETRY_8X6`. It must pass schema, order, units and version checks.

### U5 · Block the one-dimensional transpose trap

For a NumPy array with shape `(n,)`, `.T` preserves shape `(n,)`. Use explicit reshape or two-dimensional construction when a true row or column array is required.

### U6 · Stack along a declared axis

Code must name or make visible the stacking behavior. Do not use a convenient stacking function without mapping its output axes to the lesson contract.

### U7 · Preserve metadata through slicing

A row or feature subset must carry the corresponding observation IDs, timestamps, feature names and units.

### U8 · Keep raw, centred and scaled matrices separate

Do not overwrite all stages with one ambiguous variable `X` in explanatory code.

### U9 · Name the Gram object

Use:
- `feature Gram matrix` for `X^T X`;
- `observation Gram matrix` for `X X^T`.

Do not call either object covariance without the required preprocessing and normalization contract.

### U10 · Preprocessing consistency is part of deployment correctness

Any mean, scale or encoder learned during training must be reused on later data under the same feature interface.

### U11 · Rank statements remain criterion-scoped

Prohibited:

`The data have three modes because rank(X)=3.`

Accepted bridge language:

`The named matrix has the reported algebraic or numerical rank under the stated criterion; physical interpretation is deferred.`

### U12 · PCA and SVD remain bridge terms

§1.6 may explain why assembling `X` enables later SVD/PCA analysis. It may not teach component selection, retained-energy policy, covariance eigendecomposition or fault diagnosis.

## 8. NumPy operation map to the project convention

| Operation | Input assumption | Result | Contract interpretation |
|---|---|---|---|
| `np.stack(observations, axis=0)` | each observation shape `(n,)` | `(m,n)` | canonical row-observation matrix |
| `np.vstack(observations)` | each observation shape `(n,)` | `(m,n)` | canonical row-observation matrix |
| `np.stack(observations, axis=1)` | each observation shape `(n,)` | `(n,m)` | column-observation representation |
| `np.column_stack(observations)` | each observation shape `(n,)` | `(n,m)` | column-observation representation |
| `X.T` for 2-D `X` | `(m,n)` | `(n,m)` | convention conversion; axis meanings swap |
| `x.T` for 1-D `x` | `(n,)` | `(n,)` | not a row/column conversion |
| `X @ w` | `X:(m,n)`, `w:(n,)` | `(m,)` | one linear score per observation |
| `X.T @ X` | `X:(m,n)` | `(n,n)` | feature-feature Gram object |
| `X @ X.T` | `X:(m,n)` | `(m,m)` | observation-observation Gram object |

Every future code block must assert both the numeric shape and the semantic schema.

## 9. Legacy 16-slide claim disposition

The legacy runtime record remains unchanged, but its claims are classified before the new core is written.

| Legacy role | Disposition | Reason / rewrite rule |
|---|---|---|
| problem_framing | Keep and rewrite | Preserve vector-to-matrix bridge; replace generic examples with the locked UGV contract. |
| deep_essence | Keep with boundary | Keep same-schema stacking; move mean/covariance/PCA list to preview labels. |
| counter_intuition | Keep | Orientation warning is central; add one-dimensional transpose and broadcasting intercepts. |
| real_bridge | Rewrite | Replace generic 1000×8 sensor story with `UGV_TELEMETRY_8X6`; defer effective-rank claims. |
| notation | Keep and normalize | Retain `X`, entries and mean; add metadata, slice and shape contracts. |
| core_formula | Split | Centering formula becomes preview/registry item; rank interpretation moves to deferred bridge. |
| assumption_gate | Narrow | Keep schema/order/units/scale gates; missing-data and outlier treatment are deferred policy topics. |
| mini_case | Replace | Generic four-feature robot case is replaced by the fixed six-feature UGV case. |
| interpretation | Rewrite | Keep row/column geometry only at introductory level; full row-space/column-space theory is deferred. |
| simulation | Replace | Remove rank/singular-value experiment from core lab; use deterministic stacking, slicing and transpose checks. |
| common_mistakes | Keep and expand | Retain orientation, centering and scaling warnings; add schema, timestamp and 1-D transpose errors. |
| application | Replace | Audit shape/schema/order/units/version rather than diagnosing sensor faults or computing rank. |
| practice | Rewrite | Focus on assembly, indexing, convention translation and compatibility audit. |
| professor_qa | Rewrite | Remove broad rank-quality questions; test contract, orientation and boundary control. |
| bridge | Keep with correction | `Y=XA` is a valid downstream bridge under shape assumptions; matrix-transform derivation stays in Chapter 2. |
| takeaway | Rewrite | Remove claim that rank/singular values directly reveal information directions or physical modes. |

### Unsupported or over-scoped legacy statements

The following statements must not survive unchanged:
- `rank(X)` equals the number of independent physical information directions;
- singular values directly reveal physical modes;
- low rank is inherently good or bad;
- raw `X^T X` or a generic API result is covariance;
- missing-value, outlier and scaling policy can be solved generically inside §1.6;
- a column with low variance is automatically unimportant for every task;
- PCA behavior can be concluded before the centering, scaling and task contract is fixed;
- data audit alone diagnoses a dead sensor or specific system fault.

## 10. Source-trace requirements for future artifacts

Every major claim must expose at least one of:
- `claimId` C01–C24;
- `sourceAnchorId` S1–S12;
- a future Pass 4 formula ID;
- a future Pass 5 case invariant ID.

Every future slide must expose:
- stable slide ID;
- source-slide ID;
- learning-outcome mapping;
- claim/formula/case references;
- convention owner `P`, `M`, `A` or `E`;
- exact, approximate, API-semantic or project-contract statement type.

## Pass 3 decision

- Source anchors S1–S12 are locked.
- Claims C01–C24 are locked as the minimum trace set.
- Terminology T01–T40 is locked.
- Symbols and usage rules U1–U12 are locked.
- The NumPy operation map is locked to the row-observation project convention.
- The legacy 16-slide disposition is locked.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L06_FORMULA_REGISTRY_PASS_04`
