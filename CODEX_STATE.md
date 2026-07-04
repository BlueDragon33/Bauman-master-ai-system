# CODEX_STATE

Current task: E174 concave arrow breadcrumb tabs.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Visual-only correction for E169 hierarchy selector in Math Theory learner view.
- No routing/state logic changed.
- No E132 slideshow runtime change.
- E129 Reader full content remains unchanged.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

E174 result:
- Restored the requested arrow-tab button body for breadcrumb segments.
- Removed separate visible arrow separator characters; only the button shape forms the direction.
- Breadcrumb segments now have concave tail and convex head using CSS clip-path.
- Segments overlap slightly so gaps are tiny and the rail reads as one connected path.
- First segment has a clean flat/rounded left edge.
- Final selected activity segment keeps burgundy/gold highlight.
- Kept the wine/burgundy `Khối kiến thức` button.
- Kept `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` hidden in learner view.
- Kept `Trình chiếu` as a separate blue neon button aligned right.
- Kept visual cleanup for lesson titles that start with `§`: leading section mark is hidden and title is prefixed visually with `Bài`.
- Preserved E169 popup cascade and routing logic.

Verification:
- GitHub update succeeded for E129 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module → Học tập → Lý thuyết.
4. Confirm breadcrumb has arrow-body segments: concave tail, convex head.
5. Confirm there are no separate `→` arrow characters between buttons.
6. Confirm segments overlap/attach with only tiny gaps.
7. Confirm visible lesson title no longer starts with `§`; it should look like `Bài 2.1 · ...`.
8. Confirm `Khối kiến thức` stays warm dark burgundy/wine tone.
9. Confirm `Kho Lý thuyết/Kho dữ liệu` and `Tải lại JSON` stay hidden in learner view.
10. Confirm `Trình chiếu` remains aligned right and visible.
11. Confirm popup cascade still works.
12. Confirm E129 Reader still opens full content.
13. Confirm E132 slideshow still opens.
14. Browser console: 0 errors.

Previous integrated state:
- E169 Math hierarchy selector and learning route: PASS in main.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
