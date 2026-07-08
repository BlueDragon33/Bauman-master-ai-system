# CODEX_STATE

Current task: THEORY_CORE_C01_L04_PASS_01_SCOPE_LOCK

Status: PASS_01_SCOPE_LOCKED

Date: 2026-07-08
Branch: `main`

## Mandatory development order
1. Core content
2. `Tham khảo thêm` reference table
3. Slideshow
4. `Xem đầy đủ`
5. Final formula and layout normalization
6. Final integration and acceptance

Do not skip ahead.

## Per-lesson quality workflow
Each lesson is completed through 14 passes and 73 controlled steps.

Core-content passes:
1. Scope lock — 4 steps
2. Bauman academic map — 5 steps
3. Pedagogical spine — 5 steps
4. Core academic content — 6 steps
5. Independent mathematics review — 5 steps
6. Engineering-model review — 5 steps
7. Complete worked case — 6 steps
8. Misconceptions and failure modes — 5 steps
9. Assessment and implementation contract — 5 steps

Presentation and integration passes:
10. `Tham khảo thêm` reference table — 4 steps
11. Slideshow — 6 steps
12. `Xem đầy đủ` — 5 steps
13. Formula and layout normalization — 5 steps
14. Final integration and acceptance — 7 steps

Progress for §1.4:
- Completed: 1/14 passes
- Remaining: 13/14 passes
- Completed steps: 4/73
- Remaining steps: 69/73

## Core architecture
- Core content is presentation-independent.
- Core files contain no slide numbering, popup labels, CSS, animation, or layout instructions.
- Existing `theory_lecture_content.json` remains unchanged during the core phase.
- Downstream reference, slideshow, full-view, and formula/layout content must derive from the core and may not contradict it.
- ChatGPT authors and reviews academic content; Codex is reserved for narrow application, UI/JS/CSS work, and smoke testing when those phases are reached.

## Gold standard
- `subjects/math/data/theory_core/theory_core_c01_l01.json`
- Lesson: `§1.1 · Vector như dữ liệu kỹ thuật`
- Status: `gold_standard_candidate`

## Completed core records
1. `theory_core_c01_l01.json`
   - vector as engineering data
   - semantic notation
   - operations, norm, dot, distance, cosine
   - data-quality gates
   - complete network-state worked case
2. `theory_core_c01_l02.json`
   - norm axioms
   - L1, L2, Linf, weighted L2
   - metric axioms
   - Manhattan, Euclidean, Chebyshev, weighted distance
   - similarity versus distance
   - z-score, robust and min-max scaling
   - assumption and weight-provenance gates
   - complete UGV anomaly-distance worked case
3. `theory_core_c01_l03.json`
   - status: `approved_against_gold_standard`
   - dot product by coordinates and norm-angle relation
   - sign of dot product, angle domain and orthogonality
   - cosine similarity and zero-vector gate
   - projection onto a vector and parallel-orthogonal decomposition
   - projection onto an orthonormal subspace at introductory level
   - residual orthogonality and least-squares bridge
   - complete UGV route-projection worked case
   - safe Python/NumPy implementation contract

## Manifest
- `subjects/math/data/theory_core/theory_core_manifest.json`
- Version: `CORE_MANIFEST_V1_3`
- Registered records: C01-L01, C01-L02 and C01-L03
- C01-L03 status: `approved_against_gold_standard`
- C01-L04 is not registered until its complete core record passes passes 1–9.

## Notation contract
- `x_i` is the i-th element and must use a subscript.
- `x_i^2` has i below and 2 above.
- `x_i^T` keeps i as a subscript and T as a superscript.
- `x^2`, `A^{-1}`, and `A^k` remain superscripts when raw notation uses `^`.
- Coordinate-vector notation must distinguish the abstract vector `v` from its coordinates `[v]_B` in basis `B`.
- Formula source must remain semantically explicit before any renderer is applied.

# C01-L04 PASS 01 — SCOPE LOCK

## Step 1 — Identity and position
- Target file after core passes are complete: `subjects/math/data/theory_core/theory_core_c01_l04.json`
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Lesson title: `§1.4 · Cơ sở, span và tọa độ`
- Chapter: `C01 · Vector trong không gian`
- Program anchor: `Không gian vectơ và ánh xạ tuyến tính`
- Roadmap role: foundation before preparatory and master-level linear algebra.
- Position: follows §1.3 dot, angle and projection; precedes §1.5 subspace and data representation.

## Step 2 — Locked prerequisites
From §1.1:
- vector as an ordered engineering-data object;
- dimension, schema and units;
- vector addition and scalar multiplication;
- distinction between a vector and its numeric representation.

From §1.2:
- norm and distance;
- reconstruction error as a quantitative mismatch;
- scaling and metric assumptions.

From §1.3:
- dot product and orthogonality;
- projection onto one direction;
- introductory projection onto an orthonormal span;
- residual as the unexplained component.

