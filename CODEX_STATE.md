# CODEX_STATE

Current task: E234A_SLIDE16_DUPLICATE_ROOT_CAUSE_AND_FIX

Status: PASS_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
- `subjects/math/data/theory_slideshow_c03_level_c_part_3_4_6.json`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Root cause:
- C01 lesson source was not duplicated: 16 `.e129-slide` nodes and 16 unique fingerprints; slide 15 and slide 16 were different.
- E202 `move()` always rendered after clamping, so pressing Next on the final slide rebuilt the same final slide and looked like another copy.
- Once Level C JSON could load, E202 also misrouted C01 Reader content to C02 Level C because `expectedChapter()` used broad content keywords such as data/matrix instead of explicit lesson/chapter identity.
- `theory_slideshow_c03_level_c_part_3_4_6.json` had invalid JSON escaping in `score=||x-\hat{x}||` source text; the patch preserves the displayed formula by using valid JSON escaping.

Debug evidence:
- Selected lesson: `MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130` / `Bai 1.1 Vector nhu du lieu ky thuat`.
- Raw DOM source count: 16.
- Unique DOM fingerprint count: 16.
- DOM `.e129-slide` count: 16.
- E202 model length from counter after fix: `01 / 16`, final `16 / 16`.
- Last two source slides: 15 `Cau sang ma tran va anh xa tuyen tinh`; 16 `Ket luan can nho`.

Patch summary:
- E202 `move()` is now a no-op when the clamped destination is already the current slide.
- E202 `expectedChapter()` now guards explicit C01 identity and uses explicit C02/C03 identity before Level C fallback.
- Fixed the invalid C03 JSON escape without changing formula meaning.
- Bumped E202 cache in `subjects/math/index.html` to `?v=234`.

Browser smoke:
- C01 section 1.1 ended once at `16 / 16`; Next at final stayed on the final slide; Previous then Next returned correctly.
- C02 section 2.1 Level C loaded with `20 / 20`; final navigation passed.
- C03 section 3.5 Level C loaded with `18 / 18`; final navigation passed.

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E202.js`: PASS.
- `JSON.parse(subjects/math/data/theory_slideshow_c03_level_c_part_3_4_6.json)`: PASS.

Why this is not a hard-coded slide-16 workaround:
- No `slice(0,16)` was added.
- No slide number was hard-coded.
- Legitimate 18-slide and 20-slide Level C lessons remain intact.
- The fix applies to any final slide by comparing the requested index with the clamped current index.

Remaining risks:
- E202 release string still says E209, but cache and behavior are updated in E234A.

---

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

