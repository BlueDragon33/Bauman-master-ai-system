# §1.5 · Không gian con và biểu diễn dữ liệu

## Source map and terminology contract

Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

## 1. Source policy

Source priority for the accepted artifact package:

1. official university course material for mathematical structure and projection;
2. official numerical-library documentation for software semantics, shapes and tolerances;
3. official engineering-statistics references for PCA preview boundaries;
4. peer-reviewed or standard textbook references only when a claim is not covered above;
5. no blog or retail tutorial as a load-bearing mathematical source.

The source map supports the lesson; it does not authorize copying source prose into the artifact.

## 2. Primary source anchors

### S1 · MIT OpenCourseWare 18.06, Lecture 15
Title:
`Projections onto subspaces`

Use for:
- projection onto a subspace;
- best approximation geometry;
- residual orthogonality;
- connection to inconsistent systems and least-squares motivation.

Scope boundary:
- §1.5 uses projection geometry and invariant checks;
- the full least-squares derivation remains deferred.

### S2 · MIT OpenCourseWare 18.06, Independence, Basis and Dimension
Use for:
- basis as an independent spanning set;
- dimension as basis cardinality in finite dimensions;
- connection between redundant generators and true subspace dimension.

Scope boundary:
- rank-nullity proof and the full four-subspaces theory remain deferred.

### S3 · NumPy `numpy.linalg.matrix_rank`
Use for:
- numerical rank computed from singular values;
- tolerance as part of the rank decision;
- distinction between floating-point rank detection and an engineering uncertainty threshold.

Required interpretation:
- the default threshold is a software convention for numerical deficiency;
- a physical effective-rank decision may require a tolerance tied to measurement uncertainty or task objectives.

### S4 · NumPy `numpy.linalg.svd`
Use for:
- reduced-SVD shapes;
- singular-value ordering;
- reconstruction checks;
- interpretation of `U`, `S` and `Vh` at the code-interface level.

Scope boundary:
- §1.5 may use reduced SVD as a computational preview;
- the full derivation and covariance/eigenvalue equivalence remain deferred.

### S5 · NIST Engineering Statistics Handbook, Principal Components
Use for:
- positioning principal components as an engineering data-analysis method;
- previewing low-dimensional representation and variance-based directions.

Scope boundary:
- no full PCA training, component-selection doctrine or statistical inference is taught in §1.5.

## 3. Claim-to-source map

| Claim ID | Accepted claim | Source anchor | Artifact use |
|---|---|---|---|
| C01 | A linear subspace contains zero and is closed under addition and scalar multiplication. | S2 / standard finite-dimensional linear algebra | Core definition, retrieval, examples |
| C02 | A basis is an independent spanning set; dimension equals the number of vectors in a basis. | S2 | Core, notation, misconception map |
| C03 | Projection onto a subspace produces a best approximation under the declared inner product. | S1 | Core derivation, worked example |
| C04 | For orthogonal projection, the residual is orthogonal to the model subspace. | S1 | Invariant checks, lab assertions |
| C05 | For orthonormal columns `Q`, the projector is `QQ^T`. | S1 / standard matrix derivation | Formula registry, code |
| C06 | For full-column-rank `B`, the orthogonal projector is `B(B^TB)^(-1)B^T`. | S1 / least-squares projection context | Formula registry, comparison with `QQ^T` |
| C07 | Numerical rank is determined from singular values relative to a tolerance. | S3 | Rank gate, code, warnings |
| C08 | Software defaults do not automatically encode sensor uncertainty or physical mode count. | S3 | Engineering interpretation |
| C09 | Reduced SVD has explicit shape contracts and reconstructs the input matrix. | S4 | Lab, code audit |
| C10 | PCA/SVD can preview low-dimensional directions but full PCA theory is outside this lesson. | S4, S5 | Bridge and deferral labels |
| C11 | Centering turns an affine model `mu + U` into a linear model in centred coordinates. | Standard affine-linear model identity | Core distinction, case contract |
| C12 | A projection residual is evidence of model mismatch, not a unique fault diagnosis. | Engineering inference from the declared model | Case interpretation and safety language |

## 4. Terminology contract

### 4.1 Core trilingual glossary

