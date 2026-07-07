# CODEX_STATE

Current task: E233B_READER_PRO_FORMULA_TYPOGRAPHY_AND_CONTENT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `CODEX_STATE.md`

Summary:
- Direct patch applied to the Reader Pro formula bridge.
- Parser behavior from E229/E232 was preserved in a compact bridge version.
- E233A content quality was extended with E233B typography improvements and remaining formula taxonomy support.

E233B focus:
- Improve math typography before continuing deeper content polish.
- Reduce raw caret notation in formulas such as powers and inverse expressions.
- Improve formatting for R-space expressions, superscripts, subscripts, sums, norms, and common symbols.
- Add stronger content mapping for PCA, covariance/variance, gradient/Hessian, generic relation formulas, and remaining chapter 3 styles.

Typography updates:
- `R^{m x n}` and `R^n` are rendered as math-style real spaces with superscript dimensions where detected.
- `sum_i`, `sum_{i=1}^m`, `_i`, `_{ij}`, `^T`, `^{-1}` are converted to HTML subscript/superscript where detected.
- `||x||_2` is rendered with norm bars plus subscript after formatting.
- Common symbols are normalized: sqrt, sum, iff, <=, >=, !=, alpha, beta, gamma, theta, lambda, sigma, mu, grad.
- Math font/size was strengthened inside `.e226-math`.

Content updates:
- Added PCA / reduction analysis and Python SVD snippet.
- Added covariance / variance analysis and Python covariance snippet.
- Expanded gradient explanation with Hessian/curvature note.
- Kept safe cosine, projection guard, rank/SVD, matrix shape check, solve/lstsq, span dimension snippets.

Verification from this chat:
- GitHub update succeeded for E224 bridge.
- Browser smoke was not run from this chat environment.
- Status must stay `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local check:
1. `git pull origin main`
2. Hard refresh browser or disable cache in DevTools.
3. Open `Xem đầy đủ` for representative formulas:
   - R^{m x n} / R^n
   - x_1^T / A^{-1}
   - sum_i and sum_{i=1}^m
   - PCA / covariance / gradient formulas
4. Confirm formulas no longer show raw caret notation in common supported cases.
5. Confirm analysis/application/Python still match formula type.
6. Confirm no new E224 console errors.

Cache note:
- `index.html` may still point to E224 with `?v=232` because direct index patch was previously blocked by tool safety layer.
- If stale cache appears, bump the E224 query in `subjects/math/index.html` to `?v=234` manually or in the next available patch.
