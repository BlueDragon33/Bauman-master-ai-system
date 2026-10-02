# REL06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`PROBABILITY-REGRESSION · ASSUMPTION-RED-TEAMED · NO-KNOWN-BLOCKER`

# MISSION

Prove Reliability Models is academically correct, numerically safe, assumption-transparent, accessible and exact-RC ready.

# GATES

A canonical reliability truth
B reasoning/assessment
C calculation/simulation
D visualization/AI
E UX/a11y/offline/performance/security
F legacy/RC.

# PROBABILITY BOUNDS

Known invalid outputs:
R(t)<0,
R(t)>1,
availability outside [0,1].

Must fail.

# INITIAL / LIMIT BEHAVIOR

Where model semantics require:
R(0) and limiting behavior checked.

Do not impose beyond model definition.

# MONOTONICITY

For non-repairable survival reliability models, R(t) should not increase.
Do not apply blindly to availability.

# SERIES/PARALLEL

Edge cases:
- perfect component;
- failed component;
- identical components;
- independent assumption;
- zero/one values.

# DEPENDENCE

Known dependent-failure fixture must reject naive multiplication if model says dependence matters.

# REPAIRABILITY

Repairable vs non-repairable formula misuse must fail.

# RELIABILITY / AVAILABILITY

Known confusion fixture required.

# MTBF / MTTF / MTTR

Known misuse fixtures required.

# HAZARD

Hazard-as-probability misconception must fail.

# DISTRIBUTION

Test:
- valid parameter domain;
- exponential constant-hazard assumption;
- Weibull parameter edge cases if in scope;
- unsupported distribution mismatch.

# RBD

Structure and canonical calculation agree.

# FAULT TREE

If in scope:
AND/OR logic, cut sets, dependence assumptions.

# STATE / MARKOV

If in scope:
- transition dimensions;
- row/probability/rate validity as appropriate;
- failure/repair states;
- steady/time-dependent measure semantics.

# K-OUT-OF-N

If in scope:
combinatorial edge cases.

# DATA / ESTIMATION

If in scope:
- complete vs censored;
- estimator;
- parameter validity;
- confidence/uncertainty.

# MONTE CARLO

If in scope:
- deterministic seed fixture;
- sample-size convergence trend;
- analytical reference where available;
- uncertainty reporting.

# SENSITIVITY

Known parameter/component ranking fixture where supported.

# MULTIPLE VALID MODELS

Known equivalent/alternative valid models pass under task contract.

# KNOWN INVALID MODEL LIBRARY

At minimum:
- undefined failure event;
- wrong mission time;
- reliability/availability confusion;
- MTBF guarantee claim;
- hidden independence;
- wrong series/parallel;
- invalid probability;
- unsupported exponential assumption;
- wrong repair model;
- calibration/data overclaim if applicable.

# TEST-OF-TESTS

Invalid models fail.
Valid alternatives pass.

# AI ACCEPTANCE

AI must:
- ask/identify failure criterion;
- distinguish reliability/availability;
- surface assumptions;
- avoid invented failure rates;
- avoid MTBF lifetime guarantee;
- not reveal hidden answers;
- not write official mastery.

# RUNTIME SECURITY

Math/Python shared sandbox boundaries hold.

# OFFLINE

Actual supported matrix tested.

# PERFORMANCE

Measure:
subject startup,
calculation,
RBD/FTA render,
state simulation,
Monte Carlo,
plots,
authoring.

# MEMORY

Repeated simulations/plots do not leak unbounded memory.

# RESPONSIVE / A11Y

Formulas, diagrams, curves, state views usable on mobile/tablet/desktop and with accessible alternatives.

# AUTHORING ACCEPTANCE

Author creates:
- mission/failure;
- reliability model;
- structure;
- distribution;
- simulation;
- assessment

without app-code edits for ordinary cases.

# LEGACY

Resolve duplicate:
- reliability calculator;
- RBD engine;
- fault-tree engine;
- Markov simulator;
- parameter estimator;
- plot state;
- old routes/flags.

# ADJACENT OWNER GATE

No copied generic Math/Analytical-Model truth becomes competing owner.

# MIGRATION

If canonical IDs/schema changed:
aliases,
content migration,
learner evidence preservation,
rollback.

# RC FREEZE

Freeze:
SHA,
content snapshot,
subject pack,
Math/Python provider versions,
reliability fixtures,
config,
lockfile.

# PRODUCTION SMOKE PROFILE

1. open Reliability subject;
2. open one canonical reliability lesson;
3. inspect failure/mission assumptions;
4. run one deterministic reliability calculation;
5. open one structure/state view;
6. verify one curve/measure;
7. verify active subject pack/model revision;
8. verify Math/Python provider profile;
9. verify optional AI grounded/fallback;
10. offline cached lesson/precomputed example if supported.

# BLOCKERS

- systematic reliability/availability confusion;
- invalid probability accepted;
- known wrong structure/model passes;
- hidden independence assumption;
- AI fabricates reliability data;
- calculator/visualizer disagrees with canonical model;
- duplicate canonical owner;
- migration corrupts learner evidence.

# DELIVERABLES

Create:
- `REL_ACCEPTANCE_MATRIX.md`
- `REL_MEASURE_REGRESSION.json`
- `REL_STRUCTURE_STATE_REGRESSION.json`
- `REL_DISTRIBUTION_DATA_ACCEPTANCE.md`
- `REL_MONTE_CARLO_ACCEPTANCE.md`
- `REL_AI_ACCEPTANCE_REPORT.md`
- `REL_ACCESSIBILITY_RESPONSIVE_REPORT.md`
- `REL_OFFLINE_PERFORMANCE_REPORT.md`
- `REL_SECURITY_REPORT.md`
- `REL_LEGACY_CLOSURE_REPORT.md`
- `REL_RC_MANIFEST.json`
- `REL_PRODUCTION_SMOKE_PROFILE.md`
- `REL06_EVIDENCE_INDEX.md`

# PASS

PASS only when failure definition, canonical model, calculation, simulation, visualization and AI agree; probability/assumption gates pass; exact RC exists.

# FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST PROVE THAT EVERY RELIABILITY NUMBER IS TRACEABLE TO A DEFINED FAILURE MODEL, ASSUMPTIONS AND EVIDENCE.**
