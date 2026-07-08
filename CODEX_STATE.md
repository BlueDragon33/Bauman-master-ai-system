# CODEX_STATE

Current task: `THEORY_CORE_C01_L04_PASS_05_INDEPENDENT_MATHEMATICS_REVIEW`

Status: `PASS_05_MATHEMATICS_REVIEW_APPROVED`

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

## Per-lesson workflow
Each complete lesson passes through 14 passes and 73 controlled steps.

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

## Progress for §1.4
- Completed: 5/14 passes
- Remaining: 9/14 passes
- Completed steps: 25/73
- Remaining steps: 48/73

## Core architecture
- Current draft: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Draft version remains `CORE_C01_L04_V1_DRAFT`.
- Draft remains unapproved until passes 6–9 are complete.
- `subjects/math/data/theory_lecture_content.json` remains unchanged during the core phase.
- C01-L04 is not registered in the manifest until passes 1–9 are complete.
- No UI/runtime or presentation file is modified during passes 1–9.

## Gold standard and continuity
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Continuity references: C01-L02 and approved C01-L03.
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Position: after §1.3 dot/angle/projection and before §1.5 subspace/data representation.

# PASS 01 — SCOPE LOCK

Status: PASS.

Locked:
- exact lesson identity and prerequisites;
- required content and deferred content;
- basis, span, coordinates, uniqueness and change-of-representation boundaries;
- no determinant, inverse, Gaussian elimination, rank-nullity, PCA, SVD or full least squares in §1.4;
- nonlinear derived features do not prove linear dependence.

# PASS 02 — BAUMAN ACADEMIC MAP

Status: PASS.

Locked chain:
`linear combination → span → linear independence → basis → coordinates → uniqueness → change of basis → exact/approximate representation`.

Locked application map:
- robotics coordinate frames and state representations;
- signal bases and coefficient recovery;
- feature sets versus bases;
- overcomplete dictionaries;
- learned embedding-space compatibility.

# PASS 03 — PEDAGOGICAL SPINE

Status: PASS.

Locked:
- central lesson thesis;
- 10 measurable outcomes;
- 9 learning phases;
- 10 planned misconception intercepts;
- retrieval checkpoints and cognitive-load controls;
- mastery requires calculation, reconstruction, interpretation, condition checks and engineering transfer.

# PASS 04 — CORE ACADEMIC CONTENT

Status: PASS FOR DRAFT CREATION, NOT FINAL APPROVAL.

Created:
`subjects/math/data/theory_core/theory_core_c01_l04.json`

Draft contents:
- 10 learning outcomes;
- 16 notation rules;
- 9 core concepts;
- 9 main mechanisms;
- 12 main formulas;
- comparison logic;
- 12 assumption gates;
- provisional worked case, misconceptions, mastery checks and implementation contract;
- bridges and provisional downstream mapping.

# C01-L04 PASS 05 — INDEPENDENT MATHEMATICS REVIEW

## Step 1 — Definitions and logical equivalences

### Verified as correct
- For the finite families used in this lesson, linear independence is equivalent to the homogeneous relation `sum_i z_i b_i = 0` having only the zero solution.
- `v in span(B)` is an existence statement: at least one coefficient vector reconstructs `v`.
- Spanning the stated target space gives coordinate existence for every vector in that space.
- Linear independence gives coefficient uniqueness for every vector in the span.
- A basis of `V` combines `span(B)=V` and linear independence.
- If `B_mat c = B_mat d` and the columns of `B_mat` are independent, then `c=d`.
- If a nonzero `z` satisfies `B_mat z=0`, then `c+t z` reconstructs the same vector as `c` for every real `t`.

### Ordered-basis nuance
- The spanning and independence properties do not depend on order.
- Coordinates do depend on order.
- Throughout this lesson, `B=(b_1,...,b_n)` means an ordered basis whenever `[v]_B` is used.
- Calling `B` an ordered representation contract is therefore mathematically sound and pedagogically intentional.

