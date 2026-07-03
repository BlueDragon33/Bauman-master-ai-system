# E162 Runtime Smoke Failure Report

Status: FAIL

Date: 2026-07-03

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: Runtime/browser smoke test using `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`.

Files changed:
- `subjects/math/E162_RUNTIME_SMOKE_FAIL_REPORT.md`
- `CODEX_STATE.md`

Content/UI edit status:
- Content JSON was not edited.
- UI/runtime files were not patched.
- No main sync was performed.

## Git state

Current branch:
- `codex/e150-c01-l01-clean-replacement`

`git log --oneline -8`:
- `df38ae7 Short update CODEX_STATE with main pull rule`
- `371d602 Update protocol with main sync pull rule`
- `b5f0348 test(math): report E162 runtime smoke failure`
- `4d8068b E161 update CODEX_STATE static smoke browser pending`
- `0db7c79 E161 add static smoke browser checklist`
- `c3efa34 E160 update CODEX_STATE after UI-only patch`
- `a06c0bc E160 add E132 full lecture mode patch report`
- `5055bca E160 patch E132 full lecture mode CSS`

## E132 release check

Browser automation global probe:
- `window.BAUMAN_MATH_THEORY_E132`: `undefined`
- `window.BAUMAN_MATH_THEORY_E132?.release`: `undefined`
- `window.BAUMAN_MATH_THEORY_E132?.selfCheck?.()`: unavailable

Important context:
- Browser automation also could not see `window.BAUMAN_MATH_THEORY_E129`, `window.__MATH_STATE`, or `window.__BAUMAN_CORE_API`, even though the E129 DOM was rendered.
- The page script tag for `assets/theory_skin/theory-slideshow-E132.js?v=136` exists.
- The local server returned that script with HTTP `200`.
- The served script contains both `E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE` and `BAUMAN_MATH_THEORY_E132`.
- `node --check` passed for:
  - `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
  - `subjects/math/assets/theory_skin/theory-tab-E129.js`

Because the checklist explicitly requires the browser console/global release check, this is not a PASS.

## Runtime UI smoke

Opened:
- `http://127.0.0.1:8765/subjects/math/index.html`

Initial boot:
- Browser title: `Toán Bauman`
- Console errors: `0`

Current visible lesson:
- `§1.1 · Vector như dữ liệu kỹ thuật`

`Trình chiếu` result for current lesson:
- The `Trình chiếu` button was visible and clickable.
- Overlay opened.
- Header showed `E160 THEORY DECK`.
- Header showed `01 / 16 · 4 blocks`.
- Mode label showed `Full lecture`.
- Full mode rendered 4 `.e132-clean-card` cards.
- Full mode rendered 4 `.e132-full-body` bodies.
- Body text style had no ellipsis clamp:
  - `textOverflow: clip`
  - `webkitLineClamp: none`
  - `whiteSpace: pre-wrap`
- Console errors after opening overlay: `0`

## Exact failure

The required multi-lesson smoke could not be completed because the E129 lesson selector is hidden/clipped in the runtime layout.

Required lessons:
- `§1.1 · Vector như dữ liệu kỹ thuật`
- `§1.4 · Cơ sở, span và tọa độ`
- `§1.5 · Không gian con và biểu diễn dữ liệu`
- `§1.6 · Từ vector sang ma trận dữ liệu`

Observed before opening slideshow:
- `.e129-sidebar`
  - `display: none`
  - rect: `0x0`
- `.e129-reader`
  - visible, but rect height about `94px`
  - `overflow: hidden`
  - visible controls are mainly `Kho Lý thuyết`, `Trình chiếu`, `Tải lại JSON`
- `.e129-placeholder`
  - `display: none`
  - rect: `0x0`
- `.e129-slide-list`
  - rect: `0x0`
- `.e129-chip-btn` lesson buttons for `§1.1` through `§1.6`
  - exist in the DOM
  - rect: `0x0`
  - not visible/clickable through the UI

Consequence:
- `§1.4`, `§1.5`, and `§1.6` cannot be selected through the visible UI.
- The checklist items for those lessons cannot be executed.
- C01 baseline cannot be marked ready.
- Main must not be synced.

## Suspected files

Primary suspects for the next UI-only patch:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

Likely root area:
- E129 reader/sidebar/placeholder visibility and clipping.
- Lesson selection UI is present but not exposed in the usable reader layout.
- E132 overlay itself can render the current lesson, but the source lesson cannot be changed through the visible UI.

## Pass criteria result

FAIL.

Reason:
- E132 current-lesson overlay partially works.
- Browser global release/selfCheck check is not available through the runtime probe.
- Required lesson selection for `§1.4` through `§1.6` is blocked by hidden/clipped UI.
- No console errors were observed, so this appears to be a layout/visibility/runtime integration issue rather than a lecture JSON issue.

## Main sync / pull instruction

- Do not pull `main` for this result.
- This FAIL result exists only on `codex/e150-c01-l01-clean-replacement`.
- Pull this branch only for diagnosis:
  - `git checkout codex/e150-c01-l01-clean-replacement`
  - `git pull origin codex/e150-c01-l01-clean-replacement`

## Next recommended task

E163 UI-only patch, with no content changes:
- Restore a visible, stable lesson selector for C01 in the E129 Theory reader flow.
- Ensure selecting `§1.4`, `§1.5`, and `§1.6` updates the E132 slideshow source.
- Re-run E162 browser smoke after the UI-only patch.
