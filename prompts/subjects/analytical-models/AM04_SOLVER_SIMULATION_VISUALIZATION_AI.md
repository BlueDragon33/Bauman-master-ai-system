# AM04 — SOLVER · SIMULATION · VISUALIZATION · AI MODELING INTELLIGENCE

Mode:

`REUSE-MATH-PYTHON · CANONICAL-MODEL-DRIVEN · NUMERICALLY-TRANSPARENT · AI-BOUNDED`

---

# 0. ENTRY

Requires AM02/AM03.

---

# 1. MISSION

Provide analytical/numerical/simulation/visualization capabilities that execute canonical models without becoming truth owners.

---

# 2. CAPABILITIES

Possible:

`am.symbolic.solve`

`am.numeric.solve`

`am.simulate.dynamic`

`am.plot.trajectory`

`am.plot.response`

`am.visual.system`

`am.sensitivity.run`

`am.uncertainty.run`

`am.model.compare`

`am.ai.tutor`.

Only implement capabilities supported by actual AM scope.

---

# 3. MATH PROVIDER

Reuse Math symbolic/numeric/formula capabilities.

No second CAS architecture.

---

# 4. PYTHON PROVIDER

Reuse Python/NumPy/SciPy runtime.

No second unrestricted Python runtime.

---

# 5. MODEL → EXECUTION CONTRACT

Execution input must reference:

- model revision;
- parameter set;
- input scenario;
- initial/boundary conditions;
- solver configuration.

---

# 6. SOLVER OUTPUT

Store:

- method;
- status;
- tolerances;
- warnings;
- result;
- diagnostics.

---

# 7. CLOSED-FORM SOLUTION

If symbolic solution exists, preserve conditions/branches.

Do not discard domain constraints.

---

# 8. NUMERICAL SOLVER

Expose method and key accuracy controls when pedagogically relevant.

---

# 9. STEP SIZE

Changing step may change numerical behavior.

Do not mislabel artifact as system property.

---

# 10. CONVERGENCE CHECK

Where practical compare step/tolerance refinement.

---

# 11. SOLVER FAILURE

Divergence/nonconvergence is a first-class outcome.

Do not draw a smooth fake line.

---

# 12. SIMULATION RUN IDENTITY

A run binds exact:

- model;
- parameters;
- inputs;
- conditions;
- solver;
- code/provider version.

---

# 13. DETERMINISM

Deterministic runs reproducible under same inputs/provider constraints.

---

# 14. RANDOMNESS

Stochastic/Monte Carlo runs record seed/distribution where in scope.

---

# 15. TRAJECTORY VIEW

Axes/units/state names explicit.

---

# 16. INPUT/OUTPUT RESPONSE

Distinguish input, output, state and disturbance.

---

# 17. PHASE/STATE PLOT

Only when meaningful.

Axes semantics explicit.

---

# 18. SYSTEM/BLOCK DIAGRAM

Diagram consumes canonical connection/model data.

It does not own equations.

---

# 19. DIAGRAM ACCESSIBILITY

Structured node/block/connection alternative.

---

# 20. PARAMETER SWEEP

Record range and output metric.

---

# 21. SENSITIVITY VIEW

Do not conflate local sensitivity with uncertainty distribution.

---

# 22. UNCERTAINTY / MONTE CARLO

Only if actual scope.

Show distributions/intervals honestly.

---

# 23. MODEL COMPARISON

Same input/scenario where comparison requires.

Display differing assumptions/fidelity.

---

# 24. VALIDATION VIEW

Observed/reference vs predicted with residual/error measure if appropriate.

---

# 25. AI TUTOR MODES

`BOUNDARY_COACH`

`VARIABLE_COACH`

`ASSUMPTION_COACH`

`MODEL_CLASS_COACH`

`EQUATION_COACH`

`UNIT_COACH`

`VERIFICATION_COACH`

`VALIDATION_COACH`

`SENSITIVITY_COACH`.

---

# 26. AI GROUNDING

Canonical model + task + learner formulation + allowed hints + actual solver evidence.

---

# 27. AI ASSUMPTION SAFETY

AI may suggest:

“Check whether X assumption is intended.”

It must not silently insert X as fact.

---

# 28. AI SOLVER CLAIM

Use actual solver output, not invented numbers.

---

# 29. AI VALIDATION CLAIM

Cannot declare model validated without validation evidence.

---

# 30. AI MODEL EQUIVALENCE

If symbolic verification available, use it.

Otherwise label uncertainty/advisory.

---

# 31. HIDDEN SOLUTION

Protected assessment solutions remain unavailable.

---

# 32. OFFLINE

Canonical content/precomputed runs/local Python capabilities as supported.

Server-only heavy computation degrades honestly.

---

# 33. RESOURCE LIMITS

Timeout/memory/plot-size/Monte-Carlo caps.

---

# 34. STALE RUN

If model/parameter changes, old simulation cannot overwrite current result.

---

# 35. MULTI-TAB

Runs isolated.

---

# 36. OBSERVABILITY

Track:

- solver failure;
- numerical warning;
- stale result;
- visualization error;
- AI failure.

---

# 37. DELIVERABLES

Create:

`AM_EXECUTION_CONTRACT.md`

`AM_SOLVER_PROVIDER_MAP.md`

`AM_SIMULATION_RUN_SCHEMA.json`

`AM_NUMERICAL_TRANSPARENCY_POLICY.md`

`AM_VISUALIZATION_CONTRACT.md`

`AM_SENSITIVITY_UNCERTAINTY_RUNTIME_CONTRACT.md`

`AM_AI_TUTOR_CONTRACT.md`

`AM_RESOURCE_SECURITY_BOUNDARY.md`

`AM05_INPUT_CONTRACT.md`.

---

# 38. GOLDEN FIXTURES

At minimum include supported-scope examples for:

- exact/reference solution;
- dimension mismatch rejection;
- solver divergence/nonconvergence;
- step-size artifact;
- equivalent model representation;
- parameter sweep;
- validation mismatch.

---

# 39. PASS

PASS when solver/simulation/visualization/AI all consume the same canonical model and expose numerical assumptions rather than hiding them.

---

# 40. FINAL PRINCIPLE

**SOLVERS EXECUTE MODELS. PLOTS DISPLAY RUNS. NEITHER DEFINES THE SYSTEM.**
