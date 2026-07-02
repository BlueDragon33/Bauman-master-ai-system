# CODEX_STATE

## E135 Follow-up Runtime Fix

TASK_ID: `E135_MATH_THEORY_LOGIC_FIX_KEEP_LESSON_STRUCTURE`

DATE: `2026-07-02`

BRANCH: `codex/main-system-audit`

ROLE_USED: `Debugging & Runtime Stability Engineer`

SCOPE:
- Math Theory tab navigation only.
- Preserved the protected `Cấu trúc bài học` component.
- No other subjects touched.
- No `core.js` rewrite.

USER_GOAL:
- Fix the remaining logic error in the Theory tab while keeping `Cấu trúc bài học` stable and functional.

FILES_READ:
- `docs/CODEX_STATE.md`
- `subjects/math/assets/core.js`
- `subjects/math/assets/math.css`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`

FILES_CHANGED:
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `docs/CODEX_STATE.md`

ROOT_CAUSE:
- E134 restored the visible protected menu, but its option buttons only used the older `data-learn` contract.
- Older `button[data-learn]` handlers could catch those clicks before the later E122 learning-state sync received a matching `e122Focus`.
- When `e122Focus` was still `theory`, the next learning render could normalize the route back to Theory instead of preserving the selected tab.

PROTECTED_COMPONENT_STATUS:
- Present: yes, E134 still renders `<details class="learn-structure-menu e134-learn-menu">`.
- Changed: only added compatibility attributes to the existing option buttons.
- Restored: not replaced; the same visible labels/options remain.
- Verified: static diff confirms `data-learn` remains and each option now also has `data-e122-learn` plus `data-e122-focus`.

CHANGES_MADE:
- Added `data-e122-learn` and `data-e122-focus` to E134 `learn-structure-choice` buttons.
- Kept `data-learn`, labels, placement, dropdown markup, and trigger behavior unchanged.
- This lets the stable E122 capture handler set both `learnTab` and `e122Focus` before older `data-learn` handlers can desync the route.

TESTS_RUN:
- `git status --short`
- `git diff --stat`
- `rg` targeted search for learning structure hooks.
- `node --check subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `git diff --check`
- Static DOM-contract check by diff/grep for `data-learn`, `data-e122-learn`, and `data-e122-focus`.
- Browser automation note: the in-app browser blocked localhost with `ERR_BLOCKED_BY_CLIENT`; file URL fallback was blocked by Browser security policy, so no browser workaround was attempted.

PASS_CRITERIA_RESULT:
- PASS for targeted code/syntax/static contract checks.
- Manual Live Server check still recommended because browser automation was blocked in this Codex environment.

OUT_OF_SCOPE_NOT_TOUCHED:
- `subjects/ai`
- `subjects/foundation`
- Math JSON data/schema
- `subjects/math/assets/core.js`
- Other Math tab redesigns

REMAINING_RISKS:
- Automated browser verification could not be completed inside Codex due browser blocking local URLs.
- User should verify in Live Server: open Math, Lý thuyết, click `Cấu trúc bài học`, select Bài tập/Ứng dụng/Ôn tập/Kiểm tra, then return to Lý thuyết.

NEXT_RECOMMENDED_TASK:
- If Live Server still shows a tab-specific issue, capture the exact option clicked and console error so the next patch can target that path only.

GIT_SUMMARY:
- `git status --short`: pending local changes in this handoff and E134 JS until commit.
- `git diff --stat`: `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js` and `docs/CODEX_STATE.md`.

## E135 Runtime Stability Handoff

TASK_ID: `E135_MATH_THEORY_LOGIC_FIX_KEEP_LESSON_STRUCTURE`

DATE: `2026-07-01`

BRANCH: `codex/main-system-audit`

ROLE_USED: `Debugging & Runtime Stability Engineer`

SCOPE:
- Only `subjects/math`.
- Focused on Math Theory tab and the protected `Cấu trúc bài học` learning navigation.
- No `core.js` rewrite.

