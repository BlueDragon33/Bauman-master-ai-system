# MATH04 — COMPUTATION · VISUALIZATION · SIMULATION · AI MATH INTELLIGENCE
## Capabilities that support mathematics without becoming hidden truth owners

Mode:

`CAPABILITY-BASED · PROVIDER-ABSTRACTED · DOMAIN-SAFE · AI-BOUNDED · OFFLINE-DEGRADABLE`

---

# 0. MISSION

Provide trustworthy computational and interactive Math capabilities while preserving the canonical truth and reasoning contracts from MATH02/MATH03.

Central rule:

> **TOOLS MAY COMPUTE, VISUALIZE OR COACH; THEY MAY NOT SILENTLY REDEFINE MATHEMATICS.**

---

# 1. CONSTITUTION ROUTING

Load relevant clauses from:

- C1: Extension/Add-on Engine, Capability Registry, Universal Resource Adapter, AI Layer, Security, Offline First;
- C2: Resource Viewer, interaction, mobile, accessibility, error states, AI UI;
- C3: plugin/resource/AI/offline/performance/security tests;
- C4: AI role, evidence provider, adaptive boundary, transfer/application.

---

# 2. CAPABILITY MODEL

Expose Math tooling through reusable capabilities such as:

- `math.render.expression`
- `math.parse.expression`
- `math.symbolic.simplify`
- `math.symbolic.solve`
- `math.numeric.evaluate`
- `math.graph.plot`
- `math.geometry.render`
- `math.matrix.compute`
- `math.vector.visualize`
- `math.simulation.run`
- `math.ai.coach`.

Exact naming is implementation-specific.

The architectural principle is stable:

subjects consume capabilities; they do not hard-wire providers everywhere.

---

# 3. EXPRESSION PARSER

Parser must have a defined grammar/contract.

It should not use unsafe arbitrary `eval` on learner input.

Handle:

- numbers;
- fractions;
- variables;
- powers;
- parentheses;
- functions;
- constants;
- vectors/matrices if supported;
- relations/equations if supported.

Unknown syntax should fail clearly, not be guessed silently.

---

# 4. SYMBOLIC PROVIDER / CAS

If a CAS/provider exists, wrap behind a canonical adapter.

Adapter records:

- provider/version where relevant;
- operation;
- assumptions;
- exact/approximate mode;
- timeout/error;
- normalized result type.

UI must not call different symbolic engines independently without a facade.

---

# 5. CAS IS NOT UNIVERSAL AUTHORITY

CAS output may depend on:

- assumptions;
- branch choices;
- domain;
- simplification conventions;
- provider version.

For assessment, MATH03 policy decides how CAS evidence is used.

---

# 6. SYMBOLIC OPERATIONS

Potential operations:

- simplify;
- expand/factor;
- solve equation/system;
- differentiate;
- integrate;
- limit;
- matrix operations;
- algebraic equivalence.

Implement only what curriculum/product actually requires.

Do not create a mini-CAS from scratch if a safe reusable capability exists.

---

# 7. NUMERICAL ENGINE

Define:

- numeric type/precision;
- overflow/underflow behavior;
- NaN/Infinity;
- tolerance;
- iteration limits;
- convergence failure;
- deterministic seed where randomness used.

Never hide non-convergence as a valid numeric answer.

---

# 8. CONDITIONING / NUMERICAL STABILITY

For numerical methods, distinguish:

- mathematical problem;
- algorithm;
- numerical approximation;
- conditioning;
- convergence;
- discretization/rounding error.

A plausible number is not automatically a valid result.

---

# 9. UNIT / DIMENSION SUPPORT

If applied Math uses units:

computation should preserve/validate unit semantics or explicitly state that units are handled outside the engine.

Do not mix silent unitless and unit-aware paths.

---

# 10. GRAPH ENGINE

Graphing capability may support:

- Cartesian functions;
- implicit plots if required;
- parametric/polar if required;
- points/segments/vectors;
- data series;
- annotations.

The graph engine consumes canonical expression/domain data.

It does not own the function definition.

---

# 11. GRAPH DISCONTINUITIES

Test:

- vertical asymptotes;
- holes;
- piecewise boundaries;
- absolute value corners;
- rapidly oscillating functions;
- domain gaps.

