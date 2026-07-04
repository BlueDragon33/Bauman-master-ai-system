# CODEX_STATE

Current task: E172 wine selector and nested segmented breadcrumb rail.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Visual-only redesign for E169 hierarchy selector in Math Theory learner view.
- No routing/state logic changed.
- No E132 slideshow runtime change.
- E129 Reader full content remains unchanged.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

E172 result:
- Replaced the cyan/green `Khối kiến thức` style with a warm dark wine/burgundy gradient.
- Increased contrast with cream/gold text and stronger shadow.
- Redesigned breadcrumb as nested segmented path rail, with tightly overlapped chevron-shaped segments instead of separate floating pills.
- Final selected activity segment uses burgundy/gold highlight.
- Kept `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` hidden in learner view.
- Kept `Trình chiếu` as a separate blue neon button aligned right.
- Preserved E169 popup cascade and routing logic.

Verification:
- GitHub update succeeded for E129 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module → Học tập → Lý thuyết.
4. Confirm `Khối kiến thức` uses warm dark burgundy/wine tone, not green/cyan.
5. Confirm breadcrumb looks like one connected nested rail with close chevron segments.
6. Confirm `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` stay hidden in learner view.
7. Confirm `Trình chiếu` remains aligned right and visible.
8. Confirm popup cascade still works.
9. Confirm E129 Reader still opens full content.
10. Confirm E132 slideshow still opens.
11. Browser console: 0 errors.

Previous integrated state:
- E169 Math hierarchy selector and learning route: PASS in main.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
