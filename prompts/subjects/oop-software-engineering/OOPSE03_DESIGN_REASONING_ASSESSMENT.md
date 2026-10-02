# OOPSE03 — DESIGN REASONING · CODE DESIGN · REFACTORING · ASSESSMENT

Mode:

`MULTIPLE-VALID-DESIGN-AWARE · CONTRACT-BASED · CHANGE-SCENARIO-TESTED`

---

# 0. ENTRY

Requires OOPSE02.

---

# 1. REASONING LOOP

`Requirement`

→ `Domain/Scenario`

→ `Responsibility`

→ `Contract`

→ `Collaboration`

→ `Dependency`

→ `Design alternative`

→ `Implementation`

→ `Tests`

→ `Review`

→ `Refactor`

→ `Change impact`.

---

# 2. ASSESSMENT DIMENSIONS

Grade separately:

- requirement understanding;
- responsibility allocation;
- abstraction;
- interface/contract;
- collaboration;
- coupling/cohesion;
- composition/inheritance;
- behavior/state;
- implementation correctness;
- testability;
- maintainability;
- refactoring;
- trade-off explanation.

---

# 3. CLASS-COUNT GRADING FORBIDDEN

More/fewer classes is not automatically better.

---

# 4. EXACT REFERENCE DESIGN FORBIDDEN

Unless task explicitly requires a structure, grader must accept alternative valid designs.

---

# 5. REQUIREMENT COVERAGE

Every design must satisfy required behaviors.

---

# 6. RESPONSIBILITY PLACEMENT

Assess whether behavior lives near relevant information/invariant.

Avoid simplistic rule-only grading.

---

# 7. ENCAPSULATION ASSESSMENT

Check invariants/contracts, not just access modifiers.

---

# 8. COMPOSITION VS INHERITANCE

Learner justifies choice.

---

# 9. INHERITANCE MISUSE

Known invalid examples:

- reuse-only inheritance with broken substitutability;
- fragile base assumptions;
- deep unnecessary hierarchy.

Only use concepts supported by scope.

---

# 10. POLYMORPHISM

Assess variation through stable contract.

---

# 11. INTERFACE SEGREGATION

If in scope, detect clients depending on irrelevant methods.

---

# 12. DEPENDENCY INVERSION

If in scope, assess dependency direction/abstraction.

---

# 13. LSP

If in scope, assess behavior/pre/postcondition compatibility.

---

# 14. OCP

If in scope, treat as change-oriented principle, not “never modify code”.

---

# 15. SRP

If in scope, responsibility/reason-to-change reasoning, not “one method per class”.

---

# 16. DESIGN PATTERN ASSESSMENT

Grade:

- problem fit;
- consequences;
- alternative;
- misuse.

Do not grade pattern name alone.

---

# 17. STRATEGY-LIKE VARIATION

If actual course uses pattern catalog, accept structurally different but equivalent contract-based variation.

---

# 18. OBSERVER-LIKE EVENTING

If supported, assess subscription/lifecycle/coupling, not name.

---

# 19. FACTORY-LIKE CREATION

Assess creation dependency/context.

---

# 20. STATE-LIKE BEHAVIOR

Compare explicit state object vs state machine/table/conditional alternatives under requirements.

---

# 21. ARCHITECTURE ASSESSMENT

If in scope, evaluate:

- module boundaries;
- dependency direction;
- interfaces;
- quality attributes;
- change scenarios.

---

# 22. COUPLING/COHESION

Use scenarios/changes, not one numeric metric alone.

---

# 23. DESIGN SMELL ASSESSMENT

Smell identification must include:

- evidence;
- harm/context;
- proposed remediation;
- trade-off.

---

# 24. GOD OBJECT

Known fixture if scope supports.

---

# 25. FEATURE ENVY / DATA CLUMPS / LONG METHOD

Only include if actual smell vocabulary is taught.

---

# 26. REFACTORING ASSESSMENT

Learner must preserve behavior while improving structure.

---

# 27. REGRESSION BEFORE/AFTER

Tests should prove required behavior unchanged.

---

# 28. RENAME/EXTRACT/MOVE

