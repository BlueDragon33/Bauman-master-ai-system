# CODEX_STATE

Current task: THEORY_CORE_C01_L04_PASS_03_PEDAGOGICAL_SPINE

Status: PASS_03_PEDAGOGICAL_SPINE_LOCKED

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
- Completed: 3/14 passes
- Remaining: 11/14 passes
- Completed steps: 14/73
- Remaining steps: 59/73

## Core architecture
- Core content is presentation-independent.
- Core files contain no slide numbering, popup labels, CSS, animation or layout instructions.
- `subjects/math/data/theory_lecture_content.json` remains unchanged during the core phase.
- Downstream reference, slideshow, full-view and formula/layout content must derive from the approved core and may not contradict it.
- C01-L04 is not registered in the manifest until passes 1–9 are complete.

## Gold standard and continuity
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Continuity references: C01-L02 and approved C01-L03.
- Target file after the core passes: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Position: after §1.3 dot/angle/projection and before §1.5 subspace/data representation.

## Notation contract
- Distinguish the abstract vector `v` from its coordinate vector `[v]_B`.
- An ordered basis is written `B = (b_1, ..., b_n)`; changing order changes the coordinate tuple.
- `v = sum_i c_i b_i` reconstructs the abstract vector from basis coordinates.
- `x_i` uses a subscript; `x_i^2` has i below and 2 above; `x_i^T` retains i below and T above.
- Raw notation must remain semantic before renderer processing.

# PASS 01 SUMMARY — SCOPE LOCK

Locked prerequisites:
- vector meaning, schema, units and vector operations from §1.1;
- norm, distance and reconstruction error from §1.2;
- dot product, orthogonality, projection and residual from §1.3;
- elementary solution of a small two-equation system.

Required scope:
- linear combination and span;
- exact span membership;
- spanning family versus basis;
- linear independence sufficient to define a basis;
- standard and non-standard ordered bases;
- coordinates, uniqueness and reconstruction;
- introductory relation `Bc = v`;
- orthonormal shortcut `c_i = v · b_i` with explicit conditions;
- exact versus approximate representation;
- introductory change of basis;
- near-dependence warning;
- distinction among basis, feature set and dictionary.

Deferred scope:
- full subspace theory, dimension/rank theorems and rank-nullity;
- Gaussian elimination, determinant, inverse and factorization;
- full least squares, PCA, SVD, Fourier, wavelets and eigen-analysis;
- UI/runtime and presentation decisions.

Locked corrections:
- `speed = sqrt(v_x^2 + v_y^2)` is nonlinear dependence, not linear dependence;
- a vector may lie in the span of a redundant family without that family being a basis;
- coordinates are unique only for a basis;
- dot products recover coordinates directly only for an orthonormal basis;
- an arbitrary feature set is not automatically a mathematical basis.

Pass 01 status: PASS.

# PASS 02 SUMMARY — BAUMAN ACADEMIC MAP

Mathematical chain:
`linear combination → span → linear independence → basis → coordinates → uniqueness → change of basis → exact/approximate representation`.

Master-level preparation:
- basis is an ordered encoding contract;
- basis choice affects interpretability, sparsity, numerical conditioning and model convenience;
- exact independence may still be numerically fragile when vectors are nearly dependent;
- physical vectors and coordinate arrays must not be conflated;
- learners must justify the basis selected for a task.

Robotics/control map:
- world, body and sensor frames provide different coordinates for the same physical vector;
- mixed-frame arithmetic is invalid;
- route-aligned coordinates can simplify control;
- axes, units, orientation convention, timestamp and frame metadata are mandatory.

Signal/data/AI map:
- orthonormal signal bases permit coefficient recovery by inner products;
- feature axes are not automatically a basis of physical state space;
- overcomplete dictionaries may represent vectors non-uniquely;
- embedding coordinates from incompatible models are not directly comparable.

Downstream dependencies:
- §1.5 consumes span, basis, uniqueness and residual, then adds subspace, dimension and rank;
- Chapter 2 consumes `Bc = v`, ordered columns and coordinate changes, then adds matrix machinery;
- later least squares, PCA/SVD, signal transforms, robotics and estimation consume the representation contract established here.

Pass 02 status: PASS.

# C01-L04 PASS 03 — PEDAGOGICAL SPINE

## Step 1 — Central lesson thesis

