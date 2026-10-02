# OOPSE02 — ACADEMIC BLUEPRINT & CANONICAL SOFTWARE DESIGN MODEL
## Requirements · Responsibility · Contracts · Collaboration · Architecture · Quality

Mode:

`RESPONSIBILITY-FIRST · CONTRACT-FIRST · CANONICAL-OWNER · CHANGE-AWARE`

---

# 0. ENTRY

Requires OOPSE01 evidence.

---

# 1. MISSION

Define one canonical software-design/engineering ontology for the actual Bauman/repository scope.

Lessons, graders, diagrams, code tools, AI and authoring must consume this model.

---

# 2. OUTCOME FAMILIES

Learner should be able to:

- interpret requirements;
- model domain concepts;
- allocate responsibilities;
- define contracts;
- choose collaborations;
- design object/component boundaries;
- justify composition/inheritance;
- manage dependencies;
- implement;
- test;
- detect smells;
- refactor safely;
- review code/design;
- communicate architecture;
- reason about change impact.

---

# 3. CANONICAL ENTITIES

At minimum:

`Requirement`

`UseCaseOrScenario`

`DomainConcept`

`Responsibility`

`ObjectRole`

`ClassOrType`

`InterfaceContract`

`MethodContract`

`Invariant`

`Collaboration`

`Dependency`

`Component`

`Module`

`BehaviorModel`

`StateModel`

`DesignDecision`

`DesignAlternative`

`DesignSmell`

`Refactoring`

`TestCase`

`TestSuite`

`ReviewFinding`

`QualityAttribute`

`ArchitectureDecision`

`ImplementationExample`

`ProjectArtifact`

`Misconception`

`Remediation`.

---

# 4. REQUIREMENT IDENTITY

Design decisions reference stable requirements/scenarios.

---

# 5. RESPONSIBILITY

Responsibilities precede class names.

Avoid designing around nouns only.

---

# 6. ABSTRACTION

Canonical concept represents essential behavior/contract, not implementation detail.

---

# 7. ENCAPSULATION

Define protected invariants and boundary of responsibility.

Not simply “make fields private”.

---

# 8. INTERFACE / CONTRACT

Represent:

- inputs;
- outputs;
- preconditions;
- postconditions;
- errors/exceptions;
- side effects;
- invariants.

---

# 9. COLLABORATION

Who calls whom and why.

---

# 10. DEPENDENCY DIRECTION

Explicit.

High-level policy vs low-level detail as relevant.

---

# 11. COMPOSITION

Object contains/uses another role.

Do not treat as universal cure.

---

# 12. INHERITANCE

Use only when semantic substitutability/variation supports.

---

# 13. POLYMORPHISM

Behavioral substitution via interface/contract.

Not “same method name = polymorphism” universally.

---

# 14. SUBSTITUTABILITY

If LSP is in scope, represent behavioral contract.

---

# 15. COHESION

Responsibility focus/contextual quality.

---

# 16. COUPLING

Dependency strength/direction/change impact.

---

# 17. MUTABILITY

Object/state mutation semantics explicit where relevant.

---

# 18. VALUE VS IDENTITY

If course scope supports, distinguish.

---

# 19. DOMAIN MODEL

Represents domain semantics, not DB table mirror by default.

---

# 20. BEHAVIOR MODEL

Possible:

- sequence/collaboration;
- state transition;
- activity/workflow.

Only actual scope.

---

# 21. STATE MODEL

State + transition + event + guard/action where relevant.

---

# 22. UML VIEW

UML is a representation/view.

Canonical design entities remain underlying structured model where possible.

---

# 23. CLASS DIAGRAM

Relationships have semantics:

- association;
- dependency;
- generalization;
- aggregation/composition only if course uses them correctly.

---

# 24. SEQUENCE DIAGRAM

Interaction/order/lifeline message semantics.

---

# 25. COMPONENT/MODULE MODEL

If scope includes architecture, define provided/required interfaces and dependencies.

---