Naive line-joining must not visually invent continuity.

---

# 12. GRAPH SCALE / SAMPLING

Support sensible:

- auto scale;
- manual bounds;
- zoom/pan;
- sample density;
- resize.

Guard against:

- huge ranges;
- infinite loops;
- excessive points;
- UI freezes.

---

# 13. GRAPH ACCESSIBILITY

Where feasible provide nonvisual alternatives:

- function/equation text;
- key points;
- extrema/intercepts/asymptote description when known from canonical/validated computation;
- table/sample values;
- textual task instructions.

Do not claim a full graph is accessible merely because canvas has an aria-label.

---

# 14. GEOMETRY WORKSPACE

If geometry is required:

represent objects explicitly:

- point;
- line;
- segment;
- ray;
- angle;
- circle;
- polygon;
- vector;
- constraint.

Drag interaction must have a keyboard/non-drag alternative where learning flow requires accessibility.

---

# 15. VECTOR / MATRIX VISUALIZATION

Support when curriculum requires:

- vector addition/projection;
- basis/coordinate change;
- matrix transformations;
- determinant/area intuition;
- eigen direction visualization.

Do not let animation replace symbolic/numerical evidence.

---

# 16. CALCULUS VISUALIZATION

Potential validated experiences:

- limit approach;
- secant → tangent;
- derivative as local rate/slope;
- integral accumulation;
- gradient/level set;
- multivariable sections.

Each visualization must link to a concept/competency and not invent mathematically false behavior for visual smoothness.

---

# 17. PROBABILITY / STATISTICS VISUALS

If within Math scope:

- distributions;
- sampling;
- expectation/variance;
- simulation;
- confidence concepts.

Randomized demos need controlled seeds for tests.

Do not confuse simulation frequency with proof of probability law.

---

# 18. NUMERICAL METHODS / SIMULATION

If supported:

- method parameters;
- initial conditions;
- step size;
- stopping condition;
- convergence status;
- error estimate where applicable;
- reproducibility.

MATH02/MATH03 define academic meaning; MATH04 executes the capability.

---

# 19. PYTHON / NUMPY / CODE BOUNDARY

Code can be used as a representation/implementation of mathematical ideas.

If an execution environment exists:

- sandbox it;
- limit resources;
- define allowed packages;
- no arbitrary system/network access unless explicitly part of trusted platform capability;
- capture deterministic inputs/outputs for assessment where possible.

Do not require Python for a pure-math competency unless curriculum says so.

---

# 20. FORMULA RENDERER

Use shared safe renderer capability.

Requirements:

- correct Cyrillic/Latin/Greek symbols as needed;
- long expression overflow behavior;
- matrices/aligned equations;
- copy/select where feasible;
- mobile scaling;
- accessible semantic output where supported;
- safe handling of untrusted content.

---

# 21. RENDERER ≠ PARSER

Display syntax and evaluation syntax may differ.

Define conversion boundaries.

Do not feed arbitrary rendered HTML back into evaluator.

---

# 22. COMPUTATION CACHING

Cache only when safe:

key by canonical normalized input + assumptions + provider/version/mode where material.

Do not reuse a result across different assumptions.

---

# 23. PROVIDER FAILURE

If CAS/AI/remote compute fails:

- core static lesson remains;
- deterministic local practice may continue where possible;
- feature exposes a clear degraded state;
- official assessment must not silently switch to unvalidated AI scoring.

---

# 24. AI MATH TUTOR ROLE

AI may act as:

- Socratic Tutor;
- Explainer;
- Strategy Coach;
- Misconception Coach;
- Proof Coach;
- Modeling Coach;
- Code/Computation Coach;
- Reflection Coach.

AI is not canonical theorem authority.

---

# 25. AI CONTEXT BUILDER

Prefer targeted context:

- active concept IDs;
- validated definitions/theorems/formulas;
- problem contract;
- learner attempt/steps;
- allowed hints;
- prior misconception evidence;
- current mode.

Do not send the entire Math corpus.

---

# 26. AI GROUNDING

AI explanation should ground to MATH02/MATH03 content when canonical material exists.

If source is unavailable/uncertain:

AI must express uncertainty rather than invent a theorem/reference.

