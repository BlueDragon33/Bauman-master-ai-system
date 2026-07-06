# CODEX_STATE

Current task: E223_READER_PRO_FORMULA_MODAL_AMBER_LESSON_LAYOUT

Status: PASS

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- E211 release updated to `E223_READER_PRO_FORMULA_MODAL_AMBER_LESSON_LAYOUT`.
- Formula popup theme shifted from cyan/teal neon to a darker amber/yellow-orange lesson popup:
  - darker overlay and card gradient
  - amber border/glow/accent buttons
  - warm heading/context text with stronger contrast
- Preserved the E222 compact centered popup frame and vertical right code panel.
- Changed `formulaModalHtml` so the left content renders like a lesson:
  - `Công thức đầy đủ` uses formula sub-boxes.
  - `Phân tích công thức` uses stacked lesson boxes such as meaning/conditions/mistake guard.
  - `Ứng dụng` uses stacked lesson boxes when content is long enough.
  - Left column now scrolls as one lesson stack instead of forcing each section into a cramped mini-scroll.
- Right code panel remains vertical and now includes:
  - `Python snippet`
  - `Ghi chú khi chạy`
- E211 cache-buster changed from `?v=222` to `?v=223`.
- E202 was not touched and no slideshow engine was added.

Verification:
- `git pull origin main`: PASS, fast-forwarded to remote before patch.
- `node --check subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`: PASS.
- Browser smoke on local static server: PASS.
  - Opened Math page, Reader Pro slideshow, formula slide.
  - Clicked `Xem đầy đủ`.
  - Confirmed popup opens above slideshow.
  - Confirmed amber/darker theme via live computed styles.
  - Confirmed 3 left lesson sections and 6 `.e211-lesson-box` sub-boxes.
  - Confirmed right code panel remains vertical and narrower than the left column.
  - Confirmed sections no longer self-overflow; left lesson stack scrolls internally when needed.
  - Confirmed Escape closes modal first, next/previous still work, second Escape closes deck.
- Screenshot capture timed out in the in-app browser, so visual verification used live DOM/computed-style/layout measurements.

Console result:
- No new E211 errors observed.
- Existing E202/E209 warning still appears: `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.

Remaining risks:
- C02/C03 Level C smoke is still affected by the existing E209 JSON parse warning outside E223 scope.

---

Current task: E222_READER_PRO_FORMULA_MODAL_COMPACT_NEON_FRAME

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E222 was made:
- User requested the formula popup frame to look more polished: add an outer border, reduce the full formula frame size by roughly 1/10, keep it centered, and make the neon background slightly brighter.

E222 patch summary:
- E211 release: `E222_READER_PRO_FORMULA_MODAL_COMPACT_NEON_FRAME`.
- Formula popup card size reduced by roughly 10%:
  - width changed from about `1180px` to about `1062px`.
  - height changed from about `720px` to about `648px`.
  - responsive sizing now uses a tighter 90vw/90vh ceiling.
- Popup remains centered with `margin:auto` and grid centering on the overlay.
- Added a stronger outside frame:
  - 2px teal border.
  - subtle external outline with offset.
  - extra cyan/teal glow layer.
- Background made slightly brighter and more neon:
  - radial teal overlay behind the card.
  - brighter blue/teal gradient inside the card.
  - brighter panel borders and mild inner glow.
- Existing vertical code layout from E221 was preserved:
  - left wide column: three stacked panels.
  - right narrow column: vertical Python code panel.
- Existing top-layer z-index behavior was preserved, so the popup should remain above the slideshow.
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 was not changed in E222.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211: `?v=221` -> `?v=222`
- E212 unchanged: `?v=219`
- E202 unchanged.
- E210 unchanged.

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state is `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open Reader Pro formula slide.
4. Click `Xem đầy đủ`.
5. Confirm popup is smaller by roughly 10%, centered, and still above slideshow.
6. Confirm the outside border/outline is visible and looks clean, not cramped.
7. Confirm neon background is slightly brighter but still readable.
8. Confirm vertical code panel layout remains correct.
9. Confirm content is visible/scrollable and close/Escape still work.
10. Browser console should not show new E211 errors.

Known remaining blocker/risk:
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E222 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only E211.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use screenshot + selector evidence to adjust only formula modal frame/background.

---

Previous task: E221_READER_PRO_FORMULA_MODAL_VERTICAL_CODE_LAYOUT

Previous E221 summary:
- Changed the formula popup from bottom horizontal code panel to a vertical side code panel.
- E222 preserves that structure and only improves the frame size, outer border, centering, and neon background.
