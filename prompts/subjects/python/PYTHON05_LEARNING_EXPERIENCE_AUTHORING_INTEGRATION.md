# PYTHON05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION
## Code lab UX · feedback · project workspace · no-code authoring · shared platform integration

Mode:

`LEARNER-FIRST · SHARED-DESIGN-SYSTEM · NO-CODE-FIRST · ACCESSIBLE · RESPONSIVE · STATE-TRUTHFUL`

---

# 0. ENTRY GATE

Requires PYTHON02–PYTHON04 stable contracts.

PYTHON05 does not redesign the global App Shell or Design System.

---

# 1. MISSION

Turn Python academic/runtime capabilities into a coherent learning product that works across desktop/tablet/mobile, while allowing normal content/task authoring without code surgery.

---

# 2. SUBJECT MANIFEST

Python should register through the platform subject/capability architecture.

Manifest may declare:

- subject identity;
- routes;
- stages/modules;
- capabilities;
- resource types;
- authoring blocks;
- offline pack requirements;
- runtime provider requirements.

Do not hard-code Python throughout platform core.

---

# 3. PRIMARY LEARNER SURFACES

Candidate surfaces:

- Today/current task;
- curriculum roadmap;
- concept lesson;
- code lab;
- trace/debug lab;
- review/practice;
- assessment;
- projects;
- error notebook;
- progress.

Use global navigation patterns.

---

# 4. CODE LAB LAYOUT

Desktop may use:

- instructions/context;
- code editor;
- run/test controls;
- console/test results;
- feedback/hints.

Mobile must recompose, not squeeze all panes side-by-side.

---

# 5. CODE EDITOR CONTRACT

Needs, as supported:

- plain text code editing;
- syntax highlighting;
- line numbers;
- indentation support;
- undo/redo;
- keyboard shortcuts that do not block text input;
- copy/paste;
- autosave/draft status;
- accessible labels.

Advanced IDE features are optional capabilities, not requirements for beginner learning.

---

# 6. INDENTATION UX

Python indentation is semantic.

Editor should make spaces/tabs behavior predictable.

Do not auto-transform learner structure invisibly in ways that change code semantics.

---

# 7. MOBILE CODE ENTRY

Mobile constraints:

- virtual keyboard;
- punctuation/symbol entry;
- indentation;
- small viewport;
- console visibility.

Provide practical controls without inventing a full desktop IDE on phone.

---

# 8. RUN CONTROL

Run button state:

- ready;
- running;
- canceling;
- timeout;
- complete;
- error.

Do not allow double-run ambiguity for official evidence.

---

# 9. TEST CONTROL

Distinguish:

`RUN CODE`
from
`RUN TESTS`
from
`SUBMIT`.

These actions have different consequences.

---

# 10. SUBMIT CONTROL

Official submit should clearly indicate evidence/attempt consequences.

Do not make ordinary `Run` consume an official attempt unless policy explicitly says so.

---

# 11. CONSOLE

Console should distinguish:

- stdout;
- stderr;
- system/runtime messages;
- test runner output.

Avoid unstructured wall of text where categories matter.

---

# 12. STACK TRACE UX

Show original traceback with:

- error type;
- line;
- relevant frames;
- optional learner-friendly explanation.

Do not replace real trace with AI prose only.

---

# 13. TRACE VISUALIZER

If available, visualize:

- line progression;
- variables;
- collections;
- call stack.

Accessibility requires structured textual alternative.

---

# 14. VARIABLE INSPECTOR

Optional.

Must not imply every object can be displayed safely/fully.

Large/cyclic values need truncation/summary.

---

# 15. TEST RESULT UX

Public test result should show:

- test name/case;
- pass/fail/error;
- expected/actual when permitted;
- relevant message.

Hidden tests remain protected.

---

# 16. HINT UX

Hint level/state should be visible.

Full solution reveal is distinct from small hint.

---

# 17. AI TUTOR UX

AI should appear as contextual coach, not cover the lab.

