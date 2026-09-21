# E246 · Activity Route & Data Integrity Fix Report

Date: 2026-09-21  
Branch: `stabilization/roadmap-v2-reconcile-current-runtime`  
Status: STATIC FIX APPLIED · BROWSER QA STILL REQUIRED

## Trigger

The E15/E16 Chapter 7 checkpoint reports non-zero companion counts for exercises, applications, simulations, professor Q&A, questions and review packs. The imported repository state does not contain those companion records in the corresponding durable files.

Observed durable sources on current repository state:

- `data/exercises.json`: empty array
- `data/applications.json`: empty array
- `data/simulations.json`: empty array
- `data/professor_qa.json`: empty array
- `data/question_bank.json`: empty array
- `data/review_packs.json`: empty array
- `data/exercise_content.json`: `records: []`
- `data/application_content.json`: `records: []`
- `data/simulation_content.json`: `records: []`
- `data/review_pack_content.json`: `records: []`
- `data/question_bank_content.json`: `records: []`

The `sampleRecord` objects in the *_content files are schema examples/DRAFT and are not learner content.

Git history for the checkpoint report and these source files resolves to the same base import commit from 2026-06-26, so this audit found no evidence that the companion records were deleted by a recent cleanup.

## UI/runtime defects found

1. E169 route table omitted `application`, even though E186 already recognizes the application activity.
2. E129 rendered a generic non-theory fallback card.
3. Activity Studio then inserted the real activity surface before that fallback without hiding it.
4. Result: stale fallback copy could remain visible beneath the richer Activity Studio.
5. The regression gate did not distinguish canonical companion content, semantic theory fallback, duplicate fallback UI, and no-content state.

## Fixes applied

### E129 route layer

- Added `application: 'application'` to the accepted activity routes.
- Reworded the fallback frame to describe source policy accurately.
- Marked the route fallback with `data-e169-activity-fallback`.
- Added E129 self-check fields for `activityRoutes` and `applicationRoute`.

### Activity Studio V2

- Hides the generic E169 fallback while Activity Studio is active.
- Restores it when leaving the activity surface.
- Continues to prefer canonical companion records by lessonId/chapterId.
- Uses only existing semantic slides from `theory_lecture_content` as fallback.
- Never promotes `sampleRecord` to learner content.
- Exposes `degradedMode`, `noContentAvailable`, `routeFallbackHidden` and `routeFallbackVisible` in self-check.

### Regression Gate V4

Added Activity route/source integrity gate:

- FAIL if stale route fallback remains visible.
- FAIL if the selected non-theory activity has neither companion content nor semantic fallback.
- WARN when canonical companion records are absent but a real semantic theory fallback exists.
- PASS only when the current surface is structurally clean and has an accepted source path.

### Boot/cache

Bumped Math asset query versions for E129, Activity Studio and Regression Gate so the browser does not keep stale code.

## Safety decision

No exercise, application, simulation, question, Q&A or review record was fabricated to make the old checkpoint counts appear true.

The correct next content task is a separate source-authoring/import pass that creates audited durable companion records from approved academic content. Until then, the UI stays fail-closed and visibly reports degraded source mode.

## Static verification target

Expected changed Math runtime files:

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/math-activity-studio.js`
- `subjects/math/assets/math-regression-gate.js`
- `subjects/math/index.html`
- this report
- `subjects/math/docs/E246_DATA_INTEGRITY_AUDIT.json`

Browser/Chromium QA is intentionally not claimed by this report.