Canonical thesis:

> Cơ sở là một hợp đồng biểu diễn có thứ tự: nó chọn đủ các hướng độc lập để mọi vector trong không gian đang xét có đúng một bộ tọa độ. Span cho biết biểu diễn đó tạo được những gì; tọa độ cho biết cần bao nhiêu ở mỗi hướng; đổi cơ sở làm thay đổi các con số mô tả nhưng không làm thay đổi vector vật lý hoặc đối tượng trừu tượng đang được mô tả.

Supporting ideas:
- coordinates are answers to a representation question, not the vector itself;
- spanning provides representability;
- independence removes ambiguity;
- basis combines representability and uniqueness;
- a useful engineering basis should be mathematically valid and operationally meaningful;
- reconstruction is the primary evidence that coordinates match the intended vector;
- residual reveals what the chosen span cannot represent exactly.

Memory anchor for later presentation, not UI copy:
- `Span = vùng tạo được`.
- `Basis = đủ hướng, không hướng thừa`.
- `Coordinates = mã của vector trong basis có thứ tự`.
- `Reconstruction = phép kiểm tra mã đó có đúng hay không`.

## Step 2 — Measurable learning outcomes with evidence

The complete core must include at least these ten outcomes.

### LO1 — Interpret a linear combination
Outcome:
- Explain a linear combination as assembling a vector from weighted directions.
Evidence:
- Given `b_1`, `b_2` and coefficients, compute the resulting vector and explain the meaning and units of each coefficient.

### LO2 — Determine simple span membership
Outcome:
- Decide whether a 2-D or simple 3-D vector lies in a stated span.
Evidence:
- Produce valid coefficients and verify reconstruction, or show why the coordinate equations are inconsistent.

### LO3 — Distinguish generating family, independent family and basis
Outcome:
- Classify a vector family relative to a stated space.
Evidence:
- State separately whether it spans, whether it is independent and whether it is therefore a basis.

### LO4 — Explain existence and uniqueness of coordinates
Outcome:
- Explain why spanning creates existence and independence creates uniqueness.
Evidence:
- Diagnose a missing-direction example and a redundant-direction example without relying only on memorized definitions.

### LO5 — Compute coordinates in a non-standard ordered basis
Outcome:
- Find `[v]_B` for a valid 2-D non-standard basis.
Evidence:
- Solve the coordinate equations, report the ordered coefficient vector and reconstruct `v`.

### LO6 — Distinguish vector from coordinate representation
Outcome:
- Describe one abstract or physical vector using two coordinate systems.
Evidence:
- Keep the underlying vector fixed while correctly changing its coordinate tuple and naming both bases or frames.

### LO7 — Use the orthonormal-basis shortcut correctly
Outcome:
- Recover coefficients by dot products only when the basis is orthonormal.
Evidence:
- Check orthogonality and unit norm before using `c_i = v · b_i`; reject the shortcut for a general basis.

### LO8 — Evaluate representation quality
Outcome:
- Distinguish exact, redundant and approximate representation.
Evidence:
- Use reconstruction and residual to explain whether a vector is represented exactly, ambiguously or only approximately.

### LO9 — Identify numerical and engineering risks
Outcome:
- Recognize near dependence, mixed coordinate frames, unit mismatch and basis-order errors.
Evidence:
- Predict the failure produced by each contract violation and propose the required corrective action.

### LO10 — Select a task-appropriate representation
Outcome:
- Justify a basis or coordinate system for a robotics, signal or data task.
Evidence:
- Compare at least two representations using interpretability, numerical sensitivity, reconstruction and downstream use rather than personal preference.

Outcome policy:
- no outcome may use only vague verbs such as “understand” or “know”;
- each outcome must map to at least one mastery check and one observable artifact;
- computation without interpretation is insufficient;
- interpretation without a reconstruction or condition check is insufficient.

## Step 3 — Learning sequence from intuition to transfer

The core and later presentation must follow this cognitive sequence.

### Phase A — Productive dissonance: one vector, two coordinate tuples
Learner sees:
- one physical 2-D velocity vector;
- its coordinates in the world frame;
- different coordinates in a route-aligned or body frame.

Purpose:
- break the misconception that the coordinate tuple is the vector itself;
- create a genuine need for a named ordered basis.

Checkpoint A:
- identify what stayed fixed and what changed.

