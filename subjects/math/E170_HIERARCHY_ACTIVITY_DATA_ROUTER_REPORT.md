# E170 · Hierarchy Activity Data Router Report

Date: 2026-10-04
Branch: `feat/math-e170-activity-data-router-20261004`
Status: PATCHED · STATIC REVIEW PENDING

## Goal

Replace E169 placeholder-only activity pages with real Content Vault rendering while preserving E129 Reader and E132 Slideshow.

## Runtime mapping

- Bài tập → `exercise_content`
- Thực hành → `simulation_content`
- Ứng dụng thực tế → `application_content`
- Ôn tập → `review_pack_content`
- Kiểm tra → `question_bank_content`

## Safety rules

- Filter first by selected `lessonId` when available.
- Otherwise filter strictly by current `chapterId`.
- Never fill a missing activity with records from another chapter.
- No academic content JSON was edited.
- E129 theory content and E132 slideshow runtime were not changed.

## Files changed

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/E170_HIERARCHY_ACTIVITY_DATA_ROUTER_REPORT.md`

## Verification required before merge

- JS syntax / static gate.
- PR checks.
- Runtime smoke if an existing workflow covers Math UI.
