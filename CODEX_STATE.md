# CODEX_STATE

Current task: E205 slideshow stability gate added.

Status: C02_RUNTIME_PATCHED_NEEDS_SMOKE__C03_DATA_READY_NOT_WIRED__GATE_ACTIVE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=202`

Stability gate:
- Added `subjects/math/docs/slideshow_stability_gate_E205.md`.
- Do not wire any new chapter data into E202 until current E202 C02 browser smoke passes.
- The next chapter data waiting to be wired is C03.
- C03 data is ready but must stay unwired until smoke PASS.

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
- C03 Level C data currently has:
  - §3.1: 18 slides.
  - §3.2: 18 slides.
  - §3.3: 18 slides.
  - §3.4: 18 slides.
  - §3.5: 18 slides.
  - §3.6: 18 slides.

Files changed in E202 runtime pass:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/index.html`

Files added for C02 Level C data:
- `subjects/math/data/theory_slideshow_c02_level_c.json`
- `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`

Files added for C03 Level C data:
- `subjects/math/data/theory_slideshow_c03_level_c.json`
- `subjects/math/data/theory_slideshow_c03_level_c_part_3_4_6.json`

Files added for stability governance:
- `subjects/math/docs/slideshow_stability_gate_E205.md`

C03 Level C coverage includes:
- Function as input-output model, domain/range, parameterized functions, composition, invertibility, continuity.
- Derivative as local sensitivity, tangent line, finite difference, Taylor approximation, Jacobian.
- Gradient as vector sensitivity, direction of fastest change, contour geometry, gradient norm, Hessian preview.
- Gradient descent, learning rate, loss history, batch/SGD/mini-batch, momentum, clipping, stopping criteria.
- Loss functions: MSE, MAE, cross entropy, regularization, extrema, saddle, convexity, validation loss.
- Backpropagation: chain rule, forward/backward pass, layer gradients, vanishing/exploding gradient, autograd, training loop.

Important implementation decision:
- C03 data was intentionally not wired into E202 yet.
- Do not wire C03 runtime until E202 C02 browser smoke is confirmed stable.
- Avoid stacked runtime wrappers, post-render DOM mutation, and chapter-specific override engines.

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
   - It should still open with `Reader fallback` mode because C03 data is not wired yet.
   - No repeated movement.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next safe task after smoke passes:
- Wire C03 JSON into E202 by adding C03 data URLs and detection to the same single renderer.
- Do not create a new runtime wrapper.

Next actor:
- User local smoke test.
