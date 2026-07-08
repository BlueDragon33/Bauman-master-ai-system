# CODEX_STATE

Current task: THEORY_CORE_C01_L04_PASS_04_CORE_ACADEMIC_CONTENT

Status: PASS_04_CORE_DRAFT_CREATED_MATH_REVIEW_REQUIRED

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
- Completed: 4/14 passes
- Remaining: 10/14 passes
- Completed steps: 20/73
- Remaining steps: 53/73

## Core architecture
- Core content is presentation-independent.
- Core files contain no slide numbering, popup labels, CSS, animation or layout instructions.
- `subjects/math/data/theory_lecture_content.json` remains unchanged during the core phase.
- Downstream reference, slideshow, full-view and formula/layout content must derive from the approved core and may not contradict it.
- C01-L04 is not registered in the manifest until passes 1–9 are complete.
- The current draft is not approved and may still be corrected in passes 5–9.

## Gold standard and continuity
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Continuity references: C01-L02 and approved C01-L03.
- Current draft: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Draft version: `CORE_C01_L04_V1_DRAFT`.
- Draft status: `math_review_required`.

## Notation contract
- Distinguish the abstract vector `v` from its coordinate vector `[v]_B`.
- An ordered basis is written `B = (b_1, ..., b_n)`; changing order changes the coordinate tuple.
- `B_mat = [b_1 ... b_n]` is the matrix whose columns follow the ordered basis.
- `v = B_mat[v]_B` reconstructs the abstract vector in ambient coordinates.
- `P_{E<-B}` maps B-coordinates to standard E-coordinates; its columns are `[b_i]_E` in the declared order.
- `x_i` uses a subscript; `x_i^2` has i below and 2 above; `x_i^T` retains i below and T above.
- Raw notation must remain semantic before renderer processing.

# PASS 01 — SCOPE LOCK

Status: PASS.

Locked:
- exact lesson identity and position;
- prerequisites from §§1.1–1.3;
- required content and deferred content;
- correction that nonlinear derived features do not establish linear dependence;
- distinction among span membership, basis validity and coordinate uniqueness;
- no determinant, inverse, Gaussian elimination, rank-nullity, PCA, SVD or full least squares in this lesson.

# PASS 02 — BAUMAN ACADEMIC MAP

Status: PASS.

Locked chain:
`linear combination → span → linear independence → basis → coordinates → uniqueness → change of basis → exact/approximate representation`.

Locked applications:
- world/body/sensor/route frames;
- state representation;
- orthonormal signal modes;
- feature sets versus mathematical bases;
- overcomplete dictionaries;
- embedding-space version compatibility.

Locked downstream dependencies:
- §1.5 subspaces, dimension and rank;
- Chapter 2 matrix and linear-map machinery;
- least squares and estimation;
- PCA/SVD and signal transforms;
- robotics coordinate transforms and state-space methods.

# PASS 03 — PEDAGOGICAL SPINE

Status: PASS.

Locked thesis:
- basis is an ordered representation contract;
- span gives representability;
- independence removes ambiguity;
- coordinates encode a vector in a basis;
- a basis change changes the encoding, not the abstract or physical vector.

Locked pedagogy:
- ten measurable learning outcomes;
- nine learning phases from one-vector/two-coordinate dissonance to engineering transfer;
- ten planned misconception intercepts;
- cognitive-load controls using stable 2-D examples and staged notation;
- mastery requires calculation, reconstruction, interpretation, condition checking and representation design.

# C01-L04 PASS 04 — CORE ACADEMIC CONTENT

## Step 1 — Notation and semantic contracts
Completed with 16 notation rules covering:
- target vector space `V`;
- ordered family `B = (b_1, ..., b_k)`;
- coefficient column `c`;
- linear combination and span;
- independence relation;
- coordinate vector `[v]_B`;
- column matrix `B_mat`;
- reconstruction and residual;
- standard basis `E`;
- change-of-basis notation `P_{E<-B}`;
- orthonormal coefficient shortcut.

Quality decisions:
- abstract vector and coordinate vector are never conflated;
- order is part of the representation contract;
- matrix notation is introduced only as compact reconstruction notation, not as a full matrix-method lesson.

