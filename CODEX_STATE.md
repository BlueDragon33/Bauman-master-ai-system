# CODEX_STATE

Current task: E195 C03 slideshow recovery and safe Level C visual enhancer.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- User reported Codex E194 still errors when clicking `Trình chiếu`.
- ChatGPT handled directly without Codex.
- Remove risky E193 from active load order.
- Fix C03 lesson picker routing in E186.
- Add a safer Level C visual layer that decorates the working E191 deck instead of overriding E132/E191 slideshow engine.
- Do not modify E132 core.
- Do not modify E129 Reader.
- Do not modify content JSON.
- Do not modify C02 E192 Matrix Lab.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-learning-path-E186.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-E193.js`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-learning-path-E186.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-enhancer-E195.js`

Root cause / decision:
- Codex E194 fixed some E193 issues but did not complete full click smoke.
- `CODEX_STATE.md` confirmed C03 picker still exposed only `c03-overview / Bài 3.1 · Bài giảng tổng quan`, making C03 3.2-3.6 unavailable through the current UI.
- E193 was still a high-risk overlay because it wraps `window.BAUMAN_MATH_THEORY_E132`, owns an overlay deck, and relies on MutationObserver-driven open/render logic.
- To stop the error path, E193 was unloaded from `index.html`.
- To preserve Level C visual learning without destabilizing slideshow, E195 was added as a non-invasive enhancer: it only decorates `.e191-c03-deck.open` after E191 has already opened successfully.

Patch summary:
1. E186 routing fix:
   - Updated release marker to `E195_C03_LESSON_PICKER_FIX`.
   - Added static `C03_LESSONS` with 6 real lesson IDs and labels:
     - `Bài 3.1 · Hàm số như mô hình đầu vào–đầu ra`
     - `Bài 3.2 · Đạo hàm và độ nhạy của hệ thống`
     - `Bài 3.3 · Gradient như hướng thay đổi nhanh nhất`
     - `Bài 3.4 · Gradient descent và learning rate`
     - `Bài 3.5 · Hàm mất mát, cực trị và điều kiện tối ưu`
     - `Bài 3.6 · Từ gradient sang backpropagation và tối ưu ML`
   - Updated `staticLessons(chapterId)` to return `C03_LESSONS` for `c03`.
   - Existing `ensureLesson()` now repairs stale `c03-overview` state into the first real C03 lesson.

2. Index load-order fix:
   - Changed E186 cache-buster to `v=195`.
   - Removed active E193 script load:
     - `assets/theory_skin/theory-slideshow-C03-level-c-E193.js?v=193`
   - Added safe E195 visual enhancer after E192:
     - `assets/theory_skin/theory-slideshow-C03-level-c-enhancer-E195.js?v=195`

3. E195 safe visual enhancer:
   - Does not override `window.BAUMAN_MATH_THEORY_E132`.
   - Does not create its own presentation engine.
   - Does not call `openDeck()` / `closeDeck()`.
   - Only observes DOM and decorates the already-open `.e191-c03-deck.open`.
   - Adds SVG visuals for C03:
     - function input-output / graph
     - derivative tangent / finite difference
     - gradient + negative gradient on contours
     - gradient descent path
     - loss/nonconvex curve
     - backprop chain
   - Adds `window.BAUMAN_MATH_E195_C03_VISUAL_ENHANCER.selfCheck()`.

Verification:
- GitHub update succeeded for `subjects/math/assets/theory_skin/theory-learning-path-E186.js`.
- GitHub create succeeded for `subjects/math/assets/theory_skin/theory-slideshow-C03-level-c-enhancer-E195.js`.
- GitHub update succeeded for `subjects/math/index.html`.
- Browser smoke was not run from this chat environment.
- Syntax/browser validation still needs local check.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 3.
5. Open the Bài picker and confirm it lists all 6 C03 lessons, not `Bài 3.1 · Bài giảng tổng quan`.
6. For each C03 lesson 3.1-3.6:
   - Open `Lý thuyết` → `Trình chiếu`.
   - Confirm slideshow opens through E191 without runtime error.
   - Confirm an E195 visual block appears inside the slide.
   - Confirm next/prev and Esc/Thoát work.
7. Confirm C02 still opens E192 Matrix Lab for at least 2.1 and 2.2.
8. Confirm C01 still opens E132/E171 for at least 1.1.
9. Browser console: 0 errors.

Remaining risks:
- E195 is a safer visual enhancer, not a full independent Level C slideshow engine.
- Full local browser smoke is still required.
- E193 remains in repo but is not loaded. Treat E193 as quarantined until intentionally refactored or deleted.

Next recommended task:
- If E195 smoke passes, keep this architecture: base deck engine first, visual enhancer second.
- Avoid adding future chapter packs that override E132 directly unless browser smoke is available.
- For future Level C chapters, prefer enhancer-style visual layers over engine-level overrides.

Next actor:
- User local smoke test.

---

Integrated recent state summary:
- E194: Codex attempted E193 fix but full click smoke was not completed and C03 routing remained incomplete.
- E193: C03 Level C standalone overlay remains in repo but is no longer loaded.
- E192: C02 Level C Matrix Visual Lab remains active.
- E191: C03 Mức B deck remains active and is now enhanced by E195.
- E190: C02 Mức B fallback/history, superseded by E192 for C02 slideshow.
- E189: C02 picker/source labels fixed.
- E172: C02 §2.1 deck, superseded by E192.
- E171: C01 E132 text microfix.
- E188: Học tập subtitle/buttons fix.
- E170: C01 §1.6 deck alignment.
