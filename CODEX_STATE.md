# CODEX_STATE

Current task: THEORY_CORE_C01_L04_PASS_02_ACADEMIC_MAP

Status: PASS_02_ACADEMIC_MAP_LOCKED

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
- Completed: 2/14 passes
- Remaining: 12/14 passes
- Completed steps: 9/73
- Remaining steps: 64/73

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
- An ordered basis must be written with order explicit, for example `B = (b_1, ..., b_n)`; a coordinate tuple depends on that order.
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

# C01-L04 PASS 02 — BAUMAN ACADEMIC MAP

## Step 1 — Mathematical core map
The lesson must organize the mathematics as one coherent chain rather than disconnected definitions:

1. `linear combination`
   - question: what vectors can be produced from the available directions?
   - form: `v = c_1 b_1 + ... + c_k b_k`.

2. `span`
   - question: what is the complete representable set generated by those directions?
   - membership means exact existence of at least one coefficient vector `c` satisfying `Bc = v`.

3. `linear independence`
   - question: does every direction add genuinely new linear freedom?
   - criterion: `c_1 b_1 + ... + c_k b_k = 0` has only the zero coefficient solution.

4. `basis`
   - question: does the ordered family provide enough directions without redundancy?
   - basis combines spanning and linear independence for the stated space.

5. `coordinates`
   - question: how is the same abstract vector encoded in a chosen ordered basis?
   - `[v]_B = (c_1, ..., c_n)^T` when `v = sum_i c_i b_i`.

6. `existence and uniqueness`
   - spanning gives existence of coordinates;
   - independence gives uniqueness;
   - a basis gives both.

7. `change of basis`
   - the abstract vector remains fixed while its coordinate tuple changes;
   - only quantities invariant under the relevant change of basis may be compared without additional care.

8. `exact versus approximate representation`
   - exact: `v in span(B)` and reconstruction residual is zero in exact arithmetic;
   - approximate: `v` lies outside or noisy relative to the selected span, requiring projection or least squares later.

9. `orthonormal shortcut`
   - if `B = (b_1, ..., b_n)` is orthonormal, then `c_i = v · b_i`;
   - for a general basis, coordinates must be obtained by solving the coordinate equations, not by dot products alone.

## Step 2 — Master-level depth map
The lesson is foundational, but its reasoning quality must already support later master-level work.

Required depth:
- distinguish an abstract vector from a coordinate column;
- treat an ordered basis as an encoding contract, not merely a set of arrows;
- explain why basis coordinates are unique, not only state that they are;
- distinguish a spanning family, a basis, an orthonormal basis and an overcomplete dictionary;
- explain that basis choice affects numerical conditioning, interpretability, sparsity and model convenience;
- introduce near linear dependence as a numerical problem even when exact algebra says the vectors are independent;
- distinguish exact rank from effective numerical dimension without teaching SVD yet;
- identify what changes under coordinate transformation and what physical object should remain unchanged;
- require the learner to justify the chosen basis for a task rather than automatically use the standard basis.

Depth boundaries:
- no determinant-based basis test;
- no explicit matrix inverse as the default coordinate solver;
- no rank-nullity theorem;
- no full conditioning theory;
- no proof-heavy abstract vector-space treatment beyond what supports correct engineering use.

Expected master-preparation habit:
- state the space, ordered basis, units, frame and coefficient meaning before manipulating coordinate arrays;
- validate representation assumptions before trusting a numerical result;
- report reconstruction error and sensitivity when the basis is measured or nearly dependent.

## Step 3 — Robotics and control map
The lesson must connect basis and coordinates to physical systems through controlled examples.

### Coordinate frames
- world frame, robot-body frame and sensor frame are different ordered bases or coordinate systems for the same physical quantity;
- the same velocity vector has different coordinates in different frames;
- adding or comparing coordinate arrays from different frames is invalid until transformed to a common frame.

### State representation
- a robot state vector is a coordinate representation chosen for a model;
- changing state coordinates may simplify dynamics, estimation or control while the physical state remains the same;
- every state coordinate must retain units and semantic meaning.

### Motion decomposition
- route-aligned and cross-track directions form a task-oriented basis when they are independent and properly defined;
- longitudinal and lateral velocity coordinates can be more useful for control than world-axis coordinates;
- the §1.3 projection result becomes a coordinate only when the selected directions satisfy the required basis conditions.

### Sensors and actuators
- sensor axes define measurement coordinates;
- calibration errors, axis misordering or unrecorded rotations corrupt the coordinate contract;
- actuator direction vectors may span all, part or a redundant set of achievable instantaneous motions, but controllability theory is deferred.

### Required robotics evidence in the later core
- one exact 2-D frame-coordinate example;
- one warning involving mixed coordinate frames;
- one basis-choice comparison for route tracking or sensor interpretation;
- explicit units, orientation convention and timestamp/frame metadata.

## Step 4 — Signal, data and AI map
The lesson must distinguish four related but non-identical uses of generating directions.

### Signal representation
- basis functions encode a signal through coefficients;
- orthonormal bases allow coefficients to be recovered by inner products;
- Fourier and wavelet details are deferred, but the basis-coefficient principle is established.

