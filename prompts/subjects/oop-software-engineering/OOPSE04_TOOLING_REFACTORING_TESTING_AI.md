# OOPSE04 — TOOLING · REFACTORING · TESTING · STATIC ANALYSIS · AI

Mode:

`REUSE-PYTHON-RUNTIME · TOOL-AS-EVIDENCE · BEHAVIOR-PRESERVING · AI-BOUNDED`

---

# 0. ENTRY

Requires OOPSE02/OOPSE03.

---

# 1. MISSION

Provide code/model/test/refactor/review capabilities that support canonical design reasoning without making tools the design authority.

---

# 2. CAPABILITIES

Possible:

`oopse.code.run`

`oopse.test.run`

`oopse.typecheck.run`

`oopse.lint.run`

`oopse.coverage.run`

`oopse.mutation.run`

`oopse.dependency.inspect`

`oopse.model.render`

`oopse.diff.review`

`oopse.refactor.preview`

`oopse.ai.tutor`.

Only implement capabilities supported by actual scope.

---

# 3. PYTHON RUNTIME

Reuse Python system provider where Python is implementation language.

No second unrestricted interpreter.

---

# 4. TEST RUNNER

Return:

- test identity;
- pass/fail;
- failure message;
- duration;
- coverage/other optional metrics.

---

# 5. UNIT VS INTEGRATION

Tool/UI labels test scope honestly.

---

# 6. COVERAGE

Coverage is supporting evidence only.

---

# 7. MUTATION TESTING

If in scope, mutations run in sandbox with limits.

---

# 8. STATIC ANALYSIS

Potential:

- lint;
- type;
- dependency graph;
- complexity;
- dead code;
- import cycles.

Findings are not automatic canonical defects.

---

# 9. DEPENDENCY GRAPH

Consume actual imports/module relationships.

Do not infer architecture solely from folders.

---

# 10. UML / MODEL RENDERING

Render structured canonical model.

Diagram is projection.

---

# 11. CODE → MODEL EXTRACTION

If used, label as inferred candidate, not canonical design truth.

---

# 12. MODEL → CODE SKELETON

If used, generated code is candidate scaffold requiring review.

---

# 13. REFACTORING PROVIDER

Support safe transformations/preview where toolchain permits.

---

# 14. BEHAVIOR PRESERVATION

Run relevant regression before accepting refactor.

---

# 15. DIFF VIEW

Show:

- code change;
- test change;
- model/design impact where known.

---

# 16. CODE REVIEW TOOL

Allow comments/findings linked to lines/entities.

---

# 17. BUILD/DEPENDENCY TOOLING

If actual scope includes:

- package metadata;
- lockfile;
- dependency graph;
- reproducible environment.

---

# 18. GIT/PR TOOLING

If actual course includes, expose conceptually safe repository workflow.

Do not perform privileged repo actions without authorization.

---

# 19. CI PIPELINE

If actual scope includes, simulate/inspect:

build → test → quality gates → artifact.

Production release remains shared.

---

# 20. AI TUTOR MODES

`RESPONSIBILITY_COACH`

`CONTRACT_COACH`

`COLLABORATION_COACH`

`DESIGN_ALTERNATIVE_COACH`

`SMELL_REVIEW_COACH`

`REFACTOR_COACH`

`TEST_DESIGN_COACH`

`CODE_REVIEW_COACH`.

---

# 21. AI GROUNDING

Canonical requirements + design model + code + tests + learner task + allowed hints.

---

# 22. AI PATTERN SAFETY

AI must not prescribe a pattern merely because keyword matches.

---

# 23. AI REFACTOR

Must explain intended improvement and preserve behavior.

---

# 24. AI TEST GENERATION

Generated tests are candidates.

They must not replace hidden official tests or mastery authority.

---

# 25. AI CODE GENERATION

Generated code:

- marked as AI candidate;
- runnable/testable;
- subject to same rubric;
- no hidden solution leakage.

---

# 26. AI REVIEW

Distinguish:

- correctness;
- design;
- style;
- security;
- uncertainty.

---

# 27. AI HIDDEN TEST

No access.

---

# 28. AI OFFICIAL GRADING

Forbidden by default.

---

# 29. TOOL FAILURE

Subject still has canonical lessons/manual reasoning path.

---

# 30. RESOURCE LIMITS

Code/test/static analysis bounded.

---

# 31. SECURITY

No arbitrary filesystem/network/secrets access from learner tooling.

---

# 32. MULTI-TAB

Runs/reviews isolated.

---

# 33. STALE RESULT

Old test/static-analysis result cannot overwrite newer source revision.

---

# 34. OBSERVABILITY

Track:

- run failure;
- static-analysis failure;
- refactor failure;
- model-render failure;
- AI failure;
- stale result.

---

# 35. DELIVERABLES

Create:

`OOPSE_TOOL_PROVIDER_MAP.md`

`OOPSE_TEST_RUNNER_CONTRACT.md`

`OOPSE_STATIC_ANALYSIS_CONTRACT.md`

`OOPSE_DEPENDENCY_GRAPH_CONTRACT.md`

`OOPSE_MODEL_RENDERING_CONTRACT.md`

`OOPSE_REFACTORING_TOOL_CONTRACT.md`

`OOPSE_CODE_REVIEW_CONTRACT.md`

`OOPSE_AI_TUTOR_CONTRACT.md`

`OOPSE_SECURITY_RESOURCE_BOUNDARY.md`

`OOPSE05_INPUT_CONTRACT.md`.

---

# 36. GOLDEN FIXTURES

At minimum, as supported:

- valid alternate design;
- inheritance misuse;
- cyclic dependency;
- brittle test;
- behavior-preserving refactor;
- refactor regression;
- AI pattern overprescription refusal;
- stale test result quarantine.

---

# 37. PASS

PASS when tools provide evidence while canonical design remains independent from linter/diagram/AI output.

---

# 38. FINAL PRINCIPLE

**TOOLS MAY MEASURE, RENDER, RUN AND SUGGEST. THEY DO NOT OWN THE DESIGN.**
