# CODEX_STATE

Current task: E202 stable single renderer wired to C02 Level C data.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=202`

Index load decision:
- `index.html` now loads one slideshow renderer only: E202.
- E132/E171/E190/E192 are not loaded by `index.html` after this patch.
- E191/E193/E195 also remain not loaded.

Runtime design:
- E202 is a single renderer path, not stacked chapter wrappers.
- E202 consumes C02 Level C JSON files:
  - `subjects/math/data/theory_slideshow_c02_level_c.json`
  - `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`
- For C02 lessons, E202 renders Level C data.
- For other lessons, E202 falls back to visible E129 Reader source slides.
- E202 keeps the public API name `window.BAUMAN_MATH_THEORY_E132` for compatibility with E129 calls, but the implementation is E202.

Deck length policy:
- 16 slides is the minimum acceptable lesson deck size, not a maximum.
- Do not introduce `MAX_SLIDES=16`, `slice(0,16)`, or equivalent truncation.
- C02 Level C data currently has:
  - §2.1: 20 slides.
  - §2.2: 20 slides.
  - §2.3: 18 slides.
  - §2.4: 18 slides.
  - §2.5: 18 slides.
  - §2.6: 18 slides.

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Files already added earlier for C02 Level C data:
- `subjects/math/data/theory_slideshow_c02_level_c.json`
- `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`

Risk note:
- Browser smoke has not been run from this chat environment.
- If E202 causes movement or fails to load JSON, revert `index.html` to the previous baseline or inspect E202 console output.
- E202 uses one MutationObserver only for detecting presentation state, similar to the old stable renderer pattern. It does not stack additional chapter-specific renderers.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open C01 → Lý thuyết → Trình chiếu.
   - It should open with `Reader fallback` mode.
   - No repeated movement.
4. Open C02 §2.1-§2.6 → Lý thuyết → Trình chiếu.
   - It should show `C02 Level C` mode.
   - §2.1 and §2.2 should show 20 slides.
   - §2.3-§2.6 should show 18 slides.
   - Matrix visuals should appear in the visual block.
5. Open C03 → Lý thuyết → Trình chiếu.
   - It should open with `Reader fallback` mode.
   - No repeated movement.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next actor:
- User local smoke test.
