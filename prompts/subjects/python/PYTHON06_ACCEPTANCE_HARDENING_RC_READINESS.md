# PYTHON06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS
## Python-specific regression · sandbox security · performance · migration · exact subject release handoff

Mode:

`WHOLE-SUBJECT · EDGE-CASE-FIRST · SECURITY-FIRST · REGRESSION-FIRST · EXACT-RC`

---

# 0. MISSION

Prove the integrated Python subject is trustworthy and ready to enter the shared production release procedure.

PYTHON06 does not create another generic release pipeline.

It produces:

- Python acceptance evidence;
- Python-specific hardening;
- Python legacy closure;
- exact RC readiness;
- production smoke profile.

---

# 1. ENTRY GATE

Requires stable implementation/evidence from PYTHON01–PYTHON05 and current main candidate identity.

---

# 2. ACCEPTANCE GATES

At minimum:

`A CURRICULUM / CONTENT`

`B LANGUAGE / RUNTIME TRUTH`

`C CODE REASONING / ASSESSMENT`

`D RUNTIME / SANDBOX`

`E TOOLCHAIN / DATA`

`F AI TUTOR`

`G UX / ACCESSIBILITY`

`H OFFLINE / PERFORMANCE / MIGRATION`

`I SECURITY`

`J LEGACY / RC`.

---

# 3. CANDIDATE IDENTITY

Every acceptance result binds to:

- source SHA;
- content snapshot;
- runtime/toolchain profile;
- dependency lock;
- config profile/environment.

No “latest”.

---

# 4. CURRICULUM ACCEPTANCE

Verify:

- prerequisite graph;
- required modules;
- adjacent-subject boundaries;
- no orphan critical competency;
- no accidental duplication.

---

# 5. CONTENT ACCEPTANCE

Sample/validate:

- syntax;
- semantics;
- examples;
- counterexamples;
- version notes;
- exercises;
- solutions;
- provenance.

---

# 6. PYTHON VERSION REGRESSION

All official tasks run on the declared supported runtime.

Version-sensitive examples are correct for that runtime.

---

# 7. CORE LANGUAGE EDGE MATRIX

Test representative behavior for:

- integer vs float division;
- modulo/sign cases;
- operator precedence;
- truthiness;
- None;
- identity vs equality;
- string Unicode;
- slicing boundaries;
- empty collections;
- dict/set behavior required by course;
- mutation/reference aliasing;
- shallow copy;
- nested collections.

---

# 8. FUNCTION EDGE MATRIX

Test:

- positional/keyword behavior used in curriculum;
- default args;
- mutable default bug;
- missing return/None;
- scope;
- recursion if taught;
- closure/late binding if taught.

---

# 9. CONTROL-FLOW EDGE MATRIX

Test:

- zero loop iterations;
- one iteration;
- off-by-one;
- break/continue;
- infinite loop timeout;
- mutation during iteration where relevant.

---

# 10. ITERATOR / GENERATOR EDGE MATRIX

If taught:

- exhaustion;
- one-shot generator;
- repeated iteration assumptions;
- lazy evaluation;
- StopIteration semantics at appropriate boundary.

---

# 11. EXCEPTION EDGE MATRIX

Test:

- correct exception class;
- uncaught exception;
- targeted handling;
- overly broad catches;
- finally/context cleanup;
- re-raise/custom only if taught.

---

# 12. FILE / ENCODING EDGE MATRIX

Test:

- missing file;
- empty file;
- Unicode/UTF-8;
- newline differences where relevant;
- invalid CSV/JSON;
- safe path handling;
- context-manager cleanup.

---

# 13. IMPORT / PACKAGE EDGE MATRIX

Test:

- missing module;
- package/environment mismatch;
- import path;
- version mismatch;
- stale notebook/kernel imports if applicable.

---

# 14. OOP EDGE MATRIX

If taught:

- instance vs class attributes;
- mutable shared class state pitfalls;
- method binding;
- inheritance/composition behavior required by curriculum;
- equality/representation only if taught.

---

# 15. ASSESSMENT ALTERNATE-SOLUTION MATRIX

Verify accepted valid implementations differ in:

- loop vs comprehension where both allowed;
- helper functions vs inline;
- equivalent control structures;
- alternate but correct decomposition.

Do not accidentally force canonical solution source.

---

# 16. WRONG-SOLUTION MATRIX

Verify graders reject representative wrong solutions:

- hard-coded sample output;
- handles only first case;
- off-by-one;
- wrong mutation semantics;
- swallows exception;
- returns wrong type;
- relies on stale global/notebook state.

---

# 17. TEST-OF-TESTS

For high-value coding tasks:

canonical solution PASS;
valid alternatives PASS;
known wrong solutions FAIL;
edge cases behave as intended.

---

# 18. FLAKINESS

Official grading must not depend on:

- random unseeded behavior;
- network;
- wall-clock race;
- package latest version;
- nondeterministic order unless specified.

---

# 19. NOTEBOOK REPRODUCIBILITY

For assessed notebooks:

restart/run-all from clean state must reproduce required behavior.

---

# 20. SANDBOX SECURITY MATRIX

Test untrusted code attempts:

- infinite loop;
- CPU abuse;
- memory abuse;
- output flood;
- path traversal;
- filesystem escape;
- environment secret read;
- network exfiltration;
- subprocess/shell;
- process spawning/fork where platform relevant;
- unsafe deserialization;
- runtime crash attempts.

Expected: contained according to contract.

---

# 21. HOST ISOLATION

Learner code must not obtain:

- production credentials;
- backend filesystem outside sandbox;
- other learner files;
- hidden tests/solutions;
- unrestricted internal network access.

---

# 22. DENIAL-OF-SERVICE REGRESSION

One learner run must not freeze/crash the whole platform.

---

# 23. TIMEOUT UX

Timeout is distinguishable from wrong answer and can recover for next run.

---

# 24. OUTPUT FLOOD UX

Large stdout is truncated/virtualized without browser crash.

---

# 25. MULTI-TAB / CONCURRENCY

Test:

- simultaneous runs;
- same draft in two tabs;
- double submit;
- late result;
- stale AI feedback.

No duplicate official attempt.

---

# 26. STATE PERSISTENCE

Test:

- autosave;
- reload;
- reconnect;
- official submit;
- retry history;
- first attempt immutability.

---

# 27. OFFLINE MATRIX

According to declared capability:

- lesson cache;
- saved code;
- local runtime if supported;
- package availability;
- offline test execution if supported;
- reconnect/sync.

Do not fail for unsupported offline execution if UI/contract clearly says unavailable.

---

# 28. RUNTIME DOWNLOAD / CACHE

If large interpreter/package assets exist:

- first load;
- cache;
- interrupted download;
- stale version;
- storage pressure;
- update.

---

# 29. PERFORMANCE

Measure representative:

- Python subject open;
- code editor ready;
- runtime initialization;
- first run;
- test run;
- large output;
- notebook load;
- data package import.

Use evidence-based budgets from platform/global QA.

---

# 30. MEMORY

Repeated runs/notebooks should not leak unbounded:

- workers;
- interpreters;
- event listeners;
- object URLs;
- AI streams.

---

# 31. DATA TOOLING

If NumPy/Pandas present, test representative:

- version identity;
- CSV load;
- missing values;
- shape/dtype/indexing;
- large-enough dataset performance;
- reproducibility.

---

# 32. AI TUTOR ACCEPTANCE

Test:

- canonical explanation grounding;
- trace/debug with actual error;
- hint ladder;
- code review distinction between bug/style;
- hidden-test protection;
- assessment support policy;
- provider outage fallback;
- prompt injection in code/comments.

---

# 33. AI MUST NOT EXECUTE PRIVILEGED CODE

Explicit security regression.

---

# 34. AI MUST NOT WRITE MASTERY

Direct/indirect attempts blocked.

---

# 35. UI / RESPONSIVE ACCEPTANCE

Critical journeys on:

- small mobile;
- large mobile;
- tablet;
- laptop;
- desktop.

Run/test/submit/editor/console remain usable.

---

# 36. KEYBOARD / ACCESSIBILITY

Verify:

- keyboard operation;
- focus;
- labels;
- error/status announcement;
- pass/fail not color-only;
- trace visualizer textual fallback if present.

---

# 37. AUTHORING ACCEPTANCE

Create a normal coding task without changing app source:

- prompt;
- starter code;
- tests;
- hints;
- runtime profile;
- preview;
- review/activation.

---

# 38. HIDDEN TEST SECURITY

Inspect browser bundle/network/source maps to ensure hidden tests/solutions are not exposed to learner client when architecture says server/private.

---

# 39. LEGACY INVENTORY

Before RC, classify/remove safely:

- old code runner;
- duplicate progress store;
- old editor;
- obsolete route;
- stale feature flag;
- insecure execution path;
- direct AI grading bypass;
- old content schema.