# 26. SOLID

If supported, principles are contextual heuristics/constraints, not absolute scoring checklist.

---

# 27. DESIGN PATTERN

Pattern entity includes:

- problem/context;
- forces;
- structure;
- consequences;
- alternatives;
- misuse.

---

# 28. PATTERN NAME ≠ DESIGN QUALITY

Explicit invariant.

---

# 29. DESIGN DECISION

Record:

- context;
- options;
- chosen option;
- rationale;
- consequences.

---

# 30. QUALITY ATTRIBUTES

Potential:

- maintainability;
- testability;
- extensibility;
- performance;
- reliability;
- security.

Only use actual scope/requirements.

---

# 31. CHANGE SCENARIO

Evaluate design by likely change.

---

# 32. CODE SMELL

Smell is evidence for review, not automatic defect.

---

# 33. REFACTORING

Refactoring has:

- precondition;
- transformation;
- behavior-preservation expectation;
- expected design benefit;
- regression evidence.

---

# 34. TEST MODEL

Tests reference behavior/contracts/requirements.

---

# 35. UNIT TEST

Scope of one unit/module contract.

---

# 36. INTEGRATION TEST

Interaction across boundaries.

---

# 37. TEST DOUBLE

Mock/stub/fake distinctions only if actual course scope.

Overuse risk explicit.

---

# 38. COVERAGE

Coverage is evidence of execution, not correctness.

---

# 39. MUTATION TESTING

If in scope, mutation score is not universal quality.

---

# 40. CODE REVIEW

Review finding can target:

- correctness;
- design;
- readability;
- testability;
- security;
- maintainability.

---

# 41. STATIC ANALYSIS

Tool findings remain evidence, not canonical truth.

---

# 42. VERSION CONTROL

If in scope:

commit/branch/merge/PR concepts attach to engineering workflow.

---

# 43. CI/CD

If in scope:

build/test/quality gates/artifact pipeline concepts.

Production release mechanics remain global.

---

# 44. TRACEABILITY

Requirement → design → code → test → evidence.

---

# 45. MULTIPLE VALID DESIGNS

Canonical assessment must support alternatives satisfying requirements/contracts.

---

# 46. PYTHON BOUNDARY

Python syntax/object model specifics reference Python owner.

OOPSE owns design reasoning independent from one language.

---

# 47. LIFECYCLE BOUNDARY

Process models/organizational lifecycle beyond development practice belong downstream Lifecycle subject.

---

# 48. PROJECT MANAGEMENT BOUNDARY

Budget/schedule/resource planning belongs Project Management.

---

# 49. PROVENANCE

Design principles/pattern claims/examples have source/review provenance.

---

# 50. DELIVERABLES

Create:

`subjects/oop-software-engineering/docs/oopse02/OOPSE_ACADEMIC_BLUEPRINT.md`

`OOPSE_COMPETENCY_GRAPH.json`

`OOPSE_PREREQUISITE_GRAPH.json`

`OOPSE_CANONICAL_ENTITY_SCHEMA.json`

`OOPSE_RESPONSIBILITY_CONTRACT.md`

`OOPSE_INTERFACE_CONTRACT_MODEL.md`

`OOPSE_COLLABORATION_DEPENDENCY_CONTRACT.md`

`OOPSE_DESIGN_DECISION_PATTERN_CONTRACT.md`

`OOPSE_TEST_REFACTOR_CONTRACT.md`

`OOPSE_TRACEABILITY_CONTRACT.md`

`OOPSE03_INPUT_CONTRACT.md`.

---

# 51. PASS

PASS when one canonical model can represent requirements, responsibilities, interfaces, dependencies, design alternatives, tests, refactorings and quality evidence without duplicating tool/UI truth.

---

# 52. FINAL PRINCIPLE

**A GOOD OOP MODEL EXPLAINS WHO IS RESPONSIBLE FOR WHAT, UNDER WHICH CONTRACT, AND HOW CHANGE PROPAGATES.**
