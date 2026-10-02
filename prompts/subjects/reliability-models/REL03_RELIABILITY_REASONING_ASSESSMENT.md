# REL03 — RELIABILITY REASONING · STRUCTURE · DATA · ASSESSMENT

Mode:

`MODEL-SELECTION-AWARE · ASSUMPTION-AWARE · MULTIPLE-VALID-SOLUTION-AWARE`

# ENTRY

Requires REL02.

# REASONING LOOP

Mission/function
→ failure criterion
→ repairability
→ system boundary
→ model family
→ assumptions
→ parameters/data
→ calculation
→ probability/unit checks
→ validation
→ sensitivity
→ interpretation.

# ASSESSMENT DIMENSIONS

Separate:
- mission/failure definition;
- model selection;
- assumptions;
- structure;
- formula/model;
- units;
- calculation;
- repair/availability reasoning;
- data/statistical reasoning;
- validation;
- interpretation.

# FAILURE-EVENT TASK

Learner must define what failure means before computing.

# RELIABILITY VS AVAILABILITY

Known misconception fixture required.

# MTBF / MTTF / MTTR

Known confusion fixtures required.

# HAZARD

Do not accept hazard as direct probability.

# DISTRIBUTION SELECTION

Learner justifies model from assumptions/data/context where task targets this.

# EXPONENTIAL MISUSE

Known fixture:
nonconstant hazard but learner blindly applies exponential.

# SERIES / PARALLEL

Assess:
- structure;
- independence;
- mission time;
- component reliability.

# DEPENDENCE

If dependence exists, naive multiplication is invalid.

# REDUNDANCY

Assess benefit and hidden assumptions:
- switching;
- coverage;
- common cause;
- repair policy;
- standby behavior.

# K-OUT-OF-N

If in scope:
combinatorics + assumptions.

# FAULT TREE

If in scope:
logical expression, cut sets, probabilities under justified assumptions.

# MARKOV / STATE MODEL

If in scope:
state definitions, transitions, rates/probabilities, availability/reliability measure.

# REPAIRABLE SYSTEM

Distinguish:
- failure occurrence;
- restoration;
- uptime/downtime;
- steady-state/time-dependent availability where applicable.

# DATA TASK

If in scope:
- censored data;
- estimate parameter;
- confidence interval;
- model fit.

# MONTE CARLO

Learner reasons:
sample size, seed, estimator, uncertainty.

# SENSITIVITY

Identify which component/parameter drives system result.

# DESIGN COMPARISON

Different reliability designs may satisfy requirements.

Grade:
- reliability gain;
- cost/complexity;
- dependence;
- repair;
- maintainability.

# ERROR TAXONOMY

`FAILURE_DEFINITION_ERROR`
`MISSION_TIME_ERROR`
`REPAIRABILITY_ERROR`
`RELIABILITY_AVAILABILITY_CONFUSION`
`MTBF_MTTF_MTTR_CONFUSION`
`HAZARD_PROBABILITY_CONFUSION`
`DISTRIBUTION_ASSUMPTION_ERROR`
`INDEPENDENCE_ERROR`
`REDUNDANCY_MODEL_ERROR`
`RBD_STRUCTURE_ERROR`
`FAULT_TREE_LOGIC_ERROR`
`MARKOV_STATE_ERROR`
`UNIT_ERROR`
`PROBABILITY_BOUND_ERROR`
`CENSORING_ERROR`
`ESTIMATION_ERROR`
`MONTE_CARLO_ERROR`
`VALIDATION_OVERCLAIM`.

# PARTIAL CREDIT

Separate conceptual model from arithmetic.

# HINT LADDER

H1 define failure
H2 identify repairability
H3 identify structure/model family
H4 expose independence/distribution assumption
H5 identify correct measure
H6 suggest formula/state model
H7 validate probability/units
H8 full solution only when allowed.

# MULTIPLE VALID MODELS

Accept alternative reliability formulations when assumptions and task contract permit.

# TEST-OF-TESTS

Known invalid solutions must fail:
- availability used as reliability;
- MTBF as guaranteed life;
- multiply dependent component reliabilities;
- wrong series/parallel;
- invalid probability >1;
- Markov probabilities/rates inconsistent;
- exponential assumption unsupported;
- censored failures treated as complete failures.

# AI BOUNDARY

AI may coach.
It cannot invent field failure rates or official reliability evidence.

# DELIVERABLES

Create:
- `REL_REASONING_CONTRACT.md`
- `REL_ASSESSMENT_RUBRIC_CONTRACT.md`
- `REL_STRUCTURE_ASSESSMENT_CONTRACT.md`
- `REL_STATE_FAULT_TREE_ASSESSMENT_CONTRACT.md`
- `REL_DATA_ESTIMATION_ASSESSMENT_CONTRACT.md`
- `REL_ERROR_TAXONOMY.json`
- `REL_GOLDEN_VALID_MODELS.json`
- `REL_GOLDEN_INVALID_MODELS.json`
- `REL04_INPUT_CONTRACT.md`

# PASS

PASS when grader can distinguish a numerically correct but conceptually invalid reliability model from a valid model with arithmetic error, and accepts valid alternatives.

# FINAL PRINCIPLE

**GRADE THE FAILURE MODEL AND ASSUMPTIONS SEPARATELY FROM THE NUMERICAL CALCULATION.**
