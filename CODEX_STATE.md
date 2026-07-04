# CODEX_STATE

Current task: E206 slideshow QA fallback visual fix.

Status: C02_RUNTIME_PATCHED_NEEDS_BROWSER_SMOKE__FALLBACK_VISUAL_FIXED__C03_DATA_READY_NOT_WIRED

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=206`

Index load decision:
- `index.html` loads one slideshow renderer only: E202/E206 implementation.
- E132/E171/E190/E192 are not loaded by `index.html`.
- E191/E193/E195 are not loaded.

Bug found from user screenshot:
- In Reader fallback mode, the visual block incorrectly showed a generic `Input -> Matrix -> Output` diagram.
- This was misleading because fallback mode means the slide is sourced from E129 Reader, not from C02 Level C matrix data.

Patch summary:
- Updated `subjects/math/assets/theory_skin/theory-slideshow-E202.js` to release `E206_STABLE_SINGLE_RENDERER_FALLBACK_VISUAL_QA`.
- Updated `subjects/math/index.html` cache buster from `?v=202` to `?v=206`.
- Fallback now renders a neutral Reader fallback panel instead of a fake matrix flow.
- C02 data fallback now renders a warning panel with data/load status rather than a fake matrix diagram.
- Added friendlier visual labels so raw keys like `matrix_2x2_general` do not show as primary user-facing text.
- Expanded C02 lesson alias matching to reduce accidental fallback for C02 lessons.
- Added `dataError` and `c02LessonKeys` to the public selfCheck output.

Runtime design:
- E206 remains one renderer path, not stacked chapter wrappers.
- E206 consumes C02 Level C JSON files:
  - `subjects/math/data/theory_slideshow_c02_level_c.json`
  - `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`
- For C02 lessons, E206 should render Level C data.
- For other lessons, E206 falls back to visible E129 Reader source slides.
- E206 keeps the public API name `window.BAUMAN_MATH_THEORY_E132` for compatibility with E129 calls.

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
- C03 Level C data currently has:
  - §3.1: 18 slides.
  - §3.2: 18 slides.
  - §3.3: 18 slides.
  - §3.4: 18 slides.
  - §3.5: 18 slides.
  - §3.6: 18 slides.

Important implementation decision:
- C03 data remains intentionally not wired into E206 yet.
- Do not wire C03 runtime until E206 C02 browser smoke is confirmed stable.
- Avoid stacked runtime wrappers, post-render DOM mutation, and chapter-specific override engines.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open C01 → Lý thuyết → Trình chiếu.
   - It should open with `Reader fallback` mode.
   - It must not show the fake `Input -> Matrix -> Output` diagram.
   - It should show a neutral Reader fallback panel.
   - No repeated movement.
4. Open C02 §2.1-§2.6 → Lý thuyết → Trình chiếu.
   - It should show `C02 Level C` mode.
   - §2.1 and §2.2 should show 20 slides.
   - §2.3-§2.6 should show 18 slides.
   - Matrix visuals should appear only for C02 Level C content.
5. Open C03 → Lý thuyết → Trình chiếu.
   - It should still open with `Reader fallback` mode because C03 data is not wired yet.
   - It must not show the fake matrix flow unless the source slide is later wired to actual C03 visuals.
   - No repeated movement.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next safe task after smoke passes:
- Wire C03 JSON into E206 by adding C03 data URLs and detection to the same single renderer.
- Do not create a new runtime wrapper.

Next actor:
- User local smoke test.
