# REL01 — FORENSIC BASELINE
## Audit current Reliability Models subject before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION

Map actual reliability content, models, formulas, data, simulations and assessments.

# DISCOVERY

Search for:
- reliability;
- failure;
- repair;
- availability;
- maintainability;
- MTBF/MTTF/MTTR;
- hazard/failure rate;
- Weibull/exponential/other lifetime distributions;
- RBD;
- fault tree;
- Markov reliability;
- redundancy;
- k-out-of-n;
- common-cause/dependent failures;
- Monte Carlo;
- reliability testing;
- censored data;
- parameter estimation;
- sensitivity/criticality.

Do not assume all topics are in scope.

# CONTENT INVENTORY

For each item:
- concept;
- source;
- formula/model;
- assumptions;
- units;
- examples;
- assessment links.

# MEASURE AUDIT

Find actual use of:
- R(t);
- F(t);
- f(t);
- hazard/intensity;
- MTTF;
- MTBF;
- MTTR;
- availability.

Check definitions/notation consistency.

# FAILURE-EVENT AUDIT

Determine whether examples define:
- what counts as failure;
- mission/function;
- time horizon;
- operating conditions.

# REPAIRABILITY AUDIT

Classify models as:
- non-repairable;
- repairable;
- maintained/restored;
- unknown.

# DISTRIBUTION AUDIT

Inventory lifetime/repair distributions actually used.

Flag unjustified exponential assumptions.

# STRUCTURAL RELIABILITY AUDIT

If present:
- series;
- parallel;
- redundancy;
- k-out-of-n;
- RBD.

# FAULT-TREE AUDIT

If present:
- AND/OR;
- basic/intermediate/top event;
- minimal cut sets;
- dependence assumptions.

# STATE/MARKOV AUDIT

If present:
- states;
- transition rates/probabilities;
- absorbing/repair states;
- normalization.

# AVAILABILITY AUDIT

Check steady-state vs time-dependent claims where relevant.

# MAINTAINABILITY AUDIT

If present, map repair-time measures/models.

# DATA AUDIT

Find:
- life-test data;
- field failure data;
- censoring;
- synthetic data;
- parameter estimates;
- provenance.

# STATISTICAL AUDIT

Find:
- estimators;
- confidence intervals;
- goodness-of-fit;
- uncertainty.

# SIMULATION AUDIT

Map:
- Monte Carlo;
- seeds;
- sample count;
- confidence/error estimates;
- state simulation.

# SENSITIVITY / CRITICALITY AUDIT

Find component importance / sensitivity measures if present.

# ASSESSMENT AUDIT

Classify:
- formula;
- concept;
- structural reliability;
- distribution selection;
- fault tree;
- Markov;
- data estimation;
- interpretation;
- design trade-off.

# GRADER AUDIT

Check handling of:
- equivalent formulas;
- probability tolerance;
- units;
- multiple valid reliability models;
- assumption-dependent answers.

# AI AUDIT

Check whether AI:
- invents failure rates;
- treats MTBF as lifetime guarantee;
- confuses availability/reliability;
- writes mastery;
- exposes hidden solutions.

# RUNTIME AUDIT

Map Math/Python providers and duplicate reliability engines.

# ADJACENT-OWNER AUDIT

Map overlap with:
- Math;
- Analytical Models;
- OOPSE/testing;
- future lifecycle/safety/security.

# LEGACY / DUPLICATE OWNER

Classify:
KEEP / MIGRATE / RETIRE / UNKNOWN.

# RISK REGISTER

At minimum:
- hidden independence;
- wrong exponential assumption;
- availability/reliability confusion;
- repairability confusion;
- unit mismatch;
- invalid probability;
- duplicate engine;
- AI overclaim;
- unproven field data.

# DELIVERABLES

Create:
- `REL01_EXECUTIVE_SUMMARY.md`
- `REL01_REPOSITORY_MAP.md`
- `REL01_CONTENT_MODEL_INVENTORY.json`
- `REL01_MEASURE_DISTRIBUTION_AUDIT.md`
- `REL01_STRUCTURE_STATE_MODEL_AUDIT.md`
- `REL01_DATA_STATISTICAL_AUDIT.md`
- `REL01_ASSESSMENT_GRADER_AUDIT.md`
- `REL01_DUPLICATE_OWNER_MAP.md`
- `REL01_RISK_REGISTER.json`
- `REL02_INPUT_CONTRACT.md`

# PASS

PASS only when actual reliability scope, models, measures, data, runtime and grading are known.

# FINAL PRINCIPLE

**AUDIT THE FAILURE MODEL BEFORE IMPROVING THE FORMULAS.**
