# REL04 — CALCULATION · SIMULATION · VISUALIZATION · AI RELIABILITY INTELLIGENCE

Mode:

`REUSE-MATH-PYTHON · CANONICAL-MODEL-DRIVEN · STATISTICALLY-TRANSPARENT · AI-BOUNDED`

# ENTRY

Requires REL02/REL03.

# CAPABILITIES

Possible:
- `rel.calculate.measure`
- `rel.distribution.evaluate`
- `rel.rbd.evaluate`
- `rel.faulttree.evaluate`
- `rel.state.simulate`
- `rel.availability.simulate`
- `rel.montecarlo.run`
- `rel.parameter.estimate`
- `rel.sensitivity.run`
- `rel.visual.curve`
- `rel.visual.structure`
- `rel.ai.tutor`

Only implement actual scope.

# MATH PROVIDER

Reuse Math probability/statistics/symbolic capabilities.

# PYTHON PROVIDER

Reuse Python/NumPy/SciPy runtime where appropriate.

# CALCULATION INPUT

Bind:
- reliability model revision;
- mission time;
- parameters;
- assumptions;
- repairability;
- scenario.

# RELIABILITY CURVE

Axes and definition explicit.

# HAZARD PLOT

Label hazard/intensity units correctly.

# AVAILABILITY CURVE

Distinguish from R(t).

# DISTRIBUTION VIEW

Show parameters and support.

# RBD VISUALIZER

Graphical structure consumes canonical reliability structure.

# FAULT TREE VISUALIZER

Logic gates/events consume canonical fault-tree data.

# STATE DIAGRAM

States/transitions/rates/probabilities explicit.

# CALCULATOR SAFETY

Probability outputs validated to domain.

# MONTE CARLO

Record:
- seed;
- sample count;
- estimator;
- confidence/standard error where relevant.

# MONTE CARLO LIMIT

Simulation estimate does not override analytical truth without context.

# PARAMETER ESTIMATION

Record:
- dataset;
- censoring;
- model family;
- estimator;
- uncertainty.

# SENSITIVITY

Record varied parameter/component and resulting measure.

# STALE RUN

If model/parameters change, old results cannot overwrite current.

# AI MODES

`FAILURE_DEFINITION_COACH`
`MEASURE_COACH`
`DISTRIBUTION_COACH`
`RBD_COACH`
`FAULT_TREE_COACH`
`STATE_MODEL_COACH`
`AVAILABILITY_COACH`
`DATA_ESTIMATION_COACH`
`SENSITIVITY_COACH`.

# AI GROUNDING

Canonical model + task + learner attempt + actual calculations + allowed hints.

# AI DATA SAFETY

AI must not fabricate failure/repair data.

# AI ASSUMPTION SAFETY

Must surface independence/distribution/repair assumptions.

# AI OFFICIAL GRADING

Forbidden by default.

# SECURITY

No unrestricted filesystem/network/secrets from learner runtime.

# RESOURCE LIMITS

Bound Monte Carlo/sample size/state space/plot size.

# OFFLINE

Canonical theory/precomputed/local computation where supported.

# OBSERVABILITY

Track:
calculation error,
simulation failure,
invalid probability,
nonconvergence,
stale result,
AI failure.

# DELIVERABLES

Create:
- `REL_CALCULATION_PROVIDER_CONTRACT.md`
- `REL_RBD_FAULTTREE_PROVIDER_CONTRACT.md`
- `REL_STATE_AVAILABILITY_SIMULATION_CONTRACT.md`
- `REL_MONTE_CARLO_CONTRACT.md`
- `REL_PARAMETER_ESTIMATION_CONTRACT.md`
- `REL_VISUALIZATION_CONTRACT.md`
- `REL_AI_TUTOR_CONTRACT.md`
- `REL_SECURITY_RESOURCE_BOUNDARY.md`
- `REL05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum where supported:
- series system;
- parallel system;
- repairable two-state system;
- invalid independence case;
- exponential constant-hazard case;
- non-exponential contrast;
- Monte Carlo vs analytical reference;
- probability-bound validation.

# PASS

PASS when all calculators/simulators/visualizers consume canonical reliability models and expose assumptions/context.

# FINAL PRINCIPLE

**CALCULATORS COMPUTE THE RELIABILITY MODEL; THEY DO NOT DEFINE THE FAILURE PHYSICS OR ASSUMPTIONS.**