Show mode when behavior differs:

- explain;
- debug;
- hint;
- review.

Learner retains control over applying code changes.

---

# 18. AI SUGGESTION DIFF

For nontrivial suggested edits:

show original vs suggestion where feasible.

Never silently replace learner code.

---

# 19. PROJECT WORKSPACE

For larger projects, support as needed:

- multiple files;
- README/task brief;
- tests;
- run entrypoint;
- artifacts;
- revision/save state.

Do not simulate Git unless actual project scope includes it.

---

# 20. FILE WORKSPACE

If multiple files supported:

- safe filenames;
- create/rename/delete with confirmation as appropriate;
- clear active file;
- no path traversal.

---

# 21. NOTEBOOK UX

If notebooks exist:

- execution order visible;
- restart/run-all controls;
- dirty/unsaved state;
- stale output warning where needed.

---

# 22. REPRODUCIBILITY UX

For assessed notebook/project:

provide a clear way to verify from clean state.

---

# 23. ERROR NOTEBOOK UX

Surface recurring bug patterns with:

- concept;
- example;
- learner error;
- remediation;
- resolved/needs-review status.

Avoid shame language.

---

# 24. PROGRESS UX

Distinguish:

- content completion;
- code practice;
- demonstrated competency;
- project evidence;
- review due.

No fake “Python 87% mastered” without evidence model.

---

# 25. AUTHORING MODEL

Normal Python content should be authorable as data.

Entity/block editors may cover:

- concept;
- explanation;
- runnable example;
- code trace task;
- coding task;
- tests/fixtures;
- hint ladder;
- solution;
- project task;
- dataset/resource.

---

# 26. CODING TASK AUTHORING

Author should configure:

- prompt;
- starter code/files;
- runtime/environment;
- inputs;
- public tests;
- hidden tests;
- resource limits;
- hint policy;
- solution/review notes;
- assessment mode.

No direct codebase edit for ordinary task creation.

---

# 27. TEST AUTHORING SECURITY

Hidden tests should be stored/accessed according to secure assessment architecture.

Do not embed hidden test source in public frontend bundle.

---

# 28. SOLUTION AUTHORING SECURITY

Official solutions/reveal policies must not leak before allowed.

---

# 29. RUNTIME PICKER

If multiple runtime versions/providers are supported:

author chooses from governed options.

No arbitrary executable command string field.

---

# 30. PACKAGE ALLOWLIST AUTHORING

If tasks require packages:

select from approved environment/package profiles.

Do not let content author paste privileged install scripts as normal task metadata.

---

# 31. DATASET AUTHORING

Dataset selection/upload follows platform resource governance/provenance.

---

# 32. PREVIEW

Author preview should run in sandbox/test context.

Preview must not create learner mastery/official attempts.

---

# 33. VALIDATION

Before activation validate:

- code syntax where appropriate;
- referenced concepts;
- tests;
- expected behavior;
- runtime environment;
- hidden/public separation;
- resource files;
- solution policy;
- accessibility/content structure.

---

# 34. TEST-OF-TESTS

Critical coding tasks should verify their grading tests against:

- canonical solution;
- valid alternate solution(s);
- known wrong solutions;
- edge cases.

This prevents broken graders.

---

# 35. CONTENT LIFECYCLE

Use shared P12-style/global content governance:

`DRAFT → VALIDATE → REVIEW → PREVIEW → APPROVE → ACTIVATE`.

Python does not create a second publish workflow.

---

# 36. RESPONSIVE DESIGN

At minimum test:

- small mobile;
- large mobile;
- tablet;
- laptop;
- desktop.

Code editor/console interactions must remain usable.

---

# 37. KEYBOARD ACCESSIBILITY

A learner should be able to:

- focus editor;
- run;
- test;
- submit;
- inspect error;
- open hints

without mouse where platform supports keyboard interaction.

---

# 38. SCREEN READER

Use semantic labels for:

