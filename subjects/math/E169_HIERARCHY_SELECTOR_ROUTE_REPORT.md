# E169 Math Hierarchy Selector + Learning Path Router Report

Date: 2026-07-04
Branch: main
Status: PASS

## Scope

- Patched only Math Theory UI/state/routing.
- Kept E129 Reader full content.
- Did not edit E132 Slideshow runtime.
- Did not edit theory content JSON.
- Did not scan the whole repository.

## Files Read

- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/data/theory_lecture_frame.json`
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/index.html`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/assets/core-subject.js`

## Files Changed

- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/E169_HIERARCHY_SELECTOR_ROUTE_REPORT.md`

Existing local E165C report changes were preserved:

- `subjects/math/E165C_CONTENT_PACKAGE_MISSING_REPORT.md`

## Changes Made

- Replaced the exposed chapter title / horizontal § lesson chips in the Theory selector area with a large `Khối kiến thức` control.
- Added a four-level cascade:
  - Khối kiến thức
  - Học phần
  - Chương
  - Bài giảng / Hoạt động
- Added clickable breadcrumb buttons for all four levels.
- Routed C01 theory selections to the existing E129 `lessonId` records.
- Added safe placeholders for non-theory activities when no clear standalone runtime renderer exists.
- Added Chương 15 activity frame text exactly as requested.
- Preserved E129 full reader rendering from `slides[]`.
- Preserved E132 slideshow behavior.

## Route Map

Found / mapped:

- Lý thuyết -> `learnTab = theory`
- Bài tập -> `learnTab = exercises`
- Thực hành -> `learnTab = practice`
- Ôn tập -> `learnTab = review`
- Kiểm tra -> `learnTab = exam`

No clear separate route found:

- Ứng dụng thực tế -> safe E129 placeholder with `learnTab = application`

## Browser Smoke

Local URL:

- `http://127.0.0.1:8770/subjects/math/index.html`

Results:

- Math module opened: PASS
- Theory tab opened: PASS
- Large `Chương 1 · Vector...` selector heading removed: PASS
- Exposed §1.1–§1.6 chip row removed: PASS
- `Khối kiến thức` button visible: PASS
- Popup module level opens: PASS
- Module -> Course -> Chapter -> Activity cascade: PASS
- Breadcrumb buttons reopen correct levels: PASS
- C01 §1.2 routed to correct E129 lesson: PASS
- E129 Reader still shows 16 full slides: PASS
- Non-theory activity placeholders render cleanly: PASS
- Chương 15 special activity details visible: PASS
- E132 slideshow opens: PASS
- E132 formula slide renders formula block: PASS
- Horizontal overflow: PASS
- Mobile 375px overflow/wrap: PASS
- Console errors: 0

Post-rebase E168/E169 combined smoke:

- E169 router still visible: PASS
- Exposed § chips: 0
- E132 header: `E168 COMPACT MATH DECK`
- E132 mode label: `Per-slide formula`
- E132 card count: 4
- Full lecture text present: no
- Console errors: 0

## Static Verification

- `node --check subjects/math/assets/theory_skin/theory-tab-E129.js`: PASS
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E132.js`: PASS
- `theory_lecture_frame.json` parse: PASS
- `theory_lecture_content.json` parse: PASS
- C01 records: 6
- C01 slide counts: 16, 16, 16, 16, 16, 16

## Remaining Risks

- `Ứng dụng thực tế` has no distinct confirmed tab renderer, so it intentionally uses a clean placeholder.
- E132 remains unchanged; it still uses the existing slideshow behavior from E164/E163.

## Next Recommended Task

- Provide real content/runtime packages for the placeholder activity areas if they should become full interactive tabs.
