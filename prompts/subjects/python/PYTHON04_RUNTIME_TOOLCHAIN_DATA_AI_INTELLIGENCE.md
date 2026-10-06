# PYTHON04 — RUNTIME · TOOLCHAIN · DATA · AI INTELLIGENCE
## Safe execution · REPL/notebook · testing/debugging providers · packages · data tooling · AI coding coach

Mode:

`SANDBOX-FIRST · VERSION-AWARE · PROVIDER-BASED · RESOURCE-LIMITED · AI-BOUNDED · REPRODUCIBLE`

---

# 0. ENTRY GATE

Requires PYTHON02 canonical model and PYTHON03 assessment/reasoning contract.

---

# 1. MISSION

Provide safe, reproducible Python capabilities without creating a second truth owner.

Capabilities may include:

- code execution;
- REPL;
- notebook;
- tests;
- debugging/trace;
- static analysis;
- formatting;
- package/environment handling;
- files/data;
- scientific/data libraries;
- AI Coding Tutor.

---

# 2. CAPABILITY REGISTRY

Prefer reusable capability contracts such as:

- `python.execute`
- `python.repl`
- `python.notebook`
- `python.test.run`
- `python.trace`
- `python.debug`
- `python.lint`
- `python.format`
- `python.typecheck`
- `python.files`
- `python.package.info`
- `python.data.numpy`
- `python.data.pandas`
- `python.ai.tutor`.

Names may differ in actual repository; do not fork core merely to match examples.

---

# 3. ONE EXECUTION FACADE

UI/features should call one governed execution abstraction even if providers differ.

Avoid lesson components directly spawning ad hoc interpreters.

---

# 4. PROVIDER TYPES

Provider choice inherits the shared dependency-independence policy.

Default priority:

1. browser/WASM sandbox for interactive practice and offline learning;
2. local desktop CPython/sandbox for full-runtime/native-package tasks;
3. optional managed server/container sandbox for stronger shared isolation;
4. external runner only as contingency.

A managed cloud container is an optional provider, not canonical Python truth.

Each provider must declare:
- runtime identity/version;
- offline capability;
- package capability;
- filesystem/network boundary;
- isolation strength;
- hidden-test confidentiality level;
- resource limits;
- fallback behavior.

Browser/WASM execution must not claim hidden-test confidentiality that browser-visible code cannot provide.

PYTHON01 evidence determines what exists; PYTHON04 selects providers according to current policy and capability evidence.

---

# 5. EXECUTION REQUEST CONTRACT

A run request may include:

- code;
- files;
- stdin;
- runtime/version;
- allowed packages;
- timeout/resource policy;
- task ID/attempt ID;
- deterministic seed where needed.

Do not pass secrets/environment wholesale.

---

# 6. EXECUTION RESULT CONTRACT

Return structured:

- status;
- stdout;
- stderr;
- exception type/message/traceback as allowed;
- exit code if applicable;
- duration/resource signal;
- files/artifacts if allowed;
- runtime identity;
- truncation flag.

Do not parse correctness solely from stdout text in UI.

---

# 7. SANDBOX

Learner code is untrusted.

Default deny capabilities not required by the task.

Potential restrictions:

- filesystem scope;
- network;
- subprocess;
- environment variables;
- system calls;
- package install;
- CPU/time;
- memory;
- output size.

Actual mechanism depends on runtime provider.

---

# 8. TIMEOUT

Infinite loops must not freeze the app/service indefinitely.

Timeout should produce a distinct result, not generic wrong answer.

---

# 9. MEMORY LIMIT

Resource-exhaustion programs need containment.

Avoid server/process collapse from learner code.

---

# 10. OUTPUT LIMIT

Bound stdout/stderr.

Preserve truncation indicator.

Do not let `print` flood UI/logs.

---

# 11. FILESYSTEM

If tasks require files:

use per-run/per-user isolated workspace.

Prevent path traversal and access outside allowed root.

---

# 12. NETWORK

Network should be disabled by default for normal exercises unless competency explicitly requires approved endpoints.

This reduces exfiltration/nondeterminism.

---

# 13. SUBPROCESS

Disable/restrict unless task explicitly needs it and sandbox supports safely.

---

# 14. `eval` / `exec`

Learner code may contain them, but platform must not implement assessment by unsafe host-language `eval` of untrusted code.

If prohibited by exercise policy, detect pedagogically; security boundary remains sandbox.

---

# 15. PICKLE / UNSAFE DESERIALIZATION

