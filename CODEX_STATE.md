# CODEX_STATE

Current task: E207 E202 professional slideshow UI redesign.

Status: BROWSER_SMOKE_PASS

Date: 2026-07-05
Branch: `main`

Scope:
- Redesign only the active Math slideshow renderer `theory-slideshow-E202.js`.
- Keep one runtime path only; do not re-enable E190/E191/E192/E193/E195.
- Do not edit lesson content JSON or Reader/runtime files outside E202.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/data/theory_slideshow_c02_level_c.json`
- `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`

Patch summary:
- Rebuilt the E202 slide render shape into a compact professional learning deck:
  - hero area with title/insight on the left and visual block on the right
  - one compact formula strip only
  - exactly 3 cards: `Ý chính`, `Ứng dụng / Ý nghĩa`, `Tự kiểm`
  - removed the large formula card and hidden the old bottom formula rail
  - reduced top bar/stage/card padding and shortened the footer hint
- Replaced generic fallback visual behavior:
  - Reader fallback now uses a compact fallback panel and no fake matrix graphic
  - unknown visuals no longer default to `Input -> Matrix -> Output`
- Added specific E202 visual handling for C02 keys:
  - `linearity_two_rules` / `linearty_two_rules`
  - `matrix_2x2_general`, `matrix_3x3_general`
  - `matmul_2x2_expanded`
  - `rank_core`, `column_space`, `null_space`
  - `inverse_2x2_formula`
  - `rotation_geometry`, `projection_geometry`
  - `covariance_matrix`, `svd_pca`
- Stabilized deck reopen behavior:
  - `read()` resets index only when the active lesson changes or index exceeds model length
  - `openDeck()` resets to slide 1 when the user opens slideshow again

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E202.js`: PASS
- `index.html` browser load: only `assets/theory_skin/theory-slideshow-E202.js?v=206` present; no other slideshow runtime loaded.
- Post-rebase smoke after integrating `origin/main@68a767f`: C01 fallback, C02 §2.1-§2.6, and C03 fallback all PASS.
- Browser console warn/error logs during smoke: 0.
- C01 fallback smoke:
  - opens as `Reader fallback`
  - `01 / 16 · 3 cards`
  - compact fallback panel visible
  - no fake matrix visual
  - no formula rail duplication
  - next works, no auto-jump, Esc closes: PASS
- C02 Level C smoke:
  - §2.1: PASS, `linearity_two_rules` shows `A(u+v)=Au+Av` and `A(αu)=αAu`
  - §2.2: PASS, `matmul_2x2_expanded` shows `ae+bg`
  - §2.3: PASS, rank/column/null visuals show expected math
  - §2.4: PASS, inverse visual shows `det(A)=ad-bc`
  - §2.5: PASS, rotation/projection visuals show `RᵀR=I` and compact projection note
  - §2.6: PASS, covariance/SVD visuals show `var(x1)` and `UΣV`
  - all C02 checks used 3 cards, one formula strip, and no bottom formula rail
- C03 fallback smoke:
  - opens as `Reader fallback`
  - `01 / 16 · 3 cards`
  - compact fallback panel visible
  - no fake matrix visual
  - next/previous/close works
  - console warn/error logs: 0
- Close controls:
  - next: PASS
  - previous: PASS
  - `Thoát` button: PASS
  - Escape key via browser CUA keypress: PASS

Remaining risks:
- E202 still uses inline CSS injection inside the existing single renderer, by request. Future visual polish should stay in E202 unless a dedicated CSS pass is explicitly requested.

Next recommended task:
- If desired, capture a small screenshot set for C02 2.1/2.3/2.6 visual QA before content expansion continues.

Current task: E206 E202 runtime stability smoke audit.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `main_synced_to_24542e0_then_local_state_update`

Scope:
- Inspect and smoke-test the current single-runtime slideshow architecture.
- Do not wire C03 into E202.
- Do not load E132/E171/E190/E191/E192/E193/E195.
- Do not edit content JSON or create another runtime wrapper.

Files read:
- `CODEX_STATE.md`
- `subjects/math/docs/slideshow_stability_gate_E205.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/data/theory_slideshow_c02_level_c.json`
- `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`

Files changed:
- `CODEX_STATE.md`

Static inspection:
- `index.html` loads exactly one slideshow runtime script: `assets/theory_skin/theory-slideshow-E202.js?v=202`.
- E132/E171/E190/E191/E192/E193/E195 are not loaded by `index.html`.
- E202 exposes one compatibility API name, `window.BAUMAN_MATH_THEORY_E132`, from the single E202 file only.
- E202 C02 data URLs include only C02 JSON; C03 JSON is not wired.
- No `MAX_SLIDES=16` or `slice(0,16)` cap found.
- E202 observer uses a scheduled `requestAnimationFrame(enhance)` and `enhance()` returns early when deck is already open with `e132-overlay-open`, so inspected code does not show a continuous reopen loop.

Syntax/static verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E202.js`: PASS
- C02 JSON parse: PASS
- C02 slide counts:
  - 2.1: 20 slides
  - 2.2: 20 slides
  - 2.3: 18 slides
  - 2.4: 18 slides
  - 2.5: 18 slides
  - 2.6: 18 slides
- C02 malformed slide check: PASS

Browser smoke actually run:
- Local no-cache server opened `subjects/math/index.html`.
- Initial page load: only E202 slideshow script present; browser warn/error logs empty.
- C01 1.1 fallback:
  - Opened deck: PASS
  - Mode: `Reader fallback`
  - Count: `01 / 16`
  - No auto-jump after wait: PASS
  - Next: PASS (`02 / 16`)
  - Previous: PASS (`01 / 16`)
  - Close/Thoat: PASS
  - Browser warn/error logs: 0
- C02 2.1:
  - Mode: `C02 Level C`
  - Count: `01 / 20`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0
- C02 2.2:
  - Mode: `C02 Level C`
  - Count: `01 / 20`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0
- C02 2.3:
  - Mode: `C02 Level C`
  - Count: `01 / 18`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0
- C02 2.4:
  - Mode: `C02 Level C`
  - Count: `01 / 18`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0
- C02 2.5:
  - Mode: `C02 Level C`
  - Count: `01 / 18`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0
- C02 2.6:
  - Mode: `C02 Level C`
  - Count: `01 / 18`
  - Visual block present: PASS
  - No auto-jump after wait: PASS
  - Next/previous/close: PASS
  - Browser warn/error logs: 0

Browser smoke not completed:
- C03 fallback smoke was started after selecting C03. The picker exposed C03 3.1-3.6 lesson options and C03 was still not wired into E202 at static inspection.
- Before opening C03 slideshow, the browser automation security policy blocked further use of the local URL. The test was stopped without attempting a workaround.
- Because C03 browser smoke is incomplete, do not mark E202 as fully PASS and do not wire C03 yet.

Root cause:
- No E202 runtime code defect was confirmed during this audit.
- No patch to E202 was made.

Remaining risks:
- C03 Reader fallback still needs one local browser smoke: open C03 -> Ly thuyet -> Trinh chieu, confirm `Reader fallback`, no auto-jump, next/previous/Escape/Thoat, console 0 errors.
- E202 should not be considered ready for C03 wiring until that C03 fallback smoke passes.

Next safe step:
- Run the missing C03 fallback smoke locally. If it passes, update status to `E202_C02_BROWSER_SMOKE_PASS__READY_TO_WIRE_C03_NEXT` and only then wire C03 into the same E202 renderer.

---

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
