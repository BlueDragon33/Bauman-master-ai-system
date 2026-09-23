# Math Learning Application Rebuild — LƯỢT 2 Learner Journey UX Audit

## Baseline
- Repository: `BlueDragon33/Bauman-master-ai-system`
- Base: `main@dd00057d48634725f8fd7e336c1e359d1a6a15cd`
- Working branch: `codex/math-learning-app-rebuild`
- Scope: `subjects/math`
- Depends on: `MATH_LEARNING_APP_REBUILD_L01_SOURCE_AUDIT.md`

## Audit method
The current runtime was evaluated against six required learner journeys, using the source structure and runtime ownership exposed by:
- `index.html`
- `subject-manifest.json`
- `core-subject.js`
- `math-navigation.js`
- `math-learning-flow.js`
- `math-dashboard.js`
- `math-workspace.js`

The primary question is not whether a feature exists. It is whether a learner who has forgotten much of university mathematics can move through the system without understanding implementation structure.

## Journey A — First visit

### Expected
Open Math → understand current stage → see one recommended starting point → start the correct lesson.

### Current friction
1. The app shell exposes a persistent sidebar, stage selector, generated navigation, top actions, workspace launchers and content-specific controls at the same time.
2. The learner is asked to interpret categories before the system has established a single recommended next action.
3. Historical route names and resource-oriented navigation remain available through manifest/runtime logic.
4. Workspace code can append more navigation/control surfaces dynamically.

### Root cause
The shell is feature-first. Multiple modules independently add entry points.

### Required change
- One dominant CTA: **Tiếp tục học / Bắt đầu bài đề xuất**.
- Primary nav limited to: Tổng quan · Lộ trình · Học · Luyện tập · Ôn tập.
- Stage becomes context, not the first decision the learner must make.
- Advanced resources move to contextual drawer.

### Gate
A new learner must be able to reach the proposed lesson with one obvious route and without opening the resource/storage system.

**Status: FAIL → architecture change required.**

---

## Journey B — Resume after partial lesson

### Expected
Reopen Math → return to the exact lesson and step last used.

### Current friction
1. Persistence exists in the legacy runtime.
2. Ownership is split between legacy core state and newer Math modules.
3. The source audit cannot prove a single canonical owner for lesson, step, completion and resume.
4. Several modules decorate or synchronize state after render.

### Root cause
Persistence exists, but canonical ownership is ambiguous.

### Required change
Create a learner-state contract:
- currentLessonId
- currentStepId
- lessonStepCompletion
- lessonCompletedAt
- chapterProgress
- reviewQueue
- masteryBySkill
- lastActivityAt
- schemaVersion

Adapters may read legacy state, but only one module may write canonical learner state after migration.

### Gate
Refresh/reopen must restore the same lesson and step. A failed persistence write must never mark completion.

**Status: FAIL → ownership contract required.**

---

## Journey C — Wrong answer recovery

### Expected
Wrong answer → explanation → exact concept/formula to review → retry.

### Current friction
1. Exercise, mastery, formula, professor drill and review modules exist as separate runtime layers.
2. The system has the raw ingredients for recovery but not one guaranteed lesson-local recovery path.
3. Resource-type navigation can pull the learner away from the lesson context.

### Root cause
Content relationship exists in datasets/modules, but recovery is not the primary composition model.

### Required change
Introduce a lesson activity relationship model:
`question/exercise → conceptIds → formulaIds → theoryStepId → reviewActivityId`.

Wrong-answer feedback must remain inside the lesson player unless the learner explicitly opens deeper resources.

### Gate
Every mapped wrong answer can send the learner to a specific concept step and return them to retry.

**Status: PARTIAL → normalization required.**

---

## Journey D — Lesson completion

### Expected
Finish lesson check → real completion persisted → chapter progress updates → next lesson CTA appears.

### Current friction
1. Multiple modules can present progress/mastery concepts.
2. There is no proven single completion transaction visible from current ownership.
3. UI success can diverge from persistence success.

### Root cause
Completion is treated as presentation/state decoration rather than a canonical transaction.

### Required change
Completion transaction order:
1. validate required lesson steps/check;
2. persist lesson result;
3. recompute chapter progress;
4. recompute review/mastery deltas;
5. only then render completed UI;
6. resolve next lesson.

### Gate
Reload after completion must preserve completion and chapter progress. Simulated storage failure must not show completed state.

**Status: FAIL → completion contract required.**

---

## Journey E — Weak mastery review

### Expected
Weak concept detected → concise review queue explains why → learner completes targeted review → mastery updates.

### Current friction
1. Mastery and review data exist in separate layers.
2. Current shell can expose mastery as another feature rather than a learner need.
3. Empty/placeholder data files coexist with richer frame/content sources.

### Root cause
Mastery is modeled as a subsystem, not a user-facing decision aid.

### Required change
Review queue item contract:
- skillId
- reason
- sourceAttemptIds
- recommendedLessonId
- recommendedStepId
- estimatedMinutes
- status

UI language:
- Đã chắc
- Đang hình thành
- Cần ôn
- Chưa học

### Gate
The learner must understand why each review item exists and where it leads.

**Status: PARTIAL → relationship adapter required.**

---

## Journey F — Offline / data error

### Expected
Offline or bad data → learning shell remains understandable → progress is not silently lost → retry/recovery is explicit.

### Current friction
1. Runtime health/regression modules exist, but learner-facing failure behavior is distributed.
2. Large eagerly loaded asset/runtime surface increases failure points.
3. Required manifest files currently include aliases that are 2-byte placeholders.

### Root cause
Runtime health exists beside the learner flow rather than being part of a single shell/error contract.

### Required change
- Canonical loader with source fallback/adapter.
- Error boundaries at shell, lesson, activity levels.
- Offline-safe progress write queue if service worker/persistence supports it.
- No empty tables/panels for missing optional data.

### Gate
A missing optional resource does not break the lesson. A missing required lesson source produces a useful recovery state.

**Status: FAIL → loader/error architecture required.**

---

## Cross-journey UX blockers

### UX-B1 — Too many simultaneous control surfaces
Sidebar + stage selector + nav + topbar actions + dynamic workspace launchers + contextual feature controls.

### UX-B2 — Route model exposes implementation concepts
Resource/data categories remain visible as destinations.

### UX-B3 — No single canonical learner-state owner
Persistence is present but ownership is unclear.

### UX-B4 — Lesson is not yet the dominant composition boundary
Features can still function as peer systems.

### UX-B5 — Advanced tools appear too early
Workspace/lab/content controls can compete with the next learning action.

## Decisions

### KEEP
- existing stable content IDs;
- useful host/planning bridges;
- formula/simulation renderers that can be embedded contextually;
- existing data import/admin tooling outside the primary learner flow.

### REFACTOR
- app shell;
- navigation ownership;
- learner-state ownership;
- loader/normalization layer;
- lesson completion transaction;
- review/mastery composition.

### MOVE TO ADVANCED/CONTEXTUAL
- Formula browser;
- Simulation Lab;
- Mind/Concept maps;
- Professor drill;
- Content Vault/Storage;
- workspace inspection tools.

## LƯỢT 2 gate
- First-visit blocker identified: PASS
- Resume blocker identified: PASS
- Wrong-answer recovery path mapped: PASS
- Completion ownership gap identified: PASS
- Weak-mastery recovery mapped: PASS
- Offline/error failure model mapped: PASS
- Required architectural changes defined: PASS

## LƯỢT 2 result
**PASS**

The current UX is not accepted as the final learner experience, but the problem map is sufficiently precise to freeze a replacement information architecture in LƯỢT 3.