Do not load untrusted pickle or equivalent unsafe serialized objects in privileged host context.

---

# 16. ENVIRONMENT VARIABLE PROTECTION

Do not expose platform secrets/API keys to learner execution environment.

---

# 17. REPL

REPL is useful for exploration.

But REPL state is session state, not automatically reproducible artifact.

---

# 18. NOTEBOOK

Notebook provider must make cell-state semantics visible.

Support, where feasible:

- restart;
- run all;
- execution order;
- kernel state;
- reproducibility check.

---

# 19. NOTEBOOK HIDDEN-STATE WARNING

If output depends on stale/out-of-order state:

surface it.

Official evidence should use reproducible execution policy.

---

# 20. TEST RUNNER

Expose structured:

- passed;
- failed;
- error;
- skipped if legitimate;
- test name/public visibility;
- expected/actual where safe.

Hidden tests stay hidden.

---

# 21. DEBUGGER / TRACE PROVIDER

Possible capabilities:

- step;
- call stack;
- variable values;
- breakpoints;
- expression inspect.

For beginners, a deterministic trace visualizer may be sufficient.

Do not require a full IDE debugger if platform cannot support it.

---

# 22. STACK TRACE PRESENTATION

Preserve real error class/location.

Map to learner-friendly explanation without erasing original evidence.

---

# 23. LINTER

Linter is advisory.

Provider output should include rule/code/severity/location.

Do not block correct beginner code unless policy explicitly requires.

---

# 24. FORMATTER

Formatter produces formatting, not correctness.

Never treat formatted code as proof of mastery.

---

# 25. TYPE CHECKER

Optional provider.

Clarify static analysis vs runtime behavior.

---

# 26. PACKAGE / ENVIRONMENT

If package installation is supported:

- allowlist/curated environment preferred for learning;
- version pinning;
- cached reproducible environment;
- install time/resource bounds.

Avoid arbitrary uncontrolled `pip install` from learner code in shared runtime.

---

# 27. STANDARD ENVIRONMENT

Define a baseline execution environment per course/stage where practical.

Tasks must know what packages are available.

---

# 28. DEPENDENCY IDENTITY

Record runtime/package versions for official evidence when behavior can differ.

---

# 29. NUMPY PROVIDER

If curriculum includes NumPy:

validate:

- array creation;
- shape/dtype basics;
- indexing/slicing;
- vectorized operations;
- broadcasting at appropriate depth;
- numerical comparison.

Do not make NumPy truth equal pure Python semantics.

---

# 30. PANDAS PROVIDER

If curriculum includes Pandas:

validate:

- Series/DataFrame basics;
- indexing/filtering;
- missing values;
- group/aggregate basics;
- CSV/JSON IO;
- reproducibility/version notes.

Statistical/database theory remains external.

---

# 31. DATASET CONTRACT

Datasets should have:

- stable ID;
- provenance;
- schema/columns;
- size;
- license/usage constraints if relevant;
- local/offline availability;
- revision.

---

# 32. FILE UPLOAD

If learner can upload:

- type/size limits;
- safe filename/storage;
- no arbitrary host execution;
- privacy handling.

---

# 33. FILE DOWNLOAD

Generated artifacts need safe content type/name.

---

# 34. OFFLINE EXECUTION

A browser/local execution path is the preferred baseline for personal learning. Define exactly what works offline and cache the runtime/assets where practical.

If no offline interpreter exists for a specific capability, provide honest fallback:

- reading;
- tracing;
- saved code;
- queued execution only if semantics safe.

Do not claim offline execution without evidence.

---

# 35. RUNTIME INITIALIZATION COST

Large browser runtimes/packages should lazy-load.

Do not inflate initial app load for learners not using Python lab.

---

# 36. PACKAGE DOWNLOAD COST

Large scientific packages require visible progress/cache policy.

---

# 37. MULTI-TAB EXECUTION

Runs/submissions need IDs.

Old result from another tab must not overwrite newer attempt state.

---

# 38. STALE RESPONSE

Late execution/AI response is quarantined if task/session changed.

---

# 39. CANCELLATION

Long run should be cancellable where provider supports.

Cancellation is not wrong answer.

---

# 40. IDEMPOTENCY

Official submit/evidence write must be idempotent even if run/result request retries.

---

# 41. AI CODING TUTOR MODES

Potential bounded modes:

`EXPLAIN`

`TRACE_COACH`

`DEBUG_COACH`

`HINT`

`TEST_COACH`

`CODE_REVIEW`