### Feature spaces
- data features define coordinate axes by construction, but a feature set is not automatically a mathematical basis for the underlying physical state space;
- duplicated or linearly dependent features create redundant coordinates;
- nonlinear derived features may still be useful but do not establish linear dependence.

### Dictionaries and sparse representation
- an overcomplete dictionary may contain more atoms than the dimension and can represent vectors non-uniquely;
- a dictionary is useful in sparse coding but must not be mislabeled as a basis;
- uniqueness then needs extra assumptions beyond linear independence of the whole dictionary.

### AI and latent representation
- embeddings are coordinates in a learned representation space whose basis is usually implicit;
- coordinate values from different model versions are not directly comparable unless an alignment contract exists;
- a change of representation may improve separability or compression without changing the source object;
- PCA, SVD and learned latent spaces are later applications of selecting informative directions.

### Required data/AI evidence in the later core
- one example where redundant features preserve information but destroy coordinate uniqueness;
- one example where an orthonormal representation simplifies coefficient recovery;
- one warning about comparing embeddings from incompatible models;
- one clear distinction among basis, feature set and dictionary.

## Step 5 — Downstream curriculum dependency map

### Dependency A — §1.5 · Không gian con và biểu diễn dữ liệu
Consumes from §1.4:
- span as a generated set;
- basis as a minimal non-redundant generator;
- coordinate uniqueness;
- exact versus approximate membership;
- reconstruction residual.

§1.5 must add, not repeat:
- subspace closure conditions;
- dimension;
- rank and effective rank;
- low-dimensional structure;
- PCA/subspace interpretation at deeper level.

### Dependency B — Chapter 2 · Matrices and linear maps
Consumes from §1.4:
- ordered basis columns;
- coordinate relation `Bc = v`;
- change of coordinates;
- basis-dependent matrix representation of a linear map.

Chapter 2 must add:
- matrix operations;
- elimination and solving systems;
- inverse where justified;
- rank machinery;
- matrix representation of transformations.

### Dependency C — Least squares and estimation
Consumes from §1.4:
- span membership;
- failure of exact representation;
- reconstruction residual;
- uniqueness versus redundant generating families.

Later lessons must add:
- optimality criteria;
- normal equations, QR and SVD;
- noise models and weighting;
- parameter-identifiability analysis.

### Dependency D — PCA, SVD and dimensionality reduction
Consumes from §1.4:
- coordinates in a chosen basis;
- orthonormal coefficient recovery;
- subspace representation;
- basis choice as an information-design decision.

Later lessons must add:
- centering and scaling;
- singular values and variance;
- truncation;
- reconstruction and explained-variance trade-offs.

### Dependency E — Signal transforms
Consumes from §1.4:
- basis functions;
- coefficients;
- orthonormality;
- reconstruction from coordinates.

Later lessons must add:
- Fourier, wavelet or modal bases;
- sampling and discrete transforms;
- energy interpretation;
- frequency-domain engineering decisions.

### Dependency F — Robotics, control and estimation
Consumes from §1.4:
- coordinate frames;
- ordered bases;
- state coordinates;
- representation changes;
- redundant versus sufficient directions.

Later lessons must add:
- rotation matrices and rigid transforms;
- state-space models;
- Jacobians;
- observability, controllability and sensor fusion.

## Pass-02 competency matrix
The later lesson core must enable the learner to:
- compute a linear combination and test a simple span-membership case;
- explain why a given family is or is not a basis of a stated space;
- compute coordinates in a non-standard 2-D basis;
- reconstruct the abstract vector from its basis coordinates;
- explain why basis order matters;
- distinguish exact, redundant and approximate representation;
- recover coordinates by dot products only for an orthonormal basis;
- describe one robot vector in two coordinate frames without confusing the vector with either coordinate tuple;
- distinguish a basis, feature set and overcomplete dictionary;
- identify the next numerical risk when basis vectors are nearly dependent.

## Pass-02 quality gate
PASS because:
- every central mathematical concept is mapped to a question it answers;
- master-level depth is expressed through representation contracts, uniqueness, conditioning awareness and invariant reasoning;
- robotics examples are tied to frames, units and physical semantics rather than decorative storytelling;
- signal, data and AI links distinguish basis, feature axes, dictionaries and latent coordinates;
- each downstream subject declares exactly what it consumes from §1.4 and what must remain deferred;
- no theorem or algorithm reserved for later lessons is taught prematurely;
- no UI/runtime or presentation file was modified;
- no browser smoke test is claimed because this is an academic-planning pass.

## Next task
PASS 03/14 — Pedagogical spine for §1.4, consisting of 5 steps:
1. central lesson thesis;
2. measurable learning outcomes with evidence;
3. learning sequence from intuition to transfer;
4. misconception and cognitive-load plan;
5. essential questions and mastery narrative.

Do not draft the complete lesson core before PASS 03 is accepted.

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
- C01-L04 pass 01 scope lock: `5e88b37255f10af7dfbd4ec604598811d8b17409`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
