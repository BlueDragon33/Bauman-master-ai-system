# P15 — FULL-SYSTEM QA · REGRESSION · ACCEPTANCE CONSTITUTION
## CROSS-PHASE VERIFICATION · E2E · DEVICE/BROWSER · OFFLINE · SECURITY · PERFORMANCE · ACCEPTANCE EVIDENCE

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/russian/`

Execution mode:

**AUTONOMOUS · EVIDENCE-FIRST · RISK-BASED · CROSS-PHASE · DEFECT-DRIVEN · REPRODUCIBLE · NO-KNOWN-BLOCKER · TOKEN-EFFICIENT**

---

# P15 CHANGELOG

- 2026-09-30 — Full deep P15 constitution created.
- 2026-09-30 — Final hardening: evidence freshness/parity, test-infrastructure validation, intermittent/soak recovery, resource-pressure/network adversity, artifact integrity, skipped/flaky-test governance, candidate lineage, cross-domain rechecks and RC evidence hashing.

---

# 0. MISSION

P15 is the integrated acceptance layer.

P1–P14 can each look correct in isolation and still fail when combined.

P15 proves that the complete Russian learning system works as one product across real journeys, real state transitions, real failure modes and representative devices without violating upstream contracts.

P15 does not primarily design or build.

It verifies, isolates defects, routes fixes to the correct owner, retests and decides whether the system is acceptable for Release Candidate freeze.

---

# 1. P15 AUTHORITY BOUNDARY

P15 may:

- inspect;
- test;
- reproduce;
- classify;
- block;
- request an upstream fix;
- verify a fix;
- sign acceptance evidence.

P15 must not silently:

- change curriculum;
- change mastery rules;
- weaken security;
- lower acceptance criteria;
- bypass governance merely to get green tests.

---

# 2. INPUTS

P15 consumes P0–P14:

- contracts;
- phase evidence;
- risk registers;
- known limitations;
- migration maps;
- device/browser support;
- performance budgets;
- security mitigations;
- content snapshots;
- golden fixtures.

Missing required evidence becomes:

`UPSTREAM_EVIDENCE_GAP`.

Do not fabricate PASS.

---

# 3. ACCEPTANCE ≠ UNIT TEST GREEN

P15 requires a portfolio of evidence:

- static checks;
- unit tests;
- integration tests;
- E2E;
- browser/device;
- accessibility;
- offline;
- migration;
- security;
- performance;
- manual exploratory;
- content sampling.

No single suite is enough.

---

# 4. TEST PORTFOLIO

Use the cheapest level that can prove a contract:

`STATIC`

`UNIT`

`INTEGRATION`

`CONTRACT`

`E2E`

`EXPLORATORY`

`NON_FUNCTIONAL`.

Avoid moving every rule into brittle browser tests.

---

# 5. RISK-BASED PRIORITY

Highest priority:

- learner-state integrity;
- official assessment;
- content truth;
- authoring activation;
- migration;
- offline sync;
- security;
- AI source integrity;
- long writing;
- scenario state;
- rollback.

Cosmetic polish does not outrank these.

---

# 6. DEFECT SEVERITY

Use:

`BLOCKER`

`CRITICAL`

`HIGH`

`MEDIUM`

`LOW`.

Severity describes impact, not repair difficulty.

---

# 7. BLOCKER

Examples:

- core course cannot start;
- official learner work lost;
- assessment answer leaked before submit;
- secret exposed;
- privilege escalation;
- migration irreversibly corrupts state;
- rollback impossible;
- official submission duplicates or disappears.

P15 cannot PASS with a known blocker.

---

# 8. CRITICAL

Examples:

- supported major device class unusable;
- offline core fails contract;
- AI fabricates source in research mode;
- scenario world contradicts state;
- content activation bypasses approval;
- long drafts intermittently disappear;
- core keyboard/screen-reader path blocked.

Normally unresolved CRITICAL means FAIL.

---

# 9. PRIORITY ≠ SEVERITY

Priority may include:

- frequency;
- affected population;
- workaround;
- release timing.

Do not relabel severity to improve release metrics.

---

# 10. DEFECT STATUS

`NEW`

`TRIAGED`

`REPRODUCED`

`ASSIGNED`

`FIX_IN_PROGRESS`

`READY_FOR_RETEST`

`VERIFIED`

`REOPENED`

`DEFERRED`

`ACCEPTED_RISK`

`CLOSED`.

---

# 11. DEFECT OWNER ROUTING

Route to canonical responsibility:

- P3 schema/content identity;
- P4 mastery/assessment state;
- P6 speech/audio;
- P7 linguistic;
- P8 technical;
- P9 writing/research;
- P10 AI;
- P11 scenario;
- P12 authoring;
- P13 UX/a11y;
- P14 infra/security.

Do not patch in the wrong layer.

---

# 12. DEFECT RECORD

Every important defect records:

- candidate SHA;
- content snapshot;
- environment;
- role;
- preconditions;
- steps;
- expected;
- actual;
- evidence;
- frequency;
- severity;
- suspected owner.

---

# 13. REPRODUCIBILITY

Classify:

`ALWAYS`

`FREQUENT`

`INTERMITTENT`

`ONCE`

`NOT_REPRODUCED`.

Intermittent is still real.

---

# 14. EVIDENCE TYPES

Use when appropriate:

- test logs;
- screenshots;
- short video;
- network trace;
- console/error trace;
- state snapshot;
- scenario event trace;
- semantic diff;
- performance trace;
- accessibility result.

Redact private data.

---

# 15. TEST ENVIRONMENTS

Distinguish:

`LOCAL`

`CI`

`PREVIEW`

`STAGING`

`PRODUCTION_LIKE`.

Acceptance must run sufficiently close to release conditions.

---

# 16. ENVIRONMENT PARITY

Record differences in:

- auth;
- database;
- CDN;
- service worker;
- APIs;
- feature flags;
- AI provider;
- storage.

Do not transfer PASS blindly across materially different environments.

---

# 17. TEST DATA

Use controlled accounts/fixtures.

Avoid real learner private data.

---

# 18. TEST DATA RESET

Reset test fixtures only.

Never target production data.

---

# 19. GOLDEN DATA

Version known-good fixtures for:

- vocabulary;
- grammar;
- lesson;
- assessment;
- scenario;
- writing source;
- AI;
- migration.

---

# 20. CROSS-PHASE ACCEPTANCE MAP

Build the central matrix:

`CONTRACT → OWNER PHASE → IMPLEMENTATION → TEST → EVIDENCE → STATUS`.

This prevents forgotten requirements.

---

# 21. ORPHAN CONTRACT

If an upstream critical contract has no test/evidence:

flag it.

---

# 22. ORPHAN TEST

If a test no longer maps to requirement/regression value:

review or retire it.

---

# 23. TEST TAGS

Use useful tags such as:

`SMOKE`

`CRITICAL`

`OFFLINE`

`ASSESSMENT`

`AI`

`SCENARIO`

`AUTHORING`

`MIGRATION`

`SECURITY`

`A11Y`

`PERFORMANCE`.

---

# 24. SMOKE SUITE

Fast checks after build/deploy:

- app opens;
- Russian subject resolves;
- active snapshot loads;
- one lesson;
- one review;
- one audio;
- one state write;
- author/admin route if applicable.

---

# 25. CRITICAL SUITE

Cover every blocker-class path.

Must pass before RC freeze.

---

# 26. FULL REGRESSION

Broader functional and non-functional matrix.

---

# 27. CHANGE-BASED REGRESSION

Use impact/dependency map after a fix.

Still run global critical smoke.

---

# 28. CANDIDATE IDENTITY

Every test result belongs to exact:

- repo SHA;
- content snapshot;
- environment/config;
- dependency lock/build artifact.

No acceptance against a moving target.

---

# 29. UNIT ACCEPTANCE

Critical pure logic includes:

- mastery transition;
- SRS;
- scoring;
- parser;
- scenario guard;
- migration;
- validator;
- import mapping.

Code-coverage percentage alone is insufficient.

---

# 30. INTEGRATION ACCEPTANCE

Test boundaries:

- content → lesson;
- lesson → learner state;
- assessment → P4;
- AI → retrieval;
- scenario → P6/P10;
- editor → validators;
- activation → snapshot;
- offline queue → server/action.

---

# 31. CONTRACT TESTS

Stabilize interfaces for:

- schema;
- AI structured output;
- scenario events;
- sync operation;
- authoring API.

---

# 32. CONTENT/SCHEMA INTEGRITY

All active canonical entities validate.

No dangling required refs.

IDs unique.

Owner registry consistent.

---

# 33. CURRICULUM INTEGRITY

Validate:

- stages;
- module/unit order;
- prerequisites;
- objectives;
- stage gates.

---

# 34. P7 REGRESSION

Run linguistic golden set and changed-scope samples.

---

# 35. P8 REGRESSION

Run technical truth golden set and affected domains.

---

# 36. P9 REGRESSION

Run source-lineage, meaning-preservation and NIR/VKR fixtures.

---

# 37. P10 REGRESSION

Run:

- canonical grounding;
- source fabrication;
- prompt injection;
- assessment leak;
- writing locks;
- model/provider fallback.

---

# 38. P11 REGRESSION

Run:

- state/world consistency;
- hidden facts;
- branch/replay;
- stale AI response;
- offline deterministic fallback.

---

# 39. P12 REGRESSION

Run:

- permissions;
- review;
- approval invalidation;
- import;
- activation;
- rollback;
- concurrency.

---

# 40. P13 REGRESSION

Run critical journeys, responsive and accessibility matrix.

---

# 41. P14 REGRESSION

Run offline, service worker, migration, security, performance and restore evidence.

---

# 42. LEARNER JOURNEY J1 — ENTRY

Open app → Russian subject → current stage → primary task.

Acceptance:

- route resolves;
- current status understandable;
- no irrelevant setup blocker.

---

# 43. J2 — TODAY

Open Today → understand priority/reason → start task → finish → plan updates once.

UI must consume P5, not compute another plan.

---

# 44. J3 — LESSON

Open module/unit → learn → practice → feedback → continue.

Test reload/back/deep link.

---

# 45. J4 — SRS REVIEW

Open due queue → answer → feedback → next → queue changes exactly once.

---

# 46. J5 — LISTENING

Play → replay → answer → transcript according policy → feedback.

Test audio failure fallback.

---

# 47. J6 — SPEAKING

Grant mic → record → stop → transcript/signal → feedback → retry.

Also deny mic and use fallback.

---

# 48. J7 — OFFICIAL ASSESSMENT

Start → answer → submit once → result/rubric → retry/history according P4.

No pre-submit answer leak.

---

# 49. J8 — SCENARIO

Read objective → interact → misunderstanding → repair → branch → completion → debrief.

World remains consistent.

---

# 50. J9 — WRITING

Open source/task → draft → autosave → AI advisory feedback → revise → submit.

Drop network during draft.

---

# 51. J10 — RESEARCH/NIR

Source note → objective/method/result → source lineage preserved.

---

# 52. J11 — DEFENSE

Presentation → question → answer → follow-up → debrief.

No invented project facts.

---

# 53. J12 — SEARCH

Search Cyrillic/VI/EN alias → open result → return.

---

# 54. J13 — OFFLINE CORE

Download pack → offline → lesson → review → draft → deterministic scenario → reconnect → sync.

No duplicate state.

---

# 55. J14 — UPDATE

Old app/content → update available → safe activation → active draft/session preserved.

---

# 56. J15 — STORAGE PRESSURE

Near quota → disposable cleanup → critical work survives.

---

# 57. J16 — MULTI-TAB

Same draft/task in two tabs → conflicting edit → no silent overwrite.

---

# 58. AUTHOR JOURNEY A1 — EDIT

Find entity → edit draft → validate → save → submit review.

---

# 59. A2 — REVIEW

Review semantic diff + source + impact → approve/request changes.

---

# 60. A3 — ASSESSMENT FIX

Block bad item if urgent → edit accepted answer → validate → inspect learner-impact classification.

---

# 61. A4 — SCENARIO EDIT

Change branch/world → graph validation → sandbox preview → review.

---

# 62. A5 — BULK IMPORT

Upload → map → validate → repair errors → draft batch.

No direct active import.

---

# 63. A6 — ACTIVATION

Approved changeset → stage → derived build → smoke → activate snapshot → verify.

---

# 64. A7 — ROLLBACK

Bad activation → inspect impact → rollback/forward fix → verify known-good state.

---

# 65. A8 — PERMISSION

Contributor calls activation directly.

Server/action must deny.

---

# 66. E2E FIXTURE CLEANUP

Tests clean their own data.

No polluted shared environment.

---

# 67. E2E SELECTORS

Use stable semantic/test IDs.

Avoid brittle CSS position selectors.

---

# 68. E2E WAITS

Wait for semantic state/network result.

Avoid arbitrary sleeps.

---

# 69. MOCK VS REAL

Use mocks for deterministic edge cases and real integrations for critical acceptance paths.

Both are required.

---

# 70. AI MOCK

Structured deterministic AI mock verifies app contract without stochastic CI.

---

# 71. REAL AI ACCEPTANCE

Small real-provider suite verifies candidate model/config.

Do not make every test depend on live AI.

---

# 72. SPEECH MOCK + REAL DEVICE

Mock recognition workflow in CI.

Use representative real browser/device for mic/media acceptance.

---

# 73. MIGRATION FIXTURES

Keep realistic prior-version state samples.

---

# 74. BROWSER MATRIX

Use P14 supported browsers.

Record exact tested versions.

Do not claim untested support.

---

# 75. MOBILE MATRIX

Representative:

- small viewport;
- mid-range Android;
- iOS Safari if supported;
- tablet.

Real device for PWA/mic/storage where emulator insufficient.

---

# 76. DESKTOP MATRIX

Representative Windows/macOS based on actual support/audience.

---

# 77. RESPONSIVE MATRIX

Test:

- small mobile;
- large mobile;
- tablet;
- laptop;
- wide desktop.

---

# 78. INPUT MATRIX

- mouse;
- touch;
- keyboard;
- microphone;
- text fallback.

---

# 79. ORIENTATION

Portrait + landscape for mobile/tablet critical views.

---

# 80. LARGE TEXT

Test enlarged font/zoom with no clipped critical controls.

---

# 81. DARK/HIGH-CONTRAST

If supported by product.

---

# 82. REDUCED MOTION

If supported.

---

# 83. ACCESSIBILITY TARGET

Use recognized web accessibility expectations such as WCAG 2.2 AA where applicable to web UI.

Document any project-specific exception.

---

# 84. A11Y AUTOMATION

Automated scan helps find:

- label;
- role;
- contrast;
- duplicate ID;
- landmark issues.

It cannot prove full accessibility.

---

# 85. A11Y MANUAL

Test:

- keyboard;
- focus;
- dialogs;
- screen-reader semantics;
- errors;
- audio transcripts;
- drag alternatives.

---

# 86. KEYBOARD-ONLY

Complete representative lesson, review, assessment and author form without mouse.

---

# 87. SCREEN READER

Test representative learner and author flows with a supported screen-reader/browser combination where available.

---

# 88. COLOR/CONTRAST/ZOOM

No color-only meaning.

Themes readable.

Critical UI usable at enlarged text/zoom.

---

# 89. OFFLINE ACCEPTANCE

Disable actual network, not just toggle an app flag.

---

# 90. FIRST-INSTALL OFFLINE

Expected behavior is explicit if app/pack was never loaded.

---

# 91. WARM OFFLINE

Previously downloaded current content works.

---

# 92. INTERRUPTED PACK DOWNLOAD