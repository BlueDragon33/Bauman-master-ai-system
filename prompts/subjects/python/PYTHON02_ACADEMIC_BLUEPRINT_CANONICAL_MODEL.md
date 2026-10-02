# PYTHON02 — ACADEMIC BLUEPRINT & CANONICAL PROGRAMMING MODEL
## Curriculum · Competency · Prerequisite graph · Python truth model · Content-as-data

Mode:

`EVIDENCE-BASED · RUNTIME-AWARE · CONCEPT-FIRST · TRANSFER-ORIENTED · VERSION-AWARE`

---

# 0. ENTRY GATE

Requires PYTHON01 evidence.

Candidate maps in this prompt are not canonical until reconciled with the actual repository and target program.

---

# 1. MISSION

Create the canonical academic model for Python so all later modules share one truth about:

- what is taught;
- why it is taught;
- prerequisites;
- what Python construct means;
- which runtime/version assumptions apply;
- what evidence can demonstrate competence.

---

# 2. OUTCOME MODEL

A strong Python learner should progressively demonstrate:

- reading code;
- predicting execution;
- writing small programs;
- decomposing problems;
- using functions/modules;
- managing data/state safely;
- handling errors;
- debugging;
- testing;
- building reusable components/classes where appropriate;
- working with files/data;
- using Python tooling reproducibly;
- transferring skills into scientific/engineering workflows.

---

# 3. COMPETENCY FAMILIES

Candidate families:

1. Syntax & expression fluency.
2. Data model & type reasoning.
3. Control flow.
4. Function decomposition.
5. Collections & iteration.
6. Mutation/reference/state reasoning.
7. Exceptions & error handling.
8. Modules/imports.
9. Files/data interchange.
10. Iterators/generators/comprehensions.
11. Object-oriented design basics.
12. Type hints/dataclasses where appropriate.
13. Testing/debugging.
14. Environment/package/tooling literacy.
15. Data/scientific Python bridge where target needs it.
16. Project integration/transfer.

Reconcile with PYTHON01 and target curriculum.

---

# 4. STAGE MODEL

Do not hard-code exact stage names before audit.

A candidate progression may be:

`FOUNDATION`
→ `CORE PROGRAMMING`
→ `STRUCTURED PROGRAM DESIGN`
→ `ROBUSTNESS / DEBUGGING / TESTING`
→ `PYTHON ECOSYSTEM / DATA`
→ `ENGINEERING PROJECT TRANSFER`.

---

# 5. PREREQUISITE GRAPH

Prerequisites must be explicit, not just lesson order.

Examples:

- boolean logic → conditionals;
- iteration → comprehensions;
- functions → higher-order callbacks/decorators if used;
- references/mutation → class/object state;
- functions/modules → testing/imports;
- collections/files → pandas/dataframes;
- exceptions → robust file/API handling.

Cycles are invalid unless intentionally co-taught and documented.

---

# 6. CANONICAL ENTITY MODEL

Possible Python-specific entities:

`PYTHON_CONCEPT`

`LANGUAGE_CONSTRUCT`

`SYNTAX_FORM`

`SEMANTIC_RULE`

`RUNTIME_BEHAVIOR`

`TYPE_BEHAVIOR`

`EXCEPTION_PATTERN`

`CODE_EXAMPLE`

`COUNTEREXAMPLE`

`BUG_PATTERN`

`CODING_TASK`

`TEST_CASE`

`PROJECT_TASK`

`TOOL_CONCEPT`

`PACKAGE_CONCEPT`.

Use C1/C4 canonical schema principles.

---

# 7. LANGUAGE CONSTRUCT CONTRACT

Each significant construct should define, where applicable:

- stable ID;
- name;
- purpose;
- syntax form;
- semantic meaning;
- runtime behavior;
- prerequisites;
- common errors;
- examples;
- counterexamples;
- assessment hooks;
- version notes;
- provenance/authority.

---

# 8. SYNTAX ≠ SEMANTICS

Do not teach syntax as if syntax alone were competence.

Example:

`x = y`

requires understanding name binding/reference semantics appropriate to the level, not just “assign y to x”.

---

# 9. TYPE MODEL

Cover behavior actually needed for target curriculum:

- numeric types;
- bool;
- strings;
- None;
- sequences;
- mappings;
- sets;
- user-defined objects.

Explicitly model:

- mutability;
- hashability where relevant;
- identity vs equality;
- truthiness;
- conversion/coercion;
- indexing/slicing;
- iteration.

