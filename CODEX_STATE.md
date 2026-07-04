# CODEX_STATE

Current task: E176 original learning preview restore.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Temporarily restored the learner surface closer to the original E129 layout for review.
- Disabled E175 hierarchy override from runtime by removing its script tag from `subjects/math/index.html`.
- Added a lightweight E176 preview CSS/JS layer to hide the new hierarchy selector surface and bring back the full E129 two-panel learning layout.
- Data files were not changed.
- E129 Reader full content remains unchanged.
- E132 slideshow runtime remains unchanged.

Files changed:
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-learning-restore-E176.css`
- `subjects/math/assets/theory_skin/theory-learning-restore-E176.js`
- `CODEX_STATE.md`

Files kept but not loaded:
- `subjects/math/assets/theory_skin/theory-hierarchy-E175.js`

E176 result:
- New hierarchy selector/popup surface is no longer loaded for this review pass.
- Learning view uses the fuller E129 layout again: sidebar/chapter tree + reader panel.
- The E169 learning-router block is visually hidden.
- A simple original-style reader header is injected: `Học tập · Lý thuyết`, chapter title, and current reader note.
- Vault/reload/slideshow controls are visible again for completeness review.
- Existing data and imported overlay behavior are untouched.
- This is a preview restore, not a hard deletion of E169/E175 files.

Verification:
- GitHub update succeeded for `index.html`.
- New E176 CSS file created.
- New E176 JS file created.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser, preferably clear cache because JS/CSS load order changed.
4. Open Math module → Học tập/Lý thuyết.
5. Confirm the new `Khối kiến thức` hierarchy button/popup is no longer visible in the learner header.
6. Confirm E129 two-panel layout is back: left sidebar/chapter tree, right reader content.
7. Confirm header reads like `Học tập · Lý thuyết`.
8. Confirm Reader still displays full content.
9. Confirm `Kho Lý thuyết`, `Trình chiếu`, and `Tải lại JSON` are visible again for review.
10. Confirm E132 slideshow still opens.
11. Browser console: 0 errors.

Previous integrated state:
- E175 activity-content hierarchy override: patched but now not loaded.
- E174 concave arrow breadcrumb tabs: CSS remains in E129 but is hidden by E176 preview layer.
- E169 Math hierarchy selector and learning route: still inside E129 file, but surface hidden for preview.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test and visual review.
