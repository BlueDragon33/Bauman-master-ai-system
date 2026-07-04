# CODEX_STATE

Current task: E189 C02 lesson picker label/source fix without Codex.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- Fix the remaining C02 picker/state bug directly in E186.
- Limit Codex usage: this patch was applied by ChatGPT through GitHub connector, not Codex.
- No E132 slideshow deck changes.
- No E129 Reader changes.
- No E171 runtime microfix changes.
- No `index.html` changes.
- No content JSON changes.

Files read:
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-learning-path-E186.js`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-learning-path-E186.js`

Patch summary:
- Added static `C02_LESSONS` with all 6 real C02 lesson IDs and labels:
  - `Bài 2.1 · Ma trận như dữ liệu và phép biến đổi`
  - `Bài 2.2 · Phép nhân ma trận và pipeline tuyến tính`
  - `Bài 2.3 · Hạng ma trận, không gian cột và thông tin độc lập`
  - `Bài 2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm`
  - `Bài 2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu`
  - `Bài 2.6 · Từ ma trận sang PCA và mô hình tuyến tính`
- Added `staticLessons(chapterId)` so C02 no longer falls back to `Bài 2.1 · Bài giảng tổng quan` while DB records are not ready.
- Added `ensureLesson()` to repair stale/invalid `lessonId` values such as `c02-overview` from old saved state.
- `syncLegacy()`, `lessonLabel()`, `setPath()`, `open('lesson')`, and `renderRoute()` now go through the validated real lesson ID.
- Updated E186 release marker to `E189_C02_LESSON_PICKER_LABEL_FIX`.

Verification:
- Local syntax check before GitHub commit: `node --check /tmp/theory-learning-path-E186.js`: PASS
- GitHub update succeeded for `subjects/math/assets/theory_skin/theory-learning-path-E186.js`.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 2.
5. Open the Bài picker.
6. Confirm it lists real labels from `Bài 2.1` to `Bài 2.6`, not `Bài 2.1 · Bài giảng tổng quan`.
7. Select `Bài 2.1`, then `Lý thuyết`, then `Trình chiếu`; confirm E172 deck still opens.
8. Select `Bài 2.2`; until an E132 deck is added for §2.2, fallback slideshow is expected, but Reader should load the correct §2.2 content.
9. Browser console: 0 errors.

Remaining risks:
- Browser smoke still needed on the user side because this chat cannot open the local UI.
- C02 §2.2 to §2.6 still need curated E132 compact decks. Do not treat this E189 picker fix as slideshow completion.

Next recommended task:
- After user confirms E189 picker labels are clean, add E132 compact deck for `§2.2 · Phép nhân ma trận và pipeline tuyến tính` directly from ChatGPT/GitHub or with Codex only if browser smoke automation is needed.

Next actor:
- User local smoke test, then ChatGPT for §2.2 deck patch.

---

Integrated recent state summary:
- E172: Added and browser-smoked E132 compact deck for C02 §2.1. Console errors: 0. Remaining risk from E172 was C02 picker label, now patched by E189.
- E171: Added runtime microfix for C01 E132 min-max formula and §1.5 bridge wording. Browser smoke not run from chat.
- E188: Codex previously fixed Học tập subtitle to 3 levels and removed `Đổi hoạt động` / `Về Lý thuyết` buttons. Browser smoke PASS in Codex report.
- E170: Codex fixed C01 §1.6 E132 compact deck alignment. Browser smoke PASS in Codex report.
- E177: Older shell restore note remains historical; actual current `index.html` load order should be verified from file before any new shell work.
