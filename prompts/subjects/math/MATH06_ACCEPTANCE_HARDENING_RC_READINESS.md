# MATH06 — MATHEMATICS ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS
## Math-specific failure modes routed through the shared QA/release system

Mode:

`RISK-BASED · AUTO-FIX · ROOT-CAUSE · FULL-SYSTEM · EXACT-RC · NO-NEW-FEATURES`

---

# 0. MISSION

Prove that the Mathematics subject is reliable as a whole and produce one exact RC-ready subject package for the shared production release procedure.

MATH06 is not a second generic QA constitution.

It specializes C3 with Math-specific acceptance cases and closes subject-specific legacy/debt.

---

# 1. CONSTITUTION ROUTING

Load:

- C1: migration, security, offline, merge/deployment, capability/plugin lifecycle;
- C2: UX acceptance, responsive, accessibility, visual regression;
- C3: user journey, cross-feature, regression, RC/preview/production safety, definition of done;
- C4: academic regression, evidence truth, Four-Constitution Rule.

---

# 2. ENTRY GATE

MATH06 begins only when required contracts from MATH02–MATH05 are stable enough to test.

Record:

- exact main/base SHA;
- content snapshot/revision;
- schema version;
- tool/provider versions that materially affect results;
- supported browser/device matrix;
- known limitations.

---

# 3. TEST PORTFOLIO

Use multiple layers:

- schema/static;
- unit/domain;
- integration;
- browser E2E;
- mobile/touch;
- accessibility;
- offline/PWA;
- performance;
- migration;
- security;
- exploratory Math edge cases;
- RC smoke.

Do not push every case into browser E2E.

---

# 4. CRITICAL JOURNEY MATRIX

At minimum verify:

1. open Math subject;
2. understand roadmap/current task;
3. open concept/lesson;
4. render formulas;
5. solve a basic problem;
6. submit multi-step problem;
7. receive correct feedback;
8. use hint/remediation;
9. complete review;
10. use graph/visualization;
11. use calculator/CAS capability if enabled;
12. use AI Tutor if enabled;
13. reload/resume state;
14. offline supported journey;
15. author creates/edits/reviews representative Math content;
16. exact content revision becomes candidate.

---

# 5. MATHEMATICAL GOLDEN REGRESSION

Maintain golden fixtures spanning:

- algebra;
- functions/domains;
- trigonometric equivalence where in scope;
- calculus/domain assumptions;
- matrices/vectors;
- equations with multiple/no/infinite solutions;
- units/applied calculation;
- graph discontinuities;
- numerical tolerance;
- proof/reasoning rubric;
- malformed input.

Choose actual curriculum-relevant cases after MATH01/MATH02.

---

# 6. STRING-MATCH FAILURE TEST

Prove the system does not falsely reject valid equivalent answers merely because text differs, for answer classes where equivalence is promised.

Examples:

- reordered commutative terms;
- factored vs expanded form;
- rational vs decimal where approximation accepted;
- interval/set notation.

Also prove the evaluator does not over-normalize non-equivalent expressions.

---

# 7. DOMAIN / ASSUMPTION TESTS

Test:

- excluded denominator values;
- sqrt/log domains;
- extraneous roots;
- differentiability/continuity assumptions;
- matrix invertibility/dimensions;
- parameter restrictions.

A simplifier must not silently change the mathematical task.

---

# 8. EXACT / APPROXIMATE TESTS

Cases:

- exact fraction required;
- decimal accepted;
- tolerance boundary;
- relative vs absolute tolerance;
- significant figures if curriculum requires;
- floating-point edge.

No global unexplained epsilon.

---

# 9. UNIT TESTS

For applied problems:

- correct number/wrong unit;
- convertible unit;
- dimension mismatch;
- rounding after conversion.

Pure math tasks remain unitless when appropriate.

---

# 10. MATRIX / VECTOR TESTS

Test:

- dimension mismatch;
- multiplication order;
- row/column orientation;
- singular matrix;
- equivalent representation only where valid.

---

# 11. GRAPH REGRESSION

Test:

- discontinuity;
- asymptote;
- hole;
- piecewise boundary;
- extreme scale;
- no-domain segment;
- touch zoom/pan;
- resize;
- graph error fallback;
- accessible nonvisual alternative where required.

---

