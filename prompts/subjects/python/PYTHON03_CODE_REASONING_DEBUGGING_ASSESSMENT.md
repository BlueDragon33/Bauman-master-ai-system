# PYTHON03 — CODE REASONING · PROGRAM CONSTRUCTION · DEBUGGING · ASSESSMENT
## From problem understanding to robust executable evidence

Mode:

`REASONING-FIRST · BEHAVIOR-FIRST · DEBUG-FIRST · EVIDENCE-FIRST · ANTI-STRING-MATCH`

---

# 0. ENTRY GATE

Requires stable PYTHON02 curriculum/entity/prerequisite contract.

---

# 1. MISSION

Define how learners reason about, construct, debug and prove Python programs.

The central learning chain is:

`PROBLEM`
→ `INPUT / STATE`
→ `DECOMPOSITION`
→ `ALGORITHM / PLAN`
→ `CODE`
→ `TRACE / EXECUTION`
→ `TEST`
→ `DEBUG`
→ `RESULT`
→ `EXPLANATION`
→ `TRANSFER`.

---

# 2. CODE REASONING DIMENSIONS

Separate evidence for:

- reading;
- tracing;
- predicting;
- constructing;
- decomposing;
- debugging;
- testing;
- explaining;
- refactoring;
- transferring.

A learner may be strong in one and weak in another.

---

# 3. PROGRAM-CONSTRUCTION CONTRACT

For nontrivial tasks, encourage:

1. understand requirements;
2. identify inputs/outputs/state;
3. define cases/constraints;
4. choose decomposition;
5. write small correct pieces;
6. test normal and edge cases;
7. debug failures;
8. verify result;
9. improve clarity/robustness.

Do not require ceremonial pseudocode for every tiny task.

---

# 4. TRACE MODEL

For tracing tasks, model:

- current line/expression;
- name bindings;
- mutable object state;
- call stack where level warrants;
- output/side effects;
- exceptions.

Avoid fake “memory box” explanations that contradict Python reference semantics.

---

# 5. REFERENCE / MUTATION REASONING

Explicitly assess misconceptions around:

- aliasing;
- shallow copies;
- nested mutation;
- function arguments/object references;
- list/dict/set mutation;
- object attributes.

---

# 6. FUNCTION REASONING

Assess:

- parameter binding;
- return values;
- side effects;
- defaults;
- scope;
- decomposition;
- testability.

---

# 7. CONTROL-FLOW REASONING

Assess normal and edge paths:

- conditions;
- loops;
- zero iterations;
- early break/continue;
- off-by-one boundaries;
- infinite-loop risk.

---

# 8. ITERATION REASONING

Distinguish:

- iterable;
- iterator state;
- generator laziness;
- exhaustion;
- repeated iteration assumptions.

---

# 9. EXCEPTION REASONING

Learner should diagnose:

- exception type;
- likely cause;
- relevant stack frame;
- recoverable vs programmer error;
- appropriate handling location.

---

# 10. DEBUGGING LOOP

Canonical debugging loop:

`REPRODUCE`
→ `MINIMIZE`
→ `OBSERVE`
→ `HYPOTHESIZE`
→ `TEST HYPOTHESIS`
→ `FIX ROOT CAUSE`
→ `REGRESSION TEST`.

Do not teach random-edit debugging.

---

# 11. ERROR TAXONOMY

At minimum support categories such as:

`SYNTAX / INDENTATION`

`NAME / SCOPE`

`TYPE`

`VALUE`

`INDEX / KEY`

`ATTRIBUTE`

`IMPORT / ENVIRONMENT`

`FILE / ENCODING`

`CONTROL FLOW`

`OFF_BY_ONE`

`MUTATION / ALIASING`

`NONE / TRUTHINESS`

`ITERATOR STATE`

`FLOAT / NUMERIC`

`LOGIC / REQUIREMENT`

`STATE / SIDE EFFECT`

`TEST / FIXTURE`

