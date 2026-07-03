# E162 Runtime Smoke Failure Report

Status: FAIL

Date: 2026-07-03

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: Browser/runtime smoke test using `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`.

Files changed:
- `subjects/math/E162_RUNTIME_SMOKE_FAIL_REPORT.md`

Content/UI edit status:
- Content JSON was not edited.
- UI/runtime files were not patched.
- `CODEX_STATE.md` was not updated because the user instruction for FAIL was to create a failure report only.

## Test setup

- Opened Math page through a local static server:
  - `http://127.0.0.1:8765/subjects/math/index.html`
- Browser title: `Toán Bauman`
- Initial boot console errors: `0`
- Math Theory tab opened on C01 / `GĐ0 · Việt Nam`.

## Partial pass

The current visible lesson, `§1.1 · Vector như dữ liệu kỹ thuật`, can open the E132 slideshow.

Observed:
- Deck header shows `E160 THEORY DECK`.
- Default header shows `Full lecture`.
- First slide shows `01 / 16 · 4 blocks`.
- Full mode rendered 4 `.e132-clean-card` cards and 4 `.e132-full-body` bodies.
- Console errors after opening deck: `0`.

## Runtime failure

The required E161 browser checklist cannot pass because the UI cannot reliably select the required C01 lessons from the reader.

Required lessons:
- `§1.1 · Vector như dữ liệu kỹ thuật`
- `§1.4 · Cơ sở, span và tọa độ`
- `§1.5 · Không gian con và biểu diễn dữ liệu`
- `§1.6 · Từ vector sang ma trận dữ liệu`

Actual issue:
- The E129 lesson/chapter selection UI exists in the DOM, but it is hidden or clipped in the visible runtime layout.
- `.e129-sidebar` is `display: none`.
- `.e129-placeholder` is initially `display: none`.
- `.e129-chip-btn` lesson buttons exist, but initially have `0x0` rects and are not clickable.
- `.e129-reader` is visible but clipped to about `94px` height with `overflow: hidden`, so the reader mainly exposes only:
  - `Kho Lý thuyết`
  - `Trình chiếu`
  - `Tải lại JSON`
- Because `§1.4`, `§1.5`, and `§1.6` cannot be selected through the visible UI, the multi-lesson browser smoke test is blocked.

Additional runtime conflict observed during slideshow keyboard smoke:
- After slideshow key testing reached the `F/C` path, the page remained in presenting mode and the background E129 layout was distorted.
- Observed while presenting:
  - `.e129-reader` rect height was about `13756px`, with a large negative Y position.
  - `.e129-placeholder` rect height was about `12795px`.
  - Lesson chips became visible inside the presenting/background layer.
- This points to a class/layout conflict between E132 presenting/fullscreen behavior and E129 reader/placeholder layout, not to missing lecture JSON.

## Console result

- Browser console error count observed during the failure state: `0`.

## Suspected files

Primary suspects:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

Likely root area:
- E129 reader/sidebar visibility and clipping rules.
- E132 presenting/fullscreen/compact keyboard class handling.
- The bridge between the visible lesson selector and the E132 slideshow source.

## Pass criteria result

FAIL.

Reason:
- Full lecture mode works for the currently selected lesson, but the visible UI cannot select all required C01 lessons.
- Keyboard smoke exposed a layout conflict in presenting mode.
- The test does not show a content JSON problem.

## Next recommended task

Patch UI only, with no content changes:
- Restore a visible, stable lesson selector for C01 inside E129 reader or the protected learning-structure flow.
- Ensure selecting `§1.4`, `§1.5`, and `§1.6` updates the E132 source lesson before opening slideshow.
- Re-scope E132 presenting/fullscreen/compact classes so they do not distort `.e129-reader`, `.e129-placeholder`, or lesson chips behind the overlay.
