# MATH01 — FORENSIC BASELINE
## Current reality before redesign

Mode:

`READ-FIRST · EVIDENCE-FIRST · NO-REDESIGN · NO-MASS-DELETE`

---

# 0. MISSION

Map the actual Mathematics system before changing its architecture or content.

MATH01 is not a prompt to make Math prettier.

It is not a prompt to generate curriculum.

It is not a prompt to replace the current evaluator/CAS/graph engine simply because another tool exists.

It must prove what currently exists and what actually runs.

---

# 1. CONSTITUTION ROUTING

Load targeted clauses from:

- C1: Platform Kernel, Content Engine, Subject Factory, backward compatibility, migration;
- C2: App Shell, responsive, accessibility, resource/learning surfaces;
- C3: starting rule, test-scope model, persistence/state/regression evidence;
- C4: competency/evidence/authority separation.

Do not load all constitutions unless the audit expands to those areas.

---

# 2. DISCOVER ACTUAL SUBJECT SCOPE

Start from current main.

Find the actual Math entry through:

- subject manifest/registry;
- routes;
- runtime imports;
- navigation;
- build/package configuration.

If the real path is not `subjects/math/`, record the actual path.

Do not rename it during MATH01.

---

# 3. REQUIRED REALITY MAP

Inventory machine-readable evidence for:

- entry/shell;
- routes;
- presentation components;
- styles;
- lesson/data loaders;
- mathematical content;
- formula renderer;
- expression parser;
- evaluator;
- symbolic provider/CAS if any;
- numerical tools;
- graph/geometry tools;
- assessment;
- mastery/progress;
- review/adaptive logic;
- AI Math features;
- persistence;
- offline/PWA;
- authoring/admin;
- tests;
- packaging/deployment hooks;
- legacy/unknown paths.

For each important file/module capture:

`path · category · runtimeLoaded · ownerHypothesis · imports · referencedBy · state touched · content touched · routes · risk · evidence`.

Unknown remains `UNKNOWN`.

---

# 4. MATHEMATICAL CONTENT INVENTORY

Discover actual datasets instead of assuming filenames.

Classify content into candidate families:

- concepts;
- definitions;
- notation;
- formulas;
- theorems/lemmas/propositions;
- proofs/derivations;
- examples;
- worked problems;
- exercises;
- assessments;
- graphs/figures;
- applications/projects;
- error patterns/remediation;
- media/resources.

Measure:

- record count;
- source format;
- schema consistency;
- load strategy;
- provenance/source metadata;
- duplicates;
- derived indexes;
- content embedded in UI/code.

Flag hard-coded academic truth inside presentation code.

---

# 5. CURRICULUM REALITY

Map the current learner journey:

- stages/modules/units/lessons;
- ordering;
- prerequisites;
- gates;
- outcomes;
- technical/engineering links.

Do not infer an intended curriculum from file names alone.

Compare runtime route order with data-defined order.

---

# 6. MATHEMATICAL TRUTH OWNER AUDIT

Build ownership matrix for:

- definition truth;
- formula truth;
- theorem statement;
- assumptions/domain;
- notation;
- exact answer;
- numerical answer/tolerance;
- algebraic equivalence;
- proof rubric;
- graph definition;
- units/dimensions;
- assessment scoring;
- mastery;
- adaptive selection.

Classify:

`ONE OWNER`

`MULTIPLE OWNER`

`UNCLEAR OWNER`.

Multiple independent writers/truth definitions are high risk.

---

# 7. FORMULA RENDERING AUDIT

Identify actual formula rendering path:

- MathJax;
- KaTeX;
- custom parser;
- plain HTML;
- image;
- mixed systems;
- unknown.

Test:

- inline math;
- display math;
- fractions;
- roots;
- powers/subscripts;
- sums/products;
- limits;
- derivatives;
- integrals;
- piecewise functions;
- matrices;
- vectors;
- aligned equations;
- long expressions;
- mobile overflow;
- malformed input;
- untrusted content safety.

Record renderer ownership and fallback.

---

# 8. EXPRESSION / ANSWER EVALUATOR AUDIT

Trace how the system decides an answer is correct.

Investigate whether it uses:

- string equality;
- normalized string;
- numeric comparison;
- symbolic equivalence;
- custom rule;
- external CAS;
- AI;
- manual/self-check.

Test representative equivalence risks:

`x+x` vs `2x`

`1/2` vs `0.5`

`(x-1)(x+1)` vs `x^2-1`

interval/set notation

`±`

units

rounding

domain restrictions.

Do not fix in MATH01.

Document false-positive/false-negative risk.

---

# 9. PROBLEM-SOLVING ENGINE AUDIT

Trace:

- problem statement;
- givens;
- expected answer;
- solution steps;
- hints;
- worked solution;
- submit/retry;
- feedback;
- remediation;
- mastery write.

Determine whether the system understands steps or only the final answer.

Check whether viewing a solution changes mastery/progress.

---

# 10. PROOF / REASONING AUDIT

If proof/reasoning tasks exist, identify:

- task type;
- expected structure;
- rubric;
- human/AI/deterministic checking;
- evidence storage;
- accepted alternative reasoning.

Do not pretend free-form proof checking exists if it does not.

