# REL02 — ACADEMIC BLUEPRINT & CANONICAL RELIABILITY MODEL

Mode:

`FAILURE-DEFINITION-FIRST · ASSUMPTION-EXPLICIT · PROBABILITY-SAFE · CANONICAL-OWNER`

# ENTRY

Requires REL01.

# MISSION

Define one canonical reliability ontology for ASOIU reliability learning.

# OUTCOMES

Learner can:
- define mission/failure;
- identify repairability;
- choose reliability model;
- state assumptions;
- calculate/interpret measures;
- model structures/redundancy;
- reason about repair/availability;
- choose/interpret lifetime distributions;
- analyze state/fault models where in scope;
- estimate parameters/data uncertainty where in scope;
- compare designs;
- communicate limitations.

# CANONICAL ENTITIES

`ReliabilitySystem`
`MissionProfile`
`RequiredFunction`
`FailureEvent`
`FailureMode`
`Component`
`RepairAction`
`ReliabilityMeasure`
`AvailabilityMeasure`
`MaintainabilityMeasure`
`LifetimeDistribution`
`RepairDistribution`
`ParameterSet`
`ReliabilityStructure`
`RBD`
`FaultTree`
`FaultTreeGate`
`StateReliabilityModel`
`Transition`
`RedundancyScheme`
`DependenceAssumption`
`ReliabilityDataset`
`CensoringScheme`
`Estimator`
`ConfidenceStatement`
`SimulationRun`
`SensitivityStudy`
`ReliabilityClaim`
`Misconception`
`Remediation`.

# FAILURE DEFINITION

Each reliability claim binds to:
- function;
- failure criterion;
- operating context;
- mission time/horizon where needed.

# RELIABILITY FUNCTION

If in scope:
R(t) semantics explicit.

# FAILURE DISTRIBUTION

If in scope:
F(t) = failure-time CDF semantics.

# DENSITY

If continuous lifetime model:
f(t) semantics.

# HAZARD / FAILURE RATE

Hazard is conditional rate/intensity, not probability.

# MTTF

Non-repairable/first-failure mean-time context explicit.

# MTBF

Repairable-system/inter-failure context explicit.

Do not use as guaranteed lifetime.

# MTTR

Repair/restoration-time context explicit.

# AVAILABILITY

Availability is probability/fraction of readiness under repair/operation model.

Not reliability.

# MAINTAINABILITY

If in scope:
repair-time distribution/probability of restoration within time.

# REPAIRABLE VS NON-REPAIRABLE

First-class distinction.

# EXPONENTIAL MODEL

If used:
constant hazard assumption explicit.

# WEIBULL MODEL

If used:
shape/scale and hazard interpretation explicit.

# OTHER DISTRIBUTIONS

Only evidence-supported.

# SERIES STRUCTURE

Independence assumptions explicit when product formula used.

# PARALLEL STRUCTURE

Same.

# K-OUT-OF-N

If in scope:
identical/nonidentical assumptions explicit.

# RBD

RBD is functional reliability representation, not generic physical topology.

# FAULT TREE

If in scope:
top/basic events, gates, dependence assumptions.

# MINIMAL CUT SET

If in scope:
logical significance explicit.

# STATE / MARKOV MODEL

If in scope:
states, transitions, failure/repair rates, assumptions.

# CTMC / DTMC

Math owns generic Markov theory.
REL owns reliability interpretation.

# COMMON-CAUSE / DEPENDENCE

Only if scope.
Never silently treat dependent failures as independent.

# REDUNDANCY

Active/passive/cold/warm standby only if actual course supports.

# COVERAGE / SWITCHING

If standby models use them, model explicitly.

# DATASET

Reliability data tracks:
- unit/system;
- start/end/censor;
- event type;
- context;
- provenance.

# CENSORING

If in scope:
right/left/interval distinctions as needed.

# PARAMETER ESTIMATION

Estimator bound to:
- distribution/model;
- data;
- censoring;
- assumptions.

# CONFIDENCE / UNCERTAINTY

Separate parameter uncertainty from stochastic lifetime variation.

# MODEL VALIDATION

Fit to data does not prove universal future validity.

# SENSITIVITY

Component/parameter sensitivity linked to system measure.

# CRITICALITY / IMPORTANCE

Only if scope:
define chosen measure and interpretation.

# PROVENANCE

Failure rates, repair rates, parameters and field data must have provenance.

# ADJACENT MATH BOUNDARY

Reference probability/statistics; do not duplicate foundational math.

# ANALYTICAL MODELS BOUNDARY

Reference state/system model machinery; REL owns failure/repair semantics.

# DELIVERABLES

Create:
- `REL_ACADEMIC_BLUEPRINT.md`
- `REL_COMPETENCY_GRAPH.json`
- `REL_PREREQUISITE_GRAPH.json`
- `REL_CANONICAL_ENTITY_SCHEMA.json`
- `REL_FAILURE_MISSION_CONTRACT.md`
- `REL_MEASURE_CONTRACT.md`
- `REL_DISTRIBUTION_PARAMETER_CONTRACT.md`
- `REL_STRUCTURE_REDUNDANCY_CONTRACT.md`
- `REL_FAULT_TREE_STATE_MODEL_CONTRACT.md`
- `REL_DATA_UNCERTAINTY_CONTRACT.md`
- `REL03_INPUT_CONTRACT.md`

# PASS

PASS when one canonical ontology can support actual reliability content, formulas, simulations, assessments and AI without duplicate truth.

# FINAL PRINCIPLE

**RELIABILITY IS A PROPERTY OF A DEFINED FUNCTION UNDER A DEFINED MISSION AND MODEL — NOT A FREE-FLOATING PERCENTAGE.**