### Phase B — Build vectors from directions
Introduce:
- linear combination;
- coefficient meaning;
- reconstruction from chosen directions.

Purpose:
- make span emerge from an operational question: “What can these directions produce?”

Checkpoint B:
- calculate one combination and interpret coefficients with units.

### Phase C — Discover span and missing directions
Introduce:
- span as all reachable combinations;
- exact membership;
- inconsistent coordinate equations as evidence of a missing direction.

Purpose:
- link span to representability before introducing basis terminology.

Checkpoint C:
- decide whether a target vector lies in a 1-D span inside R^2.

### Phase D — Discover redundancy and ambiguity
Introduce:
- a redundant generating family;
- two different coefficient vectors producing the same vector;
- linear dependence as the source of ambiguity.

Purpose:
- make uniqueness a problem the learner wants to solve.

Checkpoint D:
- exhibit two coordinate descriptions using a redundant family and explain why they are not basis coordinates.

### Phase E — Define basis as the solution
Introduce:
- basis = spanning + linearly independent;
- existence from spanning;
- uniqueness from independence;
- order dependence of coordinates.

Purpose:
- present the definition as a resolution to missing-direction and redundancy problems.

Checkpoint E:
- classify candidate families and justify both conditions.

### Phase F — Compute coordinates and verify reconstruction
Introduce:
- `[v]_B`;
- coordinate equations;
- reconstruction invariant;
- standard versus non-standard basis.

Purpose:
- turn the definition into a reliable procedure.

Checkpoint F:
- compute coordinates in a non-standard 2-D basis and reconstruct the vector exactly.

### Phase G — Connect projection to orthonormal coordinates
Introduce:
- orthonormal basis;
- coefficient shortcut by dot products;
- why the shortcut fails for a non-orthonormal basis.

Purpose:
- connect directly to §1.3 without confusing projection coefficients with general-basis coordinates.

Checkpoint G:
- choose the valid coefficient method for two different bases.

### Phase H — Change representation without changing the object
Introduce:
- same vector, two ordered bases;
- coordinate conversion at conceptual and small exact-computation level;
- invariants versus coordinate-dependent quantities.

Purpose:
- prepare linear maps, frame transforms and matrix representations.

Checkpoint H:
- explain why equal coordinate tuples in different bases need not represent equal vectors.

### Phase I — Transfer to Bauman engineering contexts
Use controlled transfer:
- robot world/body/route frames;
- signal coefficients in an orthonormal basis;
- redundant features and overcomplete dictionaries;
- incompatible embedding spaces.

Purpose:
- show one mathematical contract appearing in multiple disciplines without pretending the applications are identical.

Final transfer task:
- select and justify a representation for one UGV state or signal window, including basis order, units, frame, reconstruction check and expected downstream use.

## Step 4 — Misconception and cognitive-load plan

### Misconception sequence to intercept

M1. “A coordinate tuple is the vector.”
- Intercept in Phase A using one vector with two coordinate tuples.

M2. “Any collection of directions is a basis.”
- Intercept before the basis definition using separate missing-direction and redundant-direction cases.

M3. “Belonging to span means coordinates are unique.”
- Intercept with an overcomplete generating family that gives multiple coefficient vectors.

M4. “More vectors always mean more information.”
- Intercept with a dependent direction that does not enlarge the span.

M5. “Dot products always give basis coordinates.”
- Intercept when transitioning from §1.3; contrast orthonormal and non-orthonormal bases.

M6. “Basis order is cosmetic.”
- Intercept by swapping `B = (b_1,b_2)` to `B' = (b_2,b_1)` and showing the coordinate tuple swaps.

M7. “A feature set is automatically a basis.”
- Intercept in the data transfer phase; distinguish axes chosen by a table schema from a basis of an underlying vector space.

M8. “Exact algebraic independence guarantees safe computation.”
- Intercept with a nearly parallel pair; introduce sensitivity without full conditioning theory.

M9. “Changing coordinates changes the physical state.”
- Intercept with a frame example and explicit invariant physical velocity.

M10. “A small residual proves the model is physically correct.”
- Intercept by separating representational fit from model validity.