---

# 11. GRAPH / VISUALIZATION AUDIT

Discover providers and ownership for:

- function plots;
- coordinate geometry;
- vectors;
- matrices;
- statistics charts;
- interactive parameters;
- 2D/3D views if any.

Test:

- discontinuities;
- domain boundaries;
- asymptotes;
- extreme scale;
- zoom/pan;
- resize;
- touch;
- invalid function;
- large datasets.

Visualization is evidence about rendering, not automatic proof of mathematical correctness.

---

# 12. NUMERICAL / SYMBOLIC COMPUTATION AUDIT

Identify:

- local libraries;
- remote APIs;
- custom algorithms;
- Python bridge;
- WebAssembly/provider;
- AI fallback.

Record:

- exact vs approximate;
- precision;
- tolerance;
- assumptions;
- error handling;
- offline availability;
- provider fallback;
- version sensitivity.

---

# 13. STATE / PERSISTENCE AUDIT

Inventory:

- localStorage;
- IndexedDB;
- backend/DB;
- cache;
- in-memory state.

Trace:

- progress;
- completion;
- attempts;
- first attempt;
- score;
- mastery;
- error notebook;
- review queue;
- saved work;
- graph/workspace state;
- settings.

Critical findings include:

- render writes mastery;
- opening lesson increments mastery;
- retry overwrites first attempt;
- reload duplicates attempt;
- corrupt state silently resets history.

---

# 14. AI AUDIT

If AI Math exists, map:

- entry point;
- context builder;
- retrieval;
- tools;
- write permissions;
- scoring/mastery influence;
- answer reveal behavior;
- source/uncertainty behavior.

Flag if AI can:

- become theorem authority;
- modify official score directly;
- unlock mastery/stage;
- fabricate canonical formulas;
- bypass assessment reveal policy.

---

# 15. UI/UX BASELINE

Audit representative journeys on desktop/tablet/mobile:

- dashboard/roadmap;
- lesson;
- formula-heavy content;
- problem workspace;
- assessment;
- graph/visualization;
- review;
- AI tutor;
- authoring if present.

Capture:

- overflow;
- nested scrolling;
- keyboard usability;
- mobile math entry;
- focus;
- touch targets;
- long matrix/table/formula behavior;
- loading/error/empty/offline states.

Do not redesign.

---

# 16. ACCESSIBILITY BASELINE

Check:

- semantic headings/landmarks;
- keyboard navigation;
- visible focus;
- form labels/errors;
- math alternative semantics where available;
- graph textual alternative where feasible;
- non-color-only information;
- zoom/reflow;
- screen-reader smoke;
- mobile touch.

Automated checks alone are insufficient.

---

# 17. PERFORMANCE BASELINE

Measure representative:

- initial load;
- math-render time;
- problem interaction latency;
- expression evaluation;
- graph initialization;
- large lesson;
- large problem bank/search;
- memory after repeated routes;
- offline package size where relevant.

MATH01 records baseline; it does not invent arbitrary targets.

---

# 18. TEST TRUST AUDIT

For each Math test classify:

`TRUSTED`

`USEFUL`

`WEAK`

`STALE`

`MISLEADING`.

Document what each test proves and does not prove.

Pay special attention to tests that only:

- assert a string;
- assert file existence;
- compare one exact solution string;
- mock the actual evaluator;
- skip real formula renderer;
- never run mobile/browser.

---

# 19. ROOT-CAUSE TREE

Group findings by causes rather than listing hundreds of bugs.

Candidate groups:

- architecture/ownership;
- curriculum/content;
- expression/equivalence;
- assessment/mastery;
- visualization;
- computation;
- AI;
- UI/accessibility;
- persistence;
- offline;
- testing/performance.

---

# 20. REQUIRED OUTPUTS

Create/update concise canonical artifacts such as:

- `MATH_P1_EXECUTIVE_SUMMARY.md`
- `MATH_FILE_RUNTIME_INVENTORY.json`
- `MATH_ROUTE_OWNER_MAP.md`
- `MATH_CONTENT_DATA_MAP.md`
- `MATH_MATHEMATICAL_OWNER_MATRIX.md`
- `MATH_RENDERER_COMPUTATION_MAP.md`
- `MATH_STATE_STORAGE_MAP.md`
- `MATH_TEST_TRUST_MATRIX.md`
- `MATH_PERFORMANCE_ACCESSIBILITY_BASELINE.md`
- `MATH_ROOT_CAUSE_TREE.md`
- `MATH_KEEP_REFACTOR_RETIRE_MATRIX.md`
- `MATH_P2_INPUT_CONTRACT.md`
- `MATH_P1_EVIDENCE_INDEX.md`.

Consolidate when fewer artifacts preserve clarity.

Avoid report spam.

---

# 21. EXIT GATE

MATH01 PASS only if:

1. actual Math runtime scope is known;
2. current curriculum/data are mapped;
3. mathematical truth owners are known or explicitly unresolved;
4. evaluator/computation/visualization paths are mapped;
5. learner-state write paths are mapped;
6. major UI/accessibility/performance baselines exist;
7. current test blind spots are known;
8. major root causes are grouped;
9. MATH02 receives an evidence-based input contract.

Production remains unchanged.