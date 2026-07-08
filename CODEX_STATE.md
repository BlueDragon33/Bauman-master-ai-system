# CODEX_STATE

Current task: `THEORY_CORE_C01_L04_PASS_07_COMPLETE_WORKED_CASE`

Status: `PASS_07_WORKED_CASE_VERIFIED`

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
- Completed: 7/14 passes
- Remaining: 7/14 passes
- Completed steps: 36/73
- Remaining steps: 37/73

## Core architecture
- Current draft: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Draft version: `CORE_C01_L04_V1_DRAFT`.
- Draft status remains `math_review_required`.
- Worked case status: `verified_pass_07`.
- Draft remains unapproved until passes 8–9 are complete.
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

Locked scope, prerequisites, lesson boundaries and deferred mathematics.

# PASS 02 — BAUMAN ACADEMIC MAP
Status: PASS.

Locked mathematical chain, master-level depth, robotics/control, signal/data/AI and downstream dependencies.

# PASS 03 — PEDAGOGICAL SPINE
Status: PASS.

Locked thesis, 10 measurable outcomes, 9 learning phases, misconception interception plan and mastery narrative.

# PASS 04 — CORE ACADEMIC CONTENT
Status: PASS FOR DRAFT CREATION.

Created the C01-L04 core draft with:
- notation and semantic contracts;
- core concepts and mechanisms;
- 12 formula contracts;
- comparison logic and assumption gates;
- bridges and downstream mapping;
- provisional worked case, misconceptions, assessment and implementation sections.

# PASS 05 — INDEPENDENT MATHEMATICS REVIEW
Status: PASS.

Verified:
- definitions, logical equivalences and formula domains;
- basis order and coordinate uniqueness;
- zero-vector, redundant-family, non-orthogonal and near-dependent edge cases;
- vector-versus-affine-point boundary;
- no scope leakage into later matrix or spectral topics.

# PASS 06 — ENGINEERING-MODEL REVIEW
Status: PASS WITH BINDING CONSTRAINTS.

Locked:
- schema, units and coefficient meanings;
- frame direction, route-frame construction and timestamps;
- UGV, control and IMU interpretation boundaries;
- signal, feature, dictionary and embedding compatibility;
- 18 operational failure modes and required telemetry.

# C01-L04 PASS 07 — COMPLETE WORKED CASE

## Step 1 — Engineering scenario and representation contract

Scenario:
- planar UGV velocity vector at one timestamp;
- matched route location `s = 42 m`;
- world frame `W_ENU_2D`;
- route frame `R_ROUTE_LEFT_NORMAL_S42`;
- robot body frame explicitly not used as route basis;
- same free velocity vector is expressed in two ordered bases;
- no position-point translation and no relative moving-frame velocity are claimed.

Metadata:
- event time `2026-07-08T08:30:00+07:00`;
- units `m/s`;
- world order `[v_x_W, v_y_W]`;
- route order `[v_parallel, v_left]`;
- route heading `53.13010235415598°`;
- robot yaw separately recorded as `50°`.

## Step 2 — Exact numerical data and ordered bases

World basis:
- `W = (e_x,e_y)`;
- `e_x=(1,0)`;
- `e_y=(0,1)`.

Route basis:
- `t=(3/5,4/5)=(0.6,0.8)`;
- left normal `n=(-4/5,3/5)=(-0.8,0.6)`;
- ordered basis `R=(t,n)`;
- `t·t=1`, `n·n=1`, `t·n=0`, determinant `1`.

Transform:
- `P_{W<-R}=[[0.6,-0.8],[0.8,0.6]]`;
- columns are `t` and `n` written in W;
- source coordinates R, target coordinates W.

Given velocity:
- `[v]_W=(5,1)^T m/s`.

## Step 3 — Coordinate calculation

Because R is orthonormal:
- `v_parallel=v·t=5(0.6)+1(0.8)=3.8 m/s`;
- `v_left=v·n=5(-0.8)+1(0.6)=-3.4 m/s`.

Therefore:
- `[v]_R=(3.8,-3.4)^T m/s`.

Interpretation under left-normal convention:
- longitudinal component is `3.8 m/s` forward along the route;
- lateral component is `3.4 m/s` toward the right because the left coordinate is negative.

## Step 4 — Reconstruction, invariants and basis order

Reconstruction:
- `3.8t=(2.28,3.04)`;
- `-3.4n=(2.72,-2.04)`;
- sum `(5,1)`;
- residual `(0,0)`;
- residual norm `0`.

Norm invariant:
- world norm squared `25+1=26`;
- route-coordinate norm squared `3.8^2+(-3.4)^2=26`;
- speed in both representations `sqrt(26)=5.0990195135927845 m/s`.

