# CODEX_STATE

Current task: E175 learning hierarchy activity-content flow override.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Fixed E169 popup flow for Math learning hierarchy.
- Added a small override script loaded after E129 instead of rewriting the long E129 file.
- E129 Reader full content remains unchanged.
- E132 slideshow runtime remains unchanged.

Files changed:
- `subjects/math/assets/theory_skin/theory-hierarchy-E175.js`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

E175 result:
- Added new loaded script: `assets/theory_skin/theory-hierarchy-E175.js?v=175` after `theory-tab-E129.js` and before `theory-slideshow-E132.js`.
- New hierarchy flow:
  `Khối kiến thức → Học phần → Chương → Hoạt động học tập → Nội dung cụ thể`.
- After selecting Chương, modal now opens `Chọn Hoạt động học tập` first.
- After selecting an activity, modal opens `Chọn Nội dung cụ thể`.
- Theory lessons are no longer mixed directly with Bài tập/Thực hành/Ứng dụng/Ôn tập/Kiểm tra in the same modal level.
- Existing E169 clicks are intercepted before the old E129 document handler, so old mixed activity modal should not appear.
- Visual labels starting with `§` are cleaned to `Bài ...` in modal cards, breadcrumb, and reader title where possible.
- Page title/learning label is visually normalized from `Lý thuyết` to `Học tập` in learner view where possible.
- Previous E174 CSS remains: wine `Khối kiến thức` button, arrow-body breadcrumb tabs, hidden vault/reload buttons, neon slideshow button.

Important note:
- Browser smoke test was not run from this chat environment.
- If the old mixed modal still appears, inspect script loading order and console errors first.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser, preferably clear cache because a new JS file was added.
4. Open Math module → Học tập.
5. Confirm top tab/page no longer visually says only `Lý thuyết`; it should read as `Học tập` where the override applies.
6. Click `Khối kiến thức`.
7. Select Khối → Học phần → Chương.
8. Confirm next modal is `Chọn Hoạt động học tập`, showing only the 6 activity groups.
9. Select `Lý thuyết`.
10. Confirm next modal is `Chọn Nội dung cụ thể`, showing `Bài 1.1`, `Bài 1.2`, etc.
11. Confirm lesson cards no longer display `Lý thuyết · §1.1` directly in the activity-group modal.
12. Select a theory lesson and confirm E129 Reader opens full content.
13. Select non-theory activity/content and confirm it routes to its safe learning placeholder.
14. Confirm E132 slideshow still opens.
15. Browser console: 0 errors.

Previous integrated state:
- E174 concave arrow breadcrumb tabs: patched.
- E169 Math hierarchy selector and learning route: PASS before E175 override.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
