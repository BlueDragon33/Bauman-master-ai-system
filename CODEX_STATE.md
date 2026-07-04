# CODEX_STATE

Current task: E171 hierarchy rail and learner controls cleanup.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Visual-only cleanup for E169 hierarchy selector in Math Theory learner view.
- No routing/state logic changed.
- No E132 slideshow runtime change.
- E129 Reader full content remains unchanged.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

E171 result:
- Reworked breadcrumb into a darker connected path rail matching the user's sketch direction.
- Breadcrumb buttons are closer, raised, and grouped inside one rail container.
- Main `Khối kiến thức` button now uses dark navy text on cyan gradient for real contrast.
- Hid learner-view buttons `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON`; DataVault reload/import remains available through storage/Data tab later.
- Styled `Trình chiếu` as a separate neon button, orange/pink, same row aligned right.
- Kept popup cascade and E169 route logic untouched.

Verification:
- GitHub update succeeded for E129 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module → Học tập → Lý thuyết.
4. Confirm `Khối kiến thức` has dark readable text on bright cyan background.
5. Confirm breadcrumb appears as one connected dark path rail, not separate floating pills.
6. Confirm `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` are hidden in learner view.
7. Confirm `Trình chiếu` is a neon button aligned right on the same header row.
8. Confirm popup cascade still works.
9. Confirm E129 Reader still opens full content.
10. Confirm E132 slideshow still opens.
11. Browser console: 0 errors.

Previous integrated state:
- E169 Math hierarchy selector and learning route: PASS in main.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