`REFACTOR_COACH`

`PROJECT_COACH`.

---

# 42. AI CONTEXT

Give AI minimum necessary:

- task contract;
- canonical concept refs;
- learner code;
- relevant runtime/test result;
- support policy;
- allowed hints.

Do not automatically send unrelated private files/history.

---

# 43. AI CODE EXECUTION BOUNDARY

AI-generated code is untrusted until sandboxed/tested.

Never execute AI output in privileged host context merely because it came from the model.

---

# 44. AI DEBUGGING

AI should ground diagnosis in:

- actual traceback;
- test failure;
- code;
- canonical semantics.

If uncertain, ask learner to reproduce/inspect rather than invent runtime facts.

---

# 45. AI HINT LADDER

Suggested progression:

`H0 learner works`
→ `H1 clarify requirement`
→ `H2 point to concept/error region`
→ `H3 suggest diagnostic/test`
→ `H4 suggest next code step`
→ `H5 full worked solution only when policy permits`.

---

# 46. AI CODE REVIEW

Separate:

- correctness concerns;
- robustness;
- readability;
- style;
- performance;
- security.

Do not present style preference as bug.

---

# 47. AI ASSESSMENT BOUNDARY

AI can supply advisory feedback.

Official score should rely on governed deterministic/rubric/human evidence according to C4/PYTHON03.

---

# 48. AI HIDDEN TEST SECURITY

Never include hidden test source/answers in learner-facing AI context unless strictly controlled post-assessment workflow requires.

---

# 49. AI PROMPT INJECTION

Learner code/comments/files are untrusted data.

They cannot override system/tool permissions.

---

# 50. AI PROVIDER FAILURE

Fallback:

- canonical explanation;
- deterministic tests;
- continue without AI.

Core Python learning must not depend entirely on AI availability.

---

# 51. OBSERVABILITY

Log safe metadata:

- runtime/provider;
- task ID;
- duration;
- timeout/error class;
- package environment ID;
- AI mode/provider if used.

Do not log secrets/full private code unnecessarily.

---

# 52. REQUIRED DELIVERABLES

Create:

- `PYTHON_EXECUTION_CAPABILITY_CONTRACT.md`
- `PYTHON_SANDBOX_SECURITY_CONTRACT.md`
- `PYTHON_RUNTIME_ENVIRONMENT_POLICY.md`
- `PYTHON_NOTEBOOK_REPRODUCIBILITY_POLICY.md`
- `PYTHON_TEST_DEBUG_PROVIDER_CONTRACT.md`
- `PYTHON_DATA_TOOLING_CONTRACT.md`
- `PYTHON_AI_CODING_TUTOR_CONTRACT.md`
- `PYTHON_RUNTIME_GOLDEN_FIXTURES.json`
- `PYTHON05_INPUT_CONTRACT.md`.

---

# 53. GOLDEN SECURITY FIXTURES

At minimum:

- infinite loop;
- huge allocation;
- output flood;
- path traversal;
- environment-variable read attempt;
- unauthorized network attempt;
- subprocess attempt if prohibited;
- unsafe pickle/deserialization fixture where relevant.

---

# 54. PASS CONDITIONS

PASS when:

1. one governed execution facade exists;
2. runtime identity/version is explicit;
3. learner code is sandboxed;
4. CPU/memory/output limits exist appropriate to provider;
5. filesystem/network boundaries are explicit;
6. REPL/notebook reproducibility is understood;
7. tests/debug providers return structured results;
8. package environments are reproducible enough for evidence;
9. AI is bounded and grounded in runtime evidence;
10. offline/failure fallback is honest;
11. at least one accepted local/browser or local-desktop provider supports the core Python learning path without recurring paid credentials;
12. optional managed providers can be disabled without corrupting canonical learner state.

---

# 55. FAIL CONDITIONS

FAIL if:

- learner code executes with production secrets;
- arbitrary host filesystem/network access is unbounded;
- infinite loop can hang shared app indefinitely;
- hidden tests leak to AI/learner;
- AI output executes privileged by default;
- notebook stale state is accepted as reproducible official evidence;
- runtime/package version is unknown for official tasks.

---

# 56. FINAL PRINCIPLE

**RUN UNTRUSTED CODE SAFELY, KEEP THE CORE LOCAL-CAPABLE, AND TREAT EVERY TOOL/CLOUD SERVICE AS A REPLACEABLE PROVIDER — NOT AS THE OWNER OF PYTHON TRUTH.**
