# CODEX_STATE

Current task: E219_READER_PRO_TITLE_BODY_AND_FORMULA_PURPOSE_FIX

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E219 was made:
- User screenshot and feedback showed E218 PASS was not acceptable visually/functionally.
- The previous fit layer still confused table titles with table body content.
- Main Reader Pro title needed only a small reduction, not a full rescale.
- Other table titles needed a small increase, not random shrink/grow.
- Body text should only move within a narrow four-size band when density changes.
- Formula strip/popup still did not meet the intended purpose.

E219 patch summary:
- E211 release: `E219_READER_PRO_FORMULA_MODAL_REPAIR`.
- E212 release: `E219_READER_PRO_TITLE_BODY_SEPARATION`.
- Main slide title is treated as its own title surface and reduced gently.
- Right-panel title and lower-card titles are treated separately from body content.
- Lower-card and right-panel titles were increased modestly compared with E218 compact titles.
- Body typography now changes in a controlled narrow band only:
  - light/normal/dense/overflow body text differs by roughly four px, not by half.
  - overflow relies on internal scroll instead of collapsing the body to tiny text.
- Formula handling was repaired in E211:
  - collects all formula blocks on the slide, not only the first formula block.
  - formula preview uses full text with internal scroll, not ellipsis truncation.
  - formula button is rebound directly on the button with stopImmediatePropagation.
  - button text changed to `Xem đầy đủ` to make the action shorter and clearer.
  - popup includes full formula, formula analysis, application, and Python usage.
  - popup has fallback overlay if the existing `#modal` / `#modalBody` surface is unavailable.
  - Python fallback now detects combined norm/dot/distance/cos formula sets and gives one combined NumPy example.
- Right panel remains `Tham khảo thêm` and does not reintroduce lesson/slide metadata.
- Redundant `Bài đang được trình chiếu...` line remains hidden.
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 remains Reader Pro fit/balance only.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211: `?v=218` -> `?v=219`
- E212: `?v=218` -> `?v=219`
- E202 unchanged.
- E210 unchanged.

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state is `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the same Reader Pro formula slide.
4. Confirm title/body separation:
   - main title is only slightly smaller than before.
   - right panel and card titles are slightly larger than E218 compact titles.
   - body text stays readable and changes only within a narrow band when content overflows.
5. Confirm formula behavior:
   - formula strip no longer uses ellipsis truncation.
   - long formula content scrolls internally if needed.
   - clicking `Xem đầy đủ` opens the formula popup.
   - popup contains full formula, analysis, application, and Python usage.
6. Confirm source line remains hidden.
7. Confirm next/previous/Escape/close still work.
8. Browser console should not show new E211/E212 errors.

Known remaining blocker/risk:
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E219 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only E211/E212.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use screenshot + selector evidence to adjust only the failing surface.
