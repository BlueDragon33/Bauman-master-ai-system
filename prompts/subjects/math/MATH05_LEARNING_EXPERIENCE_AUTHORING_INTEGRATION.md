# MATH05 — LEARNING EXPERIENCE · AUTHORING · SUBJECT INTEGRATION
## Turn the Math engines into a coherent product without forking the platform

Mode:

`SHARED-UI-FIRST · NO-CODE-FIRST · ACCESSIBLE-BY-DESIGN · CONTENT-AS-DATA · CAPABILITY-DRIVEN`

---

# 0. MISSION

Integrate Mathematics into the common Bauman learning platform so a learner can actually study, solve, reason, visualize, review and transfer knowledge across devices.

MATH05 does not build a second website framework for Math.

It consumes global C1/C2 systems and Math contracts from MATH02–MATH04.

---

# 1. CONSTITUTION ROUTING

Load:

- C1: Subject Factory, Lesson Factory, Import Center, No-code Admin Authoring, Content Lifecycle, Capability/Plugin, Offline, Security;
- C2: App Shell, Design System, Component/Layout/Slot contracts, responsive, accessibility, resource viewer, contextual UI;
- C3: UX/cross-feature/responsive/visual regression tests;
- C4: learning experience, content author UX, subject/lesson academic contract, evidence.

---

# 2. NO MATH PLATFORM FORK

Math may register subject capabilities/content blocks.

It may not create:

- a separate global navigation system;
- a separate notification system;
- a separate theme engine;
- a separate admin shell;
- a separate generic progress model.

Extend the platform through supported contracts.

---

# 3. MATH SUBJECT PACKAGE

Define subject metadata/capabilities conceptually:

- identity/title/icons;
- routes;
- curriculum source;
- supported learning blocks;
- Math input capability;
- evaluator capability;
- graph/geometry capability;
- AI capability;
- offline packs;
- authoring schemas;
- search/index metadata;
- localization.

Runtime should discover Math through manifest/registry rather than hard-coded global switch statements when architecture permits.

---

# 4. CORE LEARNER SURFACES

Math may require shared surfaces such as:

- Overview / Today;
- Roadmap / Curriculum;
- Concept / Reference Viewer;
- Lesson;
- Problem Workspace;
- Proof / Reasoning Workspace;
- Graph / Visualization Workspace;
- Review / Weakness / Error Notebook;
- Assessment;
- Project / Application;
- Search;
- AI Tutor.

Not every surface must be a separate route if a cleaner information architecture exists.

---

# 5. LESSON CONTRACT

A Math lesson should communicate:

- where learner is;
- target competency;
- prerequisite if missing;
- concept/definition/theorem;
- representation/example;
- guided reasoning;
- independent problem;
- feedback/remediation;
- evidence/next step.

Avoid a giant scroll of formulas followed by a quiz.

---

# 6. MATH CONTENT BLOCKS

Reusable blocks may include:

- DefinitionBlock;
- TheoremBlock;
- FormulaBlock;
- AssumptionBlock;
- ExampleBlock;
- CounterexampleBlock;
- WorkedProblemBlock;
- StepProblemBlock;
- ProofBlock;
- GraphBlock;
- GeometryBlock;
- MatrixBlock;
- DataTableBlock;
- ApplicationBlock;
- ErrorPatternBlock;
- Reflection/TransferBlock.

Names are conceptual; use shared component contracts rather than inventing arbitrary local CSS every time.

---

# 7. FORMULA UX

Requirements:

- readable inline/display math;
- stable baseline/line height;
- long-expression overflow handling;
- copy/select where practical;
- equation numbering/reference if needed;
- mobile reflow;
- no clipped integrals/matrices;
- dark/light/high-contrast compatibility;
- fallback when renderer fails.

---

# 8. MATH INPUT

Math input must support the response types actually required.

Potential controls:

- number;
- fraction;
- expression;
- equation;
- interval/set;
- vector;
- matrix;
- units;
- multi-step derivation;
- proof text/structured reasoning.

Do not force every learner to type raw LaTeX unless it is itself a competency.

---

