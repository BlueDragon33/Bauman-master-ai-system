# CODEX_STATE

Current task: E213 Reader Pro balance guard after failed oversized layout.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js?v=212`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js?v=212`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 only adds lesson identity labels.
- E211 supplies canonical Reader Pro content plus Reader Pro summary panel.
- E212 now includes the E213 Reader Pro balance guard.
- E210/E211/E212 do not control next/previous/open/close.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User finding:
- The previous Reader Pro layout was not acceptable.
- The title could be clipped at the top.
- The hero/top section was too large and pushed the bottom cards out of view.
- The right summary panel could become too tall.
- This means the UI was not properly smoke-tested before reporting.

Files changed in E213:
- Updated `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`.
- `index.html` was not changed because it already loads E212 with `?v=212`.
- `CODEX_STATE.md` updated.

Patch summary:
- E213 balance guard is merged into the already-loaded E212 file.
- It applies only in `Reader Pro` mode and only when the active deck has `e211-reader-pro`.
- Title is capped to two lines and smaller clamp values.
- Hero/top area is constrained to about 54-57% of the slide height.
- Bottom card area is guaranteed a minimum height.
- Right summary panel uses internal scrolling if its bullet list is long.
- Main insight and cards use internal scrolling instead of being lost outside the slide.
- Bottom cards stay visible and readable; content is not hard-clipped away.
- C02/C03 Level C should not be affected.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the exact Reader Pro slide from the screenshot.
   - The title must not be cut at the top.
   - Bottom cards must remain visible.
   - Right summary panel must not push the layout downward.
   - If text is long, scroll should appear inside the relevant panel/card instead of losing content.
4. Open another Reader Pro slide with shorter content.
   - It should not look empty or tiny.
5. Open C02/C03 Level C.
   - Expected: unaffected.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next safe task:
- Only continue content wiring after Reader Pro layout is confirmed stable by local browser smoke.