- editor region;
- run/test buttons;
- status;
- error/test output;
- dialogs.

Complex code itself remains text; avoid inaccessible canvas-only representations.

---

# 39. COLOR

Pass/fail/error cannot be color-only.

---

# 40. FOCUS

After execution/test:

focus should not jump unpredictably.

Critical error can be announced without stealing editor focus unnecessarily.

---

# 41. LONG CODE

Editor handles long lines/files without breaking page layout.

---

# 42. LARGE OUTPUT

Console virtualization/truncation for huge output.

Do not freeze browser.

---

# 43. OFFLINE UX

Show honestly whether:

- lesson content available;
- code execution available;
- package runtime loaded;
- drafts saved;
- execution queued/disabled.

---

# 44. RUNTIME DOWNLOAD UX

If browser runtime/packages download:

show size/progress/cancel/error.

---

# 45. STATE RESTORATION

Reload/navigation should preserve unsaved draft according to contract.

Do not preserve stale runtime memory invisibly as if it were source state.

---

# 46. MULTI-TAB CONFLICT UX

If same assessed/project draft open twice:

show conflict rather than silent overwrite.

---

# 47. SETTINGS

Relevant preferences may include:

- font size;
- theme;
- code font if globally supported;
- editor tab size if allowed;
- support language;
- reduced motion;
- runtime package download settings where relevant.

Do not expose unsafe runtime security controls to learner.

---

# 48. SUBJECT PACKAGING

Python subject may need separate packs for:

- core lessons;
- examples/tasks;
- runtime assets;
- scientific packages;
- datasets.

P14/global architecture owns packaging mechanics.

---

# 49. ANALYTICS

Useful events:

- task_started;
- code_run;
- test_run;
- submit;
- hint_used;
- timeout;
- runtime_error category;
- remediation_started.

Do not log full learner code by default solely for analytics.

---

# 50. REQUIRED DELIVERABLES

Create:

- `PYTHON_LEARNER_JOURNEY_MAP.md`
- `PYTHON_CODE_LAB_UX_CONTRACT.md`
- `PYTHON_AUTHORING_BLOCK_SCHEMA.md`
- `PYTHON_TASK_AUTHORING_CONTRACT.md`
- `PYTHON_TEST_OF_TESTS_POLICY.md`
- `PYTHON_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `PYTHON_OFFLINE_UX_MATRIX.md`
- `PYTHON_SUBJECT_MANIFEST_CONTRACT.md`
- `PYTHON06_INPUT_CONTRACT.md`.

---

# 51. PILOT JOURNEYS

At minimum:

A. Beginner concept → run example → modify → test.

B. Debugging task → traceback → hypothesis → fix → regression.

C. Coding assessment → run → public tests → submit → result.

D. Notebook/data task → restart/run-all reproducibility.

E. Author creates coding task → validates tests → previews → review.

---

# 52. PASS CONDITIONS

PASS when:

1. Python uses shared App Shell/Design System;
2. code lab works across representative devices;
3. run/test/submit semantics are distinct;
4. runtime/test errors are understandable;
5. AI suggestions never silently overwrite learner code;
6. authoring ordinary tasks is no-code/data-driven;
7. hidden tests/solutions remain protected;
8. preview does not mutate learner evidence;
9. accessibility/keyboard basics pass;
10. subject manifest/capabilities integrate without platform fork.

---

# 53. FAIL CONDITIONS

FAIL if:

- Python UI is a separate site shell;
- mobile code lab is unusable;
- hidden tests ship to browser;
- normal task creation requires source-code changes;
- Run and Submit have ambiguous evidence consequences;
- AI rewrites code silently;
- preview writes mastery;
- offline state lies about execution availability.

---

# 54. FINAL PRINCIPLE

**A PROFESSIONAL PYTHON LEARNING EXPERIENCE MAKES CODE, STATE, TESTS, ERRORS AND EVIDENCE VISIBLE WITHOUT FORKING THE PLATFORM.**