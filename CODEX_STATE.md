# CODEX_STATE

Current task: E208 C03 Level C content wired into professional single renderer.

Status: C02_BROWSER_SMOKE_PREVIOUSLY_PASS__C03_RUNTIME_PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=208`

Design rule:
- Keep one slideshow runtime path only.
- Do not re-enable E190/E191/E192/E193/E195.
- Do not create stacked runtime wrappers.
- Do not use post-render DOM decorators.
- 16 slides is the minimum, not the maximum.

Files changed in E208:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- Kept the E207 professional compact UI:
  - hero area
  - compact formula strip
  - 3 cards only: `Ý chính`, `Ứng dụng / Ý nghĩa`, `Tự kiểm`
  - no duplicated bottom formula rail
- Wired C03 Level C JSON into the same E202 renderer.
- Added data URLs:
  - `data/theory_slideshow_c03_level_c.json`
  - `data/theory_slideshow_c03_level_c_part_3_4_6.json`
- Generalized lesson aliasing for C02 and C03:
  - `2.1` to `2.6`
  - `3.1` to `3.6`
  - `bài 2.x`, `bài 3.x`
  - `§2.x`, `§3.x`
  - `c02l0x`, `c03l0x`
- Added mode detection:
  - C02 lessons render as `C02 Level C`.
  - C03 lessons render as `C03 Level C`.
  - Other lessons remain `Reader fallback`.
- Added C03 visual handling for common calculus/gradient keys:
  - function input-output, domain, range, graph, linear/nonlinear function
  - derivative sensitivity, tangent, finite difference, Taylor, Jacobian
  - gradient vector, contour, norm, Hessian
  - gradient descent, learning rate, loss history, SGD, mini-batch, momentum, clipping
  - loss functions, regularization, extrema, saddle, validation loss
  - chain rule, forward/backward pass, autograd, training loop

Deck length policy:
- C02 Level C data:
  - §2.1: 20 slides
  - §2.2: 20 slides
  - §2.3-§2.6: 18 slides each
- C03 Level C data:
  - §3.1-§3.6: 18 slides each

Important note:
- Browser smoke has not been run from this chat environment for E208.
- C02 had prior browser smoke PASS under E207 before C03 wiring.
- C03 now needs browser smoke.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open C02 §2.1 and confirm it still shows `C02 Level C`, 20 slides, no jump.
4. Open C02 §2.3 and confirm it still shows `C02 Level C`, 18 slides, no jump.
5. Open C03 §3.1 and confirm it shows `C03 Level C`, 18 slides.
6. Open C03 §3.4 and confirm it shows `C03 Level C`, 18 slides, gradient descent visual.
7. Open C03 §3.6 and confirm it shows `C03 Level C`, 18 slides, backprop/training-loop visual.
8. Open C01 and confirm it still uses `Reader fallback`.
9. Test next, previous, Escape, and close.
10. Browser console: 0 errors.

Next safe task after E208 browser smoke passes:
- Continue content wiring to the next chapter using the same data+single-renderer pattern.
- Do not add another slideshow engine.
