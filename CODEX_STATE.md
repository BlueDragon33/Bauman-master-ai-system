# CODEX_STATE

Current task: E194 Fix E193 C03 Level C slideshow runtime.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `main_direct_patch_from_codex`

Scope:
- Fix runtime instability in `theory-slideshow-C03-level-c-E193.js`.
- Re-enable E193 after E192 in `subjects/math/index.html`.
- Do not modify E132, E129, E186/E187, content JSON, C01/C02 decks, or other subjects.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C02-level-c-E192.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-deck-pack-E191.js`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js`

Root cause found:
- E193 `MutationObserver` could call `enhance()` after each `render()` because `render()` replaces `innerHTML`; without a render guard/signature, this can re-enter `openDeck()` and keep re-rendering.
- C03 lesson detection checked broad aliases such as `gradient` before a dedicated exact-alias pass; this risked matching C03 3.4/3.5/3.6 as 3.3 when active path text contained `gradient`.

Patch summary:
- Added `isRendering` and `lastRenderSignature` guard in E193.
- `openDeck()` now renders only when lesson/slide signature changes or stage HTML is empty.
- `enhance()` now returns early while rendering and avoids re-opening an already-open deck with the same signature.
- `closeDeck()` clears the render signature.
- Added exact C03 aliases (`c03l01/l31/3.1` ... `c03l06/l36/3.6`) and checks them before broad aliases.
- Re-enabled E193 in `index.html` after E192:
  - `assets/theory_skin/theory-slideshow-C03-level-c-E193.js?v=193`

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js`: PASS
- Pre-enable browser smoke before index change: C03 3.1 opened with E191 fallback, no fallback warning, browser `dev.logs()` empty: PASS
- Post-enable browser page-load smoke: E193 script present in `index.html` script list, browser `dev.logs()` empty: PASS
- Full post-enable click smoke was attempted but not completed: Browser plugin modal/coordinate click calls repeatedly timed out and reset the Node REPL kernel while clicking slideshow controls.
- E186 C03 picker observation during smoke: current UI exposes only one C03 lesson option, `data-e186-id="c03-overview"` / `Bai 3.1 - Bai giang tong quan`; C03 3.2-3.6 cannot be selected through the visible E186 lesson picker without changing E186/E187, which is out of scope for E194.

Pass criteria result:
- Syntax: PASS
- E193 re-enabled: YES
- Page load console/logs: PASS
- Full C03 3.1-3.6 browser click smoke: NOT VERIFIED in this environment
- C02 E192 / C01 E132 click regression smoke: NOT VERIFIED in this environment
- Overall status is not PASS until a local browser click smoke confirms slideshow open/next/prev/exit for C03, plus C02/C01 regression.

Required local smoke test:
1. Open `subjects/math/index.html` via Live Server.
2. Open Math module -> Hoc tap -> Chuong 3.
3. Click `Trinh chieu`.
4. Confirm header shows `E193 C03 Calculus Lab · Level C`.
5. Confirm no fallback `Chua co compact deck curated`.
6. Confirm next/prev and Esc/Thoat work.
7. Confirm browser console has 0 errors.
8. If UI exposes C03 3.2-3.6, repeat for each lesson.
9. Confirm C02 still opens E192 for at least 2.1 and 2.2.
10. Confirm C01 still opens E132/E171 for 1.1.

Remaining risks:
- Full click-smoke still needs a local browser because the Codex browser automation click path was unstable.
- Separate UI routing issue remains: E186 currently exposes only `c03-overview` for C03 in the lesson picker, so selecting C03 3.2-3.6 through the current UI was not possible inside this scoped task.

Next recommended task:
- Run local browser smoke for E193. If C03 3.2-3.6 are still not selectable, open a separate E195 routing task scoped to E186/E187 lesson picker mapping.

Next actor:
- User/Codex local browser smoke, then E195 routing task only if picker selection is still incomplete.

---

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
