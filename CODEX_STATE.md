# CODEX_STATE

Current task: E170 hierarchy selector visual polish.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Visual-only polish for E169 hierarchy selector in Math Theory learner view.
- No routing/state logic changed.
- No E132 slideshow change.
- E129 Reader full content remains unchanged.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

E170 result:
- Increased contrast on the main `Khối kiến thức` button.
- Enlarged main button title/subtitle and strengthened text shadow/readability.
- Enlarged and darkened the icon block.
- Made the breadcrumb row tighter, larger, and more block-like.
- Added raised 3D pill styling to breadcrumb buttons.
- Added visual arrow connectors via CSS between breadcrumb buttons.
- Highlighted the final selected activity pill.
- Added responsive tuning for mobile.

Verification:
- GitHub update succeeded for E129 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms visual result.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module → Học tập → Lý thuyết.
4. Confirm `Khối kiến thức` main button has higher text contrast.
5. Confirm breadcrumb buttons are larger, closer, raised, and readable.
6. Confirm no horizontal overflow.
7. Confirm popup cascade still works.
8. Confirm E129 Reader still opens full content.
9. Confirm E132 slideshow still opens.
10. Browser console: 0 errors.

Previous integrated state:
- E169 Math hierarchy selector and learning route: PASS in main.
- E168 per-slide formula slideshow: patched and preserved.

Next actor:
- User local smoke test.