If actual scope includes, treat as transformations with semantic constraints.

---

# 29. CODE REVIEW TASK

Learner reviews a diff and classifies issues.

---

# 30. REVIEW FALSE POSITIVE

Not every stylistic preference is a defect.

---

# 31. UNIT TEST ASSESSMENT

Test behavior/contracts.

Avoid testing private implementation details unnecessarily.

---

# 32. NEGATIVE/ERROR PATHS

Include invalid/error behavior.

---

# 33. TEST DOUBLE ASSESSMENT

If in scope, learner chooses when real/fake/mock is appropriate.

---

# 34. OVERMOCKING

Known fixture if scope supports.

---

# 35. COVERAGE INTERPRETATION

100% coverage does not imply correct tests.

---

# 36. MUTATION TESTING

If in scope, use as test-strength evidence, not target score dogma.

---

# 37. MULTIPLE VALID IMPLEMENTATIONS

Accept different code organization satisfying contracts and quality requirements.

---

# 38. PERFORMANCE TRADE-OFF

Design may trade clarity/extensibility/performance according requirement.

No universal winner.

---

# 39. SECURITY/RELIABILITY TRADE-OFF

Reference downstream domains where specialized.

---

# 40. ERROR TAXONOMY

`REQUIREMENT_MISREAD`

`RESPONSIBILITY_ERROR`

`ABSTRACTION_ERROR`

`CONTRACT_ERROR`

`ENCAPSULATION_ERROR`

`COUPLING_ERROR`

`COHESION_ERROR`

`INHERITANCE_MISUSE`

`POLYMORPHISM_ERROR`

`DEPENDENCY_DIRECTION_ERROR`

`PATTERN_MISUSE`

`STATE_BEHAVIOR_ERROR`

`TESTABILITY_ERROR`

`BRITTLE_TEST`

`OVERMOCKING`

`REFACTOR_REGRESSION`

`TRACEABILITY_GAP`

`TOOL_FALSE_CERTAINTY`.

---

# 41. PARTIAL CREDIT

Separate design quality from code syntax.

C4 owns global mastery aggregation.

---

# 42. HINT LADDER

H1 restate requirement/change scenario

H2 identify responsibility

H3 identify contract/collaboration

H4 inspect dependency/coupling

H5 suggest design alternative

H6 suggest test

H7 suggest refactor

H8 full example only when allowed.

---

# 43. TEST-OF-TESTS

Known poor designs must fail relevant criteria.

Known alternate valid designs must pass.

---

# 44. GOLDEN POOR-DESIGN LIBRARY

Potential fixtures depending on scope:

- God object;
- inheritance misuse;
- hidden dependency;
- duplicated responsibility;
- invalid state transition;
- brittle private-method tests;
- overmocking;
- pattern forced where simpler design works.

---

# 45. AI BOUNDARY

AI may coach design.

It cannot:

- declare one pattern universally best;
- substitute official grading;
- expose hidden tests;
- silently rewrite canonical requirements;
- write mastery.

---

# 46. DELIVERABLES

Create:

`OOPSE_DESIGN_REASONING_CONTRACT.md`

`OOPSE_ASSESSMENT_RUBRIC_CONTRACT.md`

`OOPSE_MULTIPLE_VALID_DESIGN_POLICY.md`

`OOPSE_REFACTORING_ASSESSMENT_CONTRACT.md`

`OOPSE_TEST_QUALITY_CONTRACT.md`

`OOPSE_ERROR_TAXONOMY.json`

`OOPSE_GOLDEN_VALID_DESIGNS.json`

`OOPSE_GOLDEN_POOR_DESIGNS.json`

`OOPSE04_INPUT_CONTRACT.md`.

---

# 47. PASS

PASS when grader can distinguish:

- correct code / poor design;
- sound design / coding bug;
- valid alternate design;
- behavior-preserving refactor;
- brittle vs meaningful tests;
- pattern fit vs pattern misuse.

---

# 48. FINAL PRINCIPLE

**GRADE THE REASONING BEHIND THE DESIGN, NOT ITS RESEMBLANCE TO ONE REFERENCE CLASS DIAGRAM.**