# 9. MOBILE MATH INPUT

On phones/tablets:

- virtual keyboard must not obscure active input;
- common symbols should be reachable;
- matrices/long expressions need usable editing;
- zoom/scroll should not trap user;
- touch targets remain adequate.

Avoid desktop editor shrunk to mobile.

---

# 10. KEYBOARD / ACCESSIBILITY INPUT

All critical Math input flows need keyboard access.

Do not require drag-only or gesture-only answers.

Errors should be associated with the relevant field/step.

---

# 11. PROBLEM WORKSPACE

A multi-step workspace may provide:

- statement;
- givens/unknowns;
- scratch area;
- steps;
- hints;
- graph/tool panel;
- verification;
- feedback;
- attempt status.

Information hierarchy should keep the problem and current step prominent.

---

# 12. PROOF WORKSPACE

If proof tasks are in curriculum:

support:

- claim/subgoal;
- justification;
- reference to theorem/definition;
- free text where appropriate;
- structured step ordering;
- rubric feedback.

Do not present AI output as “proof verified” unless formal verification occurred.

---

# 13. GRAPH WORKSPACE

Provide:

- plot area;
- expression/parameter controls;
- axes/range;
- reset;
- accessible summary/values;
- error state;
- mobile gesture + keyboard alternative where feasible.

The graph should not dominate when the learning goal is symbolic reasoning.

---

# 14. ERROR NOTEBOOK / WEAKNESS UX

Present weaknesses as actionable learning signals:

- concept/error category;
- evidence source;
- example of issue;
- repair action;
- recheck status.

Do not shame or permanently label learner.

---

# 15. PROGRESS UX

Distinguish visibly where useful:

- completion;
- competency evidence;
- mastery/retention;
- pending review;
- unresolved prerequisite.

Avoid one decorative percentage that hides weakness.

---

# 16. TODAY / ADAPTIVE UX

Global planner may recommend Math tasks.

Math UI displays reason codes such as:

- due review;
- prerequisite gap;
- weak concept;
- current module;
- transfer practice.

Math UI does not maintain a second independent Today engine.

---

# 17. AI TUTOR UX

AI area should show:

- current coaching mode;
- relation to active problem/concept;
- streaming/cancel state;
- source/grounding when relevant;
- uncertainty;
- tool failure/degraded state.

Do not obscure learner work with an always-dominant chat panel.

---

# 18. LOADING / ERROR / EMPTY / OFFLINE STATES

Critical components need truthful states:

- formula renderer unavailable;
- evaluator failed;
- graph failed;
- AI unavailable;
- content missing;
- offline tool unavailable;
- attempt save pending/failed.

A transient toast alone is insufficient for critical errors.

---

# 19. AUTHORING PHILOSOPHY

Normal Math content maintenance should be no-code.

Authoring must edit domain entities, not arbitrary raw JSON as the default experience.

Code should be needed only for new behavior/capability/schema, not ordinary content.

---

# 20. AUTHORING ENTITY EDITORS

Specialized authoring may include:

- concept/definition;
- notation/formula;
- theorem;
- worked problem;
- problem template;
- solution path;
- misconception/remediation;
- assessment;
- graph/visualization config;
- application/project;
- source/provenance.

Reuse schema-driven editor architecture.

---

# 21. PROBLEM AUTHORING

Author should define:

- competency;
- prerequisites;
- prompt;
- variables/parameters;
- domain constraints;
- response type;
- solution/equivalence policy;
- hints;
- misconception mapping;
- validation fixtures.

Prevent publishing a problem with an unverified generated answer key.

---

# 22. PARAMETRIC PROBLEM AUTHORING

If variants are generated:

- parameter ranges;
- constraints;
- seed/reproducibility;
- degeneracy checks;
- expected answer derivation;
- sample preview;
- batch validation.

Do not generate infinite combinations blindly.

---

# 23. GRAPH AUTHORING

Author config should reference canonical expression/data.

Allow:

- bounds;
- labels;
- annotations;
- interaction mode;
- parameters;
- expected insights.

Do not store graph screenshot as canonical function truth.

