# CODEX_STATE

Current task: E173 breadcrumb arrow removal and section mark cleanup.

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

E173 result:
- Removed visible arrow separators from the hierarchy breadcrumb.
- Removed chevron/notched button shape; breadcrumb now uses close segmented rounded tabs with tiny gaps.
- Breadcrumb still sits in one dark rail container, but buttons no longer have arrow tips.
- Kept the wine/burgundy `Khối kiến thức` button.
- Kept `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` hidden in learner view.
- Kept `Trình chiếu` as a separate blue neon button aligned right.
- Added visual cleanup for lesson titles that start with `§`: leading section mark is hidden and title is prefixed visually with `Bài`.
- Preserved E169 popup cascade and routing logic.

Verification:
- GitHub update succeeded for E129 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module → Học tập → Lý thuyết.
4. Confirm `Khối kiến thức` uses warm dark burgundy/wine tone.
5. Confirm breadcrumb has no visible arrow marks and no chevron tips.
6. Confirm breadcrumb buttons are close together with only tiny gaps.
7. Confirm visible lesson title no longer starts with `§`; it should look like `Bài 2.1 · ...`.
8. Confirm `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` stay hidden in learner view.
9. Confirm `Trình chiếu` remains aligned right and visible.
10. Confirm popup cascade still works.
11. Confirm E129 Reader still opens full content.
12. Confirm E132 slideshow still opens.
13. Browser console: 0 errors.

Previous integrated state:
- E169 Math hierarchy selector and learning route: PASS in main.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
