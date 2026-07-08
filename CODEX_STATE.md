# CODEX_STATE

Current task: `THEORY_CORE_C01_L04_PASS_06_ENGINEERING_MODEL_REVIEW`

Status: `PASS_06_ENGINEERING_REVIEW_APPROVED_WITH_BINDING_CONSTRAINTS`

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
- Completed: 6/14 passes
- Remaining: 8/14 passes
- Completed steps: 30/73
- Remaining steps: 43/73

## Core architecture
- Current draft: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Draft version remains `CORE_C01_L04_V1_DRAFT`.
- Draft remains unapproved until passes 7–9 are complete.
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

# PASS 02 — BAUMAN ACADEMIC MAP
Status: PASS.

# PASS 03 — PEDAGOGICAL SPINE
Status: PASS.

# PASS 04 — CORE ACADEMIC CONTENT
Status: PASS FOR DRAFT CREATION, NOT FINAL APPROVAL.

Created:
`subjects/math/data/theory_core/theory_core_c01_l04.json`

# PASS 05 — INDEPENDENT MATHEMATICS REVIEW
Status: PASS.

Verified:
- definitions and logical implications;
- notation and formula domains;
- zero-vector, redundant-family, swapped-order and non-orthogonal counterexamples;
- near-dependence and numerical-sensitivity claims;
- vector-versus-affine-point boundary;
- no scope leakage into later matrix, least-squares or spectral topics.

# C01-L04 PASS 06 — ENGINEERING-MODEL REVIEW

## Step 1 — Schema, units and coefficient meanings

### Vector-schema contract
Every engineering vector must declare:
- component names and order;
- physical quantity represented;
- units for each component;
- coordinate frame or representation space;
- timestamp or sampling interval;
- schema and preprocessing version.

A matching numeric shape is not sufficient evidence of compatibility.

### Coefficient-unit contract
The units of coordinates depend on the basis definition:
- if basis vectors are dimensionless unit directions and `v` is a velocity vector, coefficients inherit velocity units such as m/s;
- if basis vectors carry the same physical units as `v`, coefficients may be dimensionless;
- if basis vectors are arbitrarily scaled, coefficient magnitudes and units must be derived and documented;
- coefficients are not automatically invariant physical quantities.

The later worked case must use dimensionless unit direction vectors so route coordinates have units m/s and remain easy to interpret.

### Mixed-unit state vectors
A state array may contain position, velocity, angle and other quantities with different units as a model schema. However:
- an arbitrary linear combination that mixes incompatible units is not automatically physically meaningful;
- norms, dot products and basis rotations across mixed-unit blocks require nondimensionalization, scaling or a declared metric;
- §1.4 must not imply that every algebraically valid basis of a mixed-unit numeric array is a physically useful state basis.

### Coefficient interpretation
Before interpreting a coefficient as longitudinal speed, mode amplitude, feature contribution or actuator command, verify:
- the basis semantics;
- basis normalization;
- sign convention;
- units;
- the target space;
- whether the representation is unique.

Verdict: the core concepts are valid; the above constraints are binding for passes 7 and 9.

## Step 2 — Coordinate-frame and timestamp contracts

### Transform-direction contract
For `P_{W<-R}`:
- source coordinates are in route basis `R`;
- target coordinates are in world basis `W`;
- column i is the i-th route basis vector expressed in world coordinates;
- `[v]_W = P_{W<-R}[v]_R`.

The arrow direction must never be inferred from variable names alone; it must be documented.

### Route-frame construction
For a planar route basis at matched path location `s`:
- tangent `t(s)` must be nonzero and normalized;
- a left-normal convention may use `n(s)=(-t_y,t_x)`;
- `R(s)=(t(s),n(s))` is ordered and right-handed in the declared 2-D convention;
- changing normal sign changes lateral-coordinate sign;
- at cusps, discontinuities or zero route derivative, the route basis is undefined and the sample must be rejected or handled by a separate policy.

### Timestamp contract
A vector and its basis/transform must refer to the same event time or an explicitly interpolated common time:
- store vector timestamp;
- store transform or basis timestamp;
- store transform age;
- reject or flag stale transforms beyond the allowed latency budget;
- do not compare world, body, sensor or route coordinates from unmatched times.

### Free vector versus point
Pure basis change applies directly to free vectors such as force, velocity and displacement.
A point coordinate in frames with different origins requires translation as well.
The main worked case must therefore use a velocity vector, not a position point.

### Moving-frame nuance
The worked case may express the same geometric velocity vector in two instantaneous orientations using a pure orthonormal basis change. It must not claim that this alone converts between absolute and relative velocities of moving frames; relative frame motion would require additional kinematic terms and remains deferred.

Verdict: frame logic is physically sound when these constraints are stated explicitly.

## Step 3 — Robotics and control review

### UGV route-tracking example
Approved model:
- one planar physical velocity vector at one timestamp;
- world basis `W=(e_x,e_y)`;
- route basis `R=(t,n)` evaluated at the matched route location;
- `t` and `n` dimensionless and orthonormal;
- longitudinal and lateral coordinates measured in m/s;
- reconstruction back to world coordinates is mandatory.

Required cautions:
- route basis is not automatically the robot body basis;
- route heading, robot yaw and sensor orientation are different quantities;
- a body-frame velocity and a route-frame velocity may have different coordinates even at the same timestamp;
- lateral sign depends on the declared normal convention;
- route projection must use a valid matched route point and nonzero tangent.

### Control interpretation
Longitudinal and lateral coordinates can simplify route-following logic, but:
- a convenient coordinate system does not by itself prove controller stability;
- small lateral velocity does not imply small lateral position error;
- basis change alone is not a control law;
- actuator directions spanning instantaneous motion must not be confused with controllability over time.

