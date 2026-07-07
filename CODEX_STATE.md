# CODEX_STATE

Current task: E235_FRACTION_AXIS_ALIGNMENT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Root cause:
- E234B correctly created stacked fractions, but `.e234-fraction` used `vertical-align:-.55em`.
- That pulled every fraction too low relative to the surrounding equation baseline.
- Numerator and denominator also used full outer font size, making the fraction block feel heavy and visually unbalanced.

Patch summary:
- Added a small CSS-only bridge loaded after E234B.
- Fraction blocks now use `vertical-align: middle` with a tiny upward correction.
- Numerator and denominator use 90% font size.
- Numerator/denominator padding is symmetric around the fraction bar.
- Both rows stretch to the same width and remain centered.
- Nested fractions receive a small scale reduction.
- Parser, raw formula data, radical rendering, Python code, and content were not modified.

Index load order:
- E224 formula parser/content bridge
- E234 balanced fraction/radical typesetter
- E235 fraction alignment override
- E212 fit bridge

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable cache.
3. Open cosine, covariance, inverse-matrix, and finite-difference formulas.
4. Confirm:
   - the equation lhs and fraction are vertically centered
   - numerator and denominator are balanced
   - the fraction bar spans the wider row
   - nested fractions remain readable
   - radical rendering remains unchanged
   - no new console errors

Status remains `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE` because browser smoke was not run from this chat environment.
