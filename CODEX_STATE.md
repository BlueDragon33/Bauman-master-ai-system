# CODEX_STATE

Current task: E234B_PROPER_MATH_FRACTION_AND_RADICAL_RENDERER

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-typeset-E234.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Architecture:
- E202 remains the only slideshow engine.
- E224 remains the Reader Pro formula content/parser bridge.
- E234B is a small display-only typesetter loaded after E224.
- It only processes `.e211-formula-modal .e226-math[data-e226-raw-formula]`.
- Python code, prose, URLs, dates, and paths are outside its selector and are not transformed.

Patch summary:
- Added a balanced-group parser instead of another nested-parentheses regex.
- Added stacked fractions with numerator, bar, and denominator.
- Added square-root rendering whose overbar covers the complete balanced radicand.
- Added nested expression support inside fractions and radicals.
- Preserved and improved common notation:
  - `R^{m x n}` / `R^n`
  - `x_1^T`
  - `A^{-1}`
  - `sum_i`
  - `sum_{i=1}^m`
  - `||x||_2`
  - Greek symbols and relation operators
- `subjects/math/index.html` now loads:
  - E224 with cache `?v=234`
  - `theory-formula-typeset-E234.js?v=234` immediately after E224

Static verification:
- `node --check theory-formula-typeset-E234.js`: PASS before upload.
- Direct renderer tests passed for:
  - `1/2`
  - `1/(m-1)`
  - `(x · y)/(||x||_2 ||y||_2)`
  - `sqrt(sum_i x_i^2)`
  - `sqrt(sum_i (x_i - mu)^2)`
  - `sqrt((a+b)/(c+d))`
  - `A^{-1} = 1/(ad-bc)`
  - `R^{m x n}`
  - `sum_{i=1}^m x_i^2`

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh or disable browser cache.
3. Open `Xem đầy đủ` on:
   - norm/cosine formula
   - covariance formula
   - finite-difference formula
   - inverse-matrix formula
4. Confirm:
   - slash fractions are vertically stacked in supported formula expressions
   - radical bar spans the full expression, including nested parentheses
   - superscripts/subscripts remain correct
   - Python code remains unchanged
   - no new console errors

Remaining risks:
- This is a compact custom renderer, not a complete TeX implementation.
- Ambiguous unparenthesized expressions such as `1/2 x` may still need canonical source parentheses if the intended meaning is `(1/2)x` rather than `1/(2x)`.
- Browser smoke was not available from this chat environment, so status is not PASS yet.

---

Previous task: E234A_SLIDE16_DUPLICATE_ROOT_CAUSE_AND_FIX
Previous status: PASS_BROWSER_SMOKE

E234A result:
- Slide 16 was not locked and was not duplicated in source data.
- E202 rendered again after clamping Next at the final slide, making the same final slide appear duplicated.
- `move()` now no-ops when the clamped destination equals the current index.
- C01/C02/C03 browser smoke passed without hard-coding slide 16.