### IMU example
The phrase “acceleration components along sensor axes” is acceptable only with processing state declared:
- a raw accelerometer primarily measures specific force, not inertial acceleration directly;
- gravity compensation, bias calibration and sensor-to-body rotation affect interpretation;
- calibration version, handedness, axis order and timestamp are mandatory;
- missing this metadata can produce a plausible array with the wrong physical meaning.

Verdict: robotics/control examples are approved under the above interpretation boundaries.

## Step 4 — Signal, data and AI review

### Signal basis
Coefficient recovery by inner products requires:
- the same sampling grid;
- the same window length;
- a declared discrete or continuous inner product;
- declared weighting and normalization;
- orthonormality under that exact inner product;
- compatible boundary and preprocessing conventions.

Changing sample rate, windowing or normalization changes the representation contract even if array length remains equal.

### Feature engineering
Required distinctions:
- duplicate or exact linear-combination features create linear dependence in the feature representation;
- a nonlinear derived feature may be redundant in an information sense but does not establish linear dependence;
- empirical correlation is not the same as exact algebraic dependence;
- feature coordinates are schema values, not automatically coordinates of an underlying physical-state basis;
- scaling and centering change geometry and must be versioned, though deeper analysis remains for §1.5.

### Overcomplete dictionaries
Approved interpretation:
- more atoms than ambient dimension generally creates dependence;
- exact representations may be non-unique;
- a sparse or regularized solver selects a solution according to an extra criterion;
- the selected coefficients are not converted into basis coordinates merely because the solver returns one vector.

### Embedding systems
Direct comparison requires compatibility of:
- model identifier and weights version;
- embedding dimension;
- tokenizer or input encoder;
- pooling rule;
- preprocessing;
- normalization policy;
- representation-space alignment.

Even with equal dimension, embeddings from incompatible models are different coordinate systems. Cosine similarity across them is not automatically meaningful.

Verdict: signal/data/AI examples are conceptually correct and now have explicit modeling boundaries.

## Step 5 — Operational failure modes and required telemetry

### Failure modes to test later
1. swapped basis-column order;
2. source/target transform direction reversed;
3. stale transform or unmatched timestamps;
4. left/right normal sign convention changed;
5. non-unit route tangent used as a unit direction;
6. route derivative zero or undefined;
7. body frame confused with route frame;
8. velocity vector confused with position point;
9. mixed units combined without scaling contract;
10. dot shortcut used on non-orthonormal directions;
11. near-dependent basis produces large canceling coefficients;
12. reconstruction residual accepted without checking units/frame;
13. raw IMU specific force labeled inertial acceleration;
14. signal basis reused with a different sample grid or normalization;
15. nonlinear feature called linearly dependent;
16. dictionary coefficients labeled unique basis coordinates;
17. embeddings compared across incompatible model pipelines;
18. NaN, infinity or silent broadcasting accepted.

### Mandatory telemetry for the final implementation contract
General:
- vector shape and finite-value status;
- schema ID and version;
- component order;
- units;
- vector timestamp;
- source and target frame IDs;
- basis ID, version and ordered-column hash;
- transform direction and timestamp;
- transform age;
- tolerance policy;
- reconstruction residual norm;
- coefficient norm and maximum absolute coefficient;
- solver mode: exact, orthonormal shortcut, approximate or redundant;
- warning flags for near dependence and incompatible representation.

Robotics:
- route location or matched arc-length;
- route tangent norm;
- normal-sign convention;
- robot yaw and route heading kept as separate fields;
- calibration version for sensor/body transforms;
- gravity-compensation state for IMU-derived acceleration.

Signal:
- sample rate;
- window length;
- sample grid or time interval;
- inner-product definition;
- weighting/window function;
- normalization convention.

Data and AI:
- feature-schema version;
- centering/scaling statistics version;
- model and weights version;
- tokenizer/encoder and pooling version;
- embedding normalization state;
- alignment version when comparing spaces.

## Core-file patch decision
No patch was made to `theory_core_c01_l04.json` in PASS 06 because:
- the mathematical core and high-level engineering examples contain no direct contradiction;
- `workedCase`, misconceptions and implementation contract are still explicitly provisional;
- the newly locked engineering constraints belong in the detailed worked case of PASS 07 and the operational contract of PASS 09;
- duplicating unfinished requirements into multiple draft sections now would create drift.

This is not a waiver. The constraints above are binding acceptance criteria for passes 7 and 9. Failure to encode them there blocks approval.

## PASS 06 verification verdict
PASS WITH BINDING CONSTRAINTS.

Reasons:
- schema, units and coefficient meanings are now explicit;
- frame direction, timestamp and route-basis construction are physically bounded;
- robot, IMU and control claims avoid common category errors;
- signal, feature, dictionary and embedding examples have correct modeling conditions;
- 18 operational failure modes and the required telemetry set are locked;
- no complete worked case or implementation contract was prematurely authored;
- no UI/runtime or presentation file was modified;
- no browser smoke test is claimed because this is a content and modeling review.

## Next task
PASS 07/14 — Complete worked case, consisting of 6 steps:
1. define the engineering scenario and representation contract;
2. choose exact numerical data and ordered bases;
3. compute coordinates in world and route bases;
4. verify reconstruction, invariants and basis-order behavior;
5. test mixed-frame, sign-convention and near-dependence failures;
6. write interpretation, decision logic and reusable case outputs.

PASS 07 must patch `theory_core_c01_l04.json` by replacing the provisional worked case with a complete verified case. The file remains unapproved until passes 8–9 are complete.

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
- C01-L04 pass 05 mathematics review: `b96273479921523d71d365da5b68547ede356059`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
