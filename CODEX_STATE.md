# CODEX_STATE

Current task: E191 C03 L01-L06 compact deck pack, Mức B, without Codex.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- Continue the accelerated Mức B strategy: 1 chapter / 6 lessons / 1 deck pack / 1 state update.
- Add C03 compact slideshow coverage for §3.1 through §3.6 in one batch.
- Limit Codex usage: this patch was applied by ChatGPT through GitHub connector, not Codex.
- Avoid rewriting the long E132 core file.
- No E129 Reader changes.
- No E186/E187 picker/path changes in this task.
- No E171/E190 runtime changes.
- No content JSON changes.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/data/theory_lecture_content.json`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-deck-pack-E191.js`

Patch summary:
- Added `theory-slideshow-C03-deck-pack-E191.js` and loaded it after E190.
- E191 provides C03 deck takeover only for:
  - `§3.1 · Hàm số như mô hình đầu vào–đầu ra`
  - `§3.2 · Đạo hàm và độ nhạy của hệ thống`
  - `§3.3 · Gradient như hướng thay đổi nhanh nhất`
  - `§3.4 · Gradient descent và learning rate`
  - `§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu`
  - `§3.6 · Từ gradient sang backpropagation và tối ưu ML`
- Each E191 deck has 10 compact slides with four cards per slide, reusing E132 CSS classes.
- E191 leaves existing E132/E171/E190 behavior intact for C01 and C02.
- E191 hides fallback E132 overlay only when it has a curated C03 deck available.
- Added `window.BAUMAN_MATH_E191_C03_DECK_PACK.selfCheck()` for runtime inspection.

Verification:
- Local syntax check before GitHub commit: `node --check /tmp/e191.js`: PASS
- GitHub create succeeded for `subjects/math/assets/theory_skin/theory-slideshow-C03-deck-pack-E191.js`.
- GitHub update succeeded for `subjects/math/index.html` load order.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 3.
5. For each bài `3.1`, `3.2`, `3.3`, `3.4`, `3.5`, `3.6`: open `Lý thuyết` → `Trình chiếu`.
6. Confirm no fallback `Chưa có compact deck curated` appears for these six lessons.
7. Confirm E191 header shows `E191 C03 Compact Deck`.
8. Confirm slide 1 and slide cuối match the selected lesson, for example §3.1 first slide `Hàm số là hộp biến đổi`, last slide `Chốt §3.1`.
9. Confirm C02 decks still open normally through E172/E190.
10. Confirm C01 decks still open normally through E132/E171.
11. Browser console: 0 errors.

Remaining risks:
- Browser smoke still needed on the user side because this chat cannot open the local UI.
- E191 is an overlay pack loaded after E132/E190 rather than a direct merge into E132. This is intentional to keep each chapter pack isolated and easy to remove or merge later.
- If Chương 3 picker falls back to a generic label on some machines, add a small E192 picker static-list patch for C03, similar to E189 for C02.

Next recommended task:
- User local smoke test for C02 and C03 deck packs.
- Continue accelerated Mức B pack method for C04 next.
- Later Mức C pass will enrich Reader, simulations, exercises, mind map, and assessments after all Mức B chapter coverage exists.

Next actor:
- User local smoke test, then ChatGPT for C04 batch.

---

Integrated recent state summary:
- E190: Added C02 §2.2-§2.6 Mức B deck pack without Codex. Browser smoke pending.
- E189: Fixed C02 picker/source labels without Codex. C02 now has static 6 real lessons and repairs stale `c02-overview` state. Browser smoke pending.
- E172: Added and browser-smoked E132 compact deck for C02 §2.1. Console errors: 0.
- E171: Added runtime microfix for C01 E132 min-max formula and §1.5 bridge wording. Browser smoke not run from chat.
- E188: Codex previously fixed Học tập subtitle to 3 levels and removed `Đổi hoạt động` / `Về Lý thuyết` buttons. Browser smoke PASS in Codex report.
- E170: Codex fixed C01 §1.6 E132 compact deck alignment. Browser smoke PASS in Codex report.
