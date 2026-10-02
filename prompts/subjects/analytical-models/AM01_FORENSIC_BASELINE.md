# AM01 — FORENSIC BASELINE
## Audit the current Analytical Models subject before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

---

# 0. MISSION

Determine exactly what analytical-system-model content, tools, simulations, assessments and state already exist.

Do not assume the precise Bauman syllabus from the course title alone.

---

# 1. DISCOVERY

Search actual repository for:

- analytical models;
- ASOIU/system modeling;
- state-space;
- transfer/input-output models;
- differential/difference equations;
- block diagrams;
- simulations;
- SciPy/control/symbolic tools;
- stochastic models;
- Markov/queueing models;
- system identification;
- parameter estimation;
- control-design content;
- reliability models;
- assessments;
- visualizers.

Classify findings; do not add missing topics.

---

# 2. CONTENT INVENTORY

For each item record:

- concept/model family;
- lesson/unit;
- source;
- equation;
- variables;
- parameters;
- assumptions;
- units;
- examples;
- assessment links.

---

# 3. MODEL-FAMILY INVENTORY

Classify actual current models by dimensions such as:

- static/dynamic;
- deterministic/stochastic;
- continuous/discrete;
- linear/nonlinear;
- time-invariant/time-varying;
- algebraic/differential/difference/state-space/other.

Only classify if evidence exists.

---

# 4. SYSTEM-BOUNDARY AUDIT

Check whether examples explicitly define:

- modeled system;
- environment;
- inputs;
- outputs;
- internal states;
- disturbances;
- observations.

---

# 5. VARIABLE AUDIT

Find ambiguous variables/symbol reuse.

Record units/dimensions if present.

---

# 6. PARAMETER AUDIT

Record:

- fixed;
- estimated;
- scenario-controlled;
- uncertain;
- source/provenance.

---

# 7. ASSUMPTION AUDIT

Look for hidden assumptions:

- linearity;
- stationarity;
- ideal components;
- negligible delay/noise;
- constant parameters;
- independence.

---

# 8. INITIAL / BOUNDARY CONDITION AUDIT

Determine whether dynamic models specify them correctly.

---

# 9. DIMENSIONAL-CONSISTENCY AUDIT

Find examples/equations with explicit or missing units.

---

# 10. ANALYTICAL SOLUTION AUDIT

Map symbolic/closed-form methods actually present.

---

# 11. NUMERICAL SOLUTION AUDIT

Map:

- ODE solvers;
- difference-equation loops;
- linear algebra solvers;
- optimizers;
- integration methods.

Record provider/version.

---

# 12. SIMULATION AUDIT

Find:

- time step;
- solver;
- horizon;
- initial state;
- inputs;
- event handling;
- random seed.

---

# 13. VISUALIZATION AUDIT

Find:

- block diagrams;
- state plots;
- phase plots;
- input/output response;
- parameter sweep;
- sensitivity;
- validation plots.

---

# 14. STATE-SPACE AUDIT

If present, record:

- state vector;
- A/B/C/D matrices;
- dimensions;
- assumptions.

Do not assume it belongs if absent.

---

# 15. TRANSFER-FUNCTION AUDIT

If present, record:

- input/output pair;
- Laplace-domain assumptions;
- initial condition conventions;
- poles/zeros if taught.

---

# 16. STOCHASTIC MODEL AUDIT

If present, identify:

- random variables/processes;
- transition probabilities;
- Markov assumptions;
- queue assumptions.

Route reliability-specific content appropriately.

---

# 17. CONTROL-CONTENT AUDIT

Determine whether course currently includes:

- stability;
- controllability/observability;
- controller design;
- feedback synthesis.

Classify ownership rather than assume.

---

# 18. IDENTIFICATION / DATA-DRIVEN AUDIT

If present, distinguish:

- analytical parameter estimation;
- system identification;
- ML/data-driven models.

Map boundary with ML.

---

# 19. VALIDATION AUDIT

Check whether model is compared with:

- known analytical solution;
- empirical data;
- synthetic truth;
- scenario constraints.

---

# 20. VERIFICATION VS VALIDATION

Flag content that conflates:

- “equations solved correctly”

with:

- “model represents the target system adequately”.

---

# 21. SENSITIVITY AUDIT

Find parameter-sweep/local/global sensitivity methods if present.

---

# 22. UNCERTAINTY AUDIT

Find uncertainty propagation / Monte Carlo if present.

---

# 23. ASSESSMENT AUDIT

Classify:

- formula recall;
- model formulation;
- variable identification;
- assumptions;
- dimensional check;
- derivation;
- solve;
- validation;
- interpretation;
- project.

---

# 24. GRADER AUDIT

Determine whether grader can handle:

- algebraically equivalent equations;
- equivalent state coordinates;
- multiple valid formulations;
- numerical tolerance;
- units.

---

# 25. RUNTIME AUDIT

Identify Math/Python providers and any duplicate solver stack.

---

# 26. AI AUDIT

Check if AI:

- invents assumptions;
- fabricates validity;
- ignores units;
- writes official mastery;
- reveals protected solutions.

---

# 27. AUTHORING AUDIT

Find how authors create:

- models;
- equations;
- parameter sets;
- simulations;
- validation tasks.

---

# 28. UX AUDIT

Inspect:

- equation editing;
- parameter tables;
- diagrams;
- simulation controls;
- plots;
- mobile;
- accessibility.

---

# 29. LEGACY / DUPLICATE OWNER

Classify:

`KEEP`
`MIGRATE`
`RETIRE`
`UNKNOWN`.

Find duplicate:

- model registry;
- equation parser;
- solver;
- simulation engine;
- plotting state;
- grader.

---

# 30. RISK REGISTER

At minimum:

- hidden assumptions;
- unit mismatch;
- wrong initial condition;
- solver/model conflation;
- invalid linearization;
- simulation instability;
- duplicate owner;
- AI overclaim;
- adjacent-subject leakage.

---

# 31. DELIVERABLES

Create:

`subjects/analytical-models/docs/am01/AM01_EXECUTIVE_SUMMARY.md`

`AM01_REPOSITORY_MAP.md`

`AM01_CONTENT_MODEL_INVENTORY.json`

`AM01_SOLVER_SIMULATION_INVENTORY.json`

`AM01_ASSESSMENT_GRADER_AUDIT.md`

`AM01_BOUNDARY_ADJACENT_SUBJECT_MAP.md`

`AM01_DUPLICATE_OWNER_MAP.md`

`AM01_LEGACY_REGISTER.json`

`AM01_RISK_REGISTER.json`

`AM02_INPUT_CONTRACT.md`.

---

# 32. PASS

PASS only when actual scope/model families/runtime/assessment/ownership are evidenced enough to design AM02 without guessing.

---

# 33. FINAL PRINCIPLE

**THE COURSE TITLE IS NOT THE SYLLABUS. AUDIT THE ACTUAL MODELING CONTENT FIRST.**
