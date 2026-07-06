# CODEX_STATE

Current task: E218_READER_PRO_ADVANCED_PANEL_AND_FORMULA_POPUP

Status: PASS

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- Removed the redundant Reader Pro source line `Bài đang được trình chiếu: ...` by clearing and hiding the E210/E202 source-line surface.
- Changed the right panel into `Tham khảo thêm` / advanced-extension content, excluding self-check/basic repeat blocks and excluding formula blocks because formulas now have their own strip + popup.
- Added `Xem công thức đầy đủ` in the formula strip and a modal using existing `#modal` / `#modalBody` with full formula, formula analysis, application, and Python usage.
- Added a window-capture Escape guard so Escape closes the formula modal before E202 closes the deck; Escape still closes the deck when no formula modal is open.
- Reduced box/panel title sizing in E212 while keeping body text readable; formula strip now wraps/scrolls internally instead of truncating with ellipsis.
- Bumped E211/E212 cache busters to `v=218`.
- Rebased over remote E216/E217 updates and kept E218 as the active Reader Pro layer; E211/E212 now remove old E215/E216/E217 injected style tags before applying E218 styles.

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`: PASS
- `node --check subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`: PASS
- Browser smoke: PASS on local static server.
  - Opened Math page and Reader Pro slideshow.
  - Confirmed source line is hidden/empty.
  - Confirmed right panel does not contain self-check content and no longer repeats the formula strip on formula slides.
  - Confirmed formula strip has `Xem công thức đầy đủ`.
  - Confirmed modal opens with all four sections and Python fallback no longer misclassifies `chiều` as projection.
  - Confirmed title sizes are compact while card body text remains readable.
  - Confirmed no measured overflow escapes cards/panel/formula strip.
  - Confirmed next/previous work.
  - Confirmed Escape closes formula modal first, then closes deck when modal is closed.
- Post-rebase browser smoke: PASS after resolving origin/main conflicts in E211/E212/index.

Console result:
- No new E218 console error observed.
- Existing baseline warning still appears from E202/E209: `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`. This was already present before E218 and was not edited in this task.

Remaining risks:
- C02/C03 Level C full smoke remains limited by the existing E209 JSON parse warning outside E218 scope.

Next recommended task:
- Fix the E209 slideshow data JSON parse warning before claiming clean C02/C03 Level C smoke.

---

Current task: E215_READER_PRO_EXTENSION_PANEL_AND_FIT_RULES

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Patch tag: E217_READER_PRO_LARGE_FIRST_FIT

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E217 was made:
- User confirmed E216 correctly simplified the right panel to `Tham khảo thêm`, but typography was still too small and boxes still looked too empty.
- User requested a much stronger visual scale, approximately 2.5x, while keeping safe shrink/scroll behavior if content overflows.

E217 narrow patch summary:
- Only E212 fit/scaling was changed; E211 content bridge was not rewritten.
- E212 release changed to `E217_READER_PRO_LARGE_FIRST_FIT`.
- E212 now removes older E215/E216 fit style tags before injecting E217 styles.
- Reader Pro typography was aggressively increased for:
  - main slide title
  - source line
  - top insight paragraph
  - right `Tham khảo thêm` panel title/body
  - lower card kickers, titles, and bodies
- Short/medium content is now intentionally treated as `light`/large-first more often:
  - lower cards under roughly 560 characters start as `light`
  - right panel under roughly 430 characters starts as `light`
  - insight under roughly 520 characters starts as `light`
- Fit behavior changed from immediate `dense -> overflow` to progressive fallback:
  - large/light first
  - if overflowing, downgrade to `normal`
  - if still overflowing, downgrade to `dense`
  - if still overflowing, downgrade to `overflow`
- Internal scroll remains enabled on insight, right panel, and all lower cards.
- The low-height media rule no longer collapses typography back to tiny E216-style sizes.
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 remains Reader Pro fit/balance only.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211 unchanged: `?v=216`
- E212: `?v=216` -> `?v=217`
- E202 unchanged.
- E210 unchanged.

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state remains `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the same Reader Pro slide shown in the screenshot.
4. Confirm:
   - right panel title remains `Tham khảo thêm`
   - no metadata/header lines returned
   - text is dramatically larger than E216
   - boxes no longer look mostly empty for short content
   - long content shrinks progressively and/or scrolls internally
   - no text escapes any card/container
5. Check next/previous/Escape/close.
6. Browser console should not show new E212 errors.

Known remaining blocker/risk:
- Earlier E215 smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E217 was patched from ChatGPT without browser smoke, C02/C03 Level C still must be verified locally after the baseline JSON issue is fixed or bypassed.

Next safe task if local smoke still fails:
- Patch-only E212 unless content itself is wrong.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use screenshot + selector evidence to adjust only the region still too small/empty or overflowing.

---

Previous task: E216_READER_PRO_REFERENCE_PANEL_AND_HARD_FIT

Previous E216 result:
- Right panel was simplified to `Tham khảo thêm` + extension content.
- E216 still left typography too small and boxes too empty in the screenshot, so E217 increases visual scale much more aggressively.