USER_GOAL:
- Fix the logic regression introduced by the latest Theory rebuild while preserving the stable `Cấu trúc bài học` component.

FILES_READ:
- `docs/CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/core.js`
- `subjects/math/assets/core.css`
- `subjects/math/assets/math.css`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.css`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`

FILES_CHANGED:
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`
- `docs/CODEX_STATE.md`

ROOT_CAUSE:
- E134 replaced the stable shared `learn-structure-menu` / `data-learn` contract with a custom `.e134-structure` menu using `data-e134-learn`.
- That bypassed the existing stable `core.js` learning tab handler and made the protected learning-structure control depend on the new Theory rebuild.

PROTECTED_COMPONENT_STATUS:
- Present: yes, E134 now renders `<details class="learn-structure-menu e134-learn-menu">`.
- Changed: restored to the stable class/hook contract; the removed custom E134 menu is no longer used.
- Restored: yes, options use `.learn-structure-choice` and `data-learn`.
- Verified: browser test opened the menu, confirmed all five options, selected each option, and returned to Theory without console warnings/errors.

CHANGES_MADE:
- Restored protected `Cấu trúc bài học` markup in E134 to the stable shared component.
- Removed E134-specific `data-e134-learn`, `data-e134-toggle-structure`, `.e134-structure`, and `e134MenuOpen` logic.
- Added a tiny scoped bridge only for `.e134-shell .learn-structure-trigger` so the stable `<details>` menu opens reliably inside the E134 topbar.
- Kept option navigation on the existing `data-learn` core handler.
- Re-scoped E134 CSS to avoid hiding/replacing the protected component.

TESTS_RUN:
- `git status --short`
- `git diff --stat`
- `git diff --check`
- `node --check subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- Targeted search confirmed no `data-e134-learn`, `data-e134-toggle-structure`, `.e134-structure`, or `e134MenuOpen` remains.
- Browser local-server check:
  - Opened Math page.
  - Opened Theory tab.
  - Confirmed E134 renders.
  - Confirmed protected `.learn-structure-menu` is visible.
  - Clicked `Cấu trúc bài học`.
  - Confirmed dropdown opens and is hit-testable.
  - Selected `Lý thuyết`, `Bài tập`, `Ứng dụng`, `Ôn tập`, `Kiểm tra`.
  - Returned to Theory after each option.
  - Selected a lesson from search and verified 16 sections render.
  - Console warning/error log was empty.

PASS_CRITERIA_RESULT:
- PASS: Theory tab opens, protected structure menu is visible/clickable, dropdown opens, options navigate through existing `data-learn`, E134 Theory remains usable, lesson selection still works, other Math tabs open, and no console errors were observed.

OUT_OF_SCOPE_NOT_TOUCHED:
- `subjects/ai`
- `subjects/foundation`
- Math data JSON
- `subjects/math/assets/core.js`
- Other Math tab redesigns
- E126 legacy files

REMAINING_RISKS:
- The non-Theory tabs still use legacy UI and were smoke-tested for navigation only.
- Commit/push still depends on Git operations being allowed by the Codex usage environment.

NEXT_RECOMMENDED_TASK:
- Commit/push the local E134/E135 work when Git escalation is available, then open/preview the PR from `codex/main-system-audit`.

