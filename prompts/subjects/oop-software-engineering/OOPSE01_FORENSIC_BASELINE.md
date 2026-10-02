# OOPSE01 — FORENSIC BASELINE
## Audit current OOP and Software Engineering reality before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

---

# 0. MISSION

Determine exactly what OOP, design, software-engineering, testing, tooling and project-learning content already exists.

Do not infer the exact Bauman syllabus from course titles alone.

---

# 1. DISCOVERY

Search actual repository for:

- OOP lessons;
- class/object examples;
- UML;
- domain models;
- design patterns;
- architecture examples;
- Python OOP;
- testing;
- refactoring;
- Git;
- CI/CD;
- code review;
- build/dependency content;
- projects;
- authoring;
- legacy modules.

---

# 2. CONTENT INVENTORY

Record:

- lesson/unit;
- concept;
- source;
- code examples;
- diagrams;
- tasks;
- assessments;
- dependencies.

---

# 3. OOP FUNDAMENTALS AUDIT

Inspect actual treatment of:

- abstraction;
- encapsulation;
- inheritance;
- composition;
- polymorphism;
- interfaces/protocols;
- object identity/state.

Do not assume all are taught separately.

---

# 4. RESPONSIBILITY AUDIT

Check whether content asks:

- which object owns what responsibility;
- who collaborates;
- where behavior belongs.

Flag “classes as bags of fields”.

---

# 5. DOMAIN MODEL AUDIT

Find:

- domain entities;
- value objects;
- services;
- aggregate-like concepts if present.

Do not import DDD terminology unless actual scope uses it.

---

# 6. UML/MODELING AUDIT

Find:

- class;
- sequence;
- state;
- activity/use-case/component diagrams.

Record whether diagrams are canonical data or hand-drawn media.

---

# 7. REQUIREMENTS TRACEABILITY AUDIT

Check whether tasks connect requirements/use cases to design/code/tests.

---

# 8. COUPLING/COHESION AUDIT

Identify current definitions/examples.

---

# 9. SOLID AUDIT

If present, inspect whether principles are taught with context/counterexamples instead of slogans.

---

# 10. DESIGN PATTERN AUDIT

If present, inventory patterns.

Flag pattern-name memorization or forced pattern use.

---

# 11. ARCHITECTURE AUDIT

Find:

- layers;
- modules;
- ports/adapters;
- MVC/MVVM;
- service architecture;
- event-driven structures;
- other actual patterns.

Do not assume course scope.

---

# 12. TESTING AUDIT

Inventory:

- unit;
- integration;
- end-to-end;
- test doubles;
- fixtures;
- property tests;
- mutation testing if any.

---

# 13. TEST QUALITY AUDIT

Look for:

- brittle private-method tests;
- overmocking;
- happy-path only;
- no negative/error cases;
- flaky tests.

---

# 14. REFACTORING AUDIT

Find:

- rename/extract/move;
- decomposition;
- duplicate code removal;
- behavior preservation;
- design-smell remediation.

---

# 15. CODE SMELL AUDIT

Record actual smell taxonomy if present.

Do not impose a particular catalog.

---

# 16. STATIC ANALYSIS AUDIT

Find:

- lint;
- type checker;
- complexity metrics;
- dependency rules;
- security scanners.

---

# 17. VERSION CONTROL AUDIT

If taught, inspect:

- commits;
- branches;
- merge;
- PR/review;
- conflict resolution.

---

# 18. CI/CD AUDIT

If present:

- build;
- test;
- quality gates;
- artifact;
- deploy concepts.

Generic production release remains global.

---

# 19. BUILD/DEPENDENCY AUDIT

Find:

- package manager;
- lockfile;
- environment;
- dependency management;
- reproducible setup.

---

# 20. DOCUMENTATION AUDIT

Find:

- API docs;
- README;
- ADRs;
- diagrams;
- comments.

---

# 21. PROJECT AUDIT

Inspect actual software projects/capstones and evidence required.

---

# 22. PYTHON BOUNDARY AUDIT

Separate Python-language teaching from design reasoning.

---

# 23. LIFECYCLE BOUNDARY AUDIT

Identify process/lifecycle material that belongs to downstream Lifecycle subject.

---

# 24. PROJECT-MANAGEMENT BOUNDARY AUDIT

Separate engineering design from scheduling/budget/team management.

---

# 25. ASSESSMENT AUDIT

Classify:

- concept quiz;
- class design;
- UML;
- code implementation;
- code review;
- refactor;
- testing;
- design explanation;
- project.

---

# 26. GRADER AUDIT

Determine whether grading over-relies on:

- exact class names;
- exact inheritance tree;
- source-string matching;
- one pattern;
- one reference design.

---

# 27. MULTIPLE VALID DESIGN AUDIT

Check whether rubric can accept alternate sound designs.

---

# 28. TOOL/RUNTIME AUDIT

Map:

- Python runner;
- static analysis;
- test runner;
- diagram renderer;
- dependency graph;
- Git integration.

---

# 29. AI AUDIT

Check if AI:

- generates full solution immediately;
- claims pattern superiority;
- rewrites code without explanation;
- writes mastery;
- leaks hidden tests.

---

# 30. AUTHORING AUDIT

Find how authors create:

- design tasks;
- code tasks;
- tests;
- review tasks;
- diagrams;
- project rubrics.

---

# 31. UX AUDIT

Inspect:

- code editor;
- model viewer;
- diff;
- test results;
- diagrams;
- mobile;
- accessibility.

---

# 32. LEGACY / DUPLICATE OWNER

Classify:

`KEEP`
`MIGRATE`
`RETIRE`
`UNKNOWN`.

Find duplicate:

- code runner;
- test runner;
- model registry;
- diagram parser;
- static-analysis service;
- grading logic.

---

# 33. RISK REGISTER

At minimum:

- inheritance overuse;
- exact-reference-design grader;
- brittle tests;
- duplicate tooling;
- AI design authority leak;
- hidden-test leak;
- Python/OOP owner conflict;
- stale diagrams vs code;
- unsafe execution.

---

# 34. DELIVERABLES

Create:

`subjects/oop-software-engineering/docs/oopse01/OOPSE01_EXECUTIVE_SUMMARY.md`

`OOPSE01_REPOSITORY_MAP.md`

`OOPSE01_CONTENT_INVENTORY.json`

`OOPSE01_MODEL_CODE_TOOLING_INVENTORY.json`

`OOPSE01_ASSESSMENT_GRADER_AUDIT.md`

`OOPSE01_ADJACENT_SUBJECT_BOUNDARY_MAP.md`

`OOPSE01_DUPLICATE_OWNER_MAP.md`

`OOPSE01_LEGACY_REGISTER.json`

`OOPSE01_RISK_REGISTER.json`

`OOPSE02_INPUT_CONTRACT.md`.

---

# 35. PASS

PASS only when actual OOP/design/testing/tooling/assessment scope is evidenced enough for OOPSE02 without guessing.

---

# 36. FINAL PRINCIPLE

**AUDIT THE DESIGN PRACTICE, NOT JUST THE NUMBER OF CLASS DIAGRAMS.**
