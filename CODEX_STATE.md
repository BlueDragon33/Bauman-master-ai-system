# CODEX_STATE

Current task: E192 C02 Level C Matrix Visual Lab.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- Upgrade Chapter 2 from Mức B to a focused Mức C matrix-visual deck layer.
- Answer user feedback: matrix lessons must show explicit 2×2 and 3×3 matrices, matrix formulas, and visual matrix layouts, not only prose.
- Limit Codex usage: this patch was applied by ChatGPT through GitHub connector, not Codex.
- Avoid rewriting E132 core or deleting E190.
- E192 is loaded after E191, so it has priority for C02 while leaving C01/C03 behavior intact.
- No E129 Reader changes.
- No E186/E187 picker/path changes.
- No content JSON changes.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C02-level-c-E192.js`

Patch summary:
- Added `theory-slideshow-C02-level-c-E192.js`.
- Loaded E192 after E191 in `index.html`.
- E192 takes over only for C02 lessons:
  - `§2.1 · Ma trận như dữ liệu và phép biến đổi`
  - `§2.2 · Phép nhân ma trận và pipeline tuyến tính`
  - `§2.3 · Hạng ma trận, không gian cột và thông tin độc lập`
  - `§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm`
  - `§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu`
  - `§2.6 · Từ ma trận sang PCA và mô hình tuyến tính`
- Added a matrix visual renderer with bracketed HTML matrices, not static images:
  - 2×2 general matrix `[[a,b],[c,d]]`
  - 3×3 general matrix `[[a11,a12,a13], ...]`
  - data matrix X
  - operator matrix A
  - multiplication A·B with C entries
  - rank examples
  - inverse 2×2 / adjugate layout
  - augmented system matrix
  - transform matrices: identity, scale, rotation, projection
  - covariance/SVD/PCA matrix layouts
- Added `window.BAUMAN_MATH_E192_C02_LEVEL_C_PACK.selfCheck()` for runtime inspection.
- E190 remains in repo as Mức B fallback/history, but E192 has priority for C02 because it loads later.

Verification:
- Local syntax check before GitHub commit: `node --check /tmp/e192.js`: PASS
- GitHub create succeeded for `subjects/math/assets/theory_skin/theory-slideshow-C02-level-c-E192.js`.
- GitHub update succeeded for `subjects/math/index.html` load order.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 2.
5. For each bài `2.1` to `2.6`, open `Lý thuyết` → `Trình chiếu`.
6. Confirm header shows `E192 C02 Matrix Lab · Level C`.
7. Confirm visible bracketed matrix cards render, especially:
   - §2.1: 2×2 and 3×3 matrices.
   - §2.2: AB multiplication with entries like `ae+bg`.
   - §2.3: rank-1/rank-2 visual examples.
   - §2.4: inverse 2×2 and augmented system matrix.
   - §2.5: identity/scale/rotation/projection matrices.
   - §2.6: data matrix, covariance matrix, Σ matrix.
8. Confirm no fallback `Chưa có compact deck curated` appears for C02.
9. Confirm C03 still opens E191 and C01 still opens E132/E171.
10. Browser console: 0 errors.

Remaining risks:
- Browser smoke still needed on the user side because this chat cannot open the local UI.
- E192 is a visual Level C layer for slideshow. Full Level C for Reader, exercises, simulations, mind map, and assessments remains a later pass.
- E192 uses HTML/CSS matrix visuals instead of PNG/SVG images. This is intentional: it keeps text selectable, scalable, and less brittle.

Next recommended task:
- User local smoke test for C02 E192.
- If stable, continue Mức B coverage for remaining chapters, but for matrix-heavy chapters use the E192 visual-matrix style from the start.

Next actor:
- User local smoke test, then ChatGPT for next batch.

---

Integrated recent state summary:
- E191: Added C03 §3.1-§3.6 Mức B deck pack without Codex. Browser smoke pending.
- E190: Added C02 §2.2-§2.6 Mức B deck pack without Codex. Superseded for C02 slideshow by E192, retained as fallback/history.
- E189: Fixed C02 picker/source labels without Codex. C02 has static 6 real lessons and repairs stale `c02-overview` state. Browser smoke pending.
- E172: Added and browser-smoked E132 compact deck for C02 §2.1. Superseded for C02 slideshow by E192.
- E171: Added runtime microfix for C01 E132 min-max formula and §1.5 bridge wording.
- E188: Codex fixed Học tập subtitle to 3 levels and removed `Đổi hoạt động` / `Về Lý thuyết` buttons. Browser smoke PASS in Codex report.
- E170: Codex fixed C01 §1.6 E132 compact deck alignment. Browser smoke PASS in Codex report.