---

# 27. AI SOCRATIC POLICY

Before revealing full solution, AI should normally:

- inspect learner attempt;
- ask/check understanding;
- give the smallest useful hint;
- let learner retry.

Assessment mode may restrict help further.

---

# 28. AI ANSWER REVEAL

Respect task mode and hint policy.

Do not show the final exam/checkpoint answer because learner asks “solve it for me”.

---

# 29. AI REASONING FEEDBACK

AI can identify a **possible** issue.

For official evaluation:

- deterministic evaluator;
- validated rubric;
- teacher/manual process;
- or explicitly governed AI process

must own scoring.

---

# 30. AI PROOF COACH

AI may:

- ask for missing justification;
- suggest proof strategy;
- identify dependency;
- test a claim with counterexample search/tool.

It must not claim a free-form proof is formally verified unless formal verification actually occurred.

---

# 31. AI TOOL PERMISSIONS

AI may call approved tools such as:

- canonical retrieval;
- symbolic evaluator;
- numerical calculator;
- graph generator;
- unit checker;

through explicit adapters.

Tool output must be validated/typed before use.

No shell/file/network access by default solely because AI requests it.

---

# 32. AI + CAS DISAGREEMENT

When AI explanation conflicts with deterministic/canonical output:

canonical/evaluator evidence wins.

Log disagreement for review.

Do not average the two.

---

# 33. STALE AI RESPONSE

If learner edits the solution while AI response is in flight:

old response must not overwrite/apply to the newer state without relevance check.

---

# 34. AI OFFLINE / PROVIDER OUTAGE

Core Math remains functional without AI.

Fallback:

- canonical explanation;
- deterministic hints;
- worked-example references;
- local evaluator.

---

# 35. PERFORMANCE

Do not initialize heavy CAS/graph/code engines on startup if not needed.

Lazy-load by capability/route.

Measure:

- initialization;
- compute latency;
- graph render;
- memory;
- repeated cleanup.

---

# 36. SECURITY

Treat learner expressions, LaTeX, imported Math content and AI output as untrusted data.

Guard against:

- script/HTML injection;
- unsafe LaTeX extensions;
- arbitrary code execution;
- resource-exhaustion expressions;
- malicious imports;
- prompt injection from content sources.

---

# 37. GOLDEN CAPABILITY FIXTURES

Maintain representative cases for:

- symbolic equivalence;
- domain-sensitive simplification;
- multi-solution equations;
- numeric tolerance;
- matrix dimension;
- discontinuous graph;
- numerical non-convergence;
- malformed expression;
- provider timeout;
- AI hint policy;
- AI/CAS disagreement;
- offline fallback.

---

# 38. REQUIRED OUTPUTS

Create/update:

- `MATH_CAPABILITY_REGISTRY.json`
- `MATH_EXPRESSION_PARSER_CONTRACT.md`
- `MATH_SYMBOLIC_PROVIDER_CONTRACT.md`
- `MATH_NUMERICAL_COMPUTATION_POLICY.md`
- `MATH_GRAPH_GEOMETRY_CONTRACT.md`
- `MATH_SIMULATION_NUMERICAL_METHODS_CONTRACT.md`
- `MATH_AI_TUTOR_CONTRACT.md`
- `MATH_AI_TOOL_PERMISSION_MATRIX.md`
- `MATH_COMPUTATION_VISUALIZATION_GOLDEN_FIXTURES.json`
- `MATH_P5_INPUT_CONTRACT.md`.

---

# 39. EXIT GATE

MATH04 PASS only if:

1. Math tools are capability-based, not route-specific forks;
2. parser safety is defined;
3. symbolic/numeric exactness boundaries are explicit;
4. assumptions/domain are preserved;
5. graphs handle discontinuity/bounds safely;
6. geometry/vector/matrix tools are scoped by curriculum;
7. simulation reports convergence/failure honestly;
8. renderer/parser boundary is explicit;
9. AI is grounded and non-authoritative;
10. AI honors hint/assessment policy;
11. provider failures degrade safely;
12. performance/offline/security tests exist;
13. golden edge cases pass.

At PASS:

`MATH TOOL & AI INTELLIGENCE CONTRACT LOCKED`.