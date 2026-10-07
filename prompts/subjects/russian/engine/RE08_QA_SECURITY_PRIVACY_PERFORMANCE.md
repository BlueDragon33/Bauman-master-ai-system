# RE08 — QA · SECURITY · PRIVACY · PERFORMANCE · RESILIENCE

Canonical owners: C3 + C1 + C2 + RU08

Mission: define the evidence required before Russian Engine changes are trusted.

---

# 1. TEST PYRAMID

Use targeted layers:
- schema tests;
- pure domain unit tests;
- contract tests;
- content validators;
- migration tests;
- provider adapter tests;
- integration tests;
- browser user journeys;
- offline/resume tests;
- accessibility tests;
- performance budgets;
- security tests.

CI green alone is not PASS.

---

# 2. GOLDEN LEARNING FIXTURES

Maintain small deterministic fixtures for:
- object/action immersion;
- translation escalation;
- natural-speed listening;
- pronunciation evidence;
- scenario repair;
- adaptive next-step;
- spaced review;
- level promotion;
- content revision;
- export/import.

Fixtures must be small enough to understand and stable enough to catch regressions.

---

# 3. CONTENT VALIDATION

Fail or warn for:
- missing canonical refs;
- unknown schema version;
- invalid level refs;
- inaccessible media without fallback;
- unknown license metadata in commercial packs;
- impossible scenario path;
- duplicate ID;
- invalid prerequisite;
- translation leakage in Russian-only experience;
- unbounded AI instruction;
- arbitrary executable condition.

---

# 4. LEARNER STATE SAFETY

Test:
- reload mid-session;
- duplicate submit;
- replay;
- back/forward navigation;
- interrupted write;
- old schema migration;
- new content revision;
- failed migration rollback;
- export/import;
- sync duplicate/conflict when sync exists.

Never reset learner history as a convenient repair.

---

# 5. PROVIDER CHAOS TESTS

Simulate:
- TTS failure;
- STT failure;
- microphone denial;
- AI timeout;
- AI malformed result;
- sync unavailable;
- storage quota;
- corrupted media;
- offline startup.

Expected:
only the dependent capability degrades.

Learner is not marked wrong because infrastructure failed.

---

# 6. AI SAFETY

Test:
- hallucinated Russian fact;
- prompt injection from imported content;
- answer leakage;
- stale response after task change;
- tool misuse;
- scenario world hallucination;
- fake source;
- unsupported pronunciation certainty.

---

# 7. SECURITY

Threat-model:
- imported JSON;
- HTML/micro-app;
- media URLs;
- stored learner text;
- voice files;
- AI/document retrieval;
- entitlement boundary;
- account/sync adapters;
- admin tooling.

No secret in client content/prompt pack.

No arbitrary eval from content-defined expressions.

---

# 8. PRIVACY

Verify:
- microphone consent;
- clear remote-processing status;
- retention behavior;
- export;
- deletion;
- minimal logs;
- no raw voice in analytics by default;
- profile isolation when multi-user exists.

---

# 9. PERFORMANCE

Measure representative:
- cold start;
- Russian route open;
- first interactive experience;
- audio start latency;
- graph lookup;
- review queue;
- scenario load;
- repeated route lifecycle;
- memory growth;
- offline reload;
- large content pack.

Set budgets from measured baselines and target devices.

Do not choose arbitrary vanity thresholds.

---

# 10. 100-LEVEL SCALE TEST

Generate/validate a synthetic complete 100-level catalog and ensure:
- startup does not eagerly load everything;
- navigation/lookup remains bounded;
- prerequisite graph validates;
- level promotion rules parse;
- pack partition works;
- no code path contains 100 manual branches.

---

# 11. MULTI-USER ISOLATION TEST

When multi-user provider is introduced:
- user A cannot read B;
- cache keys are scoped;
- background sync uses correct identity;
- logout/user switch quarantines stale requests;
- provider retries cannot cross profiles.

---

# 12. ACCESSIBILITY

Validate:
- keyboard-only;
- visible focus;
- semantic controls;
- screen-reader labels;
- non-color state;
- reduced motion;
- transcript/caption accommodations;
- alternative path for unavailable mic where possible.

---

# 13. PRODUCT UX

Check:
- no clutter explosion;
- primary action obvious;
- learner can understand why an action failed;
- Russian stimulus visually dominant;
- help is progressive;
- translation is not accidentally primary;
- mobile touch targets;
- long Cyrillic/technical content;
- dark/light themes through shared design authority.

---

# 14. RELEASE EVIDENCE

Each RE work packet records:
- exact HEAD;
- changed owners;
- tests run;
- browser journeys;
- known limitations;
- migration impact;
- rollback point;
- external integration requirements.

---

# 15. RE08 EXIT GATE

PASS when Engine change is not only functionally correct, but survives representative failure, state, privacy, accessibility, offline and scale scenarios for its blast radius.
