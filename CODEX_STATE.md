# CODEX_STATE

Current task: E170 C01 L06 E132 compact deck title/content alignment.

Status: E170_PASS

Branch: `main`
Base branch: `main`
Main sync status: `rebased_ready_to_push`

Files read:
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/data/theory_lecture_content.json`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

Patch summary:
- Fixed E132 C01 §1.6 alias/deck key from old `§1.6 · Độc lập tuyến tính, chiều và hạng dữ liệu` to `§1.6 · Từ vector sang ma trận dữ liệu`.
- Replaced the §1.6 compact deck with 14 curated compact slides focused on vector-to-data-matrix flow.
- Preserved E129 Reader full content and did not edit content JSON, CSS, index, boot, or other UI runtime files.

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E132.js`: PASS
- Static deck check: C01 §1.1-§1.6 all have compact deck keys.
- Static §1.6 deck check: 14 slides, 14 distinct formula rail values, first slide `Một vector là một mẫu`, last slide `Cầu sang Chương 2`, no old title inside deck.
- Browser smoke on local server `http://127.0.0.1:8772/subjects/math/index.html` after rebase over remote E177: PASS
- Selected C01 §1.6 through E169/E129 route: PASS
- E132 slideshow first slide renders `Một vector là một mẫu` with formula `x_i ∈ R^n`: PASS
- E132 slideshow last slide renders `Cầu sang Chương 2` with formula `vector x → dataset X; y = A x; Y = X A`: PASS
- Fallback `Chưa có compact deck curated`: not triggered for C01 §1.6.
- Full lecture/Reader text in E132 slideshow: not present.
- Browser console errors: 0.

Remaining risks:
- None found in scoped E132 §1.6 smoke. Broader C02/C03 slideshow audit was out of scope.

Next recommended task:
- Push `main`, then user pulls and retests C01 §1.6 slideshow locally.

Next actor:
- Codex push, then User


---

Current task: E177 restore original app shell with new learning tab content.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Corrected the mistaken E176 restore.
- The desired target is the original/global app shell like the user screenshot: left navigation, green/dark dashboard skin, topbar/hero cards unchanged.
- Only the inner content of the `Học tập` tab should use the newer learning hierarchy/content work.
- Data files were not changed.
- E129 Reader full content remains unchanged.
- E132 slideshow runtime remains unchanged.

Files changed:
- `subjects/math/index.html`
- `CODEX_STATE.md`

Runtime load order after E177:
- `assets/subject-adapter.js?v=123`
- `assets/program_frame/program-frame-E130.js?v=130`
- `assets/theory_skin/theory-tab-E129.js?v=129`
- `assets/theory_skin/theory-hierarchy-E175.js?v=175`
- `assets/theory_skin/theory-slideshow-E132.js?v=136`

E177 result:
- Removed `theory-learning-restore-E176.css` from `index.html` load list.
- Removed `theory-learning-restore-E176.js` from `index.html` load list.
- Re-enabled `theory-hierarchy-E175.js` in `index.html`.
- The E176 files remain in the repo but are not loaded.
- This returns to the app shell behavior before the mistaken E176 preview restore, while preserving the newer `Học tập` tab work.

Verification:
- GitHub update succeeded for `index.html`.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser, preferably clear cache because JS/CSS load order changed.
4. Open Math module.
5. Confirm global shell looks like the user screenshot: left sidebar, dark/green app skin, original dashboard/topbar style.
6. Open `Học tập` tab.
7. Confirm only the inner content of `Học tập` is replaced by the newer learning hierarchy/content surface.
8. Confirm the global sidebar/topbar is not replaced by old E129 two-panel preview.
9. Confirm E129 Reader still opens full content.
10. Confirm E132 slideshow still opens.
11. Browser console: 0 errors.

Previous integrated state:
- E176 original learning preview restore: mistaken direction and now disabled from runtime.
- E175 activity-content hierarchy override: re-enabled.
- E174 concave arrow breadcrumb tabs: still in E129 CSS.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test and visual review.
