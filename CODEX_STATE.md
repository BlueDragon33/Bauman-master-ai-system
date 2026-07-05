# CODEX_STATE

Current task: E209 global slideshow routing fix.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`

Design rule:
- Keep one slideshow runtime path only.
- Do not re-enable E190/E191/E192/E193/E195.
- Do not create stacked runtime wrappers.
- Do not use post-render DOM decorators.
- 16 slides is the minimum, not the maximum.

User finding:
- The issue is not limited to C02.
- It can appear across chapters and lessons when the renderer exposes technical fallback state instead of presenting a proper lesson deck.
- Showing `C02 DATA FALLBACK`, `C03 DATA FALLBACK`, or `Reader fallback` as a user-facing learning mode is not acceptable for normal study flow.

Files changed in E209:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- Updated renderer release to `E209_GLOBAL_READER_PRO_AND_LEVEL_C_ROUTING`.
- Updated `index.html` cache buster to `?v=209`.
- Replaced user-facing `Reader fallback` with `Reader Pro`.
- Removed user-facing `C02 DATA FALLBACK` / `C03 DATA FALLBACK` modes.
- For C02/C03, if exact lesson ID matching fails, E209 now tries keyword-based chapter routing:
  - C02 keyword groups choose 2.1-2.6 decks.
  - C03 keyword groups choose 3.1-3.6 decks.
- If C02/C03 is detected but a precise lesson cannot be inferred, E209 falls back to the first Level C deck of that chapter instead of showing Reader fallback.
- Chapters without Level C data now use `Reader Pro`, a clean presentation mode sourced from Reader, not a technical error/fallback mode.

Content routing policy:
- C02 and C03 should render Level C decks when recognized.
- Other chapters should render Reader Pro until their Level C JSON is created and wired.
- The UI should never expose debug-style fallback labels to the learner.

Deck length policy:
- C02 Level C data:
  - §2.1: 20 slides
  - §2.2: 20 slides
  - §2.3-§2.6: 18 slides each
- C03 Level C data:
  - §3.1-§3.6: 18 slides each

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open C02 current example from the screenshot.
   - It should no longer show `C02 DATA FALLBACK`.
   - It should show `C02 Level C` if recognized by keyword/deck routing.
   - If exact lesson cannot be detected, it should use the closest C02 deck, not Reader fallback.
4. Open C02 §2.1, §2.3, §2.6.
   - Expected: `C02 Level C`, correct slide counts, no jump.
5. Open C03 §3.1, §3.4, §3.6.
   - Expected: `C03 Level C`, 18 slides, no jump.
6. Open C01 or any chapter without Level C JSON.
   - Expected: `Reader Pro`, not `Reader fallback`.
7. Test next, previous, Escape, and close.
8. Browser console: 0 errors.

Next safe task after E209 browser smoke passes:
- Continue creating Level C JSON for the next chapter.
- Wire it into the same E202 renderer by data URL and keyword routing only.
- Do not add another slideshow engine.
