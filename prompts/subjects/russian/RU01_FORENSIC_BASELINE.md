# RU01 — FORENSIC BASELINE
## Current reality before redesign

Former source responsibility: P1 + P0 audit/orchestration clauses.

---

# 0. MISSION

Map the actual Russian runtime before changing its architecture.

RU01 is an audit.

It does not redesign UI, rewrite content, migrate learner state, replace engines, or retire legacy code merely because it looks old.

---

# 1. CONSTITUTION ROUTING

Load targeted clauses from:

- C1: Core-Stable, Content-as-Data, registries, extension boundaries, backward compatibility;
- C2: App Shell, responsive, accessibility, visual/UX acceptance;
- C3: starting rule, test layers, state/persistence, regression, evidence;
- C4: competency/evidence/mastery truthfulness.

---

# 2. REQUIRED REALITY MAP

Map at least:

- entry/shell;
- CSS and presentation ownership;
- DOM render/mutation ownership;
- routes/deep links;
- canonical learner state;
- progress/mastery writers;
- SRS/review ownership;
- curriculum/data loaders;
- speaking/audio/handwriting engines;
- assessment flow;
- AI entry/context/write permissions;
- offline/PWA/package;
- Hub bridge;
- test coverage;
- performance baseline;
- accessibility baseline;
- security/data-safety baseline.

---

# 3. DATASETS

Inventory current Russian datasets and actual runtime usage, including:

- curriculum;
- lessons;
- grammar / grammar path;
- vocab;
- speaking;
- dialogue-bauman-az;
- deep-speaking-bauman;
- speaking-link-index;
- writing;
- handwriting;
- exercises;
- tests;
- videos;
- mindmap/knowledge indexes;
- simulations.

Do not infer ownership from filenames alone.

---

# 4. SPEAKING SEPARATION CHECK

Verify, do not assume:

- `speaking.json` = basic listening/speaking;
- `dialogue-bauman-az.json` = advanced contextual dialogue;
- `deep-speaking-bauman.json` = advanced productive/pressure speaking;
- `speaking-link-index.json` = bridge/index.

Flag cross-contamination or duplicate runtime ownership.

---

# 5. STATE TRUTH CHECK

Trace every write that can change:

- attempts;
- score;
- progress;
- mastery;
- SRS;
- review queue;
- speaking evidence;
- handwriting evidence;
- stage progression.

Critical finding if presentation/render/open/click mutates authoritative mastery without valid evidence.

---

# 6. ARCHITECTURE FIT CHECK

For current Russian code, classify each subject-specific implementation:

`KEEP`

`MIGRATE_TO_CONTENT`

`MIGRATE_TO_CAPABILITY`

`MIGRATE_TO_EXTENSION`

`REFACTOR`

`RETAIN_COMPATIBILITY`

`DELETE_LATER`

`UNKNOWN`.

Do not delete in RU01.

---

# 7. UI/UX BASELINE

Observe representative:

- dashboard/home;
- lesson;
- listening/speaking;
- vocabulary;
- grammar;
- writing;
- dialogue;
- assessment.

Test representative desktop/tablet/mobile and keyboard flow.

Record root causes, not only screenshots.

---

# 8. TEST TRUST AUDIT

For Russian tests record:

- what each test proves;
- what it does not prove;
- whether it is static/runtime/browser/package;
- stale assertions;
- false-confidence risk.

Labels:

`TRUSTED`

`USEFUL`

`WEAK`

`STALE`

`MISLEADING`.

---

# 9. REQUIRED OUTPUTS

At minimum create/update compact canonical artifacts for:

- file/runtime inventory;
- owner matrix;
- route map;
- state/storage map;
- data architecture;
- current architecture diagram;
- test coverage matrix;
- performance baseline;
- accessibility baseline;
- risk register;
- root-cause tree;
- keep/migrate/delete-later matrix;
- evidence index;
- RU02 input contract.

Consolidate reports when possible.

Do not create report spam.

---

# 10. EXIT GATE

RU01 PASS only when current reality is evidenced well enough to answer:

- who owns each major responsibility;
- what is actually loaded;
- what mutates learner state;
- where duplicate owners exist;
- what Russian-specific code should remain subject-specific;
- what should migrate to global platform capability;
- what must not be touched yet;
- what RU02 may safely normalize.

---

# 11. TOKEN RULE

Reuse prior inventories if the relevant SHA/diff proves they remain valid.

Start:

status
→ current SHA
→ diff
→ impacted owners
→ targeted runtime checks.

Do not reread the entire archive unless evidence is stale.

---

# 12. HANDOFF

RU01 outputs:

`RU02_INPUT_CONTRACT`

containing:

- preserved datasets/IDs;
- actual owners;
- legacy aliases;
- known state constraints;
- confirmed runtime boundaries;
- unresolved UNKNOWN items.

**RU01 ends at current-reality proof.**