---

# 10. NUMERIC SEMANTICS

Teach/version-test relevant:

- integer arithmetic;
- `/` vs `//`;
- modulo;
- exponentiation;
- float approximation;
- comparison tolerance where domain requires;
- operator precedence.

Do not present floating point as exact real arithmetic.

---

# 11. STRING SEMANTICS

Include:

- Unicode text;
- indexing/slicing;
- immutability;
- formatting;
- encoding/decoding only when prerequisites exist.

---

# 12. COLLECTION SEMANTICS

Explicitly distinguish:

- list;
- tuple;
- dict;
- set;

with behavior, mutation, iteration and appropriate use cases.

Avoid “list = array” oversimplification where it causes wrong mental models.

---

# 13. NAME / SCOPE MODEL

Canonical explanation should support:

- local/global/nonlocal where appropriate;
- function scope;
- closure concepts if included;
- shadowing;
- lifetime/reachability at appropriate depth.

---

# 14. FUNCTION MODEL

Functions are not only syntax.

Teach:

- inputs/outputs;
- pure vs side-effecting behavior at appropriate level;
- parameters/arguments;
- defaults;
- return;
- decomposition;
- contracts;
- documentation;
- testability.

Version-sensitive parameter syntax only if target requires.

---

# 15. DEFAULT ARGUMENT SEMANTICS

Mutable default arguments must be explicitly handled as a canonical misconception/bug pattern if functions are taught.

---

# 16. CONTROL FLOW

Model:

- if/elif/else;
- for;
- while;
- break/continue;
- comprehensions only after iteration model;
- pattern matching only if supported target/version and justified.

---

# 17. ITERATOR MODEL

If curriculum reaches it, distinguish:

`ITERABLE`
from
`ITERATOR`
from
`GENERATOR`.

Teach exhaustion/state behavior.

---

# 18. EXCEPTION MODEL

Canonical concepts:

- exception vs logic error;
- raise;
- catch only what can be handled;
- finally/context management;
- error propagation;
- custom exceptions only when level warrants.

Avoid broad `except:` as default pattern.

---

# 19. MODULE / IMPORT MODEL

Teach:

- module namespace;
- import forms;
- package concept;
- import-time side effects;
- path/environment basics;
- relative imports only when needed.

Keep OS/package-manager theory bounded.

---

# 20. FILE / DATA MODEL

Include:

- paths;
- text/binary distinction at suitable level;
- context managers;
- encoding;
- CSV/JSON as data interchange;
- error handling.

Do not turn this into a database course.

---

# 21. OOP MODEL

Teach OOP only after functions/state/reference semantics are ready.

Core concepts may include:

- class vs instance;
- attributes;
- methods;
- constructor/initialization;
- encapsulation by convention;
- composition;
- inheritance only when justified;
- polymorphism/duck typing at appropriate level.

Avoid Java-style OOP assumptions imported blindly into Python.

---

# 22. DATACLASSES / TYPE HINTS

If target uses modern Python engineering:

- type hints are static metadata/tooling signals, not runtime enforcement by default;
- dataclasses reduce boilerplate but do not replace object-model understanding.

Version notes required when syntax varies.

---

# 23. STANDARD LIBRARY MODEL

Teach a curated subset based on program needs.

Candidate areas:

- pathlib;
- json/csv;
- math/statistics;
- random;
- collections;
- itertools;
- datetime;
- argparse;
- logging;
- unittest where relevant.

Do not turn curriculum into API memorization.

---

# 24. NUMPY / PANDAS BOUNDARY

If target requires data/scientific preparation:

Python may teach prerequisite operational fluency in:

- arrays/dataframes;
- vectorized operations;
- missing data basics;
- CSV/data loading;
- indexing/filtering;
- simple aggregation.

But mathematical/statistical/database truth remains with owning subjects.

Package behavior must be version-aware.

---

# 25. TOOLING LITERACY

Academic model may include concepts of:

- interpreter;
- REPL;
- script;
- notebook;
- environment;
- package;
- test;
- linter/formatter/type checker.

Tool commands themselves belong to runtime/tooling owner PYTHON04.

---

# 26. REPRODUCIBILITY COMPETENCY

Learner should understand that a program/project should run from a known state with known dependencies.

Notebook hidden state is not sufficient.

---

# 27. CODE QUALITY BOUNDARY

Code quality includes more than style:

- correctness;
- clarity;
- decomposition;
- robustness;
- tests;
- maintainability;
- appropriate complexity.

Formatter compliance alone is not mastery.

---

# 28. PROVENANCE / AUTHORITY

For Python language semantics prefer authoritative official docs/specification for the supported version.

For third-party packages prefer official package docs/versioned API.

Generated/AI content remains non-authoritative until reviewed under content governance.

---

# 29. VERSION-SENSITIVE CONTENT

Entities/examples should carry version context when behavior/syntax differs materially.

Examples may include:

- syntax introduced in newer versions;
- dict/order guarantees;
- typing syntax;
- package API changes.

Do not overspecify versions unless actual target requires.

---

# 30. EXAMPLE CONTRACT

A strong example should include:

- purpose;
- runnable code;
- expected behavior/output where relevant;
- explanation;
- edge case or limitation when important;
- no hidden dependency.

---

# 31. COUNTEREXAMPLE CONTRACT

Use counterexamples for misconceptions:

- mutable default;
- `is` vs `==`;
- modifying a list while iterating;
- catching every exception;
- shadowing built-ins;
- stale notebook state.

---

# 32. CODING TASK CONTRACT

Each task should define:

- competency;
- prompt;
- inputs;
- outputs/behavior;
- constraints;
- allowed support;
- public examples;
- hidden edge cases where appropriate;
- assessment mode;
- version/runtime;
- deterministic seed/environment if needed.

---

# 33. PROJECT CONTRACT

Projects should integrate multiple competencies and produce real artifacts.

Candidate progression:

- CLI utility;
- file/data processor;
- small modular package;
- testing/debugging project;
- data-analysis mini-project;
- engineering/research utility.

Actual projects must align with target program.

---

# 34. REAL OUTPUT

Examples of credible outputs:

- tested script;
- reusable module;
- CLI tool;
- data transformation notebook + reproducible script;
- small package/project;
- debug report;
- test suite.

---

# 35. CURRICULUM BOUNDARY WITH ALGORITHMS

Do not let Python absorb full Algorithms/DS theory.

Python can teach:

- using lists/dicts/sets;
- simple search/sort examples;
- implementation discipline.

Complexity proofs/advanced structures belong to Algorithms subject.

---

# 36. BOUNDARY WITH DATABASE

Python may teach reading CSV/JSON and later DB client basics as integration.

SQL schemas, normalization, transactions, indexes, query planning belong to Database subject.

---

# 37. BOUNDARY WITH AI/ML

Python may prepare:

- NumPy/Pandas;
- notebooks;
- functions/classes;
- package environment.

Model theory/training/evaluation belongs to AI/ML subject.

---

# 38. BOUNDARY WITH SYSTEMS

Python can expose:

- files;
- processes/subprocess at advanced integration level;
- sockets/API clients if needed.

OS/network theory remains external.

---

# 39. REQUIRED DELIVERABLES

Create evidence-backed:

- `PYTHON_CURRICULUM_BLUEPRINT.md`
- `PYTHON_COMPETENCY_GRAPH.json`
- `PYTHON_PREREQUISITE_GRAPH.json`
- `PYTHON_CANONICAL_ENTITY_MODEL.md`
- `PYTHON_VERSION_AUTHORITY_POLICY.md`
- `PYTHON_CONTENT_PROVENANCE_POLICY.md`
- `PYTHON_ADJACENT_SUBJECT_BOUNDARY.md`
- `PYTHON03_INPUT_CONTRACT.md`.

---

# 40. PASS CONDITIONS

PASS when:

1. curriculum reconciles PYTHON01 evidence;
2. competencies are explicit;
3. prerequisites are acyclic/coherent;
4. Python constructs have canonical semantics;
5. version policy is explicit;
6. examples/tasks are content-as-data compatible;
7. adjacent-subject boundaries are clear;
8. code/runtime/tool/AI authority boundaries are clear;
9. migration path exists for current content if schema changes;
10. PYTHON03 has stable input.

---

# 41. FAIL CONDITIONS

FAIL if:

- curriculum is generated from imagination only;
- syntax is treated as competence;
- package/tool output becomes language authority;
- version-sensitive behavior is presented as universal;
- Python absorbs Algorithms/DB/AI canonical ownership;
- no migration/provenance exists.

---

# 42. FINAL PRINCIPLE

**TEACH PYTHON AS A PROGRAMMING LANGUAGE AND ENGINEERING TOOL, NOT AS A LIST OF KEYWORDS.**