### Target-space nuance
- A nonzero vector is a basis of its one-dimensional span, but not automatically a basis of a larger ambient space.
- Every statement “B is a basis” must name the target space.
- A redundant family may span the target space without being a basis.

Result: no blocking definition error found.

## Step 2 — Formula conditions and notation consistency

### Dimension contract
For `B_mat c = v`:
- `B_mat` has shape `n × k`;
- `c` belongs to `R^k`;
- `v` belongs to `R^n` in the declared ambient coordinates;
- column order in `B_mat` must equal the order in `B`.

### Coordinate formula
`[v]_B=(c_1,...,c_n)^T` is valid only when:
- `B` is an ordered basis of the space containing `v`;
- coefficients are listed in basis order;
- reconstruction yields `v`.

### Orthonormal shortcut
`c_i=v·b_i` is valid only when:
- the `b_i` form an orthonormal basis of the relevant space;
- `v` lies in that space;
- the same inner product defines orthonormality and coefficient recovery.

For an orthogonal but non-unit family:
`c_i=(v·b_i)/(b_i·b_i)`.

For a general non-orthogonal basis, dot products alone are not coordinates.

### Change-of-basis notation
`[v]_E=P_{E<-B}[v]_B` is valid for finite-dimensional `R^n` when:
- `E` and `B` are ordered bases of the same vector space;
- columns of `P_{E<-B}` are `[b_i]_E` in order;
- the formula is the forward reconstruction from B-coordinates to E-coordinates.

The inverse transformation is intentionally deferred to the matrix chapter.

Result: formula conditions and notation are internally consistent.

## Step 3 — Edge cases and counterexamples

### Edge case A — Zero vector
- The zero vector belongs to every span.
- The zero vector has unique zero coordinates in a basis.
- Any family containing the zero vector is linearly dependent.
- Therefore the zero vector cannot be a member of a nonempty basis.

### Edge case B — Empty and zero-dimensional space
- The empty family is conventionally a basis of the zero vector space.
- This edge convention is mathematically valid but intentionally excluded from the instructional examples because it does not support the engineering goals of §1.4.

### Edge case C — Swapped basis order
For standard basis `E=(e_1,e_2)` and `B=(e_2,e_1)`:
- the abstract vector `v=e_1` has `[v]_E=(1,0)^T`;
- the same vector has `[v]_B=(0,1)^T`;
- reconstruction returns the same vector.

This confirms that basis order changes coordinates, not the vector.

### Edge case D — Redundant family
For columns `e_1`, `e_2`, `e_1+e_2`:
- `z=(1,1,-1)^T` satisfies `B_mat z=0`;
- if `c` represents `v`, then `c+t z` also represents `v`;
- coefficients are not unique.

This confirms that span membership does not imply basis coordinates.

### Edge case E — Non-orthogonal basis
For `b_1=(1,0)^T`, `b_2=(1,1)^T`, `v=(3,2)^T`:
- solving coordinates gives `(1,2)^T`;
- raw dot products give `(3,5)^T`;
- raw dot coefficients reconstruct `(8,5)^T`, not `v`.

This provides a decisive counterexample to the invalid universal dot-product shortcut.

### Edge case F — Vector versus affine point
- Pure change-of-basis formulas apply directly to vectors such as velocity, force and displacement.
- Coordinates of points in frames with different origins require translation in addition to the linear basis change.
- §1.4 must therefore use velocity or displacement in its main robotics case, not silently treat world-position points as free vectors.
- Full affine and rigid transforms remain deferred.

Result: edge cases support the draft logic; no contradiction found.

## Step 4 — Numerical-sensitivity review

### Verified near-dependence claim
Test family:
- `b_1=(1,0)^T`;
- `b_2=(1,10^{-6})^T`.

This family is exactly independent but nearly parallel.