# 12. NUMERICAL METHOD TESTS

If included:

- convergence;
- divergence;
- iteration cap;
- step-size sensitivity;
- invalid initial condition;
- reproducible randomness/seed where needed.

Do not show a last iterate as “answer” after non-convergence.

---

# 13. PROOF / REASONING TESTS

Verify:

- valid alternative reasoning accepted by rubric/process;
- missing justification detected when required;
- correct final conclusion with invalid reasoning does not receive full reasoning evidence;
- counterexample invalidates false universal claim;
- AI does not claim formal verification without verifier.

---

# 14. FIRST ATTEMPT / RETRY TESTS

Verify:

- first response immutable;
- retry appends;
- reload does not duplicate;
- double click idempotent;
- stale result cannot overwrite later response.

---

# 15. MASTERY / ADAPTIVE TESTS

Verify:

- opening lesson does not increase mastery;
- viewing solution does not create mastery;
- hints affect evidence metadata appropriately;
- prerequisite remediation routes correctly;
- review/interleaving does not become endless same-item repetition;
- correct recognition-only result does not imply proof/problem-solving mastery.

---

# 16. AI MATH ACCEPTANCE

Test:

- grounding to canonical concept/formula;
- assessment-answer reveal boundary;
- hallucinated theorem/reference;
- disagreement with CAS/evaluator;
- stale response after learner edit;
- provider outage/fallback;
- prompt injection from imported content;
- no official mastery write;
- no secret/tool permission escalation.

Use deterministic mocks for contract tests plus a bounded real-provider acceptance set where available.

---

# 17. AUTHORING ACCEPTANCE

Create/review at least representative:

- concept/definition;
- formula/theorem;
- worked problem;
- parametric problem;
- assessment;
- graph config.

Verify:

- validators;
- semantic diff;
- high-risk review;
- preview;
- activation staging;
- rollback/deprecation;
- no direct production bypass.

---

# 18. MOBILE / TABLET / DESKTOP

Representative viewports/devices must prove:

- formula readable;
- math input usable;
- matrix editor not broken;
- graph workspace usable;
- virtual keyboard not covering input;
- proof/step workspace usable;
- no accidental page horizontal overflow.

---

# 19. ACCESSIBILITY ACCEPTANCE

Use automated + manual checks.

Keyboard-only journey must complete core learning.

Test:

- focus;
- labels;
- math semantics;
- zoom/reflow;
- graph alternative;
- non-drag path;
- error announcement;
- screen-reader smoke where tooling available.

Do not claim complete accessibility from automated scanner alone.

---

# 20. OFFLINE / PWA ACCEPTANCE

If supported:

- install/current content pack;
- offline lesson;
- local evaluator;
- graph if promised offline;
- saved attempt;
- reconnect exactly-once sync;
- stale pack/update;
- storage pressure;
- service-worker upgrade.

Remote AI/CAS may show degraded state rather than blocking core.

---

# 21. MIGRATION TESTS

For supported previous Math state/content versions:

- content IDs;
- attempts;
- mastery evidence;
- review state;
- saved multi-step work;
- aliases;
- problem revisions;
- generated/derived indexes.

No silent reset.

Migration should be idempotent where feasible.

---

# 22. PERFORMANCE ACCEPTANCE

Compare to baseline for:

- subject startup;
- formula render;
- evaluator latency;
- graph init/interaction;
- large lesson;
- large problem bank/search;
- long session memory;
- mobile responsiveness;
- offline pack size/download.

Use evidence-based thresholds, not arbitrary perfection.

---

# 23. SECURITY ACCEPTANCE

Test:

- unsafe expression execution;
- LaTeX/HTML/Markdown injection;
- malicious import;
- resource exhaustion expression;
- code sandbox boundary;
- AI tool permissions;
- auth/authoring authorization;
- secret exposure;
- CSP/security headers at release stage.

---

# 24. EXPLORATORY CHARTERS

Examples:

- try to get full marks with invalid reasoning;
- try to lose domain restrictions through simplification;
- try to create an extraneous root;
- try to freeze graph with a pathological expression;
- try to duplicate an official attempt;
- try to make AI reveal the checkpoint answer;
- try to publish an unreviewed generated problem;
- try to lose a long solution on reload;
- try to break Math input on a small phone.

---

