# §1.5 · Không gian con và biểu diễn dữ liệu

## Misconception and failure-mode map

Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`

Date: 2026-07-09

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

## Use contract

Every misconception item must be used by at least one downstream component:
- core explanation;
- worked example;
- retrieval check;
- professor Q&A;
- code audit;
- or engineering-case interpretation.

A misconception intercept must show:
1. the tempting wrong belief;
2. why it looks plausible;
3. the precise correction;
4. evidence that distinguishes correct from incorrect reasoning.

## Group A · Conceptual geometry

### M01 · Any line or plane is a linear subspace

Wrong belief:
`A straight geometric object is automatically a subspace.`

Why tempting:
Lines and planes are the standard visual examples.

Correction:
A linear subspace must contain the origin. A shifted line or plane is affine, not linear.

Diagnostic prompt:
`Does multiplying every point by zero keep the result in the set?`

Required evidence:
Classify one origin-passing plane and one shifted plane.

Links:
`LO1`, `F01`, `F02`

Severity:
critical

### M02 · A finite data cloud is itself a subspace

Wrong belief:
`The recorded samples form the subspace.`

Why tempting:
The samples visually outline a line or plane.

Correction:
A finite sample set is generally not closed under all linear combinations. It may be modelled by or lie near a subspace.

Diagnostic prompt:
`If two measured samples are in the dataset, is every real linear combination also a recorded sample?`

Required evidence:
Distinguish sample set, fitted subspace and affine model.

Links:
`LO1`, `F01`, `F02`

Severity:
critical

### M03 · Low-dimensional means low-information

Wrong belief:
`A two-dimensional model of four-channel data throws away half the important information.`

Why tempting:
Dimension is confused with percentage of useful information.

Correction:
Dimension counts independent directions, not semantic importance. A low-dimensional model can capture most structured variation while excluding noise or redundancy.

Diagnostic prompt:
`What criterion shows how much of the declared matrix energy is retained?`

Required evidence:
Interpret `rho_2` without equating it to prediction accuracy.

Links:
`LO5`, `LO8`, `F15`

Severity:
major

### M04 · A low residual proves exact subspace membership

Wrong belief:
`Small residual means the sample belongs exactly to the subspace.`

Why tempting:
Numerical tolerance is mistaken for exact equality.

Correction:
A small residual supports a near-subspace statement under a declared tolerance. Exact mathematical membership requires zero residual in the exact model.

Diagnostic prompt:
`Is the conclusion exact, approximate or numerical?`

Required evidence:
Use different symbols or wording for exact and approximate membership.

Links:
`LO1`, `LO4`, `F02`, `F11`

Severity:
major

### M05 · Same residual norm means same residual direction

Wrong belief:
`Two samples with equal scores deviate from the model in the same way.`

Why tempting:
The norm compresses a vector to one scalar.

Correction:
Equal norms can correspond to different residual directions and different sensor patterns.

Diagnostic prompt:
`What information is lost when r is reduced to ||r||?`

Required evidence:
Construct two orthogonal-complement residuals with equal norm.

Links:
`LO6`, `F16`

Severity:
major

## Group B · Algebra and projection

### M06 · Number of generators equals subspace dimension

Wrong belief:
`k columns always define a k-dimensional subspace.`

Why tempting:
Matrix shape is confused with rank.

Correction:
`dim(col(B)) = rank(B) <= k`. Redundant columns do not add independent directions.

Diagnostic prompt:
`Are the columns independent?`

Required evidence:
Give a three-column matrix with rank two.

Links:
`LO2`, `F03`, `F04`

Severity:
critical

### M07 · BB^T is always the orthogonal projector

Wrong belief:
`A basis matrix times its transpose projects onto its column space.`

Why tempting:
The formula is correct for orthonormal columns.

Correction:
Use `QQ^T` only when `Q^TQ=I`; otherwise use `B(B^TB)^(-1)B^T` for full-column-rank B.

Diagnostic prompt:
`What is B^TB?`

Required evidence:
Use the locked general basis and show that `BB^T != P_U`.

Links:
`LO3`, `F05`, `F07`, `F09`

Severity:
critical

### M08 · B^Ty gives coordinates for any basis

Wrong belief:
`Dot products with basis columns always produce the coordinates.`

Why tempting:
It works for orthonormal bases.

Correction:
For a general full-column-rank basis, coordinates for the orthogonal projection satisfy `B^TB c = B^Ty`.

Diagnostic prompt:
`Are the basis columns orthonormal?`

Required evidence:
Compare Q-coordinates `(0.6,-0.2)` with B-coordinates `(0.4,-0.2)` in the locked normal sample.

Links:
`LO3`, `F06`, `F08`

Severity:
critical

### M09 · Idempotence alone proves orthogonal projection

Wrong belief:
`P^2=P is enough to call P an orthogonal projector.`

Why tempting:
Idempotence is the defining property of a projector in a broad algebraic sense.

Correction:
In the real Euclidean setting, orthogonal projection also requires symmetry `P^T=P`.

Diagnostic prompt:
`Is the candidate projector symmetric?`

Required evidence:
Separate general/oblique projection from orthogonal projection.

Links:
`LO3`, `F10`

Severity:
major

### M10 · Projection coefficients are properties of the physical sample alone

Wrong belief:
`The coordinate vector z belongs intrinsically to x.`

Why tempting:
Coordinates are displayed as if they were direct sensor values.

Correction:
Coordinates depend on mean, basis, order, scaling and model version.

Diagnostic prompt:
`Relative to which mu and Q were these coordinates computed?`

Required evidence:
State the representation contract beside every coordinate vector.

Links:
`LO4`, `F02`, `F06`

Severity:
critical

## Group C · Centering, scaling and data contract

### M11 · Centering and normalization are the same operation

Wrong belief:
`Subtracting the mean normalizes the data.`

Why tempting:
Software pipelines often group preprocessing steps together.

Correction:
Centering subtracts a reference mean; feature scaling changes per-feature scale; vector normalization changes individual vector length.

Diagnostic prompt:
`Which quantity is being made zero or one?`

Required evidence:
Describe all three operations separately.

Links:
`LO4`, `LO7`, `F02`, `F11`

Severity:
critical

### M12 · Raw observations can be projected by the affine model without centering

Wrong belief:
`QQ^T x is the explained component of x for the model mu+U.`

Why tempting:
The projector formula contains no visible mean.

Correction:
Project `y=x-mu`; reconstruct raw space as `mu + QQ^T(x-mu)`.

Diagnostic prompt:
`Where did the affine offset go?`

Required evidence:
Compute the locked normal sample using both wrong and correct pipelines.

Links:
`LO4`, `F02`, `F07`, `F11`, `F16`

Severity:
critical

### M13 · Samples-as-rows and samples-as-columns are interchangeable without changes

Wrong belief:
`Transposing the data matrix does not change the interpretation.`

Why tempting:
The same numbers remain visible.

Correction:
Transpose swaps sample and feature spaces; SVD factor shapes and principal directions change roles.

Diagnostic prompt:
`Which axis indexes observations and which indexes channels?`

Required evidence:
State `X_c in R^(8 x 4)` with samples as rows for the locked case.

Links:
`LO5`, `LO7`, `LO8`, `F14`

Severity:
critical

### M14 · Channel order is cosmetic

Wrong belief:
`Reordering the four values is harmless because the dimension remains four.`

Why tempting:
Shape checks still pass.

Correction:
Feature order is part of the model. Reordering channels requires the same permutation of mu, Q and every model artifact.

Diagnostic prompt:
`Does each column still refer to the same sensor?`

Required evidence:
Show a shape-correct but semantically wrong permutation.

Links:
`LO6`, `LO7`, `F02`, `F16`

Severity:
critical

### M15 · Residual scores are comparable across scaling or model versions

Wrong belief:
`A score of 0.2 means the same under any preprocessing.`

Why tempting:
The result is a scalar with the same displayed unit.

Correction:
Scores are comparable only under the same channel order, scaling, mean, basis, norm and model version.

Diagnostic prompt:
`Were both samples scored by the same contract?`

Required evidence:
List the score-comparison prerequisites.

Links:
`LO6`, `F16`

Severity:
critical

## Group D · Numerical rank and SVD

### M16 · The locked noisy calibration matrix has exact rank two

Wrong belief:
`Because the physical model has two dominant modes, the matrix rank is exactly two.`

Why tempting:
Physical mode count is confused with exact algebraic rank.

Correction:
The locked `8 x 4` matrix has floating-point rank four. It has numerical rank two only under `tau=0.05`.

Diagnostic prompt:
`Which singular values are nonzero, and which exceed tau?`

Required evidence:
Report all four singular values and both rank statements.

Links:
`LO5`, `F13`, `F14`

Severity:
critical

### M17 · NumPy default matrix_rank must return the engineering rank

Wrong belief:
`The library automatically knows the physically meaningful number of modes.`

Why tempting:
The API returns one authoritative-looking integer.

Correction:
The default tolerance mainly addresses floating-point deficiency. Engineering uncertainty or task criteria may require a different declared tolerance.

Diagnostic prompt:
`What tolerance did the software use?`

Required evidence:
Compare default rank four with case-specific rank two under `tau=0.05`.

Links:
`LO5`, `LO7`, `F13`

Severity:
critical

### M18 · tau=0.05 is a universal rank threshold

Wrong belief:
`Any vibration matrix should use 0.05.`

Why tempting:
The case supplies a clean numeric value.

Correction:
The tolerance belongs only to the synthetic locked case and depends on units, scale, uncertainty and task.

Diagnostic prompt:
`What physical or numerical scale justifies tau?`

Required evidence:
Label `tau=0.05` as case-specific every time it appears.

Links:
`LO5`, `F13`

Severity:
critical

### M19 · Retaining 99.9541% energy guarantees model quality

Wrong belief:
`The two-mode representation is therefore correct for every downstream task.`

Why tempting:
The percentage is very close to 100.

Correction:
Retained singular-value energy measures reconstruction under the chosen preprocessing, not causality, fault coverage or prediction accuracy.

Diagnostic prompt:
`Which task metric has actually been tested?`

Required evidence:
Separate reconstruction evidence from downstream validation.

Links:
`LO5`, `LO6`, `LO8`, `F15`

Severity:
critical

### M20 · Explicit inverse is the preferred implementation

Wrong belief:
`Code should mirror (B^TB)^(-1) exactly with np.linalg.inv.`

Why tempting:
It looks closest to the written formula.

Correction:
Use solve, QR or least-squares routines when possible; explicit inverse is mainly a symbolic teaching form.

Diagnostic prompt:
`Can the system be solved without forming the inverse?`

Required evidence:
Audit one inverse-based snippet and replace it with a solve.

Links:
`LO7`, `F08`, `F09`

Severity:
major

## Group E · Engineering interpretation

### M21 · A large residual proves a bearing fault

Wrong belief:
`X_MISMATCH_01 is a bearing-fault sample.`

Why tempting:
The score exceeds the demonstration threshold.

Correction:
The sample is poorly represented by the current normal-operation model. Possible causes remain multiple and unclassified.

Diagnostic prompt:
`What additional evidence identifies the cause?`

Required evidence:
Use only `model mismatch` language for the locked sample.

Links:
`LO6`, `F16`

Severity:
safety-critical

### M22 · A small residual proves the machine and sensors are healthy

Wrong belief:
`X_NORMAL_01 has a low score, so everything is healthy.`

Why tempting:
The sample fits the normal model.

Correction:
A fault that lies inside the model subspace, affects unmeasured variables or is absorbed by preprocessing may still produce a small residual.

Diagnostic prompt:
`What faults could remain invisible to this score?`

Required evidence:
State that low residual means only good representation by the current model.

Links:
`LO6`, `F16`

Severity:
safety-critical

### M23 · The learned directions are automatically physical modes

Wrong belief:
`q1 and q2 are proven causal vibration modes.`

Why tempting:
Their patterns admit intuitive labels.

Correction:
They are locked teaching directions with engineering interpretations. Physical-mode identification requires domain validation.

Diagnostic prompt:
`Was modal physics independently validated?`

Required evidence:
Use `dominant model directions` unless physical validation is explicitly supplied.

Links:
`LO6`, `F02`, `F14`

Severity:
major

### M24 · One normal-operation subspace covers every operating regime

Wrong belief:
`The same mu, Q and threshold apply at all speeds and loads.`

Why tempting:
The model is compact and easy to deploy.

Correction:
Changing regime can move the mean, directions, scale and residual distribution. Models may need conditioning, segmentation or versioning.

Diagnostic prompt:
`Is the current sample from the regime used to build the model?`

Required evidence:
Check operating-regime metadata before scoring.

Links:
`LO6`, `F02`, `F16`

Severity:
safety-critical

### M25 · A four-feature vector is the raw vibration waveform

Wrong belief:
`x contains four instantaneous acceleration samples.`

Why tempting:
Both are arrays of sensor values.

Correction:
The locked observation contains four fixed-window RMS features, one per calibrated channel. It is not the raw time series.

Diagnostic prompt:
`What operation produced each component of x?`

Required evidence:
State window, feature meaning, units and channel order.

Links:
`LO6`, `LO7`, `F02`

Severity:
critical

## Required downstream coverage

### Core lesson must intercept
`M01`, `M02`, `M06`, `M07`, `M08`, `M11`, `M12`, `M16`, `M21`, `M22`

### Worked examples must expose
`M04`, `M05`, `M07`, `M08`, `M12`, `M14`, `M16`, `M18`

### Computational lab must test
`M13`, `M14`, `M17`, `M20`, `M25`

### Professor Q&A must probe
`M03`, `M09`, `M10`, `M15`, `M19`, `M21`, `M22`, `M23`, `M24`

### Slideshow retrieval checks must sample all five groups
- conceptual geometry;
- algebra/projection;
- data contract;
- numerical rank/SVD;
- engineering interpretation.

## Pass 6 decision

- Misconceptions M01–M25 are locked.
- Severity and evidence requirements are locked.
- The lesson architecture must cite these IDs explicitly.
- Runtime content remains unchanged.

## Next task

`THEORY_C01_L05_CORE_ARCHITECTURE_PASS_07`