Basis-order test:
- swapped basis `R_swap=(n,t)`;
- correct swapped coordinates `(-3.4,3.8)^T`;
- reconstruction remains `(5,1)`;
- keeping the old tuple after swapping columns would change the physical vector.

Normal-convention test:
- right normal `n_right=(0.8,-0.6)`;
- coordinates become `(3.8,3.4)^T`;
- reconstructed vector remains `(5,1)`;
- only the lateral sign convention changes.

## Step 5 — Failure tests

### Mixed frame
Mistake:
- read route tuple `(3.8,-3.4)` as world coordinates.

Result:
- wrong world vector `(3.8,-3.4)`;
- error vector `(-1.2,-4.4)`;
- error norm `4.560701700396552`.

Lesson:
- same shape and units do not compensate for missing basis metadata.

### Reversed transform
Mistake:
- use `P_{R<-W}=P_{W<-R}^T` in the wrong direction to reconstruct route coordinates.

Result:
- wrong vector `(-0.44,-5.08)`;
- error norm `8.158431221748456`.

Lesson:
- transpose being the inverse of an orthonormal transform does not remove the need to track source and target direction.

### Non-unit directions
Mistake:
- use `q=(3,4)` and `m=(-4,3)` as if they were unit directions;
- take raw dot products `(19,-17)` as coordinates.

Result:
- wrong reconstruction `(125,25)`.

Correct treatment:
- divide by squared norm `25`;
- coefficients `(0.76,-0.68)`;
- reconstruction `(5,1)`.

### Stale basis
Mistake:
- use route basis from another timestamp or matched route point.

Lesson:
- arithmetic may remain valid while the geometric event is wrong;
- vector timestamp, basis timestamp, transform age and route location must be checked.

### Near-dependence contrast
Separate basis:
- `b_1=(1,0)`;
- `b_2=(1,0.001)`.

For target `(5,1)`:
- coordinates `(-995,1000)`.

For perturbed target `(5,1.001)`:
- coordinates `(-996,1001)`.

A `0.001` change in input produces coefficient change `(-1,1)` while both residuals remain zero.

Lesson:
- exact reconstruction and uniqueness do not guarantee stable coefficients;
- large canceling coefficients warn of near dependence.

## Step 6 — Interpretation and reusable outputs

Decision logic:
- use route coordinates only when tangent is valid, basis is orthonormal, frames match and timestamps are aligned;
- interpret the sign only after declaring the normal convention;
- do not infer lateral position error or controller stability from lateral velocity alone;
- when reconstruction fails, check order, frame, units, transform direction and timestamps before declaring out-of-span;
- flag large canceling coefficients even when residual is small.

Reusable verified outputs:
- world vector `(5,1)^T m/s`;
- route coordinates `(3.8,-3.4)^T m/s`;
- transform `[[0.6,-0.8],[0.8,0.6]]`;
- exact reconstruction `(5,1)^T`;
- residual norm `0`;
- invariant speed `sqrt(26)`;
- mandatory metadata includes timestamps, frame IDs, basis order, normal convention, units, route location and transform direction.

## PASS 07 verification verdict
PASS.

Verified:
- same physical vector is maintained;
- basis and order are explicit;
- coefficient units are correct;
- world/route/body distinctions are explicit;
- timestamps are matched;
- orthonormality and transform direction are verified;
- coordinate arithmetic and reconstruction are exact;
- norm invariant is verified;
- basis-order and sign-convention behavior are verified;
- mixed-frame, reversed-transform, non-unit and stale-basis failures are included;
- near dependence is isolated from the main orthonormal case;
- no affine-point or moving-frame velocity claim leaked into the case;
- JSON opens and closes correctly;
- misconceptions and implementation contract remain reserved for passes 8–9;
- no UI/runtime or presentation file was modified;
- no browser smoke test is claimed because this is a content-only worked-case pass.

## Next task
PASS 08/14 — Misconceptions and failure modes, consisting of 5 steps:
1. expand and classify conceptual misconceptions;
2. add mathematical counterexamples and repair explanations;
3. map engineering failure modes to symptoms and root causes;
4. define diagnostic questions and corrective actions;
5. verify coverage against passes 3, 5, 6 and the worked case.

PASS 08 must patch `theory_core_c01_l04.json` by replacing provisional misconceptions with a complete reviewed section. The file remains unapproved until PASS 09 is complete.

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
- C01-L04 pass 06 engineering review: `7069861896b06ada6675a7892100b20235917f3f`
- C01-L04 pass 07 worked case: `61b726d486b2bc5060b8422351eb8239c8e02eb3`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
