# E163 UI Runtime Patch and Smoke Pass Report

Status: PASS

Date: 2026-07-03

Branch: `codex/e150-c01-l01-clean-replacement`

Scope:
- UI/runtime patch only for Math Theory E129/E132.
- No content JSON edit.
- No lesson/frame/manifest edit.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/E163_UI_RUNTIME_PATCH_AND_SMOKE_PASS_REPORT.md`
- `CODEX_STATE.md`

## Root cause

E129 normal learner CSS hid `.e129-placeholder`.

That placeholder contains:
- the active lesson title;
- `button.e129-chip-btn` lesson selector;
- `.e129-slide-list`, which E132 uses as slideshow source after presenting mode opens.

As a result, C01 lesson chips existed in the DOM but had `0x0` runtime rects and could not be clicked.

E132 also reset Compact mode back to Full because its MutationObserver re-ran `enhance()` after deck render. `enhance()` called `openDeck()` again while the overlay was already open, and `openDeck()` resets `mode = 'full'`.

## Changes made

E129 CSS:
- Re-exposed `.e129-placeholder` in normal learner view.
- Kept technical badge/lessonId metadata hidden.
- Made C01 lesson chips visible and clickable.
- Kept `.e129-slide-list` visible but bounded in a scrollable panel.

E132 JS:
- Guarded `enhance()` so it does not call `openDeck()` again while the E132 overlay is already open.
- This preserves Compact/Full mode and prevents observer-driven mode reset.

## Verification

Syntax:
- `node --check subjects/math/assets/theory_skin/theory-tab-E129.js`: PASS
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E132.js`: PASS

Browser smoke:
- Math page opened through local static server: PASS
- Console errors: `0`
- Initial C01 lesson chips visible: `6/6`
- Reader no longer collapses to header-only: PASS
- Slide list is scrollable, not page-expanding: PASS

Lessons tested:
- `§1.1 · Vector như dữ liệu kỹ thuật`
- `§1.4 · Cơ sở, span và tọa độ`
- `§1.5 · Không gian con và biểu diễn dữ liệu`
- `§1.6 · Từ vector sang ma trận dữ liệu`

For each tested lesson:
- Lesson chip selected the correct lesson title: PASS
- `Trình chiếu` opened overlay: PASS
- Header showed `E160 THEORY DECK`: PASS
- Default mode showed `Full lecture`: PASS
- First slide showed `01 / 16 · 4 blocks`: PASS
- Full mode rendered `4` cards and `4` full bodies: PASS
- Full body text had no ellipsis clamp: PASS
- Compact button switched to `Compact preview`: PASS
- Full button switched back to `Full lecture`: PASS

Keyboard check:
- `ArrowRight`: PASS
- `ArrowLeft`: PASS
- `Space`: PASS
- `F`: PASS
- `C`: PASS
- `Escape`: PASS, exited back to E129 reader

## Main sync status

At report creation time:
- PASS on feature branch.
- Ready for controlled main sync after JSON/runtime checks.

## Next recommended task

Sync verified E163 result into `main`, push `main`, then user can pull directly from `main`.