| ID | Vietnamese canonical term | English | Russian | Contract note |
|---|---|---|---|---|
| T01 | không gian vectơ | vector space | векторное пространство | Use `vectơ` consistently in Vietnamese prose. |
| T02 | không gian con tuyến tính | linear subspace | линейное подпространство | Do not shorten to `không gian con` where affine confusion is possible. |
| T03 | không gian affine | affine subspace / affine set | аффинное подпространство | State that it need not pass through the origin. |
| T04 | không gian sinh / bao tuyến tính | span / linear span | линейная оболочка | First occurrence may show both Vietnamese forms; later use `span` only in code/schema. |
| T05 | tập sinh | generating set / spanning set | порождающая система | It may contain redundant vectors. |
| T06 | cơ sở | basis | базис | Independent and spanning for the named target subspace. |
| T07 | số chiều | dimension | размерность | Must name the space whose dimension is stated. |
| T08 | ma trận cơ sở | basis matrix | матрица базиса | Columns are basis vectors unless explicitly declared otherwise. |
| T09 | không gian cột | column space | пространство столбцов | May be written `col(B)` after definition. |
| T10 | hạng đại số | algebraic rank | алгебраический ранг | Exact mathematical rank. |
| T11 | hạng số | numerical rank | численный ранг | Requires a tolerance. |
| T12 | chiều giữ lại | retained dimension | сохраняемая размерность | Requires an energy/task criterion, not only floating-point tolerance. |
| T13 | giá trị kỳ dị | singular value | сингулярное значение | Ordered non-increasingly in the lesson. |
| T14 | phép chiếu trực giao | orthogonal projection | ортогональная проекция | Relative to the declared inner product. |
| T15 | ma trận chiếu / projector | projection matrix / projector | матрица проекции / проектор | For orthogonal projection, symmetric and idempotent. |
| T16 | thành phần được giải thích | explained component | объяснённая составляющая | `y_hat = P_U y`. |
| T17 | phần dư | residual | невязка / остаток | Prefer `невязка` in numerical-analysis context. |
| T18 | tâm hóa dữ liệu | data centering | центрирование данных | `y = x - mu`. Do not translate as normalization. |
| T19 | chuẩn hóa thang đo | feature scaling / standardization | масштабирование / стандартизация | Distinct from centering and vector normalization. |
| T20 | mô hình gần không gian con | near-subspace model | модель данных вблизи подпространства | Approximate/noisy statement, not exact membership. |
| T21 | sai số tái tạo | reconstruction error | ошибка реконструкции | Define norm and aggregation. |
| T22 | tỷ lệ năng lượng giữ lại | retained-energy ratio | доля сохранённой энергии | Preview only; no universal threshold. |

### 4.2 Symbol contract

| Symbol | Meaning | Shape / domain |
|---|---|---|
| `x` | raw observation | `R^n` |
| `mu` | reference mean | `R^n` |
| `y = x - mu` | centred observation | `R^n` |
| `U` | target linear subspace | subset of `R^n` |
| `B` | general basis matrix for `U` | `R^(n x k)`, full column rank when inverse formula is used |
| `Q` | orthonormal basis matrix for `U` | `R^(n x k)`, `Q^TQ = I_k` |
| `c` or `z` | coordinates in a basis/subspace model | `R^k` |
| `P_U` | orthogonal projector onto `U` | `R^(n x n)` |
| `y_hat` | projected/explained component | `R^n` |
| `r` | residual | `R^n` |
| `sigma_i` | singular values | nonnegative, non-increasing |
| `tau` | declared numerical-rank tolerance | nonnegative scalar |
| `k` | subspace or retained dimension | integer with `0 <= k <= n` |

## 5. Usage rules

### Rule U1 · Name the ambient and target spaces
Do not write only `U is a subspace`. Prefer:

`U is a linear subspace of R^n.`

### Rule U2 · Name the matrix orientation
Every data-matrix statement must declare one of:
- samples as rows;
- samples as columns.

§1.5 fixed case uses one observation `x in R^4`; the multi-sample orientation is deferred and then fixed explicitly in §1.6.

### Rule U3 · Do not merge centering, scaling and normalization
- centering: subtract the mean;
- feature scaling: change per-feature scale;
- vector normalization: rescale an individual vector, often to unit norm.

These operations answer different questions.

### Rule U4 · Rank requires an object and criterion
Prohibited:

`The data rank is 2.`

Accepted:

`The centred matrix X_c has numerical rank 2 under tolerance tau.`

### Rule U5 · Use exact and approximate symbols deliberately
- exact membership: `y in U`;
- approximate model: `y approximately in U` or `y = Qz + epsilon`;
- numerical check: `||Q^Tr||_2 <= tolerance`.

### Rule U6 · Projector formulas are assumption-scoped
- `QQ^T` only after `Q^TQ = I`;
- `B(B^TB)^(-1)B^T` only after full-column-rank is established;
- do not write `BB^T` as a general projector.

### Rule U7 · Residual language remains diagnostic
Use:

`The sample is poorly explained by the current normal-operation model.`

Do not use:

`The residual proves a bearing fault.`

### Rule U8 · PCA remains a bridge term
In §1.5, `principal direction`, `retained energy` and `reduced SVD` may appear as previews. Full PCA formulas, covariance derivation and component-selection policy are deferred.

## 6. Translation and display rules

- Vietnamese is the primary teaching language.
- English appears for code/API terms and international notation.
- Russian appears in glossary/reference contexts, not as duplicate prose on every slide.
- Formula symbols remain Latin/Greek and are never transliterated.
- `rank`, `span`, `SVD`, `PCA` may be retained after first definition.
- Avoid translating `residual` as generic `lỗi`; use `phần dư` or `nevязка` according to context.
- Avoid using `normalization` as a catch-all label for centering and scaling.

## 7. Source-trace requirements for future artifacts

Every future core claim must carry at least one of:
- `claimId` from C01–C12;
- `formulaId` from the Pass 4 registry;
- `caseInvariantId` from the Pass 5 engineering case;
- `sourceAnchorId` S1–S5.

Every slide must expose:
- stable slide ID;
- source-slide ID;
- learning-outcome mapping;
- claim/formula/case references;
- exact or approximate statement type.

## Pass 3 decision

- Source anchors S1–S5 are locked.
- Claim map C01–C12 is locked as the minimum trace set.
- Terminology T01–T22 is locked.
- Symbol and usage rules U1–U8 are locked.
- Runtime record remains unchanged.

## Next task

`THEORY_C01_L05_FORMULA_REGISTRY_PASS_04`
