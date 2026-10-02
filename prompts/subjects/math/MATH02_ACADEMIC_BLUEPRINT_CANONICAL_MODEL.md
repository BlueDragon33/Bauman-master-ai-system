# MATH02 — ACADEMIC BLUEPRINT · COMPETENCY GRAPH · CANONICAL MATHEMATICAL MODEL
## Mathematics truth, curriculum and data ownership

Mode:

`ACADEMIC-FIRST · PREREQUISITE-AWARE · CONTENT-AS-DATA · ONE-FACT-ONE-OWNER`

---

# 0. MISSION

Transform the audited Math estate into a coherent academic system where every lesson/problem/tool can trace to:

`OUTCOME → COMPETENCY → CONCEPT → PREREQUISITE → LEARNING EXPERIENCE → EVIDENCE → TRANSFER`.

MATH02 owns mathematical content semantics.

It does not implement the final evaluator, graph engine or AI tutor.

---

# 1. CONSTITUTION ROUTING

Load relevant clauses from:

- C1: Content Engine, Subject Factory, Lesson Factory, schema/versioning/backward compatibility;
- C3: schema/content/migration tests;
- C4: academic structure, dual structure, competency graph, prerequisite graph, learning contract, provenance, authority.

C2 is loaded only when entity design directly constrains learner presentation/accessibility.

---

# 2. AUDIT-FIRST INPUT

Consume MATH01 evidence.

Do not replace valid existing content merely to fit a prettier taxonomy.

Workflow:

`AUDIT → NORMALIZE → DEFINE OWNER → LINK → VALIDATE → PILOT → SCALE`.

---

# 3. CANDIDATE DOMAIN MAP — NOT CANONICAL UNTIL VALIDATED

Potential Math families for a technical/Bauman pathway include:

- mathematical language / notation / sets / logic;
- algebra and equations;
- functions and graphs;
- trigonometry;
- analytic geometry;
- vectors;
- single-variable calculus;
- multivariable calculus;
- linear algebra;
- ordinary differential equations;
- discrete mathematics / combinatorics / graph theory where required;
- probability;
- mathematical statistics where Math owns it;
- numerical methods;
- optimization / operations research where Math owns it;
- engineering mathematical applications for signals/control/AI/CS.

MATH01 + target program evidence decides what belongs in Math versus another subject.

Do not force all candidate domains into one course.

---

# 4. CURRICULUM STRUCTURE

Use a layered structure rather than one flat lesson list:

`Stage / Track`
→ `Module`
→ `Unit`
→ `Micro-Lesson / Learning Contract`
→ `Practice / Performance`.

Each unit should declare:

- purpose;
- prerequisites;
- competencies;
- canonical concepts;
- representations;
- problem families;
- evidence;
- remediation links;
- applications/transfer.

---

# 5. COMPETENCY MODEL

Math competency is not one scalar “math level”.

Possible dimensions:

- conceptual understanding;
- symbolic fluency;
- procedural calculation;
- representation conversion;
- reasoning;
- proof/justification;
- problem solving;
- modeling/application;
- numerical/computational implementation;
- interpretation/communication;
- transfer.

A learner may calculate correctly while reasoning weakly.

The state model must preserve that distinction.

---

# 6. PREREQUISITE GRAPH

Create an explicit DAG where possible.

Examples:

- equation manipulation before many calculus techniques;
- function/domain before limit/derivative reasoning;
- vector concepts before eigen/application depth;
- derivative understanding before local optimization;
- probability foundations before statistical inference.

Avoid cycles created by vague “requires each other” links.

Cross-subject prerequisites should reference external competency/capability contracts rather than copy content.

---

# 7. CANONICAL ENTITY FAMILIES

At minimum consider canonical Math entities for:

1. Program Outcome
2. Competency
3. Skill
4. Concept
5. Definition
6. Notation / Symbol
7. Assumption / Domain Condition
8. Formula / Identity
9. Theorem
10. Lemma / Proposition
11. Proof Pattern / Reasoning Pattern
12. Representation
13. Example
14. Counterexample
15. Worked Problem
16. Problem Template / Family
17. Misconception / Error Pattern
18. Remediation Path
19. Application / Modeling Task
20. Assessment Specification
21. Resource / Media
22. Provenance Record
23. Unit / Lesson / Learning Contract.

Do not create an entity type merely because it sounds academically elegant.

Use actual reuse/ownership need.

---

# 8. ONE FACT · ONE OWNER · MANY USES

Canonical mathematical facts should not be copied inconsistently across lessons.

Examples:

- derivative definition;
- matrix multiplication rule;
- theorem assumptions;
- notation meaning;
- unit conversion;
- domain restriction.

Lessons/problems reference canonical IDs when practical.

Derived summaries/search indexes may duplicate for performance but must be regenerable.

---

# 9. STABLE ID RULE

IDs must be:

- stable;
- machine-readable;
- independent from UI title;
- independent from display language;
- immutable after learner state references them.

Renaming “Đạo hàm” to another title must not reset evidence.

---

# 10. DEFINITION CONTRACT

A mathematical definition should be able to express:

- concept ID;
- statement;
- symbols;
- universe/domain;
- assumptions;
- equivalent formulation(s) when validated;
- examples/non-examples;
- dependencies;
- provenance/authority.

Do not strip conditions to shorten UI.

---

# 11. NOTATION CONTRACT

Notation is contextual.

Track when relevant:

- symbol;
- meaning;
- scope;
- domain;
- convention;
- aliases/alternate notation;
- ambiguity.

The same symbol may mean different things in different domains.

UI must not treat glyph equality as semantic identity.

---

# 12. FORMULA / IDENTITY CONTRACT

A formula entity may require:

- canonical expression;
- variables;
- domain;
- assumptions;
- units/dimensions if applicable;
- exact/approximate status;
- equivalent forms;
- derivation/proof links;
- examples;
- invalid-use warnings.

A formula without assumptions is incomplete when assumptions materially affect truth.

---

# 13. THEOREM CONTRACT

Theorem-like content must preserve:

- hypotheses;
- conclusion;
- notation;
- scope;
- dependencies;
- proof/reference status;
- counterexample when hypotheses are removed if pedagogically useful.

Never let AI-generated theorem wording become canonical without validation.

---

# 14. REPRESENTATION MODEL

Math concepts can appear as:

- symbolic expression;
- equation/inequality;
- set/interval;
- graph;
- table;
- geometry;
- vector/matrix;
- verbal statement;
- algorithm/code;
- numerical approximation.

Representations are linked views of one concept, not competing truth owners.

---

# 15. EXACT VS APPROXIMATE

Canonical model must distinguish:

- exact value;
- rounded value;
- measured value;
- numerical approximation;
- asymptotic/estimated value.

Do not compare an exact symbolic task as if all decimal approximations are equivalent without tolerance policy.

---

# 16. DOMAIN / ASSUMPTION FIRST-CLASS DATA

Examples of conditions that may matter:

- denominator nonzero;
- square-root/log domain;
- matrix dimensions;
- invertibility;
- differentiability;
- continuity;
- convergence;
- parameter range;
- unit compatibility.

These must survive rendering, evaluation and AI explanation.

---

# 17. UNITS / DIMENSIONS

Where applied mathematics uses physical quantities:

represent:

- quantity;
- unit;
- dimension;
- conversion;
- expected precision.

A numerically correct dimensionally wrong result is not automatically correct.

Do not force units into pure-math problems where none exist.

---

# 18. EXAMPLE / COUNTEREXAMPLE

Examples should expose concept behavior.

Counterexamples should show:

- why an assumption matters;
- why a false generalization fails;
- boundary cases.

Avoid examples that are merely decorative substitutions.

---

# 19. WORKED PROBLEM CANONICAL MODEL