### Cognitive-load controls
- introduce at most one new representational distinction per phase;
- use 2-D examples before 3-D or abstract spaces;
- keep the same main vector across several early phases so only the representation changes;
- avoid determinant, inverse and elimination notation in this lesson;
- use a visual/geometric interpretation and an algebraic reconstruction side by side, but never introduce both with new symbols simultaneously;
- separate exact arithmetic examples from floating-point sensitivity examples;
- delay basis/dictionary/feature-set comparison until basis uniqueness is secure;
- repeat the invariant “same vector, different coordinates” at three planned retrieval points;
- require short checkpoints before adding the next conceptual layer;
- use counterexamples as diagnosis, not as decorative trivia.

### Retrieval and spacing plan
Retrieval 1:
- after Phase C, ask what span answers.

Retrieval 2:
- after Phase E, ask which condition gives existence and which gives uniqueness.

Retrieval 3:
- after Phase G, ask when dot products recover coordinates.

Retrieval 4:
- during transfer, ask what metadata must accompany robot coordinates.

Retrieval 5:
- at the end, reconstruct the vector and explain what the residual means.

## Step 5 — Essential questions and mastery narrative

### Essential questions
Q1. What vectors can be built from a chosen set of directions?
Q2. When does a direction add genuinely new linear freedom?
Q3. Why does a basis provide exactly one coordinate vector?
Q4. What is the difference between an abstract vector and its coordinates?
Q5. Why does basis order matter?
Q6. When may coordinates be recovered by dot products?
Q7. What does a reconstruction residual reveal, and what does it not prove?
Q8. How can basis choice simplify or destabilize an engineering problem?
Q9. Why are a feature set, a mathematical basis and an overcomplete dictionary not interchangeable terms?
Q10. What information must accompany coordinates before they are safe to use in robotics or data pipelines?

### Mastery narrative
A learner has mastered §1.4 only when they can complete the following chain without hidden assumptions:

1. Name the vector space or engineering quantity being represented.
2. State the ordered generating family and its units/frame semantics.
3. Determine what its span can represent.
4. Check whether the family is independent enough for unique coordinates.
5. Decide whether it is a basis of the stated space or only a generating family/dictionary.
6. Compute `[v]_B` using a method valid for that basis.
7. Reconstruct `v` and inspect the residual.
8. Explain how coordinates change under a different basis while the underlying vector remains fixed.
9. Identify numerical sensitivity or contract violations.
10. Justify why the chosen representation is appropriate for the downstream task.

### Minimum mastery evidence
The later core assessment must contain:
- one exact linear-combination calculation;
- one span-membership decision;
- one missing-direction diagnosis;
- one redundant-family diagnosis with non-unique coefficients;
- one non-standard basis-coordinate calculation;
- one orthonormal shortcut check;
- one ordered-basis swap question;
- one two-frame robotics interpretation;
- one basis-versus-dictionary-versus-feature-set classification;
- one representation-design task.

### Mastery threshold policy
- arithmetic correctness alone cannot pass;
- every coordinate answer must name the basis and verify reconstruction;
- every engineering answer must name units and frame/representation version;
- a learner who uses dot products on a non-orthonormal basis has not mastered the lesson even if a special example accidentally gives the correct number;
- a learner who calls a redundant family a basis has not mastered uniqueness;
- transfer mastery requires explaining both a benefit and a risk of the selected basis.

## Pass-03 quality gate
PASS because:
- the thesis unifies span, independence, basis, coordinates and representation change;
- ten measurable outcomes have explicit observable evidence;
- the learning sequence creates a need for each definition before presenting it;
- misconceptions are intercepted at planned points rather than collected only at the end;
- cognitive load is controlled through stable examples, staged notation and retrieval checkpoints;
- mastery requires calculation, reconstruction, interpretation, condition checking and engineering transfer;
- no complete lesson core was drafted before the pedagogical spine was accepted;
- no manifest, UI/runtime or presentation file was modified;
- no browser smoke test is claimed because this is an academic-planning pass.

## Next task
PASS 04/14 — Core academic content for §1.4, consisting of 6 steps:
1. define all notation and semantic contracts;
2. write core concepts;
3. write main mechanisms;
4. write main formulas with conditions and failure modes;
5. write comparison logic and assumption gates;
6. write bridges to later lessons and provisional downstream mapping.

PASS 04 may create the first complete draft of:
`subjects/math/data/theory_core/theory_core_c01_l04.json`

The draft must remain `core_draft` or `math_review_required`; it must not be registered as approved before passes 5–9.

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

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
