# CODEX_STATE

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