A worked problem references:

- concepts;
- prerequisites;
- problem family;
- givens;
- unknowns;
- assumptions;
- representation;
- strategy;
- steps;
- verification;
- alternative method if valuable;
- common mistakes;
- transfer variant.

MATH03 owns detailed step/evaluation semantics.

---

# 20. MISCONCEPTION / ERROR CORPUS

Canonical error patterns may include:

- conceptual misconception;
- invalid algebraic transformation;
- sign error;
- domain loss;
- extraneous root;
- incorrect theorem condition;
- unit mismatch;
- matrix-dimension error;
- graph interpretation error;
- numerical precision/rounding error;
- proof gap;
- problem-modeling error.

Each error should map to:

`cause hypothesis → prerequisite → remediation → recheck`.

---

# 21. CONTENT PROVENANCE / AUTHORITY

Classify sources such as:

`AUTHORITATIVE`

`CURATED`

`GENERATED_CANDIDATE`

`DERIVED`

`LEGACY`

`UNKNOWN`.

JSON validity does not make mathematical content authoritative.

For high-risk theorem/formula/answer-key content, stronger review is required.

---

# 22. CONTENT GRAPH

Edges may include:

- requires;
- defines;
- uses;
- proves;
- derives;
- represents;
- contrasts;
- exemplifies;
- generalizes;
- specializes;
- tests;
- remediates;
- applies-to;
- contained-in.

Validators should detect:

- dangling references;
- prerequisite cycles;
- theorem dependency gaps;
- assessment without taught competency;
- lesson without outcome/evidence;
- orphan canonical facts.

---

# 23. LOCALIZATION

Mathematical truth is language-independent where possible.

Display strings may support Vietnamese/Russian/English.

Do not clone canonical equations/theorems simply because UI language changes.

Terminology localization should reference the same concept ID.

---

# 24. SCHEMA VERSIONING

Separate:

`schemaVersion`

from:

`contentRevision`.

Learner UI does not need internal technical version labels.

---

# 25. MIGRATION

Any significant canonical migration needs:

- migration ID;
- from/to schema;
- aliases;
- affected entities;
- learner-state impact;
- validation;
- rollback/recovery.

Prefer idempotent migration.

Never reset learner history silently.

---

# 26. PILOT BEFORE SCALE

Before mass conversion/generation, validate a representative slice containing:

- one concept;
- one formula/theorem;
- one worked example;
- one multi-step problem;
- one graph/representation;
- one assessment;
- one remediation path.

Only scale after MATH03/MATH04 can consume it correctly.

---

# 27. REQUIRED OUTPUTS

Create/update:

- `MATH_ACADEMIC_BLUEPRINT.md`
- `MATH_COMPETENCY_GRAPH.json`
- `MATH_PREREQUISITE_GRAPH.json`
- `MATH_CANONICAL_ENTITY_SCHEMA.json`
- `MATH_CONTENT_OWNER_REGISTRY.json`
- `MATH_NOTATION_FORMULA_POLICY.md`
- `MATH_MISCONCEPTION_TAXONOMY.md`
- `MATH_CONTENT_GRAPH.json`
- `MATH_SCHEMA_MIGRATION_PLAN.md`
- `MATH_P3_INPUT_CONTRACT.md`.

Consolidate if fewer canonical artifacts are cleaner.

---

# 28. EXIT GATE

MATH02 PASS when:

1. validated curriculum scope exists;
2. outcomes/competencies are explicit;
3. prerequisite graph is coherent;
4. canonical mathematical entity owners are defined;
5. domain/assumption semantics are first-class;
6. notation/formula/theorem models are clear;
7. representation links are clear;
8. misconceptions/remediation links are modeled;
9. stable IDs/schema/versioning exist;
10. pilot content validates;
11. MATH03 can build reasoning/assessment without inventing a second truth model.

At PASS:

`MATH ACADEMIC FOUNDATION LOCKED`.
