# PYTHON01 — FORENSIC BASELINE
## Current reality before redesign

Mode:

`READ-FIRST · EVIDENCE-FIRST · NO-SPECULATIVE-REWRITE · TOKEN-EFFICIENT`

---

# 0. MISSION

Build a factual map of the current Python/programming subject before canonicalization.

PYTHON01 must answer:

- What Python content actually exists?
- Where does it live?
- Which runtime/execution engine exists?
- What interpreter/version/toolchain is actually used?
- Which code editors/labs/tests exist?
- Which state/progress stores exist?
- What is canonical, derived, duplicated, hard-coded or legacy?
- Which adjacent subjects are improperly embedded inside Python?

PYTHON01 is not a redesign phase.

---

# 1. FORBIDDEN DURING BASELINE

Do not:

- rewrite curriculum;
- generate hundreds of exercises;
- replace runtime;
- change mastery;
- redesign UI;
- migrate data;
- remove legacy paths before proving they are legacy.

Small audit instrumentation is allowed only when non-destructive and necessary.

---

# 2. REPOSITORY DISCOVERY

Locate actual:

- Python subject root;
- lesson/content files;
- exercise/test data;
- code-runner/runtime files;
- editor components;
- test execution API;
- progress/mastery integration;
- authoring/admin surfaces;
- PWA/offline packaging;
- docs/prompts/roadmaps.

Do not assume `subjects/python/` if repository proves another path.

---

# 3. CONTENT INVENTORY

Count/classify actual:

- stages/modules/lessons;
- concepts;
- examples;
- coding exercises;
- quizzes;
- code submissions;
- tests/fixtures;
- projects;
- datasets/files;
- videos/resources;
- generated/derived indexes.

Record source paths and ownership candidates.

---

# 4. CURRICULUM INVENTORY

Identify what currently covers:

- expressions/types;
- variables/names;
- strings;
- collections;
- control flow;
- functions;
- scope;
- modules/imports;
- exceptions;
- files;
- iterators/generators;
- comprehensions;
- classes/OOP;
- dataclasses/type hints;
- standard library;
- testing/debugging;
- packaging/venv;
- data handling/NumPy/Pandas if present;
- projects.

Do not infer mastery quality from lesson title alone.

---

# 5. PREREQUISITE AUDIT

Find whether content can be learned in a coherent dependency order.

Examples to inspect:

- function calls before functions are understood;
- list comprehensions before iteration;
- classes before functions/state/reference semantics;
- exceptions before call stack/basic control flow;
- pandas before collections/files/basic functions.

Record broken/missing prerequisites.

---

# 6. PYTHON VERSION AUDIT

Determine actual supported/used:

- Python interpreter version(s);
- browser runtime if any;
- server runtime if any;
- package manager;
- dependency files/lock mechanisms;
- notebook/runtime versions.

Record version-sensitive content risks.

Do not assume latest Python.

---

# 7. RUNTIME ENGINE AUDIT

Map all ways code can execute:

- server-side interpreter;
- browser interpreter;
- WebAssembly/Pyodide-style runtime if actually present;
- external API runner;
- local-only static simulation;
- no runner.

For each, record:

- owner;
- sandbox;
- resource limits;
- file/network access;
- stdout/stderr capture;
- input handling;
- timeout;
- persistence;
- security boundary.

---

# 8. MULTIPLE RUNNER AUDIT

If multiple runners exist, determine whether they:

- serve distinct valid use cases;
- duplicate responsibility;
- behave differently;
- use different Python/package versions;
- produce inconsistent evidence.

Do not merge/remove yet.

---

# 9. EDITOR / LAB AUDIT

Inspect:

- text editor;
- syntax highlighting;
- autocomplete;
- run button;
- test button;
- terminal/console;
- stdin UI;
- file workspace;
- notebook cells;
- debugger/trace viewer;
- variable inspector;
- error panel.

Record functionality, not aesthetics alone.

---

# 10. ASSESSMENT AUDIT

Determine actual assessment modes:

- multiple choice;
- output prediction;
- fill code;
- coding task;
- hidden tests;
- public tests;
- manual rubric;
- AI grading;
- final stdout equality.

Find false-confidence risks.

---

# 11. CODE-EQUIVALENCE AUDIT

Identify whether assessment wrongly assumes source-string equality.

Check whether semantically valid alternate code can pass.

Record:

- brittle exact source matches;
- stdout-only scoring;
- order-sensitive assertions where order should not matter;
- float equality errors;
- nondeterministic tests.

---

# 12. LEARNER-STATE AUDIT

Map:

- started/completed/passed/mastered;
- attempts;
- code submission history;
- first attempt;
- retries;
- hint usage;
- test outcomes;
- project artifacts;
- SRS/review if any.

Find UI render paths that mutate state incorrectly.

---

# 13. DEBUGGING AUDIT

Determine whether debugging is taught/evidenced or learners only receive final pass/fail.

Look for:

- stack trace explanation;
- hypothesis testing;
- variable inspection;
- trace reasoning;
- minimal reproduction;
- test construction.

---

# 14. ERROR TAXONOMY AUDIT

Inventory recognized errors/misconceptions, such as:

- SyntaxError/IndentationError;
- NameError;
- TypeError;
- ValueError;
- IndexError/KeyError;
- AttributeError;
- ImportError/ModuleNotFoundError;
- file/encoding errors;
- scope errors;
- mutation/aliasing;
- off-by-one;
- truthiness;
- None handling;
- iterator exhaustion;
- logic errors.

Do not force taxonomy if implementation has none; record gap.

---

# 15. NOTEBOOK STATE AUDIT

If notebooks/cells exist, test:

- out-of-order execution;
- hidden stale variables;
- restart/re-run reproducibility;
- duplicate side effects;
- non-reproducible output.

---

# 16. FILE / DATA AUDIT

Map supported:

- text files;
- CSV;
- JSON;
- paths;
- encodings;
- uploads/downloads;
- datasets;
- NumPy/Pandas if present.

Find unsafe filesystem assumptions.

---

# 17. PACKAGE / ENVIRONMENT AUDIT

Inspect:

- requirements/pyproject/lockfiles;
- package installation UI;
- venv/environment isolation;
- dependency caching;
- unsupported arbitrary installs.

Find reproducibility gaps.

---

# 18. AI AUDIT

Map any AI features:

- explanation;
- code generation;
- debugging;
- grading;
- code review;
- hints;
- project assistance.

Check whether AI currently bypasses:

- canonical content;
- hidden tests;
- mastery authority;
- sandbox/security;
- learner authorship.

---

# 19. ADJACENT-SUBJECT LEAKAGE

Identify content that actually belongs to:

- Algorithms & DS;
- Database/SQL;
- OS/Linux;
- Networks;
- AI/ML;
- Mathematics.

Classify:

`KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT`

or:

`ROUTE_TO_OTHER_SUBJECT`.

---

# 20. ARCHITECTURE AUDIT

Against C1, inspect:

- subject manifest;
- capability registry;
- content-as-data;
- code runner adapter;
- no-code lesson/task authoring;
- hard-coded subject routes;
- duplicate stores/services.

---

# 21. UI/UX AUDIT

Against C2, inspect:

- shared App Shell use;
- code editor responsiveness;
- mobile constraints;
- keyboard-only operation;
- screen-reader semantics;
- console/error visibility;
- long code overflow;
- touch controls;
- dark theme readability if supported.

---

# 22. QA AUDIT

Against C3, map current:

- unit tests;
- runtime tests;
- coding-task tests;
- browser E2E;
- sandbox/security tests;
- offline tests;
- migration tests;
- regressions.

Find untested high-risk paths.

---

# 23. LEARNING-OUTCOME AUDIT

Against C4, determine whether each major module has:

- competency;
- practice;
- evidence;
- assessment;
- mastery/remediation;
- transfer/project output.

Do not treat completed lesson count as learning proof.

---

# 24. LEGACY CLASSIFICATION

For each suspected old path classify:

`ACTIVE_CANONICAL`

`ACTIVE_DUPLICATE`

`DERIVED`

`LEGACY_SUPPORTED`

`DEAD_CANDIDATE`

`UNKNOWN`.

Unknown is not delete.

---

# 25. RISK REGISTER

At minimum classify risks:

- runtime inconsistency;
- insecure execution;
- data/state corruption;
- wrong scoring;
- content/version mismatch;
- brittle tests;
- AI overreach;
- notebook non-reproducibility;
- package/environment drift;
- mobile/accessibility blockers.

---

# 26. REQUIRED DELIVERABLES

Create only evidence-backed outputs such as:

- `PYTHON_CURRENT_ARCHITECTURE_MAP.md`
- `PYTHON_CONTENT_INVENTORY.json`
- `PYTHON_RUNTIME_TOOLCHAIN_INVENTORY.md`
- `PYTHON_ASSESSMENT_STATE_AUDIT.md`
- `PYTHON_LEGACY_DUPLICATE_MAP.md`
- `PYTHON_RISK_REGISTER.json`
- `PYTHON01_EVIDENCE_INDEX.md`
- `PYTHON02_INPUT_CONTRACT.md`.

---

# 27. PASS CONDITIONS

PYTHON01 PASS requires:

1. actual subject scope proven;
2. content inventory known;
3. runtime/toolchain proven;
4. assessment paths mapped;
5. state ownership mapped;
6. AI/tooling mapped;
7. platform/UI/QA/learning gaps mapped;
8. legacy/duplicate candidates classified;
9. major risks recorded;
10. PYTHON02 has evidence-backed input.

---

# 28. FAIL CONDITIONS

FAIL if the audit:

- assumes folder/version without evidence;
- redesigns before inventory;
- deletes suspected legacy;
- claims safety without runner/sandbox inspection;
- claims mastery quality from UI labels;
- ignores adjacent-subject leakage;
- produces generic recommendations with no source paths/evidence.

---

# 29. FINAL RESPONSE FORMAT

`PYTHON01 STATUS: PASS / FAIL / BLOCKED`

`Base SHA:`

`Actual subject path:`

`Interpreter/runtime:`

`Content inventory:`

`Assessment/state owners:`

`Critical risks:`

`Legacy/duplicate candidates:`

`PYTHON02 readiness: READY / NOT READY`

---

# 30. FINAL PRINCIPLE

**AUDIT THE PROGRAMMING SYSTEM THAT EXISTS, NOT THE PYTHON COURSE YOU IMAGINE.**