`CONCURRENCY` only if curriculum includes it.

---

# 12. SYNTAX ERROR ≠ LOGIC ERROR

Feedback must distinguish parser failure from incorrect runtime behavior.

---

# 13. RUNTIME ERROR ≠ WRONG RESULT

A program can run and still be wrong.

Assessment must test behavior against requirements.

---

# 14. FINAL OUTPUT ≠ ROBUSTNESS

Passing one example does not prove correctness.

Use edge cases and hidden tests appropriate to task.

---

# 15. SOURCE CODE STRING MATCH FORBIDDEN AS PRIMARY GRADER

Different valid implementations must be accepted when task permits.

Use behavior/contracts/tests/rubrics.

---

# 16. PUBLIC TESTS

Public tests should:

- clarify behavior;
- support debugging;
- avoid revealing entire hidden assessment set.

---

# 17. HIDDEN TESTS

Hidden tests may test:

- edge cases;
- generalization;
- robustness.

They must not depend on undocumented arbitrary behavior.

---

# 18. TEST QUALITY

A hidden test is invalid if it asserts a behavior not in the task contract.

Do not use trick cases unrelated to competency.

---

# 19. FLOAT COMPARISON

Where approximate numeric results are expected:

use domain-appropriate tolerance.

Do not compare floats naively when approximation is part of semantics.

---

# 20. ORDER SENSITIVITY

If result order is irrelevant:

grader should not reject valid alternate ordering.

If order is part of contract:

state it.

---

# 21. RANDOMNESS

Tasks using randomness require:

- seed/control;
- statistical/contract-based evaluation;
- or deterministic abstraction.

Do not make official score flaky.

---

# 22. TIME / PERFORMANCE

Performance constraints only when competency requires.

Do not grade beginner code by micro-optimizations.

---

# 23. CODE STYLE

Style can be feedback/evidence but should not dominate correctness unless explicitly part of competency.

Formatter conformity is not equivalent to program quality.

---

# 24. TYPE CHECKING

Type checker output is advisory unless task contract explicitly includes static typing competency.

Python runtime truth remains distinct.

---

# 25. PARTIAL CREDIT MODEL

Potential dimensions:

- requirement understanding;
- decomposition;
- core logic;
- edge handling;
- test quality;
- debugging evidence;
- clarity;
- final behavior.

Do not award fake precision.

---

# 26. FIRST ATTEMPT

First official attempt is immutable evidence.

Retries append.

Do not overwrite learner history with latest passing code.

---

# 27. HINT USAGE

Hints may reduce evidence strength according to C4 policy, but hint use is not automatically failure.

Record support level where useful.

---

# 28. SOLUTION REVEAL

Full solution reveal must follow task/assessment policy.

Do not expose hidden solution before official submission when prohibited.

---

# 29. AI ASSISTANCE

For official tasks, AI assistance policy must be explicit:

- allowed;
- hint-only;
- prohibited;
- post-submit.

AI cannot invisibly solve an assessment while evidence still claims independent mastery.

---

# 30. COPY / TEMPLATE ASSISTANCE

Starter code is support evidence.

Assessment should distinguish:

- blank implementation;
- scaffolded implementation;
- independent implementation.

---

# 31. DEBUGGING EVIDENCE

Possible evidence:

- learner identifies failing case;
- explains stack trace;
- isolates cause;
- writes regression test;
- fixes root cause;
- explains why fix works.

---

# 32. TEST-WRITING COMPETENCY

Learner tests can demonstrate:

- understanding requirements;
- edge-case awareness;
- regression thinking.

Do not grade solely by test count.

---

# 33. PROPERTY-BASED THINKING

At advanced level, ask for invariants/properties even if specific property-testing library is not taught.

---

# 34. REFACTORING EVIDENCE

A refactor should preserve behavior.

Assessment may use regression tests + explanation.

---

# 35. NOTEBOOK ASSESSMENT

Notebook output is not enough.

For reproducibility:

- restart kernel;
- run in defined order;
- validate dependencies/data;
- capture code + outputs appropriately.

---

# 36. PROJECT EVIDENCE

Projects may be assessed on:

- functionality;
- structure;
- tests;
- robustness;
- documentation;
- reproducibility;
- learner explanation/demo.

---

# 37. ERROR NOTEBOOK

Integrate C4 Error Notebook with Python-specific error classes.

Record patterns, not every typo forever.

Examples:

- off-by-one loops;
- mutation confusion;
- exception misuse;
- import/environment confusion;
- stale notebook state.

---

# 38. REMEDIATION

Remediation should target the underlying competency/error pattern.

Example:

Repeated aliasing bugs
→ reference/mutation micro-practice
→ trace tasks
→ transfer coding task.

Not simply “repeat same question”.

---

# 39. ADAPTIVE DIFFICULTY

Difficulty can vary along:

- scaffold amount;
- number of cases;
- data structure complexity;
- program length;
- hidden edge cases;
- debugging ambiguity;
- requirement openness.

Do not equate longer code with harder reasoning automatically.

---

# 40. TRANSFER

A learner who only memorizes examples has not demonstrated transfer.

Use new contexts/problems with same underlying concepts.

---

# 41. ANTI-HARDCODE TEST

Where appropriate, hidden cases should detect programs that print sample answers without implementing the requirement.

---

# 42. SECURITY BOUNDARY

Assessment code is untrusted input.

Execution/security belongs PYTHON04/PYTHON06.

PYTHON03 defines what needs to be evaluated, not how unsafe code should be run.

---

# 43. ASSESSMENT RESULT CONTRACT

Result should distinguish:

- syntax/runtime failure;
- failed tests;
- partial behavior;
- correct behavior;
- test/quality feedback;
- support used;
- official evidence status.

---

# 44. MASTERY BOUNDARY

PYTHON03 supplies evidence.

C4/global mastery owner decides mastery according to policy.

PYTHON03 must not create a hidden second mastery engine.

---

# 45. REQUIRED DELIVERABLES

Create:

- `PYTHON_CODE_REASONING_CONTRACT.md`
- `PYTHON_DEBUGGING_ERROR_TAXONOMY.json`
- `PYTHON_CODING_ASSESSMENT_CONTRACT.md`
- `PYTHON_TEST_QUALITY_POLICY.md`
- `PYTHON_PARTIAL_CREDIT_RUBRIC.md`
- `PYTHON_ERROR_NOTEBOOK_MAPPING.md`
- `PYTHON_TRANSFER_TASK_POLICY.md`
- `PYTHON04_INPUT_CONTRACT.md`.

---

# 46. GOLDEN FIXTURES

At minimum include representative fixtures for:

- mutable default argument;
- `is` vs `==` misuse;
- shallow copy/aliasing;
- off-by-one loop;
- iterator exhaustion;
- exception misuse;
- float comparison;
- stale notebook state;
- hard-coded sample output;
- valid alternate implementation.

---

# 47. PASS CONDITIONS

PASS when:

1. reasoning dimensions are explicit;
2. debugging has a canonical workflow;
3. error taxonomy is usable;
4. grading is behavior/evidence based;
5. equivalent valid implementations can pass;
6. tests are contract-driven;
7. first-attempt/retry history is preserved;
8. support/hints are represented honestly;
9. remediation/transfer are linked;
10. runtime/security handoff to PYTHON04 is explicit.

---

# 48. FAIL CONDITIONS

FAIL if:

- source string equality is primary grader;
- one sample output defines correctness;
- AI secretly grades official mastery;
- hidden tests assert undocumented behavior;
- debugging is random trial-and-error;
- notebook stale state can masquerade as success;
- retries overwrite first attempt.

---

# 49. FINAL PRINCIPLE

**A PROGRAM IS EVIDENCE ONLY WHEN ITS BEHAVIOR, REASONING AND TEST CONDITIONS ARE TRUSTWORTHY.**
