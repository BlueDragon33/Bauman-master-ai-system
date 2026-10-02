# AM02 — ACADEMIC BLUEPRINT & CANONICAL ANALYTICAL MODEL
## System abstraction · Variables · Equations · Assumptions · Conditions · Validation

Mode:

`MODEL-FIRST · ASSUMPTION-EXPLICIT · UNIT-AWARE · CANONICAL-OWNER`

---

# 0. ENTRY

Requires AM01 evidence.

---

# 1. MISSION

Define one canonical ontology for analytical models of automated information-processing/control systems.

All lessons, solvers, simulations, graders, AI and authoring must consume this model.

---

# 2. OUTCOME FAMILIES

Learner should be able to:

- abstract a target system;
- choose a boundary;
- identify variables;
- classify inputs/outputs/states/parameters/disturbances;
- state assumptions;
- select an appropriate model class;
- formulate equations/relations;
- specify conditions;
- solve/analyze;
- verify mathematics;
- validate model adequacy;
- analyze sensitivity;
- explain limitations;
- compare equivalent/alternative models.

---

# 3. CANONICAL ENTITIES

At minimum:

`SystemConcept`

`SystemBoundary`

`Variable`

`Input`

`Output`

`State`

`Parameter`

`Disturbance`

`Observation`

`Assumption`

`UnitDimension`

`Model`

`ModelClass`

`Equation`

`Constraint`

`InitialCondition`

`BoundaryCondition`

`ParameterSet`

`InputScenario`

`SolverConfiguration`

`SimulationRun`

`VerificationCase`

`ValidationCase`

`SensitivityStudy`

`UncertaintyModel`

`ModelClaim`

`Misconception`

`Remediation`.

---

# 4. SYSTEM IDENTITY

Stable semantic ID independent of one diagram or code implementation.

---

# 5. MODEL IDENTITY

Model revision separate from system identity.

A target system may have multiple valid models for different purposes.

---

# 6. PURPOSE

Every model should state intended use.

A model valid for one operating regime may be invalid for another.

---

# 7. BOUNDARY

Explicit inclusions/exclusions.

---

# 8. VARIABLE ROLE

Do not silently use one variable as both state and parameter.

---

# 9. UNITS / DIMENSIONS

Where physical/quantitative units apply:

store unit/dimension metadata.

Dimensionless variables explicit.

---

# 10. ASSUMPTIONS

First-class structured data.

Examples only when actual model uses them:

- linear;
- small-signal;
- constant parameter;
- no delay;
- independent noise.

---

# 11. MODEL CLASS

Canonical dimensions can include:

- static/dynamic;
- deterministic/stochastic;
- continuous/discrete;
- linear/nonlinear;
- time-invariant/time-varying.

Use only applicable dimensions.

---

# 12. EQUATION MODEL

Equation references canonical variables/parameters.

Do not bury variable meaning in LaTeX only.

---

# 13. ALGEBRAIC MODEL

If in scope:

equations/constraints.

---

# 14. DIFFERENTIAL MODEL

If in scope:

state derivatives + conditions.

Math owns general ODE theory.

---

# 15. DIFFERENCE MODEL

If in scope:

discrete-time state/update equations.

---

# 16. STATE-SPACE MODEL

If AM01 supports it:

state vector, input/output vectors, matrices/functions, dimensions.

---

# 17. INPUT-OUTPUT / TRANSFER MODEL

If supported:

define assumptions and input/output pair.

Do not assume zero initial conditions silently.

---

# 18. STOCHASTIC MODEL

If supported:

probability structure + assumptions + parameters.

Reliability-specific semantics remain with Reliability owner.

---

# 19. CONSTRAINT MODEL

Algebraic/state/input constraints explicit.

---

# 20. INITIAL CONDITIONS

Part of the problem definition, not optional metadata.

---

# 21. BOUNDARY CONDITIONS

First-class where relevant.

---

# 22. PARAMETER SET

Versioned/scenario-specific.

---

# 23. INPUT SCENARIO

Input function/signal/event description separate from model structure.

---

# 24. SOLVER CONFIG

Method/tolerance/step/horizon is execution metadata, not canonical model truth.

---

# 25. ANALYTICAL VS NUMERICAL

Separate:

- mathematical model;
- solution method;
- numerical approximation.

---

# 26. VERIFICATION

Question:

“Did we solve/implement the model correctly?”

---

# 27. VALIDATION

Question:

“Is this model adequate for intended use/system evidence?”

---

# 28. CALIBRATION

If in scope:

parameter fitting does not equal independent validation.

---

# 29. SENSITIVITY

Define output/quantity of interest and parameter perturbation.

---

# 30. UNCERTAINTY

If in scope:

separate parameter uncertainty, input uncertainty, stochastic variation, numerical error.

---

# 31. LINEARIZATION

If in scope:

operating point + validity neighborhood + approximation.

---

# 32. DISCRETIZATION

If continuous model is discretized:

step/method are model-execution transformation metadata.

---

# 33. MODEL EQUIVALENCE

Support:

- algebraically equivalent forms;
- coordinate/state transformations;
- input-output equivalent models within stated assumptions.

Do not exact-string compare.

---

# 34. MODEL REDUCTION

Only if actual course scope supports.

Record approximation/validity loss.

---

# 35. DIMENSIONAL CHECK

Canonical validation rule.

---

# 36. PHYSICAL / LOGICAL PLAUSIBILITY

Where domain constraints exist:

negative populations/probabilities outside [0,1]/impossible rates etc can be flagged.

Do not invent domain constraints.

---

# 37. PROVENANCE

Equations, parameter values, assumptions and datasets have provenance/review status.

---

# 38. ADJACENT MATH BOUNDARY

Reference math concepts; do not duplicate entire math curriculum.

---

# 39. ADJACENT ML BOUNDARY

Analytical model ≠ learned predictive model.

Hybrid/data-driven modeling only if actual scope.

---

# 40. ADJACENT RELIABILITY BOUNDARY

Failure-rate/reliability domain belongs downstream Reliability unless this course explicitly uses it as example.

---

# 41. DELIVERABLES

Create:

`subjects/analytical-models/docs/am02/AM_ACADEMIC_BLUEPRINT.md`

`AM_COMPETENCY_GRAPH.json`

`AM_PREREQUISITE_GRAPH.json`

`AM_CANONICAL_ENTITY_SCHEMA.json`

`AM_SYSTEM_BOUNDARY_VARIABLE_CONTRACT.md`

`AM_MODEL_CLASS_CONTRACT.md`

`AM_EQUATION_CONDITION_CONTRACT.md`

`AM_UNIT_DIMENSION_CONTRACT.md`

`AM_VERIFICATION_VALIDATION_CONTRACT.md`

`AM_SENSITIVITY_UNCERTAINTY_CONTRACT.md`

`AM03_INPUT_CONTRACT.md`.

---

# 42. PASS

PASS when one canonical model can represent the actual AM01 scope without solver/UI duplication and with explicit assumptions/conditions/units.

---

# 43. FINAL PRINCIPLE

**A MODEL IS MORE THAN AN EQUATION: IT IS EQUATIONS + VARIABLES + ASSUMPTIONS + CONDITIONS + PURPOSE.**
