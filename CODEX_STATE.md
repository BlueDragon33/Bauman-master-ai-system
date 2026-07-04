# CODEX_STATE

Current task: E193 C03 Level C Calculus / Gradient Visual Lab.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- Upgrade Chapter 3 from Mức B to a focused Mức C visual calculus/gradient deck layer.
- Answer the same quality standard applied to C02: visual-first learning, not prose-only slides.
- Limit Codex usage: this patch was applied by ChatGPT through GitHub connector, not Codex.
- Avoid rewriting E132 core or deleting E191.
- E193 is loaded after E192, so it has priority for C03 while leaving C02 Matrix Lab and C01 behavior intact.
- No E129 Reader changes.
- No E186/E187 picker/path changes.
- No content JSON changes.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js`

Patch summary:
- Added `theory-slideshow-C03-level-c-E193.js`.
- Loaded E193 after E192 in `index.html`.
- E193 takes over only for C03 lessons:
  - `§3.1 · Hàm số như mô hình đầu vào–đầu ra`
  - `§3.2 · Đạo hàm và độ nhạy của hệ thống`
  - `§3.3 · Gradient như hướng thay đổi nhanh nhất`
  - `§3.4 · Gradient descent và learning rate`
  - `§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu`
  - `§3.6 · Từ gradient sang backpropagation và tối ưu ML`
- Added SVG/HTML visual renderer for C03:
  - function input-output box
  - domain/range warning line
  - function graph
  - tangent/derivative line
  - finite difference slope
  - noisy derivative curve
  - gradient vector and negative gradient on contour lines
  - gradient descent path over contours
  - loss curve and nonconvex curve
  - backprop forward/backward chain
  - training loop cycle
  - per-layer gradient norm bars
- Added `window.BAUMAN_MATH_E193_C03_LEVEL_C_PACK.selfCheck()` for runtime inspection.
- E191 remains in repo as Mức B fallback/history, but E193 has priority for C03 because it loads later.

Verification:
- Local syntax check before GitHub commit: `node --check /mnt/data/e193.js`: PASS
- GitHub create succeeded for `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js` after one transient DNS retry.
- GitHub update succeeded for `subjects/math/index.html` load order after one transient timeout retry.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 3.
5. For each bài `3.1` to `3.6`, open `Lý thuyết` → `Trình chiếu`.
6. Confirm header shows `E193 C03 Calculus Lab · Level C`.
7. Confirm visible SVG visual cards render, especially:
   - §3.1: input-output box / function graph / domain warning.
   - §3.2: tangent line / finite difference / noisy derivative.
   - §3.3: gradient vector, negative gradient and contour lines.
   - §3.4: descent path, learning-rate/loss-history visuals.
   - §3.5: loss curve, nonconvex curve, extrema/Hessian visuals.
   - §3.6: forward/backward/backprop chain, training loop, gradient norm bars.
8. Confirm no fallback `Chưa có compact deck curated` appears for C03.
9. Confirm C02 still opens E192 Matrix Lab and C01 still opens E132/E171.
10. Browser console: 0 errors.

Remaining risks:
- Browser smoke still needed on the user side because this chat cannot open the local UI.
- E193 is a visual Level C layer for slideshow. Full Level C for Reader, exercises, simulations, mind map, and assessments remains a later pass.
- E193 uses inline SVG/HTML visuals rather than image files. This keeps it scalable and self-contained.

Next recommended task:
- User local smoke test for C03 E193.
- If stable, continue remaining chapters with Mức B coverage, and upgrade key chapters to Mức C when the topic demands visual-first teaching.

Next actor:
- User local smoke test, then ChatGPT for next batch.

---

Integrated recent state summary:
- E192: Upgraded C02 to Level C Matrix Visual Lab. Browser smoke pending.
- E191: Added C03 §3.1-§3.6 Mức B deck pack without Codex. Superseded for C03 slideshow by E193, retained as fallback/history.
- E190: Added C02 §2.2-§2.6 Mức B deck pack without Codex. Superseded for C02 slideshow by E192, retained as fallback/history.
- E189: Fixed C02 picker/source labels without Codex. C02 has static 6 real lessons and repairs stale `c02-overview` state. Browser smoke pending.
- E172: Added and browser-smoked E132 compact deck for C02 §2.1. Superseded for C02 slideshow by E192.
- E171: Added runtime microfix for C01 E132 min-max formula and §1.5 bridge wording.
- E188: Codex fixed Học tập subtitle to 3 levels and removed `Đổi hoạt động` / `Về Lý thuyết` buttons. Browser smoke PASS in Codex report.
- E170: Codex fixed C01 §1.6 E132 compact deck alignment. Browser smoke PASS in Codex report.
