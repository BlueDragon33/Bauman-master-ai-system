# CODEX_STATE

Current task: E190 C02 L02-L06 compact deck pack, Mức B, without Codex.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- Add C02 compact slideshow coverage for §2.2 through §2.6 in one accelerated batch.
- Level: Mức B, meaning compact deck + formulas + mini-cases + common mistakes/checklists/bridges.
- Limit Codex usage: this patch was applied by ChatGPT through GitHub connector, not Codex.
- Avoid rewriting the long E132 core file.
- No E129 Reader changes.
- No E186/E187 picker/path changes in this task.
- No E171 runtime microfix changes.
- No content JSON changes.

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-C02-deck-pack-E190.js`

Patch summary:
- Added `theory-slideshow-C02-deck-pack-E190.js` and loaded it after E132 and E171.
- E190 provides C02 deck takeover only for:
  - `§2.2 · Phép nhân ma trận và pipeline tuyến tính`
  - `§2.3 · Hạng ma trận, không gian cột và thông tin độc lập`
  - `§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm`
  - `§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu`
  - `§2.6 · Từ ma trận sang PCA và mô hình tuyến tính`
- Each E190 deck has 12 compact slides with four cards per slide, reusing E132 CSS classes.
- E190 leaves existing E132/E171 behavior intact for C01 and C02 §2.1.
- E190 hides any fallback E132 overlay when it has a curated C02 deck available.
- Added `window.BAUMAN_MATH_E190_C02_DECK_PACK.selfCheck()` for quick runtime inspection.

Verification:
- Local syntax check before GitHub commit: `node --check /tmp/e190.js`: PASS
- GitHub create succeeded for `subjects/math/assets/theory_skin/theory-slideshow-C02-deck-pack-E190.js`.
- GitHub update succeeded for `subjects/math/index.html` load order.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 2.
5. Confirm Bài picker still lists real labels `Bài 2.1` to `Bài 2.6` from E189.
6. For each bài `2.2`, `2.3`, `2.4`, `2.5`, `2.6`: open `Lý thuyết` → `Trình chiếu`.
7. Confirm no fallback `Chưa có compact deck curated` appears for these five lessons.
8. Confirm E190 header shows `E190 C02 Compact Deck`.
9. Confirm slide 1 and slide cuối match the selected lesson, for example §2.2 first slide `Nhân ma trận là ghép biến đổi`, last slide `Chốt §2.2`.
10. Confirm C02 §2.1 still opens the E172 deck normally.
11. Confirm C01 decks still open normally.
12. Browser console: 0 errors.

Remaining risks:
- Browser smoke still needed on the user side because this chat cannot open the local UI.
- E190 is an overlay pack loaded after E132 rather than a direct merge into E132. This is intentional to reduce risk and avoid rewriting the long E132 core.
- Later, if all C02 decks pass, consider merging E190 into E132 or converting all chapter decks into external deck-pack files by design.

Next recommended task:
- User local smoke test for C02 §2.2-§2.6.
- If stable, continue with the same accelerated pack method for C03.

Next actor:
- User local smoke test, then ChatGPT for C03 batch.

---

Integrated recent state summary:
- E189: Fixed C02 picker/source labels without Codex. C02 now has static 6 real lessons and repairs stale `c02-overview` state. Browser smoke pending.
- E172: Added and browser-smoked E132 compact deck for C02 §2.1. Console errors: 0.
- E171: Added runtime microfix for C01 E132 min-max formula and §1.5 bridge wording. Browser smoke not run from chat.
- E188: Codex previously fixed Học tập subtitle to 3 levels and removed `Đổi hoạt động` / `Về Lý thuyết` buttons. Browser smoke PASS in Codex report.
- E170: Codex fixed C01 §1.6 E132 compact deck alignment. Browser smoke PASS in Codex report.