---

# 24. CONTENT LIFECYCLE

Use shared lifecycle concept:

`DRAFT → VALIDATE → REVIEW → APPROVE → STAGE → ACTIVE → DEPRECATE/ROLLBACK`.

High-risk theorem/answer-key/evaluator changes require stronger review.

---

# 25. SEMANTIC DIFF

Review should highlight semantic changes such as:

- formula changed;
- assumption changed;
- answer policy changed;
- domain changed;
- theorem hypothesis changed;
- competency link changed.

Do not bury them in raw JSON diff.

---

# 26. IMPACT ANALYSIS

Changing a canonical formula/problem policy may affect:

- lessons;
- examples;
- assessments;
- mastery evidence;
- generated variants;
- graphs;
- AI grounding;
- historical attempts.

Authoring should surface blast radius.

---

# 27. IMPORT / EXPORT

Support only formats useful to actual workflow, potentially:

- JSON/content package;
- Markdown;
- LaTeX fragments;
- CSV for simple tabular banks;
- media/resources.

Imported formulas/problems must validate before activation.

Spreadsheet formula injection/file safety follows C1/C3 security rules.

---

# 28. SEARCH

Search may resolve:

- concept name;
- symbol;
- formula text;
- theorem;
- tags/domain;
- localized term;
- problem family.

Search returns canonical entities, not duplicated truth records.

---

# 29. RESPONSIVE RULE

Use shared responsive system.

Math-specific stress cases:

- matrices;
- aligned equations;
- proof tables;
- wide graphs;
- code snippets;
- multi-column derivations.

Do not solve each with ad hoc fixed width.

---

# 30. ACCESSIBILITY RULE

Target accessible learning rather than automated-score compliance only.

Critical checks:

- keyboard completion;
- focus management;
- semantic labels;
- non-color-only states;
- zoom/reflow;
- Math semantic text/MathML strategy where supported;
- graph alternative;
- drag alternative;
- screen-reader smoke.

Do not claim full WCAG conformance without an actual audit.

---

# 31. OFFLINE / PACKAGING

Math core content should be classifiable into packs.

Do not preload every heavy tool/library/content bank.

Offline pack may include:

- current curriculum/content;
- renderer;
- local evaluator;
- selected graph capability;
- due review state.

Remote AI/CAS may degrade honestly.

---

# 32. LEGACY INTEGRATION

Migrate old Math routes/components/data into shared subject contracts incrementally.

Do not rewrite everything at once.

Preserve learner IDs/state through alias/migration.

---

# 33. SECURITY

Authoring/learner surfaces must safely handle:

- LaTeX;
- expressions;
- HTML/Markdown;
- imported files;
- code snippets;
- URLs;
- AI output.

No hidden `eval` path.

---

# 34. REQUIRED OUTPUTS

Create/update:

- `MATH_SUBJECT_MANIFEST_CONTRACT.md`
- `MATH_LEARNER_SURFACE_MAP.md`
- `MATH_COMPONENT_CAPABILITY_MAP.md`
- `MATH_MATH_INPUT_CONTRACT.md`
- `MATH_AUTHORING_SCHEMA_CONTRACT.md`
- `MATH_CONTENT_LIFECYCLE_REVIEW_POLICY.md`
- `MATH_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `MATH_OFFLINE_PACKAGING_PROFILE.md`
- `MATH_LEGACY_INTEGRATION_PLAN.md`
- `MATH_P6_INPUT_CONTRACT.md`.

---

# 35. EXIT GATE

MATH05 PASS only if:

1. Math runs inside shared platform architecture;
2. learner surfaces are coherent;
3. formula/input/problem/graph UX contracts exist;
4. mobile Math input is usable;
5. keyboard/accessibility paths exist;
6. authoring supports normal content without code surgery;
7. semantic diff/impact analysis covers high-risk changes;
8. search/offline/package integration is defined;
9. legacy migration preserves state/content identity;
10. no second design system or platform fork is introduced;
11. representative desktop/tablet/mobile journeys pass.

At PASS:

`MATH PRODUCT INTEGRATION LOCKED`.