# 25. ROOT-CAUSE AUTO-FIX LOOP

C3 workflow:

`REPRODUCE`
→ `CAPTURE EVIDENCE`
→ `TRACE OWNER`
→ `FIX MINIMAL ROOT CAUSE`
→ `ADD REGRESSION`
→ `RUN TARGETED TESTS`
→ `RUN RELATED TESTS`
→ `WHOLE-MATH CRITICAL JOURNEYS`
→ `UX REVIEW`.

Do not accumulate cosmetic patches over a broken evaluator contract.

---

# 26. MATH LEGACY RETIREMENT

Subject-specific cleanup may retire:

- duplicate evaluator;
- old formula renderer;
- old Math route;
- stale graph engine;
- legacy hard-coded question bank;
- duplicate mastery writer;
- stale feature flag;
- dead generated index.

Delete only with evidence and migration compatibility.

Shared platform legacy remains C1/C3 responsibility.

---

# 27. RC READINESS

Freeze exact:

- source SHA;
- Math content snapshot;
- Math schema version;
- evaluator/parser version/config if material;
- tool/provider profile;
- dependency lock;
- migrations;
- Math feature flags;
- known limitations;
- rollback target.

No “latest”.

---

# 28. MATH PRODUCTION SMOKE PROFILE

Hand the shared production release procedure a subject-specific smoke profile:

1. Math route loads;
2. expected build/content IDs visible;
3. representative formula renders;
4. representative problem evaluates correctly;
5. first-attempt write persists;
6. graph/visualization opens;
7. search finds canonical concept;
8. AI Tutor grounded response or safe degraded state;
9. offline core works if promised;
10. author/admin route remains protected;
11. no new critical console/network/security error.

This profile does not replace global production preflight/migration/rollback rules.

---

# 29. RELEASE HANDOFF

MATH06 does not itself claim production stable.

Output exact RC package to shared release authority.

If production discovers a mathematical/architectural blocker:

rollback/contain
→ return to canonical owner
→ fix
→ MATH06 impacted regression
→ new RC.

---

# 30. REQUIRED OUTPUTS

Create/update:

- `MATH_ACCEPTANCE_TRACEABILITY_MATRIX.md`
- `MATH_GOLDEN_REGRESSION_FIXTURES.json`
- `MATH_BROWSER_DEVICE_ACCESSIBILITY_MATRIX.md`
- `MATH_OFFLINE_MIGRATION_ACCEPTANCE.md`
- `MATH_PERFORMANCE_SECURITY_ACCEPTANCE.md`
- `MATH_AI_ACCEPTANCE.md`
- `MATH_AUTHORING_ACCEPTANCE.md`
- `MATH_LEGACY_DEBT_REGISTER.md`
- `MATH_RC_MANIFEST.json`
- `MATH_PRODUCTION_SMOKE_PROFILE.md`
- `MATH_ACCEPTANCE_EVIDENCE_INDEX.md`.

---

# 31. FAIL CONDITIONS

MATH06 FAIL if any release-blocking issue remains, including:

- wrong mathematical evaluation;
- domain/assumption corruption;
- valid equivalent answer rejected systematically;
- invalid answer accepted systematically;
- first-attempt corruption;
- mastery written by presentation/AI;
- graph materially misrepresents canonical function;
- AI bypasses assessment/truth authority;
- mobile core flow unusable;
- authoring can publish high-risk unvalidated truth;
- migration loses history;
- severe security issue;
- exact RC identity unknown.

---

# 32. PASS CONDITIONS

MATH06 PASS / RC READY only when:

1. MATH02–MATH05 required contracts are stable;
2. mathematical golden regressions pass;
3. reasoning/equivalence edge cases pass;
4. learner state is durable/idempotent;
5. mastery/adaptive semantics are honest;
6. computation/graph capabilities behave safely;
7. AI guardrails pass;
8. authoring/review lifecycle passes;
9. desktop/tablet/mobile critical journeys pass;
10. accessibility critical journey passes;
11. offline/migration pass where supported;
12. performance/security gates pass;
13. subject-specific legacy blockers are closed;
14. exact RC manifest is complete;
15. production smoke profile and rollback handoff are ready.

End state:

`MATH06 STATUS: PASS — RC READY`

not:

`PRODUCTION STABLE`.