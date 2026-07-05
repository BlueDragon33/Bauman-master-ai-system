# CODEX_STATE

Current task: E215_READER_PRO_EXTENSION_PANEL_AND_FIT_RULES

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Patch tag: E216_READER_PRO_REFERENCE_PANEL_AND_HARD_FIT

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why this patch was made:
- User screenshot showed the Reader Pro right panel still had too much header/meta text and repeated the current slide identity.
- User requested the right panel to contain only the title `Tham khảo thêm`, then immediately the extension content for the current slide.
- User also reported too much empty space in all boxes and requested large typography by default, with controlled shrink/scroll only when content overflows.

E216 narrow patch summary:
- E211 no longer renders right-panel meta/header stack:
  - removed `Mở rộng` tag wrapper from the visual panel output
  - removed `Nội dung mở rộng cho slide`
  - removed lesson title line
  - removed slide title line
  - removed bottom note line
- E211 right panel now renders only:
  - `Tham khảo thêm`
  - the selected non-duplicated extension body
- E211 still excludes these lower-card sections from the right panel:
  - `Diễn giải kỹ thuật`
  - `Câu hỏi tự kiểm`
  - `Câu hỏi đúng cần đặt`
  - other question/self-check variants
- E211 keeps lower cards intact; no lower-card content was intentionally removed.
- E211/E212 typography defaults were increased significantly for insight, right panel, and lower cards.
- E211/E212 keep density hooks:
  - `is-light`
  - `is-normal`
  - `is-dense`
  - `is-overflow`
- E212 now applies stronger internal scroll/fit guards:
  - insight region uses internal scroll
  - right panel uses internal scroll
  - each lower card uses internal scroll
  - overflow state shrinks typography further
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 remains Reader Pro fit/balance only.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211: `?v=215` -> `?v=216`
- E212: `?v=215` -> `?v=216`
- E202 unchanged.
- E210 unchanged.

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- Only repository file fetch/readback can be verified from this chat environment.
- No browser smoke was run from this chat environment.
- No DOM/layout measurement was run after E216.
- Required state is therefore `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the same Reader Pro slide shown in the screenshot.
4. Confirm the right panel shows exactly:
   - title: `Tham khảo thêm`
   - extension content immediately below
   - no `Nội dung mở rộng cho slide`
   - no lesson title line
   - no slide title repeat
   - no bottom note line
5. Check all lower cards:
   - text should be visibly larger than E215
   - short cards should not look empty/tiny
   - long cards must shrink and/or use internal scroll
   - no text may escape its card/container
6. Check next/previous/Escape/close.
7. Browser console should not show new E211/E212 errors.

Known remaining blocker/risk:
- Earlier E215 smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E216 was patched from ChatGPT without browser smoke, C02/C03 Level C still must be verified locally after the baseline JSON issue is fixed or bypassed.

Next safe task if local browser smoke still fails:
- Patch-only E211/E212.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use the screenshot + DOM selector evidence to adjust only the box that still overflows or looks empty.

---

Previous task: E215_READER_PRO_EXTENSION_PANEL_AND_FIT_RULES

Previous status before E216: PATCHED_NEEDS_C02_C03_BASELINE_FIX

Previous E215 summary:
- Replaced generic summary behavior with an explicit `Mở rộng` / `Nội dung mở rộng cho slide` panel.
- Added density classes and internal scroll handling.
- C01 §1.1 browser smoke reportedly passed in Codex.
- C02/C03 Level C could not be verified because of the upstream E209 slideshow data JSON parse issue.