## Step 2 — Core concepts
Completed with 9 concepts:
1. coordinates as a basis-dependent encoding;
2. linear combination as vector construction;
3. span as exact representable set;
4. independence as removal of redundant directions;
5. basis as spanning plus independence;
6. basis order as data;
7. orthonormal basis and coefficient recovery;
8. exact validity versus numerical robustness;
9. basis versus feature set versus dictionary.

## Step 3 — Main mechanisms
Completed with 9 mechanisms:
1. build a vector by linear combination;
2. test span membership;
3. test linear independence;
4. validate a basis for a stated target space;
5. compute coordinates in a general basis;
6. compute coordinates in an orthonormal basis;
7. change representation while keeping the vector fixed;
8. diagnose redundancy and non-uniqueness;
9. separate exact and approximate representation.

Every mechanism includes ordered steps and a quality check.

## Step 4 — Main formulas
Completed with 12 formulas:
1. linear combination;
2. span definition;
3. span membership through `B_mat c = v`;
4. linear independence criterion;
5. basis criterion;
6. coordinate vector definition;
7. reconstruction;
8. coordinate uniqueness;
9. orthonormal coefficient shortcut;
10. reconstruction from B-coordinates into standard coordinates;
11. representation residual;
12. non-uniqueness in a redundant generating family.

Every formula includes:
- question answered;
- mathematical meaning;
- conditions;
- undefined or invalid case;
- sensitivity;
- failure mode;
- engineering use.

## Step 5 — Comparison logic and assumption gates
Completed comparison logic for:
- spanning family;
- independent family;
- basis;
- orthonormal basis;
- overcomplete dictionary;
- feature set.

Completed method-selection logic for:
- general basis;
- orthonormal basis;
- redundant family;
- out-of-span vector;
- incompatible coordinate systems.

Completed 12 assumption gates:
1. declared target space;
2. same ambient space;
3. fixed ordered family;
4. schema, units, frame and timestamp compatibility;
5. spanning target;
6. linear independence;
7. orthonormality;
8. basis scaling;
9. near dependence;
10. exact versus approximate intent;
11. reconstruction;
12. representation compatibility.

## Step 6 — Bridges and provisional downstream mapping
Completed bridges to:
- §1.5 subspaces and data representation;
- Chapter 2 matrices and linear maps;
- least squares and estimation;
- PCA and SVD;
- signal representations;
- robotics, control and estimation.

Downstream mapping is present for:
- reference table;
- slideshow;
- full view;
- formula finalization.

## Sections intentionally provisional
The following sections exist only to preserve the future schema and are not approved:
- `workedCase.status = provisional_for_pass_07`;
- all current misconceptions are `provisional_for_pass_08`;
- all current mastery checks are `provisional_for_pass_09`;
- `implementationContract.status = provisional_for_pass_09`.

The candidate worked case is:
- same physical UGV velocity represented in world basis and route-aligned orthonormal basis;
- units, frame, orientation, reconstruction, order swap and mixed-frame failure are mandatory;
- numerical values and invariants are not finalized until PASS 07.

## PASS 04 verification
Verified after commit:
- JSON opens and closes correctly;
- metadata reports `math_review_required`;
- content contract blocks approval before pass 09;
- 10 learning outcomes are present;
- 16 notation rules are present;
- 9 core concepts are present;
- 9 main mechanisms are present;
- 12 main formulas are present;
- each main formula contains all required contract fields;
- 12 assumption gates are present;
- provisional sections remain explicitly provisional;
- no UI/runtime or presentation file was changed;
- no browser smoke test is claimed because the task is content-only.

PASS 04 status: PASS FOR DRAFT CREATION, NOT ACADEMIC APPROVAL.

## Next task
PASS 05/14 — Independent mathematics review, consisting of 5 steps:
1. verify definitions and logical equivalences;
2. verify formula conditions and notation consistency;
3. test edge cases and counterexamples;
4. check numerical-sensitivity statements without teaching later machinery;
5. detect scope leakage, overstatement and hidden assumptions.

PASS 05 may patch `theory_core_c01_l04.json` but must keep it unapproved until passes 6–9 are complete.

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
- C01-L04 pass 02 academic map: `156aba3b67d58d93ea127fca011b9f905fc7d3e1`
- C01-L04 pass 03 pedagogical spine: `a1a3a3a82014be9bde16c426e4fd4b45fec776c0`
- C01-L04 core draft: `6952d0904c073ea8ffb6376a0422784b38ce0881`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