Do not remove supported migration/rollback path.

---

# 40. DUPLICATE OWNER GATE

There must be one active owner for:

- execution;
- assessment evidence;
- learner state;
- AI tutor contract;
- task authoring;
- subject manifest.

Duplicate independent writers block RC.

---

# 41. DEPENDENCY / SUPPLY-CHAIN

Audit Python/runtime-related frontend/server packages and interpreter assets:

- lock/pin;
- known vulnerabilities;
- unneeded dependencies;
- external CDN origin;
- package integrity where relevant.

---

# 42. MIGRATION

If content/state/runtime profiles changed:

verify:

- schema version;
- idempotency;
- old learner drafts/attempts;
- content IDs;
- environment IDs;
- rollback/forward compatibility.

---

# 43. RC FREEZE

Exact Python RC identity includes:

- source SHA;
- content snapshot;
- runtime profile/version;
- dependency lock;
- subject manifest;
- migration set;
- feature flags/config;
- acceptance evidence.

---

# 44. PRODUCTION SMOKE PROFILE

Handoff to shared release procedure should include at minimum:

1. Python subject route opens.
2. Representative lesson loads.
3. Code editor accepts/runs safe code.
4. Runtime identity matches RC.
5. Public test run works.
6. Isolated learner draft persists.
7. Official/practice assessment path does not duplicate submission.
8. AI Tutor works or degrades safely if enabled.
9. Sandbox prevents a safe security probe according to policy.
10. Offline/PWA behavior matches declared support.

Do not run destructive exploit tests on production.

---

# 45. REQUIRED DELIVERABLES

Create:

- `PYTHON06_ACCEPTANCE_MATRIX.md`
- `PYTHON_LANGUAGE_RUNTIME_REGRESSION.md`
- `PYTHON_ASSESSMENT_TEST_OF_TESTS_REPORT.md`
- `PYTHON_SANDBOX_SECURITY_REPORT.md`
- `PYTHON_OFFLINE_PERFORMANCE_REPORT.md`
- `PYTHON_AI_TUTOR_ACCEPTANCE.md`
- `PYTHON_UX_ACCESSIBILITY_ACCEPTANCE.md`
- `PYTHON_LEGACY_RETIREMENT_MAP.md`
- `PYTHON_RC_MANIFEST.json`
- `PYTHON_PRODUCTION_SMOKE_PROFILE.md`
- `PYTHON06_EVIDENCE_INDEX.md`.

---

# 46. BLOCKERS

RC blocked by any known:

- untrusted code escape/secret exposure;
- duplicate official submission;
- hidden-test leak;
- wrong runtime identity;
- broken canonical grader;
- unresolved duplicate state owner;
- stale notebook state accepted as official evidence;
- runtime that can hang/crash shared app without containment;
- inaccessible core lab on supported device;
- AI bypass of official authority.

---

# 47. PASS CONDITIONS

PASS when:

1. curriculum/content contracts pass;
2. supported runtime/version is explicit and works;
3. core language edge cases pass;
4. coding assessment accepts valid alternates;
5. known wrong implementations fail appropriately;
6. test-of-tests passes;
7. learner code sandbox is contained;
8. runtime resource limits/recovery work;
9. state/attempt idempotency passes;
10. notebook reproducibility policy works where used;
11. data tooling is reproducible where included;
12. AI Tutor is bounded/grounded;
13. responsive/accessibility critical journeys pass;
14. authoring no-code task flow passes;
15. offline/performance match contract;
16. legacy duplicate owners are closed;
17. exact RC manifest exists;
18. production smoke profile is ready.

---

# 48. FINAL RESPONSE FORMAT

`PYTHON06 STATUS: PASS / FAIL / BLOCKED`

`RC SHA:`

`Content snapshot:`

`Runtime profile:`

`Assessment: PASS / FAIL`

`Sandbox security: PASS / FAIL`

`State/idempotency: PASS / FAIL`

`Offline/performance: PASS / FAIL`

`AI Tutor: PASS / DEGRADED / FAIL`

`UX/accessibility: PASS / FAIL`

`Legacy closure: PASS / FAIL`

`Production smoke profile: READY / NOT READY`

---

# 49. FINAL PRINCIPLE

**PYTHON IS RELEASE-READY ONLY WHEN CORRECT CODE CAN PROVE ITSELF, WRONG CODE FAILS HONESTLY, AND UNTRUSTED CODE CANNOT ESCAPE ITS SANDBOX.**