For `v=(1,10^{-3})^T`:
- exact coefficients are approximately `(-999,1000)^T`;
- the matrix condition number is approximately `2×10^6`;
- changing the second component of `v` by `10^{-9}` changes the coefficients by approximately `(-0.001,0.001)^T`;
- reconstruction residual remains zero in exact calculation.

Conclusion:
- exact uniqueness does not imply numerically stable coordinates;
- small residual does not prove stable coefficients;
- large canceling coefficients are a warning signal;
- no full condition-number theory is taught here, but sensitivity awareness is justified.

### Tolerance policy
- Exact statements use exact arithmetic language.
- Floating-point membership and orthonormality require explicit tolerance.
- Tolerance must scale with data magnitude and numerical method; it must not be an unexplained universal constant.
- Numerical rank, QR and SVD policy remain deferred to later lessons and PASS 09 implementation design.

Result: sensitivity statements are accurate and appropriately bounded.

## Step 5 — Scope leakage, overstatement and hidden assumptions

### No scope leakage found
The draft does not teach:
- determinant tests;
- explicit matrix inversion as a coordinate method;
- Gaussian elimination as a chapter topic;
- rank-nullity theorem;
- least-squares derivation;
- QR or SVD algorithms;
- PCA construction;
- eigen-analysis;
- affine or rigid-body transforms.

### Statements explicitly bounded
- `P_{E<-B}` is a finite-dimensional coordinate map, not a full treatment of linear transformations.
- Residual measures reconstruction mismatch, not physical truth.
- Feature sets are not automatically bases of physical state spaces.
- Embedding compatibility requires a shared representation contract.
- A basis can be mathematically valid yet numerically poor.
- Coordinate comparisons require the same basis, frame and version.

### Main robotics-case restriction
The later worked case must use a vector quantity such as velocity or displacement.
If position points are introduced, origin translation must be stated explicitly and cannot be hidden inside a pure basis-change formula.

Result: no blocking overstatement or hidden assumption remains.

## PASS 05 verification verdict

PASS.

Reasons:
- all core definitions and logical implications are correct for the finite-dimensional real-vector setting used;
- formula domains and basis-order semantics are consistent;
- zero-vector, redundant-family, swapped-order, non-orthogonal and near-dependent cases were tested;
- sensitivity claims were numerically verified;
- vector-versus-affine-point boundary was made explicit;
- no later theorem or algorithm leaked into §1.4;
- no patch to `theory_core_c01_l04.json` was required in this pass because no blocking mathematical defect was found;
- the core remains unapproved pending engineering, worked-case, misconception and implementation reviews;
- no browser smoke test is claimed because this is a content-only mathematics review.

## Next task
PASS 06/14 — Engineering-model review, consisting of 5 steps:
1. validate schemas, units and coefficient meanings;
2. validate coordinate-frame and timestamp contracts;
3. review robotics/control examples for physical correctness;
4. review signal/data/AI examples for modeling correctness;
5. identify operational failure modes and required telemetry.

PASS 06 may patch the core draft but must keep it unapproved until passes 7–9 are complete.

## Presentation/runtime status
- No UI/runtime file was changed.
- E235 remains the approved `Xem đầy đủ` baseline but UI work is paused.
- E236, E237 and E238 remain disabled from runtime.

## Relevant commits
- C01-L04 pass 01 scope lock: `5e88b37255f10af7dfbd4ec604598811d8b17409`
- C01-L04 pass 02 academic map: `156aba3b67d58d93ea127fca011b9f905fc7d3e1`
- C01-L04 pass 03 pedagogical spine: `a1a3a3a82014be9bde16c426e4fd4b45fec776c0`
- C01-L04 core draft: `6952d0904c073ea8ffb6376a0422784b38ce0881`
- C01-L04 pass 04 state: `52f9783ce20804e8beac5d7a00dfe6cf1bfd4da9`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
