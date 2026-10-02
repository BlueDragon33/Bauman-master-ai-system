# AM03 — MODEL FORMULATION · REASONING · VERIFICATION · VALIDATION · ASSESSMENT

Mode:

`FORMULATION-FIRST · MULTIPLE-VALID-MODEL-AWARE · EVIDENCE-BASED`

---

# 0. ENTRY

Requires AM02.

---

# 1. REASONING LOOP

`Target system`

→ `Purpose`

→ `Boundary`

→ `Variables`

→ `Assumptions`

→ `Model class`

→ `Equations`

→ `Conditions`

→ `Units`

→ `Solution`

→ `Verification`

→ `Validation`

→ `Sensitivity`

→ `Limitations`.

---

# 2. ASSESSMENT DIMENSIONS

Grade separately:

- abstraction;
- boundary;
- variable roles;
- assumptions;
- equations;
- conditions;
- units;
- solution;
- verification;
- validation;
- interpretation.

---

# 3. EQUATION-ONLY ANSWER

A correct equation without assumptions/variable definitions can be incomplete evidence.

---

# 4. MULTIPLE VALID MODELS

The same system may admit different valid models for different purposes.

Task contract must specify intended fidelity/use.

---

# 5. MULTIPLE VALID REPRESENTATIONS

Accept equivalent:

- rearranged equations;
- equivalent state coordinates;
- input-output form;
- state-space form

when task permits.

---

# 6. DIMENSIONAL CONSISTENCY

Grader checks dimensions/units where applicable.

---

# 7. VARIABLE ROLE ERROR

Detect:

- parameter treated as state;
- disturbance treated as controlled input;
- observation treated as true state without assumption.

---

# 8. HIDDEN ASSUMPTION ERROR

Learner must state assumptions necessary for derivation/validity.

---

# 9. INITIAL-CONDITION ERROR

Dynamic solution with missing/wrong initial condition is incomplete/wrong.

---

# 10. BOUNDARY-CONDITION ERROR

Same where relevant.

---

# 11. MODEL-CLASS SELECTION

Learner justifies static/dynamic, continuous/discrete, deterministic/stochastic etc where task targets it.

---

# 12. LINEARIZATION ASSESSMENT

If in scope:

operating point + approximation + validity range.

---

# 13. DISCRETIZATION ASSESSMENT

If in scope:

method + step + approximation effect.

---

# 14. ANALYTICAL SOLUTION

Assess math correctness and interpretation separately.

---

# 15. NUMERICAL SOLUTION

Assess:

- method;
- step/tolerance;
- convergence/stability where relevant;
- error awareness.

---

# 16. SIMULATION RESULT

A plot matching expectation is not sufficient proof.

Learner should connect it to equations/conditions.

---

# 17. VERIFICATION TASK

Compare to:

- known special case;
- conservation/balance law;
- analytical reference;
- manufactured/synthetic solution;
- invariant.

As appropriate.

---

# 18. VALIDATION TASK

Compare model prediction/behavior to:

- experimental data;
- accepted scenario;
- independent reference;
- qualitative system behavior.

---

# 19. CALIBRATION VS VALIDATION

If calibration data used to fit parameters, separate independent validation evidence.

---

# 20. SENSITIVITY TASK

Learner explains:

- parameter varied;
- range;
- output metric;
- interpretation.

---

# 21. UNCERTAINTY TASK

If in scope:

distinguish uncertainty sources.

---

# 22. IDENTIFIABILITY

Only if actual scope:

can parameters be inferred uniquely/robustly?

---

# 23. STATE-SPACE ASSESSMENT

If supported:

matrix dimensions and variable ordering explicit.

---

# 24. TRANSFER-FUNCTION ASSESSMENT

If supported:

assumptions/input-output/initial-condition convention explicit.

---

# 25. STOCHASTIC-MODEL ASSESSMENT

If supported:

probability/transition normalization and assumptions.

---

# 26. QUEUE/MARKOV

Only if AM01 places them here.

Assessment must name assumptions.

---

# 27. MODEL COMPARISON

Compare by:

- purpose;
- fidelity;
- complexity;
- data need;
- computational cost;
- validity regime.

No universal “more complex = better”.

---

# 28. ERROR TAXONOMY

`BOUNDARY_ERROR`

`VARIABLE_ROLE_ERROR`

`ASSUMPTION_ERROR`

`UNIT_ERROR`

`EQUATION_ERROR`

`CONDITION_ERROR`

`MODEL_CLASS_ERROR`

`LINEARIZATION_ERROR`

`DISCRETIZATION_ERROR`

`SOLVER_ERROR`

`VERIFICATION_ERROR`

`VALIDATION_ERROR`

`SENSITIVITY_ERROR`

`INTERPRETATION_ERROR`

`OVERCLAIM_ERROR`.

---

# 29. PARTIAL CREDIT

Separate modeling decisions from algebra/numerics.

C4 owns global mastery aggregation.

---

# 30. HINT LADDER

H1 clarify system/purpose

H2 identify boundary/variables

H3 expose missing assumption

H4 choose model class

H5 suggest governing relation

H6 check units/conditions

H7 suggest verification

H8 full worked solution only when allowed.

---

# 31. TEST-OF-TESTS

Known invalid models must fail:

- dimensionally inconsistent;
- missing initial condition;
- wrong variable role;
- invalid linearization;
- unstable numerical step presented as system behavior;
- calibration used as validation.

Known equivalent valid formulations must pass.

---

# 32. NUMERICAL TOLERANCE

Use context-aware tolerances.

Exact floating comparison forbidden where inappropriate.

---

# 33. AI BOUNDARY

AI may coach model formulation.

It cannot:

- invent unstated system facts;
- silently add assumptions;
- declare validation without evidence;
- write official mastery.

---

# 34. DELIVERABLES

Create:

`AM_MODEL_FORMULATION_CONTRACT.md`

`AM_REASONING_ASSESSMENT_CONTRACT.md`

`AM_MODEL_EQUIVALENCE_POLICY.md`

`AM_VERIFICATION_ASSESSMENT_CONTRACT.md`

`AM_VALIDATION_ASSESSMENT_CONTRACT.md`

`AM_ERROR_TAXONOMY.json`

`AM_GOLDEN_VALID_MODELS.json`

`AM_GOLDEN_INVALID_MODELS.json`

`AM04_INPUT_CONTRACT.md`.

---

# 35. PASS

PASS when grader can distinguish:

- mathematically correct but invalid model;
- valid model with algebra mistake;
- equivalent valid representations;
- solver/numerical errors;
- validation overclaims.

---

# 36. FINAL PRINCIPLE

**GRADE THE MODELING DECISIONS SEPARATELY FROM THE ALGEBRA THAT FOLLOWS THEM.**
