# E248 · Canonical Route, Dedupe & Runtime Integrity Report

Date: 2026-09-21  
Branch: `stabilization/roadmap-v2-reconcile-current-runtime`  
Status: STATIC PASS · BROWSER QA REQUIRED

## Why E248 was created

E246 fixed the duplicate activity fallback and source integrity behavior. E247 then showed that the old E15 chapter numbering no longer matches the current roadmap.

A second architecture defect was found in the current Math runtime:

- E186 still used a hard-coded 21-item Pure/Applied hierarchy.
- It resolved those item numbers directly with `frameByNo()`.
- The current canonical `theory_lecture_frame` is a 56-chapter, 10-stage, 12-discipline route.
- From chapter 3 onward the old E186 labels and the canonical frame could diverge.
- `theory_lecture_frame.json` stores the chapter tree both nested under stages and in a flat chapter list; E129 appended both without deduplication.
- Activity Studio could read canonical theory records but could not reuse semantic slides from mapped legacy lessons.

## Changes

### 1. E129 canonical frame dedupe

`normalizeFrame()` now deduplicates by stable `chapterId`.

Expected route contract:

- 56 unique chapters
- 40 active chapters
- 16 framework-only chapters

E129 self-check now verifies:

- `chapterCount === 56`
- `activeCovered === 40`
- `frameworkWithContent === 0`
- application route exists
- frame/content/legacy sources remain separated

### 2. E129 read-only route bridge

E129 now exposes read-only helpers:

- `routeChapters()`
- `lessonOptionsForChapter(chapterId)`
- `lessonRecord(lessonId)`
- `whenReady()`

The bridge never writes academic content.

### 3. E186 canonical hierarchy

The selector now derives its route from E129 canonical frame instead of the stale hard-coded chapter numbering.

New route:

`Giai đoạn → Phân môn → Chương → Bài → Phân mục`

Chapter selector status is source-aware:

- `canonical · N bài`
- `legacy mapped · N bài`
- `framework / chưa có học liệu`

State synchronization also updates `e129Stage` / `stage` when changing canonical chapter.

### 4. Legacy lesson continuity

If `theory_lecture_content` has no record for a chapter, E186 asks E129 for mapped legacy lessons.

This preserves the current 347-lesson legacy corpus without pretending that it has already been migrated into canonical content.

### 5. Activity Studio V3

Activity Studio now requests the current lesson through the E129 read-only bridge.

Therefore non-theory surfaces can reuse semantic slides from either:

- canonical `theory_lecture_content`, or
- mapped legacy `lessons`.

No second 7.8 MB fetch of `lessons.json` was added.

### 6. C03 ID migration

Six canonical C03 theory records used the stale chapter ID:

`MATH-VN-C03-giai_tich_dao_ham_gradient`

They were remapped to the current frame ID:

`MATH-VN-C03-ham_so_ao_ham_va_gradien`

Only `chapterId` changed. Lesson IDs and slide content were preserved.

### 7. Regression/Health gates

Regression Gate V5 now checks:

- E129 frame/active coverage
- E186 canonical hierarchy coverage
- Activity Studio source integrity
- duplicate fallback visibility
- no-content failure
- degraded semantic fallback warning

Runtime Health V6 includes E186 Canonical Route.

## Verified data state

Static repository audit after C03 remap:

- frame chapters: 56 unique
- stages: 10
- disciplines: 12
- canonical theory records: 18
- canonical theory chapters: 3
- legacy lesson records: 347
- active chapters with canonical or mapped legacy lessons: 40/40
- framework-only chapters with active content: 0/16
- Chapter 10 PCA/SVD legacy lessons: 9

## Safety

- No fake exercise/application/simulation/question records were generated.
- No `sampleRecord` was promoted to learner content.
- No chapter was recreated from the stale E15 number.
- No new branch was created.
- `main` was not merged.
- Browser/Chromium QA is still a separate mandatory gate.

## Files changed in E246–E248 lane

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-learning-path-E186.js`
- `subjects/math/assets/math-activity-studio.js`
- `subjects/math/assets/math-regression-gate.js`
- `subjects/math/assets/math-runtime-health.js`
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/index.html`
- E246/E247/E248 audit reports
