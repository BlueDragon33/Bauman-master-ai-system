# OOPSE06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`DESIGN-REGRESSION · TOOL-SKEPTICAL · MULTIPLE-VALID-SOLUTION-AWARE · NO-KNOWN-BLOCKER`

---

# 0. MISSION

Prove the integrated OOP Design & Software Engineering subject is academically sound, tool-safe, accessible and exact-RC ready.

---

# 1. GATES

`A CANONICAL DESIGN TRUTH`

`B REASONING/ASSESSMENT`

`C CODE/TEST/REFACTOR TOOLING`

`D MODEL/AI`

`E UX/A11Y/OFFLINE/PERFORMANCE`

`F LEGACY/RC`.

---

# 2. CANDIDATE IDENTITY

Freeze:

- SHA;
- content snapshot;
- subject pack;
- Python/tool versions;
- config;
- lockfile.

---

# 3. REQUIREMENT TRACEABILITY TESTS

Design/code/tests must map to required behaviors.

---

# 4. RESPONSIBILITY TESTS

Known misplaced-responsibility fixture detected when rubric targets it.

---

# 5. ENCAPSULATION TESTS

Invariant protection, not just access modifiers.

---

# 6. COMPOSITION/INHERITANCE TESTS

Known inheritance misuse vs valid polymorphism.

---

# 7. SUBSTITUTABILITY TESTS

If in scope, contract violation fixtures.

---

# 8. COUPLING/DEPENDENCY TESTS

Known unnecessary dependency/cycle fixtures.

---

# 9. MULTIPLE VALID DESIGN TESTS

Alternate valid designs pass.

---

# 10. EXACT-REFERENCE-DESIGN REGRESSION

Grader must not reject a sound design solely for class names/tree mismatch.

---

# 11. PATTERN MISUSE TESTS

If patterns taught:

forced/unnecessary pattern fixture should not score as automatically good.

---

# 12. DESIGN-SMELL TESTS

Only actual supported smell vocabulary.

---

# 13. REFACTORING TESTS

Before/after behavior preserved.

---

# 14. REFACTOR REGRESSION

Known behavior-changing refactor must fail.

---

# 15. UNIT TEST QUALITY

Known brittle private-detail tests distinguished from behavioral tests.

---

# 16. ERROR PATH TESTS

Negative/error behavior included.

---

# 17. OVERMOCKING TESTS

If in scope, known fixture.

---

# 18. COVERAGE MISUSE

100% coverage fixture with weak assertions should not be presented as correctness.

---

# 19. MUTATION TESTING

If in scope, validate tool semantics and limits.

---

# 20. STATIC ANALYSIS FALSE CERTAINTY

Clean lint/type output must not equal design PASS automatically.

---

# 21. DEPENDENCY GRAPH

Actual dependency data consistent with model view.

---

# 22. UML/MODEL RENDERING

Diagram agrees with canonical structured design.

---

# 23. MODEL/CODE DRIFT

If system claims synchronization, stale diagram/code mismatch must be detected.

---

# 24. AI TESTS

AI must:

- ask about requirements/responsibilities;
- avoid universal pattern prescriptions;
- preserve behavior in refactor advice;
- not fabricate tests passing;
- not reveal hidden tests;
- not write official mastery.

---

# 25. GENERATED CODE

AI-generated candidate must pass same tests/rubric.

---

# 26. CODE RUNTIME SECURITY

Shared Python sandbox boundaries hold.

---

# 27. HIDDEN TEST SECURITY

Protected tests unavailable to learner/AI/browser where required.

---

# 28. GIT/CI TOOLING

If in scope, verify simulated/connected operations stay within permissions and do not mutate production repos unexpectedly.

---

# 29. OFFLINE

Actual supported theory/model/code tooling matrix tested.

---

# 30. PERFORMANCE

Measure:

- subject startup;
- model render;
- code/test run;
- static analysis;
- dependency graph;
- diff;
- authoring list.

---

# 31. MEMORY

Repeated editor/model/test mounts do not grow unbounded.

---

# 32. RESPONSIVE

Model/code/test/review usable mobile/tablet/desktop.

---

# 33. ACCESSIBILITY

Diagram/diff/test-result alternatives tested.

---

# 34. AUTHORING ACCEPTANCE

Author creates:

- design task;
- code task;
- test task;
- refactor task;
- review task

without app-code edit for ordinary cases.

---

# 35. TEST-OF-TESTS

Known poor designs/weak tests fail relevant rubrics.

Known valid alternatives pass.

---

# 36. LEGACY INVENTORY

Resolve duplicate:

- code runner;
- test runner;
- diagram/model parser;
- grading logic;
- static-analysis service;
- old route;
- stale flag.

---

# 37. ADJACENT-OWNER GATE

No duplicate Python/Lifecycle/Project Management truth owner.

---

# 38. MIGRATION

If canonical IDs/design schema changed:

- aliases;
- content migration;
- learner evidence preservation;
- rollback.

---

# 39. PRODUCTION SMOKE PROFILE

Hand shared release procedure:

1. open OOPSE subject;
2. open one canonical design lesson;
3. inspect requirement/responsibility/contract;
4. open model/diagram;
5. run one safe code/test fixture;
6. verify one refactor/review view;
7. verify active subject pack/design revision;
8. verify Python/tool provider profile;
9. verify optional AI grounded/fallback;
10. offline cached lesson/fixture if supported.

No privileged repo mutation.

---

# 40. BLOCKERS

- exact-reference-design grader;
- known poor design accepted as canonical good due pattern name/tool score;
- alternate valid design rejected systematically;
- refactor changes required behavior unnoticed;
- hidden tests leak;
- runtime/tool escapes sandbox;
- AI claims false test/design authority;
- duplicate canonical design owner;
- migration corrupts learner evidence.

---

# 41. DELIVERABLES

Create:

`OOPSE_ACCEPTANCE_MATRIX.md`

`OOPSE_DESIGN_REGRESSION.json`

`OOPSE_MULTIPLE_VALID_DESIGN_REPORT.md`

`OOPSE_REFACTOR_BEHAVIOR_REPORT.md`

`OOPSE_TEST_QUALITY_REPORT.md`

`OOPSE_TOOLING_SECURITY_REPORT.md`

`OOPSE_AI_ACCEPTANCE_REPORT.md`

`OOPSE_ACCESSIBILITY_RESPONSIVE_REPORT.md`

`OOPSE_OFFLINE_PERFORMANCE_REPORT.md`

`OOPSE_LEGACY_CLOSURE_REPORT.md`

`OOPSE_RC_MANIFEST.json`

`OOPSE_PRODUCTION_SMOKE_PROFILE.md`

`OOPSE06_EVIDENCE_INDEX.md`.

---

# 42. PASS

PASS only when:

1. canonical design truth passes;
2. multiple valid designs pass;
3. poor-design fixtures fail appropriate rubrics;
4. refactoring preserves required behavior;
5. test-quality assessment passes;
6. tooling is evidence, not authority;
7. AI boundaries pass;
8. runtime/hidden-test security passes;
9. UX/a11y passes;
10. offline/performance acceptable;
11. authoring passes;
12. no duplicate canonical owner remains;
13. legacy/migration closure complete;
14. exact RC + production smoke ready.

---

# 43. FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST PROVE THAT REQUIREMENTS, DESIGN, CODE, TESTS AND REVIEW ALL TRACE TO THE SAME ENGINEERING INTENT.**