Minimal external prerequisites:
- solving a small two-equation linear system by substitution or elimination;
- real-number arithmetic and ordered tuples.

## Step 3 — Downstream preparation
The lesson must prepare directly for:
- §1.5 subspaces and data representation;
- dimension and rank as measures of independent directions;
- matrix columns as a generating family;
- coordinate transformations and linear maps;
- least squares and residual analysis;
- PCA, SVD, Fourier-like representations and model-state coordinates at later stages.

The lesson must establish these durable bridges:
- projection coefficients become coordinates only under the correct basis conditions;
- a basis gives existence and uniqueness of coordinates;
- span defines what can be represented exactly;
- residual identifies what lies outside the chosen span;
- changing basis changes coordinates, not the underlying abstract vector.

## Step 4 — Allowed scope and hard boundaries

### Required in §1.4
- linear combination;
- span and exact membership in a span;
- generating set versus basis;
- linear independence at the level needed to define and validate a basis;
- basis as an independent spanning set;
- standard and non-standard bases;
- coordinate vector `[v]_B` and uniqueness of coordinates;
- reconstruction `v = sum_i c_i b_i`;
- column-form relation `B c = v` as an introductory bridge, without relying on undeveloped matrix machinery;
- orthonormal-basis shortcut `c_i = v · b_i` with explicit conditions;
- exact representation versus approximate representation;
- simple 2-D and 3-D engineering examples with schema, units and coordinate frames;
- an introductory change-of-basis concept and one small exact example;
- warnings about nearly dependent directions and numerical sensitivity;
- distinction between mathematical basis vectors and ordinary data features.

### Introduce only, do not develop deeply
- rank as a diagnostic count of independent directions;
- subspace as a span;
- least squares when `v` is outside the span;
- conditioning of a basis;
- coordinate transformation matrices.

### Reserved for §1.5 or later
- full subspace axioms and proofs;
- dimension/rank theorems and rank-nullity;
- detailed PCA, SVD, Fourier or wavelet algorithms;
- Gaussian elimination, determinant, inverse and matrix factorization;
- full least-squares derivation and numerical solvers;
- eigenvalues and eigenvectors;
- nonlinear manifolds or nonlinear feature maps;
- production UI, slideshow, reader, CSS, animation and runtime decisions.

## Academic corrections locked before drafting
- A derived feature such as `speed = sqrt(v_x^2 + v_y^2)` is nonlinear dependence, not linear dependence and not evidence that one feature lies in the linear span of the others.
- A collection of many vectors is not automatically a basis; it must be both linearly independent and spanning for the stated space.
- Coordinates have no complete meaning without naming the basis and ordering its vectors.
- The same coordinate tuple in two different bases generally represents two different vectors.
- A vector can lie in `span(B)` even when `B` is redundant; membership does not imply that `B` is a basis.
- Coordinates are unique only when the generating family is a basis.
- The shortcut `c_i = v · b_i` is valid for an orthonormal basis, not for an arbitrary basis.
- A feature set must not be called a mathematical basis unless the vector-space assumptions and independence/spanning conditions are actually satisfied.

## Pass-01 quality gate
PASS because:
- the lesson identity and exact repository target are fixed;
- prerequisites are traced to §§1.1–1.3;
- downstream responsibilities are explicit;
- required content and deferred content are separated;
- known conceptual traps in the legacy lecture are corrected before authorship;
- no UI/runtime or presentation file was modified;
- no browser smoke test is claimed because this is an academic planning pass.

## Next task
PASS 02/14 — Bauman academic map for §1.4, consisting of 5 steps:
1. mathematical core map;
2. master-level depth map;
3. robotics and control map;
4. signal, data and AI map;
5. downstream curriculum dependency map.

Do not draft the complete lesson core before PASS 02 and PASS 03 are accepted.

## Presentation/runtime status
- No UI/runtime file was changed in the core-content phase.
- E235 remains the approved `Xem đầy đủ` baseline but UI work is paused.
- E236, E237 and E238 remain disabled from runtime.

## Commits
- C01-L01 core: `24b75580f841d4da3e2ed8867c72e4796b4fe2bb`
- Initial manifest: `f7682618b11f3543ad1d1304b2fb2abd26eafdda`
- Core handoff: `450018e626052c64159df2db2f7d638ae603c14c`
- C01-L02 core: `6152fee25201bde2b0e9b30d8b00087d44b71604`
- Manifest update for C01-L02: `7b4dc5b3d643aa568129af0b3fc5bb94ed64f341`
- C01-L03 core: `a87a368a82d151060c0e1f9a358f668ccd445517`
- Manifest registration for C01-L03: `ac5fadd6022d8f649e77069a89d3becd74baed28`
- C01-L03 review correction and approval: `586b9bea397625ebf5c300a8bbb6c7b7b948c67a`
- Manifest approval for C01-L03: `04724ed3b10085383f3599b11f2df58de41a4160`
- C01-L03 state handoff: `2485e680b5a5c977476df67312433e664fa56c9a`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