GIT_SUMMARY:
- `git status --short`:
  - `M subjects/math/index.html`
  - `?? docs/CODEX_STATE.md`
  - `?? subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`
  - `?? subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `git diff --stat`:
  - `subjects/math/index.html | 6 +++---`
  - New E134/doc files remain untracked until staging, so they appear in `git status --short` rather than unstaged diff stat.

TASK_ID: `E134_MATH_THEORY_PRO_REBUILD`

DATE: `2026-06-30`

BRANCH: `codex/main-system-audit`

ROLE_USED: `Senior Product UI/UX Frontend Architect and Learning Experience Designer`

SCOPE:
- Only Math subject Theory tab UI layer.
- No other subjects touched.
- `core.js` not edited.

USER_GOAL:
- Rebuild Math Theory tab into a clean, professional e-learning reading experience.
- Keep existing data/runtime and preserve other learning tabs.

FILES_READ:
- `subjects/math/index.html`
- `subjects/math/assets/core.js`
- `subjects/math/assets/math.css`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.css`
- `subjects/math/data/lessons.json`
- `subjects/math/data/theory_lecture_frame.json`
- `subjects/math/data/theory_lecture_content.json`
- `docs/CODEX_STATE.md` was absent before this task.
- `AGENTS.md` was not found in this repo.

FILES_CHANGED:
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`
- `docs/CODEX_STATE.md`

ROOT_CAUSE:
- The old Theory UI was accumulated through multiple legacy patches, especially E122/E126, producing repeated rails, noisy metadata, weak visual hierarchy, and fragile menu behavior.
- The previous E126 layer also rendered before/around core state changes, making reload and tab transitions feel patched rather than designed.

DESIGN_DECISION:
- Created a new scoped E134 Theory UI layer instead of continuing to patch E126.
- `theory-main-adapter-E126.js/css` are kept as unused legacy files and are no longer loaded by `subjects/math/index.html`.
- The new layer uses existing `lessons`, `theory_lecture_frame`, and `theory_lecture_content` data in memory only.

CHANGES_MADE:
- Added a clean 3-column Theory layout: lesson navigation, reading area, metadata/tools panel.
- Added high-contrast reading cards, search/filter, lesson selection, right outline, and lecture mode.
- Added a JS-controlled `Cấu trúc bài học` menu for stable tab navigation from Theory.
- Added loading guard so reload during data fetch shows a polished loading state instead of a false missing-data error.
- Updated Math loader from E126 assets to E134 assets.

TESTS_RUN:
- `node --check subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- JSON parse check:
  - `subjects/math/data/lessons.json`
  - `subjects/math/data/theory_lecture_frame.json`
  - `subjects/math/data/theory_lecture_content.json`
- `git diff --check`
- Browser verification through local server:
  - Math page loads.
  - Theory tab renders E134.
  - E126 DOM is not active.
  - Search works.
  - Selecting a lesson updates the main content.
  - Lecture mode opens.
  - Previous/Next slide controls work.
  - Exit returns to reading layout.
  - Bài tập, Ứng dụng, Ôn tập, Kiểm tra open without recovery errors.
  - Console warning/error log is empty.

PASS_CRITERIA_RESULT:
- PASS for Theory rebuild, search, lesson navigation, lecture mode, reload loading state, and no E126 active DOM.
- PASS for keeping other Math tabs open.

OUT_OF_SCOPE_NOT_TOUCHED:
- No `subjects/ai` changes.
- No `subjects/foundation` changes.
- No JSON schema/data edits.
- No `core.js` edits.
- No E126 file deletion.

REMAINING_RISKS:
- Non-Theory tabs still use legacy core/E122 layouts; they were smoke-tested for opening only, not redesigned in this task.
- Full responsive visual QA beyond the tested browser viewport remains a follow-up.

NEXT_RECOMMENDED_TASK:
- Rebuild non-Theory learning tabs to match the E134 `Cấu trúc bài học` standard after the Theory tab is accepted.

GIT_SUMMARY:
- `git status --short` before commit:
  - `M subjects/math/index.html`
  - `?? docs/CODEX_STATE.md`
  - `?? subjects/math/assets/theory_skin/theory-pro-rebuild-E134.css`
  - `?? subjects/math/assets/theory_skin/theory-pro-rebuild-E134.js`
- `git diff --stat` before commit:
  - `subjects/math/index.html | 6 +++---`
  - New E134/doc files are untracked until staging, so they are listed by status rather than unstaged diff stat.
